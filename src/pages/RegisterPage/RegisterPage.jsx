import { useState } from 'react';
import { Logo, FormField } from '../../components';
import styles from './RegisterPage.module.scss';

export default function RegisterPage({ onRegister, onBack, error }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name || !email || !password) return;
    setLoading(true);
    await onRegister(name, email, password);
    setLoading(false);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>

        <div className={styles.tag}>
          <span className={styles.dot} />
          // NEW MEMBER
        </div>

        <h1 className={styles.heading}>
          CREATE YOUR<br />
          <span className={styles.accent}>ACCOUNT.</span>
        </h1>

        <div className={styles.fields}>
          <FormField
            id="name"
            label="FULL NAME"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
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
            placeholder="min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button
          className={styles.btnCreate}
          onClick={handleSubmit}
          disabled={loading}
          type="button"
        >
          {loading ? 'CREATING...' : 'CREATE ACCOUNT →'}
        </button>

        <p className={styles.footer}>
          Already a member?{' '}
          <span className={styles.link} onClick={onBack}>
            SIGN IN
          </span>
        </p>
      </div>
    </div>
  );
}
