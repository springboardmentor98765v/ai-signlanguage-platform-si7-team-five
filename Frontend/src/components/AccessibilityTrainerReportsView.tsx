import React, { useEffect, useState } from 'react';
import { Download, Award, TrendingUp, Users, Target, FileText, BarChart3, AlertCircle, Activity, ShieldCheck } from 'lucide-react';
import { CinematicSection } from './CinematicMotion';
import { apiBaseUrl } from '../utils/api';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar
} from 'recharts';

type TrainerLearnerData = {
  learner_id: number;
  username: string;
  engagement: { total_practice_attempts: number; practice_attempts_last_7_days: number };
  skill_development: { accuracy_change: number; current_accuracy: number };
  assessment_analytics: { average_score: number; attempts: number; correct_attempts: number };
  certification_status: { 
    eligible: boolean; 
    minimum_average_score: number;
    level: string;
    status: 'passed' | 'failed' | 'in-progress' | 'none';
    latest_info: string;
  };
};

export default function AccessibilityTrainerReportsView() {
  const [data, setData] = useState<TrainerLearnerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('asl_access_token');
    if (!token) { setError('Authentication required.'); setLoading(false); return; }
    
    fetch(`${apiBaseUrl}/accessibility-trainers/me/learners`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async res => {
        if (!res.ok) throw new Error('Unable to load trainee data.');
        return res.json();
      })
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const totalLearners = data.length;
  const avgAccuracy = totalLearners > 0 
    ? data.reduce((sum, l) => sum + (l.skill_development.current_accuracy || 0), 0) / totalLearners 
    : 0;
  const totalPractice = data.reduce((sum, l) => sum + (l.engagement.total_practice_attempts || 0), 0);
  const avgImprovement = totalLearners > 0 
    ? data.reduce((sum, l) => sum + (l.skill_development.accuracy_change || 0), 0) / totalLearners 
    : 0;

  const exportPDF = () => {
    window.print();
  };

  const exportExcel = () => {
    const headers = ['Learner Name', 'Total Attempts', 'Recent Attempts (7 days)', 'Avg Accuracy', 'Improvement Trend', 'Cert Track', 'Cert Status'];
    const rows = data.map(l => [
      l.username,
      l.engagement.total_practice_attempts.toString(),
      l.engagement.practice_attempts_last_7_days.toString(),
      `${l.skill_development.current_accuracy}%`,
      `${l.skill_development.accuracy_change}%`,
      l.certification_status.level || 'Beginner',
      l.certification_status.status || 'Not Started'
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Trainer_Analytics_Report.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  if (loading) return <div className="p-8 text-sm text-gray-500">Loading trainer analytics...</div>;

  return (
    <CinematicSection delay={0.1} className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* 1. TOP HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-bold text-3xl text-gray-950 tracking-tight">Performance Reports</h1>
          <p className="text-sm text-gray-500 mt-2 max-w-2xl">
            Monitor learner engagement, skill development, assessment performance, and certification progress.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button onClick={exportExcel} className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
          <button onClick={exportPDF} className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 border border-emerald-500 rounded-xl text-sm font-bold text-white hover:bg-emerald-700 shadow-sm transition-all">
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* 2. KPI CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600"><Users className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Assigned Learners</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalLearners}</p>
              </div>
            </div>
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600"><Target className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Average Accuracy</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalLearners > 0 ? avgAccuracy.toFixed(1) : 0}%</p>
              </div>
            </div>
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><Activity className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Practice Engagement</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{totalPractice} <span className="text-sm font-normal text-gray-500">sessions</span></p>
              </div>
            </div>
            <div className="bg-white rounded-[1.5rem] p-5 shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-amber-50 flex items-center justify-center text-amber-600"><TrendingUp className="h-5 w-5" /></div>
              <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Improvement Rate</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{avgImprovement > 0 ? '+' : ''}{totalLearners > 0 ? avgImprovement.toFixed(1) : 0}%</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 3. LEARNING ENGAGEMENT */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Learning Engagement</h3>
              </div>
              {totalLearners === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-gray-400"><BarChart3 className="h-8 w-8 mb-2 opacity-50"/> <p>No learner data available</p></div>
              ) : (
                <div className="h-64 w-full text-sm font-bold opacity-50 flex items-center justify-center border-2 border-dashed border-gray-100 rounded-xl bg-gray-50">
                  <p>Weekly/Monthly chart placeholder (API Historic Dataset Not Provided)</p>
                </div>
              )}
            </div>

            {/* 4. SKILL DEVELOPMENT */}
            <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">Skill Development</h3>
              </div>
              {totalLearners === 0 ? (
                <div className="h-64 flex flex-col justify-center items-center text-gray-400"><TrendingUp className="h-8 w-8 mb-2 opacity-50"/> <p>No learner data available</p></div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead>
                      <tr className="text-gray-400 uppercase tracking-wider text-[11px] font-bold border-b border-gray-50">
                        <th className="pb-3">Learner</th>
                        <th className="pb-3 px-2">Starting Score</th>
                        <th className="pb-3 px-2">Current Score</th>
                        <th className="pb-3 text-right">Improvement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {data.map(l => (
                        <tr key={l.learner_id}>
                          <td className="py-4 font-bold text-gray-900">{l.username}</td>
                          <td className="py-4 px-2 text-gray-500 font-medium">{(l.skill_development.current_accuracy - l.skill_development.accuracy_change).toFixed(1)}%</td>
                          <td className="py-4 px-2 font-bold text-gray-900">{l.skill_development.current_accuracy}%</td>
                          <td className={`py-4 text-right font-bold ${l.skill_development.accuracy_change >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                            {l.skill_development.accuracy_change > 0 ? '+' : ''}{l.skill_development.accuracy_change.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* 5. ASSESSMENT ANALYTICS & 6. LEARNER PERFORMANCE INSIGHTS */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-8">Learner Performance Insights</h3>
            {totalLearners === 0 ? (
              <div className="py-12 flex flex-col justify-center items-center text-gray-400"><Award className="h-8 w-8 mb-2 opacity-50"/> <p>No assessment data available.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <th className="p-4 rounded-tl-xl">Learner</th>
                      <th className="p-4">Accuracy</th>
                      <th className="p-4">Improvement</th>
                      <th className="p-4">Weak Areas</th>
                      <th className="p-4 rounded-tr-xl border-l border-white">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(l => (
                      <tr key={l.learner_id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold text-gray-900">{l.username}</td>
                        <td className="p-4 font-semibold text-emerald-600">{l.skill_development.current_accuracy}%</td>
                        <td className="p-4">{l.skill_development.accuracy_change > 0 ? '+' : ''}{l.skill_development.accuracy_change}%</td>
                        <td className="p-4 text-gray-400 italic">No historical data</td>
                        <td className="p-4 border-l border-gray-50">
                          {l.skill_development.current_accuracy < 70 ? (
                            <span className="text-red-600 font-medium">Needs additional practice</span>
                          ) : l.skill_development.accuracy_change > 10 ? (
                            <span className="text-blue-600 font-medium">Improving quickly. Challenge recommended.</span>
                          ) : (
                            <span className="text-emerald-600 font-medium">Steady performance</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* 8. CERTIFICATION OVERVIEW & 9. LEARNER CERTIFICATION TABLE */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
            <h3 className="text-lg font-bold text-gray-900 tracking-tight mb-8">Certification Overview</h3>
            {totalLearners === 0 ? (
              <div className="py-12 flex flex-col justify-center items-center text-gray-400"><ShieldCheck className="h-8 w-8 mb-2 opacity-50"/> <p>No certification records available.</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                      <th className="p-4 rounded-tl-xl">Learner</th>
                      <th className="p-4">Level</th>
                      <th className="p-4">Latest Score</th>
                      <th className="p-4">Certificate Status</th>
                      <th className="p-4">Last Attempt</th>
                      <th className="p-4 rounded-tr-xl border-l border-white">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {data.map(l => (
                      <tr key={l.learner_id} className="hover:bg-gray-50/50">
                        <td className="p-4 font-bold text-gray-900">{l.username}</td>
                        <td className="p-4 font-semibold text-gray-700">{l.certification_status.level || 'Beginner'}</td>
                        <td className="p-4 font-semibold">{l.assessment_analytics.average_score}%</td>
                        <td className="p-4">
                          <span className={`inline-flex px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border 
                            ${l.certification_status.status === 'passed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 
                              l.certification_status.status === 'in-progress' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                              l.certification_status.status === 'failed' ? 'bg-red-50 text-red-700 border-red-200' : 
                              'bg-gray-50 text-gray-600 border-gray-200'}`}
                          >
                            {l.certification_status.status === 'none' ? 'Not Started' : l.certification_status.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-500">—</td>
                        <td className="p-4 border-l border-gray-50 text-blue-600 font-bold hover:text-blue-700 cursor-pointer text-xs">
                          View Progress
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </CinematicSection>
  );
}
