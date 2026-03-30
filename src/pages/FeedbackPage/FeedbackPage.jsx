import { useState } from 'react';
import { Logo, ProgressBar } from '../../components';
import { getTimeRecoveryNote } from '../../utils/timeContext';
import styles from './FeedbackPage.module.scss';

export default function FeedbackPage({ onSubmit, onSkip, insight }) {
  const [difficulty, setDifficulty] = useState(5);
  const [fatigue, setFatigue] = useState(5);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await onSubmit({
      perceivedDifficulty: difficulty,
      fatigueLevel: fatigue,
      notes: notes || undefined,
    });
    setLoading(false);
  };

  if (insight) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <Logo />
        </header>
        <main className={styles.content}>
          <div className={styles.tag}>
            <span className={styles.dot} />
            ALGORITHM UPDATED
          </div>
          <h1 className={styles.heading}>
            MODEL<br /><span className={styles.accent}>UPDATED.</span>
          </h1>
          <div className={styles.insightCard}>
            <span className={styles.insightLabel}>COACHING INSIGHT</span>
            <p className={styles.insightText}>{insight}</p>
          </div>
          <p className={styles.insightMeta}>
            Your skill model has been updated from today's session. Your next workout will be automatically calibrated to reflect your performance.
          </p>
          {getTimeRecoveryNote() && (
            <p className={styles.timeNote}>{getTimeRecoveryNote()}</p>
          )}
        </main>
        <footer className={styles.footer}>
          <div />
          <button className={styles.btnSubmit} onClick={onSkip} type="button">
            TO DASHBOARD →
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <ProgressBar current={2} total={2} />

      <header className={styles.header}>
        <Logo />
        <button className={styles.btnSkip} onClick={onSkip} type="button">
          SKIP
        </button>
      </header>

      <main className={styles.content}>
        <div className={styles.tag}>
          <span className={styles.dot} />
          SESSION COMPLETE
        </div>

        <h1 className={styles.heading}>
          HOW DID<br />
          <span className={styles.accent}>IT GO?</span>
        </h1>

        <div className={styles.fieldGroup}>
          <div className={styles.sliderHeader}>
            <span className={styles.label}>PERCEIVED DIFFICULTY</span>
            <span className={styles.sliderValue}>{difficulty} / 10</span>
          </div>
          <input
            className={styles.slider}
            type="range"
            min="1"
            max="10"
            value={difficulty}
            onChange={(e) => setDifficulty(Number(e.target.value))}
          />
          <div className={styles.sliderTicks}>
            <span>EASY</span>
            <span>HARD</span>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.sliderHeader}>
            <span className={styles.label}>FATIGUE LEVEL</span>
            <span className={styles.sliderValue}>{fatigue} / 10</span>
          </div>
          <input
            className={styles.slider}
            type="range"
            min="1"
            max="10"
            value={fatigue}
            onChange={(e) => setFatigue(Number(e.target.value))}
          />
          <div className={styles.sliderTicks}>
            <span>FRESH</span>
            <span>SPENT</span>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>NOTES (OPTIONAL)</span>
          <textarea
            className={styles.textarea}
            placeholder="How did it feel? Any issues?"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <button className={styles.btnBack} onClick={onSkip} type="button">
          ← BACK
        </button>
        <button
          className={styles.btnSubmit}
          onClick={handleSubmit}
          disabled={loading}
          type="button"
        >
          {loading ? 'SAVING...' : 'SUBMIT →'}
        </button>
      </footer>
    </div>
  );
}
