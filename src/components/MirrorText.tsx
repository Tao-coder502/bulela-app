import React from 'react';

interface Props {
  text: string;
  className?: string;
}

const MirrorText: React.FC<Props> = ({ text, className = '' }) => {
  return (
    <div className={`relative group ${className}`}>
      <span className="relative z-10">{text}</span>
      <span className="absolute inset-0 text-bulela-green/20 blur-[2px] translate-y-1 group-hover:translate-y-2 transition-transform">
        {text}
      </span>
    </div>
  );
};

export default MirrorText;
