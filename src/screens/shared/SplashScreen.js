import React from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

export default function SplashScreen() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Text variant="displaySmall" style={{ color: theme.colors.primary, marginBottom: 20 }}>
        {t('splash.app_title')}
      </Text>
      <ActivityIndicator size="large" color={theme.colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
