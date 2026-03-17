import React from 'react';
import { motion } from 'motion/react';
import { Snowflake, Heart, Gem, Coins, Zap } from 'lucide-react';

const ShopView: React.FC = () => {
  const shopItems = [
    { 
      name: 'Streak Freeze', 
      description: 'Protect your streak for one day of inactivity.',
      price: 200, 
      icon: Snowflake, 
      color: 'text-candy-blue',
      bgColor: 'bg-candy-blue/10'
    },
    { 
      name: 'Refill Hearts', 
      description: 'Get back to full health and keep learning.',
      price: 400, 
      icon: Heart, 
      color: 'text-candy-red',
      bgColor: 'bg-candy-red/10'
    },
    { 
      name: 'Double or Nothing', 
      description: 'Wager 50 Kwacha to win 100 if you maintain a 7-day streak.',
      price: 50, 
      icon: Gem, 
      color: 'text-candy-yellow',
      bgColor: 'bg-candy-yellow/10'
    },
    { 
      name: 'XP Booster', 
      description: 'Earn double XP for the next 15 minutes.',
      price: 150, 
      icon: Zap, 
      color: 'text-candy-orange',
      bgColor: 'bg-candy-orange/10'
    },
  ];

  return (
    <div className="flex flex-col items-center py-12 px-4 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-3xl font-black text-bulela-green uppercase tracking-tight">
            Bulela Shop
          </h1>
          <div className="flex items-center gap-2 bg-white border-2 border-gray-100 rounded-2xl px-4 py-2 shadow-sm">
            <Coins className="text-candy-yellow" size={24} fill="currentColor" />
            <span className="text-xl font-black">450 Kwacha</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {shopItems.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div 
                key={i}
                whileHover={{ scale: 1.02 }}
                className="bento-card flex flex-col justify-between"
              >
                <div className="flex gap-6 mb-6">
                  <div className={`w-20 h-20 shrink-0 rounded-[1.5rem] flex items-center justify-center border-2 border-white shadow-sm ${item.bgColor}`}>
                    <Icon size={40} className={item.color} fill={item.name === 'Refill Hearts' ? 'currentColor' : 'none'} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-1">{item.name}</h3>
                    <p className="text-gray-400 font-bold text-sm leading-tight">
                      {item.description}
                    </p>
                  </div>
                </div>

                <button className="w-full btn-isometric btn-isometric-green flex items-center justify-center gap-2 py-4">
                  <Coins size={20} fill="currentColor" />
                  <span>{item.price} Kwacha</span>
                </button>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 p-8 bg-bulela-green text-white rounded-[2rem] border-b-4 border-bulela-green-dark shadow-lg relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border-2 border-white/20">
              <Gem size={48} className="text-candy-yellow" fill="currentColor" />
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-black mb-2">Bulela Plus</h2>
              <p className="text-white/60 font-bold mb-4">
                Unlimited hearts, no ads, and exclusive cultural missions.
              </p>
              <button className="btn-isometric btn-isometric-honey">
                Upgrade Now
              </button>
            </div>
          </div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl" />
        </div>
      </motion.div>
    </div>
  );
};

export default ShopView;
