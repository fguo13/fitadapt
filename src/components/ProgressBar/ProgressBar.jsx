import styles from './ProgressBar.module.scss';

export default function ProgressBar({ current, total }) {
  const pct = (current / total) * 100;
  return (
    <div className={styles.track}>
      <div className={styles.fill} style={{ width: `${pct}%` }} />
    </div>
  );
}
