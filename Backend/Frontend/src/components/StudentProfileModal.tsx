import React from 'react';
import { motion, AnimatePresence, useMotionTemplate } from 'motion/react';
import { X, TrendingUp, Award, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useGlassTilt, SPRING_MODAL, SPRING_BACKDROP } from '../hooks/useGlassTilt';
import { useFocusTrap } from '../hooks/useFocusTrap';

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
  const { ref: tiltRef, style: tiltStyle, springLightX, springLightY } = useGlassTilt<HTMLDivElement>(true);
  const focusTrapRef = useFocusTrap(true, onClose);

  // Merge refs
  const setModalRef = (node: HTMLDivElement | null) => {
    (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (focusTrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  const lightGradient = useMotionTemplate`radial-gradient(800px circle at ${springLightX}% ${springLightY}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Glass Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={SPRING_BACKDROP}
        onClick={onClose}
        className="fixed inset-0 glass-backdrop"
        aria-hidden="true"
      />

      {/* Glass Modal */}
      <motion.div
        ref={setModalRef}
        role="dialog"
        aria-modal="true"
        aria-label={`${studentName}'s Profile`}
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 20 }}
        transition={SPRING_MODAL}
        style={{
          ...tiltStyle,
          backgroundImage: lightGradient,
        }}
        className="glass-modal relative w-full max-w-4xl max-h-[90vh] overflow-y-auto flex flex-col z-50"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/15 sticky top-0 bg-white/60 backdrop-blur-xl z-10 rounded-t-[2rem]">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{studentName}'s Profile</h2>
            <p className="text-xs text-gray-500 mt-1">Detailed progress and performance metrics</p>
          </div>
          <motion.button
            onClick={onClose}
            aria-label="Close Profile Modal"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-white/40 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 transition"
          >
            <X className="h-5 w-5" />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Avg Accuracy', value: '88%', color: 'blue' },
              { label: 'Lessons Completed', value: '24', color: 'emerald' },
              { label: 'Current Streak', value: '5 Days', color: 'amber' },
              { label: 'Total Time', value: '14h 30m', color: 'purple' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_MODAL, delay: i * 0.05 }}
                className={`bg-${stat.color}-50/40 backdrop-blur-sm p-4 rounded-xl border border-${stat.color}-100/30`}
              >
                <p className={`text-xs font-semibold text-${stat.color}-600 uppercase`}>{stat.label}</p>
                <h4 className="text-xl font-bold text-gray-900 mt-1">{stat.value}</h4>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graph */}
            <div className="lg:col-span-2 bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-blue-500" /> Weekly Accuracy Trend
                </h3>
              </div>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockWeeklyAccuracy} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 100]} stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', backdropFilter: 'blur(12px)', background: 'rgba(255,255,255,0.9)' }} />
                    <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Weak/Strong Signs */}
            <div className="space-y-4">
              <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500" /> Areas for Improvement
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Letter J', 'Letter Z', 'Sorry', 'Please'].map((sign) => (
                    <span key={sign} className="px-2.5 py-1 bg-amber-50/80 text-amber-700 text-xs font-semibold rounded-md border border-amber-100/50">
                      {sign}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-5 shadow-sm">
                <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Strong Signs
                </h3>
                <div className="flex flex-wrap gap-2">
                  {['Hello', 'Thank You', 'Yes', 'No', 'A', 'B', 'C'].map((sign) => (
                    <span key={sign} className="px-2.5 py-1 bg-emerald-50/80 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100/50">
                      {sign}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="bg-white/50 backdrop-blur-sm border border-white/40 rounded-xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Clock className="h-4 w-4 text-gray-400" /> Recent Practice History
            </h3>
            <div className="divide-y divide-white/20">
              {mockRecentHistory.map((history, i) => (
                <motion.div
                  key={history.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...SPRING_MODAL, delay: 0.2 + i * 0.05 }}
                  className="py-3 flex items-center justify-between first:pt-0 last:pb-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="bg-white/60 p-2 rounded-lg backdrop-blur-sm">
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
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
