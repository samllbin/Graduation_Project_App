import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontScale, ThemeMode } from '../theme/agriTheme';

const KEYS = {
  fontScale: '@app_settings:fontScale',
  themeMode: '@app_settings:themeMode',
};

export async function loadFontScale(): Promise<FontScale> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.fontScale);
    if (raw) {
      const val = Number(raw);
      if ([1, 1.15, 1.3, 1.5].includes(val)) return val as FontScale;
    }
  } catch {}
  return 1;
}

export async function saveFontScale(value: FontScale) {
  try {
    await AsyncStorage.setItem(KEYS.fontScale, String(value));
  } catch {}
}

export async function loadThemeMode(): Promise<ThemeMode> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.themeMode);
    if (raw === 'dark' || raw === 'light') return raw;
  } catch {}
  return 'light';
}

export async function saveThemeMode(value: ThemeMode) {
  try {
    await AsyncStorage.setItem(KEYS.themeMode, value);
  } catch {}
}
