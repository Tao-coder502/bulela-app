import { db } from "../db/index";
import { lessons } from "../db/schema";
import { eq } from "drizzle-orm";

export class LessonRepository {
  async findAll() {
    return db.query.lessons.findMany({
      orderBy: (lessons, { asc }) => [asc(lessons.order)],
    });
  }

  async findById(id: string) {
    return db.query.lessons.findFirst({
      where: eq(lessons.id, id),
    });
  }

  async upsert(data: typeof lessons.$inferInsert) {
    return db.insert(lessons).values(data).onConflictDoUpdate({
      target: lessons.id,
      set: data,
    }).returning();
  }
}
