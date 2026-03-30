import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { getBehaviorData } from '../../hooks/useBehavior';
import { getTimeFocusHint } from '../../utils/timeContext';
import styles from './DashboardPage.module.scss';

const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', LEGS: 'Legs',
  CORE: 'Core', GLUTES: 'Glutes',
};

// ── Skill-based UI complexity ─────────────────────────────────────────────────

/**
 * Derives an overall UI complexity level from BKT skill states.
 * Written to localStorage so AppLayout can read it without a second API call.
 *
 * BEGINNER     → no BEGINNER skill mastered yet (all P(L) < 0.85)
 * INTERMEDIATE → at least one BEGINNER skill mastered (receiving INTERMEDIATE exercises)
 * ADVANCED     → at least one INTERMEDIATE skill mastered (receiving ADVANCED exercises)
 */
function computeUILevel(skills) {
  if (!skills || skills.length === 0) return 'BEGINNER';
  const byGroup = {};
  for (const s of skills) {
    if (!byGroup[s.muscleGroup]) byGroup[s.muscleGroup] = {};
    byGroup[s.muscleGroup][s.difficultyLevel] = s.pLearned;
  }
  let hasAdvanced = false;
  let hasIntermediate = false;
  for (const levels of Object.values(byGroup)) {
    if ((levels.INTERMEDIATE ?? 0) >= 0.85) hasAdvanced = true;
    if ((levels.BEGINNER    ?? 0) >= 0.85) hasIntermediate = true;
  }
  if (hasAdvanced)    return 'ADVANCED';
  if (hasIntermediate) return 'INTERMEDIATE';
  return 'BEGINNER';
}

function computeSkillSummary(skills) {
  const byGroup = {};
  for (const s of skills) {
    if (!byGroup[s.muscleGroup]) byGroup[s.muscleGroup] = {};
    byGroup[s.muscleGroup][s.difficultyLevel] = s;
  }
  return Object.entries(byGroup).map(([mg, levels]) => {
    const pBeg = levels.BEGINNER?.pLearned     ?? 0.10;
    const pInt = levels.INTERMEDIATE?.pLearned ?? 0.05;
    let currentLevel, pCurrent;
    if (pInt >= 0.85) {
      currentLevel = 'ADVANCED';
      pCurrent = levels.ADVANCED?.pLearned ?? 0.01;
    } else if (pBeg >= 0.85) {
      currentLevel = 'INTERMEDIATE';
      pCurrent = pInt;
    } else {
      currentLevel = 'BEGINNER';
      pCurrent = pBeg;
    }
    const progress = Math.min(100, Math.round((pCurrent / 0.85) * 100));
    return { mg, currentLevel, progress };
  });
}

// ── Static copy ───────────────────────────────────────────────────────────────

const GOAL_INFO = {
  MUSCLE_GAIN:     { tag: 'STRENGTH FOCUS',   hint: 'Compound lifts with progressive overload — push for new PRs.' },
  WEIGHT_LOSS:     { tag: 'FAT LOSS FOCUS',    hint: 'Higher reps, shorter rest — keeps heart rate elevated and burns more.' },
  ENDURANCE:       { tag: 'ENDURANCE FOCUS',   hint: 'Circuit-style training with cardio intervals to build your engine.' },
  GENERAL_FITNESS: { tag: 'ADAPTIVE TRAINING', hint: 'Balanced full-body sessions designed around your current level.' },
};

const STREAK_MSG = (weeks) => {
  if (weeks === 0) return "Let's get started — your first session awaits.";
  if (weeks <= 2)  return 'Great start — the habit is forming!';
  if (weeks <= 5)  return "You're building real momentum. Keep it up.";
  if (weeks <= 10) return 'Consistent and improving. The algorithm is working.';
  return 'Elite consistency. Your body is adapting every week.';
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function DashboardPage({ onWorkoutGenerated }) {
  const { user } = useAuth();
  const [stats, setStats]               = useState(null);
  const [profile, setProfile]           = useState(null);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [skills, setSkills]             = useState([]);
  const [generating, setGenerating]     = useState(false);
  const [error, setError]               = useState('');

  useEffect(() => {
    api.users.stats().then(setStats).catch(() => {});
    api.users.me().then(setProfile).catch(() => {});
    api.workouts.list(0, 3).then((r) => setRecentWorkouts(r.content ?? [])).catch(() => {});
    api.users.skills().then(setSkills).catch(() => {});
  }, []);

  // ── Skill-based UI level → persist for AppLayout to read ─────────────────
  const uiLevel = computeUILevel(skills);
  useEffect(() => {
    if (skills.length > 0) {
      try { localStorage.setItem('fitadapt_ui_level', uiLevel); } catch { /* quota */ }
    }
  }, [skills, uiLevel]);

  // ── Behavioural pattern detection ─────────────────────────────────────────
  // Surface RECENT SESSIONS higher if the user visits Workouts frequently.
  const behaviorVisits    = getBehaviorData().visits;
  const workoutsVisits    = behaviorVisits['workouts'] ?? 0;
  const prioritiseHistory = workoutsVisits > 3;

  const firstName        = user?.name?.split(' ')[0] ?? 'there';
  const goalInfo         = GOAL_INFO[profile?.goal] ?? GOAL_INFO.GENERAL_FITNESS;
  const streakWeeks      = stats?.currentStreakWeeks ?? 0;
  const completedSessions = stats?.totalSessionsCompleted ?? 0;

  // ── Sections ──────────────────────────────────────────────────────────────

  const recentSection = recentWorkouts.length > 0 && (
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
  );

  const skillModelSection = skills.length > 0 && uiLevel !== 'BEGINNER' && (() => {
    const summary = computeSkillSummary(skills);
    return (
      <div className={styles.section}>
        <span className={styles.sectionLabel}>SKILL MODEL</span>
        {uiLevel === 'ADVANCED' && (
          <p className={styles.skillNote}>
            Mastery threshold is 85%. Skills above this level advance to the next difficulty.
          </p>
        )}
        <div className={styles.skillList}>
          {summary.map(({ mg, currentLevel, progress }) => (
            <div key={mg} className={styles.skillRow}>
              <span className={styles.skillName}>{MUSCLE_LABEL[mg] || mg}</span>
              <div className={styles.muscleBar}>
                <div className={`${styles.muscleFill} ${styles[`fill${currentLevel}`]}`} style={{ width: `${progress}%` }} />
              </div>
              <span className={styles.musclePct}>{progress}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  })();

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

      {/* Stats — simplified label set for beginners */}
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
          {uiLevel !== 'BEGINNER' && (
            <div className={styles.statCard}>
              <span className={styles.statValue}>{Math.round(stats.totalVolumeKg).toLocaleString()}</span>
              <span className={styles.statLabel}>Total kg</span>
            </div>
          )}
          <div className={styles.statCard}>
            <span className={styles.statValue}>{streakWeeks}</span>
            <span className={styles.statLabel}>Week streak</span>
          </div>
        </div>
      )}

      {/* Workout focus card — time-of-day hint appended */}
      {profile?.goal && (
        <div className={styles.focusCard}>
          <div className={styles.focusLeft}>
            <span className={styles.focusLabel}>YOUR NEXT WORKOUT</span>
            <p className={styles.focusHint}>
              {goalInfo.hint}
              {' '}
              <span className={styles.timeHint}>{getTimeFocusHint()}</span>
            </p>
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

      {/* Behavioural reorder: frequent Workouts visitors see history first */}
      {prioritiseHistory && recentSection}

      {/* Skill model — hidden for beginners (too complex, low signal) */}
      {skillModelSection}

      {/* Muscle distribution — intermediate+ only */}
      {uiLevel !== 'BEGINNER' && stats?.muscleGroupDistribution &&
       Object.keys(stats.muscleGroupDistribution).length > 0 && (
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

      {/* Recent sessions — default position (de-prioritised users see it here) */}
      {!prioritiseHistory && recentSection}

      {/* HOW IT WORKS — always visible for beginners, zero-session state for others */}
      {(uiLevel === 'BEGINNER' || completedSessions === 0) && !generating && (
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

  function handleGenerate() {
    setGenerating(true);
    setError('');
    api.workouts.generate()
      .then((workout) => { onWorkoutGenerated(workout); })
      .catch((e) => { setError(e.message); })
      .finally(() => { setGenerating(false); });
  }
}
