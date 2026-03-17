import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Star, Shield } from 'lucide-react';

const LeaderboardView: React.FC = () => {
  const leaderboardData = [
    { name: 'Chanda', xp: 2450, rank: 1 },
    { name: 'Mwansa', xp: 2100, rank: 2 },
    { name: 'Bwalya', xp: 1950, rank: 3 },
    { name: 'You', xp: 1250, rank: 4, isUser: true },
    { name: 'Mulenga', xp: 1100, rank: 5 },
    { name: 'Lombe', xp: 950, rank: 6 },
    { name: 'Sampa', xp: 800, rank: 7 },
    { name: 'Kunda', xp: 750, rank: 8 },
    { name: 'Chisenga', xp: 600, rank: 9 },
    { name: 'Mumba', xp: 450, rank: 10 },
  ];

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* LEAGUE HEADER */}
        <div className="bg-gradient-to-br from-amber-600 to-amber-800 text-white rounded-[2rem] p-8 mb-12 relative overflow-hidden shadow-lg border-b-4 border-amber-900">
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4 backdrop-blur-sm border-2 border-white/30">
              <Shield size={48} fill="white" />
            </div>
            <h2 className="text-xl font-black opacity-80 uppercase tracking-widest mb-1">
              Bronze Tier
            </h2>
            <h1 className="text-4xl font-black mb-2">
              Copperbelt League
            </h1>
            <p className="text-white/60 font-bold">
              Top 10 advance to Silver League!
            </p>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        </div>

        {/* RANKINGS TABLE */}
        <div className="bento-card overflow-hidden p-0">
          <div className="p-6 border-b-2 border-gray-100 bg-gray-50 flex justify-between items-center">
            <h3 className="text-xl font-black uppercase tracking-tight">Rankings</h3>
            <div className="flex items-center gap-2 text-gray-400 font-bold text-sm">
              <Trophy size={16} />
              <span>Ends in 3d 12h</span>
            </div>
          </div>

          <div className="flex flex-col">
            {leaderboardData.map((player) => (
              <div 
                key={player.rank}
                className={`flex items-center gap-4 p-4 border-b-2 border-gray-50 transition-colors ${
                  player.isUser ? 'bg-honey/10' : 'hover:bg-gray-50'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${
                  player.rank === 1 ? 'text-candy-yellow' : 
                  player.rank === 2 ? 'text-gray-400' : 
                  player.rank === 3 ? 'text-amber-600' : 'text-gray-300'
                }`}>
                  {player.rank}
                </div>
                
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                  <img 
                    src={`https://picsum.photos/seed/${player.name}/100/100`} 
                    alt={player.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <span className={`font-black text-lg ${player.isUser ? 'text-honey' : 'text-bulela-green'}`}>
                    {player.name} {player.isUser && '(You)'}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-candy-orange font-black">
                  <Star size={18} fill="currentColor" />
                  <span>{player.xp} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">
            Keep learning to climb the ranks!
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LeaderboardView;
