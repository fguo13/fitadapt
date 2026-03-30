import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import styles from './DashboardPage.module.scss';

const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', LEGS: 'Legs',
  CORE: 'Core', GLUTES: 'Glutes',
};

const GOAL_INFO = {
  MUSCLE_GAIN:      { tag: 'STRENGTH FOCUS',   hint: 'Compound lifts with progressive overload — push for new PRs.' },
  WEIGHT_LOSS:      { tag: 'FAT LOSS FOCUS',    hint: 'Higher reps, shorter rest — keeps heart rate elevated and burns more.' },
  ENDURANCE:        { tag: 'ENDURANCE FOCUS',   hint: 'Circuit-style training with cardio intervals to build your engine.' },
  GENERAL_FITNESS:  { tag: 'ADAPTIVE TRAINING', hint: 'Balanced full-body sessions designed around your current level.' },
};

const STREAK_MSG = (weeks) => {
  if (weeks === 0) return "Let's get started — your first session awaits.";
  if (weeks <= 2)  return 'Great start — the habit is forming!';
  if (weeks <= 5)  return 'You\'re building real momentum. Keep it up.';
  if (weeks <= 10) return 'Consistent and improving. The algorithm is working.';
  return 'Elite consistency. Your body is adapting every week.';
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage({ onWorkoutGenerated }) {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.users.stats().then(setStats).catch(() => {});
    api.users.me().then(setProfile).catch(() => {});
    api.workouts.list(0, 3).then((r) => setRecentWorkouts(r.content ?? [])).catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError('');
    try {
      const workout = await api.workouts.generate();
      onWorkoutGenerated(workout);
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const firstName = user?.name?.split(' ')[0] ?? 'there';
  const goalInfo = GOAL_INFO[profile?.goal] ?? GOAL_INFO.GENERAL_FITNESS;
  const streakWeeks = stats?.currentStreakWeeks ?? 0;
  const completedSessions = stats?.totalSessionsCompleted ?? 0;

  return (
    <div className={styles.page}>
      {/* Greeting */}
      <div className={styles.greeting}>
        <div className={styles.tag}>
          <span className={styles.dot} />
          {goalInfo.tag}
        </div>
        <h1 className={styles.heading}>
          {getGreeting()}, <span className={styles.accent}>{firstName}.</span>
        </h1>
        <p className={styles.sub}>{STREAK_MSG(streakWeeks)}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{completedSessions}</span>
            <span className={styles.statLabel}>Sessions</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{stats.totalSetsLogged}</span>
            <span className={styles.statLabel}>Sets logged</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{Math.round(stats.totalVolumeKg).toLocaleString()}</span>
            <span className={styles.statLabel}>Total kg</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{streakWeeks}</span>
            <span className={styles.statLabel}>Week streak</span>
          </div>
        </div>
      )}

      {/* Workout focus card */}
      {profile?.goal && (
        <div className={styles.focusCard}>
          <div className={styles.focusLeft}>
            <span className={styles.focusLabel}>YOUR NEXT WORKOUT</span>
            <p className={styles.focusHint}>{goalInfo.hint}</p>
          </div>
          <div className={styles.focusRight}>
            {error && <p className={styles.error}>{error}</p>}
            <button
              className={styles.btnGenerate}
              onClick={handleGenerate}
              disabled={generating}
              type="button"
            >
              {generating ? 'Generating…' : 'Generate →'}
            </button>
          </div>
        </div>
      )}

      {/* CTA for users without a profile goal yet */}
      {!profile?.goal && (
        <>
          {error && <p className={styles.error}>{error}</p>}
          <button
            className={styles.btnGenerateStandalone}
            onClick={handleGenerate}
            disabled={generating}
            type="button"
          >
            {generating ? 'Generating…' : 'Generate workout →'}
          </button>
        </>
      )}

      {/* Muscle distribution */}
      {stats?.muscleGroupDistribution && Object.keys(stats.muscleGroupDistribution).length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>MUSCLE DISTRIBUTION</span>
          <div className={styles.muscleList}>
            {Object.entries(stats.muscleGroupDistribution)
              .sort(([, a], [, b]) => b - a)
              .map(([group, pct]) => (
                <div key={group} className={styles.muscleRow}>
                  <span className={styles.muscleName}>{MUSCLE_LABEL[group] || group}</span>
                  <div className={styles.muscleBar}>
                    <div className={styles.muscleFill} style={{ width: `${pct}%` }} />
                  </div>
                  <span className={styles.musclePct}>{pct}%</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent workouts */}
      {recentWorkouts.length > 0 && (
        <div className={styles.section}>
          <span className={styles.sectionLabel}>RECENT SESSIONS</span>
          <div className={styles.workoutList}>
            {recentWorkouts.map((w) => (
              <div key={w.id} className={styles.workoutRow}>
                <span className={styles.workoutDate}>
                  {new Date(w.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                </span>
                <span className={styles.workoutExCount}>{w.exercises?.length ?? 0} exercises</span>
                <span className={`${styles.workoutStatus} ${styles[`status${w.status}`]}`}>
                  {w.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state for new users */}
      {completedSessions === 0 && !generating && (
        <div className={styles.emptyState}>
          <span className={styles.sectionLabel}>HOW IT WORKS</span>
          <div className={styles.howGrid}>
            {[
              { n: '01', title: 'Generate', body: 'The algorithm builds a workout tailored to your goal, fitness level, and available equipment.' },
              { n: '02', title: 'Train', body: 'Complete each exercise and log your actual reps and weight as you go.' },
              { n: '03', title: 'Adapt', body: 'Rate your session after. FitAdapt adjusts difficulty for your next workout automatically.' },
            ].map(({ n, title, body }) => (
              <div key={n} className={styles.howCard}>
                <span className={styles.howNum}>{n}</span>
                <span className={styles.howTitle}>{title}</span>
                <p className={styles.howBody}>{body}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
