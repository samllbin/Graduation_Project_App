/**
 * @format
 */

import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import LoginScreen from '../src/screens/auth/LoginScreen';
import MainTabBar from '../src/components/MainTabBar';

jest.mock('react-native-safe-area-context', () => {
  const ReactLib = require('react');
  return {
    SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
    SafeAreaView: ({children}: {children: React.ReactNode}) =>
      ReactLib.createElement(ReactLib.Fragment, null, children),
  };
});

describe('App auth flow', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  test('shows success feedback and navigates to home after login', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });

    const loginScreen = renderer!.root.findByType(LoginScreen);
    await ReactTestRenderer.act(() => {
      loginScreen.props.onLoginSuccess('token-1');
    });

    expect(renderer!.root.findAllByProps({testID: 'home-screen'}).length).toBeGreaterThan(0);
    expect(
      renderer!.root.findAllByProps({testID: 'login-success-snackbar'}).length,
    ).toBeGreaterThan(0);
  });

  test('home screen keeps logout button in profile tab', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });

    const loginScreen = renderer!.root.findByType(LoginScreen);
    await ReactTestRenderer.act(() => {
      loginScreen.props.onLoginSuccess('token-2');
    });

    const tabBar = renderer!.root.findByType(MainTabBar);
    await ReactTestRenderer.act(() => {
      tabBar.props.onChangeTab('profile');
    });

    expect(
      renderer!.root.findAll(node => node.props?.title === '退出登录').length,
    ).toBeGreaterThan(0);
  });
});
