import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Button} from '@rneui/themed';
import {agriTheme} from '../../theme/agriTheme';

type Props = {
  onLogout: () => void;
};

export default function ProfileScreen({onLogout}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>个人中心页</Text>
      <Text style={styles.subtitle}>病虫害识别账户与记录管理</Text>
      <View style={styles.buttonWrap}>
        <Button
          title="退出登录"
          onPress={onLogout}
          buttonStyle={styles.button}
          titleStyle={styles.buttonText}
        />
      </View>
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
  buttonWrap: {
    marginTop: agriTheme.spacing.lg,
    width: 180,
  },
  button: {
    backgroundColor: agriTheme.colors.primary,
    borderRadius: agriTheme.radius.md,
    height: 44,
  },
  buttonText: {
    fontWeight: '600',
  },
});
