import React, { useState } from 'react';
import { Mail, Lock, CheckSquare, Square, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { apiBaseUrl } from '../utils/api';

interface LoginViewProps {
  onLogin: (email: string, name: string, role: 'Learner' | 'Instructor' | 'Accessibility Trainer') => void;
  onNavigateToRegister: () => void;
}

export default function LoginView({ onLogin, onNavigateToRegister }: LoginViewProps) {
  const [email, setEmail] = useState('learner@aslsignai.edu');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('asl_access_token', data.access_token);
      onLogin(email, 'Signed In User', data.role || 'Learner');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = (role: 'Learner' | 'Instructor' | 'Accessibility Trainer') => {
    if (role === 'Learner') {
      onLogin('learner@aslsignai.edu', 'Jane Doe', 'Learner');
    } else if (role === 'Instructor') {
      onLogin('instructor@aslsignai.edu', 'Marcus Sterling', 'Instructor');
    } else {
      onLogin('trainer@aslsignai.edu', 'Sarah Jenkins', 'Accessibility Trainer');
    }
  };

  return (
    <div id="login_container" className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div id="login_card" className="max-w-4xl w-full mx-auto bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden lg:grid lg:grid-cols-12">
        
        {/* Left Brand Panel */}
        <div id="login_brand_panel" className="hidden lg:flex lg:col-span-5 bg-emerald-50 p-10 flex-col justify-between border-r border-gray-100">
          <div className="space-y-6">
            <div className="flex items-center space-x-2 text-emerald-600">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              <span className="font-sans font-bold text-xl tracking-tight text-gray-900">SignAI Learn</span>
            </div>
            
            <div className="space-y-4">
              <h2 className="font-sans font-bold text-2xl text-gray-950 leading-snug">
                Real-Time Sign Feedback, Anywhere.
              </h2>
              <p className="font-sans text-sm text-gray-600 leading-relaxed">
                Connect your webcam and practice ASL with immediate, AI-powered accuracy scoring and corrective feedback.
              </p>
            </div>
          </div>

          <div className="space-y-4 pt-8 border-t border-emerald-100">
            <h4 className="font-sans font-medium text-xs text-gray-400 uppercase tracking-wider">Quick Demo Login</h4>
            <div className="space-y-2">
              <button 
                id="demo_learner"
                onClick={() => handleDemoLogin('Learner')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200"
              >
                <span>Learner Profile</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>
              <button 
                id="demo_instructor"
                onClick={() => handleDemoLogin('Instructor')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200"
              >
                <span>Instructor Profile</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>
              <button 
                id="demo_trainer"
                onClick={() => handleDemoLogin('Accessibility Trainer')}
                className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:border-emerald-500 hover:text-emerald-600 transition-all duration-200"
              >
                <span>Accessibility Trainer</span>
                <ArrowRight className="h-3.5 w-3.5 text-gray-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Form Panel */}
        <div id="login_form_panel" className="lg:col-span-7 p-8 sm:p-12 flex flex-col justify-center">
          <div className="lg:hidden flex items-center space-x-2 text-emerald-600 mb-8">
            <ShieldCheck className="h-7 w-7 text-emerald-600" />
            <span className="font-sans font-bold text-lg tracking-tight text-gray-900">SignAI Learn</span>
          </div>

          <div className="space-y-2 mb-8">
            <h1 id="login_title" className="font-sans font-bold text-3xl text-gray-950 tracking-tight">Sign In</h1>
            <p className="font-sans text-sm text-gray-500">Welcome back! Access your customized sign language dashboard.</p>
          </div>

          {error && (
            <div id="login_error" className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100">
              {error}
            </div>
          )}

          <form id="login_form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="login_email" className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="login_email"
                  type="email"
                  required
                  placeholder="name@university.edu"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400 transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="login_password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  id="forgot_password_btn"
                  type="button"
                  onClick={() => alert('Password reset directions have been dispatched to your email address.')}
                  className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="login_password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  className="block w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm placeholder-gray-400 transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  id="toggle_password_btn"
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <button
                id="remember_me_btn"
                type="button"
                onClick={() => setRememberMe(!rememberMe)}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 focus:outline-none"
              >
                {rememberMe ? (
                  <CheckSquare className="h-5 w-5 text-emerald-600" />
                ) : (
                  <Square className="h-5 w-5 text-gray-300" />
                )}
                <span>Remember Me</span>
              </button>
            </div>

            <button
              id="signin_submit"
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-emerald-600 text-white font-sans font-medium text-sm rounded-xl hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition duration-150 flex items-center justify-center space-x-2 disabled:opacity-75"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>

          <div id="login_footer" className="mt-8 pt-6 border-t border-gray-100 text-center">
            <span className="text-sm text-gray-500">Don't have an account? </span>
            <button
              id="navigate_to_register"
              onClick={onNavigateToRegister}
              className="text-sm font-semibold text-emerald-600 hover:text-emerald-700 focus:outline-none"
            >
              Register Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
