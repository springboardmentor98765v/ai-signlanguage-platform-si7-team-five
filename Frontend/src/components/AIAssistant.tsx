import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, Lightbulb, TrendingUp, Target, BrainCircuit, MessageSquareText, ChevronLeft, Send } from 'lucide-react';
import { SPRING_PANEL, SPRING_BACKDROP } from '../hooks/useGlassTilt';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  
  const [isChatMode, setIsChatMode] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: "Hi there! I'm your SignAI Coach. How can I help you improve your sign language skills today?" }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Mark as read when opened
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setHasUnread(false), 500);
      return () => clearTimeout(timer);
    } else {
      setIsChatMode(false); // Reset to insights when closed
    }
  }, [isOpen]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatMode]);

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { role: 'user', text: chatInput }]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, { 
        role: 'ai', 
        text: "Keep practicing! I'm here to analyze your progress and suggest tailored lessons." 
      }]);
    }, 1000);
  };

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
              className="absolute bottom-full right-0 mb-4 w-80 max-w-[calc(100vw-3rem)] rounded-[1.5rem] bg-white/90 backdrop-blur-2xl border border-white/60 shadow-glass flex flex-col"
              style={{ maxHeight: '600px', height: isChatMode ? '500px' : 'auto' }}
            >
              <div 
                className="p-4 bg-gradient-to-r from-emerald-600/90 to-teal-700/90 flex items-center gap-3 relative overflow-hidden shrink-0 group rounded-t-[1.5rem] "
                style={!isChatMode ? { borderBottomLeftRadius: '0', borderBottomRightRadius: '0' } : {}}
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                
                {isChatMode ? (
                  <button 
                    onClick={() => setIsChatMode(false)}
                    className="p-1.5 hover:bg-white/20 rounded-lg transition-colors text-white mr-1 relative z-10"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                ) : (
                  <div className="p-2 bg-white/20 rounded-xl shrink-0 relative z-10">
                    <BrainCircuit className="h-5 w-5 text-white" />
                  </div>
                )}
                
                <div className="relative z-10 font-sans">
                  <h3 className="font-bold text-white text-sm">SignAI Coach</h3>
                  <p className="text-xs text-emerald-100 opacity-90">{isChatMode ? 'Online' : 'Contextual Learning Insights'}</p>
                </div>
              </div>

              {!isChatMode ? (
                <div className="flex flex-col max-h-[60vh] overflow-hidden rounded-b-[1.5rem]">
                  <div className="p-4 overflow-y-auto space-y-4">
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
                  
                  <div className="p-3 border-t border-gray-100 bg-gray-50/50 shrink-0">
                    <button 
                      onClick={() => setIsChatMode(true)}
                      className="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold text-gray-600 bg-white rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-colors shadow-sm"
                    >
                      <MessageSquareText className="h-3.5 w-3.5" />
                      Ask AI a question...
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col flex-1 min-h-0 bg-gray-50/50 rounded-b-[1.5rem] overflow-hidden">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3">
                    {chatMessages.map((msg, idx) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={idx}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-emerald-600 text-white rounded-br-sm shadow-sm' 
                              : 'bg-white text-gray-700 border border-gray-100 rounded-bl-sm shadow-sm'
                          }`}
                        >
                          {msg.text}
                        </div>
                      </motion.div>
                    ))}
                    <div ref={chatEndRef} />
                  </div>
                  
                  <div className="p-3 bg-white border-t border-gray-100 shrink-0">
                    <form 
                      onSubmit={handleSendMessage}
                      className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:border-emerald-300 focus-within:ring-2 focus-within:ring-emerald-100 transition-all"
                    >
                      <input 
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none text-xs text-gray-700 px-2 py-1.5 focus:outline-none focus:ring-0 placeholder-gray-400 font-medium"
                      />
                      <button 
                        type="submit"
                        disabled={!chatInput.trim()}
                        className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors shrink-0"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
