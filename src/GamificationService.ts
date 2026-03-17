
import { UserState, LessonRewards } from './types';

const HEART_REGEN_MS = 4 * 60 * 60 * 1000; // 4 Hours
const MAX_HEARTS = 5;

export class GamificationService {
  /**
   * Deducts a heart from the user.
   */
  static deductHeart(user: UserState): UserState {
    if (user.hearts <= 0) {
      throw new Error('ShopRequired: No hearts remaining. Visit the shop or wait for regeneration.');
    }

    const newHearts = user.hearts - 1;
    return {
      ...user,
      hearts: newHearts,
      lastHeartLossAt: user.hearts === MAX_HEARTS ? new Date() : user.lastHeartLossAt
    };
  }

  /**
   * Checks and applies heart regeneration.
   */
  static checkHeartRegeneration(user: UserState): UserState {
    if (user.hearts >= MAX_HEARTS || !user.lastHeartLossAt) {
      return { ...user, lastHeartLossAt: null };
    }

    const now = Date.now();
    const lastLoss = new Date(user.lastHeartLossAt).getTime();
    const msElapsed = now - lastLoss;

    if (msElapsed >= HEART_REGEN_MS) {
      const heartsToRecover = Math.floor(msElapsed / HEART_REGEN_MS);
      const newHearts = Math.min(MAX_HEARTS, user.hearts + heartsToRecover);
      const newLastHeartLossAt = newHearts === MAX_HEARTS 
        ? null 
        : new Date(lastLoss + (heartsToRecover * HEART_REGEN_MS));

      return {
        ...user,
        hearts: newHearts,
        lastHeartLossAt: newLastHeartLossAt
      };
    }

    return user;
  }

  /**
   * Sprint 8: Enhanced Reward Engine
   * Accuracy-based XP and specific 50 CK bonus for Prefix Drills.
   */
  static calculateLessonRewards(accuracy: number, isPrefixDrill: boolean): LessonRewards {
    const BASE_XP = 10;
    const PERFECT_BONUS = accuracy === 100 ? 10 : 0;
    const KWACHA_REWARD = isPrefixDrill ? 50 : 10;

    return {
      xpGain: BASE_XP + PERFECT_BONUS,
      kwachaGain: KWACHA_REWARD,
      isPerfect: accuracy === 100
    };
  }

  /**
   * Applies rewards to user state.
   */
  static applyRewards(user: UserState, rewards: LessonRewards): UserState {
    return {
      ...user,
      xp: user.xp + rewards.xpGain,
      kwachaBalance: user.kwachaBalance + rewards.kwachaGain,
    };
  }
}
