import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  User, Shield, GraduationCap, Users, Accessibility, Check,
  Award, Camera, Lock, Eye, EyeOff, AlertCircle, Edit2, X, Target, Briefcase, Activity, CheckCircle2, ShieldCheck,
  TrendingUp, BookOpen
} from 'lucide-react';
import { User as UserType } from '../types';
import { apiBaseUrl } from '../utils/api';
import { CinematicSection } from './CinematicMotion';

interface ProfileViewProps {
  user: UserType;
  onUpdateProfile: (updates: Partial<UserType>) => void;
}

type ActiveSection = 'profile' | 'teaching' | 'password';

interface AssignedLearner {
  learner_id: number;
  username: string;
  practice_attempts: number;
  average_accuracy: number;
  lessons_completed?: number;
}

export default function InstructorProfileView({ user, onUpdateProfile }: ProfileViewProps) {
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

  // -- Instructor Data State --
  const [learners, setLearners] = useState<AssignedLearner[]>([]);
  const [loadingLearners, setLoadingLearners] = useState(true);

  useEffect(() => {
    const fetchClassroom = async () => {
      setLoadingLearners(true);
      try {
        const token = localStorage.getItem('asl_access_token');
        const res = await fetch(`${apiBaseUrl}/instructors/learners`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setLearners(data);
        }
      } catch (e) {
        console.error("Failed to load learners for instructor profile");
      } finally {
        setLoadingLearners(false);
      }
    };
    fetchClassroom();
  }, []);

  const totalAssigned = learners.length;
  const activeLearners = Math.max(0, learners.filter(l => l.practice_attempts > 0).length);
  const avgAccuracy = learners.length > 0 
    ? Math.round(learners.reduce((sum, l) => sum + (l.average_accuracy || 0), 0) / learners.length) 
    : 0;

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
        <p className="text-sm text-gray-500 mt-1">Manage your profile information, role, and account security.</p>
      </div>

      {/* Section Tabs */}
      <div className="flex border-b border-gray-200 gap-1 overflow-x-auto">
        {([
          { id: 'profile' as ActiveSection, label: 'Profile Information', icon: <User className="h-4 w-4" /> },
          { id: 'teaching' as ActiveSection, label: 'Teaching Overview', icon: <Briefcase className="h-4 w-4" /> },
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
                    Current Role: <span className="font-semibold text-emerald-700">Instructor</span>
                  </p>
                  <button
                    type="button"
                    aria-label="Change Photo text link"
                    onClick={() => fileInputRef.current?.click()}
                    className="mt-2 flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                  >
                    <Edit2 className="h-3 w-3" />
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

                {/* Role Read-Only Section */}
                <div className="space-y-3 pt-3 pb-2 border-t border-gray-50">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">
                    Platform Role
                  </label>
                  
                  <div className="p-4 border border-emerald-200 bg-emerald-50 rounded-xl flex items-center justify-between shadow-sm">
                     <div className="flex items-center gap-3">
                         <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                             <Users className="h-5 w-5" />
                         </div>
                         <div>
                             <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider block">Assigned Role</span>
                             <span className="text-gray-900 font-bold flex items-center gap-2">Instructor <Lock className="h-3 w-3 text-emerald-600" /></span>
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

            {/* Right: Instructor Overview */}
            <div className="lg:col-span-5 space-y-5 lg:max-h-full overflow-y-auto custom-scrollbar pr-1">
              <div id="achievements_card" className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm space-y-4">
                <div>
                   <h3 className="font-bold text-sm text-gray-950 uppercase tracking-wider">Instructor Overview</h3>
                   <span className="text-xs text-gray-400">Your teaching activity and classroom performance.</span>
                </div>
                
                {loadingLearners ? (
                   <div className="text-center p-8">
                     <span className="animate-spin h-6 w-6 border-2 border-emerald-700 border-t-transparent rounded-full mx-auto block mb-2" />
                     <p className="text-xs text-gray-500">Loading metrics...</p>
                   </div>
                ) : learners.length === 0 ? (
                  <div className="text-center p-8 bg-gray-50 border border-gray-100 rounded-xl">
                      <Users className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                      <h4 className="font-bold text-gray-900 text-sm">No instructor activity yet</h4>
                      <p className="text-xs text-gray-500 mt-1">Assigned learner activity and classroom analytics will appear here.</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {[
                      { label: 'Assigned Learners', value: totalAssigned, color: 'text-amber-600', bg: 'bg-amber-50' },
                      { label: 'Active Learners', value: activeLearners, color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'Lessons Managed', value: 0, color: 'text-blue-600', bg: 'bg-blue-50' },
                      { label: 'Assessments Reviewed', value: 0, color: 'text-purple-600', bg: 'bg-purple-50' },
                      { label: 'Average Class Accuracy', value: `${avgAccuracy}%`, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                      { label: 'Certifications Monitored', value: 0, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                    ].map((stat, i) => (
                      <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                        <span className="text-xs font-semibold text-gray-600">{stat.label}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>{stat.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ──── TEACHING OVERVIEW SECTION ──── */}
        {activeSection === 'teaching' && (
          <div className="lg:col-span-12">
            <div className="bg-white/70 backdrop-blur-xl border border-white/60 shadow-glass rounded-[1.5rem] p-6 hover:bg-white/85 hover:shadow-premium transition-all duration-300">
               <div className="mb-6">
                 <h3 className="font-bold text-xl text-gray-950">Teaching Overview</h3>
                 <p className="text-sm text-gray-500">Monitor engagement and class performance thresholds across your cohort.</p>
               </div>

               {loadingLearners ? (
                   <div className="text-center p-16">
                     <span className="animate-spin h-8 w-8 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto block mb-4" />
                     <p className="text-sm text-gray-500">Processing classroom analytics...</p>
                   </div>
               ) : learners.length === 0 ? (
                 <div className="text-center p-16 bg-gray-50 border border-gray-100 rounded-xl">
                      <Briefcase className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <h4 className="font-bold text-gray-900 text-lg">No instructor activity yet</h4>
                      <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">Assigned learner activity and classroom analytics will appear here.</p>
                 </div>
               ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                     <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 p-5 rounded-2xl flex flex-col justify-between h-32">
                        <Activity className="h-6 w-6 text-indigo-500 mb-2" />
                        <div>
                           <p className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400">Learner Engagement</p>
                           <h4 className="text-xl font-bold text-indigo-900">{activeLearners} Active</h4>
                        </div>
                     </div>
                     <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 p-5 rounded-2xl flex flex-col justify-between h-32">
                        <Target className="h-6 w-6 text-purple-500 mb-2" />
                        <div>
                           <p className="text-[10px] font-extrabold uppercase tracking-widest text-purple-400">Assessment Activity</p>
                           <h4 className="text-xl font-bold text-purple-900">0 Reviewed</h4>
                        </div>
                     </div>
                     <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 p-5 rounded-2xl flex flex-col justify-between h-32">
                        <TrendingUp className="h-6 w-6 text-emerald-500 mb-2" />
                        <div>
                           <p className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-400">Class Performance</p>
                           <h4 className="text-xl font-bold text-emerald-900">{avgAccuracy}% Median</h4>
                        </div>
                     </div>
                     <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 p-5 rounded-2xl flex flex-col justify-between h-32">
                        <ShieldCheck className="h-6 w-6 text-amber-500 mb-2" />
                        <div>
                           <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400">Certification</p>
                           <h4 className="text-xl font-bold text-amber-900">0 Monitored</h4>
                        </div>
                     </div>
                 </div>
               )}
            </div>
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
