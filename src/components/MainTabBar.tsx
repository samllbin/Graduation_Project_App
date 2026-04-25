import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { mainTabItems, MainTabKey } from '../config/mainTabs';
import { useTheme } from '../theme/useTheme';

type Props = {
  activeTab: MainTabKey;
  onChangeTab: (tab: MainTabKey) => void;
  unreadCount?: number;
};

export default function MainTabBar({ activeTab, onChangeTab, unreadCount = 0 }: Props) {
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
      position: 'relative',
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
    badge: {
      position: 'absolute',
      top: -2,
      right: '20%',
      minWidth: 16,
      height: 16,
      borderRadius: 8,
      backgroundColor: theme.colors.danger,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
    },
    badgeText: {
      color: '#fff',
      fontSize: 10,
      fontWeight: '700',
    },
    dot: {
      position: 'absolute',
      top: 0,
      right: '22%',
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: theme.colors.danger,
    },
  });

  return (
    <View style={styles.wrap}>
      {mainTabItems.map(item => {
        const focused = item.key === activeTab;
        const showBadge = item.key === 'message' && unreadCount > 0;
        return (
          <Pressable key={item.key} style={styles.tabItem} onPress={() => onChangeTab(item.key)}>
            <Text style={[styles.icon, focused && styles.iconFocused]}>{item.icon}</Text>
            <Text style={[styles.label, focused && styles.labelFocused]}>{item.title}</Text>
            {showBadge && (
              unreadCount > 99 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>99+</Text>
                </View>
              ) : unreadCount > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount}</Text>
                </View>
              ) : (
                <View style={styles.dot} />
              )
            )}
          </Pressable>
        );
      })}
    </View>
  );
}
