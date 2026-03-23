import styles from './Chip.module.scss';

export default function Chip({ label, active, onClick }) {
  return (
    <button
      className={`${styles.chip}${active ? ` ${styles.active}` : ''}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}
