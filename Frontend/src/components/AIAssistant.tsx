import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Lightbulb, TrendingUp, Target, BrainCircuit, MessageSquareText } from 'lucide-react';
import { SPRING_PANEL, SPRING_BACKDROP } from '../hooks/useGlassTilt';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);

  // Mark as read when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setHasUnread(false), 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative flex items-center justify-center p-4 bg-emerald-600 text-white rounded-full shadow-premium hover:bg-emerald-700 transition-colors focus:ring-4 focus:ring-emerald-500/30"
          aria-label="AI Assistant"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
          
          {hasUnread && !isOpen && (
            <span className="absolute top-0 right-0 h-3.5 w-3.5 bg-red-500 border-2 border-white rounded-full shadow-sm animate-pulse" />
          )}
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 20, scale: 0.9, filter: 'blur(10px)' }}
              transition={SPRING_PANEL}
              className="absolute bottom-full right-0 mb-4 w-80 max-w-[calc(100vw-3rem)] rounded-[1.5rem] bg-white/90 backdrop-blur-2xl border border-white/60 shadow-glass overflow-hidden"
            >
              <div className="p-4 bg-gradient-to-r from-emerald-600/90 to-teal-700/90 flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-xl shrink-0">
                  <BrainCircuit className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">SignAI Coach</h3>
                  <p className="text-xs text-emerald-100 opacity-90">Contextual Learning Insights</p>
                </div>
              </div>

              <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
                {[
                  {
                    icon: Lightbulb,
                    title: "Focus on 'Z'",
                    desc: "Your accuracy for 'Z' has dropped to 65%. 5 minutes of practice recommended.",
                    color: "text-amber-500",
                    bg: "bg-amber-50",
                  },
                  {
                    icon: TrendingUp,
                    title: "Pacing Excellent",
                    desc: "Your transition speed between words has improved by 15% this week.",
                    color: "text-emerald-500",
                    bg: "bg-emerald-50",
                  },
                  {
                    icon: Target,
                    title: "Goal Predictor",
                    desc: "At this rate, you'll finish the 'Advanced Greetings' module by tomorrow.",
                    color: "text-blue-500",
                    bg: "bg-blue-50",
                  }
                ].map((insight, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ ...SPRING_PANEL, delay: 0.1 + idx * 0.05 }}
                    key={idx} 
                    className="flex gap-3 p-3 rounded-xl hover:bg-gray-50/50 transition-colors"
                  >
                    <div className={`shrink-0 p-2 rounded-lg ${insight.bg} ${insight.color} h-max`}>
                      <insight.icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{insight.title}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{insight.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              
              <div className="p-3 border-t border-gray-100 bg-gray-50/50">
                <button className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-600 bg-white rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm">
                  <MessageSquareText className="h-3.5 w-3.5" />
                  Ask AI a question...
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
