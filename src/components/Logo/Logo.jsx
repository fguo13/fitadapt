import styles from './Logo.module.scss';

export default function Logo() {
  return (
    <div className={styles.logo}>
      FIT<span className={styles.accent}>ADAPT</span>
    </div>
  );
}
