import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { LinguisticRegistry } from '../services/LinguisticRegistry';
import { motion } from 'motion/react';

const LanguageSwitcher: React.FC = () => {
  const { currentLang, setLanguage } = useLanguage();

  const handleAddNew = () => {
    // Styled but triggers Coming Soon
    alert("New Language DNA Ingestion: Coming Soon to the Bulela Developer Portal!");
  };

  return (
    <div className="p-6 bg-[#1A0F05] border-2 border-[#FB923C]/10 rounded-[2rem] space-y-4 shadow-2xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-[10px] font-black text-[#FB923C] uppercase tracking-[0.2em]">Universal Engine</h3>
        <span className="text-[8px] font-mono text-white/20">v3.0 REGISTRY</span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {Object.values(LinguisticRegistry).map((lang) => (
          <button
            key={lang.id}
            onClick={() => setLanguage(lang.id)}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all group ${
              currentLang === lang.id
                ? 'bg-[#FB923C]/10 border-[#FB923C] text-white'
                : 'bg-white/5 border-white/5 text-white/40 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${currentLang === lang.id ? 'bg-[#FB923C] animate-pulse' : 'bg-white/10'}`} />
              <div className="text-left">
                <p className="text-sm font-black uppercase tracking-tight">{lang.name}</p>
                <p className="text-[9px] font-bold opacity-60 italic">{lang.culturalPivot} Pivot</p>
              </div>
            </div>
            {currentLang === lang.id && (
              <motion.span 
                layoutId="active-indicator"
                className="text-[10px] font-black text-[#FB923C]"
              >
                ACTIVE
              </motion.span>
            )}
          </button>
        ))}

        <button
          onClick={handleAddNew}
          className="w-full py-4 border-2 border-dashed border-white/10 rounded-2xl text-white/20 font-black text-[10px] uppercase tracking-widest hover:border-[#FB923C]/40 hover:text-[#FB923C]/60 transition-all"
        >
          + Add New DNA
        </button>
      </div>

      <div className="pt-2">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <p className="text-[8px] font-mono text-white/40 leading-relaxed">
            <span className="text-[#FB923C]">DNA_LOADED:</span> {LinguisticRegistry[currentLang].name.toUpperCase()}_V3<br/>
            <span className="text-[#FB923C]">PREFIX:</span> {LinguisticRegistry[currentLang].respectPrefix}<br/>
            <span className="text-[#FB923C]">GREETING:</span> {LinguisticRegistry[currentLang].greeting}
          </p>
        </div>
      </div>
    </div>
  );
};

export default LanguageSwitcher;
