import React from 'react';
import {StyleSheet} from 'react-native';
import {ListItem} from '@rneui/themed';
import {agriTheme} from '../../theme/agriTheme';

type MenuItem = {
  label: string;
  icon: string;
  onPress: () => void;
};

type Props = {
  items: MenuItem[];
};

export default function ProfileMenu({items}: Props) {
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
          bottomDivider={index < items.length - 1}>
          <ListItem.Content>
            <ListItem.Title style={styles.title}>
              {item.icon}  {item.label}
            </ListItem.Title>
          </ListItem.Content>
          <ListItem.Chevron />
        </ListItem>
      ))}
    </>
  );
}

const styles = StyleSheet.create({
  item: {
    backgroundColor: agriTheme.colors.cardBg,
    paddingHorizontal: agriTheme.spacing.lg,
    paddingVertical: agriTheme.spacing.md,
  },
  first: {
    borderTopLeftRadius: agriTheme.radius.lg,
    borderTopRightRadius: agriTheme.radius.lg,
  },
  last: {
    borderBottomLeftRadius: agriTheme.radius.lg,
    borderBottomRightRadius: agriTheme.radius.lg,
  },
  title: {
    fontSize: 15,
    color: agriTheme.colors.textMain,
  },
});
