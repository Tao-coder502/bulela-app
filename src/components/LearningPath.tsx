
import React, { useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import NounClassNode from './NounClassNode';
import { LessonStatus, LessonNode } from '../types';
import { useBulelaStore } from '../store/useBulelaStore';
import { SkillService } from '../services/SkillService';

interface Props {
  onSelectLesson: (lessonId: string) => void;
}

const LearningPath: React.FC<Props> = ({ onSelectLesson }) => {
  const { user, lessons, fetchLessons, activeLessonId } = useBulelaStore();
  const unitRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  useEffect(() => {
    if (lessons.length === 0) {
      fetchLessons();
    }
  }, [lessons.length, fetchLessons]);

  if (!user) return null;

  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const completed = user.completedLessons;
  const currentClassMastery = user.masteryMap['class-1-nouns'] || 0;
  const needsRemedial = SkillService.shouldAssignRemedial(currentClassMastery);

  const REMEDIAL_LESSON: LessonNode = {
    id: 'remedial_muba_drill',
    title: 'Remedial: Mu-/A- Review',
    description: 'Strengthen your foundations (Maziko) before moving forward.',
    type: 'drill',
    xpReward: 50,
    requiredMasteryScore: 0,
    prerequisites: [],
  };

  const curriculum = (needsRemedial 
    ? [REMEDIAL_LESSON, ...lessons] 
    : lessons).filter(lesson => {
      if (lesson.isProOnly && user.subscriptionTier !== 'pro') return false;
      return true;
    });

  // Dummy Units Mapping
  const units = [
    {
      id: 'unit-1',
      title: 'Unit 1: Foundations & Greetings',
      description: 'Learn the basics of Zambian etiquette.',
      lessons: curriculum.length > 0 ? curriculum.slice(0, 3) : [
        { id: 'd1', title: 'Muli Bwanji?', description: 'Greetings', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
        { id: 'd2', title: 'Zikomo', description: 'Gratitude', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
        { id: 'd3', title: 'Dzina Langa', description: 'Names', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
      ]
    },
    {
      id: 'unit-2',
      title: 'Unit 2: Noun Class Mastery',
      description: 'Master the complex Mu-/Ba- class system.',
      lessons: curriculum.length > 3 ? curriculum.slice(3, 7) : [
        { id: 'd4', title: 'Mu- Prefix', description: 'Singular people', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
        { id: 'd5', title: 'Ba- Prefix', description: 'Plural people', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
        { id: 'd6', title: 'Concordance', description: 'Matching verbs', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
      ]
    },
    {
      id: 'unit-3',
      title: 'Unit 3: Daily Life & Actions',
      description: 'Common verbs and sentence structures.',
      lessons: curriculum.length > 7 ? curriculum.slice(7) : [
        { id: 'd7', title: 'Kudya', description: 'Eating', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
        { id: 'd8', title: 'Kumwa', description: 'Drinking', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
        { id: 'd9', title: 'Kugona', description: 'Sleeping', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
        { id: 'd10', title: 'Kuyenda', description: 'Walking', type: 'lesson', xpReward: 10, requiredMasteryScore: 0, prerequisites: [] },
      ]
    }
  ];

  const handleNodeClick = (lessonId: string, status: LessonStatus) => {
    if (status === LessonStatus.LOCKED) {
      alert("Complete previous lessons first!");
      return;
    }
    onSelectLesson(lessonId);
  };

  const scrollToUnit = (direction: 'up' | 'down') => {
    const scrollPos = window.scrollY;
    const headerOffsets = unitRefs.current
      .filter(ref => ref !== null)
      .map(ref => ref!.getBoundingClientRect().top + scrollPos - 100); // Offset for TopHUD

    if (direction === 'down') {
      const next = headerOffsets.find(offset => offset > scrollPos + 10);
      if (next !== undefined) {
        window.scrollTo({ top: next, behavior: 'smooth' });
      }
    } else {
      const prev = [...headerOffsets].reverse().find(offset => offset < scrollPos - 10);
      if (prev !== undefined) {
        window.scrollTo({ top: prev, behavior: 'smooth' });
      }
    }
  };

  let foundActive = false;

  return (
    <div className="flex flex-col items-center py-12 space-y-8 max-w-md mx-auto relative font-sans">
      {/* Quick Navigation Arrows */}
      <div className="fixed bottom-24 right-4 md:right-8 flex flex-col gap-2 z-30">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToUnit('up')}
          className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-[0_4px_0_rgb(229,231,235)] flex items-center justify-center text-charcoal hover:bg-gray-50 transition-colors"
        >
          <ChevronUp size={24} />
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => scrollToUnit('down')}
          className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 shadow-[0_4px_0_rgb(229,231,235)] flex items-center justify-center text-charcoal hover:bg-gray-50 transition-colors"
        >
          <ChevronDown size={24} />
        </motion.button>
      </div>

      {/* Continue Lesson Button */}
      {activeLesson && (
        <div className="w-full px-4">
          <div className="bg-white rounded-3xl p-6 border-2 border-gray-200 shadow-sm mb-8 animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-copper">Up Next</p>
                <h3 className="text-xl font-black text-charcoal italic">{activeLesson.title}</h3>
              </div>
              <button 
                onClick={() => onSelectLesson(activeLesson.id)}
                className="bg-copper hover:scale-105 text-white font-black px-6 py-3 rounded-2xl border-b-4 border-copper-dark shadow-md active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Visual Path Connector */}
      <div className="absolute inset-0 pointer-events-none flex justify-center mt-40">
        <svg className="w-full h-full opacity-10" viewBox="0 0 100 1200" preserveAspectRatio="none">
          <path
            d="M50,0 Q80,100 50,200 Q20,300 50,400 Q80,500 50,600 Q20,700 50,800 Q80,900 50,1000 Q20,1100 50,1200"
            fill="none"
            stroke="#083124"
            strokeWidth="8"
            strokeDasharray="20 10"
          />
        </svg>
      </div>

      {/* Units Mapping */}
      {units.map((unit, unitIndex) => (
        <div key={unit.id} className="w-full space-y-12 pb-12">
          {/* Sticky Unit Header */}
          <div 
            ref={el => unitRefs.current[unitIndex] = el}
            className="sticky top-[84px] z-20 bg-[#FCF9F1] px-4 py-3 border-b-2 border-gray-200 shadow-sm"
          >
            <h2 className="text-lg font-black text-charcoal uppercase tracking-tight">
              {unit.title}
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest opacity-70">
              {unit.description}
            </p>
          </div>

          <div className="flex flex-col items-center space-y-16">
            {unit.lessons.map((lesson, lessonIndex) => {
              const isCompleted = completed.includes(lesson.id);
              const prerequisitesMet = lesson.prerequisites.every(p => completed.includes(p));
              
              let status = LessonStatus.LOCKED;
              
              if (lesson.id === 'remedial_muba_drill') {
                status = LessonStatus.ACTIVE;
              } else if (isCompleted) {
                status = LessonStatus.COMPLETED;
              } else if (prerequisitesMet && !foundActive) {
                status = LessonStatus.ACTIVE;
                foundActive = true;
              }

              const offset = (unitIndex * 10 + lessonIndex) % 2 === 0 ? 'mr-12' : 'ml-12';

              return (
                <div key={lesson.id} className="relative group">
                  {lesson.isProOnly && (
                    <div className="absolute -top-4 -right-4 bg-copper text-white text-[8px] font-black px-2 py-1 rounded-full z-10 shadow-lg border border-white/20">PRO</div>
                  )}
                  <NounClassNode 
                    title={lesson.title} 
                    status={status} 
                    offset={offset} 
                    onClick={() => handleNodeClick(lesson.id, status)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      
      {/* Footer / Coming Soon */}
      <div className="w-full h-24 flex flex-col items-center justify-center opacity-40">
        <div className="w-16 h-16 rounded-full bg-slate-200 flex items-center justify-center mb-2">
           <span className="text-xl font-bold text-slate-400">?</span>
        </div>
        <span className="text-[10px] font-black uppercase text-slate-400">More coming soon</span>
      </div>
    </div>
  );
};

export default LearningPath;
