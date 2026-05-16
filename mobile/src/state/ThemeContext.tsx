import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_THEME_NAME, themes, type AppTheme, type ThemeName } from '../theme';

const THEME_KEY = 'db.themeName';

type ThemeState = {
  theme: AppTheme;
  themeName: ThemeName;
  setThemeName: (name: ThemeName) => Promise<void>;
};

const ThemeContext = createContext<ThemeState | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const [themeName, setThemeNameState] = useState<ThemeName>(DEFAULT_THEME_NAME);

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved && saved in themes) setThemeNameState(saved as ThemeName);
    });
  }, []);

  const value = useMemo<ThemeState>(() => ({
    theme: themes[themeName],
    themeName,
    async setThemeName(name: ThemeName) {
      setThemeNameState(name);
      await AsyncStorage.setItem(THEME_KEY, name);
    },
  }), [themeName]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error('useTheme must be used inside ThemeProvider');
  return value;
}
