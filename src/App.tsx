
import React, { useEffect } from 'react';
import { useAuth, useUser, SignedIn, SignedOut } from '@clerk/clerk-react';
import { useBulelaStore } from '@/store/useBulelaStore';
import { UserState } from '@/types';
import WelcomeScreen from '@/components/WelcomeScreen';
import { BentoDashboard } from '@/components/BentoDashboard';
import PracticeView from '@/components/PracticeView';
import LeaderboardView from '@/components/LeaderboardView';
import ShopView from '@/components/ShopView';
import QuestView from '@/components/QuestView';
import ProfileView from '@/components/ProfileView';
import Loader from '@/components/Loader';
import { SyncService } from '@/SyncService';
import { streakManager } from '@/utils/streakManager';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AppLayout } from '@/components/AppLayout';

const MOCK_USER: UserState = {
  id: 'dev_user_123',
  name: 'Dev Explorer',
  clerkId: 'user_dev_mock',
  firstName: 'Dev Explorer',
  role: 'teacher',
  subscriptionTier: 'free',
  xp: 1250,
  kwachaBalance: 450,
  kPoints: 200,
  hearts: 5,
  lastHeartLossAt: null,
  lastActivityAt: new Date(),
  streak: 12,
  streakFreezeCount: 2,
  masteryLevel: 5,
  masteryMap: { 'class-1': 85, 'class-2': 40 },
  completedLessons: ['lesson-1', 'lesson-2', 'lesson-3', 'lesson-4', 'lesson-5', 'lesson-6'],
  aiUsageCount: 15,
  voiceUsageCount: 8,
  lastSentiment: 'FLOW',
  learnerTier: 'CHIKONDI'
};

const AuthenticatedApp: React.FC<{ isMock?: boolean }> = ({ isMock }) => {
  const { userId, getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { 
    setUser, 
    user, 
    isLoading, 
    setIsLoading, 
    activeTab,
    syncWithBackend,
    fetchNextLesson
  } = useBulelaStore();

  useEffect(() => {
    const initApp = async () => {
      if (isMock || !userId) {
        setUser(MOCK_USER);
        setIsLoading(false);
        return;
      }

      if (clerkUser) {
        const mappedUser: UserState = {
          id: clerkUser.id,
          name: clerkUser.fullName || 'Learner',
          clerkId: clerkUser.id,
          firstName: clerkUser.firstName || '',
          role: (clerkUser.publicMetadata.role as any) || 'individual',
          subscriptionTier: (clerkUser.publicMetadata.tier as any) || 'free',
          xp: (clerkUser.publicMetadata.xp as number) || 0,
          kwachaBalance: (clerkUser.publicMetadata.kwacha as number) || 50,
          kPoints: (clerkUser.publicMetadata.kPoints as number) || 0,
          hearts: (clerkUser.publicMetadata.hearts as number) || 5,
          lastHeartLossAt: clerkUser.publicMetadata.lastHeartLossAt ? new Date(clerkUser.publicMetadata.lastHeartLossAt as string) : null,
          lastActivityAt: new Date(),
          streak: (clerkUser.publicMetadata.streak as number) || 0,
          streakFreezeCount: (clerkUser.publicMetadata.streakFreezeCount as number) || 0,
          masteryLevel: (clerkUser.publicMetadata.masteryLevel as number) || 1,
          masteryMap: (clerkUser.publicMetadata.masteryMap as any) || {},
          completedLessons: (clerkUser.publicMetadata.completedLessons as string[]) || [],
          aiUsageCount: (clerkUser.publicMetadata.aiUsageCount as number) || 0,
          voiceUsageCount: (clerkUser.publicMetadata.voiceUsageCount as number) || 0,
          lastSentiment: (clerkUser.publicMetadata.lastSentiment as any) || 'FLOW',
          learnerTier: (clerkUser.publicMetadata.learnerTier as any) || 'MWAYI'
        };
        
        setUser(mappedUser);
        SyncService.init(mappedUser.id, getToken);
        
        // Sync with backend DB and get personalized next lesson
        try {
          await syncWithBackend();
          await fetchNextLesson();
        } catch (e) {
          console.error("Initial sync failed:", e);
        }

        setIsLoading(false);
      }
    };

    initApp();
  }, [userId, clerkUser, setUser, setIsLoading, isMock, getToken, syncWithBackend, fetchNextLesson]);

  const renderView = () => {
    switch (activeTab) {
      case 'learn':
        return <BentoDashboard />;
      case 'practice':
        return <PracticeView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'quests':
        return <QuestView />;
      case 'shop':
        return <ShopView />;
      case 'profile':
        return <ProfileView />;
      default:
        return (
          <div className="p-12 flex flex-col items-center justify-center min-h-[60vh] text-center">
            <div className="w-32 h-32 bg-white border-2 border-gray-200 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm">
              <span className="text-5xl">🚧</span>
            </div>
            <h1 className="text-3xl font-black text-bulela-green mb-2 uppercase tracking-tight">
              {activeTab} Under Construction
            </h1>
            <p className="text-gray-400 font-bold max-w-md">
              Bulela is currently scouting this area for more honey and cultural wisdom. Check back soon!
            </p>
            <button 
              onClick={() => useBulelaStore.getState().setActiveTab('learn')}
              className="mt-8 btn-isometric btn-isometric-green"
            >
              Back to Learning
            </button>
          </div>
        );
    }
  };

  return (
    <AppLayout>
      {renderView()}
    </AppLayout>
  );
};

const App: React.FC = () => {
  const [isBypassed, setIsBypassed] = React.useState(false);

  return (
    <LanguageProvider>
      {isBypassed ? (
        <AuthenticatedApp isMock />
      ) : (
        <>
          <SignedIn>
            <AuthenticatedApp />
          </SignedIn>
          <SignedOut>
            <WelcomeScreen onDevBypass={() => setIsBypassed(true)} />
          </SignedOut>
        </>
      )}
    </LanguageProvider>
  );
};

export default App;
