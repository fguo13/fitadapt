import { createContext, useContext, useState, useEffect } from 'react';
import { getToken, setToken, clearToken, userApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(getToken());
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(!!getToken());

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    userApi.getMe()
      .then(setUser)
      .catch(() => { clearToken(); setTokenState(null); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = (newToken) => {
    setToken(newToken);
    setTokenState(newToken);
  };

  const logout = () => {
    clearToken();
    setTokenState(null);
    setUser(null);
  };

  const refreshUser = () => userApi.getMe().then(setUser);

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
