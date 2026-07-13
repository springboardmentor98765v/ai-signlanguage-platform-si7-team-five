import React from 'react';
import { JSX } from 'react';
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

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || "http://localhost:8000";

export default function App() {
  // Authentication states
  const [currentUser, setCurrentUser] = React.useState<User | null>(null);
  const [authScreen, setAuthScreen] = React.useState<'login' | 'register'>('login');

  // Core application database states (for dynamic UI persistence)
  const [lessons, setLessons] = React.useState<Lesson[]>([]);
  const [token, setToken] = React.useState<string | null>(null);

  // Active navigation tab
  const [activeTab, setActiveTab] = React.useState<string>('Dashboard');

  // Inter-tab parameter transfer (e.g. continuing a lesson or practicing a specific step)
  const [selectedLessonFromNav, setSelectedLessonFromNav] = React.useState<Lesson | null>(null);
  const [selectedPracticeStep, setSelectedPracticeStep] = React.useState<{ step: LessonStep; lessonName: string } | null>(null);

  // Read session from localStorage if available (simulates persistent login)
  React.useEffect(() => {
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
        // param has shape { step: LessonStep, lessonName: string }
        setSelectedPracticeStep(param);
      } else {
        setSelectedPracticeStep(null);
      }
      setActiveTab('Practice');
    } else {
      setActiveTab(tab);
    }
  };

  // Load courses on component mount
  React.useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    const res = await fetch(`${API_BASE_URL}/courses`);
    const data = await res.json();
    setLessons(data);
  };

  // Render authentications if offline
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
        return (
          <DashboardView
            user={currentUser}
            lessons={lessons}
            onNavigate={handleNavigate}
          />
        );
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

