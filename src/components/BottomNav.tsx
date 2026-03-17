
import React from 'react';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  ScrollText, 
  User 
} from 'lucide-react';
import { useBulelaStore } from '@/store/useBulelaStore';

const NAV_ITEMS = [
  { id: 'learn', label: 'Learn', icon: BookOpen },
  { id: 'practice', label: 'Practice', icon: Target },
  { id: 'leaderboard', label: 'Rank', icon: Trophy },
  { id: 'quests', label: 'Quests', icon: ScrollText },
  { id: 'profile', label: 'Me', icon: User },
];

const BottomNav: React.FC = () => {
  const { activeTab, setActiveTab } = useBulelaStore();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t-2 border-gray-200 flex items-center justify-around px-2 z-50">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;

        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as any)}
            className={`flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all active:translate-y-[2px] ${
              isActive ? 'text-bulela-green bg-bulela-green/10' : 'text-gray-400'
            }`}
          >
            <Icon size={32} strokeWidth={isActive ? 3 : 2} />
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
