import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Crown,
  Flame,
  Target,
  BookOpen,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  Zap,
  Medal,
} from 'lucide-react';
import { LeaderboardUser } from '../types';
import {
  leaderboardService,
  TimeRangeFilter,
  SortOption,
} from '../services/leaderboardService';
import { CinematicSection } from './CinematicMotion';

export default function LeaderboardView() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & State
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('week');
  const [sortBy, setSortBy] = useState<SortOption>('points');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchData();
  }, [timeRange, sortBy, searchQuery, page]);

  const fetchData = async () => {
    setLoading(true);
    const result = await leaderboardService.getLeaderboard({
      timeRange,
      sortBy,
      searchQuery,
      page,
      pageSize,
    });

    setUsers(result.users);
    setTotalCount(result.totalCount);
    setTotalPages(result.totalPages);
    if (result.currentUserRank) {
      setCurrentUserRank(result.currentUserRank);
    }
    setLoading(false);
  };

  // Top 3 Podium Users (derived from overall top ranked)
  const top1 = users.find((u) => u.rank === 1) || users[0];
  const top2 = users.find((u) => u.rank === 2) || users[1];
  const top3 = users.find((u) => u.rank === 3) || users[2];

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="leaderboard_view_container" className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-100/80 mb-2">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Global Signing Community</span>
          </div>
          <h1 id="leaderboard_title" className="text-2xl md:text-3xl font-black text-gray-950 tracking-tight">
            Leaderboard Rankings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Compete with ASL learners worldwide based on signing accuracy, streak consistency, and completed lessons!
          </p>
        </div>

        {/* Current User Rank Card (Quick Banner) */}
        {currentUserRank && (
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 rounded-2xl shadow-md border border-emerald-400 flex items-center space-x-4 shrink-0">
            <div className="h-12 w-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center font-black text-lg text-amber-200">
              #{currentUserRank.rank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-100 uppercase tracking-wider">Your Rank</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 text-[10px] font-black uppercase">
                  YOU
                </span>
              </div>
              <p className="text-sm font-extrabold text-white">
                {currentUserRank.points.toLocaleString()} Points • {currentUserRank.accuracy}% Acc
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Top 3 Podium Display Widget */}
      <div className="bg-gradient-to-b from-gray-900/95 via-gray-900/95 to-emerald-950/95 backdrop-blur-2xl rounded-[2rem] p-6 md:p-10 text-white shadow-premium relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-0 right-1/2 translate-x-1/2 -mt-12 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <h2 className="text-lg font-bold text-amber-400 tracking-wider uppercase flex items-center justify-center space-x-2">
            <Sparkles className="h-4 w-4" />
            <span>Weekly Champions Podium</span>
            <Sparkles className="h-4 w-4" />
          </h2>
        </div>

        {/* Podium Pillars */}
        <div className="flex items-end justify-center gap-2 sm:gap-6 max-w-2xl mx-auto pt-6">
          {/* 2nd Place */}
          {top2 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-3 text-center">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-slate-300 overflow-hidden shadow-lg mx-auto bg-slate-800">
                  {top2.avatarUrl ? (
                    <img src={top2.avatarUrl} alt={top2.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-slate-300">
                      {top2.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-slate-300 text-slate-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  2ND
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold truncate max-w-[100px] text-slate-200">{top2.name}</p>
              <p className="text-[11px] font-extrabold text-amber-400 mt-0.5">{top2.points} XP</p>

              {/* Pillar Block */}
              <div className="w-full bg-gradient-to-t from-slate-800 to-slate-700 h-28 sm:h-36 rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-slate-400">
                <Medal className="h-8 w-8 text-slate-300" />
              </div>
            </motion.div>
          )}

          {/* 1st Place (Center & Taller) */}
          {top1 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex-1 flex flex-col items-center z-10"
            >
              <div className="relative mb-3 text-center">
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
                  className="absolute -top-6 right-1/2 translate-x-1/2 text-amber-400"
                >
                  <Crown className="h-7 w-7 fill-amber-400" />
                </motion.div>
                <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-full border-4 border-amber-400 overflow-hidden shadow-2xl mx-auto bg-amber-900/50 ring-4 ring-amber-400/30">
                  {top1.avatarUrl ? (
                    <img src={top1.avatarUrl} alt={top1.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-amber-300 text-lg">
                      {top1.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-amber-400 text-amber-950 text-xs font-black px-2.5 py-0.5 rounded-full shadow-lg">
                  1ST
                </span>
              </div>
              <p className="text-sm sm:text-base font-black truncate max-w-[120px] text-amber-200">{top1.name}</p>
              <p className="text-xs sm:text-sm font-black text-amber-400 mt-0.5">{top1.points} XP</p>

              {/* Pillar Block */}
              <div className="w-full bg-gradient-to-t from-amber-700 via-amber-600 to-amber-500 h-36 sm:h-48 rounded-t-2xl mt-3 flex items-center justify-center border-t-4 border-amber-300 shadow-amber-500/20 shadow-xl">
                <Trophy className="h-10 w-10 text-amber-100" />
              </div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {top3 && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex-1 flex flex-col items-center"
            >
              <div className="relative mb-3 text-center">
                <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full border-4 border-amber-700 overflow-hidden shadow-lg mx-auto bg-amber-950">
                  {top3.avatarUrl ? (
                    <img src={top3.avatarUrl} alt={top3.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center font-bold text-amber-600">
                      {top3.name.substring(0, 2)}
                    </div>
                  )}
                </div>
                <span className="absolute -bottom-2 right-1/2 translate-x-1/2 bg-amber-800 text-amber-100 text-[10px] font-black px-2 py-0.5 rounded-full shadow">
                  3RD
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold truncate max-w-[100px] text-amber-100">{top3.name}</p>
              <p className="text-[11px] font-extrabold text-amber-400 mt-0.5">{top3.points} XP</p>

              {/* Pillar Block */}
              <div className="w-full bg-gradient-to-t from-amber-950 to-amber-900 h-24 sm:h-30 rounded-t-2xl mt-3 flex items-center justify-center border-t-2 border-amber-700">
                <Medal className="h-7 w-7 text-amber-600" />
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Controls: Search, Time Filters, Sorting */}
      <div className="bg-white/70 backdrop-blur-xl p-4 md:p-5 rounded-[1.5rem] border border-white/60 shadow-glass space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Time Range Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600 overflow-x-auto">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'allTime', label: 'All Time' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTimeRange(t.id);
                  setPage(1);
                }}
                aria-label={`Time range ${t.label}`}
                aria-pressed={timeRange === t.id}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  timeRange === t.id
                    ? 'bg-white text-emerald-700 shadow-sm font-extrabold'
                    : 'hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Sort options */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by learner name..."
                aria-label="Search by learner name"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sort By Select */}
            <div className="w-full sm:w-auto flex items-center space-x-2 text-xs font-semibold text-gray-600">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setPage(1);
                }}
                aria-label="Sort by"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="points">Points / XP</option>
                <option value="accuracy">Accuracy %</option>
                <option value="streak">Streak Days</option>
                <option value="lessons">Lessons Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table / Mobile Cards */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-glass overflow-hidden">
        {loading ? (
          /* Skeletons */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900">No Learners Found</h4>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or time range filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Learner</th>
                    <th className="py-3.5 px-6">Accuracy</th>
                    <th className="py-3.5 px-6">Streak</th>
                    <th className="py-3.5 px-6">Lessons</th>
                    <th className="py-3.5 px-6">Badges</th>
                    <th className="py-3.5 px-6 text-right">Points / XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={`transition ${
                        u.isCurrentUser
                          ? 'bg-emerald-50/70 border-l-4 border-emerald-500 font-semibold'
                          : 'hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-4 px-6 font-black text-gray-900">
                        {u.rank === 1 ? (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                            👑 1
                          </span>
                        ) : u.rank === 2 ? (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
                            🥈 2
                          </span>
                        ) : u.rank === 3 ? (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-900/10 text-amber-900 text-xs font-bold">
                            🥉 3
                          </span>
                        ) : (
                          <span className="text-gray-500 pl-2">#{u.rank}</span>
                        )}
                      </td>

                      {/* Learner Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                            ) : (
                              u.name.substring(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">{u.name}</span>
                              {u.isCurrentUser && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded-full">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{u.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Accuracy */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <Target className="h-4 w-4 text-emerald-600" />
                          <span className="font-bold text-gray-900">{u.accuracy}%</span>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-gray-900">{u.streak} Days</span>
                        </div>
                      </td>

                      {/* Lessons */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-bold text-gray-900">{u.lessonsCompleted}</span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <Award className="h-4 w-4 text-violet-500" />
                          <span className="font-bold text-gray-900">{u.badgesCount}</span>
                        </div>
                      </td>

                      {/* Points / XP */}
                      <td className="py-4 px-6 text-right font-black text-emerald-700 text-base">
                        {u.points.toLocaleString()} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-gray-100">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={`p-4 flex items-center justify-between space-x-3 ${
                    u.isCurrentUser ? 'bg-emerald-50/80 border-l-4 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="font-black text-sm text-gray-700 shrink-0 w-6">#{u.rank}</span>
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                      {u.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                        {u.isCurrentUser && (
                          <span className="px-1.5 py-0.2 text-[9px] font-black bg-emerald-600 text-white rounded">YOU</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {u.accuracy}% Acc • {u.streak}d Streak
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-700 block">{u.points} XP</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{u.lessonsCompleted} Lessons</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong className="text-gray-900">{users.length}</strong> of{' '}
            <strong className="text-gray-900">{totalCount}</strong> learners
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-gray-800" aria-live="polite">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </CinematicSection>
  );
}
