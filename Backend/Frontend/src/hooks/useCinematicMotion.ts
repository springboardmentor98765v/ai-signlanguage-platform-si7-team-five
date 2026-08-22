import React, { useRef, useCallback, useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, MotionStyle } from 'motion/react';

/**
 * Magnetic button hook — attracts the element toward the cursor
 * when within proximity range, providing a premium magnetic feel.
 *
 * Returns { ref, style } to attach to a motion.element.
 *
 * @param strength  Attraction multiplier (default 0.3)
 * @param radius    Pixel radius for magnetic effect (default 120)
 */
export function useMagneticHover(strength = 0.3, radius = 120) {
  const ref = useRef<HTMLElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  const prefersReduced = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    prefersReduced.current = mq.matches;
    const handler = (e: MediaQueryListEvent) => { prefersReduced.current = e.matches; };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!ref.current || prefersReduced.current) return;
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = e.clientX - centerX;
    const dy = e.clientY - centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < radius) {
      x.set(dx * strength);
      y.set(dy * strength);
    } else {
      x.set(0);
      y.set(0);
    }
  }, [strength, radius, x, y]);

  const handleMouseLeave = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement || document;
    parent.addEventListener('mousemove', handleMouseMove as EventListener);
    el.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      parent.removeEventListener('mousemove', handleMouseMove as EventListener);
      el.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [handleMouseMove, handleMouseLeave]);

  const style: MotionStyle = {
    x: springX,
    y: springY,
  };

  return { ref, style };
}

/**
 * Animated counter hook — smoothly counts from 0 to target value.
 *
 * @param target   The target number to count to
 * @param duration Duration in ms (default 1500)
 * @param enabled  Whether animation is active
 */
export function useAnimatedCounter(target: number, duration = 1500, enabled = true) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!enabled) { setCount(target); return; }

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mq.matches) { setCount(target); return; }

    let startTime: number | null = null;
    let raf: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(eased * target));

      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };

    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, enabled]);

  return count;
}
