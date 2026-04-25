import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/useTheme';

type Props = {
  message: string;
  testID?: string;
};

export default function ToastMessage({ message, testID }: Props) {
  const theme = useTheme();

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.colors.textMain,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      alignItems: 'center',
    },
    text: {
      color: theme.colors.cardBg,
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <View style={styles.container} testID={testID}>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}
