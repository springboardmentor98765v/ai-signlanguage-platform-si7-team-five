import React, { useState, useEffect } from 'react';
import { User, UserRole, Lesson, LessonStep } from './types';
import { apiBaseUrl } from './utils/api';
import { mockLessons, mockUser } from './mockData';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import Layout from './components/Layout';
import DashboardView from './components/DashboardView';
import LessonsView from './components/LessonsView';
import PracticeView from './components/PracticeView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import LeaderboardView from './components/LeaderboardView';
import InstructorDashboard from './components/InstructorDashboard';
import InstructorLeaderboardView from './components/InstructorLeaderboardView';
import InstructorReportsView from './components/InstructorReportsView';
import InstructorProfileView from './components/InstructorProfileView';
import InstructorLessonsView from './components/InstructorLessonsView';
import AdminDashboard from './components/AdminDashboard';
import AdminUsersView from './components/AdminUsersView';
import AdminLessonsView from './components/AdminLessonsView';
import AdminReportsView from './components/AdminReportsView';
import AdminProfileView from './components/AdminProfileView';
import AccessibilityTrainerDashboard from './components/AccessibilityTrainerDashboard';
import AccessibilityTrainerPracticeView from './components/AccessibilityTrainerPracticeView';
import AccessibilityTrainerReportsView from './components/AccessibilityTrainerReportsView';
import AccessibilityTrainerProfileView from './components/AccessibilityTrainerProfileView';
import CertificationView from './components/CertificationView';

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

  // Read session from sessionStorage to require login on new tabs while keeping f5 reloads safe
  useEffect(() => {
    const cachedUser = sessionStorage.getItem('asl_user_session');
    if (cachedUser) {
      try {
        setCurrentUser(JSON.parse(cachedUser));
      } catch (e) {
        console.warn('Error restoring session cached state', e);
      }
    }

    fetch(`${apiBaseUrl}/health`)
      .then((response) => response.json())
      .catch(() => console.warn('Backend health check unavailable'));

    fetch(`${apiBaseUrl}/lessons`)
      .then((response) => response.json())
      .then((data) => {
        // Exclude backend's basic 'Letter' items if they duplicate the rich mocked alphabet
        const backendCourses = (data || []).filter((item: any) => !item.title?.startsWith('Letter '));
        const mappedLessons: Lesson[] = backendCourses.map((item: any, index: number) => ({
          id: `lesson_${item.lesson_id ?? index}`,
          name: item.title || `Lesson ${index + 1}`,
          description: `${item.category || 'General'} lesson for practicing ${item.title || 'signs'}`,
          difficulty: item.difficulty === 'Medium' ? 'Intermediate' : item.difficulty === 'Hard' ? 'Advanced' : 'Beginner',
          category: item.category || 'Basics',
          progress: index % 2 === 0 ? 45 : 80,
          duration: '15 mins',
          steps: [
            {
              id: `${item.lesson_id ?? index}-step-1`,
              title: 'Introduction',
              description: `Practice the ${item.title || 'target'} sign with a calm and steady posture.`,
              signSymbol: item.title?.split(' ')[0] || 'A',
            },
            {
              id: `${item.lesson_id ?? index}-step-2`,
              title: 'Form Check',
              description: 'Focus on hand shape, movement, and alignment.',
              signSymbol: item.title?.split(' ')[0] || 'A',
            },
          ],
        }));
        setLessons([...mockLessons, ...mappedLessons]);
      })
      .catch(() => {
        setLessons(mockLessons);
      });
  }, []);

  const handleLogin = (email: string, name: string, role: UserRole, userId?: string) => {
    const loggedInUser: User = {
      id: userId || `usr_${email}`,
      email,
      name,
      role,
      streak: 0,
      lessonsCompleted: 0,
      practiceSessions: 0,
      avgAccuracy: 0,
    };
    setCurrentUser(loggedInUser);
    sessionStorage.setItem('asl_user_session', JSON.stringify(loggedInUser));
    setActiveTab('Dashboard');
  };

  useEffect(() => {
    const token = localStorage.getItem('asl_access_token');
    if (!currentUser || !token || currentUser.role !== 'Learner') return;
    fetch(`${apiBaseUrl}/business/summary/me`, { headers: { Authorization: `Bearer ${token}` } })
      .then(response => response.ok ? response.json() : Promise.reject(new Error('Could not load live learner summary')))
      .then(summary => {
        setCurrentUser(user => user ? {
          ...user,
          streak: summary.streak,
          lessonsCompleted: summary.lessons_completed,
          practiceSessions: summary.practice_sessions,
          avgAccuracy: summary.average_accuracy,
        } : user);
      })
      .catch(() => undefined);
  }, [currentUser?.id]);

  const handleRegister = (email: string, name: string, role: UserRole, userId?: string) => {
    const newUser: User = {
      id: userId || `usr_${Date.now()}`,
      name,
      email,
      role,
      streak: 1,
      lessonsCompleted: 0,
      practiceSessions: 0,
      avgAccuracy: 0,
    };
    setCurrentUser(newUser);
    sessionStorage.setItem('asl_user_session', JSON.stringify(newUser));
    setActiveTab('Dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('asl_user_session');
    setSelectedLessonFromNav(null);
    setSelectedPracticeStep(null);
    setAuthScreen('login');
  };

  const handleUpdateProfile = (updates: Partial<User>) => {
    if (currentUser) {
      const updated = { ...currentUser, ...updates };
      setCurrentUser(updated);
      sessionStorage.setItem('asl_user_session', JSON.stringify(updated));
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
        if (currentUser.role === 'Admin') return <AdminDashboard />;
        if (currentUser.role === 'Instructor') return <InstructorDashboard />;
        if (currentUser.role === 'Accessibility Trainer') return <AccessibilityTrainerDashboard />;
        return <DashboardView user={currentUser} lessons={lessons} onNavigate={handleNavigate} />;
        
      case 'Users':
        if (currentUser.role === 'Admin') return <AdminUsersView />;
        return <DashboardView user={currentUser} lessons={lessons} onNavigate={handleNavigate} />;
        
      case 'Lessons':
        if (currentUser.role === 'Admin') return <AdminLessonsView lessons={lessons} onLessonCreated={() => {}} />;
        if (currentUser.role === 'Instructor') return <InstructorLessonsView lessons={lessons} />;
        return <LessonsView lessons={lessons} onNavigate={handleNavigate} selectedLessonFromNav={selectedLessonFromNav} />;
        
      case 'Practice':
        if (currentUser.role === 'Admin') return <AdminDashboard />;
        if (currentUser.role === 'Accessibility Trainer') return <AccessibilityTrainerPracticeView />;
        return <PracticeView initialTargetStep={selectedPracticeStep} onNavigate={handleNavigate} />;
        
      case 'Reports':
        if (currentUser.role === 'Admin') return <AdminReportsView />;
        if (currentUser.role === 'Accessibility Trainer') return <AccessibilityTrainerReportsView />;
        return <ReportsView />;
      
      case 'Certification':
        if (currentUser.role === 'Admin') return <AdminDashboard />;
        return <CertificationView />;
        
      case 'Reports':
        if (currentUser.role === 'Admin' || currentUser.role === 'Accessibility Trainer') return <AdminDashboard />;
        if (currentUser.role === 'Instructor') return <InstructorReportsView />;
        return <ReportsView />;
        
      case 'Leaderboard':
        if (currentUser.role === 'Admin' || currentUser.role === 'Accessibility Trainer') return <AdminDashboard />;
        if (currentUser.role === 'Instructor') return <InstructorLeaderboardView />;
        return <LeaderboardView />;
        
      case 'Profile':
        if (currentUser.role === 'Admin') return <AdminProfileView user={currentUser} onLogout={handleLogout} />;
        if (currentUser.role === 'Accessibility Trainer') return <AccessibilityTrainerProfileView user={currentUser} onUpdateProfile={handleUpdateProfile} />;
        if (currentUser.role === 'Instructor') return <InstructorProfileView user={currentUser} onUpdateProfile={handleUpdateProfile} />;
        return <ProfileView user={currentUser} onUpdateProfile={handleUpdateProfile} />;
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
