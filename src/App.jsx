import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { api } from './services/api';
import { AppLayout } from './components';
import {
  LoginPage, ProfilePage,
  RegisterPage, DashboardPage, WorkoutPage, FeedbackPage,
  ProfileViewPage, ProfileEditPage, WorkoutsPage, SettingsPage,
} from './pages';

const GOAL_MAP = {
  'Muscle Gain':     'MUSCLE_GAIN',
  'Fat Loss':        'WEIGHT_LOSS',
  'Endurance':       'ENDURANCE',
  'General Fitness': 'GENERAL_FITNESS',
};
const GENDER_MAP = { Male: 'MALE', Female: 'FEMALE', Other: 'OTHER' };
const EQUIPMENT_MAP = {
  Dumbbells:          'DUMBBELLS',
  Bodyweight:         'BODYWEIGHT',
  Barbell:            'BARBELL',
  'Resistance Bands': 'RESISTANCE_BANDS',
  'Cable Machine':    'CABLE_MACHINE',
  'Pull-up Bar':      'PULL_UP_BAR',
  Bench:              'BENCH',
  Kettlebell:         'KETTLEBELL',
};

const LAYOUT_PAGES = ['dashboard', 'workouts', 'profile-view', 'profile-edit', 'settings'];

export default function App() {
  const { isAuthenticated, signIn } = useAuth();
  const [page, setPage] = useState(isAuthenticated ? 'dashboard' : 'login');
  const [activeWorkout, setActiveWorkout] = useState(null);

  const navigate = (p) => setPage(p);

  // ─── Auth handlers ──────────────────────────────────────────────────────
  const handleLogin = async (email, password) => {
    try {
      signIn(await api.auth.login(email, password));
      navigate('dashboard');
    } catch (e) {
      alert(`Login failed: ${e.message}`);
    }
  };

  const handleRegister = async (name, email, password) => {
    try {
      signIn(await api.auth.register(email, password, name));
      navigate('profile-edit');
    } catch (e) {
      alert(`Registration failed: ${e.message}`);
    }
  };

  const handleOnboarding = async ({ age, weight, height, gender, goal, equipment, injury }) => {
    try {
      await api.users.onboarding({
        age: parseInt(age, 10),
        bodyWeightKg: parseInt(weight, 10),
        heightCm: parseInt(height, 10),
        gender: GENDER_MAP[gender] ?? 'OTHER',
        goal: GOAL_MAP[goal] ?? 'GENERAL_FITNESS',
        availableEquipment: equipment.map((e) => EQUIPMENT_MAP[e]).filter(Boolean),
        injuryHistory: injury || undefined,
        fitnessLevel: 'BEGINNER',
      });
      navigate('dashboard');
    } catch (e) {
      alert(`Profile save failed: ${e.message}`);
    }
  };

  // ─── Workout handlers ───────────────────────────────────────────────────
  const handleWorkoutGenerated = (workout) => {
    setActiveWorkout(workout);
    navigate('workout');
  };

  const handleWorkoutComplete = async (entries) => {
    try {
      await api.workouts.log(activeWorkout.id, entries);
      navigate('feedback');
    } catch (e) {
      alert(`Could not save workout: ${e.message}`);
    }
  };

  const handleFeedbackSubmit = async (feedbackData) => {
    try {
      await api.workouts.feedback(activeWorkout.id, feedbackData);
      setActiveWorkout(null);
      navigate('dashboard');
    } catch (e) {
      alert(`Could not save feedback: ${e.message}`);
    }
  };

  // ─── Unauthenticated ────────────────────────────────────────────────────
  if (!isAuthenticated) {
    if (page === 'register') {
      return <RegisterPage onRegister={handleRegister} onBack={() => navigate('login')} />;
    }
    return <LoginPage onLogin={handleLogin} onRegister={() => navigate('register')} />;
  }

  // ─── Legacy onboarding page (kept for fallback) ─────────────────────────
  if (page === 'profile') {
    return (
      <ProfilePage
        onBack={() => navigate('dashboard')}
        onNext={handleOnboarding}
      />
    );
  }

  // ─── Active workout (standalone focus UI) ──────────────────────────────
  if (page === 'workout') {
    return (
      <WorkoutPage
        workout={activeWorkout}
        onComplete={handleWorkoutComplete}
        onBack={() => navigate('dashboard')}
      />
    );
  }

  if (page === 'feedback') {
    return (
      <FeedbackPage
        onSubmit={handleFeedbackSubmit}
        onSkip={() => { setActiveWorkout(null); navigate('dashboard'); }}
      />
    );
  }

  // ─── Main app with sidebar + topbar ────────────────────────────────────
  const activePage = LAYOUT_PAGES.includes(page) ? page : 'dashboard';

  return (
    <AppLayout page={activePage} onNavigate={navigate}>
      {activePage === 'workouts'      && <WorkoutsPage />}
      {activePage === 'settings'      && <SettingsPage />}
      {activePage === 'profile-view'  && <ProfileViewPage onEdit={() => navigate('profile-edit')} />}
      {activePage === 'profile-edit'  && (
        <ProfileEditPage
          onSave={() => navigate('profile-view')}
          onBack={() => navigate('profile-view')}
        />
      )}
      {activePage === 'dashboard'     && <DashboardPage onWorkoutGenerated={handleWorkoutGenerated} />}
    </AppLayout>
  );
}
