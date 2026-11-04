import React from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../theme';

export interface AppCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'elevated' | 'outlined' | 'subtle';
  style?: ViewStyle;
}

export const AppCard: React.FC<AppCardProps> = ({
  children,
  onPress,
  variant = 'elevated',
  style,
}) => {
  const { colors, radius, spacing, isDark } = useTheme();

  const getCardStyle = (): ViewStyle => {
    switch (variant) {
      case 'outlined':
        return {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          borderWidth: 1,
        };
      case 'subtle':
        return {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.borderSubtle,
          borderWidth: 1,
        };
      case 'elevated':
      default:
        return {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderWidth: 1,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.05,
          shadowRadius: 12,
          elevation: isDark ? 2 : 3,
        };
    }
  };

  const containerStyle: ViewStyle = {
    borderRadius: radius.card,
    padding: spacing.lg,
    ...getCardStyle(),
  };

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          containerStyle,
          pressed && styles.pressed,
          style,
        ]}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={[styles.container, containerStyle, style]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
