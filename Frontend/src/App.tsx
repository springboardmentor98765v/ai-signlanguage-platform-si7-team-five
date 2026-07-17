import React, { useState, useEffect } from 'react';
import { User, UserRole, Lesson, LessonStep } from './types';
import { mockUser, mockLessons } from './mockData';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import LessonsView from './components/LessonsView';
import PracticeView from './components/PracticeView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import InstructorDashboard from './components/InstructorDashboard';
import AdminDashboard from './components/AdminDashboard';

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  // Core application database states (for dynamic UI persistence)
  const [lessons, setLessons] = useState<Lesson[]>(mockLessons);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  // Inter-tab parameter transfer (e.g. continuing a lesson or practicing a specific step)
  const [selectedLessonFromNav, setSelectedLessonFromNav] = useState<Lesson | null>(null);
  const [selectedPracticeStep, setSelectedPracticeStep] = useState<{ step: LessonStep; lessonName: string } | null>(null);

  // Read session from localStorage if available (simulates persistent login)
  useEffect(() => {
    const cachedUser = localStorage.getItem('asl_user_session');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        console.warn('Error restoring session cached state', e);
      }
    }
  }, []);

  const handleLogin = (email: string, name: string, role: UserRole) => {
    const loggedInUser: User = {
      ...mockUser,
      email,
      name,
      role,
    };
    setCurrentUser(loggedInUser);
    localStorage.setItem('asl_user_session', JSON.stringify(loggedInUser));
    setActiveTab('Dashboard');
  };

  const handleRegister = (email: string, name: string, role: UserRole) => {
    const newUser: User = {
      id: `usr_${Date.now()}`,
      name,
      email,
      role,
      streak: 1,
      lessonsCompleted: 0,
      practiceSessions: 0,
      avgAccuracy: 0,
    };
    setCurrentUser(newUser);
    localStorage.setItem('asl_user_session', JSON.stringify(newUser));
    setActiveTab('Dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('asl_user_session');
    setSelectedLessonFromNav(null);
    setSelectedPracticeStep(null);
    setAuthScreen('login');
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      localStorage.setItem('asl_user_session', JSON.stringify(updated));
    }
  };

  const handleNavigate = (tab: string, param?: any) => {
    if (tab === 'Lessons') {
      if (param) {
        setSelectedLessonFromNav(param);
      } else {
        setSelectedLessonFromNav(null);
      }
      setActiveTab('Lessons');
    } else if (tab === 'Practice') {
      if (param) {
        setSelectedPracticeStep(param);
      } else {
        setSelectedPracticeStep(null);
      }
      setActiveTab('Practice');
    } else {
      setActiveTab(tab);
    }
  };

  // Render authentication screens if not logged in
  if (!currentUser) {
    if (authScreen === 'register') {
      return (
        <RegisterView
          onRegister={handleRegister}
          onNavigateToLogin={() => setAuthScreen('login')}
        />
      );
    }
    return (
      <LoginView
        onLogin={handleLogin}
        onNavigateToRegister={() => setAuthScreen('register')}
      />
    );
  }

  // Active view content switcher
  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        // Role-based dashboard routing
        if (currentUser.role === 'Instructor') {
          return <InstructorDashboard />;
        }
        return (
          <DashboardView
            user={currentUser}
            lessons={lessons}
            onNavigate={handleNavigate}
          />
        );
      case 'Instructor':
        return <InstructorDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      case 'Lessons':
        return (
          <LessonsView
            lessons={lessons}
            onNavigate={handleNavigate}
            selectedLessonFromNav={selectedLessonFromNav}
          />
        );
      case 'Practice':
        return (
          <PracticeView
            initialTargetStep={selectedPracticeStep}
            onNavigate={handleNavigate}
          />
        );
      case 'Reports':
        return <ReportsView />;
      case 'Profile':
        return (
          <ProfileView
            user={currentUser}
            onUpdateProfile={handleUpdateProfile}
          />
        );
      default:
        return (
          <DashboardView
            user={currentUser}
            lessons={lessons}
            onNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={(tab) => handleNavigate(tab)}
      user={currentUser}
      onLogout={handleLogout}
    >
      {renderActiveView()}
    </Layout>
  );
}