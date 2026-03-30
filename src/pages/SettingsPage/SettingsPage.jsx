import { useTheme, ACCENT_PRESETS } from '../../contexts/ThemeContext';
import styles from './SettingsPage.module.scss';

const ACCENT_NAMES = Object.keys(ACCENT_PRESETS);

export default function SettingsPage() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.tag}>PREFERENCES</span>
        <h1 className={styles.heading}>Settings</h1>
        <p className={styles.sub}>Customise the look and feel of FitAdapt.</p>
      </div>

      {/* Appearance */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>APPEARANCE</span>

        {/* Theme toggle */}
        <div className={styles.card}>
          <div className={styles.cardInfo}>
            <span className={styles.cardTitle}>Color mode</span>
            <span className={styles.cardSub}>Switch between dark and light theme.</span>
          </div>
          <button
            className={`${styles.modeBtn} ${theme === 'dark' ? styles.modeBtnActive : ''}`}
            onClick={toggleTheme}
            type="button"
          >
            <span className={styles.modePip} />
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </div>

        {/* Accent color swatches */}
        <div className={styles.card}>
          <div className={styles.cardInfo}>
            <span className={styles.cardTitle}>Accent color</span>
            <span className={styles.cardSub}>Pick a color scheme for highlights and buttons.</span>
          </div>
          <div className={styles.swatchGrid}>
            {ACCENT_NAMES.map((name) => {
              const preview = ACCENT_PRESETS[name].dark.accent;
              return (
                <button
                  key={name}
                  className={`${styles.swatch} ${accent === name ? styles.swatchActive : ''}`}
                  style={{ '--swatch-color': preview }}
                  onClick={() => setAccent(name)}
                  type="button"
                  title={name.charAt(0).toUpperCase() + name.slice(1)}
                  aria-pressed={accent === name}
                >
                  {accent === name && <span className={styles.swatchCheck}>✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
