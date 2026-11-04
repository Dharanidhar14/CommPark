import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useSecurityStore } from '../../src/store/useSecurityStore';
import { VerificationCheck } from '../../src/types/security';
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

  const {
    guard,
    incentiveStats,
    runVerificationScenario,
  } = useSecurityStore();

  const [isScanning, setIsScanning] = useState(false);
  const [activeCheck, setActiveCheck] = useState<VerificationCheck | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<
    'valid' | 'expired' | 'cancelled' | 'plate_mismatch' | 'duplicate' | 'unapproved'
  >('valid');

  const executeScan = (
    scenario:
      | 'valid'
      | 'expired'
      | 'cancelled'
      | 'plate_mismatch'
      | 'duplicate'
      | 'unapproved'
  ) => {
    setSelectedScenario(scenario);
    setIsScanning(true);
    setActiveCheck(null);

    setTimeout(() => {
      setIsScanning(false);
      const res = runVerificationScenario(scenario);
      setActiveCheck(res);
    }, 700);
  };

  const isApproved = activeCheck?.result === 'approved';

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Gate Security Scanner"
        subtitle={`${guard.gateNumber} • ${guard.name}`}
        showBack
        onBack={() => router.replace('/security' as any)}
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
        {/* Prototype Disclaimer Banner */}
        <View
          style={[
            styles.demoBanner,
            {
              backgroundColor: 'rgba(234, 179, 8, 0.12)',
              borderColor: colors.warning,
              borderRadius: radius.md,
              padding: spacing.sm,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="shield-checkmark" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              SIMULATED SCANNER SANDBOX
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            Simulates optical QR reading, license plate matching, booking window validity, and community authorization checks.
          </AppText>
        </View>

        {/* Viewfinder Presentation Box */}
        <View style={{ marginTop: spacing.md }}>
          <View
            style={[
              styles.viewfinder,
              {
                backgroundColor: isDark ? '#0C0E0D' : '#171A18',
                borderRadius: radius.card,
                borderColor: activeCheck
                  ? isApproved
                    ? colors.success
                    : colors.error
                  : colors.border,
              },
            ]}
          >
            {/* Reticles */}
            <View style={[styles.reticleTopLeft, { borderColor: colors.primary }]} />
            <View style={[styles.reticleTopRight, { borderColor: colors.primary }]} />
            <View style={[styles.reticleBottomLeft, { borderColor: colors.primary }]} />
            <View style={[styles.reticleBottomRight, { borderColor: colors.primary }]} />

            {/* Viewfinder Content */}
            {isScanning ? (
              <View style={styles.scanningBox}>
                <ActivityIndicator size="large" color={colors.primary} />
                <AppText variant="bodyBold" color={colors.primary} style={{ marginTop: 12 }}>
                  Inspecting Booking QR Token...
                </AppText>
                <AppText variant="captionSmall" color="#A0AAA1" style={{ marginTop: 2 }}>
                  Validating with Society Gate Registry
                </AppText>
              </View>
            ) : activeCheck ? (
              <View style={styles.resultBox}>
                <AppIcon
                  name={isApproved ? 'checkmark-circle' : 'close-circle'}
                  size={54}
                  color={isApproved ? colors.success : colors.error}
                />
                <AppText
                  variant="h3"
                  weight="extraBold"
                  color={isApproved ? colors.success : colors.error}
                  style={{ marginTop: 8 }}
                >
                  {activeCheck.statusLabel}
                </AppText>
                <AppText variant="captionSmall" color="#FFFFFF" align="center" style={{ marginTop: 4, maxWidth: 260 }}>
                  {activeCheck.notes}
                </AppText>
              </View>
            ) : (
              <View style={styles.idleBox}>
                <AppIcon name="qr-code-outline" size={54} color={colors.primary} />
                <AppText variant="bodyBold" color="#FFFFFF" style={{ marginTop: 8 }}>
                  Point at Driver Booking QR
                </AppText>
                <AppText variant="captionSmall" color="#A0AAA1" align="center" style={{ marginTop: 2 }}>
                  Select a test scenario below to simulate gate check-in
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* Verification Scenario Buttons */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="h3">Simulate Verification Scenarios</AppText>
            <AppBadge label="TEST SANDBOX" variant="default" size="sm" />
          </View>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Trigger real-world residential gate test cases:
          </AppText>

          <View style={{ marginTop: spacing.sm, gap: 8 }}>
            {/* Scenario 1: Valid Booking */}
            <AppButton
              title="✓ Test Valid Booking (KA 01 MJ 4821) — Approve (+₹15)"
              onPress={() => executeScan('valid')}
              variant={selectedScenario === 'valid' && activeCheck ? 'primary' : 'secondary'}
              size="md"
              leftIcon={<AppIcon name="checkmark-circle-outline" size={18} color={selectedScenario === 'valid' && activeCheck ? colors.primaryForeground : colors.text} />}
            />

            {/* Scenario 2: Plate Mismatch */}
            <AppButton
              title="⚠ Test Vehicle Plate Mismatch — Deny"
              onPress={() => executeScan('plate_mismatch')}
              variant="outline"
              size="md"
              leftIcon={<AppIcon name="car-outline" size={18} color={colors.error} />}
            />

            {/* Scenario 3: Expired Pass */}
            <AppButton
              title="⌛ Test Expired Pass Window — Deny"
              onPress={() => executeScan('expired')}
              variant="outline"
              size="md"
              leftIcon={<AppIcon name="time-outline" size={18} color={colors.warning} />}
            />

            {/* Scenario 4: Duplicate Check-In */}
            <AppButton
              title="🚫 Test Duplicate Check-In (Already Inside) — Deny"
              onPress={() => executeScan('duplicate')}
              variant="outline"
              size="md"
              leftIcon={<AppIcon name="copy-outline" size={18} color={colors.text} />}
            />

            {/* Scenario 5: Cancelled Pass */}
            <AppButton
              title="✕ Test Cancelled Booking — Deny"
              onPress={() => executeScan('cancelled')}
              variant="outline"
              size="md"
              leftIcon={<AppIcon name="close-circle-outline" size={18} color={colors.error} />}
            />

            {/* Scenario 6: Unapproved Apartment Bay */}
            <AppButton
              title="🔒 Test Unapproved Apartment Listing — Deny"
              onPress={() => executeScan('unapproved')}
              variant="outline"
              size="md"
              leftIcon={<AppIcon name="lock-closed-outline" size={18} color={colors.warning} />}
            />
          </View>
        </View>

        {/* Detailed Result Card */}
        {activeCheck && (
          <View style={{ marginTop: spacing.xl }}>
            <AppText variant="h3">Verification Inspection Log</AppText>
            <AppCard style={{ marginTop: spacing.xs, padding: spacing.md }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    BOOKING ID
                  </AppText>
                  <AppText variant="bodyBold">#{activeCheck.bookingNumber}</AppText>
                </View>
                <AppBadge
                  label={activeCheck.statusLabel}
                  variant={isApproved ? 'success' : 'error'}
                  size="sm"
                />
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.sm }]} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    EXPECTED NUMBER PLATE
                  </AppText>
                  <AppText variant="h4" weight="bold" style={{ marginTop: 2 }}>
                    {activeCheck.expectedPlate}
                  </AppText>
                </View>

                <View style={{ flex: 1, alignItems: 'flex-end' }}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>
                    ARRIVING PLATE
                  </AppText>
                  <AppText
                    variant="h4"
                    weight="bold"
                    color={activeCheck.expectedPlate === activeCheck.arrivingPlate ? colors.success : colors.error}
                    style={{ marginTop: 2 }}
                  >
                    {activeCheck.arrivingPlate}
                  </AppText>
                </View>
              </View>

              <View style={[styles.divider, { backgroundColor: colors.borderSubtle, marginVertical: spacing.sm }]} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <View>
                  <AppText variant="captionSmall" color={colors.secondaryText}>ASSIGNED BAY</AppText>
                  <AppText variant="bodyBold" style={{ marginTop: 2 }}>{activeCheck.slotNumber}</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText}>{activeCheck.spaceName}</AppText>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="captionSmall" color={colors.secondaryText}>GUARD INCENTIVE</AppText>
                  <AppText
                    variant="h3"
                    color={isApproved ? colors.success : colors.secondaryText}
                    style={{ marginTop: 2 }}
                  >
                    {isApproved ? `+₹${activeCheck.incentiveCredited}.00` : '₹0.00'}
                  </AppText>
                </View>
              </View>

              {isApproved && (
                <View
                  style={[
                    styles.incentiveNotice,
                    {
                      backgroundColor: 'rgba(34, 197, 94, 0.12)',
                      borderColor: colors.success,
                      borderRadius: radius.sm,
                      padding: spacing.sm,
                      marginTop: spacing.md,
                    },
                  ]}
                >
                  <AppText variant="captionSmall" weight="bold" color={colors.success}>
                    ✓ Operational Incentive Awarded
                  </AppText>
                  <AppText variant="captionSmall" color={colors.success} style={{ marginTop: 2 }}>
                    ₹15.00 credited to Ramesh Kumar's guard shift wallet. Vehicle added to Currently Parked registry.
                  </AppText>
                </View>
              )}
            </AppCard>
          </View>
        )}
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
  demoBanner: {
    borderWidth: 1,
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
  scanningBox: {
    alignItems: 'center',
  },
  resultBox: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  idleBox: {
    alignItems: 'center',
  },
  divider: {
    height: 1,
  },
  incentiveNotice: {
    borderWidth: 1,
  },
});
