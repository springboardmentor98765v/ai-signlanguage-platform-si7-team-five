import React from 'react';
import { BookOpen, Camera, Award, Zap, ArrowRight, Play, CheckCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Lesson, User } from '../types';
import { accuracyProgressData } from '../mockData';

interface DashboardViewProps {
  user: User;
  lessons: Lesson[];
  onNavigate: (tab: string, param?: any) => void;
}

export default function DashboardView({ user, lessons, onNavigate }: DashboardViewProps) {
  // Recent lessons are those that are in progress (progress > 0 and progress < 100)
  // or a couple from the list to display as recommendations if progress is 0.
  const recentLessons = lessons
    .filter(l => l.progress > 0 && l.progress < 100)
    .concat(lessons.filter(l => l.progress === 0))
    .slice(0, 3);

  const stats = [
    {
      id: 'stat_lessons',
      title: 'Lessons Completed',
      value: user.lessonsCompleted,
      change: '+2 this week',
      changeType: 'increase' as const,
      icon: BookOpen,
      iconBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      id: 'stat_sessions',
      title: 'Practice Sessions',
      value: user.practiceSessions,
      change: '+6 vs last week',
      changeType: 'increase' as const,
      icon: Camera,
      iconBg: 'bg-indigo-50',
      iconColor: 'text-indigo-600',
    },
    {
      id: 'stat_accuracy',
      title: 'Average Accuracy',
      value: `${user.avgAccuracy}%`,
      change: '+1.4% change',
      changeType: 'increase' as const,
      icon: Award,
      iconBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      id: 'stat_streak',
      title: 'Current Streak',
      value: `${user.streak} Days`,
      change: 'Active today',
      changeType: 'increase' as const,
      icon: Zap,
      iconBg: 'bg-amber-50',
      iconColor: 'text-amber-500',
    },
  ];

  return (
    <div id="dashboard_view" className="space-y-6">
      {/* Welcome Banner */}
      <div id="welcome_banner" className="bg-emerald-600 text-white p-6 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 id="welcome_title" className="font-sans font-bold text-2xl md:text-3xl tracking-tight">
            Hello, {user.name}!
          </h1>
          <p className="font-sans text-sm text-emerald-100 mt-1 max-w-xl">
            You are on a {user.streak}-day learning streak. Connect your webcam today to practice conversational sign language with live AI grading.
          </p>
        </div>
        <div>
          <button
            id="banner_action_practice"
            onClick={() => onNavigate('Practice')}
            className="px-5 py-2.5 bg-white text-emerald-700 font-sans font-semibold text-sm rounded-lg hover:bg-emerald-50 transition shadow-sm"
          >
            Start Practice
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
                <h3 className="text-2xl font-bold text-gray-900 font-sans">{stat.value}</h3>
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

      {/* Main Grid: Chart and Recent Lessons */}
      <div id="main_dashboard_grid" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2/3 - Progress Chart */}
        <div id="dashboard_chart_card" className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-sans font-bold text-lg text-gray-900">Weekly Accuracy & Commitment</h3>
              <p className="text-xs text-gray-500">Real-time detection accuracy score compared to baseline target</p>
            </div>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <span className="text-gray-600">Accuracy (%)</span>
              </span>
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-gray-300"></span>
                <span className="text-gray-600">Target (85%)</span>
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={accuracyProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="date" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[50, 100]} stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #E5E7EB', fontFamily: 'sans-serif', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="accuracy" stroke="#16A34A" strokeWidth={2} fillOpacity={1} fill="url(#colorAccuracy)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 1/3 - Quick Actions & Recent Lessons */}
        <div id="dashboard_actions_and_recent" className="space-y-6">
          
          {/* Quick Actions Card */}
          <div id="quick_actions_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-sm text-gray-900 uppercase tracking-wider">Quick Actions</h3>
            <div className="grid grid-cols-1 gap-2">
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
                  <BookOpen className="h-4 w-4 text-indigo-600" />
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
                  <Award className="h-4 w-4 text-blue-600" />
                  <span>View Assessment Reports</span>
                </span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Recent Lessons Card */}
          <div id="recent_lessons_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
            <h3 className="font-sans font-bold text-sm text-gray-900 uppercase tracking-wider">Active Lessons</h3>
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
                  
                  {/* Progress Line */}
                  <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-emerald-500 h-full rounded-full transition-all duration-300" 
                      style={{ width: `${lesson.progress}%` }}
                    ></div>
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
    </div>
  );
}
