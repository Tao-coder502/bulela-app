import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLessonEngine } from '../hooks/useLessonEngine';
import { useBulelaStore } from '../store/useBulelaStore';
import { CheckCircle2, XCircle, ArrowRight, HelpCircle } from 'lucide-react';
import BulelaMascot from './BulelaMascot';
import BulelaBubble from './BulelaBubble';

interface Props {
  lessonId: string;
  onComplete: (score: number) => void;
}

const SortingGame: React.FC<Props> = ({ lessonId, onComplete }) => {
  const { 
    content, 
    loading, 
    currentItem, 
    progress, 
    score, 
    isComplete, 
    submitAnswer 
  } = useLessonEngine(lessonId);
  
  const { recommendedAction, currentSentiment } = useBulelaStore();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [showHint, setShowHint] = useState(false);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[400px]">
      <div className="w-16 h-16 border-4 border-bulela-green border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-black text-bulela-green uppercase tracking-widest">Loading Lesson...</p>
    </div>
  );

  if (!content || !currentItem) return null;

  const handleCategorySelect = async (categoryId: number) => {
    if (feedback) return;
    
    setSelectedCategory(categoryId);
    const isCorrect = await submitAnswer(currentItem.id, categoryId);
    setFeedback(isCorrect ? 'correct' : 'wrong');

    setTimeout(() => {
      setFeedback(null);
      setSelectedCategory(null);
      setShowHint(false);
      
      if (isComplete) {
        onComplete(score + (isCorrect ? 1 : 0));
      }
    }, 1500);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-8">
      {/* Progress Bar */}
      <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
        <motion.div 
          className="h-full bg-bulela-green"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-black text-charcoal italic">{content.title}</h2>
        <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">{content.description}</p>
      </div>

      {/* Game Area */}
      <div className="relative bg-white rounded-[3rem] p-12 border-4 border-copper/10 shadow-xl overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentItem.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="flex flex-col items-center space-y-8"
          >
            <div className="text-center space-y-4">
              <span className="text-[10px] font-black text-copper uppercase tracking-[0.3em]">Sort this word</span>
              <h3 className="text-5xl font-black text-bulela-green tracking-tighter italic">
                {currentItem.text}
              </h3>
              {currentItem.translation && (
                <p className="text-gray-400 font-bold italic">"{currentItem.translation}"</p>
              )}
            </div>

            {/* Hint Section (Sentiment Aware) */}
            {(showHint || recommendedAction === 'SHOW_HINT') && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-honey/10 border-2 border-honey/20 p-4 rounded-2xl text-honey text-sm font-bold italic flex items-center gap-3"
              >
                <HelpCircle size={20} />
                <span>Hint: {currentItem.hint || "Think about the prefix of the word."}</span>
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
              {content.categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                let btnClass = "relative py-6 px-8 rounded-2xl border-4 font-black text-xl transition-all flex items-center justify-between ";
                
                if (isSelected) {
                  btnClass += feedback === 'correct' 
                    ? "bg-candy-green/10 border-candy-green text-candy-green scale-105" 
                    : "bg-candy-red/10 border-candy-red text-candy-red animate-shake";
                } else {
                  btnClass += "bg-silk border-copper/10 text-charcoal hover:border-amber-copper hover:scale-[1.02]";
                }

                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    disabled={!!feedback}
                    className={btnClass}
                  >
                    <span>{cat.name}</span>
                    {isSelected && feedback === 'correct' && <CheckCircle2 size={24} />}
                    {isSelected && feedback === 'wrong' && <XCircle size={24} />}
                  </button>
                );
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback Overlay */}
        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={`absolute inset-0 flex items-center justify-center z-20 pointer-events-none ${
                feedback === 'correct' ? 'bg-candy-green/5' : 'bg-candy-red/5'
              }`}
            >
              <motion.div
                initial={{ scale: 0.5, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                className={`text-8xl ${feedback === 'correct' ? 'text-candy-green' : 'text-candy-red'}`}
              >
                {feedback === 'correct' ? '✓' : '✗'}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Mascot */}
      <div className="flex items-center justify-center gap-6 pt-8">
        <BulelaMascot 
          mood={feedback === 'correct' ? 'happy' : feedback === 'wrong' ? 'sad' : currentSentiment === 'FRICTION' ? 'thinking' : 'float'} 
          className="w-24 h-24" 
        />
        <div className="flex-1">
          <BulelaBubble 
            message={feedback === 'correct' ? "Supa! You're getting it." : feedback === 'wrong' ? "Don't worry, try to focus on the prefix." : "Which class does this belong to?"} 
            visible={true}
          />
        </div>
      </div>
    </div>
  );
};

export default SortingGame;
