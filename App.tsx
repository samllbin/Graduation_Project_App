import React, {useEffect, useState} from 'react';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {StyleSheet, Text, View} from 'react-native';
import {Card} from '@rneui/themed';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import {clearToken} from './src/store/authStore';
import MainTabBar from './src/components/MainTabBar';
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
  const [activeTab, setActiveTab] = useState<MainTabKey>('imageRecognition');

  useEffect(() => {
    if (!showLoginSuccess) {
      return;
    }

    const timer = setTimeout(() => {
      setShowLoginSuccess(false);
    }, 1800);

    return () => clearTimeout(timer);
  }, [showLoginSuccess]);

  const onLogout = () => {
    clearToken();
    setToken('');
    setRoute('login');
    setShowLoginSuccess(false);
    setActiveTab('imageRecognition');
  };

  const onLoginSuccess = (nextToken: string) => {
    setToken(nextToken);
    setRoute('home');
    setShowLoginSuccess(true);
    setActiveTab('imageRecognition');
  };

  const onRegisterSuccess = (nextToken: string) => {
    setToken(nextToken);
    setRoute('home');
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
          <Card containerStyle={styles.toastCard} testID="login-success-snackbar">
            <Text style={styles.toastText}>登录成功</Text>
          </Card>
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: agriTheme.colors.pageBg},
  homeWrap: {flex: 1, backgroundColor: agriTheme.colors.pageBg},
  homeContent: {flex: 1},
  toastCard: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: agriTheme.colors.border,
    margin: 0,
    backgroundColor: '#1f2b22',
  },
  toastText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
