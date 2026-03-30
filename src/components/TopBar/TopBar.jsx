import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './TopBar.module.scss';

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <circle cx="6" cy="6" r="4.5" />
      <line x1="9.5" y1="9.5" x2="13" y2="13" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="2,3.5 5,6.5 8,3.5" />
    </svg>
  );
}

function getInitials(name) {
  if (!name) return '?';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function TopBar({ onNavigate }) {
  const { user, signOut } = useAuth();
  const [query, setQuery] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => onNavigate('profile-view');
  const handleSignOut = () => { setDropdownOpen(false); signOut(); };

  return (
    <header className={styles.topbar}>
      <div className={styles.searchWrap}>
        <span className={styles.searchIcon}><SearchIcon /></span>
        <input
          className={styles.searchInput}
          type="text"
          placeholder="Search exercises, sessions…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className={styles.right}>
        <div className={styles.profileWrap} ref={dropdownRef}>
          <button
            className={styles.profileBtn}
            onClick={() => setDropdownOpen((o) => !o)}
            type="button"
            aria-expanded={dropdownOpen}
          >
            <span className={styles.avatar}>{getInitials(user?.name)}</span>
            <span className={styles.profileName}>{user?.name?.split(' ')[0]}</span>
            <span className={styles.chevron}><ChevronIcon /></span>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdown}>
              <div className={styles.dropdownHeader}>
                <span className={styles.dropdownName}>{user?.name}</span>
                <span className={styles.dropdownEmail}>{user?.email}</span>
              </div>
              <div className={styles.dropdownDivider} />
              <button
                className={styles.dropdownItem}
                onClick={() => { setDropdownOpen(false); handleProfileClick(); }}
                type="button"
              >
                View profile
              </button>
              <button
                className={`${styles.dropdownItem} ${styles.dropdownItemDanger}`}
                onClick={handleSignOut}
                type="button"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
