import { useState } from 'react';
import { Logo, Chip, FormField, ProgressBar } from '../../components';
import { userApi } from '../../api';
import styles from './ProfilePage.module.scss';

// ─── Enums must match backend exactly ────────────────────────────────────────
const GOALS = [
  { label: 'Muscle Gain',    value: 'MUSCLE_GAIN' },
  { label: 'Weight Loss',    value: 'WEIGHT_LOSS' },
  { label: 'Endurance',      value: 'ENDURANCE' },
  { label: 'General Fitness',value: 'GENERAL_FITNESS' },
];

const EQUIPMENT_OPTIONS = [
  { label: 'Bodyweight',       value: 'BODYWEIGHT' },
  { label: 'Dumbbells',        value: 'DUMBBELLS' },
  { label: 'Barbell',          value: 'BARBELL' },
  { label: 'Resistance Bands', value: 'RESISTANCE_BANDS' },
  { label: 'Pull-up Bar',      value: 'PULL_UP_BAR' },
  { label: 'Bench',            value: 'BENCH' },
  { label: 'Cable Machine',    value: 'CABLE_MACHINE' },
  { label: 'Kettlebell',       value: 'KETTLEBELL' },
];

const FITNESS_LEVELS = [
  { label: 'Beginner',     value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced',     value: 'ADVANCED' },
];

const GENDERS = [
  { label: 'Male',   value: 'MALE' },
  { label: 'Female', value: 'FEMALE' },
  { label: 'Other',  value: 'OTHER' },
];

const TOTAL_SCREENS = 8;
const CURRENT_SCREEN = 3;

export default function ProfilePage({ onComplete, onBack }) {
  const [age, setAge]                 = useState('');
  const [gender, setGender]           = useState('MALE');
  const [bodyWeightKg, setBodyWeight] = useState('');
  const [heightCm, setHeightCm]       = useState('');
  const [fitnessLevel, setFitness]    = useState('BEGINNER');
  const [goal, setGoal]               = useState('MUSCLE_GAIN');
  const [equipment, setEquipment]     = useState([]);
  const [injury, setInjury]           = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(false);

  const toggleEquipment = (value) =>
    setEquipment((prev) =>
      prev.includes(value) ? prev.filter((e) => e !== value) : [...prev, value]
    );

  const handleNumberOnly = (setter) => (e) => {
    if (/^\d*\.?\d*$/.test(e.target.value)) setter(e.target.value);
  };

  const handleSubmit = async () => {
    setError('');
    if (!age || !gender || equipment.length === 0) {
      setError('Please fill in age, gender, and select at least one piece of equipment.');
      return;
    }
    setLoading(true);
    try {
      await userApi.onboarding({
        age: parseInt(age),
        gender,
        goal,
        fitnessLevel,
        availableEquipment: equipment,
        injuryHistory: injury || null,
        ...(bodyWeightKg ? { bodyWeightKg: parseFloat(bodyWeightKg) } : {}),
        ...(heightCm     ? { heightCm:     parseFloat(heightCm) }     : {}),
      });
      onComplete(); // → dashboard
    } catch (err) {
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <ProgressBar current={CURRENT_SCREEN} total={TOTAL_SCREENS} />

      <header className={styles.header}>
        <Logo />
        <span className={styles.screenIndicator}>
          SCREEN{' '}
          <strong className={styles.screenNum}>
            {String(CURRENT_SCREEN).padStart(2, '0')}
          </strong>
          {' '}/ {String(TOTAL_SCREENS).padStart(2, '0')}
        </span>
      </header>

      <main className={styles.content}>
        <div className={styles.tag}>
          <span className={styles.dot} />
          PROFILE CREATION
        </div>

        <h1 className={styles.heading}>
          CREATE YOUR <span className={styles.accent}>PROFILE</span>
        </h1>

        {/* Basic stats */}
        <div className={styles.formGrid}>
          <FormField
            id="age"
            label="AGE"
            type="text"
            placeholder="e.g. 25"
            value={age}
            onChange={handleNumberOnly(setAge)}
          />
          <FormField
            id="weight"
            label="WEIGHT (KG)"
            type="text"
            placeholder="e.g. 75"
            value={bodyWeightKg}
            onChange={handleNumberOnly(setBodyWeight)}
          />
          <FormField
            id="height"
            label="HEIGHT (CM)"
            type="text"
            placeholder="e.g. 180"
            value={heightCm}
            onChange={handleNumberOnly(setHeightCm)}
          />
        </div>

        {/* Gender */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>GENDER</span>
          <div className={styles.chips}>
            {GENDERS.map(({ label, value }) => (
              <Chip key={value} label={label} active={gender === value} onClick={() => setGender(value)} />
            ))}
          </div>
        </div>

        {/* Fitness Level — seeds BKT P(L0) */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>FITNESS LEVEL</span>
          <div className={styles.chips}>
            {FITNESS_LEVELS.map(({ label, value }) => (
              <Chip key={value} label={label} active={fitnessLevel === value} onClick={() => setFitness(value)} />
            ))}
          </div>
        </div>

        {/* Training Goal */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>TRAINING GOAL</span>
          <div className={styles.chips}>
            {GOALS.map(({ label, value }) => (
              <Chip key={value} label={label} active={goal === value} onClick={() => setGoal(value)} />
            ))}
          </div>
        </div>

        {/* Equipment */}
        <div className={styles.fieldGroup}>
          <span className={styles.label}>AVAILABLE EQUIPMENT</span>
          <div className={styles.chips}>
            {EQUIPMENT_OPTIONS.map(({ label, value }) => (
              <Chip key={value} label={label} active={equipment.includes(value)} onClick={() => toggleEquipment(value)} />
            ))}
          </div>
        </div>

        {/* Injury */}
        <div className={styles.fieldGroup}>
          <FormField
            id="injury"
            label="INJURY HISTORY (OPTIONAL)"
            placeholder="e.g. Lower back pain, right knee"
            value={injury}
            onChange={(e) => setInjury(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </main>

      <footer className={styles.footer}>
        <button className={styles.btnBack} onClick={onBack} type="button">
          ← BACK
        </button>
        <button className={styles.btnNext} onClick={handleSubmit} disabled={loading} type="button">
          {loading ? 'SAVING...' : 'NEXT →'}
        </button>
      </footer>
    </div>
  );
}
