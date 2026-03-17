
import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AlertCircle, TrendingUp, Users, Award } from 'lucide-react';

const TeacherDashboard: React.FC = () => {
  const [liveFlags, setLiveFlags] = useState<{ id: number, text: string, type: string, time: string }[]>([]);

  useEffect(() => {
    const mockErrors = [
      { text: '"Abantu chisuma"', type: 'Class 7 Prefix Leak', time: 'Just now' },
      { text: '"Imi-miti asuma"', type: 'Class 4 Concord Error', time: '2m ago' },
      { text: '"Umu-ntu basuma"', type: 'Number Mismatch', time: '5m ago' }
    ];

    const interval = setInterval(() => {
      const randomError = mockErrors[Math.floor(Math.random() * mockErrors.length)];
      setLiveFlags(prev => [{ ...randomError, id: Date.now() }, ...prev.slice(0, 4)]);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const impactData = {
    totalLearners: 1254,
    masteryPercentage: 78,
    struggleTags: [
      { tag: 'chi-', count: 452, label: 'Class 7 Prefix', color: '#f43f5e' },
      { tag: 'imi-', count: 321, label: 'Class 4 Prefix', color: '#fb923c' },
      { tag: 'aba-', count: 124, label: 'Class 2 Prefix', color: '#10b981' },
    ],
    weeklyGrowth: '+12%',
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Stats */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-copper/10 shadow-sm">
        <div>
          <h2 className="text-3xl font-black text-charcoal uppercase tracking-tighter italic flex items-center gap-3">
            Impact <span className="text-copper">Dashboard</span>
          </h2>
          <p className="text-charcoal/60 font-medium mt-1">Linguistic telemetry for Zambian Classrooms</p>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center">
           <div className="bg-silk border border-copper/10 p-4 rounded-2xl flex items-center gap-4 min-w-[160px]">
              <div className="w-10 h-10 bg-success rounded-xl flex items-center justify-center text-white">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-black text-charcoal leading-none">{impactData.totalLearners}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Active Learners</span>
              </div>
           </div>
           
           <div className="bg-silk border border-copper/10 p-4 rounded-2xl flex items-center gap-4 min-w-[160px]">
              <div className="w-10 h-10 bg-copper rounded-xl flex items-center justify-center text-white">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-black text-copper leading-none">{impactData.masteryPercentage}%</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Classroom Mastery</span>
              </div>
           </div>

           <div className="bg-silk border border-copper/10 p-4 rounded-2xl flex items-center gap-4 min-w-[160px]">
              <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <span className="block text-xl font-black text-blue-600 leading-none">{impactData.weeklyGrowth}</span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-charcoal/40">Weekly Growth</span>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Linguistic Failure Analysis */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] border border-copper/10 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-rose-500/10 text-rose-500 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-black text-charcoal uppercase tracking-tight">Systemic Friction Points</h3>
            </div>
            <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Failure Count by Prefix</span>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={impactData.struggleTags} layout="vertical" margin={{ left: 40, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(0,0,0,0.05)" />
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="tag" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false}
                  tick={{ fontSize: 14, fontWeight: 900, fill: '#B87333' }}
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-4 rounded-2xl border border-copper/10 shadow-xl">
                          <p className="text-xs font-black text-copper uppercase mb-1">{data.label}</p>
                          <p className="text-lg font-black text-rose-500">{data.count} Failures</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="count" radius={[0, 8, 8, 0]} barSize={32}>
                  {impactData.struggleTags.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6 grid grid-cols-3 gap-4">
            {impactData.struggleTags.map((item) => (
              <div key={item.tag} className="bg-silk p-3 rounded-xl border border-copper/10">
                <p className="text-[8px] font-black text-charcoal/40 uppercase mb-1">{item.label}</p>
                <p className="text-sm font-black text-copper">"{item.tag}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Friction Feed */}
        <div className="bg-charcoal p-8 rounded-[2.5rem] shadow-xl text-silk relative overflow-hidden flex flex-col">
          <div className="relative z-10 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-black uppercase tracking-tight">Live Friction Feed</h3>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping"></span>
                <span className="text-[8px] font-black bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full">REAL-TIME</span>
              </div>
            </div>
            
            <div className="flex-1 space-y-4">
              {liveFlags.length === 0 && (
                <div className="h-32 flex items-center justify-center italic text-silk/40 text-sm">Waiting for student activity...</div>
              )}
              {liveFlags.map(flag => (
                <div key={flag.id} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex justify-between items-center animate-in slide-in-from-right duration-500">
                  <div>
                    <p className="text-success font-black text-sm italic">"{flag.text}"</p>
                    <p className="text-[9px] font-bold text-silk/40 uppercase tracking-widest mt-1">{flag.type}</p>
                  </div>
                  <span className="text-[8px] font-bold text-rose-400 bg-rose-400/10 px-2 py-1 rounded-lg">{flag.time}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-5 bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
               <h4 className="text-[10px] font-black uppercase tracking-widest text-copper mb-2 italic">Linguistic Moat</h4>
               <p className="text-[11px] text-silk/60 leading-relaxed font-medium">
                 Every failed concord input is indexed to build Africa's largest linguistic dataset for Bantu language models.
               </p>
            </div>
          </div>
          
          {/* Decorative background element */}
          <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-copper/10 rounded-full blur-3xl"></div>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
