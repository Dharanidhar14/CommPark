import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { ParkingCategory } from '../../types/parking';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';

export interface ParkingCategoryBadgeProps {
  category: ParkingCategory;
  style?: ViewStyle;
}

export const ParkingCategoryBadge: React.FC<ParkingCategoryBadgeProps> = ({
  category,
  style,
}) => {
  const { colors, radius, spacing } = useTheme();

  const getConfig = (): { label: string; icon: IconName } => {
    switch (category) {
      case 'residential':
        return { label: 'Residential', icon: 'home-outline' };
      case 'driveway':
        return { label: 'Driveway', icon: 'car-outline' };
      case 'street_bay':
        return { label: 'Street Bay', icon: 'navigate-circle-outline' };
      case 'commercial':
      default:
        return { label: 'Commercial', icon: 'business-outline' };
    }
  };

  const { label, icon } = getConfig();

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: colors.surfaceSubtle,
          borderColor: colors.borderSubtle,
          borderRadius: radius.sm,
          paddingHorizontal: spacing.xs,
          paddingVertical: 2,
        },
        style,
      ]}
    >
      <AppIcon name={icon} size={12} color={colors.secondaryText} style={styles.icon} />
      <AppText variant="captionSmall" color={colors.secondaryText}>
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
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
});
