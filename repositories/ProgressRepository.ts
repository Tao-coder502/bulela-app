import { db } from "../db/index";
import { curriculumProgress, masteryMetrics } from "../db/schema";
import { eq, and, sql } from "drizzle-orm";

export class ProgressRepository {
  async findByUserId(userId: string) {
    return db.query.curriculumProgress.findMany({
      where: eq(curriculumProgress.userId, userId),
    });
  }

  async findMasteryByUserId(userId: string) {
    return db.query.masteryMetrics.findMany({
      where: eq(masteryMetrics.userId, userId),
    });
  }

  async upsertLessonProgress(data: typeof curriculumProgress.$inferInsert, tx: any = db) {
    return tx.insert(curriculumProgress).values(data).onConflictDoUpdate({
      target: [curriculumProgress.userId, curriculumProgress.lessonId],
      set: {
        starsEarned: sql`GREATEST(${curriculumProgress.starsEarned}, ${data.starsEarned || 0})`,
        completedAt: data.completedAt,
        clientEventId: data.clientEventId,
      }
    }).returning();
  }

  async upsertMastery(data: typeof masteryMetrics.$inferInsert, tx: any = db) {
    return tx.insert(masteryMetrics).values(data).onConflictDoUpdate({
      target: [masteryMetrics.userId, masteryMetrics.nounClass],
      set: {
        masteryScore: data.masteryScore,
        lastAttemptAt: data.lastAttemptAt,
        clientEventId: data.clientEventId,
      }
    }).returning();
  }
}
