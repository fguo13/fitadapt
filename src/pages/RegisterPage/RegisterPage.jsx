import { useState } from 'react';
import { Logo, FormField } from '../../components';
import { authApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import styles from './RegisterPage.module.scss';

export default function RegisterPage({ onRegistered, onGoToLogin }) {
  const { login } = useAuth();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleRegister = async () => {
    setError('');
    if (!name || !email || !password) { setError('All fields are required.'); return; }
    setLoading(true);
    try {
      const { token } = await authApi.register({ email, password, name });
      login(token);
      onRegistered(); // → onboarding
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>

        <div className={styles.tag}>
          <span className={styles.dot} />
          // CREATE ACCOUNT
        </div>

        <h1 className={styles.heading}>
          GET<br />
          <span className={styles.accent}>STARTED.</span>
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
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.btnPrimary} onClick={handleRegister} disabled={loading} type="button">
          {loading ? 'CREATING...' : 'CREATE ACCOUNT →'}
        </button>

        <p className={styles.footer}>
          Already have an account?{' '}
          <span className={styles.link} onClick={onGoToLogin}>
            SIGN IN
          </span>
        </p>
      </div>
    </div>
  );
}
