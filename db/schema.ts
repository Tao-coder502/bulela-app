
import { pgTable, text, integer, decimal, timestamp, pgEnum, primaryKey, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';

export const roleEnum = pgEnum('role', ['student', 'teacher', 'admin', 'individual']);
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'pro', 'institutional']);
export const learnerTierEnum = pgEnum('learner_tier', ['MWAYI', 'CHIKONDI', 'DOLO']);
export const lessonStatusEnum = pgEnum('lesson_status', ['locked', 'available', 'completed']);
export const lessonTypeEnum = pgEnum('lesson_type', ['concept', 'drill', 'quiz']);

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  role: roleEnum('role').default('individual').notNull(),
  subscriptionTier: subscriptionTierEnum('subscription_tier').default('free').notNull(),
  learnerTier: learnerTierEnum('learner_tier').default('MWAYI').notNull(),
  kPoints: integer('k_points').default(0).notNull(),
  totalXp: integer('total_xp').default(0).notNull(),
  aiUsageCount: integer('ai_usage_count').default(0).notNull(),
  lastSentiment: text('last_sentiment').default('FLOW').notNull(),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  lastActivityAt: timestamp('last_activity_at').defaultNow().notNull(),
});

export const lessons = pgTable('lessons', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: lessonTypeEnum('type').default('concept').notNull(),
  xpReward: integer('xp_reward').default(0).notNull(),
  requiredMasteryScore: integer('required_mastery_score').default(80).notNull(),
  prerequisites: jsonb('prerequisites').default([]).notNull(), // Array of lesson IDs
  isProOnly: integer('is_pro_only').default(0).notNull(), // 0 or 1
  order: integer('order').default(0).notNull(),
});

export const curriculumProgress = pgTable('curriculum_progress', {
  userId: text('user_id').references(() => users.id).notNull(),
  lessonId: text('lesson_id').references(() => lessons.id).notNull(),
  status: lessonStatusEnum('status').default('locked').notNull(),
  starsEarned: integer('stars_earned').default(0).notNull(),
  completedAt: timestamp('completed_at'),
  clientEventId: text('client_event_id').unique(), // For idempotency
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.lessonId] }),
}));

export const masteryMetrics = pgTable('mastery_metrics', {
  userId: text('user_id').references(() => users.id).notNull(),
  nounClass: text('noun_class').notNull(),
  masteryScore: decimal('mastery_score', { precision: 5, scale: 2 }).default('0').notNull(),
  lastAttemptAt: timestamp('last_attempt_at').defaultNow().notNull(),
  clientEventId: text('client_event_id'), // For idempotency tracking
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.nounClass] }),
}));

export const events = pgTable('events', {
  id: text('id').primaryKey(), // Usually client-generated UUID
  userId: text('user_id').references(() => users.id).notNull(),
  type: text('type').notNull(),
  payload: jsonb('payload').notNull(),
  timestamp: timestamp('timestamp').notNull(),
  durationMs: integer('duration_ms'),
  attempts: integer('attempts'),
  device: text('device'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});
