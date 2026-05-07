import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export const tokens = {
  dark: {
    surface: '#0c0c1f',
    surfaceContainer: '#17172e',
    surfaceContainerHigh: '#1d1d36',
    surfaceContainerHighest: '#23233f',
    surfaceContainerLow: '#111126',
    onSurface: '#e5e3fe',
    onSurfaceVariant: '#aaa8c2',
    outline: '#74738b',
    outlineVariant: '#46465c',
    primary: '#b89fff',
    primaryDim: '#834fff',
    secondary: '#bc87fe',
    tertiary: '#a0fff0',
    tertiaryDim: '#2de7d2',
    tertiaryFixed: '#33e9d5',
    error: '#ff6e84',
    glassCard: 'rgba(35,35,63,0.6)',
    glassBorderTop: 'rgba(184,159,255,0.15)',
    heroBg: '#111126',
    onPrimary: '#37008e',
  },
  light: {
    surface: '#ffffff',
    surfaceContainer: '#f8f7ff',
    surfaceContainerHigh: '#f1f0f7',
    surfaceContainerHighest: '#e5e4f2',
    surfaceContainerLow: '#faf9ff',
    onSurface: '#1a1a2e',
    onSurfaceVariant: '#5c5b71',
    outline: '#74738b',
    outlineVariant: '#e1e0f0',
    primary: '#834fff',
    primaryDim: '#6d23f9',
    secondary: '#834fff',
    tertiary: '#006a60',
    tertiaryDim: '#2de7d2',
    tertiaryFixed: '#33e9d5',
    error: '#d73357',
    glassCard: 'rgba(255,255,255,0.7)',
    glassBorderTop: 'rgba(255,255,255,0.8)',
    heroBg: 'linear-gradient(135deg,#faf9ff 0%,#f1f0f7 100%)',
    onPrimary: '#ffffff',
  },
} as const;

export const getDashboardTokens = (isDark: boolean) => ({
  surface:              isDark ? '#060d21' : '#fbf8ff',
  surfaceContainer:     isDark ? '#0d1834' : '#f0edf5',
  surfaceContainerLow:  isDark ? '#09122a' : '#f7f8ff',
  surfaceContainerHigh: isDark ? '#111e3f' : '#ebe7ef',
  primary:              isDark ? '#9990ff' : '#5749d2',
  primaryContainer:     isDark ? '#7f73fd' : '#e3dfff',
  secondary:            isDark ? '#28d9f3' : '#006972',
  secondaryContainer:   isDark ? '#002a31' : '#9eefff',
  onSurface:            isDark ? '#dfe4ff' : '#1b1b1f',
  onSurfaceVariant:     isDark ? '#9caad7' : '#46464f',
  outlineVariant:       isDark ? '#39476e' : '#c6c6d0',
  error:                isDark ? '#fd6f85' : '#ba1a1a',
  font: {
    headline: "'Plus Jakarta Sans', sans-serif",
    body:     "'Inter', sans-serif",
  },
});

export type DashboardTokens = ReturnType<typeof getDashboardTokens>;

interface ThemeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ isDark: true, toggle: () => {} });

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(true);

  
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.body.style.backgroundColor = isDark ? '#0c0c1f' : '#faf9ff';
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ isDark, toggle: () => setIsDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);