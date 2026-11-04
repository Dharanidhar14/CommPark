import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';
import { AppIcon, IconName } from './AppIcon';
import { AppButton } from './AppButton';

export interface EmptyStateProps {
  icon?: IconName;
  title: string;
  description: string;
  actionTitle?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = 'file-tray-outline',
  title,
  description,
  actionTitle,
  onAction,
  style,
}) => {
  const { colors, spacing, radius } = useTheme();

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.iconCircle,
          {
            backgroundColor: colors.surfaceSubtle,
            borderColor: colors.border,
            borderRadius: radius.pill,
          },
        ]}
      >
        <AppIcon name={icon} size={36} color={colors.secondaryText} />
      </View>

      <AppText variant="h3" align="center" style={{ marginTop: spacing.lg }}>
        {title}
      </AppText>

      <AppText
        variant="body"
        align="center"
        color={colors.secondaryText}
        style={{ marginTop: spacing.xs, maxWidth: 280 }}
      >
        {description}
      </AppText>

      {actionTitle && onAction && (
        <View style={{ marginTop: spacing.xl, width: '100%', maxWidth: 220 }}>
          <AppButton title={actionTitle} onPress={onAction} variant="secondary" size="md" />
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
