import { useRef, useCallback, useEffect } from 'react';
import { useMotionValue, useSpring, MotionStyle } from 'motion/react';

/**
 * Premium glass tilt hook — tracks cursor position within a container
 * and produces spring-damped rotateX/rotateY transforms (±3° X, ±5° Y)
 * plus a dynamic radial-gradient light spot that follows the cursor.
 *
 * Respects `prefers-reduced-motion` — returns identity transforms when active.
 *
 * @param enabled  Whether tilt tracking is active (default true)
 * @returns { ref, style } — attach ref to the glass container, spread style onto motion.div
 */
export function useGlassTilt<T extends HTMLElement = HTMLDivElement>(enabled = true) {
  const ref = useRef<T>(null);

  // Raw motion values driven by mousemove
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);

  // Spring-damped outputs for silky motion
  const rotateX = useSpring(rawRotateX, { stiffness: 150, damping: 15, mass: 0.5 });
  const rotateY = useSpring(rawRotateY, { stiffness: 150, damping: 15, mass: 0.5 });
  const springLightX = useSpring(lightX, { stiffness: 120, damping: 20 });
  const springLightY = useSpring(lightY, { stiffness: 120, damping: 20 });

  const prefersReduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReduced.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReduced.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || !enabled || prefersReduced.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Normalized -1..1 from center
    const nx = (e.clientX - centerX) / (rect.width / 2);
    const ny = (e.clientY - centerY) / (rect.height / 2);

    // Clamp and apply tilt bounds: ±3° X, ±5° Y
    rawRotateX.set(Math.max(-3, Math.min(3, -ny * 3)));
    rawRotateY.set(Math.max(-5, Math.min(5, nx * 5)));

    // Light position as percentage for radial gradient
    const pctX = ((e.clientX - rect.left) / rect.width) * 100;
    const pctY = ((e.clientY - rect.top) / rect.height) * 100;
    lightX.set(Math.max(0, Math.min(100, pctX)));
    lightY.set(Math.max(0, Math.min(100, pctY)));
  }, [enabled, rawRotateX, rawRotateY, lightX, lightY]);

  const handleMouseLeave = useCallback(() => {
    rawRotateX.set(0);
    rawRotateY.set(0);
    lightX.set(50);
    lightY.set(50);
  }, [rawRotateX, rawRotateY, lightX, lightY]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    el.addEventListener('mousemove', handleMouseMove);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      el.removeEventListener('mousemove', handleMouseMove);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [enabled, handleMouseMove, handleMouseLeave]);

  // Compose the style object for a motion.div
  const style: MotionStyle = {
    rotateX,
    rotateY,
    transformPerspective: 800,
    transformStyle: 'preserve-3d' as any,
  };

  return { ref, style, springLightX, springLightY };
}

// ─── Animation Constants ───────────────────────────────────────
export const SPRING_PANEL = { type: 'spring' as const, stiffness: 300, damping: 24, mass: 0.8 };
export const SPRING_MODAL = { type: 'spring' as const, stiffness: 260, damping: 20, mass: 1 };
export const SPRING_BACKDROP = { type: 'spring' as const, stiffness: 200, damping: 30 };
