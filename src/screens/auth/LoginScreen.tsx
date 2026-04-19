import React, {useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AuthLayout from '../../components/AuthLayout';
import {loginApi} from '../../api/auth';
import {setToken} from '../../store/authStore';
import {validateLoginInput} from './validators';

type Props = {
  onGotoRegister: () => void;
  onGotoForgot: () => void;
  onLoginSuccess: (token: string) => void;
};

export default function LoginScreen({
  onGotoRegister,
  onGotoForgot,
  onLoginSuccess,
}: Props) {
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
      const token = response.data?.access_token || '';
      if (!token) {
        setError(response.message || '登录失败');
        return;
      }
      setToken(token);
      onLoginSuccess(token);
    } catch (e: any) {
      setError(e?.message || '网络错误，请稍后再试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <Text style={styles.title}>登录</Text>
      <Text style={styles.subtitle}>支持用户名或邮箱登录</Text>

      <TextInput
        style={styles.input}
        placeholder="账号（用户名或邮箱）"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="密码"
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

const styles = StyleSheet.create({
  title: {fontSize: 28, fontWeight: '700', color: '#111827'},
  subtitle: {fontSize: 14, color: '#6b7280', marginTop: 6, marginBottom: 16},
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
    fontSize: 15,
    color: '#111827',
  },
  error: {color: '#dc2626', marginBottom: 10},
  primaryButton: {
    marginTop: 2,
    backgroundColor: '#2563eb',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  linkRow: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  link: {color: '#2563eb', fontSize: 14, fontWeight: '500'},
});
