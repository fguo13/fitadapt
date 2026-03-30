import { useState } from 'react';
import { Logo, FormField } from '../../components';
import styles from './LoginPage.module.scss';

export default function LoginPage({ onLogin, onRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>

        <div className={styles.tag}>
          <span className={styles.dot} />
          // MEMBER ACCESS
        </div>

        <h1 className={styles.heading}>
          WELCOME<br />
          <span className={styles.accent}>BACK.</span>
        </h1>

        <div className={styles.fields}>
          <FormField
            id="email"
            label="EMAIL ADDRESS"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <FormField
            id="password"
            label="PASSWORD"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            rightLabel="FORGOT?"
          />
        </div>

        <button className={styles.btnSignIn} onClick={() => onLogin(email, password)} type="button">
          SIGN IN →
        </button>

        <p className={styles.footer}>
          No account?{' '}
          <span className={styles.link} onClick={onRegister}>
            CREATE ONE FREE
          </span>
        </p>
      </div>
    </div>
  );
}
