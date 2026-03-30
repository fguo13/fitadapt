import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './ProfileViewPage.module.scss';

const GOAL_LABEL = {
  MUSCLE_GAIN: 'Muscle Gain', WEIGHT_LOSS: 'Fat Loss',
  ENDURANCE: 'Endurance', GENERAL_FITNESS: 'General Fitness',
};
const EQUIPMENT_LABEL = {
  DUMBBELLS: 'Dumbbells', BODYWEIGHT: 'Bodyweight', BARBELL: 'Barbell',
  RESISTANCE_BANDS: 'Resistance Bands', PULL_UP_BAR: 'Pull-up Bar',
  BENCH: 'Bench', CABLE_MACHINE: 'Cable Machine', KETTLEBELL: 'Kettlebell',
};
const MUSCLE_LABEL = {
  CHEST: 'Chest', BACK: 'Back', SHOULDERS: 'Shoulders', BICEPS: 'Biceps',
  TRICEPS: 'Triceps', LEGS: 'Legs', CORE: 'Core', GLUTES: 'Glutes',
};

export default function ProfileViewPage({ onEdit }) {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.users.me(), api.users.skills()])
      .then(([p, s]) => { setProfile(p); setSkills(s); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading profile...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={styles.page}>
        <div className={styles.empty}>
          <p className={styles.emptyText}>No profile yet.</p>
          <button className={styles.btnEdit} onClick={onEdit} type="button">
            Set up profile →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <div className={styles.tag}>
            <span className={styles.dot} />
            YOUR PROFILE
          </div>
          <h1 className={styles.heading}>
            {profile.name}
          </h1>
          <p className={styles.email}>{profile.email}</p>
        </div>
        <button className={styles.btnEdit} onClick={onEdit} type="button">
          Edit profile →
        </button>
      </div>

      {/* Stats row */}
      {(profile.age || profile.bodyWeightKg || profile.heightCm) && (
        <div className={styles.statsRow}>
          {profile.age && (
            <div className={styles.statCard}>
              <span className={styles.statValue}>{profile.age}</span>
              <span className={styles.statLabel}>AGE</span>
            </div>
          )}
          {profile.bodyWeightKg && (
            <div className={styles.statCard}>
              <span className={styles.statValue}>{profile.bodyWeightKg}<span className={styles.statUnit}>kg</span></span>
              <span className={styles.statLabel}>WEIGHT</span>
            </div>
          )}
          {profile.heightCm && (
            <div className={styles.statCard}>
              <span className={styles.statValue}>{profile.heightCm}<span className={styles.statUnit}>cm</span></span>
              <span className={styles.statLabel}>HEIGHT</span>
            </div>
          )}
          {profile.gender && (
            <div className={styles.statCard}>
              <span className={styles.statValue}>{profile.gender.charAt(0) + profile.gender.slice(1).toLowerCase()}</span>
              <span className={styles.statLabel}>GENDER</span>
            </div>
          )}
        </div>
      )}

      <div className={styles.grid}>
        {/* Goal + Equipment */}
        <div className={styles.card}>
          <span className={styles.cardLabel}>TRAINING GOAL</span>
          {profile.goal ? (
            <span className={styles.goalBadge}>
              {GOAL_LABEL[profile.goal] || profile.goal}
            </span>
          ) : (
            <span className={styles.emptyVal}>—</span>
          )}
        </div>

        <div className={styles.card}>
          <span className={styles.cardLabel}>FITNESS LEVEL</span>
          <span className={styles.goalBadge}>
            {profile.fitnessLevel
              ? profile.fitnessLevel.charAt(0) + profile.fitnessLevel.slice(1).toLowerCase()
              : '—'}
          </span>
        </div>

        {profile.availableEquipment?.length > 0 && (
          <div className={`${styles.card} ${styles.cardWide}`}>
            <span className={styles.cardLabel}>EQUIPMENT</span>
            <div className={styles.chips}>
              {profile.availableEquipment.map((e) => (
                <span key={e} className={styles.chip}>
                  {EQUIPMENT_LABEL[e] || e}
                </span>
              ))}
            </div>
          </div>
        )}

        {profile.injuryHistory && (
          <div className={`${styles.card} ${styles.cardWide}`}>
            <span className={styles.cardLabel}>INJURY HISTORY</span>
            <p className={styles.injuryText}>{profile.injuryHistory}</p>
          </div>
        )}
      </div>

      {/* Skills */}
      {skills.length > 0 && (
        <div className={styles.skillsSection}>
          <span className={styles.sectionLabel}>SKILL STATES</span>
          <div className={styles.skillsGrid}>
            {skills.map((s) => (
              <div key={`${s.muscleGroup}-${s.difficultyLevel}`} className={styles.skillCard}>
                <div className={styles.skillHeader}>
                  <span className={styles.skillMuscle}>
                    {MUSCLE_LABEL[s.muscleGroup] || s.muscleGroup}
                  </span>
                  <span className={styles.skillLevel}>{s.difficultyLevel}</span>
                </div>
                <div className={styles.skillBar}>
                  <div
                    className={styles.skillFill}
                    style={{ width: `${s.masteryPercent}%` }}
                  />
                </div>
                <div className={styles.skillFooter}>
                  <span className={`${styles.skillStatus} ${styles[`status${s.status}`]}`}>
                    {s.status}
                  </span>
                  <span className={styles.skillPct}>{s.masteryPercent}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
