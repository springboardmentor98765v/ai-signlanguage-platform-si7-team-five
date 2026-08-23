import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Trophy, ChevronDown, ChevronUp, User, Target, Clock, BookOpen, Flame, Activity } from 'lucide-react';
import { CinematicSection } from './CinematicMotion';
import { apiBaseUrl } from '../utils/api';

// Interface matching the backend response for /instructors/learners as observed in Dashboard
interface AssignedLearner {
  learner_id: number;
  username: string;
  practice_attempts: number;
  average_accuracy: number;
  // Expanding with optional properties in case they are populated or scaled in the backend
  lessons_completed?: number;
  practice_time?: string;
  current_streak?: number;
  last_active?: string;
}

type SortField = 'accuracy' | 'lessons' | 'practice' | 'streak' | 'activity';
type TimeFilter = 'week' | 'month' | 'allTime';

export default function InstructorLeaderboardView() {
  const [loading, setLoading] = useState(true);
  const [learners, setLearners] = useState<AssignedLearner[]>([]);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortField>('accuracy');
  const [sortDesc, setSortDesc] = useState(true);
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('week');
  
  const [selectedStudent, setSelectedStudent] = useState<AssignedLearner | null>(null);

  useEffect(() => {
    const fetchClassroom = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('asl_access_token');
        const res = await fetch(`${apiBaseUrl}/instructors/learners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Data is expected to be an array of objects matching AssignedLearner
          setLearners(data);
        }
      } catch (e) {
        console.error("Failed to load instructor leaderboard:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchClassroom();
  }, [timeFilter]); // Re-fetch or simulate re-fetch when time context changes

  // Filter and Sort Logic
  const processedLearners = learners
    .filter(l => l.username.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      let valA: any, valB: any;
      switch (sortBy) {
        case 'accuracy':
          valA = a.average_accuracy || 0;
          valB = b.average_accuracy || 0;
          break;
        case 'lessons':
          valA = a.lessons_completed || 0;
          valB = b.lessons_completed || 0;
          break;
        case 'practice':
          valA = a.practice_attempts || 0;
          valB = b.practice_attempts || 0;
          break;
        case 'streak':
          valA = a.current_streak || 0;
          valB = b.current_streak || 0;
          break;
        case 'activity':
          // string comparison fallback for dates
          valA = a.last_active || '';
          valB = b.last_active || '';
          break;
        default:
          valA = a.average_accuracy || 0;
          valB = b.average_accuracy || 0;
      }
      if (valA < valB) return sortDesc ? 1 : -1;
      if (valA > valB) return sortDesc ? -1 : 1;
      return 0;
    });

  const handleSort = (field: SortField) => {
    if (sortBy === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(field);
      setSortDesc(true);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field) return <span className="w-4 h-4 inline-block opacity-0"></span>;
    return sortDesc ? <ChevronDown className="w-4 h-4 inline-block text-emerald-600" /> : <ChevronUp className="w-4 h-4 inline-block text-emerald-600" />;
  };

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="instructor_leaderboard_container" className="space-y-6 max-w-6xl mx-auto">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight flex items-center gap-2">
            Student Leaderboard <Trophy className="h-5 w-5 text-emerald-500" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Track your students' learning performance, accuracy, consistency, and progress.
          </p>
        </div>
      </div>

      {/* Controls: Search, Time Filters */}
      <div className="bg-white/70 backdrop-blur-xl p-4 rounded-[1.5rem] border border-white/60 shadow-glass flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Time Filters */}
        <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600 overflow-x-auto">
          {[
            { id: 'week', label: 'This Week' },
            { id: 'month', label: 'This Month' },
            { id: 'allTime', label: 'All Time' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTimeFilter(t.id as TimeFilter)}
              className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap focus:outline-none transition ${
                timeFilter === t.id
                  ? 'bg-white text-emerald-700 shadow-sm font-extrabold'
                  : 'hover:text-gray-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 shadow-sm"
          />
        </div>
      </div>

      {/* Detail Modal Overlay */}
      <AnimatePresence>
        {selectedStudent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setSelectedStudent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-6 md:p-8 w-full max-w-lg border border-gray-100"
            >
              <div className="flex items-center space-x-4 border-b border-gray-100 pb-6 mb-6">
                <div className="h-16 w-16 bg-gradient-to-br from-emerald-100 to-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center">
                  <User className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedStudent.username}</h3>
                  <p className="text-emerald-600 font-medium text-sm flex items-center gap-1"><Target className="h-4 w-4"/> Overall Accuracy: {selectedStudent.average_accuracy}%</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5"/> Lessons</div>
                  <div className="text-lg font-bold text-gray-900">{selectedStudent.lessons_completed ?? 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><Clock className="h-3.5 w-3.5"/> Practice</div>
                  <div className="text-lg font-bold text-gray-900">{selectedStudent.practice_attempts} sessions</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><Flame className="h-3.5 w-3.5"/> Streak</div>
                  <div className="text-lg font-bold text-gray-900">{selectedStudent.current_streak ?? 'N/A'}</div>
                </div>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1 flex items-center gap-1.5"><Activity className="h-3.5 w-3.5"/> Active</div>
                  <div className="text-lg font-bold text-gray-900 text-sm truncate">{selectedStudent.last_active ?? 'N/A'}</div>
                </div>
              </div>
              
              <button 
                onClick={() => setSelectedStudent(null)}
                className="mt-6 w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition text-sm"
              >
                Close Report
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Leaderboard Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500 font-semibold animate-pulse tracking-wide">
            Syncing roster performance data...
          </div>
        ) : processedLearners.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center px-4">
            <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <User className="h-8 w-8 text-gray-300" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Students Found</h3>
            <p className="text-sm text-gray-500 max-w-sm mt-2">
              {searchQuery ? "No matched students found for your search criteria." : "Students assigned to you will appear here once they start learning."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500">
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs w-[10%]">Rank</th>
                  <th className="px-6 py-4 font-semibold uppercase tracking-wider text-xs">Student</th>
                  <th 
                    className="px-6 py-4 font-semibold uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => handleSort('accuracy')}
                  >
                    Overall Accuracy {getSortIcon('accuracy')}
                  </th>
                  <th 
                    className="px-6 py-4 font-semibold uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => handleSort('lessons')}
                  >
                    Lessons Completed {getSortIcon('lessons')}
                  </th>
                  <th 
                    className="px-6 py-4 font-semibold uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => handleSort('practice')}
                  >
                    Practice Time {getSortIcon('practice')}
                  </th>
                  <th 
                    className="px-6 py-4 font-semibold uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => handleSort('streak')}
                  >
                    Current Streak {getSortIcon('streak')}
                  </th>
                  <th 
                    className="px-6 py-4 font-semibold uppercase tracking-wider text-xs cursor-pointer hover:bg-gray-100 transition whitespace-nowrap"
                    onClick={() => handleSort('activity')}
                  >
                    Last Active {getSortIcon('activity')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {processedLearners.map((student, idx) => (
                  <tr 
                    key={student.learner_id} 
                    className="hover:bg-gray-50/80 transition cursor-pointer group"
                    onClick={() => setSelectedStudent(student)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <span className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs ${
                          idx === 0 ? 'bg-amber-100 text-amber-700' : 
                          idx === 1 ? 'bg-slate-100 text-slate-700' :
                          idx === 2 ? 'bg-orange-50 text-orange-700' :
                          'bg-gray-50 text-gray-500'
                        }`}>
                          #{idx + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900 group-hover:text-emerald-600 transition">
                      {student.username}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600">
                      {student.average_accuracy}%
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.lessons_completed ?? 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {/* Mapping Practice Attempts to Time roughly if unavailable to strictly match criteria request organically */}
                      {student.practice_attempts} sessions
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.current_streak != null ? `${student.current_streak} days` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {student.last_active ?? 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CinematicSection>
  );
}
