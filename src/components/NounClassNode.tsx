
import React from 'react';
import { LessonStatus } from '../types';
import { ICONS } from '../constants';

interface Props {
  title: string;
  status: LessonStatus;
  offset?: string; 
  onClick?: () => void;
}

const NounClassNode: React.FC<Props> = ({ title, status, offset = 'ml-0', onClick }) => {
  const isCompleted = status === LessonStatus.COMPLETED;
  const isLocked = status === LessonStatus.LOCKED;
  const isActive = status === LessonStatus.ACTIVE;

  return (
    <div className={`flex flex-col items-center ${offset} relative group z-10 animate-in fade-in zoom-in duration-500`}>
      {/* Node Button */}
      <button
        onClick={onClick}
        className={`
          relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300
          ${isCompleted ? 'bg-amber-copper border-b-4 border-copper-dark shadow-lg' : ''}
          ${isActive ? 'bg-electric-emerald border-b-4 border-emerald-700 ring-8 ring-electric-emerald/20 shadow-xl emerald-glow animate-pulse' : ''}
          ${isLocked ? 'bg-bronze/40 border-b-4 border-bronze/60 opacity-60' : ''}
          ${!isLocked ? 'hover:scale-110 active:scale-95' : 'cursor-not-allowed'}
        `}
      >
        {isCompleted && <span className="text-white scale-110">{ICONS.CHECK}</span>}
        {isActive && (
          <div className="flex flex-col items-center">
            <span className="text-white text-3xl animate-pulse">⭐</span>
          </div>
        )}
        {isLocked && <span className="text-bronze/40 opacity-60">{ICONS.LOCK}</span>}
        
        {/* Active Tooltip/Label */}
        {isActive && (
          <div className="absolute -top-14 bg-electric-emerald text-white text-[10px] font-black px-4 py-2 rounded-2xl whitespace-nowrap animate-bounce shadow-2xl border-2 border-white/20">
            START HERE
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-electric-emerald rotate-45 border-r-2 border-b-2 border-white/20"></div>
          </div>
        )}
      </button>

      {/* Title */}
      <div className="max-w-[120px] text-center">
        <h3 className={`mt-4 font-black text-[10px] uppercase tracking-widest leading-tight ${isLocked ? 'text-bronze/40' : 'text-amber-copper'}`}>
          {title}
        </h3>
      </div>
    </div>
  );
};

export default NounClassNode;
