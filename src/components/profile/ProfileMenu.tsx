import React from 'react';
import { StyleSheet } from 'react-native';
import { ListItem } from '@rneui/themed';
import { useTheme } from '../../theme/useTheme';

type MenuItem = {
  label: string;
  icon: string;
  onPress: () => void;
};

type Props = {
  items: MenuItem[];
};

export default function ProfileMenu({ items }: Props) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    item: {
      backgroundColor: theme.colors.cardBg,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
    },
    first: {
      borderTopLeftRadius: theme.radius.lg,
      borderTopRightRadius: theme.radius.lg,
    },
    last: {
      borderBottomLeftRadius: theme.radius.lg,
      borderBottomRightRadius: theme.radius.lg,
    },
    title: {
      fontSize: Math.round(15 * theme.fontScale),
      color: theme.colors.textMain,
    },
  });

  return (
    <>
      {items.map((item, index) => (
        <ListItem
          key={item.label}
          onPress={item.onPress}
          containerStyle={[
            styles.item,
            index === 0 && styles.first,
            index === items.length - 1 && styles.last,
          ]}
          bottomDivider={index < items.length - 1}
        >
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {item.icon} {item.label}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      ))}
    </>
  );
}
