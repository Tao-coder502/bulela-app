import React from 'react';
import { motion } from 'motion/react';
import { Plus } from 'lucide-react';
import { useBulelaStore } from '@/store/useBulelaStore';
import { LinguisticRegistry } from '@/services/LinguisticRegistry';

interface CourseSwitcherProps {
  onClose: () => void;
}

export const CourseSwitcher: React.FC<CourseSwitcherProps> = ({ onClose }) => {
  const { currentLanguage, setLanguage } = useBulelaStore();
  
  const languages = Object.values(LinguisticRegistry);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      className="absolute top-full left-0 mt-4 w-[280px] bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-[100] overflow-hidden"
    >
      <div className="p-2 flex flex-col">
        <div className="max-h-64 overflow-y-auto scrollbar-hide py-1">
          {languages.map((lang) => {
            const isActive = currentLanguage === lang.id;
            return (
              <button
                key={lang.id}
                onClick={() => {
                  setLanguage(lang.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all font-bold text-[15px] mb-1
                  ${isActive 
                    ? 'bg-blue-50 text-blue-500' 
                    : 'text-[#4B4B4B] hover:bg-gray-100'}
                `}
              >
                <div className="w-10 h-8 rounded-md overflow-hidden border border-gray-200 shrink-0">
                  <img 
                    src={`https://picsum.photos/seed/${lang.id}/100/100`} 
                    alt={lang.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
                <span className="truncate">{lang.name}</span>
              </button>
            );
          })}
        </div>

        <div className="h-[2px] bg-gray-100 my-1 mx-2" />

        <button className="flex items-center gap-4 px-4 py-4 rounded-xl hover:bg-gray-50 transition-all text-gray-400 font-bold uppercase text-[13px] tracking-widest border-2 border-dashed border-gray-100 m-1">
          <div className="w-10 h-8 rounded-md bg-gray-50 flex items-center justify-center border border-gray-200 shrink-0">
            <Plus size={20} />
          </div>
          <span>Add a new course</span>
        </button>
      </div>
    </motion.div>
  );
};
