import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import {
  User, Shield, Lock, Eye, EyeOff, AlertCircle, Edit2, X, Check, Camera, Accessibility
} from 'lucide-react';
import { User as UserType } from '../types';
import { CinematicSection } from './CinematicMotion';

interface TrainerProfileViewProps {
  user: UserType;
  onUpdateProfile: (updates: Partial<UserType>) => void;
}

type ActiveSection = 'profile' | 'password';

export default function AccessibilityTrainerProfileView({ user, onUpdateProfile }: TrainerProfileViewProps) {
  // -- Profile Form State --
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
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
    onUpdateProfile({ name, email, avatarUrl: avatarUrl || undefined });
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
        <p className="text-sm text-gray-500 mt-1">Manage your Accessibility Trainer profile information and account security.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {([
          { id: 'profile' as ActiveSection, label: 'Profile Information', icon: <User className="h-4 w-4" /> },
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
          <div className="lg:col-span-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left: Profile Edit Form */}
            <div id="profile_edit_card" className="lg:col-span-7 bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-5 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-5">
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
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition"
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
                    Internal System Role: <span className="font-semibold text-emerald-700">Accessibility Trainer</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    <Edit2 className="h-3 w-3" /> Change Photo
                  </button>
                </div>
              </div>

              {/* Success Banner */}
              {profileSaved && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4" /> Profile updated successfully!
                </div>
              )}

              {/* Profile Form */}
              <form onSubmit={handleProfileSave} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Display Name *
                    </label>
                    <input
                      type="text"
                      required
                      className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      className="block w-full px-3.5 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                {/* Read-Only Role Section */}
                <div className="space-y-3 pt-3 pb-2 border-t border-gray-50">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Platform Role
                  </label>
                  
                  <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                             <Accessibility className="h-5 w-5" />
                         </div>
                         <div>
                             <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Assigned Role</span>
                             <span className="text-gray-900 font-bold flex items-center gap-2">Accessibility Trainer <Lock className="h-3 w-3 text-emerald-600" /></span>
                         </div>
                     </div>
                  </div>
                  <p className="text-xs text-gray-400 flex items-start gap-1">
                      <Shield className="h-4 w-4 mt-[1px]" />
                      Your platform role is managed by the system administrator.
                  </p>
                </div>

                <div className="pt-2 flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={profileLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50/80 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 font-semibold text-sm rounded-lg"
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

            {/* Right: Account Information */}
            <div className="lg:col-span-5 space-y-5 lg:max-h-full pr-1">
              <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4 hover:shadow-premium transition-all duration-300">
                <h3 className="font-bold text-sm text-gray-950 uppercase tracking-wider">Account Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">Role</span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Accessibility Trainer</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">Account Status</span>
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" /> Active
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                    <span className="text-xs text-gray-500">Primary Email</span>
                    <span className="text-xs font-bold text-gray-900 truncate max-w-[150px]">{email}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ──── CHANGE PASSWORD SECTION ──── */}
        {activeSection === 'password' && (
          <div className="lg:col-span-7">
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 hover:bg-white/85 hover:shadow-premium transition-all duration-300 space-y-6">
              <div>
                <h3 className="font-bold text-base text-gray-900">Change Password</h3>
                <p className="text-xs text-gray-500 mt-1">
                  For your security, use a strong password with at least 6 characters.
                </p>
              </div>

              {passwordSaved && (
                <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs font-semibold text-emerald-800">
                  <Check className="h-4 w-4" /> Password changed successfully!
                </div>
              )}

              <form onSubmit={handlePasswordSave} className="space-y-5">
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
                    type="submit"
                    disabled={passwordLoading}
                    className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50/80 hover:bg-emerald-100 disabled:opacity-60 text-emerald-700 font-semibold text-sm rounded-lg"
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
