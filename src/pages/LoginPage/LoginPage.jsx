import { useState } from 'react';
import { Logo, FormField } from '../../components';
import { authApi, userApi } from '../../api';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.scss';

export default function LoginPage({ onLogin, onGoToRegister }) {
  const { login } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email || !password) { setError('Email and password are required.'); return; }
    setLoading(true);
    try {
      const { token } = await authApi.login({ email, password });
      login(token);
      const user = await userApi.getMe();
      // No profile yet → onboarding; otherwise → dashboard
      onLogin(user?.goal ? 'dashboard' : 'onboarding');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
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

        {error && <p className={styles.error}>{error}</p>}

        <button className={styles.btnSignIn} onClick={handleLogin} disabled={loading} type="button">
          {loading ? 'SIGNING IN...' : 'SIGN IN →'}
        </button>

        <p className={styles.footer}>
          No account?{' '}
          <span className={styles.link} onClick={onGoToRegister}>
            CREATE ONE FREE
          </span>
        </p>
      </div>
    </div>
  );
}
