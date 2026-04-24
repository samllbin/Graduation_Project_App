import { useContext } from 'react';
import { ThemeContext } from './AppThemeProvider';

export function useTheme() {
  return useContext(ThemeContext).theme;
}

export function useThemeActions() {
  const ctx = useContext(ThemeContext);
  return {
    fontScale: ctx.fontScale,
    themeMode: ctx.themeMode,
    setFontScale: ctx.setFontScale,
    setThemeMode: ctx.setThemeMode,
  };
}
