import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User, Shield, GraduationCap, Users, Accessibility, Check,
  Award, Camera, Lock, Eye, EyeOff, AlertCircle, Edit2, X
} from 'lucide-react';
import { User as UserType, UserRole } from '../types';
import { mockAchievements } from '../mockData';
import { CinematicSection } from './CinematicMotion';

interface ProfileViewProps {
  user: UserType;
  onUpdateProfile: (updates: Partial<UserType>) => void;
}

import AchievementsDashboard from './AchievementsDashboard';

type ActiveSection = 'profile' | 'achievements' | 'password';

export default function ProfileView({ user, onUpdateProfile }: ProfileViewProps) {
  // -- Profile Form State --
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // -- Password Form State --
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});

  // -- Avatar upload ref --
  const fileInputRef = useRef<HTMLInputElement>(null);

  // -- Active section tabs --
  const [activeSection, setActiveSection] = useState<ActiveSection>('profile');

  // ─── Handlers ────────────────────────────────────────────────

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarUrl(ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    onUpdateProfile({ name, email, role, avatarUrl: avatarUrl || undefined });
    setProfileLoading(false);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3500);
  };

  const validatePassword = (): boolean => {
    const errs: Record<string, string> = {};
    if (!oldPassword) errs.oldPassword = 'Current password is required.';
    if (!newPassword) errs.newPassword = 'New password is required.';
    else if (newPassword.length < 6) errs.newPassword = 'Password must be at least 6 characters.';
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your new password.';
    else if (newPassword !== confirmPassword) errs.confirmPassword = 'Passwords do not match.';
    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setPasswordLoading(true);
    await new Promise((res) => setTimeout(res, 800));
    setPasswordLoading(false);
    setPasswordSaved(true);
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordSaved(false), 3500);
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

  const roles: { value: UserRole; label: string; icon: React.ReactNode }[] = [
    { value: 'Learner', label: 'Learner', icon: <GraduationCap className="h-5 w-5 mb-1 text-emerald-600" /> },
    { value: 'Instructor', label: 'Instructor', icon: <Users className="h-5 w-5 mb-1 text-emerald-600" /> },
    { value: 'Accessibility Trainer', label: 'Accessibility Trainer', icon: <Accessibility className="h-5 w-5 mb-1 text-emerald-600" /> },
  ];

  const PasswordField = ({
    id, label, value, onChange, show, toggleShow, error
  }: {
    id: string; label: string; value: string;
    onChange: (v: string) => void; show: boolean;
    toggleShow: () => void; error?: string;
  }) => (
    <div>
      <label htmlFor={id} className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (passwordErrors[id]) setPasswordErrors((prev) => ({ ...prev, [id]: '' }));
          }}
          className={`block w-full pl-9 pr-10 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-white'}`}
          placeholder="••••••••"
        />
        <button type="button" onClick={toggleShow} aria-label={show ? 'Hide Password' : 'Show Password'} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none focus:text-blue-500 rounded p-1">
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" /> {error}
        </p>
      )}
    </div>
  );

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={60} id="profile_view" className="space-y-6">
      {/* Header */}
      <div>
        <h1 id="profile_header_title" className="font-bold text-2xl text-gray-950 tracking-tight">Account Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile information, role, and account security.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {([
          { id: 'profile' as ActiveSection, label: 'Profile Information', icon: <User className="h-4 w-4" /> },
          { id: 'achievements' as ActiveSection, label: 'Achievements Gallery', icon: <Award className="h-4 w-4" /> },
          { id: 'password' as ActiveSection, label: 'Change Password', icon: <Lock className="h-4 w-4" /> },
        ]).map((tab) => (
          <button
            key={tab.id}
            id={`profile_tab_${tab.id}`}
            role="tab"
            aria-selected={activeSection === tab.id}
            aria-label={tab.label}
            onClick={() => setActiveSection(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold transition border-b-2 -mb-px whitespace-nowrap focus:outline-none focus:bg-gray-50 rounded-t-lg ${
              activeSection === tab.id
                ? 'border-emerald-600 text-emerald-600 font-bold'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ──── PROFILE SECTION ──── */}
        {activeSection === 'profile' && (
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-[calc(100vh-240px)] items-start">
            {/* Left: Profile Edit Form */}
            <div id="profile_edit_card" className="lg:col-span-7 bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-5 lg:max-h-full overflow-y-auto custom-scrollbar">
              {/* Avatar Section */}
              <div className="flex items-center space-x-5 pb-5 border-b border-gray-100">
                <div className="relative group">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={name}
                      className="h-20 w-20 rounded-full object-cover border-2 border-emerald-100"
                    />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-emerald-50 border-2 border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-2xl uppercase">
                      {name.substring(0, 2)}
                    </div>
                  )}
                  <button
                    type="button"
                    id="avatar_change_btn"
                    aria-label="Change profile photo hover button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition"
                  >
                    <Camera className="h-5 w-5 text-white" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-gray-900">{name}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Current Role: <span className="font-semibold text-emerald-700">{role}</span>
                  </p>
                  <button
                    type="button"
                    aria-label="Change Photo text link"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <Edit2 className="h-3 w-3" />
                    Change Photo
                  </button>
                </div>
              </div>

              {/* Success Banner */}
              {profileSaved && (
                <div id="profile_save_success" className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4" />
                  Profile updated successfully!
                </div>
              )}

              {/* Profile Form */}
              <form id="profile_form" onSubmit={handleProfileSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="prof_name" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Display Name *
                    </label>
                    <input
                      id="prof_name"
                      type="text"
                      required
                      className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="prof_email" className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="prof_email"
                      type="email"
                      required
                      className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Role Selector */}
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Platform Role
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {roles.map((r) => (
                      <button
                        key={r.value}
                        id={`switch_role_${r.value.toLowerCase().replace(' ', '_')}`}
                        type="button"
                        aria-pressed={role === r.value}
                        aria-label={`Select role ${r.label}`}
                        onClick={() => setRole(r.value)}
                        className={`p-4 border rounded-xl flex flex-col items-center justify-center text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition ${
                          role === r.value
                            ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-semibold shadow-sm'
                            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {r.icon}
                        <span className="text-xs leading-tight">{r.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg border border-gray-100 text-xs text-gray-600">
                    <Shield className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                    <span>{getRoleDescription(role)}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    id="profile_save_btn"
                    type="submit"
                    disabled={profileLoading}
                    aria-label="Save Profile Changes"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50/80 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 font-semibold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shadow-sm"
                  >
                    {profileLoading ? (
                      <span className="animate-spin h-4 w-4 border-2 border-emerald-700 border-t-transparent rounded-full" />
                    ) : (
                      <Check className="h-4 w-4" />
                    )}
                    {profileLoading ? 'Saving...' : 'Save Profile'}
                  </motion.button>
                </div>
              </form>
            </div>

            {/* Right: Achievements */}
            <div className="lg:col-span-5 space-y-5 lg:max-h-full overflow-y-auto custom-scrollbar pr-1">
              <div id="achievements_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-sm text-gray-950 uppercase tracking-wider">Achievements & Badges</h3>
                <div className="space-y-3">
                  {mockAchievements.map((a) => (
                    <div
                      key={a.id}
                      className={`p-3 border rounded-lg flex items-start space-x-3 ${
                        a.unlocked ? 'border-gray-100 bg-white' : 'border-dashed border-gray-200 bg-gray-50/50 opacity-55'
                      }`}
                    >
                      <span className="text-2xl">{a.emoji}</span>
                      <div>
                        <h4 className="text-xs font-semibold text-gray-900 flex items-center gap-1.5">
                          <span>{a.title}</span>
                          {a.unlocked && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 rounded font-bold uppercase">Active</span>
                          )}
                        </h4>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-tight">{a.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-3">
                <h4 className="font-bold text-sm text-gray-900 uppercase tracking-wider">Learning Stats</h4>
                {[
                  { label: 'Lessons Completed', value: user.lessonsCompleted },
                  { label: 'Practice Sessions', value: user.practiceSessions },
                  { label: 'Average Accuracy', value: `${user.avgAccuracy}%` },
                  { label: 'Current Streak', value: `${user.streak} days` },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">{stat.label}</span>
                    <span className="text-xs font-bold text-gray-900">{stat.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ──── ACHIEVEMENTS SECTION ──── */}
        {activeSection === 'achievements' && (
          <div className="lg:col-span-12">
            <AchievementsDashboard />
          </div>
        )}

        {/* ──── CHANGE PASSWORD SECTION ──── */}
        {activeSection === 'password' && (
          <div className="lg:col-span-7">
            <div id="change_password_card" className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-500 mt-1">
                  For your security, use a strong password with at least 6 characters.
                </p>
              </div>

              {/* Success Banner */}
              {passwordSaved && (
                <div id="password_save_success" className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4" />
                  Password changed successfully!
                </div>
              )}

              <form id="password_form" onSubmit={handlePasswordSave} className="space-y-5">
                <PasswordField
                  id="oldPassword"
                  label="Current Password *"
                  value={oldPassword}
                  onChange={setOldPassword}
                  show={showOld}
                  toggleShow={() => setShowOld(!showOld)}
                  error={passwordErrors.oldPassword}
                />
                <PasswordField
                  id="newPassword"
                  label="New Password * (min. 6 characters)"
                  value={newPassword}
                  onChange={setNewPassword}
                  show={showNew}
                  toggleShow={() => setShowNew(!showNew)}
                  error={passwordErrors.newPassword}
                />
                <PasswordField
                  id="confirmPassword"
                  label="Confirm New Password *"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  show={showConfirm}
                  toggleShow={() => setShowConfirm(!showConfirm)}
                  error={passwordErrors.confirmPassword}
                />

                {/* Password strength indicator */}
                {newPassword.length > 0 && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Password strength</p>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => {
                        const strength = Math.min(Math.floor(newPassword.length / 3), 4);
                        return (
                          <div
                            key={level}
                            className={`h-1.5 flex-1 rounded-full transition-colors ${
                              level <= strength
                                ? strength >= 4 ? 'bg-emerald-500' : strength >= 2 ? 'bg-amber-500' : 'bg-red-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      {newPassword.length < 6 ? 'Too short' : newPassword.length < 9 ? 'Fair' : newPassword.length < 12 ? 'Good' : 'Strong'}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    id="password_save_btn"
                    type="submit"
                    disabled={passwordLoading}
                    aria-label="Update Password"
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50/80 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 font-semibold text-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors shadow-sm"
                  >
                    {passwordLoading ? (
                      <span className="animate-spin h-4 w-4 border-2 border-emerald-700 border-t-transparent rounded-full" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {passwordLoading ? 'Updating...' : 'Update Password'}
                  </motion.button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </CinematicSection>
  );
}
