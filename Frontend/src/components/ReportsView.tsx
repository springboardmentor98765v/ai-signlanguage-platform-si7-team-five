import React, { useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, LineChart, Activity, Award, Clock, ArrowUpRight, ArrowDownRight, Target, BrainCircuit, AlertCircle, PlayCircle, Search, Filter, Download, Calendar, FileSpreadsheet, FileText, Check, Camera, Zap, CheckCircle2, Star, Trophy, ShieldCheck, Printer } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { mockPracticeHistory, accuracyProgressData, categoryBreakdownData } from '../mockData';
import { exportService } from '../services/exportService';
import { CinematicSection } from './CinematicMotion';

export default function ReportsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState<number | 'All'>('All');
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'excel' | 'pdf' | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);

  // Export Trigger Handler
  const handleExport = async (format: 'csv' | 'excel' | 'pdf') => {
    setExportingFormat(format);
    const result = await exportService.exportReport(mockPracticeHistory, {
      format,
      includePracticeHistory: true,
      includeAccuracyMetrics: true,
      dateRange: 'Last 30 Days',
    });

    // Create invisible anchor and trigger browser download
    const link = document.createElement('a');
    link.href = result.blobUrl;
    link.download = result.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setExportingFormat(null);
    setExportSuccess(`Exported report as ${format.toUpperCase()}`);
    setTimeout(() => setExportSuccess(null), 3000);
  };

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
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="reports_view" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="reports_title" className="font-sans font-bold text-2xl text-gray-950 tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-gray-500">Track your sign precision trends, compliance logs, and system diagnostics over time.</p>
        </div>

        {/* Export Toolbar */}
        <div className="flex items-center space-x-2 shrink-0">
          <motion.button
            onClick={() => handleExport('csv')}
            disabled={exportingFormat !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-label="Export as CSV"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <FileText className="h-4 w-4 text-emerald-600" />
            <span>{exportingFormat === 'csv' ? 'Exporting...' : 'Export CSV'}</span>
          </motion.button>

          <motion.button
            onClick={() => handleExport('excel')}
            disabled={exportingFormat !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-label="Export as Excel"
            className="flex items-center space-x-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>{exportingFormat === 'excel' ? 'Exporting...' : 'Export Excel'}</span>
          </motion.button>

          <motion.button
            onClick={() => handleExport('pdf')}
            disabled={exportingFormat !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            aria-label="Export as PDF"
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>{exportingFormat === 'pdf' ? 'Exporting...' : 'Download PDF'}</span>
          </motion.button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{exportSuccess}</span>
        </div>
      )}

      {/* Reports Metrics Cards */}
      <div id="reports_stats_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Sessions</p>
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{totalSessions}</h3>
            <span className="text-xs font-semibold text-emerald-600">+12% vs last month</span>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 text-emerald-600">
            <Camera className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Average Score</p>
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{avgScore}%</h3>
            <span className="text-xs font-semibold text-emerald-600">Grade A- Standard</span>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600">
            <Award className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Sign Accuracy</p>
            <h3 className="text-2xl font-bold text-gray-900 font-sans">{avgAccuracy}%</h3>
            <span className="text-xs font-semibold text-emerald-600">+1.5% improvement</span>
          </div>
          <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex items-start justify-between">
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
        <div id="chart_practice_time" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 flex flex-col justify-between hover:bg-white/85 hover:shadow-premium transition-all duration-300">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Weekly Progress Graph</h3>
            <p className="text-xs text-gray-500">Minutes spent practicing signs on camera this week</p>
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
        <div id="chart_category_breakdown" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 flex flex-col justify-between hover:bg-white/85 hover:shadow-premium transition-all duration-300">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Monthly Progress Graph</h3>
            <p className="text-xs text-gray-500">Average accuracy score across different syllabus domains this month</p>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Insights Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] overflow-hidden p-6 lg:col-span-1 hover:bg-white/85 hover:shadow-premium transition-all duration-300">
          <div className="mb-4">
            <h3 className="font-sans font-bold text-base text-gray-950">Performance Insights</h3>
            <p className="text-xs text-gray-500">Signs that need attention</p>
          </div>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Strong Signs
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Hello', 'Thank You', 'Yes', 'No', 'A', 'B'].map((sign) => (
                  <span key={sign} className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-100">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2 mb-3">
                <Zap className="h-4 w-4 text-amber-500" /> Weak Signs
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Letter J', 'Letter Z', 'Sorry', 'Please'].map((sign) => (
                  <span key={sign} className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-100">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Achievement Badges Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] overflow-hidden p-6 lg:col-span-2 hover:bg-white/85 hover:shadow-premium transition-all duration-300">
          <div className="mb-4">
            <h3 className="font-sans font-bold text-base text-gray-950">Achievement Badges</h3>
            <p className="text-xs text-gray-500">Your earned recognitions</p>
          </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { title: 'Fast Learner', desc: 'Completed 5 lessons in a day', icon: Zap, color: 'text-amber-500', bg: 'bg-amber-100' },
            { title: 'Perfect Accuracy', desc: '100% in a practice session', icon: Star, color: 'text-emerald-500', bg: 'bg-emerald-100' },
            { title: 'Consistent', desc: '7 day practice streak', icon: Trophy, color: 'text-blue-500', bg: 'bg-blue-100' },
            { title: 'Sign Master', desc: 'Top 10% in class', icon: ShieldCheck, color: 'text-purple-500', bg: 'bg-purple-100' },
          ].map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div key={idx} className="flex flex-col items-center p-4 border border-gray-100 rounded-xl text-center bg-gray-50">
                <div className={`p-3 rounded-full ${badge.bg} ${badge.color} mb-3`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-bold text-gray-900">{badge.title}</h4>
                <p className="text-[10px] text-gray-500 mt-1">{badge.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>

    {/* Recent assessments table */}
    <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] overflow-hidden hover:bg-white/85 hover:shadow-premium transition-all duration-300">
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

      {/* Professional Certificate Section */}
      <motion.div 
        initial="hidden"
        whileInView="visible"
        viewport={{ once: false, amount: 0.2 }}
        className="relative max-w-4xl mx-auto mt-16 mb-8 group"
      >
        
        {/* Top Static Scroll Roller */}
        <div className="absolute top-[-6px] left-[-1%] w-[102%] h-[12px] bg-gradient-to-b from-[#e2e8f0] to-[#94a3b8] rounded-full shadow-[0_4px_10px_rgba(0,0,0,0.1)] border border-white/60 z-30 pointer-events-none" />

        {/* The Animated Pull Thread & Bottom Bar (rides the unrolling edge) */}
        <motion.div
          className="absolute left-0 right-0 z-30 flex flex-col items-center pointer-events-none"
          variants={{
            hidden: { top: '0%', opacity: 0 },
            visible: { top: '100%', opacity: [0, 1, 1, 0] }
          }}
          transition={{ duration: 3.5, ease: [0.25, 1, 0.4, 1], times: [0, 0.1, 0.9, 1] }}
        >
          {/* Bottom Scroll Roller */}
          <div className="w-[102%] -ml-[1%] h-[12px] bg-gradient-to-b from-[#e2e8f0] to-[#94a3b8] rounded-full shadow-[0_4px_12px_rgba(0,0,0,0.15)] border border-white/60" />
          
          {/* Hanging Thread */}
          <div className="w-[2px] h-[40px] bg-gradient-to-b from-amber-700/80 to-amber-500 shadow-sm" />
          
          {/* Pull Ring */}
          <div className="w-8 h-8 rounded-full border-[3.5px] border-amber-500 bg-white/60 backdrop-blur-sm shadow-[0_4px_12px_rgba(245,158,11,0.4)] flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          </div>
          
          <span className="mt-2 text-[9px] font-extrabold text-amber-700/70 uppercase tracking-widest">
            Pulling to Unfold
          </span>
        </motion.div>

        {/* The Certificate Body (Unrolls via ClipPath) */}
        <motion.div 
          variants={{
            hidden: { clipPath: 'inset(0% 0% 100% 0%)' },
            visible: { clipPath: 'inset(0% 0% -2% 0%)' }
          }}
          transition={{ duration: 3.5, ease: [0.25, 1, 0.4, 1] }}
          style={{ willChange: 'clip-path' }}
          className="bg-white/80 backdrop-blur-xl border border-white/60 shadow-glass rounded-b-[1.5rem] overflow-hidden p-8 relative hover:bg-white/95 hover:shadow-premium transition-all duration-300"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500"></div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="font-sans font-bold text-xl text-gray-950">Professional Certificate</h3>
            <p className="text-xs text-gray-500">Official proof of completion</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              aria-label="Print Certificate" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-colors shadow-sm"
            >
              <Printer className="h-4 w-4" /> Print
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05 }} 
              whileTap={{ scale: 0.95 }} 
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              aria-label="Download PDF Certificate" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50/80 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shadow-sm"
            >
              <Download className="h-4 w-4" /> Download PDF
            </motion.button>
          </div>
        </div>

        {/* Certificate Preview */}
        <div className="border border-gray-200 rounded-xl p-8 bg-gray-50/50 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
            <Award className="w-64 h-64 text-emerald-600" />
          </div>
          <Award className="h-12 w-12 text-emerald-600 mb-4" />
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Certificate of Completion</p>
          <h2 className="text-3xl font-serif text-gray-900 mb-6">Alex Mitchell</h2>
          <p className="text-sm text-gray-600 max-w-md mx-auto mb-6">
            Has successfully completed the comprehensive program in <span className="font-semibold text-gray-900">Advanced Sign Language Specialization</span> and is awarded this official certificate.
          </p>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-left w-full max-w-2xl mt-4 border-t border-gray-200 pt-6">
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Date of Issue</p>
              <p className="text-sm font-bold text-gray-900">July 25, 2026</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Average Score</p>
              <p className="text-sm font-bold text-gray-900">88% (Grade A)</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Duration</p>
              <p className="text-sm font-bold text-gray-900">120 Hours</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-500 uppercase font-semibold">Certificate ID</p>
              <p className="text-sm font-bold text-gray-900 font-mono">ASL-26-9081</p>
            </div>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </CinematicSection>
  );
}
