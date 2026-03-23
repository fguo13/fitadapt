import { LoginPage, ProfilePage } from './pages';
import { useNavigation } from './hooks/useNavigation';

export default function App() {
  const { page, navigate, goBack } = useNavigation('login');

  if (page === 'login')   return <LoginPage onLogin={() => navigate('profile')} />;
  if (page === 'profile') return <ProfilePage onBack={goBack} />;

  return null;
}
