import { apiBaseUrl } from './api';

// =============================================================================
// DAY 9 - FRONTEND TO BACKEND INTEGRATION
// Intern 1 imports these functions to replace Milestone 2 mock data with real
// badges, streaks, leaderboards, exports and recommendations from Backend.
// =============================================================================

export type LeaderboardMetric = 'accuracy' | 'streak';
export type ExportFormat = 'csv' | 'xlsx';

export interface PracticeAttemptPayload {
  expected_label: string;
  predicted_label: string;
  confidence: number;
  course_id?: number;
}

export interface PracticeAttemptResult {
  attempt_id: number;
  is_correct: boolean;
  score: number;
  feedback: string;
  streak: number;
  new_badges: string[];
  expected_label: string;
  predicted_label: string;
  confidence: number;
}

export interface Badge {
  code: string;
  name: string;
  description: string;
  earned_at: string | null;
}

export interface Streak {
  current_streak: number;
  longest_streak: number;
}

export interface LeaderboardEntry {
  rank: number;
  user_id: number;
  username: string;
  accuracy: number;
  current_streak: number;
  attempts: number;
}

export interface Recommendation {
  label: string;
  reason: string;
  weighted_accuracy: number | null;
}

function headers(token: string, includeContentType = false): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    ...(includeContentType ? { 'Content-Type': 'application/json' } : {}),
  };
}

async function readJson<T>(response: Response, errorMessage: string): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage);
  }
  return response.json() as Promise<T>;
}

export async function submitPracticeAttempt(token: string, payload: PracticeAttemptPayload): Promise<PracticeAttemptResult> {
  const response = await fetch(`${apiBaseUrl}/business/attempts`, {
    method: 'POST',
    headers: headers(token, true),
    body: JSON.stringify(payload),
  });
  return readJson<PracticeAttemptResult>(response, 'Could not save practice attempt');
}

export async function getMyStreak(token: string): Promise<Streak> {
  return readJson<Streak>(await fetch(`${apiBaseUrl}/business/streak/me`, { headers: headers(token) }), 'Could not load streak');
}

export async function getMyBadges(token: string): Promise<Badge[]> {
  return readJson<Badge[]>(await fetch(`${apiBaseUrl}/business/badges/me`, { headers: headers(token) }), 'Could not load badges');
}

export async function getLeaderboard(courseId: number, metric: LeaderboardMetric): Promise<LeaderboardEntry[]> {
  return readJson<LeaderboardEntry[]>(
    await fetch(`${apiBaseUrl}/business/leaderboard/${courseId}?metric=${metric}`),
    'Could not load leaderboard',
  );
}

export async function getRecommendations(token: string): Promise<Recommendation[]> {
  return readJson<Recommendation[]>(
    await fetch(`${apiBaseUrl}/business/recommendations/me`, { headers: headers(token) }),
    'Could not load recommendations',
  );
}

export async function downloadProgressReport(token: string, format: ExportFormat): Promise<void> {
  const response = await fetch(`${apiBaseUrl}/business/exports/me?format=${format}`, { headers: headers(token) });
  if (!response.ok) {
    throw new Error('Could not export progress report');
  }
  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `progress-report.${format}`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
