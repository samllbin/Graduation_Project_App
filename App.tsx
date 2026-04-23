import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StyleSheet, View} from 'react-native';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import {
  clearToken,
  setAuthExpiredHandler,
  setToken as setStoreToken,
} from './src/store/authStore';
import {clearSession, getSessionTokens} from './src/store/authSession';
import {logoutApi} from './src/api/auth';
import MainTabBar from './src/components/MainTabBar';
import ToastMessage from './src/components/ToastMessage';
import {MainTabKey} from './src/config/mainTabs';
import ImageRecognitionScreen from './src/screens/main/ImageRecognitionScreen';
import ForumScreen from './src/screens/main/ForumScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import {agriTheme} from './src/theme/agriTheme';

type RouteName = 'login' | 'register' | 'forgot' | 'home';

export default function App() {
  const [route, setRoute] = useState<RouteName>('login');
  const [token, setToken] = useState('');
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);
  const [showReloginNotice, setShowReloginNotice] = useState(false);
  const [activeTab, setActiveTab] = useState<MainTabKey>('imageRecognition');

  useEffect(() => {
    (async () => {
      const session = await getSessionTokens();
      if (!session?.accessToken) {
        return;
      }

      setStoreToken(session.accessToken);
      setToken(session.accessToken);
      setRoute('home');
    })();
  }, []);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      setShowReloginNotice(true);
      setToken('');
      setRoute('login');
      setShowLoginSuccess(false);
      setActiveTab('imageRecognition');
    });

    return () => {
      setAuthExpiredHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!showLoginSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      setShowLoginSuccess(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [showLoginSuccess]);

  useEffect(() => {
    if (!showReloginNotice) {
      return;
    }

    const timer = setTimeout(() => {
      setShowReloginNotice(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [showReloginNotice]);

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {}

    clearToken();
    await clearSession();
    setToken('');
    setRoute('login');
    setShowLoginSuccess(false);
    setShowReloginNotice(false);
    setActiveTab('imageRecognition');
  };

  const onLoginSuccess = (nextToken: string) => {
    setToken(nextToken);
    setRoute('home');
    setShowLoginSuccess(true);
    setShowReloginNotice(false);
    setActiveTab('imageRecognition');
  };

  const onRegisterSuccess = (nextToken: string) => {
    setToken(nextToken);
    setRoute('home');
    setShowReloginNotice(false);
    setActiveTab('imageRecognition');
  };

  const renderHomeContent = () => {
    if (activeTab === 'forum') {
      return <ForumScreen />;
    }

    if (activeTab === 'profile') {
      return <ProfileScreen onLogout={onLogout} />;
    }

    return <ImageRecognitionScreen />;
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

        {route === 'forgot' && (
          <ForgotPasswordScreen onBackLogin={() => setRoute('login')} />
        )}

        {route === 'login' && (
          <LoginScreen
            onGotoRegister={() => setRoute('register')}
            onGotoForgot={() => setRoute('forgot')}
            onLoginSuccess={onLoginSuccess}
          />
        )}

        {route === 'home' && token ? (
          <View style={styles.homeWrap} testID="home-screen">
            <View style={styles.homeContent}>{renderHomeContent()}</View>
            <MainTabBar activeTab={activeTab} onChangeTab={setActiveTab} />
          </View>
        ) : null}

        {showLoginSuccess && (
          <ToastMessage message="登录成功" testID="login-success-snackbar" />
        )}

        {showReloginNotice && (
          <ToastMessage message="请重新登录" testID="relogin-snackbar" />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: agriTheme.colors.pageBg},
  homeWrap: {flex: 1, backgroundColor: agriTheme.colors.pageBg},
  homeContent: {flex: 1},
});
