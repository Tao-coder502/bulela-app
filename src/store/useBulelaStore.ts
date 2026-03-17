
import { create } from 'zustand';
import { UserState, SyncStatus, BulelaResponse, LanguageDNA } from '@/types';
import { LearnerState } from '@/engines/SentimentEngine';
import { SyncService } from '@/SyncService';
import { LinguisticRegistry } from '@/services/LinguisticRegistry';
import { apiService } from '@/services/apiService';

interface BulelaStore {
  // User & Auth
  user: UserState | null;
  isPro: boolean;
  isLoading: boolean;
  setUser: (user: UserState | null) => void;
  setIsLoading: (loading: boolean) => void;

  // Language Engine
  currentLanguage: string;
  languageDNA: LanguageDNA;
  setLanguage: (langId: string) => void;

  // Sync & Connectivity
  syncStatus: SyncStatus;
  setSyncStatus: (status: SyncStatus) => void;
  lastSyncMessage: string | null;
  setLastSyncMessage: (msg: string | null) => void;

  // UI & Navigation
  activeTab: 'learn' | 'practice' | 'leaderboard' | 'quests' | 'shop' | 'profile';
  setActiveTab: (tab: 'learn' | 'practice' | 'leaderboard' | 'quests' | 'shop' | 'profile') => void;
  isScreenLoading: boolean;
  setScreenLoading: (loading: boolean) => void;
  isPricingOpen: boolean;
  setPricingOpen: (open: boolean) => void;

  // Tutor & AI
  tutorWisdom: BulelaResponse | null;
  setTutorWisdom: (wisdom: BulelaResponse | null) => void;
  isTutorLoading: boolean;
  setTutorLoading: (loading: boolean) => void;
  isTutorVisible: boolean;
  setTutorVisible: (visible: boolean) => void;
  currentSentiment: LearnerState | null;
  setCurrentSentiment: (sentiment: LearnerState | null) => void;
  recommendedAction: string | null;
  setRecommendedAction: (action: string | null) => void;

  // Lesson State
  lessons: any[];
  setLessons: (lessons: any[]) => void;
  fetchLessons: () => Promise<void>;
  activeLessonId: string | null;
  setActiveLessonId: (id: string | null) => void;
  ansState: 'idle' | 'success' | 'error';
  setAnsState: (state: 'idle' | 'success' | 'error') => void;
  encouragement: string | null;
  setEncouragement: (msg: string | null) => void;
  isVoiceOpen: boolean;
  setVoiceOpen: (open: boolean) => void;
  // Stripe Actions
  createCheckoutSession: () => Promise<void>;
  openCustomerPortal: () => Promise<void>;
  // Navigation with Loader
  navigateWithLoader: (tab: 'learn' | 'practice' | 'leaderboard' | 'quests' | 'shop' | 'profile', delay?: number) => void;
  // User Actions
  updateKPoints: (amount: number) => void;
  incrementAiUsage: () => void;
  updateMastery: (classId: string, accuracy: number) => void;
  completeLesson: (lessonId: string, xpReward: number) => void;
  fetchNextLesson: () => Promise<void>;
  syncWithBackend: () => Promise<void>;
}

export const useBulelaStore = create<BulelaStore>((set, get) => ({
  // User & Auth
  user: null,
  isPro: false,
  isLoading: true,
  setUser: (user) => set({ 
    user, 
    isPro: user?.subscriptionTier === 'pro' 
  }),
  setIsLoading: (loading) => set({ isLoading: loading }),

  // Language Engine
  currentLanguage: 'nyanja',
  languageDNA: LinguisticRegistry.nyanja,
  setLanguage: (langId) => {
    const dna = LinguisticRegistry[langId];
    if (dna) {
      set({ currentLanguage: langId, languageDNA: dna });
    }
  },

  // User Actions
  updateKPoints: (amount) => {
    const { user } = get();
    if (!user) return;
    const updatedUser = {
      ...user,
      kPoints: user.kPoints + amount,
      xp: user.xp + (amount / 5)
    };
    set({ user: updatedUser });
    SyncService.queueItem(user.id, 'KPOINTS_UPDATE', { amount });
  },

  incrementAiUsage: () => {
    const { user } = get();
    if (!user) return;
    const updatedUser = {
      ...user,
      aiUsageCount: user.aiUsageCount + 1
    };
    set({ user: updatedUser });
    SyncService.queueItem(user.id, 'AI_USAGE', {});
  },

  updateMastery: (classId, accuracy) => {
    const { user } = get();
    if (!user) return;
    const updatedUser = {
      ...user,
      masteryMap: {
        ...user.masteryMap,
        [classId]: accuracy
      }
    };
    set({ user: updatedUser });
    SyncService.queueItem(user.id, 'MASTERY_UPDATE', { classId, accuracy });
  },

  completeLesson: (lessonId, xpReward) => {
    const { user } = get();
    if (!user || user.completedLessons.includes(lessonId)) return;
    const updatedUser = {
      ...user,
      completedLessons: [...user.completedLessons, lessonId],
      xp: user.xp + xpReward,
      kPoints: user.kPoints + xpReward
    };
    set({ user: updatedUser });
    SyncService.queueItem(user.id, 'LESSON_COMPLETE', { lessonId, xpReward });
  },

  fetchNextLesson: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const recommendation = await apiService.getNextLesson(user.id);
      set({ 
        activeLessonId: recommendation.nextLessonId,
        recommendedAction: recommendation.recommendedAction
      });
    } catch (error) {
      console.error("Failed to fetch next lesson:", error);
    }
  },

  syncWithBackend: async () => {
    const { user } = get();
    if (!user) return;
    try {
      const backendUser = await apiService.syncWithBackend(user.id);
      set({ user: { ...user, ...backendUser } });
    } catch (error) {
      console.error("Failed to sync with backend:", error);
    }
  },

  // Sync & Connectivity
  syncStatus: SyncStatus.SYNCED,
  setSyncStatus: (status) => set({ syncStatus: status }),
  lastSyncMessage: null,
  setLastSyncMessage: (msg) => set({ lastSyncMessage: msg }),

  // UI & Navigation
  activeTab: 'learn',
  setActiveTab: (tab) => set({ activeTab: tab }),
  isScreenLoading: false,
  setScreenLoading: (loading) => set({ isScreenLoading: loading }),
  isPricingOpen: false,
  setPricingOpen: (open) => set({ isPricingOpen: open }),

  // Tutor & AI
  tutorWisdom: null,
  setTutorWisdom: (wisdom) => set({ tutorWisdom: wisdom }),
  isTutorLoading: false,
  setTutorLoading: (loading) => set({ isTutorLoading: loading }),
  isTutorVisible: false,
  setTutorVisible: (visible) => set({ isTutorVisible: visible }),
  currentSentiment: 'FLOW',
  setCurrentSentiment: (sentiment) => {
    const { user } = get();
    set({ currentSentiment: sentiment });
    if (user && sentiment) {
      SyncService.queueItem(user.id, 'SENTIMENT_UPDATE', { state: sentiment });
    }
  },
  recommendedAction: null,
  setRecommendedAction: (action) => set({ recommendedAction: action }),

  // Lesson State
  lessons: [],
  setLessons: (lessons) => set({ lessons }),
  fetchLessons: async () => {
    try {
      const response = await fetch('/api/lessons');
      if (response.ok) {
        const data = await response.json();
        set({ lessons: data });
      }
    } catch (error) {
      console.error("Failed to fetch lessons:", error);
    }
  },
  activeLessonId: null,
  setActiveLessonId: (id) => set({ activeLessonId: id }),
  ansState: 'idle',
  setAnsState: (state) => set({ ansState: state }),
  encouragement: null,
  setEncouragement: (msg) => set({ encouragement: msg }),
  isVoiceOpen: false,
  setVoiceOpen: (open) => set({ isVoiceOpen: open }),
  createCheckoutSession: async () => {
    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
    }
  },
  openCustomerPortal: async () => {
    try {
      const response = await fetch('/api/checkout/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      }
    } catch (error) {
      console.error("Failed to open customer portal:", error);
    }
  },
  navigateWithLoader: (tab, delay = 600) => {
    const { activeTab } = get();
    if (tab === activeTab) return;
    
    set({ isScreenLoading: true });
    setTimeout(() => {
      set({ activeTab: tab, isScreenLoading: false });
    }, delay);
  },
}));
