import { brand } from './colors';

export type ThemeMode = 'dark' | 'light';

export type AppTheme = {
  mode: ThemeMode;
  bg: string;
  bgElevated: string;
  card: string;
  cardBorder: string;
  text: string;
  muted: string;
  dim: string;
  inputBg: string;
  primary: string;
  primaryText: string;
  primaryGlow: string;
  success: string;
  error: string;
  warning: string;
  highlight: string;
  tabBar: string;
  gradientHero: [string, string, string];
  shadow: string;
};

export const darkTheme: AppTheme = {
  mode: 'dark',
  bg: '#0a0f1a',
  bgElevated: '#0f172a',
  card: '#1e293b',
  cardBorder: '#334155',
  text: '#f8fafc',
  muted: '#94a3b8',
  dim: '#64748b',
  inputBg: '#0f172a',
  primary: brand.primary,
  primaryText: '#0a0f1a',
  primaryGlow: brand.primaryGlow,
  success: brand.success,
  error: brand.error,
  warning: brand.warning,
  highlight: 'rgba(34, 211, 238, 0.12)',
  tabBar: '#1e293b',
  gradientHero: ['#0a0f1a', '#0f2847', '#164e63'],
  shadow: '#000000',
};

export const lightTheme: AppTheme = {
  mode: 'light',
  bg: '#f1f5f9',
  bgElevated: '#ffffff',
  card: '#ffffff',
  cardBorder: '#e2e8f0',
  text: '#0f172a',
  muted: '#64748b',
  dim: '#94a3b8',
  inputBg: '#f8fafc',
  primary: brand.primary,
  primaryText: '#0a0f1a',
  primaryGlow: brand.primaryGlow,
  success: brand.success,
  error: brand.error,
  warning: brand.warning,
  highlight: 'rgba(34, 211, 238, 0.18)',
  tabBar: '#ffffff',
  gradientHero: ['#e0f2fe', '#cffafe', '#a5f3fc'],
  shadow: '#94a3b8',
};

export function themeForMode(mode: ThemeMode): AppTheme {
  return mode === 'light' ? lightTheme : darkTheme;
}
