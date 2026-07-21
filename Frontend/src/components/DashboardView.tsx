import React from 'react';
import {
  BookOpen, Camera, Award, Zap, ArrowRight, Play, CheckCircle,
  TrendingUp, Activity, AlertTriangle, Target
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend
} from 'recharts';
import { Lesson, User } from '../types';
import {
  accuracyProgressData,
  lessonsCompletedBarData,
  mockWeakLetters,
  mockRecentActivity,
  mockAchievements
} from '../mockData';

interface DashboardViewProps {
  user: User;
  lessons: Lesson[];
  onNavigate: (tab: string, param?: any) => void;
}

export default function DashboardView({ user, lessons, onNavigate }: DashboardViewProps) {
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
      {/* Welcome Banner */}
      <div id="welcome_banner" className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 id="welcome_title" className="font-bold text-2xl md:text-3xl tracking-tight">
            Hello, {user.name}! 👋
          </h1>
          <p className="text-sm text-emerald-100 mt-1 max-w-xl">
            You're on a <span className="font-bold text-white">{user.streak}-day</span> streak. Keep up the momentum — practice today to maintain your progress!
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            id="banner_action_practice"
            onClick={() => onNavigate('Practice')}
            className="px-5 py-2.5 bg-white text-emerald-700 font-semibold text-sm rounded-lg hover:bg-emerald-50 transition shadow-sm"
          >
            Start Practice
          </button>
          <button
            id="banner_action_lessons"
            onClick={() => onNavigate('Lessons')}
            className="px-5 py-2.5 bg-emerald-500 text-white font-semibold text-sm rounded-lg hover:bg-emerald-400 transition"
          >
            View Lessons
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div id="stats_grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={stat.id}
              id={stat.id}
              className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between"
            >
              <div className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.title}</p>
                <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                  {stat.change}
                </span>
              </div>
              <div className={`p-3 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                <IconComponent className="h-6 w-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Row 1: Accuracy Line Chart + Lessons Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Accuracy Over Time - Line Chart */}
        <div id="accuracy_line_chart_card" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-base text-gray-900">Accuracy Over Time</h3>
              <p className="text-xs text-gray-500">Daily accuracy vs 85% target</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                <span className="text-gray-600">Accuracy</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-gray-300" />
                <span className="text-gray-600">Target</span>
              </span>
            </div>
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
                <Line type="monotone" dataKey="accuracy" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981' }} activeDot={{ r: 5 }} name="accuracy" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Lessons Completed - Bar Chart */}
        <div id="lessons_bar_chart_card" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
          <div className="mb-4">
            <h3 className="font-bold text-base text-gray-900">Lessons Completed</h3>
            <p className="text-xs text-gray-500">Weekly lesson completion count</p>
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
                <Bar dataKey="completed" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Weak Letters + Recent Activity + Early Achievement */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Weak Letters Card */}
        <div id="weak_letters_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Weak Signs</h3>
          </div>
          <p className="text-xs text-gray-500 -mt-2">Signs with lowest accuracy — focus here!</p>
          <div className="space-y-3">
            {mockWeakLetters.map((letter) => (
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
          </div>
          <button
            id="practice_weak_signs_btn"
            onClick={() => onNavigate('Practice')}
            className="w-full mt-2 py-2 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition"
          >
            Practice Weak Signs →
          </button>
        </div>

        {/* Recent Activity Card */}
        <div id="recent_activity_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-500" />
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Recent Activity</h3>
          </div>
          <div className="space-y-3">
            {mockRecentActivity.map((act) => (
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
                {act.score !== null && (
                  <span className="text-xs font-bold text-emerald-600 shrink-0">{act.score}%</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Achievement Card */}
        <div id="achievement_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-4 w-4 text-violet-500" />
            <h3 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Achievements</h3>
          </div>
          <div className="space-y-2.5">
            {mockAchievements.slice(0, 4).map((a) => (
              <div
                key={a.id}
                className={`flex items-center gap-3 p-2 rounded-lg ${a.unlocked ? 'bg-white' : 'opacity-50'}`}
              >
                <span className="text-xl">{a.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 truncate">{a.title}</p>
                  <p className="text-[10px] text-gray-400 truncate">{a.desc}</p>
                </div>
                {a.unlocked ? (
                  <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-gray-200 shrink-0" />
                )}
              </div>
            ))}
          </div>
          <button
            id="view_all_achievements_btn"
            onClick={() => onNavigate('Profile')}
            className="w-full py-2 text-xs font-semibold text-violet-700 bg-violet-50 hover:bg-violet-100 rounded-lg transition"
          >
            View All Achievements →
          </button>
        </div>
      </div>

      {/* Row 3: Quick Actions + Active Lessons */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Quick Actions */}
        <div id="quick_actions_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
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
        <div id="recent_lessons_card" className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
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
                  <button
                    id={`resume_lesson_${lesson.id}`}
                    onClick={() => onNavigate('Lessons', lesson)}
                    className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1"
                  >
                    <span>{lesson.progress === 100 ? 'Review' : 'Resume'}</span>
                    <Play className="h-2.5 w-2.5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
