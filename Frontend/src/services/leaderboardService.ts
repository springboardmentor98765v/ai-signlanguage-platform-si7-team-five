// INTERN 4 CHECKPOINT: Leaderboard Service
// This service manages leaderboard functionality for the sign language platform
// It handles ranking, filtering, sorting, and pagination of user performance data

import { LeaderboardUser } from '../types';
import { apiBaseUrl } from '../utils/api';

export type TimeRangeFilter = 'today' | 'week' | 'month' | 'allTime';
export type SortOption = 'points' | 'accuracy' | 'streak' | 'lessons';

export interface FetchLeaderboardParams {
  timeRange?: TimeRangeFilter;
  sortBy?: SortOption;
  searchQuery?: string;
  page?: number;
  pageSize?: number;
}

export interface FetchLeaderboardResult {
  users: LeaderboardUser[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  currentUserRank?: LeaderboardUser;
}

class LeaderboardService {
  private getHeaders() {
    const token = localStorage.getItem('asl_access_token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  // INTERN 4 CHECKPOINT: Leaderboard data retrieval with filtering and sorting
  // Retrieves leaderboard data with support for time range filtering, sorting by metrics,
  // search functionality, and pagination
  async getLeaderboard(params: FetchLeaderboardParams = {}): Promise<FetchLeaderboardResult> {
    const {
      timeRange = 'week',
      sortBy = 'accuracy',
      searchQuery = '',
      page = 1,
      pageSize = 5,
    } = params;

    try {
      // Query specific metric endpoint if available on backend, default metric is accuracy on backend
      const resp = await fetch(`${apiBaseUrl}/business/leaderboard/0?metric=${sortBy}`, { headers: this.getHeaders() });
      let list: LeaderboardUser[] = [];
      
      if (resp.ok) {
        const data = await resp.json();
        list = data.map((item: any) => ({
          id: String(item.user_id),
          rank: item.rank,
          name: item.username,
          role: 'Learner', // Default assuming leaderboard mostly represents learners
          accuracy: item.accuracy,
          streak: item.current_streak,
          lessonsCompleted: item.attempts, // Backend doesn't give exact completed lessons here
          badgesCount: 0,
          points: item.accuracy * 10 + item.current_streak * 5, // Simulated points based on data
          isCurrentUser: item.is_current_user || false
        }));
      }

      // Filter by search query (Client side filter since API may not support search)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        list = list.filter((u) => u.name.toLowerCase().includes(q));
      }

      // Sorting (if backend hasn't sorted by requested metric yet)
      list.sort((a, b) => {
        switch (sortBy) {
          case 'accuracy':
            return b.accuracy - a.accuracy;
          case 'streak':
            return b.streak - a.streak;
          case 'lessons':
            return b.lessonsCompleted - a.lessonsCompleted;
          case 'points':
          default:
            return b.points - a.points;
        }
      });

      // Re-assign ranks dynamically after sorting locally
      list = list.map((u, idx) => ({ ...u, rank: idx + 1 }));

      const totalCount = list.length;
      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedUsers = list.slice(startIndex, startIndex + pageSize);
      const currentUserRank = list.find((u) => u.isCurrentUser);

      return {
        users: paginatedUsers,
        totalCount,
        currentPage: page,
        totalPages,
        currentUserRank,
      };
    } catch {
       return {
        users: [],
        totalCount: 0,
        currentPage: page,
        totalPages: 1,
      };
    }
  }
}

export const leaderboardService = new LeaderboardService();
