import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {Card} from '@rneui/themed';
import {agriTheme} from '../theme/agriTheme';

type Props = {
  message: string;
  testID?: string;
};

export default function ToastMessage({message, testID}: Props) {
  return (
    <View testID={testID}>
      <Card containerStyle={styles.toastCard}>
        <Text style={styles.toastText}>{message}</Text>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  toastCard: {
    position: 'absolute',
    top: 18,
    left: 16,
    right: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: agriTheme.colors.border,
    margin: 0,
    backgroundColor: '#1f2b22',
  },
  toastText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
});
