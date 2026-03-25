import styles from './StatCard.module.scss';

export default function StatCard({ label, value, unit }) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value}>
        {value ?? '—'}
        {unit && <span className={styles.unit}> {unit}</span>}
      </span>
    </div>
  );
}
