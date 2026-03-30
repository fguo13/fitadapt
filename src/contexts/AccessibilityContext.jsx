import { createContext, useContext, useState, useEffect } from 'react';

const DEFAULTS = {
  fontSize:      'default',  // default | lg | xl | xxl
  dyslexiaFont:  false,
  boldText:      false,
  letterSpacing: false,
  lineHeight:    'default',  // default | relaxed | loose
  wordSpacing:   'default',  // default | wide | wider
  highContrast:  false,
  largeTargets:  false,
};

const KEY = 'fitadapt_a11y';

function load() {
  try {
    return { ...DEFAULTS, ...JSON.parse(localStorage.getItem(KEY)) };
  } catch {
    return { ...DEFAULTS };
  }
}

function applyAll(prefs) {
  const el = document.documentElement;
  el.setAttribute('data-font-size',      prefs.fontSize);
  el.setAttribute('data-dyslexia-font',  String(prefs.dyslexiaFont));
  el.setAttribute('data-bold-text',      String(prefs.boldText));
  el.setAttribute('data-letter-spacing', String(prefs.letterSpacing));
  el.setAttribute('data-line-height',    prefs.lineHeight);
  el.setAttribute('data-word-spacing',   prefs.wordSpacing);
  el.setAttribute('data-high-contrast',  String(prefs.highContrast));
  el.setAttribute('data-large-targets',  String(prefs.largeTargets));
}

const AccessibilityContext = createContext(null);

export function AccessibilityProvider({ children }) {
  const [prefs, setPrefs] = useState(() => load());

  useEffect(() => {
    applyAll(prefs);
    try { localStorage.setItem(KEY, JSON.stringify(prefs)); } catch { /* quota */ }
  }, [prefs]);

  const set    = (key, value) => setPrefs((p) => ({ ...p, [key]: value }));
  const toggle = (key)        => setPrefs((p) => ({ ...p, [key]: !p[key] }));
  const reset  = ()           => setPrefs({ ...DEFAULTS });

  return (
    <AccessibilityContext.Provider value={{ prefs, set, toggle, reset }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export const useAccessibility = () => useContext(AccessibilityContext);
