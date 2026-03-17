import React, { useState } from 'react';
import { PlacementMission, ProficiencyPath, PlacementResult } from '../types';
import { PlacementOrchestrator } from '../services/PlacementOrchestrator';
import { motion, AnimatePresence } from 'motion/react';
import BulelaMascot from './BulelaMascot';

interface Props {
  mission: PlacementMission;
  onComplete: (path: ProficiencyPath) => void;
}

const PlacementMissionView: React.FC<Props> = ({ mission, onComplete }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [results, setResults] = useState<PlacementResult[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const currentStep = mission.steps[currentStepIndex];

  const handleOptionClick = (option: string) => {
    if (selectedOption) return;
    setSelectedOption(option);
    const correct = option === currentStep.correctAnswer;
    setIsCorrect(correct);
    
    const newResults = [...results, { id: currentStep.id, isCorrect: correct }];
    setResults(newResults);

    setTimeout(() => {
      if (!correct && currentStep.onWrongPath) {
        // If wrong and we have a definitive path, end mission
        onComplete(currentStep.onWrongPath);
      } else if (currentStepIndex < mission.steps.length - 1) {
        // Continue to next step
        setCurrentStepIndex(currentStepIndex + 1);
        setSelectedOption(null);
        setIsCorrect(null);
      } else {
        // Final step completed
        const finalPath = PlacementOrchestrator.getInitialTier(newResults);
        onComplete(finalPath);
      }
    }, 1500);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-6 bg-white dark:bg-espresso rounded-3xl shadow-xl border-2 border-copper/10">
      <div className="mb-8">
        <BulelaMascot mood={isCorrect === false ? 'sad' : isCorrect === true ? 'happy' : 'float'} className="w-32 h-32" />
      </div>

      <div className="w-full max-w-md text-center space-y-6">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-amber-copper uppercase tracking-[0.2em]">Placement Mission: Step {currentStepIndex + 1}/3</p>
          <h2 className="text-2xl font-black text-charcoal dark:text-white leading-tight">
            {currentStep.task}
          </h2>
        </div>

        <div className="grid gap-3">
          {currentStep.options.map((option) => {
            const isSelected = selectedOption === option;
            const isOptionCorrect = option === currentStep.correctAnswer;
            
            let buttonClass = "w-full py-4 px-6 rounded-2xl font-bold text-lg transition-all border-2 ";
            if (isSelected) {
              buttonClass += isOptionCorrect 
                ? "bg-success/10 border-success text-success shadow-lg shadow-success/20" 
                : "bg-rose-500/10 border-rose-500 text-rose-500 shadow-lg shadow-rose-500/20";
            } else {
              buttonClass += "bg-silk dark:bg-midnight-card border-copper/10 text-charcoal dark:text-white hover:border-amber-copper/40 hover:scale-[1.02]";
            }

            return (
              <button
                key={option}
                onClick={() => handleOptionClick(option)}
                disabled={!!selectedOption}
                className={buttonClass}
              >
                {option}
              </button>
            );
          })}
        </div>

        <div className="flex justify-center gap-2 pt-4">
          {mission.steps.map((_, idx) => (
            <div 
              key={idx} 
              className={`h-1.5 rounded-full transition-all duration-500 ${
                idx === currentStepIndex ? 'w-8 bg-amber-copper' : 
                idx < currentStepIndex ? 'w-4 bg-success' : 'w-4 bg-copper/20'
              }`} 
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlacementMissionView;
