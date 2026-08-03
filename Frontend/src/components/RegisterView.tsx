import React, { useState } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, GraduationCap, Users, Accessibility } from 'lucide-react';
import { UserRole } from '../types';
import { apiBaseUrl } from '../utils/api';

interface RegisterViewProps {
  onRegister: (email: string, name: string, role: UserRole) => void;
  onNavigateToLogin: () => void;
}

export default function RegisterView({ onRegister, onNavigateToLogin }: RegisterViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Learner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: name, email, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Registration failed');
      }

      localStorage.setItem('asl_access_token', data.access_token);
      onRegister(email, name, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div id="register_container" className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div id="register_card" className="max-w-4xl w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:grid lg:grid-cols-12">
        
        {/* Left Info Panel */}
        <div id="register_brand_panel" className="hidden lg:flex lg:col-span-5 bg-emerald-50 p-10 flex-col justify-between border-r border-gray-100">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-600">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <span className="font-sans font-bold text-xl tracking-tight text-gray-900">SignAI Learn</span>
            </div>
            
            <div className="space-y-5">
              <h2 className="font-sans font-bold text-2xl text-gray-950 leading-snug">
                Join a Global Community of Signers.
              </h2>
              <p className="font-sans text-sm text-gray-600 leading-relaxed">
                Whether you are a professional learner, an academic instructor, or an accessibility coordinator, we have custom interfaces ready for you.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <GraduationCap className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-xs text-gray-900">Comprehensive Syllabus</h4>
                <p className="text-xs text-gray-500">Dozens of high-yield lessons spanning alphabets to advanced conversational phrases.</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                <Accessibility className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-sans font-semibold text-xs text-gray-900">Webcam Recognition</h4>
                <p className="text-xs text-gray-500">Practice via web cameras using neural-ready models displaying real-time feedback.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div id="register_form_panel" className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center space-x-2 text-emerald-600 mb-8">
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
            <span className="font-sans font-bold text-lg tracking-tight text-gray-900">SignAI Learn</span>
          </div>

          <div className="space-y-2 mb-6">
            <h1 id="register_title" className="font-sans font-bold text-3xl text-gray-950 tracking-tight">Create Account</h1>
            <p className="font-sans text-sm text-gray-500">Enter your details to register and select your training pathway.</p>
          </div>

          {error && (
            <div id="register_error" className="mb-4 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <form id="register_form" onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <div>
              <label htmlFor="reg_name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="reg_name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400 transition"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="reg_email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="reg_email"
                  type="email"
                  required
                  placeholder="name@university.edu"
                  className="block w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            {/* Role Selector Grid */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Platform Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  id="role_learner"
                  type="button"
                  onClick={() => setRole('Learner')}
                  className={`py-2 px-1 flex flex-col items-center justify-center border rounded-xl text-center transition ${
                    role === 'Learner'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <GraduationCap className="h-4 w-4 mb-1" />
                  <span className="text-[11px]">Learner</span>
                </button>
                
                <button
                  id="role_instructor"
                  type="button"
                  onClick={() => setRole('Instructor')}
                  className={`py-2 px-1 flex flex-col items-center justify-center border rounded-xl text-center transition ${
                    role === 'Instructor'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-4 w-4 mb-1" />
                  <span className="text-[11px]">Instructor</span>
                </button>

                <button
                  id="role_trainer"
                  type="button"
                  onClick={() => setRole('Accessibility Trainer')}
                  className={`py-2 px-1 flex flex-col items-center justify-center border rounded-xl text-center transition ${
                    role === 'Accessibility Trainer'
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-medium'
                      : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Accessibility className="h-4 w-4 mb-1" />
                  <span className="text-[11px] leading-tight">Trainer</span>
                </button>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="reg_pass" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="reg_pass"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  id="reg_toggle_pass"
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="reg_confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  id="reg_confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400 transition"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <button
              id="register_submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 mt-2 bg-emerald-600 text-white font-sans font-medium text-sm rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              <span>{isSubmitting ? 'Creating Profile...' : 'Register'}</span>
            </button>
          </form>

          <div id="register_footer" className="mt-6 pt-4 border-t border-gray-100 text-center">
            <span className="text-sm text-gray-500">Already have an account? </span>
            <button
              id="navigate_to_login"
              onClick={onNavigateToLogin}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
