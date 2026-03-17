import { LessonRepository } from "../../repositories/LessonRepository";

export type RecommendedAction = 'SHOW_HINT' | 'SIMPLIFY_TASK' | 'ADVANCE_LEVEL' | 'REVIEW_CONCEPT' | 'TRIGGER_DOLO_CHALLENGE';

export class PersonalizationService {
  constructor(private lessonRepo: LessonRepository) {}

  async getNextLesson(userId: string, masteryMap: Record<string, any>, completedLessons: string[], sentimentState: string, learnerTier: string) {
    const allLessons = await this.lessonRepo.findAll();
    
    // 1. Find the next lesson based on prerequisites and order
    const availableLessons = allLessons.filter(l => {
      if (completedLessons.includes(l.id)) return false;
      const prerequisites = l.prerequisites as string[];
      return prerequisites.every(p => completedLessons.includes(p));
    }).sort((a, b) => a.order - b.order);

    let nextLesson = availableLessons[0] || allLessons[allLessons.length - 1];
    let difficultyAdjustment = 0;
    let recommendedAction: RecommendedAction = 'ADVANCE_LEVEL';

    // 2. Adjust based on sentiment
    switch (sentimentState) {
      case 'FRUSTRATED':
        recommendedAction = 'SIMPLIFY_TASK';
        difficultyAdjustment = -1;
        break;
      case 'FRICTION':
        recommendedAction = 'SHOW_HINT';
        difficultyAdjustment = -0.5;
        break;
      case 'BOREDOM':
        recommendedAction = 'TRIGGER_DOLO_CHALLENGE';
        difficultyAdjustment = 1;
        break;
      case 'FLOW':
        recommendedAction = 'ADVANCE_LEVEL';
        difficultyAdjustment = 0;
        break;
    }

    // 3. Adjust based on mastery gaps
    const lowMasteryClasses = Object.entries(masteryMap).filter(([_, data]: [string, any]) => data.score < 50);
    if (lowMasteryClasses.length > 0 && sentimentState !== 'FLOW') {
      recommendedAction = 'REVIEW_CONCEPT';
    }

    // 4. Adjust based on learner tier
    if (learnerTier === 'DOLO') {
      difficultyAdjustment += 0.5;
    } else if (learnerTier === 'MWAYI') {
      difficultyAdjustment -= 0.5;
    }

    return {
      nextLessonId: nextLesson.id,
      difficultyAdjustment,
      recommendedAction
    };
  }
}
