import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useMotionTemplate } from 'motion/react';
import { useGlassTilt, SPRING_MODAL, SPRING_BACKDROP } from '../hooks/useGlassTilt';
import { useFocusTrap } from '../hooks/useFocusTrap';
import {
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
  Flame,
  Zap,
  MessageSquare,
  Target,
  Crown,
  ShieldAlert,
  X,
  Trophy,
} from 'lucide-react';
import { AchievementBadge, BadgeCategory } from '../types';
import { achievementService } from '../services/achievementService';

// ─── Glass Badge Detail Modal Sub-component ───────────────
interface BadgeDetailModalProps {
  badge: AchievementBadge;
  onClose: () => void;
  onSimulateUnlock: (id: string) => void;
  getBadgeIcon: (iconName: string, unlocked: boolean) => React.ReactNode;
}

function BadgeDetailModal({ badge, onClose, onSimulateUnlock, getBadgeIcon }: BadgeDetailModalProps) {
  const { ref: tiltRef, style: tiltStyle, springLightX, springLightY } = useGlassTilt<HTMLDivElement>(true);
  const focusTrapRef = useFocusTrap(true, onClose);

  const setRef = useCallback((node: HTMLDivElement | null) => {
    (tiltRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
    (focusTrapRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  }, [tiltRef, focusTrapRef]);

  const lightGradient = useMotionTemplate`radial-gradient(500px circle at ${springLightX}% ${springLightY}%, rgba(255,255,255,0.06) 0%, transparent 60%)`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={SPRING_BACKDROP}
        onClick={onClose}
        className="fixed inset-0 glass-backdrop"
        aria-hidden="true"
      />

      <motion.div
        ref={setRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Badge details: ${badge.title}`}
        initial={{ scale: 0.96, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.96, opacity: 0, y: 16 }}
        transition={SPRING_MODAL}
        style={{
          ...tiltStyle,
          backgroundImage: lightGradient,
        }}
        className="glass-modal relative w-full max-w-md p-6 z-50 text-center"
      >
        <motion.button
          onClick={onClose}
          aria-label="Close Badge Details"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
        >
          <X className="h-5 w-5" />
        </motion.button>

        {/* Large Emblem */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ ...SPRING_MODAL, delay: 0.1 }}
          className={`h-20 w-20 mx-auto rounded-3xl flex items-center justify-center shadow-lg my-2 ${
            badge.unlocked
              ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 shadow-emerald-500/30'
              : 'bg-gray-200 grayscale contrast-125'
          }`}
        >
          {getBadgeIcon(badge.iconName, badge.unlocked)}
        </motion.div>

        <span className="inline-block mt-2 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50/80 text-emerald-700">
          {badge.category} Category
        </span>

        <h3 className="text-xl font-black text-gray-900 mt-2">{badge.title}</h3>
        <p className="text-xs text-gray-600 mt-2 leading-relaxed px-4">
          {badge.description}
        </p>

        {/* Unlock criteria */}
        <div className="mt-4 p-3 rounded-2xl bg-white/40 backdrop-blur-sm text-xs font-medium text-gray-700 space-y-2 border border-white/30">
          <div className="flex justify-between">
            <span className="text-gray-500">Status:</span>
            <span className={`font-bold ${badge.unlocked ? 'text-emerald-600' : 'text-amber-600'}`}>
              {badge.unlocked ? 'Unlocked' : 'In Progress'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Requirement:</span>
            <span className="font-bold">{badge.currentCount} / {badge.totalRequired}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 space-y-2">
          {!badge.unlocked && (
            <motion.button
              onClick={() => onSimulateUnlock(badge.id)}
              aria-label="Simulate Unlock Animation"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow-md shadow-emerald-600/20 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="h-4 w-4" />
              <span>Simulate Unlock Animation</span>
            </motion.button>
          )}

          <button
            onClick={onClose}
            aria-label="Close Window"
            className="w-full py-2.5 rounded-xl text-xs font-bold text-gray-600 hover:bg-white/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 transition"
          >
            Close Window
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AchievementsDashboard() {
  const [badges, setBadges] = useState<AchievementBadge[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<BadgeCategory | 'All'>('All');
  const [loading, setLoading] = useState(true);
  const [selectedBadge, setSelectedBadge] = useState<AchievementBadge | null>(null);
  const [celebratingBadge, setCelebratingBadge] = useState<AchievementBadge | null>(null);

  useEffect(() => {
    loadBadges();
  }, [selectedCategory]);

  const loadBadges = async () => {
    setLoading(true);
    const data = await achievementService.getBadges(selectedCategory);
    setBadges(data);
    setLoading(false);
  };

  const handleSimulateUnlock = async (badgeId: string) => {
    const updatedBadge = await achievementService.simulateUnlock(badgeId);
    if (updatedBadge) {
      // Refresh badge list
      loadBadges();
      setSelectedBadge(updatedBadge);
      setCelebratingBadge(updatedBadge);

      setTimeout(() => {
        setCelebratingBadge(null);
      }, 3500);
    }
  };

  const getBadgeIcon = (iconName: string, unlocked: boolean) => {
    const className = `h-7 w-7 ${unlocked ? 'text-white' : 'text-gray-400'}`;
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className={className} />;
      case 'Flame':
        return <Flame className={className} />;
      case 'Award':
        return <Award className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'MessageSquare':
        return <MessageSquare className={className} />;
      case 'Target':
        return <Target className={className} />;
      case 'Crown':
        return <Crown className={className} />;
      case 'ShieldAlert':
      default:
        return <ShieldAlert className={className} />;
    }
  };

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const completionPercentage = badges.length ? Math.round((unlockedCount / badges.length) * 100) : 0;

  // 3D glass tilt for the banner
  const { ref: bannerRef, style: bannerTiltStyle, springLightX: bannerLightX, springLightY: bannerLightY } = useGlassTilt<HTMLDivElement>(true);
  const bannerLightGradient = useMotionTemplate`radial-gradient(600px circle at ${bannerLightX}% ${bannerLightY}%, rgba(255,255,255,0.15) 0%, rgba(16,185,129,0.06) 30%, transparent 70%)`;

  return (
    <div id="achievements_dashboard_root" className="space-y-6">
      {/* 3D Overview Banner */}
      <div style={{ perspective: '1200px' }}>
        <motion.div
          ref={bannerRef}
          style={{
            ...bannerTiltStyle,
            backgroundImage: bannerLightGradient,
          }}
          className="bg-white/20 backdrop-blur-2xl rounded-[2rem] p-6 md:p-8 shadow-glass relative overflow-hidden border border-white/30 transition-shadow duration-300 hover:shadow-premium"
        >
          {/* 3D Floating Depth Orbs */}
          <div className="absolute inset-0 pointer-events-none" style={{ transformStyle: 'preserve-3d' }}>
            <div
              className="absolute -right-6 -top-6 w-48 h-48 bg-emerald-400/15 rounded-full blur-2xl"
              style={{ transform: 'translateZ(40px)' }}
            />
            <div
              className="absolute -left-10 -bottom-10 w-56 h-56 bg-teal-300/10 rounded-full blur-3xl"
              style={{ transform: 'translateZ(20px)' }}
            />
            <div
              className="absolute right-1/4 top-1/3 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl"
              style={{ transform: 'translateZ(60px)' }}
            />
            {/* Shimmer edge highlight */}
            <div className="absolute inset-0 rounded-[2rem] ring-1 ring-inset ring-white/20" style={{ transform: 'translateZ(2px)' }} />
          </div>

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6" style={{ transformStyle: 'preserve-3d' }}>
            <div className="space-y-2" style={{ transform: 'translateZ(30px)' }}>
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/20 backdrop-blur-md text-xs font-bold text-emerald-700 border border-emerald-400/20">
                <Trophy className="h-3.5 w-3.5" />
                <span>Learner Trophies & Badges</span>
              </div>
              <h2 className="text-xl md:text-2xl font-bold tracking-tight text-gray-900">Achievements Gallery</h2>
              <p className="text-gray-600 text-sm max-w-xl">
                Unlock badges as you practice ASL hand gestures, maintain daily streaks, and achieve milestone speed & accuracy!
              </p>
            </div>

            {/* Stat Pill — lifted in Z-space */}
            <div
              className="bg-white/35 backdrop-blur-xl p-4 rounded-2xl border border-white/50 flex items-center space-x-5 shrink-0 shadow-lg"
              style={{ transform: 'translateZ(50px)', transformStyle: 'preserve-3d' }}
            >
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                  Total Unlocked
                </span>
                <span className="text-2xl font-black text-gray-900">{unlockedCount} / {badges.length}</span>
              </div>
              <div className="h-10 w-px bg-gray-300/40" />
              <div>
                <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">
                  Progress
                </span>
                <span className="text-2xl font-black text-emerald-600">{completionPercentage}%</span>
              </div>
            </div>
          </div>

          {/* Global Progress Track — slightly lifted */}
          <div
            className="mt-6 pt-4 border-t border-gray-200/30 flex items-center space-x-3 relative z-10"
            style={{ transform: 'translateZ(20px)' }}
          >
            <div className="flex-1 bg-gray-300/40 h-2.5 rounded-full overflow-hidden shadow-inner">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${completionPercentage}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.4)]"
              />
            </div>
            <span className="text-xs font-bold text-emerald-700">{completionPercentage}% Completed</span>
          </div>
        </motion.div>
      </div>

      {/* Category Filter Navigation */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
        {(['All', 'Beginner', 'Mastery', 'Consistency', 'Speed', 'Special'] as const).map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            aria-pressed={selectedCategory === cat}
            aria-label={`Filter by ${cat}`}
            className={`px-4 py-2 rounded-xl whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-emerald-500 transition ${
              selectedCategory === cat
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 font-bold'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-100'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Badges Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="bg-white/70 backdrop-blur-xl p-5 rounded-2xl border border-white/60 shadow-glass animate-pulse space-y-3">
              <div className="h-12 w-12 bg-gray-200 rounded-2xl mx-auto" />
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto" />
              <div className="h-3 bg-gray-100 rounded w-5/6 mx-auto" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {badges.map((badge) => (
            <motion.div
              key={badge.id}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => setSelectedBadge(badge)}
              className={`relative bg-white/70 backdrop-blur-xl rounded-[1.5rem] p-5 border transition-all duration-300 cursor-pointer overflow-hidden group ${
                badge.unlocked
                  ? 'border-white/60 shadow-glass hover:shadow-premium hover:bg-white/90 hover:-translate-y-1'
                  : 'border-white/40 bg-gray-50/40 hover:bg-white/60 shadow-sm'
              }`}
            >
              {/* Top Category Tag & Lock Indicator */}
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className={`px-2.5 py-0.5 rounded-full ${
                  badge.unlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-200/80 text-gray-600'
                }`}>
                  {badge.category}
                </span>

                {badge.unlocked ? (
                  <span className="flex items-center text-emerald-600 font-bold">
                    <CheckCircle2 className="h-3.5 w-3.5 mr-0.5" />
                    Unlocked
                  </span>
                ) : (
                  <span className="flex items-center text-gray-400 font-bold">
                    <Lock className="h-3.5 w-3.5 mr-0.5" />
                    Locked
                  </span>
                )}
              </div>

              {/* Icon Emblem Container */}
              <div className="my-4 text-center">
                <div
                  className={`h-16 w-16 mx-auto rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md ${
                    badge.unlocked
                      ? 'bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 shadow-emerald-500/20 group-hover:scale-105'
                      : 'bg-gray-200 grayscale contrast-125 opacity-75 shadow-none'
                  }`}
                >
                  {getBadgeIcon(badge.iconName, badge.unlocked)}
                </div>
              </div>

              {/* Title & Description */}
              <div className="text-center">
                <h4 className={`text-sm font-bold truncate ${badge.unlocked ? 'text-gray-900' : 'text-gray-600'}`}>
                  {badge.title}
                </h4>
                <p className="text-xs text-gray-500 line-clamp-2 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>

              {/* Progress Track for Locked / Date for Unlocked */}
              <div className="mt-4 pt-3 border-t border-gray-100">
                {badge.unlocked ? (
                  <p className="text-[10px] text-emerald-700 font-bold text-center">
                    Earned on {badge.unlockedAt || 'Recently'}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-gray-500 font-bold">
                      <span>Progress</span>
                      <span>{badge.currentCount} / {badge.totalRequired}</span>
                    </div>
                    <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Interactive Detail Modal — Glass Upgrade */}
      <AnimatePresence>
        {selectedBadge && (
          <BadgeDetailModal
            badge={selectedBadge}
            onClose={() => setSelectedBadge(null)}
            onSimulateUnlock={handleSimulateUnlock}
            getBadgeIcon={getBadgeIcon}
          />
        )}
      </AnimatePresence>

      {/* Celebratory Animation Popover — Glass Upgrade */}
      <AnimatePresence>
        {celebratingBadge && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={SPRING_MODAL}
            className="fixed inset-0 z-[60] flex items-center justify-center pointer-events-none p-4"
          >
            <div className="glass-modal bg-gray-900/85 text-white p-8 text-center max-w-sm border border-emerald-400/30 pointer-events-auto">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 10, 0], scale: [1, 1.3, 1] }}
                transition={{ type: 'spring', stiffness: 200, damping: 8 }}
                className="h-20 w-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl text-white mb-4"
              >
                <Trophy className="h-10 w-10" />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...SPRING_MODAL, delay: 0.15 }}
                className="text-2xl font-black text-amber-300"
              >
                BADGE UNLOCKED!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-base font-bold text-white mt-1"
              >
                {celebratingBadge.title}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-xs text-gray-300 mt-2"
              >
                {celebratingBadge.description}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...SPRING_MODAL, delay: 0.45 }}
                className="mt-4 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold inline-block"
              >
                +150 XP Bonus Awarded
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
