import React from 'react';
import { View, ActivityIndicator, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';

export interface LoadingIndicatorProps {
  message?: string;
  size?: 'small' | 'large';
  fullscreen?: boolean;
  style?: ViewStyle;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  message,
  size = 'large',
  fullscreen = false,
  style,
}) => {
  const { colors, spacing } = useTheme();

  return (
    <View
      style={[
        fullscreen ? styles.fullscreen : styles.inline,
        { backgroundColor: fullscreen ? colors.background : 'transparent' },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={colors.primary} />
      {message && (
        <AppText
          variant="caption"
          color={colors.secondaryText}
          style={{ marginTop: spacing.md }}
        >
          {message}
        </AppText>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  fullscreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inline: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
