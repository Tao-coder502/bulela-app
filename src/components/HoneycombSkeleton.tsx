
import React from 'react';

const HoneycombSkeleton: React.FC = () => {
  const skeletonItems = Array.from({ length: 5 });

  return (
    <div className="flex flex-col items-center py-12 space-y-12 max-w-md mx-auto relative animate-pulse">
      {/* Path Connector Skeleton */}
      <div className="absolute inset-0 pointer-events-none flex justify-center">
        <svg className="w-full h-full opacity-5" viewBox="0 0 100 800" preserveAspectRatio="none">
          <path
            d="M50,0 Q80,100 50,200 Q20,300 50,400 Q80,500 50,600 Q20,700 50,800"
            fill="none"
            stroke="#FB923C"
            strokeWidth="4"
            strokeDasharray="10 5"
          />
        </svg>
      </div>

      {skeletonItems.map((_, index) => {
        const offset = index % 2 === 0 ? 'mr-12' : 'ml-12';
        return (
          <div key={index} className={`flex flex-col items-center ${offset} relative z-10`}>
            {/* Hexagonal Node Skeleton */}
            <div 
              className="w-20 h-20 bg-espresso-card border-b-4 border-bronze/20 shadow-inner"
              style={{
                clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
              }}
            >
              <div className="w-full h-full bg-gradient-to-br from-white/5 to-transparent opacity-20"></div>
            </div>
            
            {/* Title Skeleton */}
            <div className="mt-4 w-24 h-3 bg-espresso-card rounded-full opacity-40"></div>
            <div className="mt-2 w-16 h-2 bg-espresso-card rounded-full opacity-20"></div>
          </div>
        );
      })}
    </div>
  );
};

export default HoneycombSkeleton;
