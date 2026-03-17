import { db } from "../db/index";
import { events } from "../db/schema";
import { eq } from "drizzle-orm";

export class EventRepository {
  async findById(id: string) {
    return db.query.events.findFirst({
      where: eq(events.id, id),
    });
  }

  async create(data: typeof events.$inferInsert, tx: any = db) {
    return tx.insert(events).values(data).returning();
  }

  async findByUserId(userId: string) {
    return db.query.events.findMany({
      where: eq(events.userId, userId),
      orderBy: (events, { desc }) => [desc(events.timestamp)],
    });
  }
}
