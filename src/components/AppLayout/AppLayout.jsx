import { useState, useEffect } from 'react';
import { Logo } from '../index';
import TopBar from '../TopBar';
import { useTheme } from '../../contexts/ThemeContext';
import { api } from '../../services/api';
import styles from './AppLayout.module.scss';

function DashboardIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor" aria-hidden="true">
      <rect x="0" y="0" width="6" height="6" rx="1.5" />
      <rect x="8" y="0" width="6" height="6" rx="1.5" />
      <rect x="0" y="8" width="6" height="6" rx="1.5" />
      <rect x="8" y="8" width="6" height="6" rx="1.5" />
    </svg>
  );
}

function DumbbellNavIcon() {
  return (
    <svg viewBox="0 0 22 14" width="16" height="10" fill="currentColor" aria-hidden="true">
      <rect x="0" y="2" width="3" height="10" rx="1.5" />
      <rect x="3" y="4.5" width="2" height="5" />
      <rect x="5" y="6" width="12" height="2" rx="1" />
      <rect x="17" y="4.5" width="2" height="5" />
      <rect x="19" y="2" width="3" height="10" rx="1.5" />
    </svg>
  );
}

function PersonIcon() {
  return (
    <svg width="13" height="14" viewBox="0 0 13 14" fill="currentColor" aria-hidden="true">
      <circle cx="6.5" cy="4" r="3" />
      <path d="M0.5 13c0-3.314 2.686-6 6-6s6 2.686 6 6" />
    </svg>
  );
}

function GearIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="2" />
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06" />
    </svg>
  );
}

function QuestionIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="7" cy="7" r="6" />
      <path d="M5.2 5.2a1.8 1.8 0 0 1 3.4.6c0 1.2-1.8 1.8-1.8 1.8" />
      <circle cx="7" cy="10" r="0.5" fill="currentColor" />
    </svg>
  );
}

const NAV = [
  { key: 'dashboard',    label: 'Dashboard', Icon: DashboardIcon },
  { key: 'workouts',     label: 'Workouts',  Icon: DumbbellNavIcon },
  { key: 'profile-view', label: 'Profile',   Icon: PersonIcon },
  { key: 'settings',     label: 'Settings',  Icon: GearIcon },
];

function HelpOverlay({ onClose }) {
  return (
    <div className={styles.helpBackdrop} onClick={onClose}>
      <div className={styles.helpPanel} onClick={(e) => e.stopPropagation()}>
        <div className={styles.helpHeader}>
          <span className={styles.helpTitle}>Help</span>
          <button className={styles.helpClose} onClick={onClose} type="button">✕</button>
        </div>
        <div className={styles.helpBody}>
          <div className={styles.helpSection}>
            <span className={styles.helpLabel}>WHAT IS FITADAPT?</span>
            <p>FitAdapt uses an adaptive algorithm (BKT) to personalise every workout based on how you performed in the last session. The harder you push, the more challenging your next session becomes.</p>
          </div>
          <div className={styles.helpSection}>
            <span className={styles.helpLabel}>HOW WORKOUTS ADAPT</span>
            <p>After each session you rate your effort and performance. FitAdapt adjusts exercise difficulty, rep targets, and muscle emphasis for your next workout automatically.</p>
          </div>
          <div className={styles.helpSection}>
            <span className={styles.helpLabel}>GIVING FEEDBACK</span>
            <p>Always submit feedback after a workout — it's the signal the algorithm uses to adapt. Skipping feedback means your next workout won't improve.</p>
          </div>
          <div className={styles.helpSection}>
            <span className={styles.helpLabel}>NAVIGATION</span>
            <ul>
              <li><strong>Dashboard</strong> — generate a new workout and view stats</li>
              <li><strong>Workouts</strong> — your full session history</li>
              <li><strong>Profile</strong> — view and edit your training profile</li>
              <li><strong>Settings</strong> — theme and colour preferences</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ page, onNavigate, children }) {
  const { theme, toggleTheme } = useTheme();
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [helpOpen, setHelpOpen] = useState(false);

  useEffect(() => {
    api.workouts.list(0, 3)
      .then((r) => setRecentWorkouts(r.content ?? []))
      .catch(() => {});
  }, []);

  return (
    <div className={styles.shell}>
      {helpOpen && <HelpOverlay onClose={() => setHelpOpen(false)} />}

      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <div className={styles.logoWrap}>
            <Logo />
          </div>

          <nav className={styles.nav}>
            {NAV.map(({ key, label, Icon }) => (
              <button
                key={key}
                className={`${styles.navItem} ${page === key ? styles.navItemActive : ''}`}
                onClick={() => onNavigate(key)}
                type="button"
              >
                <span className={styles.navIcon}><Icon /></span>
                {label}
              </button>
            ))}
          </nav>

          {/* Recent workouts */}
          {recentWorkouts.length > 0 && (
            <div className={styles.recentSection}>
              <span className={styles.recentLabel}>RECENT</span>
              <div className={styles.recentList}>
                {recentWorkouts.map((w) => (
                  <div key={w.id} className={styles.recentRow}>
                    <span className={styles.recentDate}>
                      {new Date(w.generatedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className={`${styles.recentStatus} ${styles[`rs${w.status}`]}`}>
                      {w.status === 'COMPLETED' ? '✓' : w.status === 'IN_PROGRESS' ? '…' : '–'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className={styles.sidebarBottom}>
          <button
            className={styles.themeToggle}
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            type="button"
          >
            <span className={styles.themeIcon}>{theme === 'dark' ? '◑' : '◐'}</span>
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>
          <div className={styles.bottomIcons}>
            <button
              className={styles.iconBtn}
              onClick={() => onNavigate('settings')}
              title="Settings"
              type="button"
            >
              <GearIcon size={15} />
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setHelpOpen(true)}
              title="Help"
              type="button"
            >
              <QuestionIcon />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.contentWrapper}>
        <TopBar onNavigate={onNavigate} />
        <main className={styles.content}>
          {children}
        </main>
      </div>
    </div>
  );
}
