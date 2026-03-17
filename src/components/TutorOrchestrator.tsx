import React, { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useBulelaEngine } from '../hooks/useBulelaEngine';
import { useBulelaStore } from '../store/useBulelaStore';
import { BulelaMission, MissionCard, ProficiencyPath } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  currentMission?: BulelaMission | null;
  onMissionUpdate?: (updatedMission: BulelaMission) => void;
}

/**
 * TutorOrchestrator Component
 * Synchronizes the LanguageSwitcher with the Tutor Engine and Missions.
 */
export const TutorOrchestrator: React.FC<Props> = ({ currentMission, onMissionUpdate }) => {
  const { currentLang, languageDNA } = useLanguage();
  const { isRecompiling } = useBulelaEngine();
  const { setTutorWisdom } = useBulelaStore();
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  useEffect(() => {
    // RECOMPILE Action: Watch the language state
    if (isRecompiling) return;

    console.log(`[TutorOrchestrator] Language switched to: ${currentLang}`);

    if (currentLang === 'bemba' && currentMission) {
      // Immediately map current MissionCard content to 'CHIKONDI' for Bemba
      const updatedCards = currentMission.practice_cards.map(card => {
        const bembaText = card.difficulty_mapping['CHIKONDI'];
        
        // Logic Guard: If mission does not exist in the target language
        if (!bembaText) {
          setFallbackMessage("Our linguists are currently verifying this mission's DNA in Bemba.");
          return card;
        }
        
        setFallbackMessage(null);
        return {
          ...card,
          nyanja_text: bembaText // Hot-swap the text
        };
      });

      if (onMissionUpdate) {
        onMissionUpdate({
          ...currentMission,
          practice_cards: updatedCards
        });
      }
    } else if (currentLang === 'nyanja' && currentMission) {
      // Revert to Nyanja (original text)
      // In a real app, we'd store the original Nyanja text separately
      setFallbackMessage(null);
    }
  }, [currentLang, isRecompiling, currentMission, onMissionUpdate]);

  return (
    <AnimatePresence mode="wait">
      {isRecompiling ? (
        <motion.div
          key="recompiling"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="flex flex-col items-center justify-center py-12 space-y-4"
        >
          <div className="w-12 h-12 border-4 border-[#FB923C]/20 border-t-[#FB923C] rounded-full animate-spin" />
          <p className="text-[#FB923C] font-black text-[10px] uppercase tracking-[0.3em] animate-pulse">
            RECOMPILING LINGUISTIC DNA...
          </p>
        </motion.div>
      ) : (
        <motion.div
          key={`ready-${currentLang}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1,
            y: 0,
            textShadow: ["0 0 0px rgba(251,146,60,0)", "0 0 20px rgba(251,146,60,0.4)", "0 0 0px rgba(251,146,60,0)"]
          }}
          transition={{ 
            duration: 0.8,
            ease: "easeOut"
          }}
          className="w-full"
        >
          {fallbackMessage && (
            <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl mb-4">
              <p className="text-rose-500 text-xs font-bold italic text-center">
                {fallbackMessage}
              </p>
            </div>
          )}
          
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-[#FB923C] rounded-full shadow-[0_0_10px_#FB923C]" />
              <span className="text-[10px] font-black text-[#FB923C] uppercase tracking-widest">
                Engine: {languageDNA.name} Active
              </span>
            </div>
            <span className="text-[8px] font-mono text-white/20 uppercase">
              Prefix: {languageDNA.respectPrefix}
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
