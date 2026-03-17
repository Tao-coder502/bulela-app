import { useState, useEffect, useCallback, useRef } from 'react';
import { LessonContent, LessonItem } from '../types';
import { apiService } from '../services/apiService';
import { useBulelaStore } from '../store/useBulelaStore';
import { MOCK_NYANJA_NOUN_CLASS_LESSON } from '../mockData';

export const useLessonEngine = (lessonId: string) => {
  const { user, setCurrentSentiment, setRecommendedAction } = useBulelaStore();
  const [content, setContent] = useState<LessonContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Behavioral tracking
  const behaviorRef = useRef({
    errorCount: 0,
    attempts: 0,
    wrongStreak: 0,
    startTime: Date.now()
  });

  useEffect(() => {
    const fetchContent = async () => {
      setLoading(true);
      try {
        const data = await apiService.getUnitContent(lessonId);
        setContent(data);
        setLoading(false);
      } catch (err) {
        console.warn("API fetch failed, using mock data", err);
        setContent(MOCK_NYANJA_NOUN_CLASS_LESSON);
        setLoading(false);
      }
    };

    fetchContent();
  }, [lessonId]);

  const submitAnswer = useCallback(async (itemId: string, categoryId: number) => {
    if (!content || !user) return false;

    const item = content.items.find(i => i.id === itemId);
    const isCorrect = item?.correctClass === categoryId;

    behaviorRef.current.attempts += 1;

    if (isCorrect) {
      setScore(prev => prev + 1);
      behaviorRef.current.wrongStreak = 0;
    } else {
      behaviorRef.current.errorCount += 1;
      behaviorRef.current.wrongStreak += 1;
    }

    // Analyze sentiment every 2 attempts or on wrong streak
    if (behaviorRef.current.attempts % 2 === 0 || behaviorRef.current.wrongStreak > 1) {
      try {
        const sentiment = await apiService.analyzeSentiment(user.id, {
          ...behaviorRef.current,
          durationMs: Date.now() - behaviorRef.current.startTime
        });
        setCurrentSentiment(sentiment.state as any);
        setRecommendedAction(sentiment.recommendedAction);
      } catch (e) {
        console.error("Sentiment analysis failed:", e);
      }
    }

    if (currentIndex < content.items.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setIsComplete(true);
      // Sync progress on completion
      apiService.syncProgress(user.id, {
        lessonId,
        score: score + (isCorrect ? 1 : 0),
        xpGained: content.xpReward
      }).catch(console.error);
    }

    return isCorrect;
  }, [content, currentIndex, user, lessonId, score, setCurrentSentiment, setRecommendedAction]);

  const reset = () => {
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
  };

  return {
    content,
    loading,
    error,
    currentItem: content?.items[currentIndex] || null,
    progress: content ? ((currentIndex + 1) / content.items.length) * 100 : 0,
    score,
    isComplete,
    submitAnswer,
    reset
  };
};
