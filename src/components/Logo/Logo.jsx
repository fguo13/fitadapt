import styles from './Logo.module.scss';

function DumbbellIcon() {
  return (
    <svg
      viewBox="0 0 22 14"
      width="22"
      height="14"
      fill="currentColor"
      aria-hidden="true"
    >
      {/* left outer weight */}
      <rect x="0" y="2" width="3" height="10" rx="1.5" />
      {/* left bar connector */}
      <rect x="3" y="4.5" width="2" height="5" rx="0" />
      {/* bar */}
      <rect x="5" y="6" width="12" height="2" rx="1" />
      {/* right bar connector */}
      <rect x="17" y="4.5" width="2" height="5" rx="0" />
      {/* right outer weight */}
      <rect x="19" y="2" width="3" height="10" rx="1.5" />
    </svg>
  );
}

export default function Logo() {
  return (
    <div className={styles.logo}>
      <span className={styles.icon}>
        <DumbbellIcon />
      </span>
      <span>FIT<span className={styles.accent}>ADAPT</span></span>
    </div>
  );
}
