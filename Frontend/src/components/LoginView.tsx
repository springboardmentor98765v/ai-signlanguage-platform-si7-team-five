import React, { useState } from 'react';
import { Mail, Lock, CheckSquare, Square, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
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

  // Specular Highlight Logic
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const springConfig = { damping: 30, stiffness: 400 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);
  const spotlightBackground = useTransform(
    () => `radial-gradient(500px circle at ${smoothMouseX.get()}px ${smoothMouseY.get()}px, rgba(16,185,129,0.06), transparent 80%)`
  );

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
    <div id="login_container" className="min-h-screen relative flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans">
      
      {/* Global Background Gradients with Ambient Motion */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ccebe2] via-white to-[#e1dff2] -z-20" />
      <motion.div 
        animate={{ y: [0, -30, 0], scale: [1, 1.05, 1] }} 
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#bbf7d0] rounded-full blur-[140px] opacity-60 -z-10 mix-blend-multiply" 
      />
      <motion.div 
        animate={{ y: [0, 40, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#e9d5ff] rounded-full blur-[140px] opacity-40 -z-10 mix-blend-multiply" 
      />
      {/* Sparkles / Ambient particles */}
      <motion.div animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[20%] left-[30%] w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_12px_4px_rgba(255,255,255,1)]" />
      <motion.div animate={{ opacity: [0.9, 0.3, 0.9] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} className="absolute top-[60%] left-[8%] w-1.5 h-1.5 bg-white rounded-full blur-[1px] shadow-[0_0_10px_3px_rgba(255,255,255,0.9)]" />
      <motion.div animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 3 }} className="absolute bottom-[10%] right-[30%] w-2.5 h-2.5 bg-white rounded-full blur-[2px] shadow-[0_0_15px_5px_rgba(255,255,255,1)]" />

      {/* Main Layout Card */}
      <div id="login_card" className="w-full max-w-[1100px] flex flex-col lg:flex-row relative z-10 rounded-[2rem] overflow-visible">
        
        {/* Left Side: Brand & Visuals (Glassy) */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-between relative z-20"
        >
          <div className="space-y-4">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center space-x-2.5 group/logo"
            >
              <motion.div 
                animate={{ scale: [1, 1.08, 1], filter: ['drop-shadow(0px 0px 0px rgba(16,185,129,0))', 'drop-shadow(0px 0px 8px rgba(16,185,129,0.5))', 'drop-shadow(0px 0px 0px rgba(16,185,129,0))'] }} 
                transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
              >
                <ShieldCheck className="h-7 w-7 text-emerald-600 stroke-[2.5px] group-hover/logo:text-emerald-500 transition-colors" aria-hidden="true" />
              </motion.div>
              <span className="font-extrabold text-[20px] tracking-tight text-gray-900 group-hover/logo:text-emerald-800 transition-colors">SignAI Learn</span>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2 max-w-md pt-4"
            >
              <h1 className="font-extrabold text-3xl lg:text-[38px] text-gray-950 leading-[1.05] tracking-tight">
                Real-Time Sign<br/>
                Feedback, <span className="text-emerald-600 drop-shadow-sm">Anywhere.</span>
              </h1>
              <p className="text-[14px] font-medium text-gray-500 leading-relaxed max-w-sm pt-1">
                Connect your webcam and practice ASL with immediate, AI-powered accuracy scoring and corrective feedback.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6, ease: "easeOut" }} 
              className="relative mt-4 h-[110px] w-full max-w-[340px] rounded-[1.5rem] bg-white/20 backdrop-blur-xl border border-white/50 shadow-[0_16px_32px_rgba(16,185,129,0.1),_inset_0_2px_4px_rgba(255,255,255,0.8)] flex items-center overflow-hidden"
            >
              {/* Internal abstract glows */}
              <div className="absolute top-[-20%] right-[-10%] w-[120px] h-[120px] bg-emerald-400/40 rounded-full blur-[40px]" />
              <div className="absolute bottom-[0%] left-[-10%] w-[100px] h-[100px] bg-emerald-100/30 rounded-full blur-[30px]" />
              
              {/* Animated AI Waveform */}
              <div className="absolute inset-y-0 left-6 right-8 flex items-center justify-between gap-[4px] opacity-90 mix-blend-color-dodge">
                {[12, 24, 16, 32, 45, 60, 45, 30, 20, 35, 50, 70, 40, 25, 45, 55, 30, 15, 25, 10, 18, 30, 20].map((h, i) => (
                  <motion.div 
                    key={i} 
                    animate={{ height: [`${h}%`, `${h * 0.4}%`, `${h}%`], opacity: [1, 0.5, 1] }}
                    transition={{ duration: 1.5 + (i * 0.1) % 1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-[3px] bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" 
                  />
                ))}
              </div>

              {/* Hologram Base */}
              <div className="absolute bottom-2 right-8 w-24 h-4 bg-emerald-300 left-auto rounded-[100%] blur-[4px] opacity-60 pointer-events-none" />
              <div className="absolute bottom-3 right-5 w-32 h-px bg-white left-auto shadow-[0_0_8px_rgba(255,255,255,1)] opacity-70 pointer-events-none" />
            </motion.div>

            {/* Realistic Transparent Glassy 3D Hand Removed per request */}
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="pt-6 space-y-3 max-w-sm relative z-20"
          >
            <h4 className="font-bold text-[10px] text-emerald-800/80 uppercase tracking-widest pl-1 mb-1.5" aria-label="Demo login options">Quick Demo Login</h4>
            <div className="space-y-2">
              {[
                { role: 'Learner' as const, label: 'Learner Profile' },
                { role: 'Instructor' as const, label: 'Instructor Profile' },
                { role: 'Accessibility Trainer' as const, label: 'Accessibility Trainer' }
              ].map((demo) => (
                <motion.button
                  whileHover={{ y: -2, scale: 1.01, backgroundColor: "rgba(255,255,255,0.8)" }}
                  whileTap={{ scale: 0.98 }}
                  key={demo.role}
                  onClick={() => handleDemoLogin(demo.role)}
                  className="w-full flex items-center justify-between px-4 py-2.5 bg-white/40 backdrop-blur-md border border-white/60 shadow-[0_4px_16px_rgba(0,0,0,0.02)] rounded-[1rem] text-sm font-bold text-gray-800 hover:text-emerald-700 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100/50 flex items-center justify-center">
                      <motion.span 
                        className="h-3.5 w-3.5 bg-emerald-600 rounded-full" 
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <span>{demo.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </motion.button>
              ))}
            </div>
            
            <div className="pt-4">
              <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/30 backdrop-blur-md border border-white/40 rounded-full shadow-sm">
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-[11px] font-bold text-emerald-900/70">Trusted by learners, built for inclusion.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Side: Sign In Form (White Pane with Specular Highlight) */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 p-2 lg:p-4 relative z-30 group/card"
          onPointerMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            mouseX.set(e.clientX - rect.left);
            mouseY.set(e.clientY - rect.top);
          }}
        >
          <div className="bg-white/90 backdrop-blur-xl h-full w-full rounded-[2rem] p-6 lg:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.06),_inset_0_0_0_1px_rgba(255,255,255,1)] flex flex-col justify-center border border-white/80 relative overflow-hidden">
            
            {/* Dynamic Specular Tracking Spotlight */}
            <motion.div 
              className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 z-0"
              style={{ background: spotlightBackground }}
            />
            
            <div className="space-y-2 mb-6">
              <h2 className="font-extrabold text-[28px] text-gray-900 tracking-tight">Sign In</h2>
              <p className="text-[14px] font-medium text-gray-500 leading-relaxed max-w-sm">
                Welcome back! Access your customized sign language dashboard.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type="email"
                    required
                    className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-[1rem] focus:outline-none text-[14px] font-medium text-slate-900 placeholder-slate-400 transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[13px] font-bold text-slate-700">
                    Password
                  </label>
                  <button
                    type="button"
                    className="text-[12px] font-bold text-emerald-600 hover:text-emerald-700 focus:outline-none"
                    onClick={() => alert('Password reset directions dispatched.')}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-slate-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 3px rgba(16,185,129,0.2)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    type={showPassword ? 'text' : 'password'}
                    required
                    className="block w-full pl-11 pr-11 py-3 bg-slate-50 border border-slate-200 rounded-[1rem] focus:outline-none text-[14px] font-medium text-slate-900 placeholder-slate-400 tracking-wide transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center py-1.5 relative z-10">
                <button
                  type="button"
                  onClick={() => setRememberMe(!rememberMe)}
                  className="flex items-center space-x-2 text-[13px] font-bold text-slate-600 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 rounded"
                >
                  <div className={`h-4 w-4 rounded flex items-center justify-center border ${rememberMe ? 'bg-emerald-600 border-emerald-600' : 'bg-white border-slate-300'}`}>
                    {rememberMe && <CheckSquare className="h-3 w-3 text-white" />}
                  </div>
                  <span>Remember Me</span>
                </button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isSubmitting}
                className="relative z-10 w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-bold text-[15px] rounded-[1rem] shadow-[0_8px_24px_rgba(16,185,129,0.4),_inset_0_2px_4px_rgba(255,255,255,0.4)] hover:shadow-[0_12px_32px_rgba(16,185,129,0.5)] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all flex items-center justify-center gap-2 group disabled:opacity-80 overflow-hidden"
              >
                {/* Shine Sweep Animation */}
                <span className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-[-20deg] group-hover:left-[200%] transition-all duration-1000 ease-in-out" />
                
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
                {!isSubmitting && <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" strokeWidth={3} />}
              </motion.button>
            </form>

            <div className="mt-8 pt-5 border-t border-slate-100 text-center relative z-10">
              <span className="text-[13px] font-medium text-slate-500">Don't have an account? </span>
              <button
                onClick={onNavigateToRegister}
                aria-label="Register for a new account"
                className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline"
              >
                Register Now
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
