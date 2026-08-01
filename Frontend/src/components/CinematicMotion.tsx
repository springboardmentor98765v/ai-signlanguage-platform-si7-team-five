import React from 'react';
import { motion, useReducedMotion, useMotionValue, useSpring, useTransform } from 'motion/react';
import { SPRING_PANEL } from '../hooks/useGlassTilt';

/**
 * CinematicSection — wraps any content block for viewport-triggered reveal
 * with fade, translateY, scale, and optional blur reduction.
 *
 * Uses spring physics, respects prefers-reduced-motion.
 */
interface CinematicSectionProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  id?: string;
  xOffset?: number;
  yOffset?: number;
}

export function CinematicSection({ children, delay = 0, className = '', id, xOffset = 0, yOffset = 40 }: CinematicSectionProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.div
      id={id}
      initial={shouldReduce ? false : { opacity: 0, x: xOffset, y: yOffset, scale: 0.97, filter: 'blur(6px)' }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ ...SPRING_PANEL, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * StaggeredGrid — wraps children with staggered viewport reveals.
 */
interface StaggeredGridProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  staggerDelay?: number;
}

export function StaggeredGrid({ children, className = '', id, staggerDelay = 0.08 }: StaggeredGridProps) {
  const shouldReduce = useReducedMotion();

  return (
    <div id={id} className={className}>
      {React.Children.map(children, (child, i) => (
        <motion.div
          initial={shouldReduce ? false : { opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ ...SPRING_PANEL, delay: i * staggerDelay }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}



/**
 * Premium3DCard — glass card with hover tilt, glare reflection, and depth shadow.
 */
interface Premium3DCardProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  key?: React.Key;
}

export function Premium3DCard({ children, className = '', id }: Premium3DCardProps) {
  const shouldReduce = useReducedMotion();
  const x = useMotionValue(0.5);
  const y = useMotionValue(0.5);
  const isHovered = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);
  const springHover = useSpring(isHovered, springConfig);

  const rotateX = useTransform(springY, [0, 1], [6, -6]);
  const rotateY = useTransform(springX, [0, 1], [-6, 6]);
  
  // Glare lighting effect
  const glareOpacity = useTransform(springHover, [0, 1], [0, 0.15]);
  const glareX = useTransform(springX, [0, 1], ['100%', '-100%']);
  const glareY = useTransform(springY, [0, 1], ['100%', '-100%']);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width);
    y.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <motion.div
      id={id}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => !shouldReduce && isHovered.set(1)}
      onMouseLeave={() => {
        if (shouldReduce) return;
        isHovered.set(0);
        x.set(0.5);
        y.set(0.5);
      }}
      whileHover={shouldReduce ? {} : { y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      style={{
        rotateX: shouldReduce ? 0 : rotateX,
        rotateY: shouldReduce ? 0 : rotateY,
        transformStyle: 'preserve-3d',
      }}
      className={`relative overflow-hidden group ${className}`}
    >
      {/* Dynamic Specular Glare */}
      {!shouldReduce && (
        <motion.div
          className="pointer-events-none absolute inset-0 z-10 transition-opacity"
          style={{
            opacity: glareOpacity,
            background: 'radial-gradient(circle at center, rgba(255,255,255,1) 0%, transparent 60%)',
            x: glareX,
            y: glareY,
          }}
        />
      )}
      
      {/* Content wrapper lifted up on Z-axis to enhance 3D parallax */}
      <motion.div style={{ transform: 'translateZ(10px)' }} className="h-full w-full">
        {children}
      </motion.div>
    </motion.div>
  );
}

/**
 * MagneticButton — button with proximity-based magnetic attraction.
 */
interface MagneticButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  id?: string;
  'aria-label'?: string;
  disabled?: boolean;
}

export function MagneticButton({ children, onClick, className = '', id, disabled, ...rest }: MagneticButtonProps) {
  const shouldReduce = useReducedMotion();

  return (
    <motion.button
      id={id}
      onClick={onClick}
      disabled={disabled}
      whileHover={shouldReduce ? {} : { scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className={className}
      {...rest}
    >
      {children}
    </motion.button>
  );
}

/**
 * AnimatedBackground — subtle floating orbs + neural grid lines behind content.
 * Pure CSS animation, no React Three Fiber — minimal performance impact.
 */
export function AnimatedBackground() {
  const shouldReduce = useReducedMotion();

  if (shouldReduce) return null;

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Orb 1 — slow drift top-left */}
      <motion.div
        animate={{
          x: [0, 60, -30, 0],
          y: [0, -40, 30, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[10%] left-[15%] w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-400/8 to-teal-300/5 blur-3xl"
      />

      {/* Orb 2 — slow drift top-right */}
      <motion.div
        animate={{
          x: [0, -50, 40, 0],
          y: [0, 50, -20, 0],
          scale: [1, 0.9, 1.15, 1],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
        className="absolute top-[5%] right-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-blue-400/6 to-indigo-300/4 blur-3xl"
      />

      {/* Orb 3 — center-bottom */}
      <motion.div
        animate={{
          x: [0, 30, -40, 0],
          y: [0, -30, 20, 0],
        }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute bottom-[20%] left-[40%] w-[350px] h-[350px] rounded-full bg-gradient-to-tr from-purple-400/5 to-violet-300/3 blur-3xl"
      />

      {/* Neural grid lines — subtle CSS */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: `
          linear-gradient(rgba(16,185,129,0.5) 1px, transparent 1px),
          linear-gradient(90deg, rgba(16,185,129,0.5) 1px, transparent 1px)
        `,
        backgroundSize: '60px 60px',
      }} />
    </div>
  );
}
