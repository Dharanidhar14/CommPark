import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';
import { AppIcon } from './AppIcon';
import { AppButton } from './AppButton';

export interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  style,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.errorBackground,
            borderColor: colors.error,
            borderRadius: radius.pill,
          },
        ]}
      >
        <AppIcon name="alert-circle-outline" size={36} color={colors.error} />
      </View>

      <AppText variant="h3" align="center" style={{ marginTop: spacing.lg }}>
        {title}
      </AppText>

      <AppText
        variant="body"
        align="center"
        color={colors.secondaryText}
        style={{ marginTop: spacing.xs, maxWidth: 300 }}
      >
        {message}
      </AppText>

      {onRetry && (
        <View style={{ marginTop: spacing.xl, width: '100%', maxWidth: 200 }}>
          <AppButton title="Try Again" onPress={onRetry} variant="primary" size="md" />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
