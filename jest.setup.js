const mockSessionStore = new Map();

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    NavigationContainer: ({children}: {children: React.ReactNode}) => children,
    useNavigation: () => ({
      navigate: jest.fn(),
      replace: jest.fn(),
      goBack: jest.fn(),
      getParent: jest.fn(() => ({setOptions: jest.fn()})),
    }),
    useFocusEffect: jest.fn((cb) => cb()),
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({children}: any) => {
      const ReactLib = require('react');
      return ReactLib.createElement('div', null, children);
    },
    Screen: ({children, component: Component}: any) => {
      const ReactLib = require('react');
      if (typeof children === 'function') {
        return children({navigation: {navigate: jest.fn(), replace: jest.fn(), goBack: jest.fn()}});
      }
      if (Component) {
        return ReactLib.createElement(Component, {navigation: {navigate: jest.fn(), replace: jest.fn(), goBack: jest.fn()}});
      }
      return children || null;
    },
  }),
}));

jest.mock('@react-navigation/bottom-tabs', () => ({
  createBottomTabNavigator: () => ({
    Navigator: ({children}: any) => {
      const ReactLib = require('react');
      const childArray = ReactLib.Children.toArray(children);
      // Render first tab's content + a mock tab bar with all tabs
      let firstContent = null;
      const tabs = [];
      for (const child of childArray) {
        if (!firstContent) {
          if (typeof child?.props?.children === 'function') {
            firstContent = child.props.children();
          } else if (child?.props?.component) {
            const Component = child.props.component;
            firstContent = ReactLib.createElement(Component);
          }
        }
        tabs.push({name: child?.props?.name});
      }
      const MainTabBar = require('./src/components/MainTabBar').default;
      return ReactLib.createElement(ReactLib.Fragment, null,
        firstContent,
        ReactLib.createElement(MainTabBar, {
          activeTab: tabs[0]?.name,
          onChangeTab: jest.fn(),
        })
      );
    },
    Screen: () => null,
  }),
}));

jest.mock('react-native-device-info', () => ({
  __esModule: true,
  default: {
    getUniqueId: jest.fn(() => Promise.resolve('mock-device-id')),
  },
}));

jest.mock('react-native-keychain', () => ({
  __esModule: true,
  getGenericPassword: jest.fn(({service}) => {
    if (!mockSessionStore.has(service)) {
      return Promise.resolve(false);
    }
    return Promise.resolve({
      username: 'session',
      password: mockSessionStore.get(service),
    });
  }),
  setGenericPassword: jest.fn((username, password, {service}) => {
    mockSessionStore.set(service, password);
    return Promise.resolve(true);
  }),
  resetGenericPassword: jest.fn(({service}) => {
    mockSessionStore.delete(service);
    return Promise.resolve(true);
  }),
}));
