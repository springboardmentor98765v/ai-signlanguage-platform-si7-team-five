import os

file_path = 'src/components/DashboardView.tsx'

with open(file_path, 'r', encoding='utf-8') as f:
    txt = f.read()

new_component = """const PremiumHeroBanner = ({ user, onNavigate }: { user: User; onNavigate: (tab: string, param?: any) => void }) => {
  const [displayStreak, setDisplayStreak] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const end = user.streak || 0;
    const duration = 600;
    const startTime = performance.now();
    const easeOutExpo = (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t);

    const updateCounter = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setDisplayStreak(Math.round(easeOutExpo(progress) * end));
      if (progress < 1) { animationFrameId = requestAnimationFrame(updateCounter); }
    };
    animationFrameId = requestAnimationFrame(updateCounter);
    return () => cancelAnimationFrame(animationFrameId);
  }, [user.streak]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20, backgroundPosition: '0% 0%' },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { 
         opacity: { ease: [0.16, 1, 0.3, 1], duration: 0.5 },
         y: { ease: [0.16, 1, 0.3, 1], duration: 0.5 },
         staggerChildren: 0.05, delayChildren: 0 
      } 
    },
    drift: {
      backgroundPosition: '100% 100%',
      transition: { duration: 10, ease: 'easeInOut', repeat: Infinity, repeatType: 'reverse' }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5 } }
  };
  
  const headingVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5, delay: 0 } }
  };

  const streakVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { ease: [0.16, 1, 0.3, 1], duration: 0.5, delay: 0.12 } }
  };

  const actionsContainerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05, delayChildren: 0.22 } }
  };

  const shineVariants = {
    hidden: { x: '-150%', opacity: 0 },
    hover: { x: '200%', opacity: 1, transition: { duration: 0.75, ease: 'easeOut' } }
  };

  return (
    <>
      <motion.div 
        id="welcome_banner" 
        initial={{ opacity: 0, y: 20, backgroundPosition: '0% 0%' }}
        animate={["visible", "drift"]}
        variants={containerVariants}
        className="relative overflow-hidden bg-gradient-to-br from-[#1b8d75] to-[#12584d] backdrop-blur-3xl text-white p-8 rounded-3xl shadow-[0_32px_64px_-12px_rgba(27,141,117,0.3),_inset_0_0_0_1px_rgba(255,255,255,0.2),_inset_0_4px_24px_rgba(255,255,255,0.4)] flex flex-col justify-between gap-6 isolate min-h-[300px]"
        style={{ backgroundSize: '150% 150%' }}
      >
        <div className="absolute top-[-30%] left-[-20%] w-[80%] h-[120%] bg-[#40e0d0] rounded-full blur-[140px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-[-50%] right-[-10%] w-[60%] h-[100%] bg-[#ffebc2] rounded-full blur-[120px] opacity-20 pointer-events-none" />
        
        <div className="absolute inset-0 opacity-[0.15] bg-[url('https://www.transparenttextures.com/patterns/connected.png')] z-0 pointer-events-none" />

        <div className="relative z-10 max-w-xl">
          <motion.h1 variants={headingVariants} id="welcome_title" className="font-bold text-[34px] tracking-tight text-white mb-3">
            Hello, {user.name}! 
            <motion.img 
              src="/signs/hello_nobg.png" 
              alt="ASL Hello Gesture" 
              animate={{ rotate: [0, 15, -15, 15, -15, 0] }}
              transition={{ duration: 1.2, delay: 0.1, ease: 'easeInOut' }}
              className="inline-block h-10 w-10 ml-2 origin-bottom drop-shadow-[0_2px_8px_rgba(0,0,0,0.15)] pb-1 pointer-events-none select-none" 
            />
          </motion.h1>
          <motion.p variants={streakVariants} className="text-[15px] text-emerald-50/90 font-medium leading-relaxed relative">
            You're on a{' '}
            <span className="font-bold text-white relative inline-block">
              <motion.span 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: [0, 0.4, 0.1], scale: [0.5, 1.2, 1] }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                className="absolute inset-0 bg-emerald-300 blur-[8px] rounded-full -z-10 mix-blend-screen"
              />
              {displayStreak}-day
            </span>
            {' '}streak. Keep up the momentum —<br/> practice today to maintain your progress!
          </motion.p>
        </div>
        
        <motion.div variants={actionsContainerVariants} initial="hidden" animate="visible" className="flex gap-4 shrink-0 pt-4 items-center z-10 relative">
          <motion.button
            variants={{
              hidden: itemVariants.hidden,
              visible: itemVariants.visible,
              hover: { scale: 1.025, boxShadow: '0 12px 24px rgba(27,141,117,0.4)', transition: { duration: 0.2 } }
            }}
            whileHover="hover"
            whileTap={{ scale: 0.98 }}
            id="banner_action_practice"
            onClick={() => onNavigate('Practice')}
            className="relative overflow-hidden px-6 py-2.5 bg-white text-[#1b8d75] font-bold text-sm rounded-xl shadow-[0_8px_16px_rgba(27,141,117,0.3)] transition-shadow duration-200 flex items-center gap-2"
          >
            <motion.div variants={shineVariants} className="absolute inset-0 bg-gradient-to-r from-transparent via-white/80 to-transparent skew-x-[-20deg]" />
            <Play className="h-4 w-4 relative z-10" fill="currentColor" />
            <span className="relative z-10">Start Practice</span>
          </motion.button>
          
          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.025, transition: { duration: 0.2 } }}
            whileTap={{ scale: 0.98 }}
            id="banner_action_lessons"
            onClick={() => onNavigate('Lessons')}
            className="px-6 py-2.5 bg-transparent border border-white/40 text-white font-bold text-sm rounded-xl hover:bg-white/10 hover:border-white transition-colors duration-200 flex items-center gap-2"
          >
            <BookOpen className="h-4 w-4" />
            View Lessons
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
};"""

idx_start = txt.find("const PremiumHeroBanner")
idx_end = txt.find("export default function DashboardView")

if idx_start != -1 and idx_end != -1:
    txt = txt[:idx_start] + new_component + "\n\n" + txt[idx_end:]
    
    # Clean up imports for cleanliness
    old_imports = "import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'motion/react';"
    new_imports = "import { motion } from 'motion/react';"
    txt = txt.replace(old_imports, new_imports)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(txt)
    print("Reverted cleanly!")
else:
    print("Failed to find boundaries.")
