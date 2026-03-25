import { useEffect, useState } from 'react';
import { Logo, StatCard } from '../../components';
import { userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import styles from './DashboardPage.module.scss';

const GOAL_LABELS = {
  MUSCLE_GAIN:     'Muscle Gain',
  WEIGHT_LOSS:     'Weight Loss',
  ENDURANCE:       'Endurance',
  GENERAL_FITNESS: 'General Fitness',
};

const ACCENT_SHADES = ['#c8f135', '#9dbf26', '#7a9a1e', '#586f15', '#3d4f0f', '#c8f13566', '#9dbf2666', '#7a9a1e66'];

export default function DashboardPage({ onStartWorkout, onLogout }) {
  const { user, logout } = useAuth();
  const [stats, setStats]         = useState(null);
  const [loadingStats, setLoading] = useState(true);

  useEffect(() => {
    userApi.getStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const handleLogout = () => { logout(); onLogout(); };

  const muscleEntries = stats ? Object.entries(stats.muscleGroupDistribution || {}) : [];
  const maxMuscle     = muscleEntries.length ? Math.max(...muscleEntries.map(([, v]) => v)) : 1;
  const weeklyData    = stats?.sessionsLast4Weeks || [];
  const weeklyMax     = weeklyData.length ? Math.max(...weeklyData.map((w) => w.count), 1) : 1;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <Logo />
        <div className={styles.headerRight}>
          {user?.goal && (
            <span className={styles.goalBadge}>{GOAL_LABELS[user.goal] || user.goal}</span>
          )}
          <button className={styles.btnLogout} onClick={handleLogout} type="button">
            SIGN OUT
          </button>
        </div>
      </header>

      <main className={styles.content}>
        {/* Greeting */}
        <div className={styles.greeting}>
          <div className={styles.tag}>
            <span className={styles.dot} />
            // DASHBOARD
          </div>
          <h1 className={styles.heading}>
            HEY,{' '}
            <span className={styles.accent}>
              {user?.name?.toUpperCase() || 'ATHLETE'}.
            </span>
          </h1>
        </div>

        {/* Stat cards */}
        <div className={styles.statsGrid}>
          <StatCard label="Sessions Completed" value={stats?.totalSessionsCompleted} />
          <StatCard label="Total Volume"        value={stats?.totalVolumeKg?.toLocaleString()} unit="kg" />
          <StatCard label="Sets Logged"         value={stats?.totalSetsLogged} />
          <StatCard label="Current Streak"      value={stats?.currentStreakWeeks} unit="wks" />
        </div>

        {/* Charts */}
        <div className={styles.chartsRow}>
          {/* Weekly sessions */}
          <div className={styles.chartCard}>
            <span className={styles.chartLabel}>SESSIONS — LAST 4 WEEKS</span>
            {loadingStats ? (
              <div className={styles.skeleton} />
            ) : weeklyData.length === 0 ? (
              <p className={styles.empty}>No sessions logged yet.</p>
            ) : (
              <div className={styles.barChart}>
                {weeklyData.map((w) => (
                  <div key={w.weekLabel} className={styles.barGroup}>
                    <div
                      className={styles.bar}
                      style={{ height: `${(w.count / weeklyMax) * 100}%` }}
                    />
                    <span className={styles.barLabel}>
                      {w.weekLabel.includes('-W')
                        ? `W${w.weekLabel.split('-W')[1]}`
                        : w.weekLabel}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Muscle distribution */}
          <div className={styles.chartCard}>
            <span className={styles.chartLabel}>MUSCLE GROUP DISTRIBUTION</span>
            {loadingStats ? (
              <div className={styles.skeleton} />
            ) : muscleEntries.length === 0 ? (
              <p className={styles.empty}>No data yet — complete a session first.</p>
            ) : (
              <div className={styles.muscleList}>
                {muscleEntries.map(([muscle, count], i) => (
                  <div key={muscle} className={styles.muscleRow}>
                    <span className={styles.muscleName}>{muscle}</span>
                    <div className={styles.muscleTrack}>
                      <div
                        className={styles.muscleFill}
                        style={{
                          width: `${(count / maxMuscle) * 100}%`,
                          backgroundColor: ACCENT_SHADES[i % ACCENT_SHADES.length],
                        }}
                      />
                    </div>
                    <span className={styles.muscleCount}>{count}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        <button className={styles.btnStart} onClick={onStartWorkout} type="button">
          START WORKOUT →
        </button>
      </main>
    </div>
  );
}
