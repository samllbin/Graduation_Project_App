import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Input, Button } from '@rneui/themed';
import { changePasswordApi } from '../../api/user';
import { clearToken, clearUserInfo } from '../../store/authStore';
import { clearSession } from '../../store/authSession';
import { useTheme } from '../../theme/useTheme';

type RootStackParamList = {
  ForgotPassword: undefined;
};

type Props = {
  onSuccess?: () => void;
};

export default function ChangePasswordScreen({ onSuccess }: Props) {
  const theme = useTheme();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async () => {
    if (!currentPassword) {
      setError('请输入当前密码');
      return;
    }
    if (!newPassword) {
      setError('请输入新密码');
      return;
    }
    if (newPassword.length < 6) {
      setError('新密码长度不能小于6位');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await changePasswordApi({ currentPassword, newPassword });
      if (res.code === 200) {
        clearToken();
        clearUserInfo();
        await clearSession();
        onSuccess?.();
      } else {
        setError(res.message || '修改失败');
      }
    } catch (e: any) {
      setError(e?.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.pageBg,
    },
    form: {
      paddingHorizontal: theme.spacing.lg,
      paddingTop: theme.spacing.xl,
    },
    inputContainer: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 12,
      backgroundColor: theme.colors.cardBg,
    },
    inputText: {
      fontSize: Math.round(15 * theme.fontScale),
      color: theme.colors.textMain,
    },
    label: {
      fontSize: Math.round(14 * theme.fontScale),
      fontWeight: '600',
      color: theme.colors.textMain,
      marginBottom: 6,
    },
    error: {
      color: theme.colors.danger,
      marginBottom: theme.spacing.md,
      fontSize: Math.round(14 * theme.fontScale),
    },
    primaryButton: {
      backgroundColor: theme.colors.primary,
      height: 46,
      borderRadius: theme.radius.md,
    },
    primaryButtonText: {
      fontSize: Math.round(16 * theme.fontScale),
      fontWeight: '600',
    },
    footer: {
      marginTop: theme.spacing.lg,
      alignItems: 'center',
    },
    link: {
      color: theme.colors.primary,
      fontSize: Math.round(14 * theme.fontScale),
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Input
          label="当前密码"
          placeholder="请输入当前密码"
          secureTextEntry
          value={currentPassword}
          onChangeText={setCurrentPassword}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          labelStyle={styles.label}
          placeholderTextColor={theme.colors.textSecondary}
        />
        <Input
          label="新密码"
          placeholder="请输入新密码"
          secureTextEntry
          value={newPassword}
          onChangeText={setNewPassword}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          labelStyle={styles.label}
          placeholderTextColor={theme.colors.textSecondary}
        />
        <Input
          label="确认新密码"
          placeholder="请再次输入新密码"
          secureTextEntry
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          inputContainerStyle={styles.inputContainer}
          inputStyle={styles.inputText}
          labelStyle={styles.label}
          placeholderTextColor={theme.colors.textSecondary}
        />

        {!!error && <Text style={styles.error}>{error}</Text>}

        <Button
          title={loading ? '' : '确认修改'}
          onPress={onSubmit}
          disabled={loading}
          buttonStyle={styles.primaryButton}
          titleStyle={styles.primaryButtonText}
          icon={loading ? <ActivityIndicator color="#fff" /> : undefined}
        />
      </View>

      <View style={styles.footer}>
        <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
          <Text style={styles.link}>忘记密码？</Text>
        </Pressable>
      </View>
    </View>
  );
}
