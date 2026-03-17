import React from 'react';
import { motion } from 'motion/react';
import { Zap, BookOpen, Star, Trophy, ScrollText } from 'lucide-react';

const QuestView: React.FC = () => {
  const quests = [
    { 
      id: 'xp', 
      label: 'Earn 50 XP', 
      progress: 30, 
      goal: 50, 
      icon: Zap, 
      color: 'text-candy-orange',
      reward: 10 
    },
    { 
      id: 'lesson', 
      label: 'Complete 1 Lesson', 
      progress: 0, 
      goal: 1, 
      icon: BookOpen, 
      color: 'text-bulela-green',
      reward: 5 
    },
    { 
      id: 'perfect', 
      label: 'Perfect Lesson', 
      progress: 0, 
      goal: 1, 
      icon: Star, 
      color: 'text-candy-yellow',
      reward: 20 
    },
  ];

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="flex items-center gap-4 mb-12">
          <div className="w-16 h-16 bg-candy-yellow/10 rounded-2xl flex items-center justify-center border-2 border-candy-yellow/20">
            <ScrollText className="text-candy-yellow" size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-bulela-green uppercase tracking-tight">
              Daily Quests
            </h1>
            <p className="text-gray-400 font-bold">
              Complete these challenges to earn extra Kwacha!
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          {quests.map((quest, i) => {
            const Icon = quest.icon;
            const progressPercent = (quest.progress / quest.goal) * 100;
            
            return (
              <motion.div 
                key={quest.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bento-card p-8 flex flex-col md:flex-row items-center gap-8"
              >
                <div className={`w-16 h-16 shrink-0 rounded-2xl flex items-center justify-center border-2 border-gray-100 shadow-sm bg-gray-50`}>
                  <Icon size={32} className={quest.color} fill={quest.id === 'perfect' ? 'currentColor' : 'none'} />
                </div>

                <div className="flex-1 w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-black">{quest.label}</h3>
                    <div className="flex items-center gap-1 text-candy-yellow font-black">
                      <Trophy size={16} fill="currentColor" />
                      <span>+{quest.reward} Kwacha</span>
                    </div>
                  </div>

                  <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden border-2 border-gray-200">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-candy-yellow shadow-[inset_0_-4px_0_rgba(0,0,0,0.1)]"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-black text-bulela-green/60">
                      {quest.progress} / {quest.goal}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center p-8 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-200">
          <h3 className="text-xl font-black text-gray-400 mb-2">Weekly Challenge</h3>
          <p className="text-gray-300 font-bold max-w-sm mx-auto">
            Complete 15 daily quests this week to unlock a special Copperbelt badge!
          </p>
          <div className="mt-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5, 6, 7].map(day => (
              <div key={day} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white shadow-sm" />
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuestView;
