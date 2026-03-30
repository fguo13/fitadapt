import { useState } from 'react';
import { Logo, Chip, FormField, ProgressBar } from '../../components';
import styles from './ProfilePage.module.scss';

const GOALS = ['Muscle Gain', 'Fat Loss', 'Endurance', 'General Fitness'];
const EQUIPMENT = ['Dumbbells', 'Bodyweight', 'Barbell', 'Resistance Bands', 'Cable Machine', 'Pull-up Bar'];
const GENDERS = ['Male', 'Female', 'Other'];

const TOTAL_SCREENS = 8;
const CURRENT_SCREEN = 5;

export default function ProfilePage({ onBack, onNext }) {
  const [name, setName] = useState('John Doe');
  const [age, setAge] = useState('24');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [goal, setGoal] = useState('Muscle Gain');
  const [equipment, setEquipment] = useState(['Dumbbells', 'Bodyweight']);
  const [injury, setInjury] = useState('');

  const toggleEquipment = (item) => {
    setEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const handleNumberOnly = (setter) => (e) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setter(value);
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

        <div className={styles.formGrid}>
          <FormField
            id="name"
            label="FULL NAME"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <FormField
            id="age"
            label="AGE"
            type="text"
            placeholder="e.g. 24"
            value={age}
            onChange={handleNumberOnly(setAge)}
          />

          <FormField
            id="weight"
            label="WEIGHT"
            type="text"
            placeholder="e.g. 75"
            value={weight}
            suffix="kg"
            onChange={handleNumberOnly(setWeight)}
          />

          <FormField
            id="height"
            label="HEIGHT"
            type="text"
            placeholder="e.g. 180"
            value={height}
            suffix="cm"
            onChange={handleNumberOnly(setHeight)}
          />
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>GENDER</span>
          <div className={styles.chips}>
            {GENDERS.map((g) => (
              <Chip
                key={g}
                label={g}
                active={gender === g}
                onClick={() => setGender(g)}
              />
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>TRAINING GOAL</span>
          <div className={styles.chips}>
            {GOALS.map((g) => (
              <Chip
                key={g}
                label={g}
                active={goal === g}
                onClick={() => setGoal(g)}
              />
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <span className={styles.label}>AVAILABLE EQUIPMENT</span>
          <div className={styles.chips}>
            {EQUIPMENT.map((e) => (
              <Chip
                key={e}
                label={e}
                active={equipment.includes(e)}
                onClick={() => toggleEquipment(e)}
              />
            ))}
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <FormField
            id="injury"
            label="INJURY HISTORY (OPTIONAL)"
            placeholder="e.g. Lower back, right knee"
            value={injury}
            onChange={(e) => setInjury(e.target.value)}
          />
        </div>
      </main>

      <footer className={styles.footer}>
        <button className={styles.btnBack} onClick={onBack} type="button">
          ← BACK
        </button>
        <button
            className={styles.btnNext}
            onClick={() => onNext && onNext({ name, age, weight, height, gender, goal, equipment, injury })}
            type="button"
          >
          NEXT →
        </button>
      </footer>
    </div>
  );
}