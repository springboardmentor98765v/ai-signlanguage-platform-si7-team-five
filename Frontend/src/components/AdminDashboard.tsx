import React, { useState } from 'react';
import {
  Users, BookOpen, BarChart3, ShieldCheck, TrendingUp,
  AlertCircle, Settings, Bell, Activity, Database,
  UserCheck, Trash2, Edit, Plus, X
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import {
  mockAdminUsers,
  mockAdminPlatformActivity,
  mockAdminRoleDistribution,
  mockAdminSystemAlerts
} from '../mockData';

const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'system'>('overview');
  const [showBanner, setShowBanner] = useState(true);

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
      id: 'admin_stat_lessons',
      label: 'Total Lessons',
      value: '48',
      change: '6 published today',
      icon: BookOpen,
      bg: 'bg-emerald-50',
      color: 'text-emerald-600',
    },
    {
      id: 'admin_stat_sessions',
      label: 'Sessions This Week',
      value: '3,782',
      change: '+18% vs last week',
      icon: Activity,
      bg: 'bg-violet-50',
      color: 'text-violet-600',
    },
    {
      id: 'admin_stat_uptime',
      label: 'System Uptime',
      value: '99.8%',
      change: 'All systems nominal',
      icon: ShieldCheck,
      bg: 'bg-amber-50',
      color: 'text-amber-500',
    },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'users', label: 'User Management' },
    { id: 'system', label: 'System Status' },
  ] as const;

  return (
    <div id="admin_dashboard" className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-bold text-2xl text-gray-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">Platform-wide analytics, user management, and system configuration.</p>
        </div>
        <div className="flex gap-2">
          <button
            id="admin_notifications_btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <Bell className="h-4 w-4" />
            Alerts
            <span className="bg-red-500 text-white text-[10px] rounded-full px-1.5 py-0.5 font-bold">{mockAdminSystemAlerts.length}</span>
          </button>
          <button
            id="admin_settings_btn"
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 transition"
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
          <button onClick={() => setShowBanner(false)} className="text-amber-500 hover:text-amber-700">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tabs */}
      <div id="admin_tabs" className="flex border-b border-gray-200 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            id={`admin_tab_${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ---- OVERVIEW TAB ---- */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                  <AreaChart data={mockAdminPlatformActivity} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
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
                    <Pie data={mockAdminRoleDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                      {mockAdminRoleDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 mt-2">
                {mockAdminRoleDistribution.map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                      <span className="text-gray-600">{item.name}</span>
                    </div>
                    <span className="font-semibold text-gray-800">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ---- USERS TAB ---- */}
      {activeTab === 'users' && (
        <div id="admin_users_panel" className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-gray-900">All Users</h3>
              <p className="text-xs text-gray-500">{mockAdminUsers.length} total users</p>
            </div>
            <button
              id="admin_add_user_btn"
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 rounded-lg text-xs font-semibold text-white hover:bg-blue-700 transition"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-5 py-3 text-left font-semibold">User</th>
                  <th className="px-5 py-3 text-left font-semibold">Role</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-left font-semibold">Joined</th>
                  <th className="px-5 py-3 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {mockAdminUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 font-bold flex items-center justify-center text-xs uppercase">
                          {user.name.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        user.role === 'Admin' ? 'bg-red-50 text-red-700' :
                        user.role === 'Instructor' ? 'bg-blue-50 text-blue-700' :
                        'bg-emerald-50 text-emerald-700'
                      }`}>{user.role}</span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`h-2 w-2 rounded-full ${user.active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
                        <span className="text-xs text-gray-600">{user.active ? 'Active' : 'Inactive'}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500">{user.joined}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ---- SYSTEM STATUS TAB ---- */}
      {activeTab === 'system' && (
        <div id="admin_system_panel" className="space-y-6">
          {/* System Alerts */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-5 border-b border-gray-100">
              <h3 className="font-bold text-base text-gray-900">System Alerts</h3>
              <p className="text-xs text-gray-500">Recent events and notifications</p>
            </div>
            <div className="divide-y divide-gray-50">
              {mockAdminSystemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-5">
                  <span className={`h-2 w-2 rounded-full mt-1.5 shrink-0 ${
                    alert.severity === 'error' ? 'bg-red-500' :
                    alert.severity === 'warning' ? 'bg-amber-500' : 'bg-blue-500'
                  }`} />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{alert.title}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Health */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-bold text-base text-gray-900 mb-4">Service Health</h3>
            <div className="space-y-3">
              {[
                { name: 'AI Sign Detection API', status: 'Operational', uptime: '99.9%' },
                { name: 'Authentication Service', status: 'Operational', uptime: '100%' },
                { name: 'Video Streaming', status: 'Degraded', uptime: '97.2%' },
                { name: 'Database Cluster', status: 'Operational', uptime: '99.8%' },
                { name: 'CDN / Media Assets', status: 'Operational', uptime: '99.9%' },
              ].map((svc, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${svc.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                    <span className="text-sm text-gray-700">{svc.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className={`font-semibold ${svc.status === 'Operational' ? 'text-emerald-600' : 'text-amber-600'}`}>{svc.status}</span>
                    <span className="text-gray-400">Uptime: {svc.uptime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
