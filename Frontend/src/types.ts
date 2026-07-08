export type UserRole = 'Learner' | 'Instructor' | 'Accessibility Trainer';

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
