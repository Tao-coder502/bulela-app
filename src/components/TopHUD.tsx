import React, { useState, useRef, useEffect } from 'react';
import { Zap, Heart, Coins, ChevronDown } from 'lucide-react';
import { useBulelaStore } from '@/store/useBulelaStore';
import { AnimatePresence } from 'motion/react';
import { CourseSwitcher } from './CourseSwitcher';
import { UserButton } from '@clerk/clerk-react';

const TopHUD: React.FC = () => {
  const { user, currentLanguage } = useBulelaStore();
  const [showSwitcher, setShowSwitcher] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (switcherRef.current && !switcherRef.current.contains(event.target as Node)) {
        setShowSwitcher(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) return null;

  return (
    <div className="flex justify-between items-center bg-white border-2 border-gray-200 rounded-2xl p-3 lg:p-4 shadow-sm mb-6 lg:mb-8 sticky top-4 z-30">
      {/* Language Switcher Trigger */}
      <div className="flex items-center gap-2">
        <div className="relative" ref={switcherRef}>
          <button 
            onClick={() => setShowSwitcher(!showSwitcher)}
            className={`flex items-center gap-2 lg:gap-3 px-3 py-2 rounded-xl transition-all hover:bg-gray-50 border-2 ${showSwitcher ? 'border-blue-500 bg-blue-50/10' : 'border-transparent'}`}
          >
            <div className="w-8 h-6 lg:w-10 lg:h-8 rounded-md overflow-hidden border border-gray-200 shadow-sm shrink-0">
              <img 
                src={`https://picsum.photos/seed/${currentLanguage}/100/100`} 
                alt={currentLanguage}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col items-start leading-none">
              <span className="text-[10px] lg:text-[12px] font-black text-gray-400 uppercase tracking-widest">
                Level {user.masteryLevel}
              </span>
              <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSwitcher ? 'rotate-180' : ''}`} />
            </div>
          </button>

          <AnimatePresence>
            {showSwitcher && <CourseSwitcher onClose={() => setShowSwitcher(false)} />}
          </AnimatePresence>
        </div>
      </div>

      <div className="flex items-center gap-4 lg:gap-6">
        <div className="flex items-center gap-1.5 lg:gap-2 text-candy-orange font-black">
          <Zap size={20} className="lg:w-6 lg:h-6" fill="currentColor" />
          <span className="text-sm lg:text-lg">{user.xp}</span>
        </div>
        <div className="flex items-center gap-1.5 lg:gap-2 text-candy-red font-black">
          <Heart size={20} className="lg:w-6 lg:h-6" fill="currentColor" />
          <span className="text-sm lg:text-lg">{user.hearts}</span>
        </div>
        <div className="flex items-center gap-1.5 lg:gap-2 text-candy-yellow font-black">
          <Coins size={20} className="lg:w-6 lg:h-6" fill="currentColor" />
          <span className="text-sm lg:text-lg">{user.kwachaBalance}</span>
        </div>
        <div className="border-l-2 border-gray-100 pl-4">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default TopHUD;
