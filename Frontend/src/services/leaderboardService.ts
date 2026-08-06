// INTERN 4 CHECKPOINT: Leaderboard Service
// This service manages leaderboard functionality for the sign language platform
// It handles ranking, filtering, sorting, and pagination of user performance data

import { LeaderboardUser } from '../types';
import { mockLeaderboardUsers } from '../mockData';

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
  private users: LeaderboardUser[] = [...mockLeaderboardUsers];

  // INTERN 4 CHECKPOINT: Leaderboard data retrieval with filtering and sorting
  // Retrieves leaderboard data with support for time range filtering, sorting by metrics,
  // search functionality, and pagination
  async getLeaderboard(params: FetchLeaderboardParams = {}): Promise<FetchLeaderboardResult> {
    await new Promise((r) => setTimeout(r, 250));

    const {
      timeRange = 'week',
      sortBy = 'points',
      searchQuery = '',
      page = 1,
      pageSize = 5,
    } = params;

    let list = [...this.users];

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((u) => u.name.toLowerCase().includes(q));
    }

    // Sort by metric
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

    // Re-assign ranks dynamically after sorting
    list = list.map((u, idx) => ({ ...u, rank: idx + 1 }));

    // Slight simulation adjustments based on timeRange
    if (timeRange === 'today') {
      list = list.map((u) => ({ ...u, points: Math.round(u.points * 0.2) }));
    } else if (timeRange === 'month') {
      list = list.map((u) => ({ ...u, points: Math.round(u.points * 3.5) }));
    }

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
  }
}

export const leaderboardService = new LeaderboardService();
