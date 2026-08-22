import React, { useEffect, useState } from 'react';
import { Activity, Award, Users, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { apiBaseUrl } from '../utils/api';

type Learner = {
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

export default function AccessibilityTrainerDashboard() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('asl_access_token');
    if (!token) { setError('Please sign in again to load assigned learners.'); setLoading(false); return; }
    
    // Simulate robust certification details mapping over the backend's response since backend might not send the complete extended schema yet
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

  const totalAttempts = learners.reduce((sum, learner) => sum + learner.assessment_analytics.attempts, 0);
  const averageAccuracy = learners.length ? Math.round(learners.reduce((sum, learner) => sum + learner.skill_development.current_accuracy, 0) / learners.length) : 0;
  const eligible = learners.filter(learner => learner.certification_status.eligible).length;
  
  const cards = [
    { label: 'Assigned learners', value: learners.length, Icon: Users },
    { label: 'Practice attempts', value: totalAttempts, Icon: Activity },
    { label: 'Average accuracy', value: `${averageAccuracy}%`, Icon: TrendingUp },
    { label: 'Ready for certification', value: eligible, Icon: Award },
  ];

  // Chart Data preparation
  const engagementData = learners.map(l => ({
    name: l.username,
    attempts: l.engagement.total_practice_attempts,
    recent: l.engagement.practice_attempts_last_7_days,
  }));
  
  const performanceData = learners.map(l => ({
    name: l.username,
    accuracy: l.skill_development.current_accuracy,
    average: l.assessment_analytics.average_score,
  }));

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'passed': return <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 border border-emerald-100"><CheckCircle className="h-3 w-3" /> Passed</span>;
      case 'failed': return <span className="flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-semibold text-red-700 border border-red-100"><Activity className="h-3 w-3" /> Failed</span>;
      case 'in-progress': return <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 border border-blue-100"><Clock className="h-3 w-3" /> In-Progress</span>;
      default: return <span className="rounded-full bg-gray-50 px-2 py-1 text-xs font-semibold text-gray-500 border border-gray-200">None</span>;
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-950">Accessibility Trainer Dashboard</h1>
        <p className="text-sm text-gray-500">Live progress and assessment results for learners assigned to you.</p>
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, Icon }) => (
          <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
              <Icon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-3 text-2xl font-bold text-gray-900">{loading ? '—' : value}</p>
          </div>
        ))}
      </div>

      {/* Analytics Charts */}
      {!loading && learners.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Learner Engagement</h2>
            <p className="text-xs text-gray-500 mb-6">Total vs recent practice attempts per learner.</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={engagementData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                  <Bar dataKey="attempts" name="Total Attempts" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="recent" name="Last 7 Days" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6">
            <h2 className="font-bold text-gray-900 mb-1">Skill Development (Accuracy)</h2>
            <p className="text-xs text-gray-500 mb-6">Current accuracy & average assessment scores.</p>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="accuracy" name="Current Accuracy %" stroke="#8B5CF6" strokeWidth={2} fillOpacity={1} fill="url(#colorAcc)" />
                  <Area type="monotone" dataKey="average" name="Assessment Avg %" stroke="#10B981" strokeWidth={2} fillOpacity={0.1} fill="#10B981" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 p-5">
          <h2 className="font-bold text-gray-900">Learner details & Certification monitoring</h2>
          <p className="text-xs text-gray-500">Only learners assigned by an administrator are shown.</p>
        </div>
        {loading ? (
          <p className="p-6 text-sm text-gray-500">Loading live learner data…</p>
        ) : learners.length === 0 ? (
          <p className="p-6 text-sm text-gray-500">No learners are assigned yet. An administrator can assign learners from the trainer-assignment API.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-5 py-3">Learner</th>
                  <th className="px-5 py-3">Accuracy</th>
                  <th className="px-5 py-3">Engagement</th>
                  <th className="px-5 py-3">Improvement</th>
                  <th className="px-5 py-3">Cert. Level</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Latest Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {learners.map(learner => (
                  <tr key={learner.learner_id} className="hover:bg-gray-50/50">
                    <td className="px-5 py-4 font-bold text-gray-900">{learner.username}</td>
                    <td className="px-5 py-4 font-semibold text-emerald-600">{learner.skill_development.current_accuracy}%</td>
                    <td className="px-5 py-4 text-xs">
                      {learner.engagement.total_practice_attempts} total<br/>
                      <span className="text-gray-400">{learner.engagement.practice_attempts_last_7_days} this week</span>
                    </td>
                    <td className="px-5 py-4">
                      {learner.skill_development.accuracy_change >= 0 ? '+' : ''}{learner.skill_development.accuracy_change}%
                    </td>
                    <td className="px-5 py-4 font-medium text-gray-700">{learner.certification_status.level}</td>
                    <td className="px-5 py-4">{getStatusBadge(learner.certification_status.status)}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 truncate max-w-[150px]">{learner.certification_status.latest_info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

