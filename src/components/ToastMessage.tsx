import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Card } from '@rneui/themed';
import { useTheme } from '../theme/useTheme';

type Props = {
  message: string;
  testID?: string;
};

export default function ToastMessage({ message, testID }: Props) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    toastCard: {
      position: 'absolute',
      top: 18,
      left: 16,
      right: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.colors.border,
      margin: 0,
      backgroundColor: theme.colors.textMain,
    },
    toastText: {
      color: theme.colors.cardBg,
      textAlign: 'center',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View testID={testID}>
      <Card containerStyle={styles.toastCard}>
        <Text style={styles.toastText}>{message}</Text>
      </Card>
    </View>
  );
}
