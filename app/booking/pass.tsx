import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
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
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { colors, spacing, radius, isDark } = useTheme();

  const { activeBooking: storeActiveBooking, bookings } = useBookingStore();
  const activeBooking = id ? bookings.find((b) => b.id === id) || storeActiveBooking : storeActiveBooking;
  const [isDirectionsOpen, setIsDirectionsOpen] = useState(false);

  if (!activeBooking) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Digital Pass" showBack />
        <View style={{ padding: 24, alignItems: 'center', marginTop: 40 }}>
          <AppIcon name="ticket-outline" size={48} color={colors.secondaryText} />
          <AppText variant="h3" style={{ marginTop: 16 }}>
            No Active Pass
          </AppText>
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
        {/* Prominent Demo Pass Watermark Banner */}
        <View
          style={[
            styles.demoWatermark,
            {
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              borderColor: colors.warning,
              borderRadius: radius.md,
              padding: spacing.sm,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="warning" size={16} color={colors.warning} />
            <AppText variant="captionSmall" weight="bold" color={colors.warning}>
              SAMPLE / DEMO PASS
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
            This simulated digital pass is for demonstration purposes and cannot be used for unauthorized access to physical premises.
          </AppText>
        </View>

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
              {activeBooking.space.address}, {activeBooking.space.locality}
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
              Present to on-duty security guard or automated scanner
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
                  VALID DURATION
                </AppText>
                <AppText variant="h4" weight="bold" style={{ marginTop: 2 }}>
                  {activeBooking.durationHours} Hours
                </AppText>
                <AppText variant="captionSmall" color={colors.success} weight="bold">
                  Active Demo Window
                </AppText>
              </View>
            </View>

            {/* Access Code (if direct access or security verification) */}
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
                  GATE PASSCODE
                </AppText>
                <AppText variant="h3" weight="extraBold" color={isDark ? colors.primary : '#49570B'}>
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
              <AppIcon name="shield-checkmark" size={16} color={isDark ? colors.primary : '#49570B'} />
              <AppText variant="captionSmall" color={colors.text} style={{ marginLeft: 6, flex: 1, lineHeight: 16 }}>
                {activeBooking.specialInstructions || activeBooking.space.accessInstructions}
              </AppText>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={{ marginTop: spacing.xl, gap: 10 }}>
          <AppButton
            title="Get Turn-by-Turn Directions"
            onPress={() => setIsDirectionsOpen(true)}
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

      {/* Simulated Directions Modal */}
      <Modal visible={isDirectionsOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.directionsCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                padding: spacing.lg,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AppIcon name="navigate" size={20} color={isDark ? colors.primary : '#49570B'} />
                <AppText variant="h3">Directions (Simulated)</AppText>
              </View>
              <Pressable onPress={() => setIsDirectionsOpen(false)} hitSlop={8}>
                <AppIcon name="close" size={20} color={colors.secondaryText} />
              </Pressable>
            </View>

            <View style={[styles.directionsInfo, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.md }]}>
              <AppText variant="bodyBold">{activeBooking.space.name}</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {activeBooking.space.address}, {activeBooking.space.locality}
              </AppText>
              <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
                <View>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Distance</AppText>
                  <AppText variant="bodyBold">{activeBooking.space.distanceKm || 0.8} km</AppText>
                </View>
                <View>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Est. Drive Time</AppText>
                  <AppText variant="bodyBold">~4 mins</AppText>
                </View>
                <View>
                  <AppText variant="captionSmall" color={colors.secondaryText}>Entry Gate</AppText>
                  <AppText variant="bodyBold">Gate 2 / Main</AppText>
                </View>
              </View>
            </View>

            <View style={{ marginTop: spacing.md, gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppIcon name="radio-button-on" size={12} color={colors.primary} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Head northeast on 100 Feet Road toward Indiranagar Metro Station.
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppIcon name="arrow-forward" size={12} color={colors.primary} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Turn right onto 12th Main Road; proceed 250 meters.
                </AppText>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AppIcon name="checkmark-circle" size={12} color={colors.success} />
                <AppText variant="caption" style={{ flex: 1 }}>
                  Arrive at {activeBooking.space.name} security barrier.
                </AppText>
              </View>
            </View>

            <AppButton
              title="Close Directions"
              variant="outline"
              size="md"
              onPress={() => setIsDirectionsOpen(false)}
              style={{ marginTop: spacing.lg }}
            />
          </View>
        </View>
      </Modal>
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
  demoWatermark: {
    borderWidth: 1,
    marginBottom: 8,
  },
  ticketContainer: {
    borderWidth: 2,
    overflow: 'hidden',
    marginTop: 4,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  directionsCard: {
    width: '100%',
  },
  directionsInfo: {},
});
