import axios from 'axios';
import { LessonContent, BulelaError, BulelaResponse, TutorContext } from '../types';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject Clerk token if needed
// This would be set up in the App.tsx or a provider
export const setAuthToken = (token: string) => {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const apiService = {
  /**
   * Fetches the specific sorting items and grammar rules for a unit/lesson.
   */
  async getUnitContent(unitId: string): Promise<LessonContent> {
    try {
      const response = await api.get<LessonContent>(`/lessons/${unitId}`);
      return response.data;
    } catch (error) {
      console.error("[API] Failed to fetch unit content:", error);
      throw error;
    }
  },

  /**
   * Sends lesson results to the 'MasteryRepository' via batch sync.
   */
  async syncProgress(userId: string, update: { lessonId: string; score: number; xpGained: number }) {
    try {
      const response = await api.post('/sync', {
        userId,
        items: [{
          id: crypto.randomUUID(),
          type: 'LESSON_COMPLETE',
          payload: update,
          timestamp: Date.now()
        }]
      });
      return response.data;
    } catch (error) {
      console.error("[API] Failed to sync progress:", error);
      throw error;
    }
  },

  /**
   * Sends the user's mistake to the /api/ai/tutor endpoint and returns the Gemma 3 4B string.
   */
  async askTutor(userId: string, context: TutorContext): Promise<BulelaResponse> {
    try {
      const response = await api.post<BulelaResponse>('/ai/tutor', {
        userId,
        context
      });
      return response.data;
    } catch (error) {
      console.error("[API] Tutor request failed:", error);
      throw error;
    }
  },

  /**
   * Calls the next-lesson endpoint to get a personalized recommendation.
   */
  async getNextLesson(userId: string): Promise<{ nextLessonId: string; difficultyAdjustment: number; recommendedAction: string }> {
    try {
      const response = await api.post(`/user/${userId}/next-lesson`);
      return response.data;
    } catch (error) {
      console.error("[API] Failed to get next lesson:", error);
      throw error;
    }
  },

  /**
   * Analyzes user sentiment based on behavioral data.
   */
  async analyzeSentiment(userId: string, behaviorData: any, textInput?: string): Promise<{ state: string; recommendedAction: string }> {
    try {
      const response = await api.post(`/user/${userId}/sentiment`, { behaviorData, textInput });
      return response.data;
    } catch (error) {
      console.error("[API] Sentiment analysis failed:", error);
      throw error;
    }
  },

  /**
   * Onboards a new user with a specific role.
   */
  async onboard(role: string) {
    try {
      const response = await api.post('/user/onboard', { role });
      return response.data;
    } catch (error) {
      console.error("[API] Onboarding failed:", error);
      throw error;
    }
  },

  /**
   * Syncs user data with the backend.
   */
  async syncWithBackend(userId: string) {
    try {
      const response = await api.get(`/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error("[API] Backend sync failed:", error);
      throw error;
    }
  }
};
