import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from './AppText';

export type BadgeVariant =
  | 'default'
  | 'primary'
  | 'success'
  | 'warning'
  | 'error'
  | 'outline'
  | 'dark';

export interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';
  style?: ViewStyle;
}

export const AppBadge: React.FC<AppBadgeProps> = ({
  label,
  variant = 'default',
  icon,
  size = 'md',
  style,
}) => {
  const { colors, radius, spacing } = useTheme();

  const getVariantStyles = (): { bg: string; text: string; border?: string } => {
    switch (variant) {
      case 'primary':
        return {
          bg: colors.primary,
          text: colors.primaryForeground,
        };
      case 'success':
        return {
          bg: colors.successBackground,
          text: colors.success,
          border: colors.success,
        };
      case 'warning':
        return {
          bg: colors.warningBackground,
          text: colors.warning,
          border: colors.warning,
        };
      case 'error':
        return {
          bg: colors.errorBackground,
          text: colors.error,
          border: colors.error,
        };
      case 'dark':
        return {
          bg: colors.pricePinBg,
          text: colors.pricePinText,
        };
      case 'outline':
        return {
          bg: 'transparent',
          text: colors.text,
          border: colors.border,
        };
      case 'default':
      default:
        return {
          bg: colors.surfaceSubtle,
          text: colors.text,
          border: colors.borderSubtle,
        };
    }
  };

  const vStyle = getVariantStyles();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: vStyle.bg,
          borderRadius: radius.pill,
          borderColor: vStyle.border || 'transparent',
          borderWidth: vStyle.border ? 1 : 0,
          paddingHorizontal: size === 'sm' ? spacing.sm : spacing.md,
          paddingVertical: size === 'sm' ? spacing.xxs : spacing.xs,
        },
        style,
      ]}
    >
      {icon && <View style={styles.iconContainer}>{icon}</View>}
      <AppText
        variant={size === 'sm' ? 'captionSmall' : 'caption'}
        weight="semiBold"
        color={vStyle.text}
      >
        {label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
});
