import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme';
import { AccessType } from '../../types/parking';
import { AppText } from '../ui/AppText';
import { AppIcon, IconName } from '../ui/AppIcon';

export interface AccessTypePillProps {
  accessType: AccessType;
  compact?: boolean;
  style?: ViewStyle;
}

export const AccessTypePill: React.FC<AccessTypePillProps> = ({
  accessType,
  compact = false,
  style,
}) => {
  const { colors, radius, spacing } = useTheme();

  const getConfig = (): {
    label: string;
    icon: IconName;
    bg: string;
    text: string;
    border: string;
  } => {
    switch (accessType) {
      case 'security_verified':
        return {
          label: compact ? 'Security Guard' : 'Security-Verified Gate',
          icon: 'shield-checkmark',
          bg: 'rgba(63, 134, 91, 0.12)',
          text: colors.success,
          border: 'rgba(63, 134, 91, 0.3)',
        };
      case 'owner_assisted':
        return {
          label: compact ? 'Owner Assist' : 'Owner-Assisted Access',
          icon: 'person-circle-outline',
          bg: 'rgba(59, 130, 246, 0.12)',
          text: '#3B82F6',
          border: 'rgba(59, 130, 246, 0.3)',
        };
      case 'direct_access':
        return {
          label: compact ? 'Direct Access' : 'Direct Access Bay',
          icon: 'flash-outline',
          bg: 'rgba(217, 245, 66, 0.15)',
          text: colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#879E0B',
          border: 'rgba(217, 245, 66, 0.4)',
        };
      case 'facility_managed':
      default:
        return {
          label: compact ? 'Facility Gate' : 'Facility-Managed Garage',
          icon: 'business-outline',
          bg: 'rgba(160, 170, 161, 0.15)',
          text: colors.text,
          border: colors.border,
        };
    }
  };

  const config = getConfig();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          borderRadius: radius.pill,
          paddingHorizontal: compact ? spacing.xs : spacing.sm,
          paddingVertical: 3,
        },
        style,
      ]}
    >
      <AppIcon name={config.icon} size={compact ? 12 : 14} color={config.text} style={styles.icon} />
      <AppText variant="captionSmall" weight="bold" color={config.text}>
        {config.label}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderWidth: 1,
  },
  icon: {
    marginRight: 4,
  },
});
