import React, { useState } from 'react';
import { Camera, Award, Zap, Clock, ShieldCheck, CheckCircle2, Search, Filter, ArrowUpRight } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockPracticeHistory, accuracyProgressData, categoryBreakdownData } from '../mockData';

export default function ReportsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState<number | 'All'>('All');

  // Stats calculation
  const totalSessions = mockPracticeHistory.length + 36; // combined with historical baseline
  const avgScore = 87;
  const avgAccuracy = 88;
  const practiceTimeMinutes = 230; // ~ 3.8 hours

  // Filter history
  const filteredHistory = mockPracticeHistory.filter((session) => {
    const matchesSearch = session.lessonName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          session.signSymbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = minScoreFilter === 'All' || session.score >= minScoreFilter;
    return matchesSearch && matchesScore;
  });

  const getAccuracyColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50';
    if (score >= 80) return 'text-blue-600 bg-blue-50';
    return 'text-amber-600 bg-amber-50';
  };

  return (
    <div id="reports_view" className="space-y-6">
      <div>
        <h1 id="reports_title" className="font-sans font-bold text-2xl text-gray-950 tracking-tight">Performance Analytics</h1>
        <p className="text-sm text-gray-500">Track your sign precision trends, compliance logs, and system diagnostics over time.</p>
      </div>

      {/* Reports Metrics Cards */}
      <div id="reports_stats_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sessions</p>
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{totalSessions}</h3>
            <span className="text-xs font-semibold text-emerald-600">+12% vs last month</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <Camera className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{avgScore}%</h3>
            <span className="text-xs font-semibold text-emerald-600">Grade A- Standard</span>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sign Accuracy</p>
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{avgAccuracy}%</h3>
            <span className="text-xs font-semibold text-emerald-600">+1.5% improvement</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Practice Time</p>
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{Math.round(practiceTimeMinutes / 60)} hrs {practiceTimeMinutes % 60} mins</h3>
            <span className="text-xs font-semibold text-emerald-600">Active today</span>
          </div>
          <div className="p-3 rounded-lg bg-amber-50 text-amber-600">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Practice Time Chart */}
        <div id="chart_practice_time" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Daily Engagement Time</h3>
            <p className="text-xs text-gray-500">Minutes spent practicing signs on camera per day</p>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={accuracyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontFamily: 'sans-serif', fontSize: '12px' }}
                />
                <Bar dataKey="time" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Accuracy Chart */}
        <div id="chart_category_breakdown" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Accuracy Breakdown by Category</h3>
            <p className="text-xs text-gray-500">Average accuracy score across different syllabus domains</p>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccuracyCategory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontFamily: 'sans-serif', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracyCategory)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Recent assessments table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Recent Assessment Audits</h3>
            <p className="text-xs text-gray-500">Detailed historical breakdown of handshape precision analysis</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search */}
            <div className="relative w-full sm:w-48">
              <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                <Search className="h-3.5 w-3.5 text-gray-400" />
              </div>
              <input
                id="reports_table_search"
                type="text"
                placeholder="Search signs, lessons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-8 pr-3 py-1.5 border border-gray-200 bg-white rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            {/* Score filter */}
            <div className="flex items-center space-x-1.5 w-full sm:w-auto shrink-0">
              <span className="text-xs text-gray-500">Score:</span>
              <select
                id="reports_score_select"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="block border border-gray-200 bg-white rounded-lg text-xs p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="All">All Scores</option>
                <option value="90">90% + (Excellent)</option>
                <option value="80">80% + (Good)</option>
                <option value="70">70% + (Pass)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Responsive Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm text-gray-500">
            <thead className="bg-white text-xs text-gray-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Lesson Name</th>
                <th className="px-6 py-3.5">Tested Sign</th>
                <th className="px-6 py-3.5">Accuracy</th>
                <th className="px-6 py-3.5">System Feedback</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {filteredHistory.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50/50 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{row.lessonName}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-sans font-extrabold text-sm text-gray-900 bg-gray-100 px-2 py-0.5 rounded">
                      {row.signSymbol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${getAccuracyColor(row.accuracy)}`}>
                      {row.accuracy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate">{row.feedback}</td>
                </tr>
              ))}

              {filteredHistory.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-sans text-xs">
                    No assessments matched your filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
