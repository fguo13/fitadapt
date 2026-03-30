import { useTheme, ACCENT_PRESETS } from '../../contexts/ThemeContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import styles from './SettingsPage.module.scss';

const ACCENT_NAMES = Object.keys(ACCENT_PRESETS);

function Toggle({ checked, onChange, id }) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`${styles.toggle} ${checked ? styles.toggleOn : ''}`}
      type="button"
    >
      <span className={styles.toggleThumb} />
    </button>
  );
}

function Segments({ options, value, onChange }) {
  return (
    <div className={styles.segments}>
      {options.map((o) => (
        <button
          key={o.value}
          className={`${styles.segment} ${value === o.value ? styles.segmentActive : ''}`}
          onClick={() => onChange(o.value)}
          type="button"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Card({ title, sub, children }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardInfo}>
        <span className={styles.cardTitle}>{title}</span>
        {sub && <span className={styles.cardSub}>{sub}</span>}
      </div>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, toggleTheme, accent, setAccent } = useTheme();
  const { prefs, set, toggle, reset } = useAccessibility();

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <span className={styles.tag}>PREFERENCES</span>
        <h1 className={styles.heading}>Settings</h1>
        <p className={styles.sub}>Customise the look, feel, and accessibility of FitAdapt.</p>
      </div>

      {/* ── APPEARANCE ─────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>APPEARANCE</span>

        <Card title="Color mode" sub="Switch between dark and light theme.">
          <button
            className={`${styles.modeBtn} ${theme === 'dark' ? styles.modeBtnActive : ''}`}
            onClick={toggleTheme}
            type="button"
          >
            <span className={styles.modePip} />
            {theme === 'dark' ? 'Dark' : 'Light'}
          </button>
        </Card>

        <Card title="Accent color" sub="Pick a color scheme for highlights and buttons.">
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
        </Card>

        <Card title="High contrast" sub="Strengthens border and muted-text contrast for easier reading.">
          <Toggle
            checked={prefs.highContrast}
            onChange={() => toggle('highContrast')}
          />
        </Card>
      </section>

      {/* ── READABILITY ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>READABILITY</span>

        <Card
          title="Dyslexia-friendly font"
          sub="Switches to OpenDyslexic — each letter has a heavy weighted bottom to prevent rotation and flipping, making it easier to read for people with dyslexia."
        >
          <Toggle
            checked={prefs.dyslexiaFont}
            onChange={() => toggle('dyslexiaFont')}
          />
        </Card>

        <Card title="Font size" sub="Scale up all text for easier reading.">
          <Segments
            value={prefs.fontSize}
            onChange={(v) => set('fontSize', v)}
            options={[
              { label: 'Default', value: 'default' },
              { label: 'Large',   value: 'lg' },
              { label: 'X-Large', value: 'xl' },
              { label: 'Huge',    value: 'xxl' },
            ]}
          />
        </Card>

        <Card title="Bold text" sub="Increases body-text weight throughout the app.">
          <Toggle
            checked={prefs.boldText}
            onChange={() => toggle('boldText')}
          />
        </Card>

        <Card title="Extra letter spacing" sub="Adds space between characters — helpful for some reading difficulties.">
          <Toggle
            checked={prefs.letterSpacing}
            onChange={() => toggle('letterSpacing')}
          />
        </Card>
      </section>

      {/* ── SPACING & LAYOUT ───────────────────────────────────────────────── */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>SPACING & LAYOUT</span>

        <Card title="Line height" sub="Increase vertical space between lines of text.">
          <Segments
            value={prefs.lineHeight}
            onChange={(v) => set('lineHeight', v)}
            options={[
              { label: 'Default', value: 'default' },
              { label: 'Relaxed', value: 'relaxed' },
              { label: 'Loose',   value: 'loose' },
            ]}
          />
        </Card>

        <Card title="Word spacing" sub="Increase spacing between words.">
          <Segments
            value={prefs.wordSpacing}
            onChange={(v) => set('wordSpacing', v)}
            options={[
              { label: 'Default', value: 'default' },
              { label: 'Wide',    value: 'wide' },
              { label: 'Wider',   value: 'wider' },
            ]}
          />
        </Card>
      </section>

      {/* ── INTERACTION ────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <span className={styles.sectionLabel}>INTERACTION</span>

        <Card
          title="Large click targets"
          sub="Increases the minimum size of buttons and interactive elements to 44×44 px."
        >
          <Toggle
            checked={prefs.largeTargets}
            onChange={() => toggle('largeTargets')}
          />
        </Card>
      </section>

      {/* ── RESET ──────────────────────────────────────────────────────────── */}
      <section className={styles.section}>
        <button className={styles.resetBtn} onClick={reset} type="button">
          Reset all accessibility settings
        </button>
      </section>
    </div>
  );
}
