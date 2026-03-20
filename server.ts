import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";
import fastifyStatic from "@fastify/static";
import multipart from "@fastify/multipart";
import middie from "@fastify/middie";
import { clerkPlugin, getAuth } from "@clerk/fastify";
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from "fastify-type-provider-zod";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { z } from "zod";

// Repositories
import { UserRepository } from "./repositories/UserRepository";
import { LessonRepository } from "./repositories/LessonRepository";
import { ProgressRepository } from "./repositories/ProgressRepository";
import { EventRepository } from "./repositories/EventRepository";

// Services
import { UserService } from "./server/services/UserService";
import { LessonService } from "./server/services/LessonService";
import { SyncService } from "./server/services/SyncService";
import { TutorService } from "./server/services/TutorService";
import { SentimentService } from "./server/services/SentimentService";
import { StripeService } from "./server/services/StripeService";
import { PlacementService } from "./server/services/PlacementService";
import { PersonalizationService } from "./server/services/PersonalizationService";

const fastify = Fastify({
  logger: {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  }
}).withTypeProvider<ZodTypeProvider>();

fastify.setValidatorCompiler(validatorCompiler);
fastify.setSerializerCompiler(serializerCompiler);

// Composition Root
const userRepo = new UserRepository();
const lessonRepo = new LessonRepository();
const progressRepo = new ProgressRepository();
const eventRepo = new EventRepository();

const userService = new UserService(userRepo, eventRepo);
const lessonService = new LessonService(lessonRepo);
const syncService = new SyncService(progressRepo, userRepo, eventRepo);
const tutorService = new TutorService(process.env.GEMINI_API_KEY || "");
const sentimentService = new SentimentService();
const stripeService = new StripeService();
const placementService = new PlacementService(userRepo);
const personalizationService = new PersonalizationService(lessonRepo);

async function start() {
  await fastify.register(middie);
  await fastify.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://clerk.com", "https://*.clerk.accounts.dev"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https://images.clerk.dev", "https://*.clerk.accounts.dev", "https://picsum.photos"],
        connectSrc: ["'self'", "https://api.clerk.com", "https://*.clerk.accounts.dev", "https://api-inference.huggingface.co", "https://generativelanguage.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: { policy: "require-corp" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
  });
  await fastify.register(rateLimit, {
    max: 100,
    timeWindow: '1 minute'
  });
  await fastify.register(cors, {
    origin: process.env.NODE_ENV === 'production' ? false : true, // Adjust based on deployment
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  });
  await fastify.register(multipart, { limits: { fileSize: 50 * 1024 * 1024 } });
  await fastify.register(clerkPlugin);

  // Raw body parser for Stripe webhooks
  fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, (req, body, done) => {
    if (req.raw.url === '/api/webhooks/stripe') {
      done(null, body);
    } else {
      try {
        const json = JSON.parse(body.toString());
        done(null, json);
      } catch (err: any) {
        err.statusCode = 400;
        done(err, undefined);
      }
    }
  });

  // Health Check
  fastify.get("/api/health", async () => {
    return { status: "ok", timestamp: new Date().toISOString() };
  });

  // Lessons API
  fastify.get("/api/lessons", async (request, reply) => {
    const lessons = await lessonService.getAllLessons();
    return lessons;
  });

  // User Sync Handshake
  fastify.get("/api/user/:id", {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (request, reply) => {
    const { id } = request.params;
    const auth = getAuth(request);
    
    if (!auth.userId || auth.userId !== id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const user = await userService.syncWithClerk(id);
    if (!user) return reply.status(404).send({ error: "User not found" });

    const progress = await progressRepo.findByUserId(id);
    const mastery = await progressRepo.findMasteryByUserId(id);

    return {
      ...user,
      completedLessons: progress.filter(p => p.status === 'completed').map(p => p.lessonId),
      masteryMap: mastery.reduce((acc, m) => ({
        ...acc,
        [m.nounClass]: { score: parseFloat(m.masteryScore), updatedAt: m.lastAttemptAt.getTime() }
      }), {})
    };
  });

  // Onboarding
  fastify.post("/api/user/onboard", {
    schema: {
      body: z.object({
        role: z.enum(['student', 'teacher', 'admin', 'individual'])
      })
    }
  }, async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: "Unauthorized" });

    const user = await userService.onboard(auth.userId, request.body.role);
    return user;
  });

  // Batch Sync
  fastify.post("/api/sync", {
    schema: {
      body: z.object({
        userId: z.string(),
        items: z.array(z.object({
          id: z.string(),
          type: z.string(),
          payload: z.any(),
          timestamp: z.number(),
        }))
      })
    }
  }, async (request, reply) => {
    const { userId, items } = request.body;
    const auth = getAuth(request);

    if (!auth.userId || auth.userId !== userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const user = await syncService.processSync(userId, items);
    return { status: "SYNCED", user };
  });

  // AI Tutor Orchestration
  fastify.post("/api/ai/tutor", {
    schema: {
      body: z.object({
        userId: z.string(),
        context: z.any()
      })
    }
  }, async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId || auth.userId !== request.body.userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const user = await userService.getUserData(auth.userId);
    if (!user) return reply.status(404).send({ error: "User not found" });

    const limit = user.subscriptionTier === 'pro' ? 100 : 3;
    if (user.aiUsageCount >= limit) {
      return reply.status(429).send({ 
        error: "Rate limit exceeded",
        persona_msg: "You're moving too fast, Mukwai! Let's let the brain rest for a minute."
      });
    }

    const response = await tutorService.generateResponse(
      {
        ...request.body.context,
        learnerTier: user.learnerTier,
        sentiment: user.lastSentiment,
        learnerName: user.name
      },
      user.subscriptionTier === 'pro',
      user.aiUsageCount,
      process.env.HUGGINGFACE_TOKEN
    );

    await userRepo.incrementAiUsage(auth.userId);

    return response;
  });

  // AI Tutor Streaming (Accelerator Grade UX)
  fastify.post("/api/ai/tutor/stream", {
    schema: {
      body: z.object({
        userId: z.string(),
        context: z.any()
      })
    }
  }, async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId || auth.userId !== request.body.userId) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const user = await userService.getUserData(auth.userId);
    if (!user) return reply.status(404).send({ error: "User not found" });

    const limit = user.subscriptionTier === 'pro' ? 100 : 3;
    if (user.aiUsageCount >= limit) {
      return reply.status(429).send({ 
        error: "Rate limit exceeded",
        persona_msg: "You're moving too fast, Mukwai! Let's let the brain rest for a minute."
      });
    }

    // Set headers for streaming
    reply.raw.setHeader('Content-Type', 'text/event-stream');
    reply.raw.setHeader('Cache-Control', 'no-cache');
    reply.raw.setHeader('Connection', 'keep-alive');

    const stream = tutorService.generateResponseStream(
      {
        ...request.body.context,
        learnerTier: user.learnerTier,
        sentiment: user.lastSentiment,
        learnerName: user.name
      },
      user.subscriptionTier === 'pro',
      user.aiUsageCount
    );

    for await (const chunk of stream) {
      reply.raw.write(`data: ${JSON.stringify(chunk)}\n\n`);
    }

    await userRepo.incrementAiUsage(auth.userId);
    reply.raw.end();
  });

  // Sentiment Analysis
  fastify.post("/api/user/:id/sentiment", {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({ 
        behaviorData: z.any(),
        textInput: z.string().optional()
      })
    }
  }, async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId || auth.userId !== request.params.id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const sentiment = await sentimentService.analyze(
      request.body.behaviorData, 
      request.body.textInput,
      process.env.HUGGINGFACE_TOKEN
    );
    await userService.updateSentiment(auth.userId, sentiment.state);
    return { success: true, ...sentiment };
  });

  // Placement Mission
  fastify.post("/api/user/:id/placement", {
    schema: {
      params: z.object({ id: z.string() }),
      body: z.object({
        score: z.number(),
        total: z.number()
      })
    }
  }, async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId || auth.userId !== request.params.id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const tier = await placementService.runPlacement(auth.userId, request.body);
    return { success: true, tier };
  });

  // Personalized Next Lesson
  fastify.post("/api/user/:id/next-lesson", {
    schema: {
      params: z.object({ id: z.string() })
    }
  }, async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId || auth.userId !== request.params.id) {
      return reply.status(401).send({ error: "Unauthorized" });
    }

    const user = await userService.getUserData(auth.userId);
    if (!user) return reply.status(404).send({ error: "User not found" });

    const progress = await progressRepo.findByUserId(auth.userId);
    const mastery = await progressRepo.findMasteryByUserId(auth.userId);

    const completedLessons = progress.filter(p => p.status === 'completed').map(p => p.lessonId);
    const masteryMap = mastery.reduce((acc, m) => ({
      ...acc,
      [m.nounClass]: { score: parseFloat(m.masteryScore), updatedAt: m.lastAttemptAt.getTime() }
    }), {});

    const recommendation = await personalizationService.getNextLesson(
      auth.userId,
      masteryMap,
      completedLessons,
      user.lastSentiment,
      user.learnerTier
    );

    return recommendation;
  });

  // STT (Speech-to-Text) using Meta MMS via Hugging Face
  fastify.post("/api/stt", async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: "Unauthorized" });

    const data = await request.file();
    if (!data) return reply.status(400).send({ error: "No audio file" });

    const hfToken = process.env.HUGGINGFACE_TOKEN;
    const buffer = await data.toBuffer();

    if (hfToken) {
      try {
        const HF_STT_URL = "https://api-inference.huggingface.co/models/facebook/mms-1b-all";
        
        const hfResponse = await fetch(HF_STT_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "audio/wav", 
          },
          body: new Uint8Array(buffer),
        });

        if (hfResponse.ok) {
          const result = await hfResponse.json();
          return {
            text: result.text || "Transcription failed",
            score: 90,
            engine: "Meta-MMS-1B"
          };
        }
      } catch (e) {
        console.error("[STT] HF API failed, falling back to Gemini", e);
      }
    }

    // Fallback: Gemini STT (Real AI, not mock)
    try {
      const base64Audio = buffer.toString('base64');
      const response = await tutorService.transcribeAudio(base64Audio, data.mimetype);
      return {
        text: response.text,
        score: 95,
        engine: "Gemini-3-Flash"
      };
    } catch (e) {
      console.error("[STT] Gemini fallback failed", e);
      return reply.status(500).send({ error: "STT processing failed" });
    }
  });

  // Stripe Checkout
  fastify.post("/api/checkout/create-session", async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: "Unauthorized" });

    const user = await userService.getUserData(auth.userId);
    if (!user) return reply.status(404).send({ error: "User not found" });

    const protocol = request.protocol;
    const host = request.hostname;
    const successUrl = `${protocol}://${host}/practice?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${protocol}://${host}/practice`;

    try {
      const session = await stripeService.createCheckoutSession(
        user.id,
        user.email,
        successUrl,
        cancelUrl
      );
      return { url: session.url };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.status(500).send({ error: e.message });
    }
  });

  // Stripe Billing Portal
  fastify.post("/api/checkout/portal", async (request, reply) => {
    const auth = getAuth(request);
    if (!auth.userId) return reply.status(401).send({ error: "Unauthorized" });

    const user = await userService.getUserData(auth.userId);
    if (!user || !user.stripeCustomerId) {
      return reply.status(400).send({ error: "No active subscription found" });
    }

    const protocol = request.protocol;
    const host = request.hostname;
    const returnUrl = `${protocol}://${host}/practice`;

    try {
      const session = await stripeService.createPortalSession(user.stripeCustomerId, returnUrl);
      return { url: session.url };
    } catch (e: any) {
      fastify.log.error(e);
      return reply.status(500).send({ error: e.message });
    }
  });

  // Stripe Webhook
  fastify.post("/api/webhooks/stripe", async (request, reply) => {
    const sig = request.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return reply.status(400).send({ error: "Missing signature or secret" });
    }

    let event;
    try {
      event = stripeService.constructEvent(request.body as Buffer, sig, webhookSecret);
    } catch (err: any) {
      fastify.log.error(`Webhook Error: ${err.message}`);
      return reply.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        const userId = session.client_reference_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId) {
          await userService.upgradeToPro(userId, customerId, subscriptionId);
          fastify.log.info(`User ${userId} upgraded to PRO via Stripe`);
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription.customer;
        const user = await userRepo.findByStripeCustomerId(customerId);
        if (user) {
          await userRepo.update(user.id, {
            subscriptionTier: 'free',
            stripeSubscriptionId: null,
          });
          fastify.log.info(`User ${user.id} subscription canceled`);
        }
        break;
      }
      default:
        fastify.log.info(`Unhandled event type ${event.type}`);
    }

    return { received: true };
  });

  // Vite Integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    
    // Vite middleware for development
    fastify.use((req, res, next) => {
      if (req.url?.startsWith('/api')) {
        return next();
      }
      vite.middlewares(req, res, next);
    });

    fastify.get("*", async (request, reply) => {
      const url = request.raw.url || "/";
      
      // Do not serve index.html for missing source files or API routes
      if (url.startsWith("/api/") || (url.includes('.') && !url.endsWith('.html'))) {
        return reply.status(404).send({ error: "Not found" });
      }

      try {
        const template = fs.readFileSync(path.resolve("index.html"), "utf-8");
        const html = await vite.transformIndexHtml(url, template);
        const key = process.env.VITE_CLERK_PUBLISHABLE_KEY || process.env.CLERK_PUBLISHABLE_KEY || "";
        const cleanKey = key.includes('=') ? key.split('=').pop() : key;
        
        const injectedHtml = html.replace(
          '</head>',
          `<script>window.VITE_CLERK_PUBLISHABLE_KEY = "${cleanKey}";</script></head>`
        );
        reply.status(200).header("Content-Type", "text/html").send(injectedHtml);
      } catch (e: any) {
        console.error("[Vite Transform Error]", e);
        vite.ssrFixStacktrace(e as Error);
        reply.status(500).send({
          error: "Vite transformation failed",
          message: e.message,
          stack: e.stack,
          url: e.url
        });
      }
    });
  } else {
    await fastify.register(fastifyStatic, {
      root: path.resolve("dist"),
      prefix: "/",
    });
    fastify.setNotFoundHandler((request, reply) => {
      reply.sendFile("index.html");
    });
  }

  // Seed Curriculum (Non-blocking)
  lessonService.loadCurriculumFromFile().catch(err => {
    fastify.log.error({ err }, "Failed to seed curriculum from file");
  });

  const port = Number(process.env.PORT) || 3000;

  fastify.listen({ port, host: "0.0.0.0" }, (err) => {
    if (err) {
      fastify.log.error(err);
      process.exit(1);
    }
  });
}

start();
