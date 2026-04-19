import React, {useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StyleSheet, Text, View} from 'react-native';
import {Button, Card} from '@rneui/themed';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import {clearToken} from './src/store/authStore';

type RouteName = 'login' | 'register' | 'forgot' | 'home';

function HomeScreen({onLogout}: {onLogout: () => void}) {
  return (
    <View style={styles.homeWrap} testID="home-screen">
      <Button title="退出登录" onPress={onLogout} />
    </View>
  );
}

export default function App() {
  const [route, setRoute] = useState<RouteName>('login');
  const [token, setToken] = useState('');
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);


  const onLogout = () => {
    clearToken();
    setToken('');
    setRoute('login');
    setShowLoginSuccess(false);
  };

  const onLoginSuccess = (nextToken: string) => {
    setToken(nextToken);
    setRoute('home');
    setShowLoginSuccess(true);
  };

  const onRegisterSuccess = (nextToken: string) => {
    setToken(nextToken);
    setRoute('home');
  };

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        {route === 'register' && (
          <RegisterScreen
            onBackLogin={() => setRoute('login')}
            onRegisterSuccess={onRegisterSuccess}
          />
        )}

        {route === 'forgot' && <ForgotPasswordScreen onBackLogin={() => setRoute('login')} />}

        {route === 'login' && (
          <LoginScreen
            onGotoRegister={() => setRoute('register')}
            onGotoForgot={() => setRoute('forgot')}
            onLoginSuccess={onLoginSuccess}
          />
        )}

        {route === 'home' && token ? <HomeScreen onLogout={onLogout} /> : null}

        {showLoginSuccess && (
          <Card containerStyle={styles.toastCard} testID="login-success-snackbar">
            <Text style={styles.toastText}>登录成功</Text>
          </Card>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1},
  homeWrap: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 24,
    backgroundColor: '#ffffff',
  },
  toastCard: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    borderRadius: 12,
    margin: 0,
    backgroundColor: '#111827',
  },
  toastText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
