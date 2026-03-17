import React from 'react';

interface Props {
  mood?: 'happy' | 'thinking' | 'float' | 'wave';
  className?: string;
}

const BulelaMascot: React.FC<Props> = ({ mood = 'happy', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="40" fill="#FB923C" />
        <circle cx="35" cy="40" r="5" fill="black" />
        <circle cx="65" cy="40" r="5" fill="black" />
        <path d="M 35 65 Q 50 75 65 65" stroke="black" strokeWidth="3" fill="none" />
        <ellipse cx="20" cy="40" rx="15" ry="10" fill="rgba(255,255,255,0.5)" />
        <ellipse cx="80" cy="40" rx="15" ry="10" fill="rgba(255,255,255,0.5)" />
      </svg>
    </div>
  );
};

export default BulelaMascot;
