
import { GamificationService } from './src/GamificationService';
import { StreakEngine } from './src/StreakEngine';
import { UserState } from './src/types';

/**
 * Bulela Gamification Simulator - Phase 3 (Fixed Streak Logic)
 */

function logState(label: string, user: UserState) {
  console.log(`--- ${label} ---`);
  console.log(`XP: ${user.xp}`);
  console.log(`Hearts: ${user.hearts}`);
  console.log(`Kwacha: ${user.kwachaBalance} CK`);
  console.log(`Streak: ${user.streak}`);
  console.log(`Streak Freeze: ${user.streakFreezeCount}`);
  console.log(`Mastery Level: ${user.masteryLevel}`);
  console.log(`Last Activity: ${user.lastActivityAt?.toLocaleString() || 'Never'}`);
  console.log('----------------------------\n');
}

export function runSimulation() {
  console.log("%c BULELA LOGIC SIMULATION (REFACTORED STREAK) ", "background: #083124; color: #B6833E; font-weight: bold; font-size: 14px;");

  // Helper to create a date exactly X hours ago
  const hoursAgo = (h: number) => new Date(Date.now() - h * 60 * 60 * 1000);

  // 1. Initialize User: Chanda
  // Setup: Last activity was 20 hours ago (Yesterday afternoon/evening)
  // Fix: Added missing role, subscriptionTier, and kPoints properties to satisfy UserState interface (Error on line 31)
  // Fix: Added Phase 8 personalization fields (masteryMap, completedLessons, aiUsageCount, voiceUsageCount) to comply with UserState interface.
  let chanda: UserState = {
    id: 'user-1',
    name: 'Chanda',
    clerkId: 'clerk-chanda',
    firstName: 'Chanda',
    role: 'individual',
    subscriptionTier: 'free',
    xp: 0,
    kwachaBalance: 50,
    // Add missing kPoints property to comply with UserState definition
    kPoints: 0,
    hearts: 5,
    lastHeartLossAt: null,
    lastActivityAt: hoursAgo(20), 
    streak: 5, // Let's give Chanda a 5-day streak to start
    streakFreezeCount: 1, // And one freeze for protection
    masteryLevel: 1,
    masteryMap: {},
    // Fix: Added missing completedLessons array to match UserState interface
    completedLessons: [],
    aiUsageCount: 0,
    voiceUsageCount: 0,
    lastSentiment: 'FLOW',
    learnerTier: 'MWAYI'
  };

  logState('INITIAL STATE (Chanda with 5-day streak)', chanda);

  // 2. Event 1 (Success): Perfect Lesson Today
  console.log(">> EVENT 1: Chanda completes 'Class 1 Noun' today.");
  const rewards = GamificationService.calculateLessonRewards(100, true);
  chanda = GamificationService.applyRewards(chanda, rewards);
  chanda = StreakEngine.validateStreak(chanda); // Should increment to 6
  logState('AFTER SUCCESS (Streak should be 6)', chanda);

  // 3. Event 2 (Failure): Fails Class 7 Concord
  console.log(">> EVENT 2: Chanda fails a 'Class 7 Concord' lesson.");
  try {
    chanda = GamificationService.deductHeart(chanda);
  } catch (e: any) {
    console.error("Deduct Heart Error:", e.message);
  }
  logState('AFTER FAILURE (Hearts should be 4)', chanda);

  // 4. Event 3 (The Shop): Buy Heart Refill (Cost: 50 Kwacha)
  // But wait, Chanda only has 60 Kwacha now (50 initial + 10 base). 
  // Let's assume rewards were applied: 50 + 10 = 60.
  console.log(">> EVENT 3: Chanda buys a 'Heart Refill' for 50 CK.");
  const REFILL_COST = 50;
  if (chanda.kwachaBalance >= REFILL_COST) {
    chanda = {
      ...chanda,
      kwachaBalance: chanda.kwachaBalance - REFILL_COST,
      hearts: 5,
      lastHeartLossAt: null
    };
  }
  logState('AFTER SHOP PURCHASE (Hearts back to 5)', chanda);

  // 5. Event 4 (Long Inactivity): 50 hours pass
  console.log(">> EVENT 4: 50 hours pass since last activity (Missing 2 days).");
  // Simulate time travel by rewinding lastActivityAt
  chanda = { ...chanda, lastActivityAt: hoursAgo(50) };
  
  console.log("Validating streak after long inactivity (Freeze check)...");
  chanda = StreakEngine.validateStreak(chanda); 
  logState('STATE AFTER FREEZE USED (Streak should be 6)', chanda);

  // 6. Event 5 (Broken Streak): Another 50 hours pass
  console.log(">> EVENT 5: Another 50 hours pass. No freezes left.");
  chanda = { ...chanda, lastActivityAt: hoursAgo(50) };
  chanda = StreakEngine.validateStreak(chanda);
  logState('FINAL STATE (Streak should reset to 1)', chanda);

  console.log("%c SIMULATION COMPLETE ", "background: #B6833E; color: white; font-weight: bold;");
}

(window as any).runBulelaSimulation = runSimulation;
