export type UserRole = 'Learner' | 'Instructor' | 'Accessibility Trainer' | 'Admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  streak: number;
  lessonsCompleted: number;
  practiceSessions: number;
  avgAccuracy: number;
}

export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';

export interface LessonStep {
  id: string;
  title: string;
  description: string;
  signSymbol: string; // e.g. "A", "HELLO", "THANK YOU"
  visualAidUrl?: string; // image or icon descriptor
}

export interface Lesson {
  id: string;
  name: string;
  description: string;
  difficulty: Difficulty;
  category: string;
  progress: number; // 0 to 100
  duration: string; // e.g. "15 mins"
  steps: LessonStep[];
}

export interface PracticeResult {
  predictedSign: string;
  confidence: number; // 0 to 100
  accuracyScore: number; // 0 to 100
  feedback: string;
  isCorrect: boolean;
}

export interface PracticeSession {
  id: string;
  date: string;
  lessonName: string;
  signSymbol: string;
  score: number;
  accuracy: number;
  durationSeconds: number;
  feedback: string;
}

export interface StatCardData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  icon: string;
}

// =============================================
// MILESTONE 3 – NOTIFICATIONS, ACHIEVEMENTS, STREAK, LEADERBOARD
// =============================================

export type NotificationType = 'achievement' | 'streak' | 'system' | 'lesson';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  actionUrl?: string;
}

export type BadgeCategory = 'Beginner' | 'Mastery' | 'Consistency' | 'Speed' | 'Special';

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  category: BadgeCategory;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress: number; // 0 - 100
  totalRequired: number;
  currentCount: number;
}

export interface LeaderboardUser {
  id: string;
  rank: number;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  accuracy: number;
  streak: number;
  lessonsCompleted: number;
  badgesCount: number;
  points: number;
  isCurrentUser?: boolean;
}

export interface DailyStreakStatus {
  dayName: string; // 'Mon', 'Tue', etc.
  dateStr: string; // '2026-07-31'
  completed: boolean;
  isToday: boolean;
}

export interface StreakDetails {
  currentStreak: number;
  longestStreak: number;
  todayCompleted: boolean;
  nextMilestoneDays: number;
  nextMilestoneReward: string;
  weeklyCalendar: DailyStreakStatus[];
}

