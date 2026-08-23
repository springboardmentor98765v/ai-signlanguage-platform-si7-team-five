import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FileText, Download, Target, Award, BrainCircuit, Activity, BookOpen, Clock, AlertCircle, X, Search, Filter, Database, CheckCircle2, FileSpreadsheet
} from 'lucide-react';
import { apiBaseUrl } from '../utils/api';

type ReportType = 'learner_progress' | 'assessment' | 'practice_engagement' | 'certification' | 'platform_administrative';

const reportConfig: Record<ReportType, { title: string; desc: string; icon: any; color: string; bg: string }> = {
  learner_progress: {
    title: 'Learner Progress Report',
    desc: 'Detailed overview of individual learner progression, completed lessons, and skill development.',
    icon: Target, color: 'text-blue-600', bg: 'bg-blue-100'
  },
  assessment: {
    title: 'Assessment Report',
    desc: 'AI scoring, assessment accuracy by level, and pass/fail distributions for live exams.',
    icon: Activity, color: 'text-emerald-600', bg: 'bg-emerald-100'
  },
  practice_engagement: {
    title: 'Practice / Engagement Report',
    desc: 'Platform utilization analytics including total practice sessions, attempt counts, and duration metrics.',
    icon: BrainCircuit, color: 'text-amber-600', bg: 'bg-amber-100'
  },
  certification: {
    title: 'Certification Report',
    desc: 'Track awarded certificates, final exam pass rates, and certification levels across the system.',
    icon: Award, color: 'text-purple-600', bg: 'bg-purple-100'
  },
  platform_administrative: {
    title: 'Platform / Administrative Report',
    desc: 'High-level aggregation of active users, total roles, created lessons, and systemic volume.',
    icon: Database, color: 'text-gray-600', bg: 'bg-gray-100'
  }
};

export default function AdminReportsView() {
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exportingFormat, setExportingFormat] = useState<'csv' | 'excel' | 'pdf' | null>(null);

  // Filters
  const [dateFilter, setDateFilter] = useState('30days');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchReportData = async (type: ReportType, controller?: AbortController) => {
    setLoading(true);
    setError(null);
    setReportData(null);
    try {
      const token = localStorage.getItem('asl_access_token');
      const headers = { Authorization: `Bearer ${token}` };
      const response = await fetch(`${apiBaseUrl}/admin/reports/${type}?date=${dateFilter}&status=${statusFilter}`, {
        headers,
        signal: controller?.signal
      });
      if (!response.ok) {
        throw new Error('Unable to load report. Please try again.');
      }
      const data = await response.json();
      setReportData(data);
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Unable to load report. Please try again.');
      }
    } finally {
      if (!controller?.signal.aborted) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (selectedReport) {
      const controller = new AbortController();
      fetchReportData(selectedReport, controller);
      return () => controller.abort();
    }
  }, [selectedReport, dateFilter, statusFilter]);

  const handleExport = async (format: 'pdf' | 'excel' | 'csv', type: ReportType = selectedReport!) => {
    setExportingFormat(format);
    try {
      const token = localStorage.getItem('asl_access_token');
      if (!token) throw new Error('Unauthorized');
      
      const reqFmt = format === 'excel' ? 'xlsx' : format;
      const response = await fetch(`${apiBaseUrl}/admin/reports/export?report_type=${type}&format=${reqFmt}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('File export failed on server.');
      
      const blob = await response.blob();
      const extension = reqFmt;
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Admin-${type}-report.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (error: any) {
      window.alert(error.message || 'Unable to export the report. Please try again.');
    } finally {
      setExportingFormat(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="font-sans font-bold text-2xl text-gray-950 tracking-tight">Reports & Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor learner progress, assessments, engagement and platform performance.</p>
        </div>
      </div>

      {!selectedReport ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {(Object.entries(reportConfig) as [ReportType, any][]).map(([key, config]) => {
            const Icon = config.icon;
            return (
              <div key={key} className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 flex flex-col items-start hover:shadow-md transition-shadow">
                <div className={`p-4 rounded-xl ${config.bg} ${config.color} mb-4`}>
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{config.title}</h3>
                <p className="text-sm text-gray-500 mb-6 flex-1">{config.desc}</p>
                <div className="flex items-center gap-3 w-full mt-auto pt-4 border-t border-gray-50">
                  <button 
                    onClick={() => setSelectedReport(key)}
                    className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-2 rounded-lg text-sm transition-colors text-center"
                  >
                    View Report
                  </button>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleExport('pdf', key)}
                      title="Export PDF"
                      className="p-2 border border-gray-200 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg transition-colors"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleExport('excel', key)}
                      title="Export Excel"
                      className="p-2 border border-gray-200 text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 rounded-lg transition-colors"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col relative min-h-[500px]">
          {/* Detailed Report Header */}
          <div className="p-6 border-b border-gray-100 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-gray-50/50">
            <div className="flex items-center gap-4">
               <button 
                 onClick={() => setSelectedReport(null)}
                 className="p-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 hover:text-gray-900 transition-colors"
               >
                 <X className="h-5 w-5" />
               </button>
               <div>
                 <div className="flex items-center gap-2">
                   <h2 className="font-bold text-xl text-gray-900">{reportConfig[selectedReport].title}</h2>
                   <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-[10px] font-bold uppercase rounded tracking-wider">Live</span>
                 </div>
                 <p className="text-xs text-gray-500 mt-1">Generated: {new Date().toLocaleDateString()}</p>
               </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
               {/* Filters */}
               <div className="flex gap-2">
                 <select 
                   value={dateFilter}
                   onChange={e => setDateFilter(e.target.value)}
                   className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                 >
                   <option value="7days">Last 7 Days</option>
                   <option value="30days">Last 30 Days</option>
                   <option value="all">All Time</option>
                 </select>
                 <select 
                   value={statusFilter}
                   onChange={e => setStatusFilter(e.target.value)}
                   className="text-xs px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                 >
                   <option value="All">All Statuses / Users</option>
                   <option value="Active">Active Only</option>
                 </select>
               </div>
               <div className="w-px h-6 bg-gray-200 hidden md:block"></div>
               {/* Exports */}
               <button 
                  onClick={() => handleExport('excel')}
                  disabled={exportingFormat !== null}
                  className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold transition-colors disabled:opacity-50"
               >
                 <FileSpreadsheet className="h-4 w-4 text-emerald-600" /> Excel
               </button>
               <button 
                  onClick={() => handleExport('pdf')}
                  disabled={exportingFormat !== null}
                  className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold shadow-md shadow-emerald-600/20 transition-colors disabled:opacity-50"
               >
                 <Download className="h-4 w-4" /> PDF
               </button>
            </div>
          </div>

          {/* Report Content Body */}
          <div className="p-6 flex-1 bg-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-blue-600">
                <svg className="animate-spin h-8 w-8 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="font-semibold animate-pulse">Generating report...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <AlertCircle className="h-10 w-10 text-amber-500 mb-3" />
                <h3 className="font-bold text-gray-900 mb-1">Error Loading Data</h3>
                <p className="text-gray-500 text-sm mb-4">{error}</p>
                <button onClick={() => fetchReportData(selectedReport!)} className="px-4 py-2 bg-amber-50 text-amber-700 rounded-lg text-sm font-semibold hover:bg-amber-100">
                  Retry
                </button>
              </div>
            ) : (!reportData || !reportData.records || reportData.records.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <FileText className="h-12 w-12 mb-3 text-gray-300" />
                <p className="font-semibold text-gray-600">No report data available.</p>
                <p className="text-xs text-gray-400 mt-1">The backend returned an empty dataset for the selected filters.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary Metrics (if available in payload) */}
                {reportData.summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {Object.entries(reportData.summary).map(([title, value]: any, idx) => (
                      <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-[10px] uppercase font-bold text-gray-500 mb-1">{title.replace(/_/g, ' ')}</p>
                        <p className="text-xl font-bold text-gray-900">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Data Table */}
                <div className="overflow-x-auto rounded-xl border border-gray-100">
                  <table className="w-full text-sm text-left text-gray-500">
                    <thead className="bg-gray-50 text-xs uppercase font-semibold text-gray-500">
                       <tr>
                         {Object.keys(reportData.records[0] || {}).map((col) => (
                           <th key={col} className="px-6 py-4">{col.replace(/_/g, ' ')}</th>
                         ))}
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {reportData.records.map((row: any, i: number) => (
                        <tr key={i} className="hover:bg-gray-50/50">
                          {Object.values(row).map((val: any, j: number) => (
                            <td key={j} className="px-6 py-4 whitespace-nowrap text-gray-700">
                              {typeof val === 'boolean' ? (val ? 'Yes' : 'No') : val}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
