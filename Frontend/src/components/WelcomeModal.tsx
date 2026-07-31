import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Camera, X } from 'lucide-react';
import { SPRING_MODAL, SPRING_PANEL } from '../hooks/useGlassTilt';
import { useFocusTrap } from '../hooks/useFocusTrap';

export default function WelcomeModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(0);

  const modalRef = useFocusTrap(isOpen);

  useEffect(() => {
    // Only show once per session for the hackathon demo
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      // Slight delay so the user sees the page enter first, then the modal pops up
      const timer = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem('hasSeenWelcome', 'true');
  };

  const steps = [
    {
      icon: Sparkles,
      title: "Welcome to SignAI Platform",
      desc: "Experience the next generation of Sign Language learning, powered by real-time AI computer vision and cinematic motion.",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      icon: Camera,
      title: "Real-time AI Assessment",
      desc: "Our proprietary AI engine tracks your hand signs through your webcam instantly, providing real-time accuracy and feedback.",
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      icon: Zap,
      title: "Adaptive Learning Paths",
      desc: "The platform dynamically adjusts your lessons based on your weak signs and progress, ensuring maximum retention.",
      color: "text-amber-500",
      bg: "bg-amber-50",
    },
    {
      icon: ShieldCheck,
      title: "Enterprise Grade & Secure",
      desc: "Built with WCAG 2.1 AA accessibility, 60fps cinematic motion, and robust state management for a flawless experience.",
      color: "text-violet-500",
      bg: "bg-violet-50",
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="welcome_title" ref={modalRef}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            onClick={handleClose}
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20, rotateX: -10 }}
            transition={SPRING_MODAL}
            className="relative w-full max-w-md bg-white/80 backdrop-blur-3xl border border-white/60 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.15)] rounded-3xl overflow-hidden flex flex-col perspective-1000"
          >
            {/* Top glass reflection line */}
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-80" />

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100/50 rounded-full transition-colors z-10"
              aria-label="Skip walkthrough"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="p-8 pt-10 flex flex-col items-center text-center space-y-6">
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={SPRING_PANEL}
                  className="flex flex-col items-center space-y-5 w-full"
                >
                  <div className={`p-4 rounded-2xl ${steps[step].bg} ${steps[step].color} shadow-sm border border-black/5`}>
                    {React.createElement(steps[step].icon, { className: "h-8 w-8" })}
                  </div>
                  
                  <div className="space-y-2">
                    <h2 id="welcome_title" className="text-2xl font-black text-gray-900 tracking-tight">
                      {steps[step].title}
                    </h2>
                    <p className="text-sm text-gray-500 max-w-xs mx-auto leading-relaxed">
                      {steps[step].desc}
                    </p>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Progress Dots */}
              <div className="flex justify-center gap-2 pt-4">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === step ? 'w-6 bg-emerald-500' : 'w-1.5 bg-gray-200'
                    }`}
                  />
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 w-full pt-4">
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 px-4 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100/80 transition-colors"
                >
                  Skip
                </button>
                <button
                  onClick={() => {
                    if (step < steps.length - 1) {
                      setStep(step + 1);
                    } else {
                      handleClose();
                    }
                  }}
                  className="flex-[2] flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-premium transition-colors"
                >
                  {step < steps.length - 1 ? (
                    <>Next <ArrowRight className="h-4 w-4" /></>
                  ) : (
                    <>Get Started <Sparkles className="h-4 w-4" /></>
                  )}
                </button>
              </div>

            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
