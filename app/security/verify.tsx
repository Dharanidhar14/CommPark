import React, { useState } from 'react';
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

export default function SecurityVerifyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const activeBooking = useBookingStore((s) => s.activeBooking);

  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'verified' | 'denied'>('idle');
  const [incentiveEarned, setIncentiveEarned] = useState(0);

  const handleSimulateScan = () => {
    setScanStatus('scanning');
    setTimeout(() => {
      setScanStatus('verified');
      setIncentiveEarned((prev) => prev + 1.50);
    }, 800);
  };

  const handleResetScan = () => {
    setScanStatus('idle');
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Security Guard Verification"
        subtitle="Gate 2 Residential Access Scanner"
        showBack
        onBack={() => router.replace('/(tabs)/profile' as any)}
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
        {/* Security Guard On-Duty Badge Banner */}
        <View
          style={[
            styles.guardBanner,
            {
              backgroundColor: colors.pricePinBg,
              borderColor: colors.primary,
              borderRadius: radius.card,
              padding: spacing.md,
            },
          ]}
        >
          <View style={styles.guardBannerRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.dutyDot, { backgroundColor: colors.primary }]} />
              <AppText variant="captionSmall" weight="bold" color={colors.primary}>
                GUARD ON DUTY • GREENWOOD HEIGHTS
              </AppText>
            </View>
            <AppBadge label="AUTHORIZED" variant="primary" size="sm" />
          </View>

          <View style={[styles.guardStatsRow, { marginTop: spacing.sm }]}>
            <View>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Shift Verifications
              </AppText>
              <AppText variant="h3" color={colors.pricePinText}>
                12 Vehicles
              </AppText>
            </View>
            <View>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Earned Shift Incentive
              </AppText>
              <AppText variant="h3" color={colors.primary}>
                +${(18.00 + incentiveEarned).toFixed(2)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Simulated Camera Viewfinder */}
        <View style={{ marginTop: spacing.lg }}>
          <View
            style={[
              styles.viewfinder,
              {
                backgroundColor: isDark ? '#000000' : '#171A18',
                borderRadius: radius.card,
                borderColor: scanStatus === 'verified' ? colors.success : colors.border,
              },
            ]}
          >
            {/* Viewfinder Corner Reticles */}
            <View style={[styles.reticleTopLeft, { borderColor: colors.primary }]} />
            <View style={[styles.reticleTopRight, { borderColor: colors.primary }]} />
            <View style={[styles.reticleBottomLeft, { borderColor: colors.primary }]} />
            <View style={[styles.reticleBottomRight, { borderColor: colors.primary }]} />

            {/* Scanning Line Indicator */}
            {scanStatus === 'scanning' ? (
              <View style={[styles.scanningLine, { backgroundColor: colors.primary }]} />
            ) : scanStatus === 'verified' ? (
              <View style={styles.verifiedOverlay}>
                <AppIcon name="checkmark-circle" size={54} color={colors.success} />
                <AppText variant="h3" color="#FFFFFF" style={{ marginTop: 8 }}>
                  PASS VALIDATED
                </AppText>
              </View>
            ) : (
              <View style={styles.scannerPrompt}>
                <AppIcon name="qr-code-outline" size={48} color="rgba(255, 255, 255, 0.4)" />
                <AppText variant="caption" color="rgba(255, 255, 255, 0.6)" align="center" style={{ marginTop: 8 }}>
                  Point camera at customer's CommunityPark pass QR code
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Scan Actions */}
        <View style={{ marginTop: spacing.lg }}>
          {scanStatus === 'idle' ? (
            <AppButton
              title="Simulate Customer QR Scan"
              onPress={handleSimulateScan}
              variant="primary"
              size="lg"
              leftIcon={<AppIcon name="scan" size={20} color={colors.primaryForeground} />}
            />
          ) : scanStatus === 'scanning' ? (
            <AppButton
              title="Reading QR Code..."
              onPress={() => {}}
              loading
              variant="primary"
              size="lg"
            />
          ) : (
            <AppButton
              title="Scan Next Vehicle"
              onPress={handleResetScan}
              variant="secondary"
              size="lg"
              leftIcon={<AppIcon name="refresh" size={18} color={colors.text} />}
            />
          )}
        </View>

        {/* Verification Result Card */}
        {scanStatus === 'verified' && activeBooking && (
          <View style={{ marginTop: spacing.lg }}>
            <AppCard style={{ borderColor: colors.success, borderWidth: 1.5 }}>
              <View style={styles.resultHeader}>
                <View style={{ flex: 1 }}>
                  <AppBadge label="BOOKING CONFIRMED" variant="success" size="sm" />
                  <AppText variant="h3" style={{ marginTop: 6 }}>
                    {activeBooking.space.name}
                  </AppText>
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Slot B-14
                </AppText>
              </View>

              <View
                style={[
                  styles.plateCheckRow,
                  {
                    backgroundColor: colors.surfaceSubtle,
                    borderRadius: radius.md,
                    padding: spacing.md,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    EXPECTED VEHICLE PLATE
                  </AppText>
                  <AppText variant="h2" weight="extraBold" style={{ letterSpacing: 1, marginTop: 2 }}>
                    {activeBooking.vehicle.licensePlate}
                  </AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    {activeBooking.vehicle.make} {activeBooking.vehicle.model} ({activeBooking.vehicle.color})
                  </AppText>
                </View>

                <View style={[styles.plateMatchBadge, { backgroundColor: colors.successBackground }]}>
                  <AppIcon name="shield-checkmark" size={18} color={colors.success} />
                  <AppText variant="captionSmall" weight="bold" color={colors.success} style={{ marginLeft: 4 }}>
                    MATCH
                  </AppText>
                </View>
              </View>

              <View
                style={[
                  styles.incentiveAwardNotice,
                  {
                    backgroundColor: 'rgba(217, 245, 66, 0.15)',
                    borderRadius: radius.md,
                    padding: spacing.sm,
                    marginTop: spacing.md,
                  },
                ]}
              >
                <AppIcon name="gift-outline" size={18} color={isDark ? colors.primary : '#49570B'} />
                <AppText variant="captionSmall" weight="semiBold" style={{ marginLeft: 6, flex: 1 }}>
                  Verification Recorded. +$1.50 incentive credited to guard wallet.
                </AppText>
              </View>
            </AppCard>
          </View>
        )}

        {/* Expected Vehicles Today List */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Expected Authorised Vehicles</AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Bookings scheduled for Gate 2 entry today
          </AppText>

          <View style={{ marginTop: spacing.sm }}>
            <AppCard style={{ marginBottom: 8, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <AppText variant="bodyBold">Plate: 7XYZ892 (Tesla Model Y)</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    Slot B-14 • Slot Host: Marcus Vance
                  </AppText>
                </View>
                <AppBadge label="ARRIVED" variant="success" size="sm" />
              </View>
            </AppCard>

            <AppCard style={{ marginBottom: 8, padding: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <AppText variant="bodyBold">Plate: 4KLP119 (Honda Civic)</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    Slot A-08 • Expected 8:30 PM
                  </AppText>
                </View>
                <AppBadge label="PENDING" variant="default" size="sm" />
              </View>
            </AppCard>
          </View>
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
  guardBanner: {
    borderWidth: 1.5,
  },
  guardBannerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dutyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  guardStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewfinder: {
    height: 220,
    borderWidth: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  reticleTopLeft: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderLeftWidth: 3,
  },
  reticleTopRight: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 24,
    height: 24,
    borderTopWidth: 3,
    borderRightWidth: 3,
  },
  reticleBottomLeft: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
  },
  reticleBottomRight: {
    position: 'absolute',
    bottom: 16,
    right: 16,
    width: 24,
    height: 24,
    borderBottomWidth: 3,
    borderRightWidth: 3,
  },
  scanningLine: {
    position: 'absolute',
    width: '80%',
    height: 2,
  },
  verifiedOverlay: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scannerPrompt: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  plateCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  plateMatchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  incentiveAwardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
