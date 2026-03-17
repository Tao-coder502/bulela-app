import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Target, 
  Trophy, 
  ScrollText, 
  ShoppingBag, 
  User, 
  MoreHorizontal
} from 'lucide-react';
import { useBulelaStore } from '@/store/useBulelaStore';
import { MorePopover } from './MorePopover';

const NAV_ITEMS = [
  { id: 'learn', label: 'LEARN', icon: BookOpen },
  { id: 'practice', label: 'PRACTICE', icon: Target },
  { id: 'leaderboard', label: 'LEADERBOARDS', icon: Trophy },
  { id: 'quests', label: 'QUESTS', icon: ScrollText },
  { id: 'shop', label: 'SHOP', icon: ShoppingBag },
  { id: 'profile', label: 'PROFILE', icon: User },
];

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useBulelaStore();
  const [showMore, setShowMore] = useState(false);

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-[256px] border-r-2 border-gray-200 bg-white p-4 flex-col z-50 overflow-y-auto scrollbar-hide">
      <div className="mb-8 px-4 py-6 shrink-0">
        <h1 className="text-3xl font-black tracking-tighter text-bulela-green font-sans">
          BULELA
        </h1>
      </div>

      <nav className="flex-1 flex flex-col min-h-0">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveTab(item.id as any)}
              className={`
                w-full h-[50px] flex items-center gap-4 px-4 mb-2 rounded-2xl font-bold uppercase text-[15px] tracking-wide transition-all duration-100
                box-border border-2 border-transparent border-t-2 border-x-2
                ${isActive 
                  ? 'bg-bulela-green/10 border-b-4 border-bulela-green text-bulela-green active:border-b-2 active:translate-y-[2px]' 
                  : 'text-[#4B4B4B] hover:bg-gray-100 border-b-4 border-gray-200 active:border-b-2 active:translate-y-[2px]'}
              `}
            >
              <Icon size={32} strokeWidth={isActive ? 3 : 2} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </motion.button>
          );
        })}

        <div className="mt-auto pt-4 relative shrink-0">
          <AnimatePresence>
            {showMore && <MorePopover onClose={() => setShowMore(false)} />}
          </AnimatePresence>

          <button 
            onClick={() => setShowMore(!showMore)}
            className={`
              w-full h-[50px] flex items-center gap-4 px-4 rounded-2xl font-bold uppercase text-[15px] tracking-wide transition-all active:translate-y-[2px] box-border border-2 border-transparent border-t-2 border-x-2 border-b-4 border-gray-200
              ${showMore ? 'bg-gray-100 text-bulela-green' : 'text-[#4B4B4B] hover:bg-gray-100'}
            `}
          >
            <MoreHorizontal size={32} strokeWidth={3} className="shrink-0" />
            <span className="truncate">More</span>
          </button>
        </div>
      </nav>
    </aside>
  );
};
