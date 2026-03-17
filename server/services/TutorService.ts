import { GoogleGenAI } from "@google/genai";

export class TutorService {
  private gemini: GoogleGenAI;

  constructor(geminiApiKey: string) {
    this.gemini = new GoogleGenAI({ apiKey: geminiApiKey });
  }

  async *generateResponseStream(context: any, isPro: boolean, usageCount: number) {
    const { sentiment, learnerName, language, lessonObjective, attempts, wrongStreak, lastInput, learnerTier, masteryGaps } = context;

    // 1. Sanitize context
    const sanitizedContext = {
      sentiment,
      learnerName,
      language,
      lessonObjective,
      attempts,
      wrongStreak,
      lastInput,
      learnerTier,
      masteryGaps
    };

    // 2. Use Gemini Streaming (The Reliable Assistant)
    try {
      const model = "gemini-3-flash-preview";
      const stream = await this.gemini.models.generateContentStream({
        model,
        contents: `You are Bulela, a wise Zambian elder and language tutor. 
        Learner Context: ${JSON.stringify(sanitizedContext)}
        
        Provide a short, culturally relevant response to help the learner.`,
        config: {
          systemInstruction: `You are Bulela, a wise Zambian elder and language tutor. 
          The learner is in the ${learnerTier || 'MWAYI'} tier.
          They are currently experiencing ${sentiment} with ${lessonObjective}.
          Use proverbs and local context. Adjust tone based on the learner's sentiment (FLOW, FRICTION, BOREDOM, FRUSTRATED).`,
        }
      });

      for await (const chunk of stream) {
        if (chunk.text) {
          yield {
            text: chunk.text,
            engine: "Gemini-3-Flash"
          };
        }
      }
    } catch (e) {
      console.error("[Tutor] Gemini streaming failed, using Mock", e);
      
      // 3. Final Fallback: Mock Responses (Demo Safety Mode)
      const mockResponses = [
        "Mwayi, don't worry. Even the tallest tree started as a small seed. Try one more time!",
        "Chala chimodzi sichiswa nsabwe. We need to work together. Look at the prefix again.",
        "Dolo! You are moving like a cheetah in the Kafue. Let's try something harder.",
        "Zikomo for your effort. Remember, respect is the key to Nyanja."
      ];
      const text = mockResponses[Math.floor(Math.random() * mockResponses.length)];
      yield {
        text,
        engine: "Mock-Bulela"
      };
    }
  }

  async generateResponse(context: any, isPro: boolean, usageCount: number, hfToken?: string) {
    // Sanitize context: Only keep necessary fields, remove potential PII
    const sanitizedContext = {
      sentiment: context.sentiment,
      learnerName: context.learnerName,
      language: context.language,
      lessonObjective: context.lessonObjective,
      attempts: context.attempts,
      wrongStreak: context.wrongStreak,
      lastInput: context.lastInput,
      learnerTier: context.learnerTier,
      masteryGaps: context.masteryGaps
    };

    const { sentiment, learnerName, language, lessonObjective, attempts, wrongStreak, lastInput, learnerTier, masteryGaps } = sanitizedContext;

    // 1. Primary: Gemma 3 4B (The Tutor Brain)
    if (hfToken) {
      const HF_API_URL = "https://api-inference.huggingface.co/models/google/gemma-3-4b-it";
      
      const prompt = `
        <start_of_turn>user
        You are Bulela, a wise and encouraging Zambian language tutor. 
        Your goal is to help ${learnerName} master ${language}.
        
        Current Context:
        - Learner Tier: ${learnerTier || 'MWAYI'}
        - Objective: ${lessonObjective}
        - Learner State: ${sentiment}
        - Performance: ${attempts} attempts, ${wrongStreak} wrong streak.
        - Mastery Gaps: ${masteryGaps || 'None'}
        - Last Input: ${lastInput || "Started the lesson"}

        Instructions:
        - The learner is in the ${learnerTier || 'MWAYI'} tier.
        - They are currently experiencing ${sentiment} with ${lessonObjective}.
        - If state is 'FLOW', be brief and celebratory. Keep the momentum.
        - If state is 'FRICTION' or 'FRUSTRATED', be extra patient. Use a Zambian proverb to encourage them. Explain the concept clearly and ask them to try another example.
        - If state is 'BOREDOM', challenge them with a cultural riddle or a slightly harder example.
        - Never give the answer directly. Guide them with hints.
        - Cultural Context: Explain the cultural significance of the language concept (e.g., respect for elders in greetings).
        - Follow-up: End with a short reinforcement question or a prompt to try a similar phrase.
        - Use local Zambian context (Kitwe, Lusaka, Nshima, etc.) to make it relatable.

        Respond as Bulela.<end_of_turn>
        <start_of_turn>model
      `;

      try {
        const hfResponse = await fetch(HF_API_URL, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${hfToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            inputs: prompt,
            parameters: { max_new_tokens: 300, temperature: 0.7, return_full_text: false }
          }),
        });

        if (hfResponse.ok) {
          const result = await hfResponse.json();
          const text = Array.isArray(result) ? result[0]?.generated_text : result.generated_text;
          
          if (text) {
            return {
              text: text.trim(),
              engine: "Gemma-3-4B"
            };
          }
        }
      } catch (e) {
        console.error("[Tutor] Gemma API failed, falling back to Gemini", e);
      }
    }

    // 2. Fallback: Gemini (The Reliable Assistant)
    try {
      const model = "gemini-3-flash-preview";
      const response = await this.gemini.models.generateContent({
        model,
        contents: `You are Bulela, a wise Zambian elder and language tutor. 
        Learner Context: ${JSON.stringify(context)}
        
        Provide a short, culturally relevant response to help the learner.`,
        config: {
          systemInstruction: `You are Bulela, a wise Zambian elder and language tutor. 
          The learner is in the ${learnerTier || 'MWAYI'} tier.
          They are currently experiencing ${sentiment} with ${lessonObjective}.
          Use proverbs and local context. Adjust tone based on the learner's sentiment (FLOW, FRICTION, BOREDOM, FRUSTRATED).`,
        }
      });

      return {
        text: response.text,
        engine: "Gemini-3-Flash"
      };
    } catch (e) {
      console.error("[Tutor] Gemini fallback failed, using Mock", e);
      
      // 3. Final Fallback: Mock Responses (Demo Safety Mode)
      const mockResponses = [
        "Mwayi, don't worry. Even the tallest tree started as a small seed. Try one more time!",
        "Chala chimodzi sichiswa nsabwe. We need to work together. Look at the prefix again.",
        "Dolo! You are moving like a cheetah in the Kafue. Let's try something harder.",
        "Zikomo for your effort. Remember, respect is the key to Nyanja."
      ];
      return {
        text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        engine: "Mock-Bulela"
      };
    }
  }

  async transcribeAudio(base64Data: string, mimeType: string) {
    const model = "gemini-3-flash-preview";
    const response = await this.gemini.models.generateContent({
      model,
      contents: [
        {
          inlineData: {
            data: base64Data,
            mimeType: mimeType
          }
        },
        {
          text: "Transcribe this audio accurately. If it's in a Zambian language (like Nyanja, Bemba, etc.), transcribe it in that language. Only return the transcription text."
        }
      ],
      config: {
        systemInstruction: "You are an expert transcriber for Zambian languages. Provide only the transcription, no extra text."
      }
    });

    return {
      text: response.text || "Transcription failed",
      engine: "Gemini-3-Flash"
    };
  }
}
