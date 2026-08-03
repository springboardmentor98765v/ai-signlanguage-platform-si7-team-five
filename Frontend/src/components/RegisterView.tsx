import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mail, Lock, User, Eye, EyeOff, ShieldCheck, ArrowRight, GraduationCap, Users, Accessibility } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform, useAnimationFrame, AnimatePresence } from 'motion/react';
import { UserRole } from '../types';
import { apiBaseUrl } from '../utils/api';

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */
interface RegisterViewProps {
  onRegister: (email: string, name: string, role: UserRole) => void;
  onNavigateToLogin: () => void;
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS — orbit config
   ═══════════════════════════════════════════════════════════════ */
const SIGNS = [
  { img: '/signs/i_love_you.png', label: 'I Love You',    phase: 0,   speed: 1.0 },
  { img: '/signs/hello.png',      label: 'Stop / Hello',  phase: 72,  speed: 1.0 },
  { img: '/signs/thumbs_up.png',  label: 'Thumbs Up',     phase: 144, speed: 1.0 },
  { img: '/signs/peace.png',      label: 'Peace / Victory', phase: 216, speed: 1.0 },
  { img: '/signs/ok.png',         label: 'OK',            phase: 288, speed: 1.0 },
];

const RX = 86;   // 3D circle X radius
const RY = 86;   // 3D circle Y radius

/* ═══════════════════════════════════════════════════════════════
   REDUCED-MOTION HOOK
   ═══════════════════════════════════════════════════════════════ */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return reduced;
}

/* ═══════════════════════════════════════════════════════════════
   ORBITING SIGN COMPONENT  (depth-simulated)
   ═══════════════════════════════════════════════════════════════ */
interface OrbitingSignProps {
  img: string;
  label: string;
  phase: number;
  speed: number;
  reducedMotion: boolean;
}

const OrbitingSign: React.FC<OrbitingSignProps> = ({ img, label, phase, speed, reducedMotion }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const floatPhase = useRef(Math.random() * Math.PI * 2);

  // depth: sin of angle → -1 (back) to 1 (front)
  const depth = useMotionValue(Math.sin((phase * Math.PI) / 180));

  // derived transforms
  const scale    = useTransform(depth, [-1, 0, 1], [0.82, 1, 1.12]);
  const opacity  = useTransform(depth, [-1, 0, 1], [0.45, 0.8, 1]);
  const blur     = useTransform(depth, [-1, 0, 1], [1.5, 0.3, 0]);
  const zIndex   = useTransform(depth, [-1, 1], [0, 10]);
  const shadowOp = useTransform(depth, [-1, 0, 1], [0.04, 0.12, 0.25]);
  const brightness = useTransform(depth, [-1, 0, 1], [0.7, 0.9, 1.15]);

  useAnimationFrame((t) => {
    if (reducedMotion) {
      // static position for reduced motion
      const rad = (phase * Math.PI) / 180;
      x.set(Math.cos(rad) * RX);
      y.set(Math.sin(rad) * RY);
      depth.set(Math.sin(rad));
      return;
    }
    const elapsed = t / 1000;
    const baseSpeed = 0.2;
    const currentAngle = phase + elapsed * baseSpeed * speed * 360;
    const rad = (currentAngle * Math.PI) / 180;
    const float = Math.sin(elapsed * 1.8 + floatPhase.current) * 2.5;
    x.set(Math.cos(rad) * RX);
    y.set(Math.sin(rad) * RY + float);
    depth.set(Math.sin(rad));
  });

  const filterVal = useTransform(
    () => `blur(${blur.get()}px) brightness(${brightness.get()})`
  );
  const boxShadowVal = useTransform(
    () => `0 ${4 + shadowOp.get() * 8}px ${8 + shadowOp.get() * 16}px rgba(16,185,129,${shadowOp.get()})`
  );

  return (
    <motion.div
      className="absolute flex items-center justify-center will-change-transform"
      style={{
        x, y, scale, opacity, zIndex,
        rotateX: '-50.47deg', // Billboard counter-rotation
        width: 46, height: 46,
        left: 'calc(50% - 23px)',
        top: 'calc(50% - 23px)',
        transformStyle: 'preserve-3d',
      }}
      aria-label={label}
    >
      <motion.div
        className="w-[46px] h-[46px] rounded-full bg-white/70 backdrop-blur-sm flex items-center justify-center overflow-hidden"
        style={{
          filter: filterVal,
          boxShadow: boxShadowVal,
          border: '1px solid rgba(255,255,255,0.8)',
        }}
      >
        <img
          src={img}
          alt={label}
          className="w-[34px] h-[34px] object-contain select-none pointer-events-none"
          draggable={false}
          loading="lazy"
        />
      </motion.div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════
   AI CENTERPIECE (subtle glowing neural core)
   ═══════════════════════════════════════════════════════════════ */
function AICenterpiece({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" aria-hidden="true">
      {/* Outer subtle ring */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[64px] h-[64px] rounded-full"
        style={{
          border: '1px solid rgba(16,185,129,0.3)',
          boxShadow: '0 0 24px rgba(16,185,129,0.15), inset 0 0 16px rgba(16,185,129,0.1)',
        }}
        animate={reducedMotion ? {} : { scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Inner AI core */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[32px] h-[32px] rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(16,185,129,0.35) 0%, rgba(16,185,129,0.15) 60%, transparent 100%)',
          boxShadow: '0 0 20px rgba(16,185,129,0.25), 0 0 8px rgba(16,185,129,0.35)',
        }}
        animate={reducedMotion ? {} : { scale: [0.9, 1.1, 0.9], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Accessibility icon silhouette */}
      <motion.div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
        animate={reducedMotion ? {} : { opacity: [0.65, 1, 0.65], scale: [0.95, 1.05, 0.95] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <ShieldCheck className="h-8 w-8 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" strokeWidth={1.8} />
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SPECULAR LIGHT SWEEP
   ═══════════════════════════════════════════════════════════════ */
function SpecularSweep({ reducedMotion }: { reducedMotion: boolean }) {
  if (reducedMotion) return null;
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]"
      aria-hidden="true"
    >
      <motion.div
        className="absolute top-0 w-[40%] h-full"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), rgba(255,255,255,0.03), transparent)',
          transform: 'skewX(-15deg)',
        }}
        animate={{ left: ['-50%', '150%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
      />
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BACKGROUND ENHANCEMENTS
   ═══════════════════════════════════════════════════════════════ */
function EnhancedBackground({ reducedMotion }: { reducedMotion: boolean }) {
  return (
    <>
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#ccebe2] via-white to-[#e1dff2] -z-20" />
      {/* Large ambient blobs */}
      <motion.div
        animate={reducedMotion ? {} : { y: [0, -30, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#bbf7d0] rounded-full blur-[140px] opacity-60 -z-10 mix-blend-multiply"
      />
      <motion.div
        animate={reducedMotion ? {} : { y: [0, 40, 0], rotate: [0, 10, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-[#e9d5ff] rounded-full blur-[140px] opacity-40 -z-10 mix-blend-multiply"
      />
      {/* Additional depth blobs */}
      <motion.div
        animate={reducedMotion ? {} : { x: [0, 20, 0], y: [0, -15, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute top-[30%] right-[20%] w-[30%] h-[30%] bg-[#a7f3d0]/30 rounded-full blur-[120px] -z-10 mix-blend-multiply"
      />
      {/* Subtle fog layer */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/30 via-transparent to-white/20 -z-10" />
      {/* Sparkles */}
      <motion.div animate={reducedMotion ? {} : { opacity: [1, 0.3, 1] }} transition={{ duration: 4, repeat: Infinity }} className="absolute top-[20%] left-[30%] w-2 h-2 bg-white rounded-full blur-[1px] shadow-[0_0_12px_4px_rgba(255,255,255,1)]" />
      <motion.div animate={reducedMotion ? {} : { opacity: [0.9, 0.2, 0.9] }} transition={{ duration: 6, repeat: Infinity, delay: 1 }} className="absolute top-[60%] left-[8%] w-1.5 h-1.5 bg-white rounded-full blur-[1px] shadow-[0_0_10px_3px_rgba(255,255,255,0.9)]" />
      <motion.div animate={reducedMotion ? {} : { opacity: [1, 0.4, 1], scale: [1, 1.2, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 3 }} className="absolute bottom-[10%] right-[30%] w-2.5 h-2.5 bg-white rounded-full blur-[2px] shadow-[0_0_15px_5px_rgba(255,255,255,1)]" />
      {/* Additional floating particles */}
      <motion.div animate={reducedMotion ? {} : { opacity: [0.6, 0.15, 0.6], y: [0, -8, 0] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }} className="absolute top-[45%] right-[12%] w-1 h-1 bg-emerald-300 rounded-full blur-[0.5px] shadow-[0_0_6px_2px_rgba(16,185,129,0.3)]" />
      <motion.div animate={reducedMotion ? {} : { opacity: [0.5, 0.1, 0.5], y: [0, 6, 0] }} transition={{ duration: 9, repeat: Infinity, delay: 4 }} className="absolute bottom-[35%] left-[18%] w-1.5 h-1.5 bg-purple-200 rounded-full blur-[0.5px] shadow-[0_0_8px_3px_rgba(168,85,247,0.15)]" />
      {/* Neural network faint lines */}
      <svg className="absolute inset-0 w-full h-full -z-10 opacity-[0.025]" aria-hidden="true">
        <motion.line x1="10%" y1="20%" x2="40%" y2="60%" stroke="#10b981" strokeWidth="0.5"
          animate={reducedMotion ? {} : { opacity: [0.3, 0.8, 0.3] }} transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.line x1="60%" y1="15%" x2="85%" y2="55%" stroke="#10b981" strokeWidth="0.5"
          animate={reducedMotion ? {} : { opacity: [0.5, 0.2, 0.5] }} transition={{ duration: 8, repeat: Infinity, delay: 1 }}
        />
        <motion.line x1="25%" y1="70%" x2="70%" y2="85%" stroke="#8b5cf6" strokeWidth="0.5"
          animate={reducedMotion ? {} : { opacity: [0.2, 0.6, 0.2] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }}
        />
      </svg>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════ */
export default function RegisterView({ onRegister, onNavigateToLogin }: RegisterViewProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<UserRole>('Learner');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // ── Cursor-reactive lighting for register card ──
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springCfg = { damping: 25, stiffness: 300 };
  const smoothX = useSpring(mouseX, springCfg);
  const smoothY = useSpring(mouseY, springCfg);

  const cardSpotlight = useTransform(
    () => `radial-gradient(600px circle at ${smoothX.get()}px ${smoothY.get()}px, rgba(16,185,129,0.07), transparent 70%)`
  );
  const cardReflection = useTransform(
    () => `radial-gradient(400px circle at ${smoothX.get()}px ${smoothY.get()}px, rgba(255,255,255,0.12), transparent 60%)`
  );

  // ── Cursor lighting for orbit container ──
  const orbitMouseX = useMotionValue(0);
  const orbitMouseY = useMotionValue(0);
  const smoothOrbitX = useSpring(orbitMouseX, springCfg);
  const smoothOrbitY = useSpring(orbitMouseY, springCfg);
  const orbitSpotlight = useTransform(
    () => `radial-gradient(200px circle at ${smoothOrbitX.get()}px ${smoothOrbitY.get()}px, rgba(16,185,129,0.1), transparent 70%)`
  );

  const handleDemoLogin = useCallback((demoRole: 'Learner' | 'Instructor' | 'Accessibility Trainer') => {
    // Quick Demo Registration/Login action redirects straight to the platform
    const map = {
      'Learner': { email: 'learner@aslsignai.edu', name: 'Jane Doe' },
      'Instructor': { email: 'instructor@aslsignai.edu', name: 'Marcus Sterling' },
      'Accessibility Trainer': { email: 'trainer@aslsignai.edu', name: 'Sarah Jenkins' },
    };
    onRegister(map[demoRole].email, map[demoRole].name, demoRole);
  }, [onRegister]);

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

      localStorage.setItem('asl_access_token', 'demo-token');
      onRegister(email, name, role);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      id="register_container"
      className="h-[100dvh] fixed inset-0 flex items-center justify-center p-2 sm:p-4 overflow-hidden font-sans"
    >
      {/* ── BACKGROUND ── */}
      <EnhancedBackground reducedMotion={reducedMotion} />

      {/* ── MAIN LAYOUT CARD ── */}
      <div
        id="register_card"
        className="w-full max-w-[1100px] flex flex-col lg:flex-row relative z-10 rounded-[2rem] overflow-visible"
      >
        {/* ════════════════════════════════════════════════════════
           LEFT SIDE: Brand & Visuals
           ════════════════════════════════════════════════════════ */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="lg:w-1/2 p-6 lg:p-10 flex flex-col justify-center items-center relative z-20"
        >
          {/* Heading Section */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center space-x-2.5 group/logo"
            >
              <motion.div
                animate={reducedMotion ? {} : {
                  scale: [1, 1.08, 1],
                  filter: [
                    'drop-shadow(0px 0px 0px rgba(16,185,129,0))',
                    'drop-shadow(0px 0px 10px rgba(16,185,129,0.5))',
                    'drop-shadow(0px 0px 0px rgba(16,185,129,0))',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
              >
                <ShieldCheck
                  className="h-7 w-7 text-emerald-600 stroke-[2.5px] group-hover/logo:text-emerald-500 transition-colors duration-300"
                  aria-hidden="true"
                />
              </motion.div>
              <span className="font-extrabold text-[20px] tracking-tight text-gray-900 group-hover/logo:text-emerald-800 transition-colors duration-300">
                SignAI Learn
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-2 max-w-md pt-4"
            >
              <h1 className="font-extrabold text-3xl lg:text-[38px] text-gray-950 leading-[1.05] tracking-tight">
                Real-Time Sign<br />
                Feedback, <span className="text-emerald-600 drop-shadow-sm">Anywhere.</span>
              </h1>
              <p className="text-[14px] font-medium text-gray-500 leading-relaxed max-w-sm pt-1">
                Connect your webcam and practice ASL with immediate, AI-powered accuracy scoring and corrective feedback.
              </p>
            </motion.div>
          </div>

          {/* ── ORBIT CONTAINER ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.6, ease: 'easeOut' }}
            className="flex justify-center my-6"
            style={{ perspective: 1200, WebkitPerspective: 1200 }}
            onPointerMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              orbitMouseX.set(e.clientX - rect.left);
              orbitMouseY.set(e.clientY - rect.top);
            }}
          >
            {/* The layout preserving wrapper */}
            <div className="relative w-[220px] h-[140px] flex items-center justify-center overflow-visible" style={{ transformStyle: 'preserve-3d' }}>
              
              {/* True 3D Tilted Plane */}
              <div
                className="absolute w-[220px] h-[220px] rounded-[50%] flex items-center justify-center overflow-visible"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: 'rotateX(50.47deg)',
                  background: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.25) 100%)',
                  backdropFilter: 'blur(24px) saturate(180%)',
                  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                  border: '1px solid rgba(255,255,255,0.55)',
                  boxShadow: `
                    0 20px 40px rgba(16,185,129,0.08),
                    0 8px 16px rgba(0,0,0,0.04),
                    inset 0 1px 2px rgba(255,255,255,0.9),
                    inset 0 -1px 2px rgba(0,0,0,0.03)
                  `,
                }}
              >
                {/* Cursor-reactive light */}
                <motion.div
                  className="pointer-events-none absolute inset-0 rounded-[inherit]"
                  style={{ background: orbitSpotlight }}
                  aria-hidden="true"
                />
                {/* Glass reflections */}
                <div
                  className="absolute top-0 left-[10%] right-[10%] h-[1px] rounded-full pointer-events-none"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.7), transparent)' }}
                  aria-hidden="true"
                />
                
                {/* Internal abstract glows */}
                <div className="absolute top-[-20%] right-[-10%] w-[100px] h-[100px] bg-emerald-400/30 rounded-full blur-[40px] pointer-events-none" style={{ transform: 'translateZ(-1px)' }} />
                <div className="absolute bottom-[0%] left-[-10%] w-[80px] h-[80px] bg-emerald-100/20 rounded-full blur-[30px] pointer-events-none" style={{ transform: 'translateZ(-1px)' }} />

                {/* AI Centerpiece */}
                <div className="absolute inset-0 pointer-events-none" style={{ transform: 'rotateX(-50.47deg)', transformStyle: 'preserve-3d' }}>
                  <AICenterpiece reducedMotion={reducedMotion} />
                </div>

                {/* Orbiting Signs */}
                {SIGNS.map((sign, i) => (
                  <OrbitingSign
                    key={i}
                    img={sign.img}
                    label={sign.label}
                    phase={sign.phase}
                    speed={sign.speed}
                    reducedMotion={reducedMotion}
                  />
                ))}

                {/* Specular sweep on orbit */}
                <SpecularSweep reducedMotion={reducedMotion} />
              </div>
            </div>
          </motion.div>

          {/* ── QUICK DEMO LOGIN ── */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="pt-0 space-y-3 max-w-sm relative z-20"
          >
            <h4
              className="font-bold text-[10px] text-emerald-800/80 uppercase tracking-widest pl-1 mb-1.5"
              id="demo-login-heading"
            >
              Quick Demo Login
            </h4>
            <div className="space-y-2" role="group" aria-labelledby="demo-login-heading">
              {([
                { role: 'Learner' as const, label: 'Learner Profile' },
                { role: 'Instructor' as const, label: 'Instructor Profile' },
                { role: 'Accessibility Trainer' as const, label: 'Accessibility Trainer' },
              ]).map((demo) => (
                <motion.button
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.97 }}
                  key={demo.role}
                  onClick={() => handleDemoLogin(demo.role)}
                  className="w-full flex items-center justify-between px-4 py-2.5 rounded-[1rem] text-sm font-bold text-gray-800 hover:text-emerald-700 transition-all duration-300 group relative overflow-hidden"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)',
                    backdropFilter: 'blur(16px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(180%)',
                    border: '1px solid rgba(255,255,255,0.65)',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.03), inset 0 1px 1px rgba(255,255,255,0.8)',
                  }}
                >
                  <SpecularSweep reducedMotion={reducedMotion} />
                  <div className="flex items-center gap-3 relative z-10">
                    <div className="w-6 h-6 rounded-full bg-emerald-100/50 flex items-center justify-center">
                      <motion.span
                        className="h-3.5 w-3.5 bg-emerald-600 rounded-full"
                        animate={reducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    </div>
                    <span>{demo.label}</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-emerald-600 group-hover:translate-x-1.5 transition-transform duration-300 ease-out relative z-10" aria-hidden="true" />
                </motion.button>
              ))}
            </div>

            <div className="pt-4">
              <div
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-full shadow-sm"
                style={{
                  background: 'rgba(255,255,255,0.35)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255,255,255,0.45)',
                }}
              >
                <ShieldCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                <span className="text-[11px] font-bold text-emerald-900/70">Trusted by learners, built for inclusion.</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════
           RIGHT SIDE: Register Form (Crystal Card)
           ════════════════════════════════════════════════════════ */}
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
          <div
            className="h-full w-full rounded-[2rem] p-6 lg:p-8 flex flex-col justify-center relative overflow-hidden overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.88) 50%, rgba(255,255,255,0.92) 100%)',
              backdropFilter: 'blur(40px) saturate(200%)',
              WebkitBackdropFilter: 'blur(40px) saturate(200%)',
              border: '1px solid rgba(255,255,255,0.85)',
              boxShadow: `
                0 32px 64px rgba(0,0,0,0.06),
                0 16px 32px rgba(0,0,0,0.03),
                0 0 0 1px rgba(255,255,255,1),
                inset 0 1px 2px rgba(255,255,255,1),
                inset 0 -1px 2px rgba(0,0,0,0.02)
              `,
            }}
          >
            {/* Top glass reflection line */}
            <div
              className="absolute top-0 left-[8%] right-[8%] h-[1px] rounded-full pointer-events-none"
              style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)' }}
              aria-hidden="true"
            />

            {/* Cursor-reactive specular spotlight */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 z-0"
              style={{ background: cardSpotlight }}
              aria-hidden="true"
            />
            {/* Cursor-reactive crystal reflection */}
            <motion.div
              className="pointer-events-none absolute inset-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 z-0"
              style={{ background: cardReflection }}
              aria-hidden="true"
            />

            {/* Specular light sweep */}
            <SpecularSweep reducedMotion={reducedMotion} />

            {/* Side edge lighting */}
            <div
              className="absolute top-[10%] left-0 bottom-[10%] w-[1px] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.5), transparent)' }}
              aria-hidden="true"
            />
            <div
              className="absolute top-[10%] right-0 bottom-[10%] w-[1px] pointer-events-none"
              style={{ background: 'linear-gradient(180deg, transparent, rgba(255,255,255,0.3), transparent)' }}
              aria-hidden="true"
            />

            {/* ── FORM HEADER ── */}
            <div className="space-y-2 mb-5 relative z-10">
              <h2 className="font-extrabold text-[28px] text-gray-900 tracking-tight">Create Account</h2>
              <p className="text-[14px] font-medium text-gray-500 leading-relaxed max-w-sm">
                Enter your details to register and select your training pathway.
              </p>
            </div>

            {/* ── ERROR ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="mb-4 p-3 bg-red-50 text-red-700 rounded-xl text-sm border border-red-100 font-medium relative z-10"
                  role="alert"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── FORM ── */}
            <form onSubmit={handleSubmit} className="space-y-3 relative z-10">
              {/* Full Name */}
              <div>
                <label htmlFor="reg_name" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Full Name
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors duration-300" />
                  </div>
                  <motion.input
                    id="reg_name"
                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(16,185,129,0.15), 0 4px 12px rgba(16,185,129,0.08)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    type="text"
                    required
                    placeholder="Jane Doe"
                    className="block w-full pl-11 pr-4 py-2.5 rounded-[1rem] focus:outline-none text-[14px] font-medium text-slate-900 placeholder-slate-400 transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_2px_8px_rgba(16,185,129,0.06)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.95))',
                      border: '1px solid rgba(226,232,240,0.8)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="reg_email" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative group/input">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors duration-300" />
                  </div>
                  <motion.input
                    id="reg_email"
                    whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(16,185,129,0.15), 0 4px 12px rgba(16,185,129,0.08)' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    type="email"
                    required
                    placeholder="learner@university.edu"
                    className="block w-full pl-11 pr-4 py-2.5 rounded-[1rem] focus:outline-none text-[14px] font-medium text-slate-900 placeholder-slate-400 transition-all duration-300 hover:border-emerald-200 hover:shadow-[0_2px_8px_rgba(16,185,129,0.06)]"
                    style={{
                      background: 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.95))',
                      border: '1px solid rgba(226,232,240,0.8)',
                      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.03)',
                    }}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-[13px] font-bold text-slate-700 mb-2">
                  Select Platform Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { val: 'Learner' as UserRole, icon: GraduationCap, label: 'Learner' },
                    { val: 'Instructor' as UserRole, icon: Users, label: 'Instructor' },
                    { val: 'Accessibility Trainer' as UserRole, icon: Accessibility, label: 'Trainer' },
                  ].map((r) => (
                    <motion.button
                      key={r.val}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.96 }}
                      type="button"
                      onClick={() => setRole(r.val)}
                      className={`py-2 px-1 flex flex-col items-center justify-center rounded-[1rem] text-center transition-all duration-200 ${
                        role === r.val
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-700 font-bold shadow-sm'
                          : 'border-transparent bg-slate-100/50 text-slate-600 hover:bg-slate-200/50 font-medium'
                      }`}
                      style={{
                        borderWidth: '1px',
                        backdropFilter: 'blur(8px)',
                      }}
                    >
                      <r.icon className={`h-4 w-4 mb-1 ${role === r.val ? 'text-emerald-600' : 'text-slate-400'}`} />
                      <span className="text-[11px] leading-tight">{r.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Password & Confirm */}
              <div className="grid grid-cols-2 gap-3 pb-2 pt-1">
                <div>
                  <label htmlFor="reg_pass" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors duration-300" />
                    </div>
                    <motion.input
                      id="reg_pass"
                      whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(16,185,129,0.15), 0 4px 12px rgba(16,185,129,0.08)' }}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-9 py-2.5 rounded-[1rem] focus:outline-none text-[14px] font-medium text-slate-900 placeholder-slate-400 transition-all duration-300 hover:border-emerald-200"
                      style={{
                        background: 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.95))',
                        border: '1px solid rgba(226,232,240,0.8)',
                      }}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-emerald-500"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="reg_confirm" className="block text-[13px] font-bold text-slate-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative group/input">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-slate-400 group-focus-within/input:text-emerald-500 transition-colors duration-300" />
                    </div>
                    <motion.input
                      id="reg_confirm"
                      whileFocus={{ scale: 1.01, boxShadow: '0 0 0 3px rgba(16,185,129,0.15), 0 4px 12px rgba(16,185,129,0.08)' }}
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      className="block w-full pl-9 pr-3 py-2.5 rounded-[1rem] focus:outline-none text-[14px] font-medium text-slate-900 placeholder-slate-400 transition-all duration-300 hover:border-emerald-200"
                      style={{
                        background: 'linear-gradient(135deg, rgba(248,250,252,0.9), rgba(241,245,249,0.95))',
                        border: '1px solid rgba(226,232,240,0.8)',
                      }}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Sign Up Button */}
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                type="submit"
                disabled={isSubmitting}
                className="relative z-10 w-full py-3 px-4 text-white font-bold text-[15px] rounded-[1rem] focus:outline-none focus:ring-2 focus:ring-emerald-500/50 flex items-center justify-center gap-2 group disabled:opacity-80 overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 50%, #047857 100%)',
                  boxShadow: `
                    0 8px 24px rgba(16,185,129,0.35),
                    0 4px 8px rgba(16,185,129,0.2),
                    inset 0 1px 2px rgba(255,255,255,0.35),
                    inset 0 -1px 2px rgba(0,0,0,0.1)
                  `,
                }}
              >
                {/* Animated shine sweep */}
                {!reducedMotion && (
                  <motion.span
                    className="absolute top-0 w-[40%] h-full pointer-events-none"
                    style={{
                      background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.25), transparent)',
                      transform: 'skewX(-20deg)',
                    }}
                    animate={{ left: ['-50%', '150%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 3 }}
                  />
                )}
                {/* Ambient glow */}
                <motion.div
                  className="absolute inset-0 rounded-[inherit] pointer-events-none"
                  animate={reducedMotion ? {} : { opacity: [0, 0.15, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ boxShadow: '0 0 30px rgba(16,185,129,0.5)' }}
                  aria-hidden="true"
                />
                <span className="relative z-10">{isSubmitting ? 'Creating Profile...' : 'Register Now'}</span>
                {!isSubmitting && (
                  <ArrowRight
                    className="h-4 w-4 relative z-10 group-hover:translate-x-1.5 transition-transform duration-300 ease-out"
                    strokeWidth={3}
                  />
                )}
              </motion.button>
            </form>

            {/* Login link */}
            <div className="mt-6 pt-4 border-t border-slate-100/80 text-center relative z-10">
              <span className="text-[13px] font-medium text-slate-500">Already have an account? </span>
              <button
                onClick={onNavigateToLogin}
                className="text-[13px] font-bold text-emerald-600 hover:text-emerald-700 focus:outline-none focus:underline relative group/nav"
              >
                Sign In
                <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-emerald-600 group-hover/nav:w-full transition-all duration-300" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
