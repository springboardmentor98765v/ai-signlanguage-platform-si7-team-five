import React from 'react';
import { X, TrendingUp, Award, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface StudentProfileModalProps {
  studentName: string;
  onClose: () => void;
}

const mockWeeklyAccuracy = [
  { day: 'Mon', accuracy: 72 },
  { day: 'Tue', accuracy: 75 },
  { day: 'Wed', accuracy: 78 },
  { day: 'Thu', accuracy: 74 },
  { day: 'Fri', accuracy: 82 },
  { day: 'Sat', accuracy: 85 },
  { day: 'Sun', accuracy: 88 }
];

const mockRecentHistory = [
  { id: 1, lesson: 'Basic Greetings', date: 'Today, 10:30 AM', score: 92 },
  { id: 2, lesson: 'Numbers 1-10', date: 'Yesterday, 3:15 PM', score: 85 },
  { id: 3, lesson: 'Alphabet A-M', date: '2 days ago', score: 78 },
];

export default function StudentProfileModal({ studentName, onClose }: StudentProfileModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{studentName}'s Profile</h2>
            <p className="text-xs text-gray-500 mt-1">Detailed progress and performance metrics</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50">
              <p className="text-xs font-semibold text-blue-600 uppercase">Avg Accuracy</p>
              <h4 className="text-xl font-bold text-gray-900 mt-1">88%</h4>
            </div>
            <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100/50">
              <p className="text-xs font-semibold text-emerald-600 uppercase">Lessons Completed</p>
              <h4 className="text-xl font-bold text-gray-900 mt-1">24</h4>
            </div>
            <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50">
              <p className="text-xs font-semibold text-amber-600 uppercase">Current Streak</p>
              <h4 className="text-xl font-bold text-gray-900 mt-1">5 Days</h4>
            </div>
            <div className="bg-purple-50/50 p-4 rounded-xl border border-purple-100/50">
              <p className="text-xs font-semibold text-purple-600 uppercase">Total Time</p>
              <h4 className="text-xl font-bold text-gray-900 mt-1">14h 30m</h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graph */}
            <div className="lg:col-span-2 bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Weekly Accuracy Trend
                </h3>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockWeeklyAccuracy} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weak/Strong Signs */}
            <div className="space-y-4">
              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Areas for Improvement
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Letter J', 'Letter Z', 'Sorry', 'Please'].map((sign) => (
                    <span key={sign} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-md border border-amber-100">
                      {sign}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Strong Signs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Hello', 'Thank You', 'Yes', 'No', 'A', 'B', 'C'].map((sign) => (
                    <span key={sign} className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                      {sign}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-gray-400" /> Recent Practice History
            </h3>
            <div className="divide-y divide-gray-50">
              {mockRecentHistory.map((history) => (
                <div key={history.id} className="py-3 flex items-center justify-between first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-50 p-2 rounded-lg">
                      <Award className="h-4 w-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{history.lesson}</p>
                      <p className="text-xs text-gray-500">{history.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-bold ${history.score >= 90 ? 'text-emerald-600' : 'text-blue-600'}`}>
                      {history.score}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
