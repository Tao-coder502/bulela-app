
/**
 * Sprint 7.3: AI Usage Metering & Gating Logic
 */

const FREE_LIMIT = 3;
const STORAGE_KEY = 'bulela_ai_usage';

interface UsageData {
  date: string;
  count: number;
}

export const UsageService = {
  /**
   * Returns current daily usage data, resetting if it's a new day.
   */
  getUsage(): UsageData {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (!stored) {
      return { date: today, count: 0 };
    }

    try {
      const data: UsageData = JSON.parse(stored);
      if (data.date !== today) {
        return { date: today, count: 0 };
      }
      return data;
    } catch (e) {
      return { date: today, count: 0 };
    }
  },

  /**
   * Increments the AI usage count for the current day.
   */
  incrementAIUsage() {
    const usage = this.getUsage();
    usage.count += 1;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
  },

  /**
   * Returns how many hints are remaining for the current day.
   */
  getRemainingHints(): number {
    const usage = this.getUsage();
    return Math.max(0, FREE_LIMIT - usage.count);
  },

  /**
   * Returns total count for telemetry.
   */
  getDailyCount(): number {
    return this.getUsage().count;
  }
};
