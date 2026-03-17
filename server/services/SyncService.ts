import { ProgressRepository } from "../../repositories/ProgressRepository";
import { UserRepository } from "../../repositories/UserRepository";
import { EventRepository } from "../../repositories/EventRepository";
import { db } from "../../db/index";

export class SyncService {
  constructor(
    private progressRepo: ProgressRepository,
    private userRepo: UserRepository,
    private eventRepo: EventRepository
  ) {}

  async processSync(userId: string, items: any[]) {
    const startTime = Date.now();
    const sortedItems = [...items].sort((a, b) => a.timestamp - b.timestamp);
    
    // Wrap entire sync batch in a transaction for atomicity
    const result = await db.transaction(async (tx) => {
      for (const item of sortedItems) {
        const { type, payload, timestamp, id: clientEventId } = item;
        const date = new Date(timestamp);

        // 1. Idempotency Check: Has this event already been processed?
        const existingEvent = await this.eventRepo.findById(clientEventId);
        if (existingEvent) {
          console.log(`[Sync] Skipping already processed event: ${clientEventId}`);
          continue;
        }

        // 2. Log event (Atomic with side effects)
        await this.eventRepo.create({
          id: clientEventId || `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId,
          type,
          payload,
          timestamp: date,
          durationMs: payload.durationMs,
          attempts: payload.attempts,
          device: payload.device,
        }, tx);

        // 3. Apply Side Effects
        switch (type) {
          case 'LESSON_COMPLETE':
            // Validate payload
            const xpReward = Math.min(payload.xpReward || 0, 500); // Cap XP reward
            const stars = Math.min(payload.stars || 3, 3);

            await this.progressRepo.upsertLessonProgress({
              userId,
              lessonId: payload.lessonId,
              status: 'completed',
              starsEarned: stars,
              completedAt: date,
              clientEventId,
            }, tx);

            await this.userRepo.addXpAndPoints(userId, xpReward, xpReward, date, tx);
            break;

          case 'MASTERY_UPDATE':
            const accuracy = Math.min(Math.max(payload.accuracy || 0, 0), 100);
            await this.progressRepo.upsertMastery({
              userId,
              nounClass: payload.classId,
              masteryScore: accuracy.toString(),
              lastAttemptAt: date,
              clientEventId,
            }, tx);
            break;

          case 'KPOINTS_UPDATE':
            const amount = Math.min(payload.amount || 0, 1000); // Cap points
            await this.userRepo.addXpAndPoints(userId, amount / 5, amount, date, tx);
            break;

          case 'AI_USAGE':
            await this.userRepo.incrementAiUsage(userId, tx);
            break;

          case 'SENTIMENT_UPDATE':
            await this.userRepo.update(userId, { lastSentiment: payload.state }, tx);
            break;
        }
      }

      return this.userRepo.findById(userId);
    });

    const duration = Date.now() - startTime;
    console.log(`[Sync] Processed ${items.length} items for user ${userId} in ${duration}ms`);
    return result;
  }
}
