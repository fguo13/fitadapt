import { useEffect } from 'react';
import { LoginPage, RegisterPage, ProfilePage, DashboardPage } from './pages';
import { useAuth } from './context/AuthContext';
import { useNavigation } from './hooks/useNavigation';

export default function App() {
  const { token, user, loading } = useAuth();
  const { page, navigate } = useNavigation('login');

  // On mount: if token exists, route based on profile completeness
  useEffect(() => {
    if (loading) return;
    if (!token) { navigate('login'); return; }
    if (user)   { navigate(user.goal ? 'dashboard' : 'onboarding'); }
  }, [token, user, loading]);

  // Blank screen while resolving auth state
  if (loading) {
    return <div style={{ minHeight: '100vh', background: '#0d0d0d' }} />;
  }

  if (page === 'login') {
    return (
      <LoginPage
        onLogin={(dest) => navigate(dest)}
        onGoToRegister={() => navigate('register')}
      />
    );
  }

  if (page === 'register') {
    return (
      <RegisterPage
        onRegistered={() => navigate('onboarding')}
        onGoToLogin={() => navigate('login')}
      />
    );
  }

  if (page === 'onboarding') {
    return (
      <ProfilePage
        onComplete={() => navigate('dashboard')}
        onBack={() => navigate('login')}
      />
    );
  }

  if (page === 'dashboard') {
    return (
      <DashboardPage
        onStartWorkout={() => console.log('TODO: workout screen')}
        onLogout={() => navigate('login')}
      />
    );
  }

  return null;
}
