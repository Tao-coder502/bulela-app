import React from 'react';
import { MissionCard, ProficiencyPath } from '../types';
import { motion, AnimatePresence } from 'motion/react';

/**
 * TonalVisualizer
 * Parses M-te(H)-ngo(L) and returns JSX where (H) syllables have an Amber (#FB923C) glow.
 */
export const TonalVisualizer = (text: string) => {
  const parts = text.split(/(\([HL]\))/);
  
  return (
    <span className="font-mono tracking-tight">
      {parts.map((part, i) => {
        if (part === '(H)' || part === '(L)') return null;
        
        const nextPart = parts[i + 1];
        if (nextPart === '(H)') {
          return (
            <span key={i} className="text-[#FB923C] drop-shadow-[0_0_12px_rgba(251,146,60,0.9)] font-black">
              {part}
            </span>
          );
        }
        return <span key={i} className="text-white/80">{part}</span>;
      })}
    </span>
  );
};

interface CardProps {
  card: MissionCard;
  userLevel: ProficiencyPath;
  onAnswer: (isCorrect: boolean) => void;
}

/**
 * VoiceCard Component
 * For VOICE_REPETITION type.
 */
export const VoiceCard: React.FC<CardProps> = ({ card, userLevel, onAnswer }) => {
  const text = card.difficulty_mapping[userLevel] || card.nyanja_text;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A0F05] border-2 border-[#FB923C]/20 p-8 rounded-[2.5rem] shadow-2xl space-y-8 relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-[#FB923C]/5 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2" />
      
      <div className="flex justify-between items-center relative z-10">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-[#FB923C] rounded-full animate-pulse" />
          <span className="text-[10px] font-black text-[#FB923C] uppercase tracking-[0.2em]">Voice Repetition</span>
        </div>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{userLevel}</span>
      </div>
      
      <div className="text-center py-8 relative z-10">
        <h3 className="text-3xl font-medium text-white leading-relaxed">
          {TonalVisualizer(text)}
        </h3>
      </div>
      
      <button 
        onMouseDown={() => {}} // Simulation of recording start
        onMouseUp={() => onAnswer(true)} // Simulation of recording end
        className="w-full py-5 bg-[#FB923C] text-[#1A0F05] font-black rounded-2xl shadow-xl shadow-[#FB923C]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 relative z-10"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-1.93v-2.07z"/>
        </svg>
        HOLD TO SPEAK
      </button>
    </motion.div>
  );
};

/**
 * ScenarioCard Component
 * For SCENARIO_RESPONSE type.
 */
export const ScenarioCard: React.FC<CardProps> = ({ card, userLevel, onAnswer }) => {
  const text = card.difficulty_mapping[userLevel] || card.nyanja_text;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#1A0F05] border-2 border-white/5 p-8 rounded-[2.5rem] shadow-2xl space-y-8 relative group"
    >
      <div className="flex justify-between items-center">
        <span className="text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">Scenario Response</span>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{userLevel}</span>
      </div>

      <div className="bg-white/5 p-8 rounded-3xl border border-white/5 italic relative">
        <div className="absolute -top-3 -left-3 text-4xl text-[#FB923C]/20 font-serif">“</div>
        <p className="text-white/90 text-xl leading-relaxed">
          {TonalVisualizer(text)}
        </p>
        <div className="absolute -bottom-3 -right-3 text-4xl text-[#FB923C]/20 font-serif rotate-180">“</div>
      </div>

      <div className="grid gap-4">
        <button 
          onClick={() => onAnswer(true)}
          className="w-full py-4 px-6 rounded-2xl border border-white/10 text-white/80 font-bold hover:bg-[#FB923C]/10 hover:border-[#FB923C]/40 hover:text-[#FB923C] transition-all text-left flex items-center justify-between group/btn"
        >
          <span>A: Respectful Greeting (A-prefix)</span>
          <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity text-xs">SELECT</span>
        </button>
        <button 
          onClick={() => onAnswer(false)}
          className="w-full py-4 px-6 rounded-2xl border border-white/10 text-white/80 font-bold hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-500 transition-all text-left flex items-center justify-between group/btn"
        >
          <span>B: Casual Greeting (No prefix)</span>
          <span className="opacity-0 group-hover/btn:opacity-100 transition-opacity text-xs">SELECT</span>
        </button>
      </div>
    </motion.div>
  );
};

/**
 * MaternalPivot Component
 * Triggers when sentiment is low.
 */
export const MaternalPivot: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#1A0F05] border-2 border-success/40 p-8 rounded-[2.5rem] shadow-[0_0_50px_rgba(34,197,94,0.2)] space-y-6 text-center"
    >
      <div className="w-20 h-20 bg-success/10 rounded-full flex items-center justify-center mx-auto border-2 border-success/20">
        <span className="text-3xl">🌿</span>
      </div>
      <div className="space-y-2">
        <h4 className="text-success font-black uppercase tracking-widest text-xs">Maternal Guidance Active</h4>
        <p className="text-white font-medium italic leading-relaxed">
          "{message}"
        </p>
      </div>
      <button 
        onClick={onDismiss}
        className="w-full py-4 bg-success text-white font-black rounded-2xl hover:brightness-110 transition-all"
      >
        I UNDERSTAND, AMAMA
      </button>
    </motion.div>
  );
};
