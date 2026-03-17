import { db } from "../db/index";
import { users } from "../db/schema";
import { eq, sql } from "drizzle-orm";

export class UserRepository {
  async findById(id: string) {
    return db.query.users.findFirst({
      where: eq(users.id, id),
    });
  }

  async findByStripeCustomerId(customerId: string) {
    return db.query.users.findFirst({
      where: eq(users.stripeCustomerId, customerId),
    });
  }

  async create(data: typeof users.$inferInsert) {
    return db.insert(users).values(data).returning();
  }

  async update(id: string, data: Partial<typeof users.$inferInsert>, tx: any = db) {
    return tx.update(users).set(data).where(eq(users.id, id)).returning();
  }

  async incrementAiUsage(id: string, tx: any = db) {
    return tx.update(users)
      .set({ aiUsageCount: sql`${users.aiUsageCount} + 1` })
      .where(eq(users.id, id))
      .returning();
  }

  async addXpAndPoints(id: string, xp: number, points: number, date: Date, tx: any = db) {
    return tx.update(users)
      .set({
        totalXp: sql`${users.totalXp} + ${xp}`,
        kPoints: sql`${users.kPoints} + ${points}`,
        lastActivityAt: date,
      })
      .where(eq(users.id, id))
      .returning();
  }
}
