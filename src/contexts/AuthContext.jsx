import { createContext, useContext, useState, useCallback } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('fitadapt_token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('fitadapt_user');
    return saved ? JSON.parse(saved) : null;
  });

  const signIn = useCallback((authData) => {
    localStorage.setItem('fitadapt_token', authData.token);
    localStorage.setItem('fitadapt_user', JSON.stringify({ email: authData.email, name: authData.name }));
    setToken(authData.token);
    setUser({ email: authData.email, name: authData.name });
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem('fitadapt_token');
    localStorage.removeItem('fitadapt_user');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, signIn, signOut, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
