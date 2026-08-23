import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SPRING_PANEL, SPRING_BACKDROP } from '../hooks/useGlassTilt';
import { 
  LayoutDashboard, 
  BookOpen, 
  Camera, 
  Award, 
  User, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  Zap, 
  Bell, 
  GraduationCap,
  Users,
  Accessibility,
  ShieldAlert,
  Trophy,
} from 'lucide-react';
import { User as UserType } from '../types';
import NotificationDropdown from './NotificationDropdown';
import AIAssistant from './AIAssistant';
import WelcomeModal from './WelcomeModal';
import { AnimatedBackground } from './CinematicMotion';

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserType;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ activeTab, onTabChange, user, onLogout, children }: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Learner':
        return <GraduationCap className="h-3.5 w-3.5" />;
      case 'Instructor':
        return <Users className="h-3.5 w-3.5" />;
      case 'Accessibility Trainer':
        return <Accessibility className="h-3.5 w-3.5" />;
      default:
        return <User className="h-3.5 w-3.5" />;
    }
  };

  // Role-based nav items
  const getLearnerNav = () => [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Lessons', icon: BookOpen },
    { name: 'Practice', icon: Camera },
    { name: 'Leaderboard', icon: Trophy },
    { name: 'Certification', icon: ShieldCheck },
    { name: 'Reports', icon: Award },
    { name: 'Profile', icon: User },
  ];

  const getInstructorNav = () => [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Lessons', icon: BookOpen },
    { name: 'Leaderboard', icon: Trophy },
    { name: 'Reports', icon: Award },
    { name: 'Profile', icon: User },
  ];

  const getTrainerNav = () => [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Practice', icon: Camera },
    { name: 'Reports', icon: Award },
    { name: 'Profile', icon: User },
  ];

  const getAdminNav = () => [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Users', icon: Users },
    { name: 'Lessons', icon: BookOpen },
    { name: 'Reports', icon: Award },
    { name: 'Profile', icon: User },
  ];

  const navItems = user.role === 'Admin'
    ? getAdminNav()
    : user.role === 'Instructor'
      ? getInstructorNav()
      : user.role === 'Accessibility Trainer'
        ? getTrainerNav()
        : getLearnerNav();

  const handleNavClick = (tabName: string) => {
    onTabChange(tabName);
    setIsMobileOpen(false);
  };

  const getPageTitle = () => {
    switch (activeTab) {
      case 'Dashboard':
        return user.role === 'Instructor' ? 'Instructor Dashboard' : user.role === 'Accessibility Trainer' ? 'Accessibility Trainer Dashboard' : 'Learner Dashboard';
      case 'Instructor':
        return 'Instructor Dashboard';
      case 'Admin':
        return 'Admin Dashboard';
      case 'Lessons':
        return 'ASL Syllabus';
      case 'Practice':
        return 'Practice Arena';
      case 'Certification':
        return 'Certification Exams';
      case 'Reports':
        return 'Performance Reports';
      case 'Leaderboard':
        return 'Community Leaderboard';
      case 'Profile':
        return 'Account Settings';
      default:
        return 'Platform';
    }
  };

  const SidebarContent = () => (
    <>
      <div className="space-y-6 pt-6 flex-1 flex flex-col">
        {/* Logo / Brand */}
        <div className={`px-6 flex items-center ${isSidebarCollapsed ? 'justify-center px-0' : 'space-x-2'} text-emerald-600 transition-all duration-300 overflow-hidden`}>
          <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
          <span className={`font-sans font-bold text-lg tracking-tight text-gray-900 whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100'}`}>SignAI Learn</span>
        </div>

        {/* Navigation Links */}
        <nav id="desktop_navigation" className="px-4 space-y-2 flex-1 mt-6">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.name;
            return (
              <motion.button
                key={item.name}
                id={`nav_desktop_${item.name.toLowerCase()}`}
                onClick={() => handleNavClick(item.name)}
                whileHover={{ x: isActive ? 0 : 4 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center space-x-0 px-2' : 'space-x-4 px-4'} py-3.5 rounded-[1.25rem] text-[15px] font-bold transition-all duration-300 relative ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-500/10 to-emerald-400/5 backdrop-blur-xl text-emerald-700 shadow-[inset_0_1px_1px_rgba(255,255,255,0.8),_0_8px_16px_-4px_rgba(16,185,129,0.15)] border border-emerald-200/50'
                    : 'text-gray-500 hover:bg-white/40 border border-transparent hover:border-white/50'
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
                )}
                <IconComponent className={`h-[22px] w-[22px] shrink-0 transition-transform duration-300 stroke-[2px] ${isActive ? 'text-emerald-500 drop-shadow-[0_2px_4px_rgba(16,185,129,0.4)]' : 'text-gray-400'}`} />
                <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>{item.name}</span>
              </motion.button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div id="desktop_sidebar_footer" className={`p-6 border-t border-white/20 mt-auto bg-gradient-to-t from-white/30 to-transparent transition-all duration-300 ${isSidebarCollapsed ? 'px-3' : ''}`}>
        <div className={`flex items-center space-x-3 p-3 bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_28px_rgba(0,0,0,0.08)] transition-all cursor-pointer ${isSidebarCollapsed ? 'justify-center space-x-0 px-0' : ''}`}>
          <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100/50 text-emerald-600 font-bold flex items-center justify-center text-sm uppercase shrink-0">
            {user.name.substring(0, 2)}
          </div>
          <div className={`min-w-0 flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>
            <p className="text-[13px] font-bold text-gray-900 truncate tracking-tight">{user.name}</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-emerald-500 shrink-0">{getRoleIcon(user.role)}</span>
              <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{user.role}</span>
            </div>
          </div>
        </div>

        <motion.button
          id="logout_desktop_btn"
          onClick={onLogout}
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(254,226,226,0.5)' }}
          whileTap={{ scale: 0.98 }}
          className={`w-full flex mt-4 items-center ${isSidebarCollapsed ? 'justify-center space-x-0' : 'space-x-3 px-4'} py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:text-red-600 border border-transparent hover:border-red-100 transition-colors`}
        >
          <LogOut className="h-4.5 w-4.5 shrink-0" />
          <span className={`whitespace-nowrap transition-all duration-300 ${isSidebarCollapsed ? 'w-0 opacity-0 overflow-hidden' : 'w-auto opacity-100'}`}>Sign Out</span>
        </motion.button>
      </div>
    </>
  );

  return (
    <div id="layout_root" className="h-screen w-full bg-slate-50 relative flex overflow-hidden font-sans">
      
      {/* Premium Background Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-[#faf8fc]">
        {/* Soft radial gradients to match the image */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#e0edff] rounded-full blur-[140px] opacity-70" />
        <div className="absolute top-[-5%] right-[5%] w-[40%] h-[40%] bg-[#ffe6d4] rounded-full blur-[120px] opacity-80" />
        <div className="absolute bottom-[20%] right-[-10%] w-[30%] h-[50%] bg-[#fff0e6] rounded-full blur-[120px] opacity-60" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-[#e6fff2] rounded-full blur-[120px] opacity-60" />
        {/* Subtle noise texture */}
        <div className="absolute inset-0 z-0 mix-blend-overlay opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]" />
      </div>

      <AnimatedBackground />
      
      {/* ========================================== */}
      {/* DESKTOP SIDEBAR - PERSISTENT LEFT SIDEBAR   */}
      {/* ========================================== */}
      <motion.aside 
        id="desktop_sidebar" 
        animate={{ width: isSidebarCollapsed ? 88 : 260 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="hidden md:flex flex-col bg-white/40 backdrop-blur-3xl border-r border-white/50 flex-shrink-0 justify-between h-screen sticky top-0 shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* ========================================== */}
      {/* MOBILE DRAWER / SIDEBAR (COLLAPSIBLE OVERLAY) */}
      {/* ========================================== */}
      <AnimatePresence>
        {isMobileOpen && (
          <div id="mobile_drawer_overlay" className="fixed inset-0 z-50 flex md:hidden">
            {/* Glass Backdrop */}
            <motion.div
              id="mobile_backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={SPRING_BACKDROP}
              onClick={() => setIsMobileOpen(false)}
              className="fixed inset-0 glass-backdrop"
              aria-hidden="true"
            />

            {/* Glass Sliding Menu */}
            <motion.aside
              id="mobile_drawer"
              initial={{ x: '-100%', opacity: 0.8 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: '-100%', opacity: 0.5 }}
              transition={SPRING_PANEL}
              className="glass-panel relative flex flex-col w-72 max-w-sm h-full z-50 justify-between rounded-none rounded-r-[2rem] border-l-0"
            >
              <div className="space-y-6 pt-5 flex-1 flex flex-col">
                {/* Top Bar Logo & Close button */}
                <div className="px-6 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-emerald-600">
                    <ShieldCheck className="h-7 w-7" />
                    <span className="font-sans font-bold text-base tracking-tight text-gray-900">SignAI Learn</span>
                  </div>
                  <motion.button
                    id="mobile_drawer_close"
                    onClick={() => setIsMobileOpen(false)}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                    className="p-1 text-gray-400 hover:text-gray-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 rounded-lg"
                  >
                    <X className="h-5 w-5" />
                  </motion.button>
                </div>

                {/* Navigation Links */}
                <nav id="mobile_navigation" className="px-4 space-y-1">
                  {navItems.map((item, i) => {
                    const IconComponent = item.icon;
                    const isActive = activeTab === item.name;
                    return (
                      <motion.button
                        key={item.name}
                        id={`nav_mobile_${item.name.toLowerCase()}`}
                        onClick={() => handleNavClick(item.name)}
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ ...SPRING_PANEL, delay: i * 0.04 }}
                        whileHover={{ x: 4 }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                          isActive
                            ? 'bg-emerald-500/10 backdrop-blur-2xl text-emerald-700 shadow-[0_2px_10px_rgba(16,185,129,0.05)] border border-emerald-500/20'
                            : 'text-gray-600 hover:bg-black/[0.04] border border-transparent'
                        }`}
                      >
                        <IconComponent className={`h-5 w-5 ${isActive ? 'text-emerald-600 drop-shadow-sm' : 'text-gray-400'}`} />
                        <span>{item.name}</span>
                      </motion.button>
                    );
                  })}
                </nav>
              </div>

              {/* Mobile Footer */}
              <div id="mobile_drawer_footer" className="p-4 border-t border-white/20 space-y-4">
                <div className="flex items-center space-x-3 p-2 bg-white/40 backdrop-blur-sm rounded-xl">
                  <div className="h-9 w-9 rounded-full bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-xs uppercase shrink-0">
                    {user.name.substring(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-400 font-medium truncate">{user.role}</p>
                  </div>
                </div>

                <button
                  id="logout_mobile_btn"
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-red-50/60 hover:text-red-600 transition"
                >
                  <LogOut className="h-4.5 w-4.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MAIN VIEWPORT PANELS (TOP NAVBAR & CONTENT) */}
      {/* ========================================== */}
      <div id="main_viewport" className="flex-1 flex flex-col min-w-0 z-10 relative">
        
        {/* Top Navbar */}
        <motion.header 
          id="top_navbar" 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ ...SPRING_PANEL, delay: 0.1 }}
          className="bg-transparent h-20 flex items-center justify-between px-8 sticky top-0 z-40 pt-4 pb-2"
        >
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile_drawer_toggle"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            <button
              id="desktop_sidebar_toggle"
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="hidden md:block p-2 text-gray-500 hover:text-gray-900 bg-white/60 backdrop-blur-md rounded-lg shadow-sm border border-gray-100 transition hover:bg-white"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <h2 id="top_navbar_page_title" className="font-sans font-bold text-base md:text-lg text-gray-900 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          <div id="top_navbar_right_controls" className="flex items-center space-x-4">


            {/* Streak Tracker Badge */}
            <motion.div 
              id="streak_tracker_badge" 
              whileHover={{ y: -2, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-1.5 bg-[#fff8eb]/90 backdrop-blur-xl border border-white px-3.5 py-2 rounded-full text-amber-500 shadow-[0_4px_12px_rgba(245,158,11,0.08)] cursor-pointer"
            >
              <Zap className="h-[14px] w-[14px] fill-amber-500 text-amber-500" />
              <span className="text-[13px] font-extrabold">{user.streak} Days</span>
            </motion.div>

            {/* Notification bell dropdown */}
            <NotificationDropdown onNavigateTab={(tab) => onTabChange(tab)} />
          </div>
        </motion.header>

        {/* Main Contents Frame */}
        <main id="main_content_frame" className="flex-1 px-8 pb-8 overflow-y-auto w-full relative">
          {children}
        </main>
      </div>

      {/* Global Modals & Overlays */}
      <AIAssistant />
      <WelcomeModal />

    </div>
  );
}
