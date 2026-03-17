
import React, { useState, useEffect } from 'react';
import { BulelaResponse } from '../types';
import { LearnerState } from '../engines/SentimentEngine';
import { useBulelaStore } from '../store/useBulelaStore';
import MirrorText from './MirrorText';
import UpgradeModal from './UpgradeModal';

interface Props {
  wisdom: BulelaResponse | null;
  isLoading: boolean;
  onClose: () => void;
  sentiment?: LearnerState | null;
  masteryLevel?: number;
}

const WISDOM_LIBRARY = [
  "Success is a tree that grows from the soil of persistence.",
  "Did you know? Nyanja uses 18 distinct noun classes to categorize the world.",
  "The foundation of Bantu languages is the 'Mirror Rule'.",
  "In Nyanja, 'Zikomo' is more than thank you—it's a community bond."
];

import BulelaMascot from './BulelaMascot';

const BulelaTutor: React.FC<Props> = ({ wisdom, isLoading, onClose, sentiment, masteryLevel }) => {
  const { isPro } = useBulelaStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState(WISDOM_LIBRARY[0]);

  // Rotate loading messages for better Transition UX
  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMsg(prev => {
          const currentIndex = WISDOM_LIBRARY.indexOf(prev);
          return WISDOM_LIBRARY[(currentIndex + 1) % WISDOM_LIBRARY.length];
        });
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  if (!wisdom && !isLoading) return null;

  const isLocked = wisdom?.isLocked;
  const uiAction = wisdom?.ui_action;
  const difficulty = wisdom?.next_step_difficulty;

  return (
    <>
      <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 bg-silk/40 backdrop-blur-sm transition-all animate-in fade-in">
        <div className={`bg-white w-full max-w-lg rounded-t-[3rem] shadow-2xl overflow-hidden border-t-8 flex flex-col items-center p-8 relative transition-all duration-500 ${
          uiAction === 'CHANGE_COLOR' ? 'border-amber-copper' : 
          uiAction === 'SIMPLIFY_TASK' ? 'border-success' : 
          'border-copper'
        }`}>
          
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 text-charcoal/40 hover:text-copper transition-colors p-2"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          <div className="flex flex-wrap justify-center gap-2 mb-4">
            {!isLocked && sentiment && (
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                sentiment === 'FLOW' ? 'bg-success/10 text-success border border-success/20' :
                sentiment === 'FRICTION' ? 'bg-rose-100 text-rose-600 border border-rose-200' :
                'bg-amber-100 text-amber-600 border border-amber-200'
              }`}>
                {sentiment} State
              </span>
            )}
            <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-copper/10 text-copper-dark border border-copper/20">
              Mastery Level {masteryLevel || 1}
            </span>
            {difficulty && (
              <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest border ${
                difficulty === 'HARD' ? 'bg-rose-500 text-white border-rose-600' :
                difficulty === 'MEDIUM' ? 'bg-amber-500 text-white border-amber-600' :
                'bg-emerald-500 text-white border-emerald-600'
              }`}>
                {difficulty} Path
              </span>
            )}
            {uiAction === 'SHOW_HINT' && (
              <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-blue-500 text-white animate-pulse">
                Hint Unlocked
              </span>
            )}
            {wisdom?.engine && (
              <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                Engine: {wisdom.engine}
              </span>
            )}
            {isLocked && (
              <span className="text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest bg-rose-500 text-white animate-pulse">
                Usage Gate Active
              </span>
            )}
          </div>

          <div className="w-24 h-24 bg-silk rounded-full border-4 border-copper flex items-center justify-center mb-6 shadow-xl relative group">
            <BulelaMascot mood={isLocked ? 'idle' : 'float'} className="w-20 h-20" />
            {!isLocked && wisdom?.cultural_metaphor && (
              <div className="absolute -right-16 top-0 bg-white border border-copper/10 p-2 rounded-lg text-[9px] font-bold text-copper shadow-sm w-24 leading-tight opacity-0 group-hover:opacity-100 transition-opacity">
                "Your spirit is like {wisdom.cultural_metaphor}."
              </div>
            )}
          </div>

          <div className="text-center space-y-4 w-full">
            <h2 className="text-xl font-black text-charcoal uppercase tracking-tighter">
              Bulela's <span className="text-copper">{isLocked ? 'Legacy' : 'Counsel'}</span>
            </h2>
            
            {isLoading ? (
              <div className="flex flex-col items-center gap-3 py-8">
                <div className="flex gap-2 mb-2">
                  <div className="w-2 h-2 bg-copper rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-copper rounded-full animate-bounce [animation-delay:-0.1s]"></div>
                  <div className="w-2 h-2 bg-copper rounded-full animate-bounce [animation-delay:-0.2s]"></div>
                </div>
                <p className="text-sm font-bold text-charcoal/40 italic max-w-xs mx-auto leading-relaxed transition-all">
                  "{loadingMsg}"
                </p>
              </div>
            ) : isLocked ? (
              <div className="space-y-6 py-4 animate-in slide-in-from-bottom-2">
                <div className="bg-silk p-6 rounded-3xl border-2 border-copper/10 italic">
                  <p className="text-charcoal text-lg font-medium leading-relaxed">
                    <MirrorText text={`"${wisdom?.tutor_hint || "My child, even the most patient elder needs to rest his voice."}"`} />
                  </p>
                </div>
                {!isPro && (
                  <>
                    <div className="text-left space-y-2">
                       <p className="text-xs font-black text-charcoal/40 uppercase tracking-widest">Upgrade to Bulela Pro</p>
                       <p className="text-sm font-bold text-charcoal/60">Unlock unlimited AI guidance and master Bantu concords without limits.</p>
                    </div>
                    <button 
                      onClick={() => setIsPricingOpen(true)}
                      className="w-full py-4 rounded-2xl bg-gradient-to-r from-copper to-yellow-400 text-white font-black text-lg shadow-xl shadow-copper/20 hover:scale-105 active:scale-95 transition-all border-b-4 border-copper-dark"
                    >
                      UNSET THE SUN (K 150/mo)
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
                <div className="bg-silk p-6 rounded-3xl border-2 border-copper/10 italic relative group">
                  <p className="text-charcoal text-lg font-medium leading-relaxed">
                    <MirrorText text={`"${wisdom?.personalized_feedback || wisdom?.tutor_hint}"`} />
                  </p>
                  {wisdom?.english_translation && (
                    <p className="text-xs font-bold text-charcoal/40 mt-2">
                      {wisdom.english_translation}
                    </p>
                  )}
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-silk border-r-2 border-b-2 border-copper/10 rotate-45"></div>
                </div>

                <div className="py-2">
                  <p className="text-[10px] font-black text-copper uppercase tracking-widest mb-1">
                    {wisdom?.tone_map ? 'Linguistic Tone Map' : 'Linguistic Insight'}
                  </p>
                  <p className="text-sm font-bold text-success italic">
                    <MirrorText text={`"${wisdom?.tone_map || wisdom?.proverb_in_nyanja}"`} />
                  </p>
                </div>

                <div className="flex flex-col gap-3 pt-4 w-full">
                  <button 
                    onMouseDown={() => setIsRecording(true)}
                    onMouseUp={() => setIsRecording(false)}
                    onMouseLeave={() => setIsRecording(false)}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-black transition-all hover:scale-105 ${
                      isRecording 
                        ? 'bg-rose-500 text-white animate-pulse' 
                        : 'bg-copper text-white border-b-4 border-copper-dark hover:brightness-110 active:scale-95'
                    }`}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 005.93 6.93V17H7a1 1 0 100 2h6a1 1 0 100-2h-1.93v-2.07z"/></svg>
                    {isRecording ? 'Listening...' : 'Practice Oral Concord'}
                  </button>
                  
                  <button 
                    onClick={onClose}
                    className="text-xs font-black text-charcoal/40 uppercase tracking-widest py-2 hover:text-copper transition-colors"
                  >
                    Duly noted, Bulela
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <UpgradeModal isOpen={isPricingOpen} onClose={() => setIsPricingOpen(false)} />
    </>
  );
};

export default BulelaTutor;
