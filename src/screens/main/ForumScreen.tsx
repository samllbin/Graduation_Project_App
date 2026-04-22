import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {agriTheme} from '../../theme/agriTheme';

export default function ForumScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>问题论坛页</Text>
      <Text style={styles.subtitle}>病虫害问题交流与经验分享</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: agriTheme.colors.pageBg,
    paddingHorizontal: agriTheme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: agriTheme.colors.textMain,
  },
  subtitle: {
    marginTop: agriTheme.spacing.sm,
    color: agriTheme.colors.textSecondary,
    fontSize: 14,
  },
});
