import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';

export default function BookingConfirmationScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const activeBooking = useBookingStore((s) => s.activeBooking);

  if (!activeBooking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Booking Confirmation" showBack />
        <View style={{ padding: 24, alignItems: 'center', marginTop: 40 }}>
          <AppIcon name="alert-circle-outline" size={48} color={colors.secondaryText} />
          <AppText variant="h3" style={{ marginTop: 16 }}>
            No Active Confirmation
          </AppText>
          <AppButton
            title="Explore Spaces"
            onPress={() => router.replace('/(tabs)/explore' as any)}
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  const { space, vehicle, totalAmount, bookingNumber, accessType, durationHours } = activeBooking;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Booking Confirmed"
        subtitle="Reservation confirmed"
        showBack={false}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 40,
          },
        ]}
      >
        {/* Success Icon & Banner */}
        <View style={styles.successHeader}>
          <View
            style={[
              styles.successIconCircle,
              {
                backgroundColor: isDark ? 'rgba(217, 245, 66, 0.15)' : 'rgba(217, 245, 66, 0.3)',
                borderColor: colors.primary,
              },
            ]}
          >
            <AppIcon
              name="checkmark-circle"
              size={56}
              color={isDark ? colors.primary : '#49570B'}
            />
          </View>

          <AppBadge
            label="DEMO RESERVATION CONFIRMED"
            variant="success"
            size="md"
            style={{ marginTop: spacing.md }}
          />

          <AppText variant="h2" align="center" style={{ marginTop: spacing.xs }}>
            Spot Reserved!
          </AppText>
          <AppText
            variant="body"
            color={colors.secondaryText}
            align="center"
            style={{ marginTop: 4, maxWidth: 320 }}
          >
            Booking #{bookingNumber} is verified and active. Your digital entry pass is ready.
          </AppText>
        </View>

        {/* Space & Vehicle Details Card */}
        <AppCard style={{ marginTop: spacing.lg }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <AccessTypePill accessType={accessType} compact />
              <AppText variant="h3" style={{ marginTop: 8 }}>
                {space.name}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {space.address}, {space.locality}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Amount Paid
              </AppText>
              <AppText variant="h3" color={isDark ? colors.primary : '#49570B'}>
                ₹{totalAmount.toFixed(2)}
              </AppText>
              <AppBadge label="SIMULATED" variant="default" size="sm" style={{ marginTop: 2 }} />
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.md }]} />

          {/* Details Grid */}
          <View style={styles.grid}>
            <View style={styles.gridItem}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                REGISTERED VEHICLE
              </AppText>
              <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                {vehicle.licensePlate}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                {vehicle.make} {vehicle.model}
              </AppText>
            </View>

            <View style={styles.gridItem}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                DURATION
              </AppText>
              <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                {durationHours} Hour{durationHours > 1 ? 's' : ''}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Valid from now
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Access Instructions Box */}
        <View
          style={[
            styles.accessBox,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderRadius: radius.card,
              padding: spacing.md,
              marginTop: spacing.md,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon
              name="shield-checkmark"
              size={18}
              color={isDark ? colors.primary : '#49570B'}
            />
            <AppText variant="bodyBold">
              Access & Security Protocol
            </AppText>
          </View>

          <AppText
            variant="caption"
            color={colors.text}
            style={{ marginTop: 6, lineHeight: 18 }}
          >
            {space.accessInstructions}
          </AppText>

          {activeBooking.accessCode && (
            <View
              style={[
                styles.codePill,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                  borderRadius: radius.sm,
                  padding: spacing.sm,
                  marginTop: spacing.sm,
                },
              ]}
            >
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Gate Access Code:
              </AppText>
              <AppText
                variant="h4"
                weight="bold"
                color={isDark ? colors.primary : '#49570B'}
                style={{ marginLeft: 6 }}
              >
                {activeBooking.accessCode}
              </AppText>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={{ marginTop: spacing.xl, gap: 12 }}>
          <AppButton
            title="View Digital Parking Pass"
            onPress={() => router.replace('/booking/pass' as any)}
            variant="primary"
            size="lg"
            leftIcon={<AppIcon name="qr-code-outline" size={20} color={colors.primaryForeground} />}
          />

          <AppButton
            title="Browse More Spots"
            onPress={() => router.replace('/(tabs)/explore' as any)}
            variant="outline"
            size="md"
            leftIcon={<AppIcon name="map-outline" size={18} color={colors.text} />}
          />

          <AppButton
            title="Go to Home"
            onPress={() => router.replace('/(tabs)' as any)}
            variant="ghost"
            size="sm"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  successHeader: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  successIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
  },
  grid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridItem: {
    flex: 1,
  },
  accessBox: {
    borderWidth: 1,
  },
  codePill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
  },
});
