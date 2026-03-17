
export type LearnerState = 'FLOW' | 'FRICTION' | 'BOREDOM' | 'FRUSTRATED';

export interface SentimentResult {
  state: LearnerState;
  score: number;
}

export interface LearnerMetrics {
  durationMs: number;
  attempts: number;
  wrongStreak: number;
  timePerQuestionMs: number[];
  rapidGuessingCount: number;
}

/**
 * SentimentEngine: Deterministically maps user interactions to cognitive states.
 * Inspired by adaptive learning heuristics used in systems like Duolingo.
 */
export const SentimentEngine = {
  calculateSentiment: (metrics: LearnerMetrics): SentimentResult => {
    const { durationMs, attempts, wrongStreak, timePerQuestionMs, rapidGuessingCount } = metrics;

    // 1. FRUSTRATED: High error streak or repeated failure on the same task
    if (wrongStreak >= 3 || attempts > 5) {
      return { state: 'FRUSTRATED', score: 0.2 };
    }

    // 2. FRICTION: Slower than average response times + some errors
    const avgTime = timePerQuestionMs.length > 0 
      ? timePerQuestionMs.reduce((a, b) => a + b, 0) / timePerQuestionMs.length 
      : 0;
    
    if (avgTime > 15000 && wrongStreak > 0) {
      return { state: 'FRICTION', score: 0.4 };
    }

    // 3. BOREDOM: Rapid guessing (answering too fast) or perfect streak with very low time
    if (rapidGuessingCount >= 2 || (durationMs < 3000 && wrongStreak === 0 && attempts > 2)) {
      return { state: 'BOREDOM', score: 0.6 };
    }

    // 4. FLOW: Steady progress, reasonable timing, low errors
    return { state: 'FLOW', score: 1.0 };
  }
};
