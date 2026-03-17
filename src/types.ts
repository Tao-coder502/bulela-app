
import React from 'react';
export type LearnerTier = 'MWAYI' | 'CHIKONDI' | 'DOLO';
export type LearnerState = 'FLOW' | 'FRICTION' | 'BOREDOM' | 'FRUSTRATED';

export enum LessonStatus {
  LOCKED = 'LOCKED',
  AVAILABLE = 'AVAILABLE',
  COMPLETED = 'COMPLETED',
  ACTIVE = 'ACTIVE'
}

export enum SyncStatus {
  OFFLINE = 'OFFLINE',
  SYNCING = 'SYNCING',
  SYNCED = 'SYNCED'
}

export type UserRole = 'individual' | 'student' | 'teacher' | 'moe_admin';
export type SubscriptionTier = 'free' | 'pro' | 'institutional';

export type LessonType = 'concept' | 'drill' | 'assessment';

export interface LessonNode {
  id: string;
  title: string;
  description: string;
  type: LessonType;
  xpReward: number;
  requiredMasteryScore: number;
  prerequisites: string[];
  isProOnly?: boolean;
}

export interface NounClassNode {
  id: string;
  title: string;
  description: string;
  status: LessonStatus;
  progress: number; // 0 to 100
}

export interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
}

export interface LanguageDNA {
  id: string;
  name: string;
  respectPrefix: string;
  greeting: string;
  culturalPivot: string;
  rules: {
    hasTonality: boolean;
    nounClassCount: number;
    culturalMetaphorTheme: string;
  };
  progress: {
    nounClasses: number;
  };
  stats: {
    accuracy: number;
  };
}

export interface UserState {
  id: string;
  name: string;
  clerkId: string;
  firstName: string;
  role: UserRole;
  subscriptionTier: SubscriptionTier;
  xp: number;
  kwachaBalance: number;
  kPoints: number;
  hearts: number;
  lastHeartLossAt: Date | null;
  lastActivityAt: Date | null;
  streak: number;
  streakFreezeCount: number;
  masteryLevel: number;
  
  // Phase 8: Personalization
  masteryMap: Record<string, number>; // Maps noun class ID to mastery percentage
  completedLessons: string[]; // Track IDs of finished lessons
  aiUsageCount: number;
  voiceUsageCount: number;
  lastSentiment: LearnerState;
  learnerTier: LearnerTier;
}

export interface LessonRewards {
  xpGain: number;
  kwachaGain: number;
  isPerfect: boolean;
}

export type QuestionType = 'multiple-choice' | 'word-bank' | 'audio-to-meaning' | 'text-input';

export interface QuizQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hint: string;
  audioUrl?: string; // For audio-to-meaning
  difficulty?: 'easy' | 'medium' | 'hard';
}

export type SyncEventType = 'LESSON_COMPLETE' | 'MASTERY_UPDATE' | 'SENTIMENT_UPDATE' | 'KPOINTS_UPDATE' | 'AI_USAGE';

export interface SyncQueueItem {
  id: string;
  type: SyncEventType;
  payload: any;
  timestamp: number;
  status?: 'PENDING' | 'FAILED';
}

export type SentimentScore = 'Positive' | 'Neutral' | 'Frustrated' | 'Confused';
export type ErrorType = 'Grammar' | 'Tone' | 'Vocabulary' | 'Success';
export type UserLevel = 'Dolo' | 'Mwayi';
export type UIAction = 'CHANGE_COLOR' | 'SHOW_HINT' | 'SIMPLIFY_TASK' | 'NONE';
export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD';

export interface AdaptiveInput {
  language: string;
  language_rules: any;
  sentiment_score: SentimentScore;
  error_type: ErrorType;
  user_level: UserLevel;
  current_task: string;
}

export interface AdaptiveResponse {
  personalized_feedback: string;
  english_translation: string;
  ui_action: UIAction;
  tone_map: string;
  next_step_difficulty: Difficulty;
}

export type ProficiencyPath = 'MWAYI' | 'CHIKONDI' | 'DOLO';

export interface PlacementStep {
  id: string;
  task: string;
  options: string[];
  correctAnswer: string;
  onWrongPath: ProficiencyPath;
  onRightContinue: boolean;
}

export interface PlacementResult {
  id: string;
  isCorrect: boolean;
}

export interface PlacementMission {
  steps: PlacementStep[];
  finalPath?: ProficiencyPath;
}

export interface BulelaResponse {
  tutor_hint: string;
  proverb_in_nyanja: string;
  concord_rule_id: string;
  cultural_metaphor?: string;
  isLocked?: boolean;
  engine?: string;
  
  // Adaptive Engine Fields
  personalized_feedback?: string;
  english_translation?: string;
  ui_action?: UIAction;
  tone_map?: string;
  next_step_difficulty?: Difficulty;
}

export interface BehaviorData {
  averageResponseTimeMs: number;
  errorCount: number;
  errorSequence: string[];
  totalQuestions: number;
}

export interface TutorContext {
  learnerId: string;
  learnerName: string;
  language: string; // e.g., 'Nyanja', 'Bemba', 'Swahili'
  languageRules: {
    hasTonality: boolean;
    nounClassCount: number;
    culturalMetaphorTheme: string;
  };
  sentiment: LearnerState;
  location?: string;
  lessonObjective: string;
  attempts: number;
  wrongStreak: number;
  recentMistakes: string[];
  masteryLevel: number;
  currentMasteryScore?: number;
  learnerTier: LearnerTier;
  masteryGaps: string;
  lastInput?: string;
}

export type MissionCardType = 'VOICE_REPETITION' | 'SCENARIO_RESPONSE' | 'TONAL_PAIR';

export interface MissionCard {
  id: string;
  type: MissionCardType;
  nyanja_text: string;
  audio_metadata: {
    stability: number;
    similarity_boost: number;
    style: number;
  };
  difficulty_mapping: Record<ProficiencyPath, string>;
}

export interface BulelaMission {
  scenario: {
    title: string;
    image_gen_prompt: string;
    cultural_context: string;
  };
  practice_cards: MissionCard[];
  sentiment_logic: {
    if_frustrated: string;
    if_dolo_streak: string;
  };
}

export interface NounClassStats {
  classId: string;
  masteryLevel: number;
  examplesLearned: string[];
}

export interface LessonItem {
  id: string;
  word: string;
  translation: string;
  correctClass: number;
  audioUrl?: string;
}

export interface LessonContent {
  id: string;
  title: string;
  items: LessonItem[];
  categories: { id: number; label: string }[];
  grammarRules: string[];
}

export interface Unit {
  id: string;
  title: string;
  lessons: LessonNode[];
}

export interface Curriculum {
  units: Unit[];
}

export interface UserProgress {
  xp: number;
  streak: number;
  masteryMap: Record<string, NounClassStats>;
}

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface BulelaError {
  code: string;
  message: string;
  persona: string;
  severity: ErrorSeverity;
}
