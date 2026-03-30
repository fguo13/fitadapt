import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import styles from './ProfileEditPage.module.scss';

const GOALS = ['Muscle Gain', 'Fat Loss', 'Endurance', 'General Fitness'];
const GENDERS = ['Male', 'Female', 'Other'];
const FITNESS_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const WORKOUT_STYLES = ['Strength', 'HIIT', 'Cardio', 'Flexibility', 'Mixed'];
const EQUIPMENT_OPTIONS = [
  'Dumbbells', 'Barbell', 'Bodyweight', 'Kettlebell',
  'Resistance Bands', 'Pull-up Bar', 'Cable Machine', 'Bench',
];

const GOAL_MAP     = { 'Muscle Gain': 'MUSCLE_GAIN', 'Fat Loss': 'WEIGHT_LOSS', 'Endurance': 'ENDURANCE', 'General Fitness': 'GENERAL_FITNESS' };
const GOAL_REV     = { MUSCLE_GAIN: 'Muscle Gain', WEIGHT_LOSS: 'Fat Loss', ENDURANCE: 'Endurance', GENERAL_FITNESS: 'General Fitness' };
const GENDER_MAP   = { Male: 'MALE', Female: 'FEMALE', Other: 'OTHER' };
const GENDER_REV   = { MALE: 'Male', FEMALE: 'Female', OTHER: 'Other' };
const LEVEL_MAP    = { Beginner: 'BEGINNER', Intermediate: 'INTERMEDIATE', Advanced: 'ADVANCED' };
const LEVEL_REV    = { BEGINNER: 'Beginner', INTERMEDIATE: 'Intermediate', ADVANCED: 'Advanced' };
const STYLE_MAP    = { Strength: 'STRENGTH', HIIT: 'HIIT', Cardio: 'CARDIO', Flexibility: 'FLEXIBILITY', Mixed: 'MIXED' };
const STYLE_REV    = { STRENGTH: 'Strength', HIIT: 'HIIT', CARDIO: 'Cardio', FLEXIBILITY: 'Flexibility', MIXED: 'Mixed' };
const EQUIP_MAP    = { Dumbbells: 'DUMBBELLS', Barbell: 'BARBELL', Bodyweight: 'BODYWEIGHT', Kettlebell: 'KETTLEBELL', 'Resistance Bands': 'RESISTANCE_BANDS', 'Pull-up Bar': 'PULL_UP_BAR', 'Cable Machine': 'CABLE_MACHINE', Bench: 'BENCH' };
const EQUIP_REV    = Object.fromEntries(Object.entries(EQUIP_MAP).map(([k, v]) => [v, k]));

function NumericField({ label, value, onChange, unit, min, max }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.numericWrap}>
        <input
          className={styles.numericInput}
          type="number"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
        />
        {unit && <span className={styles.unit}>{unit}</span>}
      </div>
    </div>
  );
}

function SelectRow({ label, options, selected, onSelect }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>{label}</label>
      <div className={styles.pillRow}>
        {options.map((opt) => (
          <button
            key={opt}
            className={`${styles.pill} ${selected === opt ? styles.pillActive : ''}`}
            onClick={() => onSelect(opt)}
            type="button"
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function EquipmentGrid({ selected, onToggle }) {
  return (
    <div className={styles.field}>
      <label className={styles.fieldLabel}>EQUIPMENT</label>
      <div className={styles.equipGrid}>
        {EQUIPMENT_OPTIONS.map((item) => (
          <button
            key={item}
            className={`${styles.equipChip} ${selected.includes(item) ? styles.equipChipActive : ''}`}
            onClick={() => onToggle(item)}
            type="button"
          >
            {selected.includes(item) && <span className={styles.check}>✓</span>}
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ProfileEditPage({ onSave, onBack }) {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [age, setAge] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('');
  const [goal, setGoal] = useState('');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner');
  const [workoutStyle, setWorkoutStyle] = useState('Mixed');
  const [equipment, setEquipment] = useState([]);
  const [injury, setInjury] = useState('');

  useEffect(() => {
    api.users.me()
      .then((p) => {
        if (p.age)           setAge(String(p.age));
        if (p.bodyWeightKg)  setWeight(String(p.bodyWeightKg));
        if (p.heightCm)      setHeight(String(p.heightCm));
        if (p.gender)        setGender(GENDER_REV[p.gender] ?? '');
        if (p.goal)          setGoal(GOAL_REV[p.goal] ?? '');
        if (p.fitnessLevel)   setFitnessLevel(LEVEL_REV[p.fitnessLevel] ?? 'Beginner');
        if (p.workoutStyle)   setWorkoutStyle(STYLE_REV[p.workoutStyle] ?? 'Mixed');
        if (p.availableEquipment) setEquipment(p.availableEquipment.map((e) => EQUIP_REV[e]).filter(Boolean));
        if (p.injuryHistory) setInjury(p.injuryHistory);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const toggleEquipment = (item) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      await api.users.onboarding({
        age: parseInt(age, 10),
        bodyWeightKg: parseInt(weight, 10),
        heightCm: parseInt(height, 10),
        gender: GENDER_MAP[gender] ?? 'OTHER',
        goal: GOAL_MAP[goal] ?? 'GENERAL_FITNESS',
        fitnessLevel: LEVEL_MAP[fitnessLevel] ?? 'BEGINNER',
        workoutStyle: STYLE_MAP[workoutStyle] ?? 'MIXED',
        availableEquipment: equipment.map((e) => EQUIP_MAP[e]).filter(Boolean),
        injuryHistory: injury || undefined,
      });
      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={styles.page}><p className={styles.loading}>Loading…</p></div>;
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <span className={styles.tag}>YOUR PROFILE</span>
          <h1 className={styles.heading}>Edit Profile</h1>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.btnCancel} onClick={onBack} type="button">
            Cancel
          </button>
          <button className={styles.btnSave} onClick={handleSave} disabled={saving} type="button">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}

      <div className={styles.sections}>
        {/* Body stats */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Body stats</span>
            <span className={styles.sectionSub}>Used to calibrate exercise weight suggestions.</span>
          </div>
          <div className={styles.fieldsRow}>
            <NumericField label="AGE" value={age} onChange={setAge} unit="yrs" min={10} max={99} />
            <NumericField label="WEIGHT" value={weight} onChange={setWeight} unit="kg" min={30} max={300} />
            <NumericField label="HEIGHT" value={height} onChange={setHeight} unit="cm" min={100} max={250} />
          </div>
        </section>

        <div className={styles.divider} />

        {/* Personal */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Personal</span>
          </div>
          <SelectRow label="GENDER" options={GENDERS} selected={gender} onSelect={setGender} />
        </section>

        <div className={styles.divider} />

        {/* Training */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Training</span>
            <span className={styles.sectionSub}>Changing your goal shifts the algorithm's focus immediately.</span>
          </div>
          <SelectRow label="GOAL" options={GOALS} selected={goal} onSelect={setGoal} />
          <SelectRow label="WORKOUT STYLE" options={WORKOUT_STYLES} selected={workoutStyle} onSelect={setWorkoutStyle} />
          <SelectRow label="FITNESS LEVEL" options={FITNESS_LEVELS} selected={fitnessLevel} onSelect={setFitnessLevel} />
          <p className={styles.scrutabilityNote}>
            FITNESS LEVEL seeds your adaptive skill model on first save. It sets the starting
            probability that the algorithm assigns to each muscle group. You can adjust it at any
            time — the model will update from your next session onwards.
          </p>
        </section>

        <div className={styles.divider} />

        {/* Equipment */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Equipment</span>
            <span className={styles.sectionSub}>Only exercises using your selected equipment will be generated.</span>
          </div>
          <EquipmentGrid selected={equipment} onToggle={toggleEquipment} />
        </section>

        <div className={styles.divider} />

        {/* Health */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionTitle}>Health notes</span>
            <span className={styles.sectionSub}>Any injuries or limitations the algorithm should account for.</span>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>INJURY HISTORY</label>
            <textarea
              className={styles.textarea}
              value={injury}
              onChange={(e) => setInjury(e.target.value)}
              rows={3}
              placeholder="e.g. Lower back pain, avoid heavy deadlifts…"
            />
          </div>
        </section>
      </div>

      {/* Bottom save bar */}
      <div className={styles.saveBar}>
        {error && <p className={styles.error}>{error}</p>}
        <div className={styles.saveBarActions}>
          <button className={styles.btnCancel} onClick={onBack} type="button">Cancel</button>
          <button className={styles.btnSave} onClick={handleSave} disabled={saving} type="button">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
