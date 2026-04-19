import React, {useEffect, useState} from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AuthLayout from '../../components/AuthLayout';
import {resetForgotPasswordApi, sendForgotCodeApi} from '../../api/auth';
import {validateForgotInput} from './validators';

type Props = {
  onBackLogin: () => void;
};

export default function ForgotPasswordScreen({onBackLogin}: Props) {
  const [login, setLogin] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sendingCode, setSendingCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }
    const timer = setTimeout(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const onSendCode = async () => {
    if (!login.trim()) {
      setError('请输入账号或邮箱');
      return;
    }
    if (countdown > 0) {
      return;
    }
    try {
      setSendingCode(true);
      setError('');
      setSuccess('');
      const response = await sendForgotCodeApi({login: login.trim()});
      setSuccess(response.message || '验证码已发送');
      setCountdown(60);
    } catch (e: any) {
      setError(e?.message || '发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = async () => {
    const validationMessage = validateForgotInput({
      login,
      code,
      newPassword,
    });
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await resetForgotPasswordApi({
        login: login.trim(),
        code: code.trim(),
        newPassword,
      });
      setSuccess(response.message || '密码重置成功，请返回登录');
    } catch (e: any) {
      setError(e?.message || '重置失败');
    } finally {
      setLoading(false);
    }
  };

  const sendCodeLabel = countdown > 0 ? `${countdown}s` : '发送验证码';

  return (
    <AuthLayout>
      <Text style={styles.title}>找回密码</Text>
      <Text style={styles.subtitle}>通过账号名/邮箱获取验证码并重置密码</Text>

      <TextInput
        style={styles.input}
        placeholder="账号名/邮箱"
        value={login}
        onChangeText={setLogin}
        autoCapitalize="none"
      />

      <View style={styles.codeRow}>
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="验证码"
          value={code}
          onChangeText={setCode}
        />
        <Pressable
          style={[styles.codeButton, (sendingCode || countdown > 0) && styles.codeButtonDisabled]}
          onPress={onSendCode}
          disabled={sendingCode || countdown > 0}>
          {sendingCode ? (
            <ActivityIndicator color="#2563eb" />
          ) : (
            <Text style={styles.codeButtonText}>{sendCodeLabel}</Text>
          )}
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="新密码"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!success && <Text style={styles.success}>{success}</Text>}

      <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>重置密码</Text>
        )}
      </Pressable>

      <Pressable onPress={onBackLogin} style={styles.backLinkWrap}>
        <Text style={styles.link}>返回登录</Text>
      </Pressable>
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
  codeRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  codeInput: {flex: 1, marginBottom: 0},
  codeButton: {
    marginLeft: 8,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#2563eb',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeButtonDisabled: {
    borderColor: '#93c5fd',
    backgroundColor: '#eff6ff',
  },
  codeButtonText: {color: '#2563eb', fontWeight: '600', fontSize: 13},
  error: {color: '#dc2626', marginBottom: 10},
  success: {color: '#16a34a', marginBottom: 10},
  primaryButton: {
    marginTop: 2,
    backgroundColor: '#2563eb',
    height: 46,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  backLinkWrap: {marginTop: 14, alignSelf: 'center'},
  link: {color: '#2563eb', fontSize: 14, fontWeight: '500'},
});
