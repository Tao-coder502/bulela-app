import React from 'react';
import { motion } from 'motion/react';
import { Award, Globe } from 'lucide-react';

interface MorePopoverProps {
  onClose: () => void;
}

export const MorePopover: React.FC<MorePopoverProps> = ({ onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute bottom-full left-0 w-[240px] mb-4 bg-white border-2 border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="p-2 flex flex-col">
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all text-[#4B4B4B] font-bold uppercase text-[15px] tracking-wide">
          <Award className="text-candy-green" size={24} />
          <span>Bulela Certificate</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-all text-[#4B4B4B] font-bold uppercase text-[15px] tracking-wide">
          <Globe className="text-candy-blue" size={24} />
          <span>Schools</span>
        </button>
        
        <div className="h-[2px] bg-gray-200 my-2 mx-2" />
        
        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition-all text-[#4B4B4B] font-bold uppercase text-[15px] tracking-wide">
          Settings
        </button>
        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-gray-100 transition-all text-[#4B4B4B] font-bold uppercase text-[15px] tracking-wide">
          Help
        </button>
        <button className="w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 hover:text-red-500 transition-all text-[#4B4B4B] font-bold uppercase text-[15px] tracking-wide">
          Log Out
        </button>
      </div>
    </motion.div>
  );
};
