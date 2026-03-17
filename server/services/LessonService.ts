import { LessonRepository } from "../../repositories/LessonRepository";
import fs from "fs";
import path from "path";

export class LessonService {
  constructor(private lessonRepo: LessonRepository) {}

  async getAllLessons() {
    return this.lessonRepo.findAll();
  }

  async getLesson(id: string) {
    return this.lessonRepo.findById(id);
  }

  async loadCurriculumFromFile() {
    const filePath = path.resolve("data/lessons.json");
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, "utf-8");
      const curriculum = JSON.parse(data);
      await this.seedCurriculum(curriculum);
    }
  }

  async seedCurriculum(curriculum: any[]) {
    for (let i = 0; i < curriculum.length; i++) {
      const lesson = curriculum[i];
      await this.lessonRepo.upsert({
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        type: lesson.type as any,
        xpReward: lesson.xpReward,
        requiredMasteryScore: lesson.requiredMasteryScore,
        prerequisites: lesson.prerequisites,
        isProOnly: lesson.isProOnly ? 1 : 0,
        order: i,
      });
    }
  }
}
