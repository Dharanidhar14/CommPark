import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
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

export default function DigitalPassScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const activeBooking = useBookingStore((s) => s.activeBooking);

  if (!activeBooking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Digital Pass" showBack />
        <View style={{ padding: 24, alignItems: 'center' }}>
          <AppText variant="h3">No Active Pass</AppText>
          <AppButton
            title="Browse Parking"
            onPress={() => router.replace('/(tabs)/explore' as any)}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Digital Parking Pass"
        subtitle={`Pass #${activeBooking.bookingNumber}`}
        showBack
        onBack={() => router.replace('/(tabs)/bookings' as any)}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 80,
          },
        ]}
      >
        {/* Main Digital Pass Ticket */}
        <View
          style={[
            styles.ticketContainer,
            {
              backgroundColor: colors.surface,
              borderColor: colors.primary,
              borderRadius: radius.card,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: isDark ? 0.4 : 0.1,
              shadowRadius: 14,
              elevation: 5,
            },
          ]}
        >
          {/* Ticket Header */}
          <View style={[styles.ticketHeader, { borderBottomColor: colors.border, padding: spacing.lg }]}>
            <View style={styles.badgeRow}>
              <AccessTypePill accessType={activeBooking.accessType} />
              <AppBadge label="ENTRY AUTHORIZED" variant="success" size="sm" />
            </View>

            <AppText variant="h2" style={{ marginTop: spacing.xs }}>
              {activeBooking.space.name}
            </AppText>
            <AppText variant="body" color={colors.secondaryText} style={{ marginTop: 2 }}>
              {activeBooking.space.address}
            </AppText>
          </View>

          {/* QR Code Presentation Box */}
          <View style={[styles.qrSection, { backgroundColor: colors.surfaceSubtle, padding: spacing.xl }]}>
            <View
              style={[
                styles.qrBox,
                {
                  backgroundColor: '#FFFFFF',
                  borderColor: colors.primary,
                  borderRadius: radius.lg,
                  borderWidth: 3,
                },
              ]}
            >
              {/* Simulated High-Tech QR Pattern */}
              <View style={styles.qrInner}>
                <AppIcon name="qr-code" size={160} color="#171A18" />
              </View>
            </View>

            <AppText variant="captionSmall" weight="bold" align="center" style={{ marginTop: spacing.md }}>
              SCAN AT BOOTH / GATE TERMINAL
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} align="center" style={{ marginTop: 2 }}>
              Present to on-duty security guard or optical scanner
            </AppText>
          </View>

          {/* Ticket Body: Vehicle & Access Details */}
          <View style={[styles.ticketBody, { padding: spacing.lg }]}>
            <View style={styles.detailGrid}>
              <View style={styles.detailCol}>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  REGISTERED VEHICLE
                </AppText>
                <AppText variant="h4" weight="bold" style={{ marginTop: 2 }}>
                  {activeBooking.vehicle.licensePlate}
                </AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  {activeBooking.vehicle.make} {activeBooking.vehicle.model}
                </AppText>
              </View>

              <View style={styles.detailCol}>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  VALID UNTIL
                </AppText>
                <AppText variant="h4" weight="bold" style={{ marginTop: 2 }}>
                  11:30 PM
                </AppText>
                <AppText variant="captionSmall" color={colors.success} weight="bold">
                  Active (3h 15m left)
                </AppText>
              </View>
            </View>

            {/* Access Code (if direct access) */}
            {activeBooking.accessCode && (
              <View
                style={[
                  styles.codeBanner,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderRadius: radius.md,
                    borderColor: colors.border,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  GATE ACCESS CODE
                </AppText>
                <AppText variant="h3" weight="extraBold" color={colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B'}>
                  {activeBooking.accessCode}
                </AppText>
              </View>
            )}

            {/* Access Instructions Card */}
            <View
              style={[
                styles.instructionsBox,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: radius.md,
                  marginTop: spacing.md,
                },
              ]}
            >
              <AppIcon name="shield-checkmark" size={16} color={colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B'} />
              <AppText variant="captionSmall" color={colors.text} style={{ marginLeft: 6, flex: 1 }}>
                {activeBooking.space.accessInstructions}
              </AppText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ marginTop: spacing.xl, gap: 10 }}>
          <AppButton
            title="Get Turn-by-Turn Directions"
            onPress={() => {}}
            variant="primary"
            size="lg"
            leftIcon={<AppIcon name="navigate-outline" size={20} color={colors.primaryForeground} />}
          />
          <AppButton
            title="Simulate Guard Scan (Test Verification)"
            onPress={() => router.push('/security/verify' as any)}
            variant="secondary"
            size="md"
            leftIcon={<AppIcon name="scan-outline" size={18} color={colors.text} />}
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
  ticketContainer: {
    borderWidth: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  ticketHeader: {
    borderBottomWidth: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qrSection: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrBox: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketBody: {},
  detailGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailCol: {
    flex: 1,
  },
  codeBanner: {
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  instructionsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
});
