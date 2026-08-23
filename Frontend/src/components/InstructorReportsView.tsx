import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { BarChart3, LineChart, Activity, Award, Clock, ArrowUpRight, ArrowDownRight, Target, BrainCircuit, AlertCircle, PlayCircle, Search, Filter, Download, Calendar, FileSpreadsheet, FileText, Check, Camera, Zap, CheckCircle2, ShieldCheck, Printer, Users, BookOpen } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { apiBaseUrl } from '../utils/api';
import { CinematicSection } from './CinematicMotion';

interface AssignedLearner {
  learner_id: number;
  username: string;
  practice_attempts: number;
  average_accuracy: number;
  lessons_completed?: number;
  last_active?: string;
  status?: string;
}

export default function InstructorReportsView() {
  const [searchTerm, setSearchTerm] = useState('');
  const [minScoreFilter, setMinScoreFilter] = useState<number | 'All'>('All');
  const [exportingFormat, setExportingFormat] = useState<'excel' | 'pdf' | null>(null);
  const [exportSuccess, setExportSuccess] = useState<string | null>(null);
  
  const [summary, setSummary] = useState({ practice_sessions: 0, average_accuracy: 0, streak: 0, lessons_completed: 0 });
  const [history, setHistory] = useState<Array<{ id: number; date: string; lesson_name: string; sign_symbol: string; accuracy: number; is_correct: boolean; feedback: string }>>([]);
  const [dailyAttempts, setDailyAttempts] = useState<Array<{ date: string; time: number }>>([]);
  const [categoryAccuracy, setCategoryAccuracy] = useState<Array<{ name: string; accuracy: number }>>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Instructor specific state
  const [learners, setLearners] = useState<AssignedLearner[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('asl_access_token');
    if (!token) { setLoadError('Please sign in to view class analytics.'); return; }
    const headers = { Authorization: `Bearer ${token}` };
    
    // Fetch global graphs
    Promise.all([fetch(`${apiBaseUrl}/business/summary/me`, { headers }), fetch(`${apiBaseUrl}/business/analytics/me`, { headers })])
      .then(async ([summaryResponse, analyticsResponse]) => {
        if (!summaryResponse.ok || !analyticsResponse.ok) throw new Error('Live analytics are unavailable right now.');
        const [nextSummary, analytics] = await Promise.all([summaryResponse.json(), analyticsResponse.json()]);
        setSummary(nextSummary); setHistory(analytics.history); setDailyAttempts(analytics.daily_attempts); setCategoryAccuracy(analytics.category_accuracy);
      })
      .catch(problem => setLoadError(problem instanceof Error ? problem.message : 'Live analytics are unavailable right now.'));
      
    // Fetch Class roster
    fetch(`${apiBaseUrl}/instructors/learners`, { headers })
      .then(res => {
        if (res.ok) return res.json();
        throw new Error();
      })
      .then(data => setLearners(data))
      .catch(e => console.error("Failed to fetch class roster"));
  }, []);

  const [exportReportType, setExportReportType] = useState<string>('progress');

  const handleExport = async (format: 'excel' | 'pdf') => {
    setExportingFormat(format);
    try {
      const token = localStorage.getItem('asl_access_token');
      if (!token) throw new Error('Please sign in before exporting a report.');
      const requestUrl = `${apiBaseUrl}/business/reports/me?report_type=${exportReportType}&format=${format === 'excel' ? 'xlsx' : 'pdf'}`;
      const response = await fetch(requestUrl, { headers: { Authorization: `Bearer ${token}` } });
      if (!response.ok) throw new Error('The server could not generate this report.');
      const blob = await response.blob();
      const extension = format === 'excel' ? 'xlsx' : format;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Instructor-${exportReportType}-report.${extension}`;
      document.body.appendChild(link); link.click(); link.remove(); URL.revokeObjectURL(link.href);
      setExportSuccess(`Exported real-time ${exportReportType} report as ${format.toUpperCase()}`);
    } catch (error) {
      setExportSuccess(error instanceof Error ? error.message : 'Report export failed.');
    } finally {
      setExportingFormat(null);
      setTimeout(() => setExportSuccess(null), 3000);
    }
  };

  const filteredHistory = history.filter((session) => {
    const matchesSearch = session.lesson_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          session.sign_symbol.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesScore = minScoreFilter === 'All' || session.accuracy >= minScoreFilter;
    return matchesSearch && matchesScore;
  });

  const getAccuracyColor = (score: number) => {
    if (score >= 90) return 'text-emerald-600 bg-emerald-50 border border-emerald-100';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border border-blue-100';
    return 'text-amber-600 bg-amber-50 border border-amber-100';
  };
  
  const getStatus = (accuracy: number) => {
    if (accuracy >= 85) return 'On Track';
    if (accuracy >= 65) return 'Needs Attention';
    return 'At Risk';
  };
  
  const getStatusColor = (status: string) => {
    if (status === 'On Track') return 'bg-emerald-100 text-emerald-700';
    if (status === 'Needs Attention') return 'bg-amber-100 text-amber-700';
    return 'bg-red-100 text-red-700';
  };

  // Class Summary aggregates
  const totalLearners = learners.length;
  // Estimate active 
  const activeLearners = Math.max(0, learners.filter(l => l.practice_attempts > 0).length);
  const totalClassPractice = learners.reduce((sum, l) => sum + (l.practice_attempts || 0), 0);
  const avgClassAccuracy = learners.length > 0 ? Math.round(learners.reduce((sum, l) => sum + (l.average_accuracy || 0), 0) / learners.length) : 0;
  const totalLessonsClass = learners.reduce((sum, l) => sum + (l.lessons_completed || 0), 0);

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="reports_view" className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 id="reports_title" className="font-sans font-bold text-2xl text-gray-950 tracking-tight">Performance Analytics</h1>
          <p className="text-sm text-gray-500">Track class sign precision trends, compliance logs, and diagnostics over time.</p>
        </div>

        {/* Export Toolbar */}
        <div className="flex items-center space-x-3 shrink-0 bg-white/70 backdrop-blur-xl border border-gray-200 shadow-sm p-1.5 rounded-2xl">
          <select 
            value={exportReportType} 
            onChange={e => setExportReportType(e.target.value)}
            className="bg-transparent text-sm font-semibold text-gray-700 outline-none border-none py-1.5 pl-2 cursor-pointer focus:ring-0"
          >
            <option value="learning">Learning Report</option>
            <option value="assessment">Assessment Report</option>
            <option value="accuracy">Accuracy Report</option>
            <option value="certification">Certification Report</option>
            <option value="progress">Progress Report</option>
          </select>
          <div className="w-px h-6 bg-gray-200"></div>

          <motion.button
            onClick={() => handleExport('excel')}
            disabled={exportingFormat !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
            <span>Excel</span>
          </motion.button>
          <motion.button
            onClick={() => handleExport('pdf')}
            disabled={exportingFormat !== null}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </motion.button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2 animate-fade-in">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{exportSuccess}</span>
        </div>
      )}
      {loadError && <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-xs font-bold text-amber-800">{loadError}</div>}

      {/* Reports Metrics Cards */}
      <div id="reports_stats_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Total Learners</p>
          <h3 className="text-2xl font-bold text-gray-900 font-sans">{totalLearners}</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex flex-col items-center justify-center text-center">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Active Learners</p>
          <h3 className="text-2xl font-bold text-gray-900 font-sans">{activeLearners}</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Avg Accuracy</p>
           <h3 className="text-2xl font-bold text-emerald-600 font-sans">{avgClassAccuracy}%</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Total Practice</p>
           <h3 className="text-2xl font-bold text-gray-900 font-sans">{totalClassPractice}</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Lessons Done</p>
           <h3 className="text-2xl font-bold text-gray-900 font-sans">{totalLessonsClass}</h3>
        </div>

        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 flex flex-col items-center justify-center text-center">
           <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">Assessments</p>
           <h3 className="text-2xl font-bold text-gray-900 font-sans">0</h3>
        </div>
      </div>

      {/* Graphs Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div id="chart_practice_time" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 flex flex-col justify-between hover:bg-white/85 hover:shadow-premium transition-all duration-300">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Weekly Progress Graph</h3>
            <p className="text-xs text-gray-500">Minutes spent practicing signs on camera this week</p>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyAttempts} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontFamily: 'sans-serif', fontSize: '12px' }}/>
                <Bar dataKey="time" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div id="chart_category_breakdown" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 flex flex-col justify-between hover:bg-white/85 hover:shadow-premium transition-all duration-300">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Monthly Progress Graph</h3>
            <p className="text-xs text-gray-500">Average accuracy score across different syllabus domains this month</p>
          </div>
          <div className="h-72 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={categoryAccuracy} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccuracyCategory" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontFamily: 'sans-serif', fontSize: '12px' }}/>
                <Area type="monotone" dataKey="accuracy" stroke="#4F46E5" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracyCategory)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Performance Insights Section */}
        <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] overflow-hidden p-6 hover:bg-white/85 hover:shadow-premium transition-all duration-300">
          <div className="mb-4">
            <h3 className="font-sans font-bold text-base text-gray-950">Performance Insights</h3>
            <p className="text-xs text-gray-500">Signs that need attention over the class curve</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Strong Signs
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Hello', 'Thank You', 'Yes', 'No', 'A', 'B'].map((sign) => (
                  <span key={sign} className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full border border-emerald-200">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-5 rounded-2xl">
              <h4 className="text-xs font-bold text-red-900 uppercase tracking-widest flex items-center gap-2 mb-3">
                <AlertCircle className="h-4 w-4 text-red-500" /> Weak Signs
              </h4>
              <div className="flex flex-wrap gap-2">
                {['Letter J', 'Letter Z', 'Sorry', 'Please'].map((sign) => (
                  <span key={sign} className="px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100 shadow-[inset_0_1px_2px_rgba(0,0,0,0.05)]">
                    {sign}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* 
        This is where 'Professional Certificate' used to be!
        Replaced with Class Performance Summary
      */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] overflow-hidden hover:bg-white/85 hover:shadow-premium transition-all duration-300 mt-8 mb-4">
        <div className="p-6 border-b border-gray-100 bg-gray-50/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
           <div>
             <h3 className="font-sans font-bold text-xl text-gray-950">Class Performance Summary</h3>
             <p className="text-xs text-gray-500 mt-1">Detailed roster view of mapped learners and their platform progression.</p>
           </div>
           
           <div className="flex items-center gap-2">
              <button 
                onClick={() => handleExport('excel')}
                className="flex items-center space-x-1.5 px-3 py-2 bg-white text-gray-700 text-xs font-bold rounded-lg border border-gray-200 shadow-sm transition-colors hover:bg-gray-50"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-600" />
                <span>Export Excel</span>
              </button>
              <button 
                onClick={() => handleExport('pdf')}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-sm shadow-emerald-500/20 transition-colors hover:bg-emerald-600"
              >
                <Download className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
           </div>
        </div>
        
        {learners.length === 0 ? (
          <div className="p-16 flex flex-col items-center text-center">
            <Users className="h-10 w-10 text-gray-300 mb-3" />
            <h4 className="text-gray-900 font-bold text-lg">No learner performance data available yet.</h4>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">Students assigned to you will appear here once they start learning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-100 text-left text-sm text-gray-500">
               <thead className="bg-gray-50 text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
                 <tr>
                   <th className="px-6 py-4">Learner Name</th>
                   <th className="px-6 py-4">Lessons Completed</th>
                   <th className="px-6 py-4">Practice Attempts</th>
                   <th className="px-6 py-4">Average Accuracy</th>
                   <th className="px-6 py-4">Last Activity</th>
                   <th className="px-6 py-4">Status</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-gray-100 bg-white">
                 {learners.map((learner) => {
                   const status = getStatus(learner.average_accuracy || 0);
                   return (
                     <tr key={learner.learner_id} className="hover:bg-gray-50/50 transition relative">
                       <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                         {learner.username}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                         {learner.lessons_completed || 0}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                         {learner.practice_attempts || 0}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap">
                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold tracking-wider ${getAccuracyColor(learner.average_accuracy || 0)}`}>
                           {learner.average_accuracy || 0}%
                         </span>
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-gray-500 italic text-xs">
                         {learner.last_active || 'N/A'}
                       </td>
                       <td className="px-6 py-4 whitespace-nowrap text-[10px] uppercase font-bold tracking-wider">
                         <span className={`px-2.5 py-1 rounded-full ${getStatusColor(status)}`}>
                            {status}
                         </span>
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
          </div>
        )}
      </div>

      {/* Recent assessments table */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] overflow-hidden hover:bg-white/85 hover:shadow-premium transition-all duration-300">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gray-50/50">
          <div>
            <h3 className="font-sans font-bold text-base text-gray-950">Recent Assessment Audits</h3>
            <p className="text-xs text-gray-500">Detailed historical breakdown of handshape precision analysis</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
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
            <div className="flex items-center space-x-1.5 w-full sm:w-auto shrink-0">
              <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Score:</span>
              <select
                id="reports_score_select"
                value={minScoreFilter}
                onChange={(e) => setMinScoreFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="block border border-gray-200 bg-white rounded-lg text-xs p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">All Scores</option>
                <option value="90">90% + (Excellent)</option>
                <option value="80">80% + (Good)</option>
                <option value="70">70% + (Pass)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 text-left text-sm text-gray-500">
            <thead className="bg-white text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">
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
                  <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-400 font-medium">{row.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">{row.lesson_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-sans font-extrabold text-xs text-gray-900 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                      {row.sign_symbol}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${getAccuracyColor(row.accuracy)}`}>
                      {row.accuracy}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-600 max-w-xs truncate italic">{row.feedback}</td>
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
    </CinematicSection>
  );
}
