
export const streakManager = {
  getStreak: () => {
    const data = localStorage.getItem('bulela_streak_data');
    if (!data) return { count: 0, lastTimestamp: 0, freezeActive: false };
    return JSON.parse(data);
  },

  updateStreak: (isLessonCompletion: boolean = false) => {
    const data = streakManager.getStreak();
    const now = Date.now();
    const lastTimestamp = data.lastTimestamp;
    
    if (lastTimestamp === 0) {
      if (isLessonCompletion) {
        const newData = { ...data, count: 1, lastTimestamp: now };
        localStorage.setItem('bulela_streak_data', JSON.stringify(newData));
        return newData;
      }
      return data;
    }

    const diffHours = (now - lastTimestamp) / (1000 * 60 * 60);

    let newCount = data.count;
    let newTimestamp = lastTimestamp;

    if (isLessonCompletion) {
      if (diffHours >= 24 && diffHours <= 48) {
        // Exactly 1 day later
        newCount += 1;
        newTimestamp = now;
      } else if (diffHours > 48) {
        // Reset if > 48 hours
        if (data.freezeActive) {
          // Consume freeze
          const newData = { ...data, freezeActive: false, lastTimestamp: now };
          localStorage.setItem('bulela_streak_data', JSON.stringify(newData));
          return newData;
        } else {
          newCount = 1;
          newTimestamp = now;
        }
      } else if (diffHours < 24) {
        // Same day, just update timestamp if it's a completion? 
        // Actually Duolingo keeps the streak if you do it multiple times a day.
        // We only increment once per 24h window.
        newTimestamp = now;
      }
    } else {
      // Check for reset on login
      if (diffHours > 48 && !data.freezeActive) {
        newCount = 0;
      }
    }

    const finalData = { ...data, count: newCount, lastTimestamp: newTimestamp };
    localStorage.setItem('bulela_streak_data', JSON.stringify(finalData));
    return finalData;
  },

  setFreeze: (active: boolean) => {
    const data = streakManager.getStreak();
    localStorage.setItem('bulela_streak_data', JSON.stringify({ ...data, freezeActive: active }));
  }
};
