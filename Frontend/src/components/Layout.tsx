import React, { useState } from 'react';
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
  ShieldAlert
} from 'lucide-react';
import { User as UserType } from '../types';

interface LayoutProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  user: UserType;
  onLogout: () => void;
  children: React.ReactNode;
}

export default function Layout({ activeTab, onTabChange, user, onLogout, children }: LayoutProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    { name: 'Reports', icon: Award },
    { name: 'Profile', icon: User },
  ];

  const getInstructorNav = () => [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Lessons', icon: BookOpen },
    { name: 'Reports', icon: Award },
    { name: 'Profile', icon: User },
  ];

  const getTrainerNav = () => [
    { name: 'Dashboard', icon: LayoutDashboard },
    { name: 'Lessons', icon: BookOpen },
    { name: 'Practice', icon: Camera },
    { name: 'Reports', icon: Award },
    { name: 'Profile', icon: User },
    { name: 'Admin', icon: ShieldAlert },
  ];

  const navItems = user.role === 'Instructor'
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
        return user.role === 'Instructor' ? 'Instructor Dashboard' : 'Learner Dashboard';
      case 'Instructor':
        return 'Instructor Dashboard';
      case 'Admin':
        return 'Admin Dashboard';
      case 'Lessons':
        return 'ASL Syllabus';
      case 'Practice':
        return 'Practice Arena';
      case 'Reports':
        return 'Performance Reports';
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
        <div className="px-6 flex items-center space-x-2 text-emerald-600">
          <ShieldCheck className="h-8 w-8 text-emerald-600" />
          <span className="font-sans font-bold text-lg tracking-tight text-gray-900">SignAI Learn</span>
        </div>

        {/* Navigation Links */}
        <nav id="desktop_navigation" className="px-4 space-y-1 flex-1">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                id={`nav_desktop_${item.name.toLowerCase()}`}
                onClick={() => handleNavClick(item.name)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <IconComponent className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div id="desktop_sidebar_footer" className="p-4 border-t border-gray-100 space-y-4 bg-white">
        <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-xl border border-gray-100">
          <div className="h-10 w-10 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm uppercase shrink-0">
            {user.name.substring(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-gray-900 truncate">{user.name}</p>
            <div className="flex items-center space-x-1 mt-0.5">
              <span className="text-emerald-700">{getRoleIcon(user.role)}</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider truncate">{user.role}</span>
            </div>
          </div>
        </div>

        <button
          id="logout_desktop_btn"
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
        >
          <LogOut className="h-4.5 w-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div id="layout_root" className="min-h-screen bg-gray-50 flex">
      
      {/* ========================================== */}
      {/* DESKTOP SIDEBAR - PERSISTENT LEFT SIDEBAR   */}
      {/* ========================================== */}
      <aside 
        id="desktop_sidebar" 
        className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 flex-shrink-0 justify-between h-screen sticky top-0"
      >
        <SidebarContent />
      </aside>

      {/* ========================================== */}
      {/* MOBILE DRAWER / SIDEBAR (COLLAPSIBLE OVERLAY) */}
      {/* ========================================== */}
      {isMobileOpen && (
        <div id="mobile_drawer_overlay" className="fixed inset-0 z-50 flex md:hidden">
          {/* Backdrop */}
          <div 
            id="mobile_backdrop"
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-gray-950/40 backdrop-blur-sm"
          />

          {/* Sliding Menu */}
          <aside 
            id="mobile_drawer"
            className="relative flex flex-col w-72 max-w-sm bg-white h-full shadow-xl z-50 animate-slide-in justify-between"
          >
            <div className="space-y-6 pt-5 flex-1 flex flex-col">
              {/* Top Bar Logo & Close button */}
              <div className="px-6 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-emerald-600">
                  <ShieldCheck className="h-7 w-7" />
                  <span className="font-sans font-bold text-base tracking-tight text-gray-900">SignAI Learn</span>
                </div>
                <button
                  id="mobile_drawer_close"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1 text-gray-400 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <nav id="mobile_navigation" className="px-4 space-y-1">
                {navItems.map((item) => {
                  const IconComponent = item.icon;
                  const isActive = activeTab === item.name;
                  return (
                    <button
                      key={item.name}
                      id={`nav_mobile_${item.name.toLowerCase()}`}
                      onClick={() => handleNavClick(item.name)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                        isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <IconComponent className={`h-5 w-5 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Mobile Footer */}
            <div id="mobile_drawer_footer" className="p-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-xl">
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
                className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-red-50 hover:text-red-600 transition"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ========================================== */}
      {/* MAIN VIEWPORT PANELS (TOP NAVBAR & CONTENT) */}
      {/* ========================================== */}
      <div id="main_viewport" className="flex-1 flex flex-col min-w-0">
        
        {/* Top Navbar */}
        <header id="top_navbar" className="bg-white border-b border-gray-100 h-16 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center space-x-3">
            {/* Mobile Menu Toggle Button */}
            <button
              id="mobile_drawer_toggle"
              onClick={() => setIsMobileOpen(true)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <h2 id="top_navbar_page_title" className="font-sans font-bold text-base md:text-lg text-gray-900 tracking-tight">
              {getPageTitle()}
            </h2>
          </div>

          <div id="top_navbar_right_controls" className="flex items-center space-x-4">
            {/* Streak Tracker Badge */}
            <div 
              id="streak_tracker_badge" 
              className="flex items-center space-x-1 bg-amber-50 border border-amber-100/60 px-3 py-1 rounded-full text-amber-700"
            >
              <Zap className="h-4 w-4 fill-amber-500 text-amber-500" />
              <span className="text-xs font-bold">{user.streak} Days</span>
            </div>

            {/* Notification bell */}
            <button
              id="notif_bell"
              onClick={() => alert('All notifications are up-to-date.')}
              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition"
            >
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Main Contents Frame */}
        <main id="main_content_frame" className="flex-1 p-6 overflow-y-auto max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

    </div>
  );
}
