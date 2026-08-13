import React, { useEffect, useState } from 'react';
import { Activity, Award, Users, TrendingUp } from 'lucide-react';
import { apiBaseUrl } from '../utils/api';

type Learner = {
  learner_id: number;
  username: string;
  engagement: { total_practice_attempts: number; practice_attempts_last_7_days: number };
  skill_development: { accuracy_change: number; current_accuracy: number };
  assessment_analytics: { average_score: number; attempts: number; correct_attempts: number };
  certification_status: { eligible: boolean; minimum_average_score: number };
};

export default function AccessibilityTrainerDashboard() {
  const [learners, setLearners] = useState<Learner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('asl_access_token');
    if (!token) { setError('Please sign in again to load assigned learners.'); setLoading(false); return; }
    fetch(`${apiBaseUrl}/accessibility-trainers/me/learners`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async response => {
        if (!response.ok) throw new Error((await response.json().catch(() => ({}))).detail || 'Unable to load assigned learners.');
        return response.json();
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

  return <section className="space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-950">Accessibility Trainer Dashboard</h1><p className="text-sm text-gray-500">Live progress and assessment results for learners assigned to you.</p></div>
    {error && <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(({ label, value, Icon }) => <div key={label} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><Icon className="h-5 w-5 text-emerald-600" /></div><p className="mt-3 text-2xl font-bold text-gray-900">{loading ? '—' : value}</p></div>)}
    </div>
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
      <div className="border-b border-gray-100 p-5"><h2 className="font-bold text-gray-900">Learner progress</h2><p className="text-xs text-gray-500">Only learners assigned by an administrator are shown.</p></div>
      {loading ? <p className="p-6 text-sm text-gray-500">Loading live learner data…</p> : learners.length === 0 ? <p className="p-6 text-sm text-gray-500">No learners are assigned yet. An administrator can assign learners from the trainer-assignment API.</p> : <div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-gray-50 text-xs uppercase text-gray-500"><tr><th className="px-5 py-3">Learner</th><th className="px-5 py-3">Accuracy</th><th className="px-5 py-3">Last 7 days</th><th className="px-5 py-3">Improvement</th><th className="px-5 py-3">Certification</th></tr></thead><tbody>{learners.map(learner => <tr key={learner.learner_id} className="border-t border-gray-100"><td className="px-5 py-4 font-medium text-gray-900">{learner.username}</td><td className="px-5 py-4">{learner.skill_development.current_accuracy}%</td><td className="px-5 py-4">{learner.engagement.practice_attempts_last_7_days} attempts</td><td className="px-5 py-4">{learner.skill_development.accuracy_change >= 0 ? '+' : ''}{learner.skill_development.accuracy_change}%</td><td className="px-5 py-4"><span className={learner.certification_status.eligible ? 'rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700' : 'rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700'}>{learner.certification_status.eligible ? 'Eligible' : `Needs ${learner.certification_status.minimum_average_score}%`}</span></td></tr>)}</tbody></table></div>}
    </div>
  </section>;
}
