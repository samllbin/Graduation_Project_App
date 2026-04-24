const React = require('react');

function createNativeStackNavigator() {
  const Screen = (props) => null;

  const Navigator = ({ children, screenOptions, initialRouteName }) => {
    const screens = React.Children.toArray(children);
    const [currentRoute, setCurrentRoute] = React.useState(initialRouteName || screens[0]?.props?.name);

    const navigation = React.useMemo(
      () => ({
        navigate: (name, params) => setCurrentRoute(name),
        goBack: () => setCurrentRoute(screens[0]?.props?.name),
        setOptions: () => {},
      }),
      [screens],
    );

    const activeScreen = screens.find((s) => s.props?.name === currentRoute) || screens[0];
    if (!activeScreen) return null;

    const { children: renderFn, component: Component } = activeScreen.props;
    const route = { name: currentRoute, params: {} };

    if (renderFn) {
      return renderFn({ navigation, route });
    }
    if (Component) {
      return React.createElement(Component, { navigation, route });
    }
    return null;
  };

  return { Navigator, Screen };
}

module.exports = { createNativeStackNavigator };
