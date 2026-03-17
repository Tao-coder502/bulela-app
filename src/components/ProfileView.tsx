import React from 'react';
import { motion } from 'motion/react';
import { 
  Trophy, 
  Zap, 
  Shield, 
  Lock, 
  Download, 
  Award, 
  TrendingUp, 
  Mic, 
  BookOpen,
  CheckCircle2
} from 'lucide-react';
import { useBulelaStore } from '@/store/useBulelaStore';
import { 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  ResponsiveContainer 
} from 'recharts';

const masteryData = [
  { subject: 'Class 1 (People)', A: 85, fullMark: 100 },
  { subject: 'Class 2 (Plants)', A: 65, fullMark: 100 },
  { subject: 'Class 3 (Objects)', A: 90, fullMark: 100 },
  { subject: 'Class 4 (Abstract)', A: 70, fullMark: 100 },
  { subject: 'Class 5 (Places)', A: 80, fullMark: 100 },
  { subject: 'Class 6 (Actions)', A: 75, fullMark: 100 },
];

const Badge: React.FC<{ icon: React.ReactNode; label: string; unlocked: boolean }> = ({ icon, label, unlocked }) => (
  <div className={`flex flex-col items-center gap-2 ${unlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center border-2 ${unlocked ? 'bg-honey/10 border-honey text-honey' : 'bg-gray-100 border-gray-200 text-gray-400'}`}>
      {icon}
    </div>
    <span className="text-xs font-black uppercase tracking-tighter text-center max-w-[80px] leading-none">
      {label}
    </span>
  </div>
);

const ProfileView: React.FC = () => {
  const { user, isPro, setPricingOpen, languageDNA } = useBulelaStore();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* TOP SECTION: USER HEADER & STATS */}
        <div className="bento-card flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-honey p-1 bg-white shadow-xl overflow-hidden">
              <img 
                src={`https://picsum.photos/seed/${user.id}/200/200`} 
                alt={user.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            {isPro && (
              <div className="absolute -bottom-2 -right-2 bg-honey text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 border-white shadow-lg">
                Premium
              </div>
            )}
          </div>

          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-bulela-green mb-1 uppercase tracking-tight">
              {user.name}
            </h1>
            <p className="text-gray-400 font-bold mb-6">
              Learning {languageDNA.name} • {user.learnerTier} Tier
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
                <div className="flex items-center gap-2 text-candy-orange mb-1">
                  <Zap size={18} fill="currentColor" />
                  <span className="text-xl font-black">{user.streak}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Day Streak</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
                <div className="flex items-center gap-2 text-candy-yellow mb-1">
                  <Trophy size={18} fill="currentColor" />
                  <span className="text-xl font-black">{user.xp}</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total XP</span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-100">
                <div className="flex items-center gap-2 text-candy-blue mb-1">
                  <Shield size={18} fill="currentColor" />
                  <span className="text-xl font-black">Bronze</span>
                </div>
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">League</span>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: ACHIEVEMENTS */}
        <div className="bento-card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tight">Achievements</h2>
            <button className="text-honey font-black text-sm uppercase tracking-widest hover:underline">View All</button>
          </div>
          
          <div className="flex flex-wrap justify-around gap-8">
            <Badge icon={<Award size={32} />} label="First Steps" unlocked={true} />
            <Badge icon={<Zap size={32} />} label="Streak Starter" unlocked={true} />
            <Badge icon={<BookOpen size={32} />} label="Scholar" unlocked={user.completedLessons.length > 5} />
            <Badge icon={<Shield size={32} />} label="Protector" unlocked={user.streakFreezeCount > 0} />
            <Badge icon={<TrendingUp size={32} />} label="Climber" unlocked={user.xp > 1000} />
          </div>
        </div>

        {/* BOTTOM SECTION: AI INSIGHTS (DUAL STATE) */}
        {!isPro ? (
          <div className="relative group">
            {/* BLURRED OVERLAY FOR FREE TIER */}
            <div className="bento-card overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black uppercase tracking-tight">AI Learning Insights</h2>
                <div className="flex items-center gap-2 text-honey font-black">
                  <Lock size={20} />
                  <span className="text-sm uppercase tracking-widest">Premium Only</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 filter blur-md pointer-events-none select-none opacity-40">
                <div className="h-64 bg-gray-100 rounded-3xl" />
                <div className="space-y-4">
                  <div className="h-20 bg-gray-100 rounded-2xl" />
                  <div className="h-20 bg-gray-100 rounded-2xl" />
                  <div className="h-20 bg-gray-100 rounded-2xl" />
                </div>
              </div>
            </div>

            {/* UPGRADE CTA */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-2 border-honey text-center max-w-sm"
              >
                <div className="w-16 h-16 bg-honey/10 rounded-full flex items-center justify-center mx-auto mb-4 text-honey">
                  <TrendingUp size={32} />
                </div>
                <h3 className="text-2xl font-black mb-2">Unlock Your Potential</h3>
                <p className="text-gray-400 font-bold mb-6">
                  Get deep insights into your {languageDNA.name} mastery, pronunciation accuracy, and more.
                </p>
                <button 
                  onClick={() => setPricingOpen(true)}
                  className="w-full btn-isometric shimmer-gold text-white border-honey-dark"
                >
                  Upgrade to Premium
                </button>
              </motion.div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-black uppercase tracking-tight">AI Learning Insights</h2>
              <div className="flex items-center gap-2 text-candy-green font-black">
                <CheckCircle2 size={20} />
                <span className="text-sm uppercase tracking-widest">Active Analysis</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {/* RADAR CHART */}
              <div className="h-80 w-full">
                <h3 className="text-center font-black text-gray-400 uppercase text-xs tracking-widest mb-4">{languageDNA.name} Proficiency</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={masteryData}>
                    <PolarGrid stroke="#E5E7EB" />
                    <PolarAngleAxis 
                      dataKey="subject" 
                      tick={{ fill: '#4B4B4B', fontSize: 10, fontWeight: 800 }} 
                    />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar
                      name="Mastery"
                      dataKey="A"
                      stroke="#B6833E"
                      fill="#B6833E"
                      fillOpacity={0.4}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* DETAILED STATS */}
              <div className="space-y-6">
                <div className="bg-cream rounded-3xl p-6 border-2 border-honey/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-honey/10 rounded-xl flex items-center justify-center text-honey">
                        <Mic size={20} />
                      </div>
                      <span className="font-black uppercase tracking-tight">Noun Class Mastery</span>
                    </div>
                    <span className="text-2xl font-black text-honey">{languageDNA.progress.nounClasses}%</span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-honey/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${languageDNA.progress.nounClasses}%` }}
                      className="h-full shimmer-gold"
                    />
                  </div>
                </div>

                <div className="bg-cream rounded-3xl p-6 border-2 border-honey/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-honey/10 rounded-xl flex items-center justify-center text-honey">
                        <BookOpen size={20} />
                      </div>
                      <span className="font-black uppercase tracking-tight">Grammar Accuracy</span>
                    </div>
                    <span className="text-2xl font-black text-honey">{languageDNA.stats.accuracy}%</span>
                  </div>
                  <div className="h-3 bg-white rounded-full overflow-hidden border border-honey/10">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${languageDNA.stats.accuracy}%` }}
                      className="h-full shimmer-gold"
                    />
                  </div>
                </div>

                {user.masteryLevel >= 5 && (
                  <div className="relative group cursor-pointer">
                    <div className="absolute -inset-1 bg-gradient-to-r from-honey to-honey-light rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative bg-white border-2 border-honey/20 rounded-3xl p-6 flex items-center gap-6">
                      <div className="w-16 h-16 bg-honey/10 rounded-2xl flex items-center justify-center text-honey shrink-0">
                        <Download size={32} />
                      </div>
                      <div>
                        <h4 className="font-black uppercase tracking-tight text-bulela-green">Bulela {languageDNA.name} Certificate</h4>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Official Proficiency Proof</p>
                        <button className="mt-2 text-honey font-black text-xs uppercase tracking-widest hover:underline flex items-center gap-1">
                          Download PDF <Download size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProfileView;
