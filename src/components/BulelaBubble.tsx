import React from 'react';

interface Props {
  message: string;
  visible?: boolean;
  children?: React.ReactNode;
}

const BulelaBubble: React.FC<Props> = ({ message, visible = true, children }) => {
  if (!visible) return null;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 shadow-sm relative">
      <div className="absolute -left-3 top-8 w-6 h-6 bg-white border-l-2 border-b-2 border-gray-200 rotate-45" />
      <div className="relative z-10 font-bold text-gray-700">
        {message || children}
      </div>
    </div>
  );
};

export default BulelaBubble;
