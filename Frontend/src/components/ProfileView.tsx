import React, { useState } from 'react';
import { User, Shield, GraduationCap, Users, Accessibility, Check, BadgeAlert, Award, Calendar, BookOpen } from 'lucide-react';
import { User as UserType, UserRole } from '../types';

interface ProfileViewProps {
  user: UserType;
  onUpdateProfile: (updates: Partial<UserType>) => void;
}

export default function ProfileView({ user, onUpdateProfile }: ProfileViewProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({ name, email, role });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const getRoleDescription = (r: UserRole) => {
    switch (r) {
      case 'Learner':
        return 'Standard education mode. Unlocks interactive lesson lists, personal streak rewards, computer vision practice canvas, and performance scoring.';
      case 'Instructor':
        return 'Academic management mode. Tracks classroom analytics, manages custom handshape curriculum structures, and downloads cohort performance files.';
      case 'Accessibility Trainer':
        return 'Specialized coordinator mode. Customizes joints coordinate sensitivity thresholds, triggers high-contrast overlays, and configures screen-reader audio guides.';
    }
  };

  const achievements = [
    { title: 'Five Day Streak', desc: 'Practiced sign language 5 days consecutively', unlocked: true, icon: '🔥' },
    { title: 'Alphabet Expert', desc: 'Completed ASL Alphabet A-E with 90%+ accuracy', unlocked: true, icon: '🎓' },
    { title: 'Computer Vision Hero', desc: 'Participated in 25 live assessment rounds', unlocked: true, icon: '🤖' },
    { title: 'Social Signer', desc: 'Completed Social Greetings with perfect accuracy', unlocked: false, icon: '💬' },
  ];

  return (
    <div id="profile_view" className="space-y-6">
      <div>
        <h1 id="profile_header_title" className="font-sans font-bold text-2xl text-gray-950 tracking-tight">User Account Profile</h1>
        <p className="text-sm text-gray-500">Update your credentials, switch specialized platform roles, and review earned accomplishments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: General Profile Edit (Colspan 7) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-6">
          <div className="flex items-center space-x-4 border-b border-gray-100 pb-5">
            <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-2xl uppercase">
              {name.substring(0, 2)}
            </div>
            <div>
              <h3 className="font-sans font-bold text-lg text-gray-900">{name}</h3>
              <p className="text-xs text-gray-400">Current Role: <span className="font-semibold text-emerald-700">{role}</span></p>
            </div>
          </div>

          {isSaved && (
            <div id="profile_save_success" className="p-4 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-100 flex items-center space-x-2">
              <Check className="h-4 w-4" />
              <span>Profile updated successfully! Switching roles will refresh available features.</span>
            </div>
          )}

          <form id="profile_form" onSubmit={handleSave} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="prof_name" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Display Name
                </label>
                <input
                  id="prof_name"
                  type="text"
                  required
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="prof_email" className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  id="prof_email"
                  type="email"
                  required
                  className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Role Manager */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider">
                Select Active Platform Role
              </label>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  id="switch_role_learner"
                  type="button"
                  onClick={() => setRole('Learner')}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center transition ${
                    role === 'Learner'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="h-5 w-5 mb-1 text-emerald-600" />
                  <span className="text-xs">Learner</span>
                </button>

                <button
                  id="switch_role_instructor"
                  type="button"
                  onClick={() => setRole('Instructor')}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center transition ${
                    role === 'Instructor'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-5 w-5 mb-1 text-emerald-600" />
                  <span className="text-xs">Instructor</span>
                </button>

                <button
                  id="switch_role_trainer"
                  type="button"
                  onClick={() => setRole('Accessibility Trainer')}
                  className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center transition ${
                    role === 'Accessibility Trainer'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Accessibility className="h-5 w-5 mb-1 text-emerald-600" />
                  <span className="text-xs leading-none">Accessibility Trainer</span>
                </button>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg text-xs text-gray-600 leading-relaxed border border-gray-100 flex items-start space-x-2.5">
                <Shield className="h-4.5 w-4.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Role Behavior: </span>
                  <span>{getRoleDescription(role)}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                id="profile_save_btn"
                type="submit"
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-sans font-semibold text-sm rounded-lg transition shadow-sm"
              >
                Save Profile Changes
              </button>
            </div>
          </form>
        </div>

        {/* Right Side: Achievements / Metrics Breakdown (Colspan 5) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Achievements badge block */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
            <h3 className="font-sans font-bold text-sm text-gray-950 uppercase tracking-wider">Achievements & Badges</h3>
            <div className="space-y-3">
              {achievements.map((a, i) => (
                <div key={i} className={`p-3 border rounded-lg flex items-start space-x-3 ${
                  a.unlocked ? 'border-gray-100 bg-white' : 'border-dashed border-gray-200 bg-gray-50/50 opacity-60'
                }`}>
                  <span className="text-2xl">{a.icon}</span>
                  <div>
                    <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                      <span>{a.title}</span>
                      {a.unlocked && <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-bold uppercase">Active</span>}
                    </h4>
                    <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{a.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Info card */}
          <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3 text-xs text-gray-600 leading-relaxed">
            <h4 className="font-sans font-bold text-gray-900 flex items-center space-x-1.5">
              <Award className="h-4 w-4 text-emerald-600" />
              <span>Academic Integrity Standard</span>
            </h4>
            <p>
              Your sign classification statistics are secured under the standard platform compliance framework. For student credentialing, share your verified portfolio reports with instructors.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
