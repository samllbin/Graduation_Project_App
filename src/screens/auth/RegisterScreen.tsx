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
import {loginApi, registerApi, sendRegisterCodeApi} from '../../api/auth';
import {setToken} from '../../store/authStore';
import {saveSession} from '../../store/authSession';
import {validateRegisterInput} from './validators';
import {agriTheme} from '../../theme/agriTheme';

type Props = {
  onBackLogin: () => void;
  onRegisterSuccess: (token: string) => void;
};

export default function RegisterScreen({onBackLogin, onRegisterSuccess}: Props) {
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

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
    if (!email.trim()) {
      setError('请输入邮箱');
      return;
    }
    if (countdown > 0) {
      return;
    }
    try {
      setSendingCode(true);
      setError('');
      setSuccess('');
      const response = await sendRegisterCodeApi({email: email.trim()});
      setSuccess(response.message || '验证码已发送');
      setCountdown(60);
    } catch (e: any) {
      setError(e?.message || '发送失败');
    } finally {
      setSendingCode(false);
    }
  };

  const onSubmit = async () => {
    const validationMessage = validateRegisterInput({
      userName,
      email,
      code,
      password,
      confirmPassword,
    });
    if (validationMessage) {
      setError(validationMessage);
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      const response = await registerApi({
        userName: userName.trim(),
        email: email.trim(),
        code: code.trim(),
        password,
      });
      const registerMessage = response.message || '注册成功';
      const loginResponse = await loginApi({
        login: userName.trim(),
        password,
      });
      const accessToken = loginResponse.data?.access_token || '';
      const refreshToken = loginResponse.data?.refresh_token || '';
      if (!accessToken || !refreshToken) {
        setSuccess(`${registerMessage}，请返回登录`);
        return;
      }
      const user = loginResponse.data?.user;
      const userInfo = user
        ? {id: user.id, userName: user.userName, avatar: user.avatar, signature: user.signature}
        : null;
      setToken(accessToken);
      await saveSession({accessToken, refreshToken, userInfo});
      setSuccess(`${registerMessage}，正在自动登录`);
      onRegisterSuccess(accessToken);
    } catch (e: any) {
      setError(e?.message || '注册失败');
    } finally {
      setLoading(false);
    }
  };

  const sendCodeLabel = countdown > 0 ? `${countdown}s` : '发送验证码';

  return (
    <AuthLayout>
      <Text style={styles.title}>病虫害识别注册</Text>
      <Text style={styles.subtitle}>创建账号并开始诊断病虫害</Text>

      <TextInput
        style={styles.input}
        placeholder="用户名"
        placeholderTextColor="#93a19a"
        value={userName}
        onChangeText={setUserName}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="邮箱"
        placeholderTextColor="#93a19a"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.codeRow}>
        <TextInput
          style={[styles.input, styles.codeInput]}
          placeholder="验证码"
          placeholderTextColor="#93a19a"
          value={code}
          onChangeText={setCode}
        />
        <Pressable
          style={[
            styles.codeButton,
            (sendingCode || countdown > 0) && styles.codeButtonDisabled,
          ]}
          onPress={onSendCode}
          disabled={sendingCode || countdown > 0}>
          {sendingCode ? (
            <ActivityIndicator color={agriTheme.colors.primary} />
          ) : (
            <Text style={styles.codeButtonText}>{sendCodeLabel}</Text>
          )}
        </Pressable>
      </View>

      <TextInput
        style={styles.input}
        placeholder="密码"
        placeholderTextColor="#93a19a"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <TextInput
        style={styles.input}
        placeholder="确认密码"
        placeholderTextColor="#93a19a"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
      />

      {!!error && <Text style={styles.error}>{error}</Text>}
      {!!success && <Text style={styles.success}>{success}</Text>}

      <Pressable style={styles.primaryButton} onPress={onSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.primaryButtonText}>完成注册</Text>
        )}
      </Pressable>

      <Pressable onPress={onBackLogin} style={styles.backLinkWrap}>
        <Text style={styles.link}>返回登录</Text>
      </Pressable>
    </AuthLayout>
  );
}

const styles = StyleSheet.create({
  title: agriTheme.text.title,
  subtitle: {...agriTheme.text.subtitle, marginTop: 6, marginBottom: 16},
  input: {
    borderWidth: 1,
    borderColor: agriTheme.colors.border,
    borderRadius: agriTheme.radius.md,
    paddingHorizontal: 12,
    paddingVertical: 11,
    marginBottom: 12,
    fontSize: 15,
    color: agriTheme.colors.textMain,
    backgroundColor: '#fbfdfb',
  },
  codeRow: {flexDirection: 'row', alignItems: 'center', marginBottom: 12},
  codeInput: {flex: 1, marginBottom: 0},
  codeButton: {
    marginLeft: 8,
    height: 44,
    borderRadius: agriTheme.radius.md,
    borderWidth: 1,
    borderColor: agriTheme.colors.primary,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: agriTheme.colors.primarySoft,
  },
  codeButtonDisabled: {
    borderColor: '#9acbaa',
    backgroundColor: '#f1f8f2',
  },
  codeButtonText: {
    color: agriTheme.colors.primary,
    fontWeight: '600',
    fontSize: 13,
  },
  error: {color: agriTheme.colors.danger, marginBottom: 10},
  success: {color: agriTheme.colors.success, marginBottom: 10},
  primaryButton: {
    marginTop: 2,
    backgroundColor: agriTheme.colors.primary,
    height: 46,
    borderRadius: agriTheme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {color: '#fff', fontSize: 16, fontWeight: '600'},
  backLinkWrap: {marginTop: 14, alignSelf: 'center'},
  link: {color: agriTheme.colors.primary, fontSize: 14, fontWeight: '600'},
});
