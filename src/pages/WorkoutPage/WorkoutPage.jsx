import { useState } from 'react';
import { Logo, ProgressBar } from '../../components';
import styles from './WorkoutPage.module.scss';

const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders',
  BICEPS: 'Biceps', TRICEPS: 'Triceps', LEGS: 'Legs',
  CORE: 'Core', GLUTES: 'Glutes',
};

export default function WorkoutPage({ workout, onComplete, onBack }) {
  const [logs, setLogs] = useState({});
  const [loading, setLoading] = useState(false);

  if (!workout) return null;

  const exercises = workout.exercises ?? [];

  const updateLog = (exerciseId, field, value) => {
    setLogs((prev) => ({
      ...prev,
      [exerciseId]: { ...prev[exerciseId], [field]: value },
    }));
  };

  const handleComplete = async () => {
    setLoading(true);
    const entries = exercises.map((ex) => ({
      exerciseId: ex.exerciseId,
      sets: parseInt(logs[ex.exerciseId]?.sets ?? ex.prescribedSets),
      reps: parseInt(logs[ex.exerciseId]?.reps ?? ex.prescribedReps),
      ...(logs[ex.exerciseId]?.weight
        ? { weight: parseFloat(logs[ex.exerciseId].weight) }
        : ex.suggestedWeight != null
          ? { weight: ex.suggestedWeight }
          : {}),
    }));
    await onComplete(entries);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <ProgressBar current={1} total={2} />

      <header className={styles.header}>
        <Logo />
        <div className={styles.headerRight}>
          {workout.deload && (
            <span className={styles.deloadBadge}>DELOAD WEEK</span>
          )}
          <span className={styles.exerciseCount}>
            {exercises.length} EXERCISES
          </span>
        </div>
      </header>

      <main className={styles.content}>
        <div className={styles.tag}>
          <span className={styles.dot} />
          TODAY'S SESSION
        </div>

        <h1 className={styles.heading}>
          YOUR <span className={styles.accent}>WORKOUT.</span>
        </h1>

        <div className={styles.exerciseList}>
          {exercises.map((ex, i) => (
            <div key={ex.workoutExerciseId} className={styles.exerciseCard}>
              <div className={styles.exerciseHeader}>
                <div className={styles.exerciseIndex}>
                  {String(i + 1).padStart(2, '0')}
                </div>
                <div className={styles.exerciseMeta}>
                  <span className={styles.exerciseName}>{ex.exerciseName}</span>
                  <span className={styles.exerciseDetail}>
                    {MUSCLE_LABEL[ex.muscleGroup] || ex.muscleGroup}
                    {' · '}
                    {ex.difficulty}
                  </span>
                </div>
              </div>

              <div className={styles.prescribed}>
                <span className={styles.prescribedLabel}>PRESCRIBED</span>
                <span className={styles.prescribedValue}>
                  {ex.prescribedSets} × {ex.prescribedReps}
                  {ex.suggestedWeight != null ? ` @ ${ex.suggestedWeight}kg` : ''}
                </span>
              </div>

              <div className={styles.logRow}>
                <div className={styles.logField}>
                  <label className={styles.logLabel}>SETS</label>
                  <input
                    className={styles.logInput}
                    type="number"
                    min="1"
                    placeholder={String(ex.prescribedSets)}
                    value={logs[ex.exerciseId]?.sets ?? ''}
                    onChange={(e) => updateLog(ex.exerciseId, 'sets', e.target.value)}
                  />
                </div>
                <div className={styles.logField}>
                  <label className={styles.logLabel}>REPS</label>
                  <input
                    className={styles.logInput}
                    type="number"
                    min="1"
                    placeholder={String(ex.prescribedReps)}
                    value={logs[ex.exerciseId]?.reps ?? ''}
                    onChange={(e) => updateLog(ex.exerciseId, 'reps', e.target.value)}
                  />
                </div>
                <div className={styles.logField}>
                  <label className={styles.logLabel}>KG</label>
                  <input
                    className={styles.logInput}
                    type="number"
                    min="0"
                    step="0.5"
                    placeholder={ex.suggestedWeight != null ? String(ex.suggestedWeight) : '—'}
                    value={logs[ex.exerciseId]?.weight ?? ''}
                    onChange={(e) => updateLog(ex.exerciseId, 'weight', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className={styles.footer}>
        <button className={styles.btnBack} onClick={onBack} type="button">
          ← BACK
        </button>
        <button
          className={styles.btnComplete}
          onClick={handleComplete}
          disabled={loading}
          type="button"
        >
          {loading ? 'SAVING...' : 'COMPLETE →'}
        </button>
      </footer>
    </div>
  );
}
