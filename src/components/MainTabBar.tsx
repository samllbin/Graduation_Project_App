import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { mainTabItems, MainTabKey } from '../config/mainTabs';
import { useTheme } from '../theme/useTheme';

type Props = {
  activeTab: MainTabKey;
  onChangeTab: (tab: MainTabKey) => void;
};

export default function MainTabBar({ activeTab, onChangeTab }: Props) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      backgroundColor: theme.colors.tabBg,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      paddingTop: 8,
      paddingBottom: 10,
    },
    tabItem: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
    },
    icon: {
      fontSize: 18,
      color: theme.colors.tabInactive,
    },
    iconFocused: {
      color: theme.colors.tabActive,
    },
    label: {
      fontSize: 12,
      color: theme.colors.tabInactive,
      fontWeight: '500',
    },
    labelFocused: {
      color: theme.colors.tabActive,
      fontWeight: '700',
    },
  });

  return (
    <View style={styles.wrap}>
      {mainTabItems.map(item => {
        const focused = item.key === activeTab;
        return (
          <Pressable key={item.key} style={styles.tabItem} onPress={() => onChangeTab(item.key)}>
            <Text style={[styles.icon, focused && styles.iconFocused]}>{item.icon}</Text>
            <Text style={[styles.label, focused && styles.labelFocused]}>{item.title}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}
