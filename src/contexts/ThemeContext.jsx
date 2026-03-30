import { createContext, useContext, useState, useEffect } from 'react';

export const ACCENT_PRESETS = {
  lime:   { dark: { accent: '#9fd45e', dim: '#78aa42' }, light: { accent: '#4e8f1e', dim: '#3e7216' } },
  sky:    { dark: { accent: '#5ec4f5', dim: '#38b0e8' }, light: { accent: '#0e7cb8', dim: '#0a5f8e' } },
  violet: { dark: { accent: '#a78bfa', dim: '#8461f5' }, light: { accent: '#6d28d9', dim: '#5521b5' } },
  amber:  { dark: { accent: '#fbbf24', dim: '#d97706' }, light: { accent: '#b45309', dim: '#92400e' } },
  rose:   { dark: { accent: '#fb7185', dim: '#e11d48' }, light: { accent: '#e11d48', dim: '#be123c' } },
  teal:   { dark: { accent: '#2dd4bf', dim: '#14b8a6' }, light: { accent: '#0d9488', dim: '#0f766e' } },
};

function applyAccent(theme, accent) {
  const mode = ACCENT_PRESETS[accent]?.[theme] ?? ACCENT_PRESETS.lime[theme];
  document.documentElement.style.setProperty('--color-accent', mode.accent);
  document.documentElement.style.setProperty('--color-accent-dim', mode.dim);
}

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('fitadapt_theme') || 'dark'
  );
  const [accent, setAccentState] = useState(
    () => localStorage.getItem('fitadapt_accent') || 'lime'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('fitadapt_theme', theme);
    applyAccent(theme, accent);
  }, [theme, accent]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const setAccent = (a) => {
    setAccentState(a);
    localStorage.setItem('fitadapt_accent', a);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, accent, setAccent, ACCENT_PRESETS }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
