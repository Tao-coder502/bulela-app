import React from 'react';
import BulelaMascot from './BulelaMascot';

interface Props {
  onDevBypass: () => void;
}

const WelcomeScreen: React.FC<Props> = ({ onDevBypass }) => {
  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center p-6 text-center">
      <BulelaMascot mood="wave" className="w-48 h-48 mb-8" />
      <h1 className="text-5xl font-black text-bulela-green mb-4 tracking-tighter">
        BULELA
      </h1>
      <p className="text-xl text-gray-600 mb-12 max-w-md font-bold">
        Master Zambian languages with your AI cultural tutor.
      </p>
      <div className="flex flex-col gap-4 w-full max-w-xs">
        <button className="btn-isometric btn-isometric-green w-full py-4 text-xl">
          GET STARTED
        </button>
        <button 
          onClick={onDevBypass}
          className="text-gray-400 font-bold hover:text-bulela-green transition-colors"
        >
          Dev Bypass
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
