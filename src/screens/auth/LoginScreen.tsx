import React, { useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import AuthLayout from '../../components/AuthLayout';
import { loginApi } from '../../api/auth';
import { setToken, setUserInfo } from '../../store/authStore';
import { saveSession } from '../../store/authSession';
import { validateLoginInput } from './validators';
import { useTheme } from '../../theme/useTheme';

type Props = {
  onGotoRegister: () => void;
  onGotoForgot: () => void;
  onLoginSuccess: (token: string) => void;
};

export default function LoginScreen({ onGotoRegister, onGotoForgot, onLoginSuccess }: Props) {
  const theme = useTheme();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    const validationMessage = validateLoginInput(login, password);
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setLoading(true);
      setError('');
      const response = await loginApi({
        login: login.trim(),
        password,
      });
      const accessToken = response.data?.access_token || '';
      const refreshToken = response.data?.refresh_token || '';
      if (!accessToken || !refreshToken) {
        setError(response.message || '登录失败');
        return;
      }
      const user = response.data?.user;
      const userInfo = user
        ? { id: user.id, userName: user.userName, avatar: user.avatar, signature: user.signature }
        : null;
      setToken(accessToken);
      setUserInfo(userInfo);
      await saveSession({ accessToken, refreshToken, userInfo });
      onLoginSuccess(accessToken);
    } catch (e: any) {
      setError(e?.message || '网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  const styles = StyleSheet.create({
    title: theme.text.title,
    subtitle: { ...theme.text.subtitle, marginTop: 6, marginBottom: 16 },
    input: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: 12,
      paddingVertical: 11,
      marginBottom: 12,
      fontSize: Math.round(15 * theme.fontScale),
      color: theme.colors.textMain,
      backgroundColor: theme.colors.cardBg,
    },
    error: { color: theme.colors.danger, marginBottom: 10 },
    primaryButton: {
      marginTop: 2,
      backgroundColor: theme.colors.primary,
      height: 46,
      borderRadius: theme.radius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButtonText: { color: '#fff', fontSize: Math.round(16 * theme.fontScale), fontWeight: '600' },
    linkRow: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    link: { color: theme.colors.primary, fontSize: Math.round(14 * theme.fontScale), fontWeight: '600' },
  });

  return (
    <AuthLayout>
      <Text style={styles.title}>登录</Text>
      <Text style={styles.subtitle}>支持用户名或邮箱登录</Text>

      <TextInput
        style={styles.input}
        placeholder="账号（用户名或邮箱）"
        placeholderTextColor={theme.colors.textSecondary}
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
        placeholderTextColor={theme.colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}

      <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>登录</Text>
        )}
      </Pressable>

      <View style={styles.linkRow}>
        <Pressable onPress={onGotoRegister}>
          <Text style={styles.link}>去注册</Text>
        </Pressable>
        <Pressable onPress={onGotoForgot}>
          <Text style={styles.link}>找回密码</Text>
        </Pressable>
      </View>
    </AuthLayout>
  );
}
