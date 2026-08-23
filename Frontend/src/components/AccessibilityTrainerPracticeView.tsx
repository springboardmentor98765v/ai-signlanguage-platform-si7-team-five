import React, { useEffect, useState } from 'react';
import { apiBaseUrl } from '../utils/api';
import { ShieldCheck, User, Target, TrendingUp, Clock, AlertCircle, X, Activity } from 'lucide-react';
import { CinematicSection } from './CinematicMotion';

type TargetLearner = {
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

export default function AccessibilityTrainerPracticeView() {
  const [learners, setLearners] = useState<TargetLearner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLearner, setSelectedLearner] = useState<TargetLearner | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('asl_access_token');
    if (!token) { setError('Please sign in again to load assigned learners.'); setLoading(false); return; }
    
    fetch(`${apiBaseUrl}/accessibility-trainers/me/learners`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || 'Unable to load assigned learners.');
        const data = await response.json();
        return data.map((learner: any) => ({
          ...learner,
          certification_status: {
            ...learner.certification_status,
            level: learner.certification_status.level || 'Beginner',
            status: learner.certification_status.status || (learner.certification_status.eligible ? 'in-progress' : 'none'),
            latest_info: learner.certification_status.latest_info || 'Pending evaluation'
          }
        }));
      })
      .then(setLearners)
      .catch(problem => setError(problem instanceof Error ? problem.message : 'Unable to load assigned learners.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CinematicSection delay={0.05} xOffset={40} yOffset={20} id="trainer_practice_view" className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-bold text-2xl text-gray-950 tracking-tight">Learner Progress</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor the practice and skill development performance of learners assigned to you.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 flex gap-3 text-sm text-red-700">
          <AlertCircle className="h-5 w-5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      {/* OVERVIEW TABLE */}
      <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
          <h2 className="font-bold text-base text-gray-900 flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-600" /> Assigned Learners
          </h2>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-sm font-medium text-gray-500">Loading tracking history…</div>
        ) : learners.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Target className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm font-medium text-gray-500">No learners are assigned yet. An administrator can assign learners.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/50 text-[11px] font-bold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-6 py-4">Learner Name</th>
                  <th className="px-6 py-4">Email</th>
                  <th className="px-6 py-4">Avg Accuracy</th>
                  <th className="px-6 py-4">Total Sessions</th>
                  <th className="px-6 py-4">Current Progress</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {learners.map((learner) => (
                  <tr key={learner.learner_id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">{learner.username}</td>
                    <td className="px-6 py-4 text-gray-500 italic">—</td> {/* Email not returned by backend strictly */}
                    <td className="px-6 py-4 font-semibold text-emerald-600">{learner.skill_development.current_accuracy}%</td>
                    <td className="px-6 py-4 font-medium">{learner.engagement.total_practice_attempts} attempts</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 w-16 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${learner.skill_development.current_accuracy}%` }} />
                        </div>
                        <span className="text-xs text-gray-500">{learner.skill_development.current_accuracy}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => setSelectedLearner(learner)}
                        className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETAILED MODAL */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl overflow-hidden relative max-h-[90vh] flex flex-col">
            
            <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 tracking-tight">{selectedLearner.username}</h2>
                <p className="text-sm font-medium text-emerald-700 mt-0.5">Learner Performance Profile</p>
              </div>
              <button onClick={() => setSelectedLearner(null)} className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors">
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-8 overflow-y-auto space-y-8">
              
              {/* Learner Practice Monitoring */}
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Learner Practice Monitoring
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Practice Attempts</p>
                    <p className="text-xl font-bold text-gray-900">{selectedLearner.engagement.total_practice_attempts}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                    <p className="text-xs text-gray-500 mb-1">Recent Activity</p>
                    <p className="text-xl font-bold text-gray-900">{selectedLearner.engagement.practice_attempts_last_7_days} <span className="text-xs font-normal text-gray-500">this week</span></p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 opacity-60">
                    <p className="text-xs text-gray-500 mb-1">Time Spent</p>
                    <p className="text-sm font-bold text-gray-400 italic">No historical data</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 opacity-60">
                    <p className="text-xs text-gray-500 mb-1">Lessons Completed</p>
                    <p className="text-sm font-bold text-gray-400 italic">No historical data</p>
                  </div>
                </div>
              </section>

              {/* Assessment & Skill Development */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target className="h-4 w-4" /> Assessment Monitoring
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Average Accuracy</span>
                      <span className="text-sm font-bold text-emerald-600">{selectedLearner.assessment_analytics.average_score}%</span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Assessment Attempts</span>
                      <span className="text-sm font-bold text-gray-900">{selectedLearner.assessment_analytics.attempts} total</span>
                    </div>
                    <div className="flex justify-between items-center py-3">
                      <span className="text-sm text-gray-600 font-medium">Correct Attempts</span>
                      <span className="text-sm font-bold text-gray-900">{selectedLearner.assessment_analytics.correct_attempts}</span>
                    </div>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" /> Skill Development
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Improvement Trend</span>
                      <span className={`text-sm font-bold ${selectedLearner.skill_development.accuracy_change >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                        {selectedLearner.skill_development.accuracy_change > 0 ? '+' : ''}{selectedLearner.skill_development.accuracy_change}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 border-b border-gray-100">
                      <span className="text-sm text-gray-600 font-medium">Current Progress</span>
                      <span className="text-sm font-bold text-blue-600 border border-blue-100 bg-blue-50 px-2 py-0.5 rounded-full">
                        {selectedLearner.skill_development.current_accuracy}% Mastery
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-3 opacity-60">
                      <span className="text-sm text-gray-600 font-medium">Weak Areas</span>
                      <span className="text-sm font-bold text-gray-400 italic">No historical data</span>
                    </div>
                  </div>
                </section>
              </div>

              {/* Certification Status */}
              <section>
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Certification Status
                </h3>
                <div className="bg-emerald-50/50 rounded-xl border border-emerald-100 p-6 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-emerald-900 text-lg mb-1">{selectedLearner.certification_status.level} Track</h4>
                    <p className="text-sm text-emerald-700/80">{selectedLearner.certification_status.latest_info}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border 
                      ${selectedLearner.certification_status.status === 'passed' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                        selectedLearner.certification_status.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' : 
                        selectedLearner.certification_status.status === 'failed' ? 'bg-red-100 text-red-800 border-red-200' : 
                        'bg-gray-100 text-gray-600 border-gray-200'}`}
                    >
                      {selectedLearner.certification_status.status === 'none' ? 'Not Started' : selectedLearner.certification_status.status}
                    </span>
                    {selectedLearner.certification_status.eligible && selectedLearner.certification_status.status !== 'passed' && (
                      <p className="text-xs font-bold text-emerald-600 mt-2">Ready for Certification</p>
                    )}
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      )}
    </CinematicSection>
  );
}
