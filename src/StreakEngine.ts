
import { UserState } from './types';

export class StreakEngine {
  /**
   * Validates and updates the user's streak based on their last activity.
   * FIX: Implements robust day normalization with a 4 AM grace period to 
   * distinguish between same-day, consecutive-day, and missed-day scenarios.
   */
  static validateStreak(user: UserState): UserState {
    const now = new Date();
    
    // 1. Initial streak for new users
    if (!user.lastActivityAt) {
      return {
        ...user,
        streak: 1,
        lastActivityAt: now
      };
    }

    const lastActivity = new Date(user.lastActivityAt);

    /**
     * Normalizes a date to the start of its "Bulela Day".
     * A day starts at 4:00 AM local time to account for late-night study sessions.
     */
    const getBulelaDayStart = (date: Date): number => {
      const GRACE_PERIOD_MS = 4 * 60 * 60 * 1000;
      const adjusted = new Date(date.getTime() - GRACE_PERIOD_MS);
      return new Date(
        adjusted.getFullYear(),
        adjusted.getMonth(),
        adjusted.getDate()
      ).getTime();
    };

    const todayStart = getBulelaDayStart(now);
    const lastStart = getBulelaDayStart(lastActivity);

    const MS_IN_DAY = 24 * 60 * 60 * 1000;
    // Difference in whole calendar (Bulela) days
    const diffDays = Math.round((todayStart - lastStart) / MS_IN_DAY);

    // Case 1: Same Bulela day - user is active again.
    // Fix: Do NOT increment, but update timestamp to keep current activity fresh.
    if (diffDays === 0) {
      return {
        ...user,
        lastActivityAt: now 
      };
    }

    // Case 2: Consecutive Bulela day - perfect transition.
    // Fix: Increment streak by 1.
    if (diffDays === 1) {
      return {
        ...user,
        streak: user.streak + 1,
        lastActivityAt: now
      };
    }

    // Case 3: Gap in activity (> 1 Bulela day).
    // Check for available streak freezes.
    if (user.streakFreezeCount > 0) {
      console.log("[Bulela] Streak Freeze triggered! Saving streak:", user.streak);
      return {
        ...user,
        streakFreezeCount: user.streakFreezeCount - 1,
        lastActivityAt: now 
      };
    }

    // No freezes left: reset streak.
    console.log("[Bulela] Streak broken. Resetting to 1.");
    return {
      ...user,
      streak: 1,
      lastActivityAt: now
    };
  }
}
