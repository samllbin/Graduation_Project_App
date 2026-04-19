/**
 * @format
 */

import React from 'react';
import {Text} from 'react-native';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
import LoginScreen from '../src/screens/auth/LoginScreen';

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({children}: {children: React.ReactNode}) => children,
}));

describe('App auth flow', () => {
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

  test('home screen keeps logout button', async () => {
    let renderer: ReactTestRenderer.ReactTestRenderer;
    await ReactTestRenderer.act(() => {
      renderer = ReactTestRenderer.create(<App />);
    });

    const loginScreen = renderer!.root.findByType(LoginScreen);
    await ReactTestRenderer.act(() => {
      loginScreen.props.onLoginSuccess('token-2');
    });

    expect(
      renderer!.root.findAllByType(Text).some(node => node.props.children === '退出登录'),
    ).toBe(true);
  });
});
