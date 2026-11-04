import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { Booking } from '../../types/booking';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';
import { AccessTypePill } from '../parking/AccessTypePill';

export interface ActivePassBannerProps {
  booking: Booking;
  style?: ViewStyle;
}

export const ActivePassBanner: React.FC<ActivePassBannerProps> = ({
  booking,
  style,
}) => {
  const router = useRouter();
  const { colors, radius, spacing, isDark } = useTheme();

  return (
    <Pressable
      onPress={() => router.push('/booking/pass' as any)}
      style={({ pressed }) => [
        styles.banner,
        {
          backgroundColor: colors.pricePinBg,
          borderColor: colors.primary,
          borderRadius: radius.card,
          padding: spacing.md,
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.3 : 0.15,
          shadowRadius: 10,
          elevation: 5,
          opacity: pressed ? 0.94 : 1,
        },
        style,
      ]}
    >
      <View style={styles.topRow}>
        <View style={styles.statusIndicator}>
          <View style={[styles.pulseDot, { backgroundColor: colors.primary }]} />
          <AppText variant="captionSmall" weight="bold" color={colors.primary}>
            ACTIVE PASS
          </AppText>
          <View style={[styles.demoTag, { backgroundColor: 'rgba(217, 245, 66, 0.2)', borderColor: colors.primary }]}>
            <AppText variant="captionSmall" weight="extraBold" color={colors.primary}>
              DEMO
            </AppText>
          </View>
        </View>

        <AccessTypePill accessType={booking.accessType} compact />
      </View>

      <View style={[styles.mainRow, { marginTop: spacing.xs }]}>
        <View style={{ flex: 1 }}>
          <AppText variant="h4" color={colors.pricePinText} numberOfLines={1}>
            {booking.space.name}
          </AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} numberOfLines={1}>
            Plate: {booking.vehicle.licensePlate} • Expires in 3h 15m
          </AppText>
        </View>

        <View
          style={[
            styles.qrButton,
            { backgroundColor: colors.primary, borderRadius: radius.md },
          ]}
        >
          <AppIcon name="qr-code-outline" size={20} color={colors.primaryForeground} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1.5,
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  demoTag: {
    marginLeft: 6,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
    borderWidth: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  mainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  qrButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
});
