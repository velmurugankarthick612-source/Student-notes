import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ACCENT_COLORS = [
  { id: 'indigo', name: 'Indigo Classic', color: '#6366f1', bg: 'bg-indigo-600', ring: 'ring-indigo-400' },
  { id: 'emerald', name: 'Emerald Forest', color: '#10b981', bg: 'bg-emerald-600', ring: 'ring-emerald-400' },
  { id: 'blue', name: 'Ocean Blue', color: '#2563eb', bg: 'bg-blue-600', ring: 'ring-blue-400' },
  { id: 'purple', name: 'Royal Violet', color: '#9333ea', bg: 'bg-purple-600', ring: 'ring-purple-400' },
  { id: 'amber', name: 'Warm Amber', color: '#f59e0b', bg: 'bg-amber-500', ring: 'ring-amber-400' },
  { id: 'rose', name: 'Crimson Rose', color: '#f43f5e', bg: 'bg-rose-500', ring: 'ring-rose-400' },
];

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('studyhub_theme_mode') || 'system';
  });

  const [accent, setAccent] = useState(() => {
    return localStorage.getItem('studyhub_theme_accent') || 'indigo';
  });

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;

    const applyTheme = () => {
      let isSystemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      let effectiveDark = false;

      if (themeMode === 'dark') {
        effectiveDark = true;
      } else if (themeMode === 'light') {
        effectiveDark = false;
      } else {
        effectiveDark = isSystemDark;
      }

      setIsDark(effectiveDark);

      if (effectiveDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }

      root.setAttribute('data-accent', accent);
      localStorage.setItem('studyhub_theme_mode', themeMode);
      localStorage.setItem('studyhub_theme_accent', accent);
    };

    applyTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themeMode === 'system') {
        applyTheme();
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, accent]);

  const toggleDarkMode = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const value = {
    themeMode,
    setThemeMode,
    accent,
    setAccent,
    isDark,
    toggleDarkMode,
    accentColors: ACCENT_COLORS,
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
