import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ThemeMode } from '../../theme/agriTheme';
import { useTheme, useThemeActions } from '../../theme/useTheme';

const modes: { key: ThemeMode; label: string }[] = [
  { key: 'light', label: '亮色' },
  { key: 'dark', label: '暗色' },
];

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function ThemePicker({ visible, onClose }: Props) {
  const theme = useTheme();
  const { themeMode, setThemeMode } = useThemeActions();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.panel, { backgroundColor: theme.colors.cardBg }]}>
          <Text style={[styles.title, { color: theme.colors.textMain, fontSize: theme.text.title.fontSize }]}>
            主题设置
          </Text>

          <View style={styles.cards}>
            {modes.map((m) => {
              const active = themeMode === m.key;
              const previewBg = m.key === 'dark' ? '#242b29' : '#ffffff';
              const previewText = m.key === 'dark' ? '#e8ecea' : '#1f2937';
              const previewSub = m.key === 'dark' ? '#9aaa9f' : '#4b5563';

              return (
                <Pressable
                  key={m.key}
                  style={[
                    styles.card,
                    {
                      borderColor: active ? theme.colors.primary : theme.colors.border,
                      backgroundColor: active ? theme.colors.primarySoft : 'transparent',
                    },
                  ]}
                  onPress={() => setThemeMode(m.key)}
                >
                  <View style={[styles.preview, { backgroundColor: previewBg }]}>
                    <View style={styles.previewAvatar} />
                    <View style={styles.previewContent}>
                      <View style={[styles.previewLine, { backgroundColor: previewText, width: '60%' }]} />
                      <View style={[styles.previewLine, { backgroundColor: previewSub, width: '80%' }]} />
                      <View style={[styles.previewLine, { backgroundColor: previewSub, width: '50%' }]} />
                    </View>
                  </View>
                  <Text style={[styles.cardLabel, { color: theme.colors.textMain, fontSize: theme.text.body.fontSize }]}>
                    {m.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable style={[styles.closeBtn, { backgroundColor: theme.colors.primary }]} onPress={onClose}>
            <Text style={styles.closeText}>关闭</Text>
          </Pressable>
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  panel: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
    gap: 16,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  cards: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
  },
  card: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 14,
    padding: 12,
    alignItems: 'center',
    gap: 10,
  },
  preview: {
    width: '100%',
    height: 80,
    borderRadius: 10,
    flexDirection: 'row',
    padding: 10,
    gap: 10,
  },
  previewAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#d1d5db',
  },
  previewContent: {
    flex: 1,
    gap: 6,
    justifyContent: 'center',
  },
  previewLine: {
    height: 6,
    borderRadius: 3,
  },
  cardLabel: {
    fontWeight: '600',
  },
  closeBtn: {
    height: 46,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  closeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
