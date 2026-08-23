import React from 'react';
import { User as UserType } from '../types';
import { Shield, User, Mail, Hash, LogOut, CheckCircle, Clock, Lock, Activity } from 'lucide-react';
import { CinematicSection } from './CinematicMotion';

interface AdminProfileViewProps {
  user: UserType;
  onLogout: () => void;
}

export default function AdminProfileView({ user, onLogout }: AdminProfileViewProps) {
  return (
    <CinematicSection delay={0.05} xOffset={40} yOffset={20} id="admin_profile_view" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-bold text-2xl text-gray-950 tracking-tight">Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your account information and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-emerald-50 border-4 border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-3xl uppercase mb-4 shadow-sm">
              {user.name.substring(0, 2)}
            </div>
            <h2 className="font-bold text-xl text-gray-900">{user.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{user.email}</p>
            
            <div className="mt-4 px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-700 rounded-full flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider">
              <Shield className="h-3.5 w-3.5" />
              Administrator
            </div>
          </div>

          {/* Sign Out Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
            <button
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-gray-900 hover:bg-gray-800 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Right Column: Detailed Information */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Personal Information */}
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <User className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-base text-gray-900">Personal Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Full Name</label>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  {user.name}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Email Address</label>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  {user.email}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">User ID</label>
                <div className="flex items-center gap-2 text-gray-900 font-medium text-sm">
                  {user.id}
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Role</label>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  {user.role}
                </div>
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <Activity className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-base text-gray-900">Account Information</h3>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Role</label>
                <div className="flex items-center gap-2 text-gray-900 font-medium">
                  <Shield className="h-4 w-4 text-emerald-600" /> Administrator
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Account Status</label>
                <div className="flex items-center gap-1.5 text-gray-900 font-medium">
                  <CheckCircle className="h-4 w-4 text-emerald-500" /> Active
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Created Date</label>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" /> Not available
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Last Login</label>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" /> Not available
                </div>
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50 flex items-center gap-2">
              <Lock className="h-5 w-5 text-gray-500" />
              <h3 className="font-bold text-base text-gray-900">Security</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">Password</label>
                <div className="text-gray-900 font-medium tracking-[0.2em] text-lg">
                  ••••••••••••
                </div>
                <p className="text-xs text-gray-500 mt-1">Your password is securely hashed and protected. Password changing is configured exclusively via SSO.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </CinematicSection>
  );
}
