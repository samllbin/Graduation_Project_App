import React, {useCallback, useState} from 'react';
import {ActivityIndicator, Pressable, StyleSheet, Text, View} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {useNavigation} from '@react-navigation/native';
import {Input, Button} from '@rneui/themed';
import {changePasswordApi} from '../../api/user';
import {clearToken, clearUserInfo} from '../../store/authStore';
import {clearSession} from '../../store/authSession';
import {agriTheme} from '../../theme/agriTheme';

type RootStackParamList = {
  Login: undefined;
  ForgotPassword: undefined;
};

export default function ChangePasswordScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useFocusEffect(
    useCallback(() => {
      const parent = navigation.getParent();
      parent?.setOptions({tabBarStyle: {display: 'none'}});
      return () => parent?.setOptions({tabBarStyle: undefined});
    }, [navigation]),
  );

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
      const res = await changePasswordApi({currentPassword, newPassword});
      if (res.code === 200) {
        clearToken();
        clearUserInfo();
        await clearSession();
        navigation.navigate('Login');
      } else {
        setError(res.message || '修改失败');
      }
    } catch (e: any) {
      setError(e?.message || '修改失败');
    } finally {
      setLoading(false);
    }
  };

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: agriTheme.colors.pageBg,
  },
  form: {
    paddingHorizontal: agriTheme.spacing.lg,
    paddingTop: agriTheme.spacing.xl,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: agriTheme.colors.border,
    borderRadius: agriTheme.radius.md,
    paddingHorizontal: 12,
    backgroundColor: '#fbfdfb',
  },
  inputText: {
    fontSize: 15,
    color: agriTheme.colors.textMain,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: agriTheme.colors.textMain,
    marginBottom: 6,
  },
  error: {
    color: agriTheme.colors.danger,
    marginBottom: agriTheme.spacing.md,
    fontSize: 14,
  },
  primaryButton: {
    backgroundColor: agriTheme.colors.primary,
    height: 46,
    borderRadius: agriTheme.radius.md,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    marginTop: agriTheme.spacing.lg,
    alignItems: 'center',
  },
  link: {
    color: agriTheme.colors.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
