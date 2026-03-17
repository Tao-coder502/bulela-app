import React from 'react';

const Loader: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] gap-4">
      <div className="w-12 h-12 border-4 border-bulela-green border-t-transparent rounded-full animate-spin" />
      <p className="text-bulela-green font-black animate-pulse uppercase tracking-widest text-sm">
        Loading Honey...
      </p>
    </div>
  );
};

export default Loader;
