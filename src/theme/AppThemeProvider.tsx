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
  const [state, setState] = useState<{ fontScale: FontScale; themeMode: ThemeMode }>({
    fontScale: 1,
    themeMode: 'light',
  });
  useEffect(() => {
    (async () => {
      const [fs, tm] = await Promise.all([loadFontScale(), loadThemeMode()]);
      setState(prev => {
        if (prev.fontScale === fs && prev.themeMode === tm) return prev;
        return { fontScale: fs, themeMode: tm };
      });
    })();
  }, []);

  const setFontScale = useCallback((v: FontScale) => {
    setState(s => ({ ...s, fontScale: v }));
    saveFontScale(v);
  }, []);

  const setThemeMode = useCallback((v: ThemeMode) => {
    setState(s => ({ ...s, themeMode: v }));
    saveThemeMode(v);
  }, []);

  const { fontScale, themeMode } = state;
  const theme = useMemo(() => createTheme(themeMode, fontScale), [themeMode, fontScale]);

  const value = useMemo(
    () => ({ theme, fontScale, themeMode, setFontScale, setThemeMode }),
    [theme, fontScale, themeMode, setFontScale, setThemeMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
