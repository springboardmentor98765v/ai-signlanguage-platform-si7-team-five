import React, { useState, useEffect } from 'react';
import {
  Users, BookOpen, ShieldCheck, Activity, Database,
  UserCheck, Edit, X, CheckCircle, PlayCircle, AlertCircle, Bell, Settings
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { apiBaseUrl } from '../utils/api';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const [showBanner, setShowBanner] = useState(true);
  const [adminSystemAlerts] = useState<any[]>([]);
  const [adminPlatformActivity] = useState<any[]>([
    { day: 'Mon', activeUsers: 480, sessions: 620 },
    { day: 'Tue', activeUsers: 512, sessions: 710 },
    { day: 'Wed', activeUsers: 495, sessions: 685 },
    { day: 'Thu', activeUsers: 605, sessions: 850 },
    { day: 'Fri', activeUsers: 575, sessions: 790 },
    { day: 'Sat', activeUsers: 720, sessions: 980 },
    { day: 'Sun', activeUsers: 815, sessions: 1120 },
  ]);
  const [adminRoleDistribution, setAdminRoleDistribution] = useState<any[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('asl_access_token');
    const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) };
    fetch(`${apiBaseUrl}/admin/users`, { headers })
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        // Distribution
        const roles = data.reduce((acc: any, curr: any) => {
           acc[curr.role] = (acc[curr.role] || 0) + 1;
           return acc;
        }, {});
        setAdminRoleDistribution(Object.entries(roles).map(([k, v]) => ({ name: k, value: v })));
      })
      .catch(() => {});
  }, []);

  const platformStats = [
    {
      id: 'admin_stat_users',
      label: 'Total Users',
      value: '1,248',
      change: '+124 this month',
      icon: Users,
      bg: 'bg-blue-50',
      color: 'text-blue-600',
    },
    {
      id: 'admin_stat_learners',
      label: 'Total Learners',
      value: '1,102',
      change: '+98 this month',
      icon: UserCheck,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      id: 'admin_stat_instructors',
      label: 'Total Instructors',
      value: '146',
      change: '+26 this month',
      icon: ShieldCheck,
      bg: 'bg-purple-50',
      color: 'text-purple-600',
    },
    {
      id: 'admin_stat_lessons',
      label: 'Total Lessons',
      value: '48',
      change: '6 published today',
      icon: BookOpen,
      bg: 'bg-amber-50',
      color: 'text-amber-500',
    },
    {
      id: 'admin_stat_active_today',
      label: 'Active Users Today',
      value: '342',
      change: '+42 vs yesterday',
      icon: Activity,
      bg: 'bg-rose-50',
      color: 'text-rose-500',
    },
  ];

  return (
    <div id="admin_dashboard" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight flex items-center">
            Admin Dashboard <img src="/signs/hello_nobg.png" alt="ASL Hello Gesture" className="inline-block h-8 w-8 ml-3 hover:animate-asl-salute transition-transform origin-bottom drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] pb-1 pointer-events-none select-none" />
          </h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide analytics, user management, and system configuration.</p>
        </div>
        <div className="flex gap-2">
          <button
            id="admin_notifications_btn"
            aria-label="View Alerts"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          >
            <Bell className="h-4 w-4" />
            Alerts
            <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{adminSystemAlerts.length}</span>
          </button>
          <button
            id="admin_settings_btn"
            aria-label="Settings"
            onClick={() => window.alert('Admin Settings module coming soon!')}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition"
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>
        </div>
      </div>

      {/* Alert Banner */}
      {showBanner && (
        <div id="admin_alert_banner" className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Platform Maintenance Scheduled</p>
              <p className="text-xs text-amber-700 mt-0.5">Routine maintenance is planned for Sunday 2:00 AM UTC. Expected downtime: 30 minutes.</p>
            </div>
          </div>
          <button aria-label="Dismiss Alert" onClick={() => setShowBanner(false)} className="text-amber-500 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 rounded p-0.5 transition">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {platformStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.id} id={stat.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                  <span className="text-xs text-gray-400">{stat.change}</span>
                </div>
                <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Platform Activity Area Chart */}
          <div id="admin_activity_chart" className="lg:col-span-2 bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-base text-gray-900">Platform Activity</h3>
              <p className="text-xs text-gray-500">Daily active users and sessions over 7 days</p>
            </div>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={adminPlatformActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563EB" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="day" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E5E7EB', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                  <Area type="monotone" dataKey="activeUsers" stroke="#2563EB" strokeWidth={2} fill="url(#colorUsers)" name="Active Users" />
                  <Area type="monotone" dataKey="sessions" stroke="#10B981" strokeWidth={2} fill="url(#colorSessions)" name="Sessions" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Role Distribution Pie Chart */}
          <div id="admin_role_distribution_chart" className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-base text-gray-900">User Distribution</h3>
              <p className="text-xs text-gray-500">Breakdown by role</p>
            </div>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={adminRoleDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                    {adminRoleDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-2">
              {adminRoleDistribution.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-gray-600">{item.name}</span>
                  </div>
                  <span className="font-semibold text-gray-800">{item.value}</span>
                </div>
              ))}
              {adminRoleDistribution.length === 0 && <p className="text-xs text-gray-500">No data available.</p>}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Lesson Overview Card */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base text-gray-900">Lesson Overview</h3>
                <p className="text-xs text-gray-500">Most engaged content</p>
              </div>
              <button className="text-blue-600 hover:text-blue-700 text-xs font-semibold">View All</button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Basic Greetings', plays: 1240, status: 'Active' },
                { name: 'Alphabet A-M', plays: 980, status: 'Active' },
                { name: 'Family & Relations', plays: 830, status: 'Active' },
                { name: 'Numbers 1-20', plays: 720, status: 'Draft' },
              ].map((lesson, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded text-blue-600">
                      <PlayCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{lesson.name}</p>
                      <p className="text-xs text-gray-500">{lesson.plays} completions</p>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${lesson.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'}`}>{lesson.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities Panel */}
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
            <div className="mb-4">
              <h3 className="font-bold text-base text-gray-900">Recent Activities</h3>
              <p className="text-xs text-gray-500">Live platform events</p>
            </div>
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-300 before:to-transparent">
              {[
                { user: 'Sarah J.', action: 'completed lesson', target: 'Basic Greetings', time: '10 mins ago', icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-100' },
                { user: 'Admin User', action: 'updated role for', target: 'Michael T.', time: '1 hour ago', icon: Edit, color: 'text-blue-500', bg: 'bg-blue-100' },
                { user: 'Alex H.', action: 'registered as', target: 'Learner', time: '2 hours ago', icon: UserCheck, color: 'text-purple-500', bg: 'bg-purple-100' },
                { user: 'System', action: 'triggered backup', target: 'Database', time: '5 hours ago', icon: Database, color: 'text-gray-500', bg: 'bg-gray-100' },
              ].map((act, idx) => {
                const Icon = act.icon;
                return (
                  <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-4 border-white ${act.bg} ${act.color} shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 mx-auto`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-gray-100 bg-white shadow-sm flex flex-col gap-1">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-900">{act.user}</p>
                        <span className="text-[10px] text-gray-500">{act.time}</span>
                      </div>
                      <p className="text-xs text-gray-600">
                        {act.action} <span className="font-semibold">{act.target}</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
