
import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './Sidebar';
import BottomNav from './BottomNav';
import CloudStatus from './CloudStatus';
import { UserButton } from '@clerk/clerk-react';
import { useBulelaStore } from '../store/useBulelaStore';
import { Badge } from './ui/badge';
import { GraduationCap, Star, Coins, Heart, Sun, Moon } from "lucide-react";
import BulelaMascot from './BulelaMascot';

interface Props {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onUpgradeClick?: () => void;
  statsOverride?: { xp: number; kwacha: number; hearts: number };
  pulseKwacha?: boolean;
}

const RollingNumber: React.FC<{ value: number }> = ({ value }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      let start = prevValue.current;
      const end = value;
      const duration = 1000;
      const startTime = performance.now();

      const update = (now: number) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = Math.floor(start + (end - start) * progress);
        setDisplayValue(current);
        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          prevValue.current = value;
        }
      };
      requestAnimationFrame(update);
    }
  }, [value]);

  return <span>{displayValue}</span>;
};

const Layout: React.FC<Props> = ({ children, activeTab, onTabChange, onUpgradeClick, statsOverride, pulseKwacha }) => {
  const { user } = useBulelaStore();
  const role = user?.role;
  const tier = user?.subscriptionTier;
  
  const isIndividual = role === 'individual';
  const isTeacher = role === 'teacher' || role === 'moe_admin';

  const stats = {
    xp: statsOverride?.xp || (user?.xp ? Math.floor(user.xp) : 1240),
    kPoints: user?.kPoints || 0,
    hearts: statsOverride?.hearts || (user?.hearts ?? 5)
  };

  const isTeacherView = activeTab === 'IMPACT';

  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="min-h-screen flex bg-silk dark:bg-midnight text-charcoal dark:text-slate-200 transition-colors duration-500">
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} onUpgradeClick={onUpgradeClick} />
      
      <main className="flex-1 md:ml-64 mb-20 md:mb-0 relative overflow-hidden">
        {/* Decorative background elements matching WelcomeScreen */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-amber-copper rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-copper rounded-full blur-3xl opacity-20"></div>
        </div>

        <header className="flex h-16 md:h-20 w-full items-center justify-between border-b border-copper/10 bg-white/80 dark:bg-espresso/80 backdrop-blur-md px-4 md:px-8 sticky top-0 z-40 transition-colors duration-500">
          
          {/* LEFT: Logo & Slogan */}
          <div className="flex items-center gap-2 md:gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-xl bg-silk dark:bg-espresso-card border border-copper/10 text-charcoal dark:text-silk hover:scale-110 transition-all"
                title="Toggle Theme"
              >
                {isDarkMode ? <Moon className="w-4 h-4 md:w-5 md:h-5" /> : <Sun className="w-4 h-4 md:w-5 md:h-5" />}
              </button>
              <div className="h-10 w-10 flex-shrink-0 hidden sm:block">
                <BulelaMascot mood="float" className="w-full h-full" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-2xl font-black italic text-charcoal dark:text-white leading-none tracking-tighter uppercase">
                BULELA<span className="text-amber-copper">.</span>
              </h1>
              <p className="hidden md:flex text-[10px] font-bold uppercase tracking-widest text-amber-copper mt-1 opacity-80">
                Learning that feels you
              </p>
            </div>
          </div>

          {/* RIGHT: Stats Container */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* VIEW TOGGLE: Becomes icon-only on mobile */}
            {isTeacher && (
              <Badge 
                variant="outline" 
                className={`cursor-pointer border-copper/30 dark:bg-white/5 text-charcoal dark:text-white px-2 md:px-3 py-1.5 transition-all hover:scale-105 active:scale-95 ${
                  isTeacherView ? 'bg-amber-copper text-white border-copper-dark' : ''
                }`}
                onClick={() => onTabChange(isTeacherView ? 'LEARN' : 'IMPACT')}
              >
                <GraduationCap className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline uppercase font-black text-[10px] tracking-widest">
                  {isTeacherView ? 'TEACHER VIEW' : 'STUDENT VIEW'}
                </span>
              </Badge>
            )}

            {/* STATS: Scales down for small screens */}
            <div className="flex items-center gap-1 md:gap-3 rounded-full bg-silk dark:bg-midnight-card px-2 md:px-4 py-1.5 border border-copper/10 shadow-sm">
              <div className="flex items-center gap-1 px-1 border-r border-copper/20" title="XP">
                <Star className="h-3.5 w-3.5 md:h-4 md:w-4 fill-amber-400 text-amber-400" />
                <span className="text-xs md:text-sm font-black text-charcoal dark:text-white">
                  <RollingNumber value={stats.xp} />
                </span>
              </div>
              <div className={`flex items-center gap-1 px-1 border-r border-copper/20 transition-all ${pulseKwacha ? 'scale-110' : ''}`} title="Kwacha Points">
                <div className={`w-3.5 h-3.5 md:w-5 md:h-5 bg-amber-copper rounded-full flex items-center justify-center text-[7px] md:text-[10px] font-black text-white shadow-sm ${pulseKwacha ? 'animate-pulse-gold ring-4 ring-amber-copper/20' : ''}`}>K</div>
                <span className={`text-xs md:text-sm font-black transition-colors ${pulseKwacha ? 'text-copper-dark' : 'text-amber-copper'}`}>
                  <RollingNumber value={stats.kPoints} />
                </span>
              </div>
              <div className="flex items-center gap-1 px-1" title="Hearts">
                <Heart className="h-3.5 w-3.5 md:h-4 md:w-4 fill-rose-500 text-rose-500 animate-pulse" />
                <span className="text-xs md:text-sm font-black text-rose-500">{stats.hearts}</span>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-4">
          {children}
        </div>
      </main>

      <BottomNav activeTab={activeTab} onTabChange={onTabChange} />
    </div>
  );
};

export default Layout;
