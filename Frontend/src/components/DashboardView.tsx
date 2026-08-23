// Motion's runtime accepts these visual-only animations, while its current
// package typings reject a few valid easing arrays in this component.
// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  BookOpen, Camera, Award, Zap, ArrowRight, Play, CheckCircle,
  TrendingUp, Activity, AlertTriangle, Target, MoreVertical
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { Lesson, User, AchievementBadge } from '../types';
import { achievementService } from '../services/achievementService';
import { apiBaseUrl } from '../utils/api';
import StreakWidget from './StreakWidget';
import { CinematicSection, StaggeredGrid, Premium3DCard, MagneticButton } from './CinematicMotion';

interface DashboardViewProps {
  user: User;
  lessons: Lesson[];
  onNavigate: (tab: string, param?: any) => void;
}

const PremiumHeroBanner = ({ user, onNavigate }: { user: User; onNavigate: (tab: string, param?: any) => void }) => {
  const [displayStreak, setDisplayStreak] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const end = user.streak || 0;
    const duration = 600;
    const startTime = performance.now();
    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayStreak(Math.round(easeOutExpo(progress) * end));
      if (progress < 1) { animationFrameId = requestAnimationFrame(updateCounter); }
    };
    animationFrameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrameId);
  }, [user.streak]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20, backgroundPosition: '0% 0%' },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
         opacity: { ease: [0.16, 1, 0.3, 1], duration: 0.5 },
         y: { ease: [0.16, 1, 0.3, 1], duration: 0.5 },
         staggerChildren: 0.05, delayChildren: 0 
      } 
    },
    drift: {
      backgroundPosition: '100% 100%',
      transition: { duration: 10, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } }
  };
  
  const headingVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5, delay: 0 } }
  };

  const streakVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5, delay: 0.12 } }
  };

  const actionsContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.22 } }
  };

  const shineVariants = {
    hidden: { x: '-150%', opacity: 0 },
    hover: { x: '200%', opacity: 1, transition: { duration: 0.75, ease: 'easeOut' } }
  };

  return (
    <>
      <motion.div 
        id="welcome_banner" 
        initial={{ opacity: 0, y: 20, backgroundPosition: '0% 0%' }}
        animate={["visible", "drift"]}
        variants={containerVariants}
        className="relative overflow-hidden bg-gradient-to-br from-[#1b8d75] to-[#12584d] backdrop-blur-3xl text-white p-8 rounded-3xl shadow-[0_32px_64px_-12px_rgba(27,141,117,0.3),_inset_0_0_0_1px_rgba(255,255,255,0.2),_inset_0_4px_24px_rgba(255,255,255,0.4)] flex flex-col justify-between gap-6 isolate min-h-[300px]"
        style={{ backgroundSize: '150% 150%' }}
      >
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[120%] bg-[#40e0d0] rounded-full blur-[140px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[100%] bg-[#ffebc2] rounded-full blur-[120px] opacity-20 pointer-events-none" />
        
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/connected.png')] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <motion.h1 variants={headingVariants} id="welcome_title" className="font-bold text-[34px] tracking-tight text-white mb-3">
            Hello, {user.name}! 
            <motion.img 
              src="/signs/hello_nobg.png" 
              alt="ASL Hello Gesture" 
              animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
              transition={{ duration: 1.2, delay: 0.1, ease: 'easeInOut' }}
              className="inline-block h-10 w-10 ml-2 origin-bottom drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] pb-1 pointer-events-none select-none" 
            />
          </motion.h1>
          <motion.p variants={streakVariants} className="text-[15px] text-emerald-50/90 font-medium leading-relaxed relative">
            You're on a{' '}
            <span className="font-bold text-white relative inline-block">
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.4, 0.1], scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="absolute inset-0 bg-emerald-300 blur-[8px] rounded-full -z-10 mix-blend-screen"
              />
              {displayStreak}-day
            </span>
            {' '}streak. Keep up the momentum —<br/> practice today to maintain your progress!
          </motion.p>
        </div>
        
        <motion.div variants={actionsContainerVariants} initial="hidden" animate="visible" className="flex gap-4 shrink-0 pt-4 items-center z-10 relative">
          <motion.button
            variants={{
              hidden: itemVariants.hidden,
              visible: itemVariants.visible,
              hover: { scale: 1.025, boxShadow: '0 12px 24px rgba(27,141,117,0.4)', transition: { duration: 0.2 } }
            }}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            id="banner_action_practice"
            onClick={() => onNavigate('Practice')}
            className="relative overflow-hidden px-6 py-2.5 bg-white text-[#1b8d75] font-bold text-sm rounded-xl shadow-[0_8px_16px_rgba(27,141,117,0.3)] transition-shadow duration-200 flex items-center gap-2"
          >
            <motion.div variants={shineVariants} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg]" />
            <Play className="h-4 w-4 relative z-10" fill="currentColor" />
            <span className="relative z-10">Start Practice</span>
          </motion.button>
          
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            id="banner_action_lessons"
            onClick={() => onNavigate('Lessons')}
            className="px-6 py-2.5 bg-transparent border border-white/40 text-white font-bold text-sm rounded-xl hover:bg-white/10 hover:border-white transition-colors duration-200 flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            View Lessons
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};

export default function DashboardView({ user, lessons, onNavigate }: DashboardViewProps) {
  const [achievements, setAchievements] = useState<AchievementBadge[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [accuracyProgressData, setAccuracyProgressData] = useState<any[]>([]);
  const [lessonsCompletedBarData, setLessonsCompletedBarData] = useState<any[]>([]);
  const [weakLetters, setWeakLetters] = useState<any[]>([]);

  useEffect(() => {
    achievementService.getBadges('All').then(setAchievements);
    
    // For analytics, fetch real data from /business/analytics/me if needed, otherwise fallback to empty real state
    const token = localStorage.getItem('asl_access_token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    fetch(`${apiBaseUrl}/business/analytics/me`, { headers })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data && data.history) {
          setRecentActivity(data.history.slice(0, 5).map((h: any) => ({
            id: h.id, type: 'practice', label: h.lesson_name, time: h.date, score: h.accuracy
          })));
        }
      }).catch(() => {});
  }, []);

  const recentLessons = lessons
    .filter(l => l.progress > 0 && l.progress < 100)
    .concat(lessons.filter(l => l.progress === 0))
    .slice(0, 3);

  const derivedStats = [
    {
      id: 'stat_lessons',
      title: 'Lessons Completed',
      value: user.lessonsCompleted || 0,
      change: '+2 this week',
      changeType: 'increase' as const,
      icon: BookOpen,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'stat_sessions',
      title: 'Practice Sessions',
      value: user.practiceSessions || 0,
      change: '+6 vs last week',
      changeType: 'increase' as const,
      icon: Camera,
      iconBg: 'bg-violet-50',
      iconColor: 'text-violet-600',
    },
    {
      id: 'stat_accuracy',
      title: 'Current Score',
      value: `${user.avgAccuracy || 0}%`,
      change: '+1.4% change',
      changeType: 'increase' as const,
      icon: Target,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'stat_streak',
      title: 'Current Streak',
      value: `${user.streak || 0} Days`,
      change: 'Active today',
      changeType: 'increase' as const,
      icon: Zap,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ];

  const stats = derivedStats;

  return (
    <div id="dashboard_view" className="space-y-6">
      {/* Streak Widget & Overview Grid */}
      <CinematicSection delay={0.05} xOffset={80} yOffset={80}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {/* Welcome Banner - Injected */}
            <PremiumHeroBanner user={user} onNavigate={onNavigate} />
          </div>

          {/* Interactive Streak Widget */}
          <div className="lg:col-span-1">
            <StreakWidget onPracticeClick={() => onNavigate('Practice')} />
          </div>
        </div>
      </CinematicSection>

      {/* Stats Cards Grid */}
      <CinematicSection delay={0.15} xOffset={80} yOffset={80}>
        <StaggeredGrid id="stats_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" staggerDelay={0.06}>
          {stats.map((stat) => {
            const IconComponent = stat.icon;
            return (
              <Premium3DCard
                key={stat.id}
                id={stat.id}
                className="bg-white border border-gray-50 shadow-[0_4px_24px_rgba(0,0,0,0.04)] rounded-[1.5rem] p-6 hover:shadow-[0_12px_32px_rgba(0,0,0,0.08)] transition-all duration-300 flex flex-col group"
              >
                <div className="flex flex-col">
                  <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{stat.title}</p>
                  <h3 className="text-3xl font-extrabold text-gray-900 tracking-tight leading-none mt-3">{stat.value}</h3>
                  <span className={`inline-flex items-center text-[11px] font-bold ${stat.iconColor} mt-2`}>
                    {stat.change}
                  </span>
                </div>
                {/* Solid white block (icon container) without blur effect */}
                <div className="mt-6 bg-white rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.04),_0_1px_3px_rgba(0,0,0,0.02)] h-12 w-[85%] flex items-center px-4 relative z-10 group-hover:-translate-y-0.5 transition-transform duration-300">
                  <IconComponent className={`h-5 w-5 ${stat.iconColor} stroke-[2.5px]`} />
                </div>
              </Premium3DCard>
            );
          })}
        </StaggeredGrid>
      </CinematicSection>

      {/* Charts Row 1: Accuracy Line Chart + Lessons Bar Chart */}
      <CinematicSection delay={0.2} xOffset={80} yOffset={80}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Accuracy Over Time - Line Chart */}
          <div id="accuracy_line_chart_card" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 hover:bg-white/85 hover:shadow-premium transition-all duration-300">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-[15px] text-gray-900 leading-tight">Accuracy Over Time</h3>
                  <div className="flex items-center gap-3 text-[11px] mt-1">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1 w-3 rounded-full bg-emerald-500" />
                      <span className="text-gray-500 font-bold">Accuracy</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-1 w-3 rounded-full bg-gray-300" />
                      <span className="text-gray-500 font-bold">Target</span>
                    </span>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={accuracyProgressData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis domain={[60, 100]} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                    formatter={(v: number, name: string) => [`${v}%`, name === 'accuracy' ? 'Accuracy' : 'Target']}
                  />
                  <ReferenceLine y={85} stroke="#D1D5DB" strokeDasharray="4 4" label={{ value: '85%', fontSize: 10, fill: '#9CA3AF', position: 'right' }} />
                  <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} name="accuracy" isAnimationActive={true} animationDuration={1800} animationEasing="ease-out" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Lessons Completed - Bar Chart */}
          <div id="lessons_bar_chart_card" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 hover:bg-white/85 hover:shadow-premium transition-all duration-300">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-[15px] text-gray-900 leading-tight">Lessons Completed</h3>
                <div className="flex items-center gap-3 text-[11px] mt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-3 rounded-full bg-emerald-500" />
                    <span className="text-gray-500 font-bold">Completed</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-1 w-3 rounded-full bg-gray-300" />
                    <span className="text-gray-500 font-bold">Goal</span>
                  </span>
                </div>
              </div>
              <button className="text-gray-400 hover:text-gray-600 transition-colors p-1">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lessonsCompletedBarData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="week" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }}
                    formatter={(v: number) => [v, 'Lessons']}
                  />
                  <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={1500} animationEasing="ease-out" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CinematicSection>

      {/* Row 2: Weak Letters + Recent Activity + Early Achievement */}
      <CinematicSection delay={0.25} xOffset={80} yOffset={80}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Weak Letters Card */}
          <div id="weak_letters_card" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Weak Signs</h3>
            </div>
            <p className="text-xs text-gray-500 -mt-2">Signs with lowest accuracy — focus here!</p>
            <div className="space-y-3">
              {weakLetters.map((letter) => (
                <div key={letter.letter} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="h-7 w-7 flex items-center justify-center bg-amber-50 text-amber-700 font-bold text-xs rounded-lg">
                        {letter.letter}
                      </span>
                      <span className="text-xs text-gray-600">{letter.attempts} attempts</span>
                    </div>
                    <span className="text-xs font-bold text-amber-600">{letter.accuracy}%</span>
                  </div>
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-400 transition-all"
                      style={{ width: `${letter.accuracy}%` }}
                    />
                  </div>
                </div>
              ))}
              {weakLetters.length === 0 && <p className="text-xs text-gray-500">No weak signs identified yet.</p>}
            </div>
            <motion.button
              id="practice_weak_signs_btn"
              onClick={() => onNavigate('Practice')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full mt-2 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
            >
              Practice Weak Signs →
            </motion.button>
          </div>

          {/* Recent Activity Card */}
          <div id="recent_activity_card" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-500" />
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Recent Activity</h3>
            </div>
            <div className="space-y-3">
              {recentActivity.map((act) => (
                <div key={act.id} className="flex items-start gap-3">
                  <span className={`h-7 w-7 flex items-center justify-center rounded-lg shrink-0 ${
                    act.type === 'practice' ? 'bg-emerald-50 text-emerald-600' : 'bg-teal-50 text-teal-600'
                  }`}>
                    {act.type === 'practice' ? <Camera className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                  </span>
                  <div className="flex-1 min-w-0">
                     <p className="text-xs font-semibold text-gray-800 truncate">{act.label}</p>
                    <p className="text-[10px] text-gray-400">{act.time}</p>
                  </div>
                  {act.score !== null && act.score !== undefined && (
                    <span className="text-xs font-bold text-emerald-600 shrink-0">{act.score}%</span>
                  )}
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-xs text-gray-500">No recent activity.</p>}
            </div>
          </div>

          {/* Achievement Card */}
          <div id="achievement_card" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-4">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-violet-500" />
              <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Achievements</h3>
            </div>
            <div className="space-y-2.5">
              {achievements.slice(0, 4).map((a) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-3 p-2 rounded-lg ${a.unlocked ? 'bg-white' : 'opacity-50'}`}
                >
                  <span className="text-xl">{a.iconName || '🏆'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-900 truncate">{a.title}</p>
                    <p className="text-[10px] text-gray-400 truncate">{a.description}</p>
                  </div>
                  {a.unlocked ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-200 shrink-0" />
                  )}
                </div>
              ))}
              {achievements.length === 0 && <p className="text-xs text-gray-500">Keep practicing to earn badges!</p>}
            </div>
            <motion.button
              id="view_all_achievements_btn"
              onClick={() => onNavigate('Profile')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
              className="w-full py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition"
            >
              View All Achievements →
            </motion.button>
          </div>
        </div>
      </CinematicSection>

      {/* Row 3: Quick Actions + Active Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div id="quick_actions_card" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-4">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Quick Actions</h3>
          <div className="space-y-2">
            <button
              id="quick_action_practice"
              onClick={() => onNavigate('Practice')}
              className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition"
            >
              <span className="flex items-center space-x-2">
                <Camera className="h-4 w-4 text-emerald-600" />
                <span>Start Practice Session</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="quick_action_lesson"
              onClick={() => onNavigate('Lessons')}
              className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition"
            >
              <span className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4 text-emerald-600" />
                <span>Continue Active Lesson</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
            <button
              id="quick_action_reports"
              onClick={() => onNavigate('Reports')}
              className="w-full flex items-center justify-between p-3 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition"
            >
              <span className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-violet-600" />
                <span>View Assessment Reports</span>
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Active Lessons */}
        <div id="recent_lessons_card" className="lg:col-span-2 bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-2xl p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-3">
          <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Active Lessons</h3>
          <div className="space-y-3">
            {recentLessons.map((lesson) => (
              <div key={lesson.id} className="p-3 border border-gray-100 rounded-lg space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1">{lesson.name}</h4>
                    <p className="text-xs text-gray-500">{lesson.difficulty} • {lesson.duration}</p>
                  </div>
                  {lesson.progress === 100 ? (
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  ) : (
                    <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      {lesson.progress}%
                    </span>
                  )}
                </div>

                <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${lesson.progress}%` }}
                  />
                </div>

                <div className="flex justify-end">
                  <motion.button
                    id={`resume_lesson_${lesson.id}`}
                    onClick={() => onNavigate('Lessons', lesson)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 bg-emerald-50/50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg origin-right"
                  >
                    <span>{lesson.progress === 100 ? 'Review' : 'Resume'}</span>
                    <Play className="h-3 w-3 fill-current" />
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
