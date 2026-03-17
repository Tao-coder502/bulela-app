
/**
 * SkillService: Phase 8 Personalization Engine
 * Tracks mastery per noun class and calculates adaptive curriculum paths.
 */

export class SkillService {
  /**
   * Mastery Thresholds
   */
  static UNLOCK_THRESHOLD = 85;
  static REMEDIAL_THRESHOLD = 60;

  /**
   * Logarithmic XP Scaling Curve
   * Level 1: 0-100 XP
   * Level 2: 100-250 XP
   * Level 3: 250-500 XP
   * Formula: 100 * (level ^ 1.5)
   */
  static getLevelFromXP(xp: number): number {
    return Math.floor(Math.pow(xp / 100, 1 / 1.5)) + 1;
  }

  static getXPForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.floor(100 * Math.pow(level - 1, 1.5));
  }

  /**
   * Calculates new mastery score based on performance.
   * uses a simple moving average or weighted average.
   */
  static updateMastery(currentScore: number = 0, lessonAccuracy: number): number {
    // Weight new performance at 30%, existing mastery at 70% for stability
    const weight = 0.3;
    const newScore = (currentScore * (1 - weight)) + (lessonAccuracy * weight);
    return Math.min(100, Math.max(0, Math.round(newScore)));
  }

  /**
   * Adaptive Difficulty: Determines if a learner needs a remedial drill.
   */
  static shouldAssignRemedial(masteryScore: number): boolean {
    return masteryScore < this.REMEDIAL_THRESHOLD;
  }

  /**
   * Curriculum Graph Validation
   */
  static isLessonUnlocked(dependencyMastery: number): boolean {
    return dependencyMastery >= this.UNLOCK_THRESHOLD;
  }
}
