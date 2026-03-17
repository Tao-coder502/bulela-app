import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LinguisticRegistry } from '../services/LinguisticRegistry';
import { motion, AnimatePresence } from 'motion/react';
import { Globe, ChevronDown } from 'lucide-react';

export const HeaderPill: React.FC = () => {
  const { currentLang, setLanguage, isRecompiling } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const activeDNA = LinguisticRegistry[currentLang];

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[400px] z-[99]">
      <div className="relative">
        {/* The Capsule */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex items-center justify-between px-6 py-3 rounded-full backdrop-blur-md bg-black/80 border border-amber-500/30 shadow-[0_0_20px_rgba(251,146,60,0.15)]"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <Globe className="w-4 h-4 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Bulela Engine</p>
              <p className="text-xs font-bold text-white uppercase">{activeDNA.name}</p>
            </div>
          </div>

          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 transition-all border border-white/10"
          >
            <span className="text-[10px] font-black text-white/60 uppercase tracking-tighter">{currentLang}</span>
            <ChevronDown className={`w-3 h-3 text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </motion.div>

        {/* Glassmorphism Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute top-full left-0 w-full mt-3 p-2 rounded-[2rem] backdrop-blur-xl bg-black/60 border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="grid grid-cols-1 gap-1">
                {Object.values(LinguisticRegistry).map((lang) => (
                  <button
                    key={lang.id}
                    onClick={() => {
                      setLanguage(lang.id);
                      setIsOpen(false);
                    }}
                    className={`flex items-center justify-between p-4 rounded-2xl transition-all ${
                      currentLang === lang.id 
                        ? 'bg-amber-500/20 text-white' 
                        : 'text-white/40 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-1.5 h-1.5 rounded-full ${currentLang === lang.id ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' : 'bg-white/10'}`} />
                      <span className="text-xs font-black uppercase tracking-tight">{lang.name}</span>
                    </div>
                    <span className="text-[8px] font-mono opacity-40 uppercase">{lang.culturalPivot}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recompiling Indicator */}
        <AnimatePresence>
          {isRecompiling && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap"
            >
              <p className="text-[8px] font-black text-amber-500 uppercase tracking-[0.4em] animate-pulse">
                Recompiling DNA...
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
