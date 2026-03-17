import React from 'react';
import { motion } from 'motion/react';
import { Inbox, Zap } from 'lucide-react';

const PracticeView: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 max-w-2xl mx-auto text-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <h1 className="text-3xl font-black text-bulela-green mb-8 uppercase tracking-tight">
          Practice Hub
        </h1>

        <div className="bento-card p-12 flex flex-col items-center gap-6 mb-8">
          <div className="w-24 h-24 bg-gray-50 rounded-[2rem] flex items-center justify-center border-2 border-gray-100 shadow-inner">
            <Inbox size={48} className="text-gray-300" />
          </div>
          
          <div>
            <h2 className="text-2xl font-black mb-2">Mistakes Inbox</h2>
            <p className="text-gray-400 font-bold">
              Review and master the words you missed in previous lessons.
            </p>
          </div>

          <div className="bg-cream rounded-2xl p-6 w-full border-2 border-dashed border-gray-200">
            <p className="text-bulela-green/60 font-black italic">
              "Your inbox is empty! You're mastering the language like a pro."
            </p>
          </div>
        </div>

        <button className="w-full btn-isometric btn-isometric-green py-6 text-xl">
          <Zap className="mr-2" size={24} fill="currentColor" />
          RE-PRACTICE
        </button>
        
        <p className="mt-6 text-gray-400 font-bold text-sm uppercase tracking-widest">
          Earn +10 XP for every mistake corrected
        </p>
      </motion.div>
    </div>
  );
};

export default PracticeView;
