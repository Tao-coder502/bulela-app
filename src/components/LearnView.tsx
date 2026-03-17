
import React, { useRef } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { useBulelaStore } from '@/store/useBulelaStore';
import LearningPath from '@/components/LearningPath';
import BulelaTutor from '@/components/BulelaTutor';
import VoicePracticeModal from '@/components/VoicePracticeModal';
import MirrorText from '@/components/MirrorText';
import { generateBulelaResponse } from '@/TutorOrchestrator';
import { hybridEngine } from '@/engines/HybridSentimentEngine';
import { TutorContext } from '@/types';
import { SkillService } from '@/services/SkillService';
import { AudioService } from '@/services/AudioService';
import BulelaBubble from '@/components/BulelaBubble';

import BulelaMascot from '@/components/BulelaMascot';

import SortingGame from '@/components/SortingGame';

const LearnView: React.FC = () => {
  const { getToken } = useAuth();
  const { 
    user,
    activeLessonId, setActiveLessonId,
    ansState, setAnsState,
    isTutorVisible, setTutorVisible,
    isTutorLoading, setTutorLoading,
    tutorWisdom, setTutorWisdom,
    currentSentiment, setCurrentSentiment,
    recommendedAction, setRecommendedAction,
    encouragement, setEncouragement,
    isVoiceOpen, setVoiceOpen,
    setActiveTab,
    navigateWithLoader,
    setPricingOpen,
    updateMastery,
    completeLesson,
    incrementAiUsage,
    languageDNA,
    lessons
  } = useBulelaStore();

  const recentMistakes = useRef<string[]>([]);
  const sessionStartTime = useRef(Date.now());
  const lastInteractionTime = useRef(Date.now());
  const timePerQuestionMs = useRef<number[]>([]);
  const rapidGuessingCount = useRef(0);
  const wrongStreak = useRef(0);
  const attempts = useRef(0);
 
  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const currentClassMastery = user?.masteryMap['class-1-nouns'] || 0;
  const needsRemedial = SkillService.shouldAssignRemedial(currentClassMastery);

  // If a lesson is active, show the SortingGame
  if (activeLessonId) {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => setActiveLessonId(null)}
            className="text-copper font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:underline"
          >
            ← Back to Path
          </button>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">
              Session: {Math.floor((Date.now() - sessionStartTime.current) / 60000)}m
            </span>
          </div>
        </div>
        
        <SortingGame 
          lessonId={activeLessonId} 
          onComplete={(score) => {
            // Lesson completion is handled inside SortingGame via useLessonEngine
            // but we can add extra logic here if needed
            console.log("Lesson completed with score:", score);
          }} 
        />

        {isTutorVisible && (
          <BulelaTutor 
            wisdom={tutorWisdom} 
            isLoading={isTutorLoading} 
            onClose={() => setTutorVisible(false)} 
            sentiment={currentSentiment}
            masteryLevel={user?.masteryLevel}
          />
        )}
      </div>
    );
  }

  const triggerConfetti = () => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };
    const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();
      if (timeLeft <= 0) return clearInterval(interval);
      const particleCount = 50 * (timeLeft / duration);
      // @ts-ignore
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }, colors: ['#B87333', '#F9F1EB', '#33B873'] });
      // @ts-ignore
      confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }, colors: ['#B87333', '#F9F1EB', '#33B873'] });
    }, 250);
  };

  const [location, setLocation] = React.useState<string | undefined>(undefined);

  React.useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        if (Math.abs(latitude + 12.8) < 0.5 && Math.abs(longitude - 28.2) < 0.5) {
          setLocation('Kitwe');
        }
      });
    }
  }, []);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('session_id')) {
      setEncouragement("Zikomo! Your Pro subscription is active. Welcome to the inner circle of Bulela.");
      setTimeout(() => setEncouragement(null), 8000);
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  const triggerTutorOrchestration = async (input: string, correct: string, errorType: string) => {
    if (!user || !activeLessonId) return;
    
    const now = Date.now();
    const interactionTime = now - lastInteractionTime.current;
    lastInteractionTime.current = now;
    
    if (interactionTime < 2000) {
      rapidGuessingCount.current += 1;
    }
    timePerQuestionMs.current.push(interactionTime);

    setTutorVisible(true);
    setTutorLoading(true);
    setAnsState('error');
    
    attempts.current += 1;
    wrongStreak.current += 1;
    recentMistakes.current = [...recentMistakes.current, errorType].slice(-5);
    
    const metrics = {
      durationMs: now - sessionStartTime.current,
      attempts: attempts.current,
      wrongStreak: wrongStreak.current,
      timePerQuestionMs: timePerQuestionMs.current,
      rapidGuessingCount: rapidGuessingCount.current
    };

    const masteryGaps = Object.entries(user.masteryMap || {})
      .filter(([_, score]) => score < 50)
      .map(([id, _]) => id)
      .join(', ') || 'None';

    hybridEngine.analyze(metrics, input, async (blended) => {
      setCurrentSentiment(blended.state);
      
      // Sync sentiment to backend for source of truth
      try {
        const token = await getToken();
        const response = await fetch(`/api/user/${user.id}/sentiment`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            behaviorData: metrics,
            textInput: input
          })
        });
        if (response.ok) {
          const result = await response.json();
          setRecommendedAction(result.recommendedAction);
        }
      } catch (e) {
        console.warn("[Bulela] Sentiment sync failed", e);
      }
      
      const context: TutorContext = {
        learnerId: user.id,
        learnerName: user.firstName,
        language: languageDNA.name,
        languageRules: languageDNA.rules,
        sentiment: blended.state,
        location: location,
        lessonObjective: activeLesson?.title || "Bantu Concord Mastery",
        attempts: attempts.current,
        wrongStreak: wrongStreak.current,
        recentMistakes: recentMistakes.current,
        masteryLevel: user.masteryLevel,
        currentMasteryScore: user.masteryMap['class-1-nouns'] || 0,
        learnerTier: user.learnerTier,
        masteryGaps: masteryGaps,
        lastInput: input
      };

      try {
        const token = await getToken();
        const wisdom = await generateBulelaResponse(context, user?.subscriptionTier === 'pro', user?.aiUsageCount || 0, token);
        setTutorWisdom(wisdom);
        if (wisdom && !wisdom.isLocked) {
          incrementAiUsage();
        }
      } catch (err) {
        console.error("[Bulela] Orchestration failed", err);
      } finally {
        setTutorLoading(false);
      }
    });

    setTimeout(() => setAnsState('idle'), 3000);
  };

  const handleCorrectAnswer = () => {
    if (!user || !activeLessonId) return;
    
    setAnsState('success');
    triggerConfetti();
    wrongStreak.current = 0;

    const lesson = lessons.find(l => l.id === activeLessonId);
    if (lesson) {
      updateMastery('class-1-nouns', 100);
      
      if (100 >= lesson.requiredMasteryScore) {
        setTimeout(() => {
           completeLesson(activeLessonId, lesson.xpReward);
           const nextLesson = lessons.find(l => l.id !== activeLessonId && !user?.completedLessons.includes(l.id) && [...lesson.prerequisites, lesson.id].every(p => [...user?.completedLessons || [], activeLessonId].includes(p)));
           const nextTitle = nextLesson ? nextLesson.title : "the next frontier";
           setEncouragement(`Supa! You've mastered ${lesson.title}. Let's move to ${nextTitle} next.`);
           setTimeout(() => setEncouragement(null), 6000);
        }, 1500);
      }
    }

    setTimeout(() => setAnsState('idle'), 3000);
  };

  const handleTTS = (text: string) => AudioService.speak(text);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-charcoal relative overflow-hidden shadow-sm border border-copper/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-md">
            <div className="flex items-center gap-3 mb-4">
               <div className="w-10 h-10 bg-copper/10 rounded-xl flex items-center justify-center text-xl">
                  {needsRemedial ? '🧩' : '🌊'}
               </div>
               <div>
                 <p className="text-[10px] font-black uppercase tracking-widest text-copper">Mastery Level {user?.masteryLevel}</p>
                 <p className="text-xs font-bold text-copper/60">
                   {needsRemedial ? 'Remedial Drill Recommended' : 'Path is clear, learner.'}
                 </p>
               </div>
            </div>
            <h2 className="text-2xl md:text-4xl font-black italic leading-tight">Muli bwanji, {user?.firstName}!</h2>
            <div className="mt-2 flex items-center gap-2">
              <span className="bg-amber-copper/20 text-amber-copper px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                Tier: {user?.learnerTier}
              </span>
              {recommendedAction && (
                <span className="bg-electric-emerald/20 text-electric-emerald px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest animate-pulse">
                  Action: {recommendedAction.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center justify-between md:justify-end gap-4">
            <BulelaMascot mood="float" className="w-16 h-16 md:w-24 md:h-24 drop-shadow-lg" />
            <button 
              onClick={() => setVoiceOpen(true)}
              className="bg-copper hover:scale-105 text-white font-black px-4 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl border-b-4 border-copper-dark shadow-md flex items-center gap-2 md:gap-3 active:scale-95 transition-all text-xs md:text-sm uppercase tracking-widest whitespace-nowrap"
            >
              <span className="text-lg md:text-xl">🎙️</span> Voice Practice
            </button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-copper/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="md:col-span-2 bg-white rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 border border-copper/20 shadow-sm relative group overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-silk overflow-hidden">
             <div className="h-full bg-success transition-all duration-1000" style={{ width: `${currentClassMastery}%` }}></div>
          </div>

          <div className="text-center space-y-6 md:space-y-8">
            <div className="space-y-1">
              <p className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-charcoal/40">Current Objective: {activeLesson?.title || 'Bulela Path'}</p>
              <p className="text-[8px] md:text-[9px] font-bold text-copper uppercase italic">Threshold: {activeLesson?.requiredMasteryScore || 0}% Mastery</p>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl md:text-2xl font-black text-charcoal italic leading-tight">Translate: "The people are well."</h3>
              <p className="text-charcoal/40 font-bold italic text-xs md:text-sm leading-relaxed">Hint: Focus on the 'A-' prefix for Anthu.</p>
            </div>

            <div className="flex flex-col gap-3 md:gap-4">
              <div className="flex gap-2">
                <button 
                  onClick={handleCorrectAnswer} 
                  className={`flex-1 py-4 md:py-6 rounded-xl md:rounded-2xl border-2 font-black text-lg md:text-xl transition-all hover:scale-[1.02] ${
                    ansState === 'success' ? 'bg-success border-success-dark text-white scale-[1.02]' : 'bg-white border-copper/10 text-charcoal hover:border-copper/30'
                  }`}
                >
                  <MirrorText text="Anthu ali bwino" />
                </button>
                <button 
                  onClick={() => handleTTS("Anthu ali bwino")}
                  className="w-12 md:w-16 bg-white border-2 border-copper/10 rounded-xl md:rounded-2xl flex items-center justify-center text-copper hover:bg-copper/5 transition-all"
                >
                  🔊
                </button>
              </div>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => triggerTutorOrchestration('Anthu chili bwino', 'Anthu ali bwino', 'Noun Class 1 Prefix')} 
                  className={`flex-1 py-4 md:py-6 rounded-xl md:rounded-2xl border-2 font-black text-lg md:text-xl transition-all hover:scale-[1.02] ${
                    ansState === 'error' ? 'bg-rose-500 border-rose-700 text-white animate-shake' : 'bg-rose-50/50 border-rose-200 text-rose-600 hover:border-rose-300'
                  }`}
                >
                  <MirrorText text="Anthu chili bwino" />
                </button>
                <button 
                  onClick={() => handleTTS("Anthu chili bwino")}
                  className="w-12 md:w-16 bg-white border-2 border-copper/10 rounded-xl md:rounded-2xl flex items-center justify-center text-rose-400 hover:bg-rose-50 transition-all"
                >
                  🔊
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-1 gap-4 md:gap-6">
          <div className="bg-white border border-copper/20 rounded-[1.5rem] md:rounded-[2.5rem] p-4 md:p-8 shadow-sm text-center flex flex-col justify-center">
             <div className="w-10 h-10 md:w-16 md:h-16 bg-copper/10 rounded-xl md:rounded-2xl flex items-center justify-center text-xl md:text-3xl mx-auto mb-2 md:mb-4">🛡️</div>
             <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-charcoal/40">Streak Guard</p>
             <p className="text-xl md:text-3xl font-black text-charcoal italic">{user?.streak} Days</p>
          </div>
          <div className="bg-copper p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-md shadow-copper/20 text-center border-b-4 border-copper-dark relative overflow-hidden hover:scale-105 transition-transform flex flex-col justify-center">
             <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-80">Lesson Payout</p>
             <p className="text-lg md:text-xl font-black italic">+{activeLesson?.xpReward || 0} XP</p>
             <div className="mt-2 md:mt-4 h-1.5 md:h-2 bg-white/20 rounded-full">
                <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${Math.min(100, (currentClassMastery / (activeLesson?.requiredMasteryScore || 100)) * 100)}%` }}></div>
             </div>
             <div className="absolute -bottom-2 -right-2 text-2xl md:text-4xl opacity-10">💎</div>
          </div>
        </div>
      </div>

      <div className="mt-12">
         <div className="text-center mb-12">
            <h3 className="text-2xl font-black text-charcoal uppercase tracking-tighter italic">Linguistic <span className="text-copper">Path</span></h3>
            <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">Master one class at a time</p>
         </div>
         <LearningPath onSelectLesson={(id) => {
           setActiveLessonId(id);
           navigateWithLoader('practice');
         }} />
      </div>

      {isTutorVisible && (
        <BulelaTutor 
          wisdom={tutorWisdom} 
          isLoading={isTutorLoading} 
          onClose={() => setTutorVisible(false)} 
          sentiment={currentSentiment}
          masteryLevel={user?.masteryLevel}
        />
      )}
      
      <VoicePracticeModal 
        isOpen={isVoiceOpen} 
        onClose={() => setVoiceOpen(false)} 
        initialTopic={activeLesson?.title || "Class 1 & 2 People Prefixes"} 
      />

      <BulelaBubble 
        message={encouragement || ""} 
        visible={!!encouragement} 
      />
    </div>
  );
};

export default LearnView;
