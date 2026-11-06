import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { useTheme } from '../../theme';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { useLocationStore } from '../../store/useLocationStore';

export const LocationStatusBanner: React.FC = () => {
  const { colors, radius, isDark } = useTheme();
  const permissionStatus = useLocationStore((s) => s.permissionStatus);
  const promptLocationAccess = useLocationStore((s) => s.promptLocationAccess);
  const openSettings = useLocationStore((s) => s.openSettings);

  if (permissionStatus === 'granted' || permissionStatus === 'undetermined') {
    return null;
  }

  const isBlocked = permissionStatus === 'blocked';

  return (
    <View
      style={[
        styles.banner,
        {
          backgroundColor: isDark ? '#262414' : '#FFFDE6',
          borderColor: isDark ? '#5C541D' : '#E8DF8B',
          borderRadius: radius.md,
        },
      ]}
    >
      <AppIcon
        name={isBlocked ? 'settings-outline' : 'navigate-circle-outline'}
        size={20}
        color={isDark ? colors.primary : '#685906'}
        style={{ marginRight: 10 }}
      />
      <View style={{ flex: 1 }}>
        <AppText variant="captionSmall" weight="bold" color={isDark ? colors.text : '#483C02'}>
          {isBlocked ? 'Location Permission Blocked' : 'Location Access Off'}
        </AppText>
        <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
          {isBlocked
            ? 'Enable in system settings to see parking spots sorted by distance.'
            : 'Allow location to show nearby parking bays and walking distance.'}
        </AppText>
      </View>
      <Pressable
        onPress={isBlocked ? openSettings : promptLocationAccess}
        style={[
          styles.actionBtn,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            borderRadius: radius.pill,
          },
        ]}
      >
        <AppText variant="captionSmall" weight="bold" color={isDark ? colors.primary : '#49570B'}>
          {isBlocked ? 'Settings' : 'Enable'}
        </AppText>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginHorizontal: 16,
    marginVertical: 6,
    borderWidth: 1,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
});
