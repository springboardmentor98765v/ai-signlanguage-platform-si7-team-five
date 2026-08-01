import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Flame, CheckCircle2, Trophy, ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { StreakDetails } from '../types';
import { streakService } from '../services/streakService';

interface StreakWidgetProps {
  onPracticeClick?: () => void;
  compact?: boolean;
}

export default function StreakWidget({ onPracticeClick, compact = false }: StreakWidgetProps) {
  const [streakData, setStreakData] = useState<StreakDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStreak();
  }, []);

  const loadStreak = async () => {
    setLoading(true);
    const data = await streakService.getStreakDetails();
    setStreakData(data);
    setLoading(false);
  };

  const handleRecordToday = async () => {
    const updated = await streakService.recordDailyPractice();
    setStreakData(updated);
  };

  if (loading || !streakData) {
    return (
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm animate-pulse space-y-4">
        <div className="flex items-center space-x-3">
          <div className="h-12 w-12 bg-amber-100 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-3 bg-gray-100 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  const milestoneProgress = Math.min(
    100,
    Math.round((streakData.currentStreak / streakData.nextMilestoneDays) * 100)
  );

  if (compact) {
    return (
      <div className="flex items-center space-x-3 bg-amber-50/80 border border-amber-200/60 p-3 rounded-2xl">
        <div className="relative">
          <motion.div
            animate={{ scale: [1, 1.12, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md shadow-amber-500/20"
          >
            <Flame className="h-6 w-6 fill-amber-200" />
          </motion.div>
        </div>
        <div>
          <div className="flex items-center space-x-1.5">
            <span className="text-base font-extrabold text-amber-900">
              {streakData.currentStreak} Days
            </span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-200/60 text-amber-800">
              Active Streak
            </span>
          </div>
          <p className="text-xs text-amber-700 font-medium">
            Best record: {streakData.longestStreak} days
          </p>
        </div>
      </div>
    );
  }

  return (
    <div id="streak_widget_card" className="bg-[#fffdf9]/70 backdrop-blur-3xl rounded-[1.75rem] p-7 shadow-[0_16px_48px_-12px_rgba(245,158,11,0.1),_inset_0_1px_1px_rgba(255,255,255,1),_inset_0_-1px_2px_rgba(0,0,0,0.02)] border border-white/80 relative overflow-hidden group hover:shadow-[0_24px_64px_-12px_rgba(245,158,11,0.15)] transition-all duration-500 ease-out">
      {/* Ambient glow */}
      <div className="absolute top-[-20px] left-[-20px] w-64 h-64 bg-[#ffe6cc]/60 rounded-full blur-[80px] pointer-events-none group-hover:bg-[#ffe6cc]/80 transition-colors duration-500" />
      
      <div className="relative z-10 flex items-start space-x-5">
        {/* Animated Flame Box */}
        <div className="h-[64px] w-[64px] rounded-[1.15rem] bg-gradient-to-br from-[#ffb533] to-[#fe8c00] flex items-center justify-center text-white shadow-[0_12px_24px_-8px_rgba(254,140,0,0.5),_inset_0_4px_8px_rgba(255,255,255,0.4),_inset_0_-2px_4px_rgba(0,0,0,0.15)] shrink-0 mt-1 transform group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] border border-[#ffaa00]/60 relative before:absolute before:inset-0 before:bg-gradient-to-b before:from-white/40 before:to-transparent before:rounded-[1.15rem] before:pointer-events-none after:absolute after:-bottom-4 after:w-3/4 after:h-4 after:bg-[#fe8c00]/30 after:blur-md after:rounded-full after:opacity-0 group-hover:after:opacity-100 after:transition-opacity">
          <Flame className="h-8 w-8 fill-white text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.25)] relative z-10 motion-safe:animate-pulse" />
        </div>

        <div className="flex-1">
          <div className="flex items-start justify-between">
            <h3 className="text-[28px] font-extrabold text-gray-900 leading-[1.1] tracking-tight">
              {streakData.currentStreak} Day<br/>Streak
            </h3>
            <div className="flex space-x-2 items-start mt-1">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#fff4e5]/80 backdrop-blur-md text-[#fe8c00] flex items-center space-x-1 border border-orange-100/60 shadow-[0_2px_8px_rgba(254,140,0,0.06)]">
                <Flame className="h-3 w-3 fill-[#fe8c00] text-[#fe8c00]" />
                <span>On Fire</span>
              </span>
              {streakData.todayCompleted && (
                <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50/80 backdrop-blur-md text-emerald-600 flex items-center space-x-1 border border-emerald-100/60 shadow-[0_2px_8px_rgba(16,185,129,0.06)]">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span>Today Done!</span>
                </span>
              )}
            </div>
          </div>
          <p className="text-[12px] font-medium text-gray-500 mt-2.5">
            Personal Record: <strong className="text-gray-800">{streakData.longestStreak} Days</strong> in a row
          </p>
        </div>
      </div>

      {/* Weekly Active Grid */}
      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between text-[11px] text-gray-500 mb-4 font-bold border-b border-gray-100 pb-2">
          <span className="flex items-center space-x-1.5 uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-gray-400" />
            <span>This Week's Activity</span>
          </span>
          <span className="text-[#fe8c00] font-extrabold uppercase tracking-wider">
            {streakData.weeklyCalendar.filter((d) => d.completed).length} / 7 Days Active
          </span>
        </div>

        <div className="flex justify-between mt-4">
          {streakData.weeklyCalendar.map((item) => (
            <div key={item.dayName} className="flex flex-col items-center">
              <div
                className={`h-[36px] w-[36px] rounded-full flex items-center justify-center mb-2 transition-all duration-300 relative ${
                  item.completed
                    ? 'bg-gradient-to-b from-[#ffb533] to-[#fe8c00] text-white shadow-[0_6px_12px_-4px_rgba(254,140,0,0.4),_inset_0_1.5px_2px_rgba(255,255,255,0.4)] border border-[#ffaa00]'
                    : 'bg-[#f4f5f7]/80 text-transparent border border-gray-100/80 shadow-[inset_0_2px_4px_rgba(0,0,0,0.03)]'
                }`}
              >
                {item.completed && <CheckCircle2 className="h-5 w-5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)]" />}
              </div>
              <span className="text-[11px] font-bold text-gray-400">
                {item.dayName.substring(0, 3)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Next Milestone Reward Progress Bar */}
      <div className="mt-8 bg-gradient-to-br from-white/95 to-[#fffcf9]/95 backdrop-blur-md p-5 rounded-[1.25rem] border border-orange-100/40 shadow-[0_4px_16px_rgba(254,140,0,0.04),_inset_0_1px_0_rgba(255,255,255,1)] relative z-10 transition-colors duration-500 group-hover:bg-orange-50/30">
        <div className="flex items-center justify-between text-[11px] font-extrabold text-[#fe8c00] mb-3 uppercase tracking-wider">
          <div className="flex items-center space-x-1.5 drop-shadow-sm">
            <Trophy className="h-4 w-4 text-[#fe8c00]" />
            <span>Next Milestone: {streakData.nextMilestoneDays}-Day Goal</span>
          </div>
          <span>{streakData.currentStreak} / {streakData.nextMilestoneDays} Days</span>
        </div>

        <div className="w-full bg-gray-100/80 shadow-inner h-2.5 rounded-full overflow-hidden mb-3 p-[1px]">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${milestoneProgress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#fe8c00] to-[#ffb533] rounded-full shadow-[0_0_12px_rgba(254,140,0,0.5)]"
          />
        </div>

        <p className="text-[11px] text-amber-700 font-bold flex items-center space-x-1.5">
          <span className="text-sm">🎁</span> <span>Reward: <span className="text-amber-900">{streakData.nextMilestoneReward}</span></span>
        </p>
      </div>

      {onPracticeClick && (
        <div className="mt-5 text-right relative z-10">
          <motion.button
            onClick={onPracticeClick}
            aria-label="Practice Now"
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
            whileHover={{ scale: 1.05, opacity: 1 }}
            className="text-[12px] font-bold text-[#fe8c00] hover:text-[#ffaa00] flex items-center justify-end space-x-1 ml-auto focus:outline-none transition drop-shadow-sm"
          >
            <span>Practice Now to Extend Streak</span>
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
