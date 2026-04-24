export type ThemeMode = 'light' | 'dark';
export type FontScale = 1 | 1.15 | 1.3 | 1.5;

export const fontScaleLabels: Record<FontScale, string> = {
  1: '小',
  1.15: '中',
  1.3: '大',
  1.5: '超大',
};

const lightColors = {
  pageBg: '#f4f8f2',
  cardBg: '#ffffff',
  primary: '#2f8f46',
  primaryPressed: '#237337',
  primarySoft: '#e8f5ea',
  border: '#d7e8d9',
  textMain: '#1f2937',
  textSecondary: '#4b5563',
  danger: '#dc2626',
  success: '#15803d',
  tabActive: '#2f8f46',
  tabInactive: '#7a8a7f',
  tabBg: '#ffffff',
};

const darkColors = {
  pageBg: '#1a1f1e',
  cardBg: '#242b29',
  primary: '#4caf50',
  primaryPressed: '#388e3c',
  primarySoft: '#2a3d2d',
  border: '#3a4a42',
  textMain: '#e8ecea',
  textSecondary: '#9aaa9f',
  danger: '#ef4444',
  success: '#22c55e',
  tabActive: '#4caf50',
  tabInactive: '#6b7a6f',
  tabBg: '#242b29',
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  xl: 24,
};

export const spacing = {
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
};

export function createTheme(mode: ThemeMode, fontScale: FontScale) {
  const colors = mode === 'dark' ? darkColors : lightColors;
  const scale = fontScale;

  return {
    mode,
    fontScale: scale,
    colors,
    radius,
    spacing,
    text: {
      title: {
        fontSize: Math.round(28 * scale),
        fontWeight: '700' as const,
        color: colors.textMain,
      },
      subtitle: {
        fontSize: Math.round(14 * scale),
        color: colors.textSecondary,
      },
      body: {
        fontSize: Math.round(15 * scale),
        color: colors.textMain,
      },
    },
  };
}

export type AppTheme = ReturnType<typeof createTheme>;
