import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../theme/useTheme';

export default function ImageRecognitionScreen() {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.pageBg,
      paddingHorizontal: theme.spacing.lg,
    },
    title: {
      fontSize: Math.round(24 * theme.fontScale),
      fontWeight: '700',
      color: theme.colors.textMain,
    },
    subtitle: {
      marginTop: theme.spacing.sm,
      color: theme.colors.textSecondary,
      fontSize: Math.round(14 * theme.fontScale),
    },
  });

  return (
    <View style={styles.container} testID="home-screen">
      <Text style={styles.title}>图像识别页</Text>
      <Text style={styles.subtitle}>病虫害图像采集与智能识别</Text>
    </View>
  );
}
