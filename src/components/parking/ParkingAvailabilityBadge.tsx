import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from '../ui/AppText';

export interface ParkingAvailabilityBadgeProps {
  isAvailable: boolean;
  availableSpots?: number;
  style?: ViewStyle;
}

export const ParkingAvailabilityBadge: React.FC<ParkingAvailabilityBadgeProps> = ({
  isAvailable,
  availableSpots = 1,
  style,
}) => {
  const { colors, radius, spacing } = useTheme();

  const label = isAvailable
    ? availableSpots === 1
      ? '1 Spot Left'
      : `${availableSpots} Spots Available`
    : 'Fully Booked';

  const dotColor = isAvailable ? colors.success : colors.error;
  const bgColor = isAvailable ? colors.successBackground : colors.errorBackground;
  const textColor = isAvailable ? colors.success : colors.error;

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: bgColor,
          borderRadius: radius.pill,
          paddingHorizontal: spacing.sm,
          paddingVertical: 3,
        },
        style,
      ]}
    >
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <AppText variant="captionSmall" weight="semiBold" color={textColor}>
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
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
});
