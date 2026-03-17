import React from 'react';
import { motion } from 'motion/react';
import { 
  Zap, 
  Heart, 
  Coins, 
  Cloud, 
  CloudOff, 
  RefreshCw,
  Star
} from 'lucide-react';
import { useBulelaStore } from '@/store/useBulelaStore';
import { SyncStatus } from '@/types';
import LearningPath from './LearningPath';

export const BentoDashboard: React.FC = () => {
  const { user, syncStatus, currentLanguage, setActiveLessonId, navigateWithLoader } = useBulelaStore();

  if (!user) return null;

  const handleSelectLesson = (lessonId: string) => {
    setActiveLessonId(lessonId);
    // In a real app, we might navigate to a specific lesson view
    // For now, we'll just log it or show a placeholder
    console.log('Selected lesson:', lessonId);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 py-8">
      {/* MAIN COLUMN */}
      <div className="flex-1 max-w-2xl mx-auto">
        <LearningPath onSelectLesson={handleSelectLesson} />
      </div>

      {/* STATUS COLUMN */}
      <div className="hidden lg:flex w-80 flex-col gap-6 sticky top-8 h-fit">
        {/* SYNC STATUS CARD */}
        <div className="bento-card bg-bulela-green text-white border-none">
          <div className="flex items-center justify-between mb-4">
            <span className="font-black opacity-60 uppercase text-xs tracking-widest">
              {currentLanguage} Active
            </span>
            {syncStatus === SyncStatus.SYNCED ? (
              <Cloud className="text-candy-green" size={20} />
            ) : syncStatus === SyncStatus.OFFLINE ? (
              <CloudOff className="text-candy-red" size={20} />
            ) : (
              <RefreshCw className="animate-spin text-honey" size={20} />
            )}
          </div>
          <p className="text-sm font-bold">
            {syncStatus === SyncStatus.SYNCED 
              ? 'Progress safely stored in the village cloud.' 
              : syncStatus === SyncStatus.OFFLINE 
                ? 'Working offline. Progress saved locally.' 
                : 'Syncing your wisdom...'}
          </p>
        </div>

        {/* DAILY QUESTS */}
        <div className="bento-card">
          <h3 className="text-xl font-black mb-4">Daily Quests</h3>
          <div className="flex flex-col gap-4">
            {[
              { label: 'Earn 50 XP', progress: 30, goal: 50 },
              { label: 'Perfect Lesson', progress: 0, goal: 1 },
              { label: 'Spend 10 mins', progress: 8, goal: 10 },
            ].map((quest, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="flex justify-between text-sm font-black">
                  <span>{quest.label}</span>
                  <span className="text-gray-400">{quest.progress}/{quest.goal}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-candy-yellow" 
                    style={{ width: `${(quest.progress / quest.goal) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
