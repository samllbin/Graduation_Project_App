import React from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {agriTheme} from '../theme/agriTheme';

type Props = {children: React.ReactNode};

export default function AuthLayout({children}: Props) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.flex}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContainer}>
          <View style={styles.card}>{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {flex: 1},
  safeArea: {flex: 1, backgroundColor: agriTheme.colors.pageBg},
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: agriTheme.spacing.lg,
    paddingVertical: agriTheme.spacing.xl,
  },
  card: {
    backgroundColor: agriTheme.colors.cardBg,
    borderRadius: agriTheme.radius.lg,
    borderWidth: 1,
    borderColor: agriTheme.colors.border,
    padding: agriTheme.spacing.lg,
    shadowColor: '#1f2937',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
});
