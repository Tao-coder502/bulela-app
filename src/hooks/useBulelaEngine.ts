import { useState, useEffect } from 'react';
import { useBulelaStore } from '../store/useBulelaStore';

export const useBulelaEngine = () => {
  const { currentLanguage } = useBulelaStore();
  const [isRecompiling, setIsRecompiling] = useState(false);

  useEffect(() => {
    setIsRecompiling(true);
    const timer = setTimeout(() => {
      setIsRecompiling(false);
    }, 800);
    return () => clearTimeout(timer);
  }, [currentLanguage]);

  return {
    isRecompiling
  };
};
