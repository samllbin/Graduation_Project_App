import React from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { FontScale, fontScaleLabels } from '../../theme/agriTheme';
import { useTheme, useThemeActions } from '../../theme/useTheme';

const scales: FontScale[] = [1, 1.15, 1.3, 1.5];
const previewText = '预览字号效果';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export default function FontSizePicker({ visible, onClose }: Props) {
  const theme = useTheme();
  const { fontScale, setFontScale } = useThemeActions();

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.panel, { backgroundColor: theme.colors.cardBg }]}>
          <Text style={[styles.title, { color: theme.colors.textMain, fontSize: theme.text.title.fontSize }]}>
            字号设置
          </Text>

          {scales.map((scale) => {
            const active = fontScale === scale;
            return (
              <Pressable
                key={scale}
                style={[
                  styles.item,
                  {
                    borderColor: active ? theme.colors.primary : theme.colors.border,
                    backgroundColor: active ? theme.colors.primarySoft : 'transparent',
                  },
                ]}
                onPress={() => setFontScale(scale)}
              >
                <Text style={[styles.label, { color: theme.colors.textMain, fontSize: theme.text.body.fontSize }]}>
                  {fontScaleLabels[scale]}
                </Text>
                <Text style={[styles.preview, { color: theme.colors.textSecondary, fontSize: Math.round(15 * scale) }]}>
                  {previewText}
                </Text>
              </Pressable>
            );
          })}

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
    gap: 12,
  },
  title: {
    fontWeight: '700',
    marginBottom: 8,
    textAlign: 'center',
  },
  item: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  label: {
    fontWeight: '600',
    minWidth: 36,
  },
  preview: {
    flex: 1,
    textAlign: 'right',
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
