import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { AppTheme, createTheme, FontScale, ThemeMode } from './agriTheme';
import { loadFontScale, loadThemeMode, saveFontScale, saveThemeMode } from '../store/settingsStore';

type ThemeContextType = {
  theme: AppTheme;
  fontScale: FontScale;
  themeMode: ThemeMode;
  setFontScale: (v: FontScale) => void;
  setThemeMode: (v: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: createTheme('light', 1),
  fontScale: 1,
  themeMode: 'light',
  setFontScale: () => {},
  setThemeMode: () => {},
});

export default function AppThemeProvider({ children }: { children: React.ReactNode }) {
  const [fontScale, setFontScaleState] = useState<FontScale>(1);
  const [themeMode, setThemeModeState] = useState<ThemeMode>('light');
  useEffect(() => {
    (async () => {
      const [fs, tm] = await Promise.all([loadFontScale(), loadThemeMode()]);
      setFontScaleState(fs);
      setThemeModeState(tm);
    })();
  }, []);

  const setFontScale = useCallback((v: FontScale) => {
    setFontScaleState(v);
    saveFontScale(v);
  }, []);

  const setThemeMode = useCallback((v: ThemeMode) => {
    setThemeModeState(v);
    saveThemeMode(v);
  }, []);

  const theme = useMemo(() => createTheme(themeMode, fontScale), [themeMode, fontScale]);

  return (
    <ThemeContext.Provider value={{ theme, fontScale, themeMode, setFontScale, setThemeMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
