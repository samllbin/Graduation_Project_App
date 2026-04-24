import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/auth/LoginScreen';
import RegisterScreen from './src/screens/auth/RegisterScreen';
import ForgotPasswordScreen from './src/screens/auth/ForgotPasswordScreen';
import ImageRecognitionScreen from './src/screens/main/ImageRecognitionScreen';
import ForumScreen from './src/screens/main/ForumScreen';
import ProfileScreen from './src/screens/main/ProfileScreen';
import ChangePasswordScreen from './src/screens/main/ChangePasswordScreen';
import LikedPostsScreen from './src/screens/main/LikedPostsScreen';
import CreatePostScreen from './src/screens/main/CreatePostScreen';
import PostDetailScreen from './src/screens/main/PostDetailScreen';
import ToastMessage from './src/components/ToastMessage';
import MainTabBar from './src/components/MainTabBar';
import AppThemeProvider from './src/theme/AppThemeProvider';
import {
  clearToken,
  clearUserInfo,
  setAuthExpiredHandler,
  setToken as setStoreToken,
  setUserInfo,
} from './src/store/authStore';
import { clearSession, getSessionTokens, getStoredUserInfo } from './src/store/authSession';
import { logoutApi } from './src/api/auth';
import { createTheme } from './src/theme/agriTheme';

const staticTheme = createTheme('light', 1);

const Stack = createNativeStackNavigator();

function HomeTabs({
  onLogout,
  showLoginSuccess,
}: {
  onLogout: () => void;
  showLoginSuccess: boolean;
}) {
  const [activeTab, setActiveTab] = React.useState('imageRecognition');

  return (
    <View style={styles.homeWrap} testID="home-screen">
      <View style={styles.homeContent}>
        {activeTab === 'forum' && <ForumScreen />}
        {activeTab === 'profile' && <ProfileScreen onLogout={onLogout} />}
        {activeTab !== 'forum' && activeTab !== 'profile' && <ImageRecognitionScreen />}
      </View>
      <MainTabBar activeTab={activeTab as any} onChangeTab={setActiveTab as any} />
      {showLoginSuccess && <ToastMessage message="登录成功" testID="login-success-snackbar" />}
    </View>
  );
}

function AppInner() {
  const [initializing, setInitializing] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showReloginNotice, setShowReloginNotice] = useState(false);
  const [showLoginSuccess, setShowLoginSuccess] = useState(false);

  useEffect(() => {
    (async () => {
      const session = await getSessionTokens();
      if (session?.accessToken) {
        setStoreToken(session.accessToken);
        const userInfo = await getStoredUserInfo();
        if (userInfo) {
          setUserInfo(userInfo);
        }
        setIsLoggedIn(true);
      }
      setInitializing(false);
    })();
  }, []);

  useEffect(() => {
    setAuthExpiredHandler(() => {
      setShowReloginNotice(true);
      setTimeout(() => {
        setShowReloginNotice(false);
        setIsLoggedIn(false);
      }, 1800);
    });
    return () => setAuthExpiredHandler(null);
  }, []);

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {}
    clearToken();
    clearUserInfo();
    await clearSession();
    setShowReloginNotice(false);
    setShowLoginSuccess(false);
    setIsLoggedIn(false);
  };

  if (initializing) {
    return (
      <View style={styles.container} />
    );
  }

  return (
    <>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: staticTheme.colors.pageBg },
            headerTintColor: staticTheme.colors.primary,
            headerTitleStyle: { color: staticTheme.colors.textMain, fontWeight: '700' },
            contentStyle: { backgroundColor: staticTheme.colors.pageBg },
          }}
        >
          {isLoggedIn ? (
            <>
              <Stack.Screen name="Home" options={{ headerShown: false }}>
                {() => <HomeTabs onLogout={onLogout} showLoginSuccess={showLoginSuccess} />}
              </Stack.Screen>
              <Stack.Screen
                name="ChangePassword"
                component={ChangePasswordScreen}
                options={{ title: '修改密码' }}
              />
              <Stack.Screen
                name="LikedPosts"
                component={LikedPostsScreen}
                options={{ title: '我点赞的帖子' }}
              />
              <Stack.Screen
                name="CreatePost"
                component={CreatePostScreen}
                options={{ title: '发布帖子' }}
              />
              <Stack.Screen
                name="PostDetail"
                component={PostDetailScreen}
                options={{ title: '帖子详情' }}
              />
              <Stack.Screen name="ForgotPassword" options={{ title: '找回密码' }}>
                {() => <ForgotPasswordScreen onResetSuccess={onLogout} />}
              </Stack.Screen>
            </>
          ) : (
            <>
              <Stack.Screen name="Login" options={{ headerShown: false }}>
                {() => (
                  <LoginScreen
                    onGotoRegister={() => {}}
                    onGotoForgot={() => {}}
                    onLoginSuccess={() => {
                      setIsLoggedIn(true);
                      setShowLoginSuccess(true);
                      setTimeout(() => setShowLoginSuccess(false), 1800);
                    }}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="Register" options={{ title: '注册' }}>
                {() => (
                  <RegisterScreen
                    onBackLogin={() => {}}
                    onRegisterSuccess={() => {
                      setIsLoggedIn(true);
                      setShowLoginSuccess(true);
                      setTimeout(() => setShowLoginSuccess(false), 1800);
                    }}
                  />
                )}
              </Stack.Screen>
              <Stack.Screen name="ForgotPassword" options={{ title: '找回密码' }}>
                {({navigation}) => <ForgotPasswordScreen onBackLogin={() => navigation.goBack()} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>

      {showReloginNotice && (
        <View style={styles.toastWrap}>
          <ToastMessage message="请重新登录" testID="relogin-snackbar" />
        </View>
      )}
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppThemeProvider>
        <AppInner />
      </AppThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: staticTheme.colors.pageBg },
  homeWrap: { flex: 1, backgroundColor: staticTheme.colors.pageBg },
  homeContent: { flex: 1 },
  toastWrap: {
    position: 'absolute',
    top: 60,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 999,
  },
});
