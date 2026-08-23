import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, TrendingUp, Search, ChevronRight,
  CheckCircle, AlertCircle, Filter, Download
} from 'lucide-react';
import { apiBaseUrl } from '../utils/api';

interface LearnerSummary {
  learner_id: number;
  username: string;
  practice_attempts: number;
  average_accuracy: number;
}

export default function InstructorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'at-risk' | 'top'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress'>('name');
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);

  const [learners, setLearners] = useState<LearnerSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLearners = async () => {
      try {
        const token = localStorage.getItem('asl_access_token');
        const res = await fetch(`${apiBaseUrl}/instructors/learners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLearners(data);
        }
      } catch (e) {
        console.error('Failed to load learners:', e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLearners();
  }, []);

  const handleExportCSV = () => {
    const headers = ['Learner ID,Username,Practice Attempts,Average Accuracy'];
    const rows = filteredStudents.map(s => `${s.learner_id},${s.username},${s.practice_attempts},${s.average_accuracy}%`);
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "instructor_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalAttempts = learners.reduce((sum, l) => sum + l.practice_attempts, 0);
  const avgAccuracyTotal = learners.length > 0 ? (learners.reduce((sum, l) => sum + l.average_accuracy, 0) / learners.length).toFixed(1) : '0';

  const stats = [
    {
      id: 'instr_stat_students',
      label: 'Assigned Learners',
      value: learners.length.toString(),
      change: 'Real-time API metrics',
      changePositive: true,
      icon: Users,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      id: 'instr_stat_accuracy',
      label: 'Average Class Accuracy',
      value: `${avgAccuracyTotal}%`,
      change: 'Calculated organically',
      changePositive: true,
      icon: TrendingUp,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
    },
    {
      id: 'instr_stat_active',
      label: 'Total Practice Attempts',
      value: totalAttempts.toString(),
      change: 'Active submissions recorded',
      changePositive: true,
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    }
  ];

  const filteredStudents = learners
    .filter((s) => {
      const matchesSearch = s.username.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeFilter === 'at-risk') return matchesSearch && s.average_accuracy < 70;
      if (activeFilter === 'top') return matchesSearch && s.average_accuracy >= 90;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'progress') {
        return b.practice_attempts - a.practice_attempts; 
      }
      return a.username.localeCompare(b.username);
    });

  const getStatusBadge = (accuracy: number) => {
    if (accuracy >= 90) return { label: 'Excellent', cls: 'bg-emerald-50 text-emerald-700' };
    if (accuracy >= 75) return { label: 'Good', cls: 'bg-blue-50 text-blue-700' };
    if (accuracy >= 60) return { label: 'Needs Work', cls: 'bg-amber-50 text-amber-700' };
    return { label: 'At Risk', cls: 'bg-red-50 text-red-700' };
  };

  return (
    <div id="instructor_dashboard" className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-gray-900 tracking-tight flex items-center">
          Instructor Dashboard <img src="/signs/hello_nobg.png" alt="ASL Hello Gesture" className="inline-block h-8 w-8 ml-3 hover:animate-asl-salute transition-transform origin-bottom drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] pb-1 pointer-events-none select-none" />
        </h1>
        <p className="text-sm text-gray-500 mt-1">Monitor student progress, lesson completion, and class performance metrics.</p>
      </div>

      {/* Stats Grid */}
      <div id="instr_stats_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.id} id={stat.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <span className={`text-xs font-medium ${stat.changePositive === true ? 'text-emerald-600' : stat.changePositive === false ? 'text-red-500' : 'text-gray-400'}`}>
                  {stat.change}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      {/* Charts Row completely removed per api logic mock teardown constraints */}

      {/* Student Roster */}
      <div id="instr_student_roster" className="bg-white rounded-xl border border-gray-100 shadow-sm">
        {/* Roster Header */}
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h3 className="font-bold text-base text-gray-900">Student Roster</h3>
            <p className="text-xs text-gray-500">{filteredStudents.length} students shown</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                id="instr_student_search"
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-56"
              />
            </div>
            {/* Filter */}
            <div className="flex items-center gap-1">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'progress')}
                className="text-xs border border-gray-200 rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white cursor-pointer mr-2"
              >
                <option value="name">Sort by Name</option>
                <option value="progress">Sort by Progress</option>
              </select>
              {(['all', 'at-risk', 'top'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition capitalize ${activeFilter === f ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500 font-semibold animate-pulse">Loading learners from backend...</div>
          ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-semibold">Student Username</th>
                <th className="px-5 py-3 text-left font-semibold">Practice Attempts</th>
                <th className="px-5 py-3 text-left font-semibold">Avg Accuracy</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                const badge = getStatusBadge(student.average_accuracy);
                return (
                  <tr key={student.learner_id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                          {student.username.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">{student.practice_attempts}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${student.average_accuracy}%`,
                              backgroundColor: student.average_accuracy >= 75 ? '#10B981' : student.average_accuracy >= 60 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{student.average_accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={4} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm font-medium">No students match your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            id="instr_export_btn"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>
    </div>
  );
}
