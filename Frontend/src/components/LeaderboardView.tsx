// Motion's runtime accepts these visual-only animations, while its current
// package typings reject a few valid easing arrays in this component.
// @ts-nocheck
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate, useInView } from 'motion/react';
import {
  Trophy,
  Flame,
  Target,
  BookOpen,
  Award,
  Search,
  ChevronLeft,
  ChevronRight,
  User,
  Sparkles,
  Zap,
  Medal,
} from 'lucide-react';
import { LeaderboardUser } from '../types';
import { getGlobalLeaderboard } from '../utils/businessLogicApi';
import { TimeRangeFilter, SortOption } from '../services/leaderboardService';
import { CinematicSection } from './CinematicMotion';

/* ═══════════════════════════════════════════════════════════════
   ENTRANCE ANIMATION VARIANTS — orchestrated podium reveal
   
   Timeline (viewport-triggered, plays once):
   1. Title fades in                        (0.0s)
   2. 2nd-place podium rises                (0.6s)
   3. 1st-place podium rises                (0.75s)
   4. 3rd-place podium rises                (1.05s)
   5. Avatars scale-bounce in               (after each podium finishes)
   6. Rank badges pop                       (after each avatar)
   7. Names + XP fade upward                (after badges)
   8. Crown drops with bounce               (last)
   ═══════════════════════════════════════════════════════════════ */

/* -- Step 1: Title fade-in from above */
const titleVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

/* -- Step 2–4: Podium rise/vibrate delays per place (3rd → 2nd → 1st) */
const PODIUM_ENTRANCE_DELAY = { 3: 0.5, 2: 2.2, 1: 4.9 } as const;
const PODIUM_RISE_Y = { 3: 120, 2: 120, 1: 0 } as const;
const PODIUM_DURATION = { 3: 0.7, 2: 0.7, 1: 0.5 } as const;

const podiumVariants = (place: 1 | 2 | 3) => {
  if (place === 1) {
    // Gold: Heavy "rubber stamp" impact + vibration shake
    return {
      hidden: { opacity: 0, scale: 4 }, // Start massively scaled up
      visible: {
        opacity: [0, 1, 1, 1, 1, 1, 1, 1],
        scale:   [4, 0.85, 1.1, 0.95, 1.02, 1, 1, 1], // Slam down and compress
        x:       [0, 0, -8, 8, -4, 4, -2, 0],         // Violent x-axis shake
        transition: {
          duration: 0.65,
          delay: PODIUM_ENTRANCE_DELAY[1],
          // times array maps to the exact timing of each array frame above
          // 0 -> 0.15 is the rapid stamp impact
          // 0.15 -> 1 is the resolving vibration shake
          times: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
        },
      },
    };
  }

  // Silver/Bronze: rise from bottom
  return {
    hidden: { opacity: 0, y: PODIUM_RISE_Y[place] },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: PODIUM_DURATION[place],
        ease: 'easeOut',
        delay: PODIUM_ENTRANCE_DELAY[place],
      },
    },
  };
};

/* -- Step 5: Avatar scale-bounce (fires after its podium finishes) */
const avatarDelay = (place: 1 | 2 | 3) =>
  PODIUM_ENTRANCE_DELAY[place] + PODIUM_DURATION[place];

const avatarVariants = (place: 1 | 2 | 3) => ({
  hidden: { opacity: 0, scale: 0.7 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      delay: avatarDelay(place),
      ease: [0.34, 1.56, 0.64, 1], // small overshoot bounce
    },
  },
});

/* -- Step 6: Rank badge pop (fires shortly after avatar) */
const badgeVariants = (place: 1 | 2 | 3) => ({
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      delay: avatarDelay(place) + 0.3,
      ease: [0.34, 1.56, 0.64, 1], // bounce
    },
  },
});

/* -- Step 7: Name + XP fade upward */
const nameXpVariants = (place: 1 | 2 | 3) => ({
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: avatarDelay(place) + 0.55,
      ease: 'easeOut',
    },
  },
});

/* -- Step 8: Crown drop with bounce (only 1st place, fires last) */
const crownVariants = {
  hidden: { opacity: 0, y: -30, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.5,
      delay: avatarDelay(1) + 0.75,
      ease: [0.34, 1.56, 0.64, 1], // bounce
    },
  },
};

/* ─── Premium Podium Pillar Sub-component ─────────────────────── */
interface PodiumPillarProps {
  user: LeaderboardUser;
  place: 1 | 2 | 3;
  /** Whether the podium section is in view (controls entrance) */
  isInView: boolean;
}

const PODIUM_SPRING = { type: 'spring' as const, stiffness: 150, damping: 18, mass: 0.6 };

function PodiumPillar({ user, place, isInView }: PodiumPillarProps) {
  const pillarRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const rotateX = useSpring(useTransform(mouseY, [0, 1], [3, -3]), { stiffness: 200, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-4, 4]), { stiffness: 200, damping: 20 });
  const lightX = useSpring(useTransform(mouseX, [0, 1], [0, 100]), { stiffness: 150, damping: 25 });
  const lightY = useSpring(useTransform(mouseY, [0, 1], [0, 100]), { stiffness: 150, damping: 25 });

  const specularGradient = useMotionTemplate`radial-gradient(400px circle at ${lightX}% ${lightY}%, rgba(255,255,255,0.12) 0%, transparent 60%)`;

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!pillarRef.current) return;
    const rect = pillarRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  }, [mouseX, mouseY]);

  const handleMouseLeave = useCallback(() => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  }, [mouseX, mouseY]);

  // Animation state derived from viewport trigger
  const animState = isInView ? 'visible' : 'hidden';

  // HTML5 audio playback for Gold (1st place) using cinematic rock track
  useEffect(() => {
    if (place === 1 && isInView) {
      // Audio from Pixabay (Rock Cinematic impact boom)
      const audio = new Audio('https://cdn.pixabay.com/audio/2023/08/11/audio_51edb7be8b.mp3');
      audio.volume = 0.2; // Keep volume around 20%
      
      let stopTimer: NodeJS.Timeout;

      const timer = setTimeout(() => {
        // Seek to 0 and play immediately when Silver lands
        audio.currentTime = 0;
        audio.play().catch(e => console.log('Audio autoplay prevented'));
        
        // Stop exactly after 4 seconds
        stopTimer = setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 4000);
        
      }, 2900); // Silver lands at 2.9s (2.2s delay + 0.7s duration)

      // Clean up the audio instance when the component unmounts
      return () => {
        clearTimeout(timer);
        if (stopTimer) clearTimeout(stopTimer);
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [place, isInView]);

  // Place-specific config
  const config = {
    1: {
      pillarHeight: 'h-36 sm:h-48',
      avatarSize: 'h-18 w-18 sm:h-20 sm:w-20',
      nameClass: 'text-sm sm:text-base font-black tracking-tight',
      xpClass: 'text-xs sm:text-sm font-black',
      delay: 0,
      entryY: 40,
      // Brushed metallic gold
      pillarGradient: 'bg-gradient-to-t from-amber-800 via-amber-600 to-amber-400',
      pillarBorder: 'border-t-[3px] border-amber-300/80',
      pillarShadow: '0 -4px 30px rgba(245,158,11,0.2), 0 8px 40px rgba(245,158,11,0.12), inset 0 1px 0 rgba(255,255,255,0.25), inset 0 -2px 8px rgba(0,0,0,0.15)',
      avatarBorder: 'border-amber-400',
      avatarRing: 'ring-4 ring-amber-400/25',
      avatarGlow: '0 0 24px rgba(245,158,11,0.3), 0 4px 16px rgba(245,158,11,0.15)',
      avatarBg: 'bg-amber-900/60',
      nameColor: 'text-amber-100',
      xpColor: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-amber-400 to-amber-300',
      badgeText: 'text-amber-950',
      badgeLabel: '1ST',
      iconColor: 'text-amber-200/80',
      floatAmplitude: [-3, 3],
    },
    2: {
      pillarHeight: 'h-28 sm:h-36',
      avatarSize: 'h-14 w-14 sm:h-16 sm:w-16',
      nameClass: 'text-xs sm:text-sm font-bold tracking-tight',
      xpClass: 'text-[11px] font-extrabold',
      delay: 0.1,
      entryY: 30,
      // Premium aluminum glass
      pillarGradient: 'bg-gradient-to-t from-slate-700 via-slate-500 to-slate-400',
      pillarBorder: 'border-t-[3px] border-slate-300/70',
      pillarShadow: '0 -4px 24px rgba(148,163,184,0.15), 0 8px 32px rgba(100,116,139,0.1), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -2px 8px rgba(0,0,0,0.12)',
      avatarBorder: 'border-slate-300',
      avatarRing: 'ring-4 ring-slate-300/20',
      avatarGlow: '0 0 18px rgba(148,163,184,0.25), 0 4px 12px rgba(100,116,139,0.1)',
      avatarBg: 'bg-slate-800/70',
      nameColor: 'text-slate-200',
      xpColor: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-slate-300 to-slate-200',
      badgeText: 'text-slate-900',
      badgeLabel: '2ND',
      iconColor: 'text-slate-300/80',
      floatAmplitude: [-2, 2],
    },
    3: {
      pillarHeight: 'h-24 sm:h-30',
      avatarSize: 'h-14 w-14 sm:h-16 sm:w-16',
      nameClass: 'text-xs sm:text-sm font-bold tracking-tight',
      xpClass: 'text-[11px] font-extrabold',
      delay: 0.2,
      entryY: 30,
      // Premium copper alloy
      pillarGradient: 'bg-gradient-to-t from-orange-950 via-amber-800 to-amber-700',
      pillarBorder: 'border-t-[3px] border-amber-600/70',
      pillarShadow: '0 -4px 24px rgba(180,83,9,0.15), 0 8px 32px rgba(146,64,14,0.1), inset 0 1px 0 rgba(255,255,255,0.15), inset 0 -2px 8px rgba(0,0,0,0.15)',
      avatarBorder: 'border-amber-700',
      avatarRing: 'ring-4 ring-amber-700/20',
      avatarGlow: '0 0 18px rgba(180,83,9,0.2), 0 4px 12px rgba(146,64,14,0.1)',
      avatarBg: 'bg-amber-950/70',
      nameColor: 'text-amber-100',
      xpColor: 'text-amber-400',
      badgeBg: 'bg-gradient-to-r from-amber-700 to-amber-600',
      badgeText: 'text-amber-100',
      badgeLabel: '3RD',
      iconColor: 'text-amber-600/80',
      floatAmplitude: [-2, 2],
    },
  }[place];

  const IconComponent = place === 1 ? Trophy : Medal;
  const iconSize = place === 1 ? 'h-10 w-10' : place === 2 ? 'h-8 w-8' : 'h-7 w-7';

  return (
    /* Step 2–4: Podium rises sequentially (2nd → 1st → 3rd) */
    <motion.div
      ref={pillarRef}
      variants={podiumVariants(place)}
      initial="hidden"
      animate={animState}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`flex-1 flex flex-col items-center ${place === 1 ? 'z-10' : ''}`}
      style={{ perspective: '800px' }}
    >
      {/* Avatar + Badge Container with 3D tilt */}
      <motion.div
        className="relative mb-3 text-center"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
      >
        {/* Step 8: Realistic 3D crown drops with bounce for 1st place */}
        {place === 1 && (
          <motion.div
            variants={crownVariants}
            initial="hidden"
            animate={animState}
            className="absolute -top-9 right-1/2 translate-x-1/2 z-20"
            style={{ filter: 'drop-shadow(0 4px 12px rgba(245,158,11,0.6)) drop-shadow(0 0 20px rgba(245,158,11,0.3))' }}
          >
            {/* Idle float animation */}
            <motion.div
              animate={isInView ? { y: [0, -5, 0], scale: [1, 1.04, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut', delay: avatarDelay(1) + 1.25 }}
              style={{ transform: 'translateZ(20px)' }}
            >
              {/* Realistic 3D metallic crown SVG */}
              <svg width="36" height="30" viewBox="0 0 36 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="Crown">
                <defs>
                  {/* Metallic gold body gradient */}
                  <linearGradient id="crownGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fcd34d" />
                    <stop offset="30%" stopColor="#f59e0b" />
                    <stop offset="60%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                  {/* Specular highlight gradient */}
                  <linearGradient id="crownHighlight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#fef3c7" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#fcd34d" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                  </linearGradient>
                  {/* Jewel radial glow */}
                  <radialGradient id="jewelGlow">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="60%" stopColor="#dc2626" />
                    <stop offset="100%" stopColor="#991b1b" />
                  </radialGradient>
                </defs>
                {/* Crown base band */}
                <rect x="5" y="22" width="26" height="6" rx="2" fill="url(#crownGold)" stroke="#b45309" strokeWidth="0.5" />
                {/* Crown base band highlight */}
                <rect x="6" y="22.5" width="24" height="2" rx="1" fill="url(#crownHighlight)" opacity="0.6" />
                {/* Crown body — 5 points */}
                <path d="M5 22 L1 6 L9 14 L18 1 L27 14 L35 6 L31 22 Z" fill="url(#crownGold)" stroke="#92400e" strokeWidth="0.6" strokeLinejoin="round" />
                {/* Inner highlight on body */}
                <path d="M7 21 L4 9 L10 15 L18 4 L26 15 L32 9 L29 21 Z" fill="url(#crownHighlight)" opacity="0.35" />
                {/* Left edge specular */}
                <path d="M5 22 L1 6 L3 7 L6.5 21 Z" fill="white" opacity="0.15" />
                {/* Center jewel (ruby) */}
                <circle cx="18" cy="17" r="2.5" fill="url(#jewelGlow)" stroke="#fbbf24" strokeWidth="0.7" />
                <circle cx="17.2" cy="16" r="0.8" fill="white" opacity="0.5" />
                {/* Side jewels (sapphire) */}
                <circle cx="10" cy="19" r="1.5" fill="#3b82f6" stroke="#fbbf24" strokeWidth="0.5" />
                <circle cx="9.5" cy="18.5" r="0.5" fill="white" opacity="0.4" />
                <circle cx="26" cy="19" r="1.5" fill="#3b82f6" stroke="#fbbf24" strokeWidth="0.5" />
                <circle cx="25.5" cy="18.5" r="0.5" fill="white" opacity="0.4" />
                {/* Point-tip orbs */}
                <circle cx="18" cy="2" r="1.8" fill="#fbbf24" stroke="#92400e" strokeWidth="0.4" />
                <circle cx="17.5" cy="1.5" r="0.6" fill="white" opacity="0.5" />
                <circle cx="1" cy="6" r="1.3" fill="#fbbf24" stroke="#92400e" strokeWidth="0.4" />
                <circle cx="35" cy="6" r="1.3" fill="#fbbf24" stroke="#92400e" strokeWidth="0.4" />
                <circle cx="9" cy="14" r="1.1" fill="#fbbf24" stroke="#92400e" strokeWidth="0.3" />
                <circle cx="27" cy="14" r="1.1" fill="#fbbf24" stroke="#92400e" strokeWidth="0.3" />
              </svg>
            </motion.div>
          </motion.div>
        )}

        {/* Step 5: Avatar scales in with bounce */}
        <motion.div
          variants={avatarVariants(place)}
          initial="hidden"
          animate={animState}
        >
          <motion.div
            whileHover={{ scale: 1.06 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            className={`${config.avatarSize} rounded-full border-[3px] ${config.avatarBorder} ${config.avatarRing} overflow-hidden mx-auto ${config.avatarBg} relative`}
            style={{
              boxShadow: config.avatarGlow,
              transform: 'translateZ(15px)',
            }}
          >
            {/* Glass refraction overlay */}
            <div
              className="absolute inset-0 rounded-full z-10 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              }}
            />
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} className="h-full w-full object-cover" />
            ) : (
              <div className={`h-full w-full flex items-center justify-center font-bold ${place === 1 ? 'text-amber-300 text-lg' : place === 2 ? 'text-slate-300' : 'text-amber-600'}`}>
                {user.name.substring(0, 2)}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Step 6: Rank Badge pops in with bounce */}
        <motion.span
          variants={badgeVariants(place)}
          initial="hidden"
          animate={animState}
          className={`absolute -bottom-2 right-1/2 translate-x-1/2 ${config.badgeBg} ${config.badgeText} text-[10px] font-black px-2.5 py-0.5 rounded-full z-10`}
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)',
            transformOrigin: 'center',
          }}
        >
          {config.badgeLabel}
        </motion.span>
      </motion.div>

      {/* Step 7: Name & XP fade upward */}
      <motion.div
        variants={nameXpVariants(place)}
        initial="hidden"
        animate={animState}
      >
        <p className={`${config.nameClass} truncate ${place === 1 ? 'max-w-[120px]' : 'max-w-[100px]'} ${config.nameColor}`}>
          {user.name}
        </p>
        <p className={`${config.xpClass} ${config.xpColor} mt-0.5`}>{user.points} XP</p>
      </motion.div>

      {/* 3D Pillar Block — thick glass + tap-blink + idle float */}
      <motion.div
        animate={{ y: [0, config.floatAmplitude[0], 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
        /* Tap-blink: brief bright flash on click/tap */
        whileTap={{ scale: 0.97, filter: 'brightness(1.5)' }}
        className={`w-full ${config.pillarGradient} ${config.pillarHeight} rounded-t-2xl mt-3 flex items-center justify-center ${config.pillarBorder} relative overflow-hidden cursor-pointer`}
        style={{
          boxShadow: config.pillarShadow,
          transformStyle: 'preserve-3d',
        }}
      >
        {/* ── THICK GLASS LAYER 1: Full surface frosted glass ── */}
        <div
          className="absolute inset-0 pointer-events-none z-[3] rounded-t-2xl"
          style={{
            background: 'linear-gradient(160deg, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 25%, rgba(255,255,255,0.03) 50%, rgba(255,255,255,0.06) 75%, rgba(255,255,255,0.15) 100%)',
            backdropFilter: 'blur(2px) saturate(120%)',
            WebkitBackdropFilter: 'blur(2px) saturate(120%)',
          }}
        />

        {/* ── THICK GLASS LAYER 2: Wide specular band across top ── */}
        <div
          className="absolute top-0 left-0 right-0 h-[45%] pointer-events-none z-[4] rounded-t-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.12) 40%, rgba(255,255,255,0.04) 70%, transparent 100%)',
          }}
        />

        {/* ── THICK GLASS LAYER 3: Diagonal gloss streak ── */}
        <div
          className="absolute inset-0 pointer-events-none z-[4]"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 30%, transparent 55%, rgba(255,255,255,0.08) 70%, rgba(255,255,255,0.15) 100%)',
          }}
        />

        {/* ── Thick left-edge glass highlight ── */}
        <div
          className="absolute top-0 left-0 bottom-0 w-[3px] pointer-events-none z-[5] rounded-tl-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.45) 0%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.05) 100%)',
          }}
        />
        {/* ── Thick right-edge glass highlight ── */}
        <div
          className="absolute top-0 right-0 bottom-0 w-[2px] pointer-events-none z-[5] rounded-tr-2xl"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.06) 60%, transparent 100%)',
          }}
        />

        {/* ── Thick top-edge glass bar ── */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none z-[5] rounded-t-2xl"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0.1), rgba(255,255,255,0.55) 30%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0.55) 70%, rgba(255,255,255,0.1))',
          }}
        />

        {/* Specular cursor-follow highlight */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-10"
          style={{ backgroundImage: specularGradient }}
        />
        {/* Top edge glass reflection (original thinner line) */}
        <div
          className="absolute top-[3px] left-[10%] right-[10%] h-[1px] pointer-events-none"
          style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 40%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.4) 60%, transparent)' }}
        />
        {/* Inner vertical glass sheen */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 40%, rgba(0,0,0,0.06) 100%)' }}
        />
        {/* Bottom ambient occlusion */}
        <div
          className="absolute bottom-0 left-0 right-0 h-8 pointer-events-none"
          style={{ background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.15))' }}
        />

        {/* ── Pillar glass corner accents (enlarged for thick effect) ── */}
        {/* Top-left corner */}
        <div
          className="absolute top-0 left-0 w-14 h-14 pointer-events-none z-[6] rounded-tl-2xl"
          style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 40%, transparent 65%)',
            borderTop: '2px solid rgba(255,255,255,0.35)',
            borderLeft: '2px solid rgba(255,255,255,0.35)',
          }}
        />
        {/* Top-right corner */}
        <div
          className="absolute top-0 right-0 w-14 h-14 pointer-events-none z-[6] rounded-tr-2xl"
          style={{
            background: 'linear-gradient(225deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.1) 40%, transparent 65%)',
            borderTop: '2px solid rgba(255,255,255,0.35)',
            borderRight: '2px solid rgba(255,255,255,0.35)',
          }}
        />

        {/* Tap-blink flash overlay */}
        <motion.div
          className="absolute inset-0 pointer-events-none z-[7] rounded-t-2xl"
          initial={{ opacity: 0 }}
          whileTap={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          style={{
            background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 50%, transparent 80%)',
          }}
        />

        {/* Dynamic Icon */}
        {place === 1 ? (
          <Trophy 
            className={`${iconSize} ${config.iconColor} relative z-10`} 
            style={{ filter: 'drop-shadow(0 0 16px rgba(253, 224, 71, 0.8)) drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          />
        ) : (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            className={`${iconSize} ${config.iconColor} relative z-10`}
            style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
          >
            <path d="M7.21 15 2.66 7.14a2 2 0 0 1 .13-2.2L4.4 2.8A2 2 0 0 1 6 2h12a2 2 0 0 1 1.6.8l1.6 2.14a2 2 0 0 1 .14 2.2L16.79 15" />
            <path d="M11 12 5.12 2.2" />
            <path d="m13 12 5.88-9.8" />
            <path d="M8 7h8" />
            <circle cx="12" cy="17" r="5" />
            <text x="12" y="18.5" textAnchor="middle" fontSize="5" fontWeight="900" stroke="none" fill="currentColor" style={{ fontFamily: 'system-ui, sans-serif' }}>
              {place}
            </text>
          </svg>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PODIUM SECTION — single viewport trigger for the entire entrance
   Uses useInView with { once: true } so animations play exactly once
   when the section first enters the viewport.
   ═══════════════════════════════════════════════════════════════ */
interface PodiumSectionProps {
  top1: LeaderboardUser | undefined;
  top2: LeaderboardUser | undefined;
  top3: LeaderboardUser | undefined;
}

function PodiumSection({ top1, top2, top3 }: PodiumSectionProps) {
  const sectionRef = useRef<HTMLDivElement>(null);
  /* Single viewport trigger — fires once when ≥20% of the section is visible */
  const isInView = useInView(sectionRef, { once: true, amount: 0.2 });

  return (
    <div
      ref={sectionRef}
      className="bg-gradient-to-b from-slate-900 via-slate-800 to-emerald-950 backdrop-blur-2xl rounded-[2rem] p-6 md:p-10 text-white relative overflow-hidden border border-slate-700/50"
      style={{
        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.3), inset 0 2px 4px rgba(255,255,255,0.05)',
      }}
    >
      {/* Ambient depth layers */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Soft radial spotlight behind winner */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/8 rounded-full blur-[100px]" />
        {/* Ambient gradient lighting */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-amber-400/5 to-transparent" />
        {/* Cinematic vignette (brightened) */}
        <div className="absolute inset-0 rounded-[2rem]" style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.1) 100%)' }} />
        {/* Glass fog layer */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-emerald-950/40 to-transparent" />
        {/* Subtle floating particles (extremely minimal) */}
        <div className="absolute top-[20%] left-[25%] w-1 h-1 bg-amber-400/20 rounded-full blur-[2px] animate-pulse" />
        <div className="absolute top-[35%] right-[30%] w-0.5 h-0.5 bg-slate-300/15 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[50%] left-[60%] w-0.5 h-0.5 bg-amber-300/15 rounded-full blur-[1px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>



      {/* Step 1: Title fades in first */}
      <motion.div
        variants={titleVariants}
        initial="hidden"
        animate={isInView ? 'visible' : 'hidden'}
        className="text-center mb-8 relative z-10"
      >
        <h2
          className="text-lg font-bold uppercase flex items-center justify-center space-x-2.5"
          style={{
            letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 30%, #fcd34d 50%, #f59e0b 70%, #d97706 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 1px 2px rgba(245,158,11,0.3))',
          }}
        >
          <Sparkles className="h-4 w-4 text-amber-400" style={{ WebkitTextFillColor: 'initial', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.4))' }} />
          <span>Weekly Champions Podium</span>
          <Sparkles className="h-4 w-4 text-amber-400" style={{ WebkitTextFillColor: 'initial', filter: 'drop-shadow(0 0 4px rgba(245,158,11,0.4))' }} />
        </h2>
      </motion.div>

      {/* Steps 2–8: Podium pillars with sequenced entrance animations */}
      <div
        className="flex items-end justify-center gap-2 sm:gap-6 max-w-2xl mx-auto pt-6 relative z-10"
      >
        {top2 && <PodiumPillar user={top2} place={2} isInView={isInView} />}
        {top1 && <PodiumPillar user={top1} place={1} isInView={isInView} />}
        {top3 && <PodiumPillar user={top3} place={3} isInView={isInView} />}
      </div>

      {/* Bottom reflection surface */}
      <div
        className="absolute bottom-0 left-[10%] right-[10%] h-[1px] z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06) 30%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.06) 70%, transparent)',
        }}
      />
    </div>
  );
}

export default function LeaderboardView() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [currentUserRank, setCurrentUserRank] = useState<LeaderboardUser | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters & State
  const [timeRange, setTimeRange] = useState<TimeRangeFilter>('week');
  const [sortBy, setSortBy] = useState<SortOption>('points');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  useEffect(() => {
    fetchData();
  }, [timeRange, sortBy, searchQuery, page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // The backend only ranks by accuracy or streak; 'points' and 'lessons'
      // sort options are applied client-side below on top of that base list.
      const backendMetric = sortBy === 'streak' ? 'streak' : 'accuracy';
      const entries = await getGlobalLeaderboard(backendMetric);

      let currentUsername: string | null = null;
      const token = localStorage.getItem('asl_access_token');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          currentUsername = payload.sub ?? null;
        } catch {
          currentUsername = null;
        }
      }

      let mapped: LeaderboardUser[] = entries.map((entry) => ({
        id: String(entry.user_id),
        rank: entry.rank,
        name: entry.username,
        role: 'Learner',
        accuracy: entry.accuracy,
        streak: entry.current_streak,
        // The backend doesn't track lessons/badges separately yet; attempts
        // is the closest real signal of engagement we currently have.
        lessonsCompleted: entry.attempts,
        badgesCount: 0,
        points: Math.round(entry.accuracy * 10 + entry.current_streak * 5),
        isCurrentUser: currentUsername !== null && entry.username === currentUsername,
      }));

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        mapped = mapped.filter((u) => u.name.toLowerCase().includes(q));
      }
      if (sortBy === 'points' || sortBy === 'lessons') {
        mapped = [...mapped].sort((a, b) =>
          sortBy === 'points' ? b.points - a.points : b.lessonsCompleted - a.lessonsCompleted
        );
        mapped = mapped.map((u, idx) => ({ ...u, rank: idx + 1 }));
      }

      const totalCount = mapped.length;
      const totalPages = Math.ceil(totalCount / pageSize) || 1;
      const startIndex = (page - 1) * pageSize;
      const paginatedUsers = mapped.slice(startIndex, startIndex + pageSize);

      setUsers(paginatedUsers);
      setTotalCount(totalCount);
      setTotalPages(totalPages);
      setCurrentUserRank(mapped.find((u) => u.isCurrentUser) ?? null);
    } catch (e) {
      setUsers([]);
      setTotalCount(0);
      setTotalPages(1);
      setCurrentUserRank(null);
    } finally {
      setLoading(false);
    }
  };

  // Top 3 Podium Users (derived from overall top ranked)
  const top1 = users.find((u) => u.rank === 1) || users[0];
  const top2 = users.find((u) => u.rank === 2) || users[1];
  const top3 = users.find((u) => u.rank === 3) || users[2];

  return (
    <CinematicSection delay={0.05} xOffset={80} yOffset={80} id="leaderboard_view_container" className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-100/80 mb-2">
            <Trophy className="h-3.5 w-3.5 text-amber-500" />
            <span>Global Signing Community</span>
          </div>
          <h1 id="leaderboard_title" className="text-xl md:text-2xl font-bold text-gray-950 tracking-tight">
            Leaderboard Rankings
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Compete with ASL learners worldwide based on signing accuracy, streak consistency, and completed lessons!
          </p>
        </div>

        {/* Current User Rank Card (Quick Banner) */}
        {currentUserRank && (
          <motion.button 
            whileHover={{ scale: 1.05 }} 
            whileTap={{ scale: 0.95 }} 
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="bg-emerald-50/80 backdrop-blur-xl text-emerald-900 p-4 rounded-2xl shadow-sm border border-emerald-200 flex items-center justify-start text-left space-x-4 shrink-0 hover:bg-emerald-100 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <div className="h-12 w-12 rounded-xl bg-emerald-100 flex items-center justify-center font-black text-lg text-emerald-700 border border-emerald-200/50">
              #{currentUserRank.rank}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Your Rank</span>
                <span className="px-1.5 py-0.2 rounded bg-amber-400 text-amber-950 text-[10px] font-black uppercase">
                  YOU
                </span>
              </div>
              <p className="text-sm font-extrabold text-emerald-900">
                {currentUserRank.points.toLocaleString()} Points • {currentUserRank.accuracy}% Acc
              </p>
            </div>
          </motion.button>
        )}
      </div>

      {/* ══ TOP 3 PODIUM — PREMIUM 3D GLASS ══
          Single viewport trigger drives the entire entrance sequence */}
      <PodiumSection top1={top1} top2={top2} top3={top3} />

      {/* Controls: Search, Time Filters, Sorting */}
      <div className="bg-white/70 backdrop-blur-xl p-4 md:p-5 rounded-[1.5rem] border border-white/60 shadow-glass space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Time Range Tabs */}
          <div className="flex items-center space-x-1 bg-gray-100 p-1 rounded-xl text-xs font-bold text-gray-600 overflow-x-auto">
            {(
              [
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'allTime', label: 'All Time' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  setTimeRange(t.id);
                  setPage(1);
                }}
                aria-label={`Time range ${t.label}`}
                aria-pressed={timeRange === t.id}
                className={`px-3.5 py-1.5 rounded-lg whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
                  timeRange === t.id
                    ? 'bg-white text-emerald-700 shadow-sm font-extrabold'
                    : 'hover:text-gray-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search & Sort options */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative w-full sm:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by learner name..."
                aria-label="Search by learner name"
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Sort By Select */}
            <div className="w-full sm:w-auto flex items-center space-x-2 text-xs font-semibold text-gray-600">
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as SortOption);
                  setPage(1);
                }}
                aria-label="Sort by"
                className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="points">Points / XP</option>
                <option value="accuracy">Accuracy %</option>
                <option value="streak">Streak Days</option>
                <option value="lessons">Lessons Completed</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table / Mobile Cards */}
      <div className="bg-white/70 backdrop-blur-xl rounded-[1.5rem] border border-white/60 shadow-glass overflow-hidden">
        {loading ? (
          /* Skeletons */
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="flex items-center space-x-4 animate-pulse">
                <div className="h-10 w-10 bg-gray-200 rounded-full" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/4" />
                </div>
                <div className="h-6 bg-gray-200 rounded w-16" />
              </div>
            ))}
          </div>
        ) : users.length === 0 ? (
          /* Empty State */
          <div className="p-12 text-center">
            <div className="h-12 w-12 mx-auto rounded-full bg-amber-50 flex items-center justify-center text-amber-600 mb-3">
              <Search className="h-6 w-6" />
            </div>
            <h4 className="text-base font-bold text-gray-900">No Learners Found</h4>
            <p className="text-xs text-gray-500 mt-1">Try adjusting your search criteria or time range filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    <th className="py-3.5 px-6">Rank</th>
                    <th className="py-3.5 px-6">Learner</th>
                    <th className="py-3.5 px-6">Accuracy</th>
                    <th className="py-3.5 px-6">Streak</th>
                    <th className="py-3.5 px-6">Lessons</th>
                    <th className="py-3.5 px-6">Badges</th>
                    <th className="py-3.5 px-6 text-right">Points / XP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className={`transition ${
                        u.isCurrentUser
                          ? 'bg-emerald-50/70 border-l-4 border-emerald-500 font-semibold'
                          : 'hover:bg-gray-50/60'
                      }`}
                    >
                      {/* Rank Badge */}
                      <td className="py-4 px-6 font-black text-gray-900">
                        {u.rank === 1 ? (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                            👑 1
                          </span>
                        ) : u.rank === 2 ? (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
                            🥈 2
                          </span>
                        ) : u.rank === 3 ? (
                          <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-900/10 text-amber-900 text-xs font-bold">
                            🥉 3
                          </span>
                        ) : (
                          <span className="text-gray-500 pl-2">#{u.rank}</span>
                        )}
                      </td>

                      {/* Learner Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 font-bold overflow-hidden shrink-0">
                            {u.avatarUrl ? (
                              <img src={u.avatarUrl} alt={u.name} className="h-full w-full object-cover" />
                            ) : (
                              u.name.substring(0, 2)
                            )}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-gray-900">{u.name}</span>
                              {u.isCurrentUser && (
                                <span className="px-2 py-0.5 text-[10px] font-extrabold bg-emerald-600 text-white rounded-full">
                                  YOU
                                </span>
                              )}
                            </div>
                            <span className="text-xs text-gray-400 font-medium">{u.role}</span>
                          </div>
                        </div>
                      </td>

                      {/* Accuracy */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <Target className="h-4 w-4 text-emerald-600" />
                          <span className="font-bold text-gray-900">{u.accuracy}%</span>
                        </div>
                      </td>

                      {/* Streak */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="font-bold text-gray-900">{u.streak} Days</span>
                        </div>
                      </td>

                      {/* Lessons */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <BookOpen className="h-4 w-4 text-blue-500" />
                          <span className="font-bold text-gray-900">{u.lessonsCompleted}</span>
                        </div>
                      </td>

                      {/* Badges */}
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-1.5">
                          <Award className="h-4 w-4 text-violet-500" />
                          <span className="font-bold text-gray-900">{u.badgesCount}</span>
                        </div>
                      </td>

                      {/* Points / XP */}
                      <td className="py-4 px-6 text-right font-black text-emerald-700 text-base">
                        {u.points.toLocaleString()} XP
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="block md:hidden divide-y divide-gray-100">
              {users.map((u) => (
                <div
                  key={u.id}
                  className={`p-4 flex items-center justify-between space-x-3 ${
                    u.isCurrentUser ? 'bg-emerald-50/80 border-l-4 border-emerald-500' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="font-black text-sm text-gray-700 shrink-0 w-6">#{u.rank}</span>
                    <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-700 font-bold shrink-0">
                      {u.name.substring(0, 2)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center space-x-1">
                        <p className="text-xs font-bold text-gray-900 truncate">{u.name}</p>
                        {u.isCurrentUser && (
                          <span className="px-1.5 py-0.2 text-[9px] font-black bg-emerald-600 text-white rounded">YOU</span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400">
                        {u.accuracy}% Acc • {u.streak}d Streak
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-black text-emerald-700 block">{u.points} XP</span>
                    <span className="text-[10px] text-gray-400 font-semibold">{u.lessonsCompleted} Lessons</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination Controls Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>
            Showing <strong className="text-gray-900">{users.length}</strong> of{' '}
            <strong className="text-gray-900">{totalCount}</strong> learners
          </span>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="font-bold text-gray-800" aria-live="polite">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next Page"
              className="p-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-100 disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </CinematicSection>
  );
}
