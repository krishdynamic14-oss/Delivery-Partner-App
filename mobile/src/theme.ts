export type ThemeName = 'darkOrange' | 'lightClean' | 'highContrast';

export type AppColors = {
  bg: string;
  surface: string;
  surface2: string;
  glass: string;
  glassStrong: string;
  border: string;
  orange: string;
  amber: string;
  gold: string;
  green: string;
  red: string;
  blue: string;
  text: string;
  muted: string;
  dim: string;
  gradient: [string, string, string];
  glowTop: string;
  glowBottom: string;
  tabBar: string;
  cardHighlight: string;
};

export type AppTheme = {
  name: ThemeName;
  label: string;
  description: string;
  statusBar: 'light' | 'dark';
  colors: AppColors;
};

export const themes: Record<ThemeName, AppTheme> = {
  darkOrange: {
    name: 'darkOrange',
    label: 'Dark Orange',
    description: 'Current night delivery theme',
    statusBar: 'light',
    colors: {
      bg: '#07070d',
      surface: 'rgba(18,18,27,0.86)',
      surface2: 'rgba(31,31,44,0.82)',
      glass: 'rgba(255,255,255,0.075)',
      glassStrong: 'rgba(255,255,255,0.12)',
      border: 'rgba(255,255,255,0.12)',
      orange: '#ff6b00',
      amber: '#ffb347',
      gold: '#ffd166',
      green: '#00c896',
      red: '#ff4b6e',
      blue: '#4e9cff',
      text: '#f0f0f8',
      muted: '#8c8ca8',
      dim: 'rgba(255,255,255,0.06)',
      gradient: ['#170b08', '#07070d', '#07111d'],
      glowTop: 'rgba(255,107,0,0.16)',
      glowBottom: 'rgba(78,156,255,0.11)',
      tabBar: 'rgba(14,14,22,0.92)',
      cardHighlight: 'rgba(255,255,255,0.28)',
    },
  },
  lightClean: {
    name: 'lightClean',
    label: 'Light Clean',
    description: 'Bright daytime field work',
    statusBar: 'dark',
    colors: {
      bg: '#f6f8fb',
      surface: '#ffffff',
      surface2: '#eef3f8',
      glass: 'rgba(255,255,255,0.86)',
      glassStrong: '#ffffff',
      border: 'rgba(25,39,64,0.13)',
      orange: '#e85d04',
      amber: '#b96b00',
      gold: '#b7791f',
      green: '#008766',
      red: '#d72f52',
      blue: '#1f6fdb',
      text: '#111827',
      muted: '#667085',
      dim: 'rgba(17,24,39,0.06)',
      gradient: ['#fff7ed', '#f6f8fb', '#eef6ff'],
      glowTop: 'rgba(232,93,4,0.11)',
      glowBottom: 'rgba(31,111,219,0.10)',
      tabBar: 'rgba(255,255,255,0.96)',
      cardHighlight: 'rgba(255,255,255,0.82)',
    },
  },
  highContrast: {
    name: 'highContrast',
    label: 'High Contrast',
    description: 'Maximum readability outdoors',
    statusBar: 'light',
    colors: {
      bg: '#000000',
      surface: '#101010',
      surface2: '#1a1a1a',
      glass: '#141414',
      glassStrong: '#202020',
      border: 'rgba(255,255,255,0.28)',
      orange: '#ff8c00',
      amber: '#ffd400',
      gold: '#ffe66d',
      green: '#00e676',
      red: '#ff1744',
      blue: '#40c4ff',
      text: '#ffffff',
      muted: '#c7c7c7',
      dim: 'rgba(255,255,255,0.12)',
      gradient: ['#171000', '#000000', '#001018'],
      glowTop: 'rgba(255,140,0,0.18)',
      glowBottom: 'rgba(64,196,255,0.15)',
      tabBar: 'rgba(0,0,0,0.96)',
      cardHighlight: 'rgba(255,255,255,0.42)',
    },
  },
};

export const DEFAULT_THEME_NAME: ThemeName = 'darkOrange';

export const colors = themes[DEFAULT_THEME_NAME].colors;

export const spacing = {
  page: 18,
  card: 16,
  radius: 18,
};
