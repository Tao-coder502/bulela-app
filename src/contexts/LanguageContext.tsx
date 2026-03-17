import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { LanguageDNA } from '../types';
import { LinguisticRegistry } from '../services/LinguisticRegistry';

interface LanguageContextType {
  currentLang: string;
  languageDNA: LanguageDNA;
  setLanguage: (langId: string) => void;
  isRecompiling: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLang, setCurrentLangState] = useState('nyanja');
  const [languageDNA, setLanguageDNA] = useState<LanguageDNA>(LinguisticRegistry.nyanja);
  const [isRecompiling, setIsRecompiling] = useState(false);

  const setLanguage = (langId: string) => {
    const dna = LinguisticRegistry[langId];
    if (dna) {
      setIsRecompiling(true);
      setCurrentLangState(langId);
      setLanguageDNA(dna);
      
      // Simulate recompile delay for the "Hot-Swap" effect
      setTimeout(() => {
        setIsRecompiling(false);
      }, 800);
    }
  };

  return (
    <LanguageContext.Provider value={{ currentLang, languageDNA, setLanguage, isRecompiling }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
