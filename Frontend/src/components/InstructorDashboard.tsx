import React, { useState } from 'react';
import {
  Users, BookOpen, TrendingUp, Award, Search, ChevronRight,
  BarChart3, CheckCircle, Clock, AlertCircle, Filter, Download
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts';
import {
  mockInstructorStudents,
  mockInstructorClassPerformance,
  mockInstructorWeeklyActivity
} from '../mockData';
import StudentProfileModal from './StudentProfileModal';

export default function InstructorDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'at-risk' | 'top'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'progress'>('name');
  const [selectedStudentName, setSelectedStudentName] = useState<string | null>(null);

  const stats = [
    {
      id: 'instr_stat_students',
      label: 'Total Students',
      value: '34',
      change: '+3 this month',
      changePositive: true,
      icon: Users,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      id: 'instr_stat_accuracy',
      label: 'Average Accuracy',
      value: '81%',
      change: '+2.4% this week',
      changePositive: true,
      icon: TrendingUp,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
    },
    {
      id: 'instr_stat_active',
      label: 'Active Students',
      value: '28',
      change: 'practiced this week',
      changePositive: true,
      icon: CheckCircle,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      id: 'instr_stat_completed',
      label: 'Lessons Completed Today',
      value: '14',
      change: '+4 vs yesterday',
      changePositive: true,
      icon: BookOpen,
      bg: 'bg-amber-50',
      color: 'text-amber-500',
    },
  ];

  const filteredStudents = mockInstructorStudents
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());
      if (activeFilter === 'at-risk') return matchesSearch && s.accuracy < 70;
      if (activeFilter === 'top') return matchesSearch && s.accuracy >= 90;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'progress') {
        const progressA = (a.lessonsCompleted / 30) * 100;
        const progressB = (b.lessonsCompleted / 30) * 100;
        return progressB - progressA; 
      }
      return a.name.localeCompare(b.name);
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance Bar Chart */}
        <div id="instr_class_performance_chart" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-gray-900">Class Performance by Lesson</h3>
            <p className="text-xs text-gray-500">Average accuracy per lesson topic</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mockInstructorClassPerformance} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="lesson" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.04)', rx: 8, ry: 8 }}
                  contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)', borderRadius: '12px', border: '1px solid rgba(0, 0, 0, 0.08)', fontSize: '12px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
                  formatter={(v: number) => [`${v}%`, 'Avg Accuracy']}
                />
                <Bar dataKey="avgAccuracy" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Activity Line Chart */}
        <div id="instr_weekly_activity_chart" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-gray-900">Weekly Student Activity</h3>
            <p className="text-xs text-gray-500">Sessions and completions over the past week</p>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={mockInstructorWeeklyActivity} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="sessions" stroke="#2563EB" strokeWidth={2} dot={false} name="Sessions" />
                <Line type="monotone" dataKey="completions" stroke="#10B981" strokeWidth={2} dot={false} name="Completions" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

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
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                <th className="px-5 py-3 text-left font-semibold">Student</th>
                <th className="px-5 py-3 text-left font-semibold">Lessons Done</th>
                <th className="px-5 py-3 text-left font-semibold">Progress %</th>
                <th className="px-5 py-3 text-left font-semibold">Avg Accuracy</th>
                <th className="px-5 py-3 text-left font-semibold">Streak</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-left font-semibold">Last Active</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.length > 0 ? filteredStudents.map((student) => {
                const badge = getStatusBadge(student.accuracy);
                return (
                  <tr key={student.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 border border-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                          {student.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{student.name}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">{student.lessonsCompleted}</td>
                    <td className="px-5 py-4 text-gray-700 font-medium">{Math.round((student.lessonsCompleted / 30) * 100)}%</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 max-w-20 bg-gray-100 rounded-full h-1.5">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${student.accuracy}%`,
                              backgroundColor: student.accuracy >= 75 ? '#10B981' : student.accuracy >= 60 ? '#F59E0B' : '#EF4444'
                            }}
                          />
                        </div>
                        <span className="text-xs font-semibold text-gray-700">{student.accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-gray-700 font-medium">{student.streak}d 🔥</td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${badge.cls}`}>{badge.label}</span>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{student.lastActive}</td>
                    <td className="px-5 py-4">
                      <button 
                        onClick={() => setSelectedStudentName(student.name)}
                        className="text-blue-600 hover:text-blue-800 transition flex items-center gap-1 text-xs font-semibold"
                      >
                        View Progress <ChevronRight className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <AlertCircle className="h-8 w-8" />
                      <p className="text-sm font-medium">No students match your criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-gray-100 flex justify-end">
          <button
            id="instr_export_btn"
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-blue-600 transition"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Modal */}
      {selectedStudentName && (
        <StudentProfileModal 
          studentName={selectedStudentName} 
          onClose={() => setSelectedStudentName(null)} 
        />
      )}
    </div>
  );
}
