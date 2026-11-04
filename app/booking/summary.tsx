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
import { useAuthStore } from '../../src/store/useAuthStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';

export default function BookingSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { draft, setDraftDuration, setDraftVehicle, confirmBooking } = useBookingStore();
  const { vehicles, user } = useAuthStore();

  const space = draft.space;
  const selectedVehicle = draft.vehicle || vehicles[0];
  const duration = draft.durationHours || 2;

  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'card'>('wallet');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Booking Summary" showBack />
        <View style={{ padding: 24, alignItems: 'center' }}>
          <AppText variant="h3">No Space Selected</AppText>
          <AppButton
            title="Explore Spaces"
            onPress={() => router.replace('/(tabs)/explore' as any)}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    );
  }

  const subtotal = Number((space.pricePerHour * duration).toFixed(2));
  const serviceFee = 1.50;
  const totalAmount = Number((subtotal + serviceFee).toFixed(2));

  const durations = [1, 2, 4, 8, 24];

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const booking = confirmBooking();
      if (booking) {
        router.replace('/booking/pass' as any);
      }
    }, 600);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader title="Booking Summary" subtitle="Review details and vehicle" showBack />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 90,
          },
        ]}
      >
        {/* Selected Space Overview */}
        <AppCard style={{ marginTop: spacing.xs }}>
          <View style={styles.spaceCardTop}>
            <View style={{ flex: 1 }}>
              <AccessTypePill accessType={space.accessType} compact />
              <AppText variant="h3" style={{ marginTop: 6 }}>
                {space.name}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                {space.address}
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Vehicle Selection */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h3">Select Registered Vehicle</AppText>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              Required for gate verification
            </AppText>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            {vehicles.map((veh) => {
              const isSelected = selectedVehicle?.id === veh.id;
              return (
                <Pressable
                  key={veh.id}
                  onPress={() => setDraftVehicle(veh)}
                  style={({ pressed }) => [
                    styles.vehicleItem,
                    {
                      backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.md,
                      padding: spacing.md,
                      borderWidth: isSelected ? 2 : 1,
                      opacity: pressed ? 0.9 : 1,
                    },
                  ]}
                >
                  <AppIcon name="car-sport" size={20} color={isSelected ? colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B' : colors.secondaryText} />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <AppText variant="bodyBold">
                      {veh.make} {veh.model} ({veh.licensePlate})
                    </AppText>
                    <AppText variant="captionSmall" color={colors.secondaryText}>
                      Color: {veh.color} • Type: {veh.type.toUpperCase()}
                    </AppText>
                  </View>
                  <AppIcon
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={20}
                    color={isSelected ? colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B' : colors.secondaryText}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Duration Picker */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Parking Duration</AppText>
          <View style={[styles.durationRow, { marginTop: spacing.sm }]}>
            {durations.map((hrs) => {
              const isSelected = duration === hrs;
              return (
                <Pressable
                  key={hrs}
                  onPress={() => setDraftDuration(hrs)}
                  style={[
                    styles.durationChip,
                    {
                      backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.pill,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? colors.pricePinText : colors.text}
                  >
                    {hrs === 24 ? '1 Day' : `${hrs}h`}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Payment Method</AppText>
          <View style={{ marginTop: spacing.sm }}>
            <Pressable
              onPress={() => setPaymentMethod('wallet')}
              style={[
                styles.paymentOption,
                {
                  backgroundColor: paymentMethod === 'wallet' ? colors.surfaceSubtle : colors.surface,
                  borderColor: paymentMethod === 'wallet' ? colors.primary : colors.border,
                  borderRadius: radius.md,
                  padding: spacing.md,
                  borderWidth: paymentMethod === 'wallet' ? 2 : 1,
                },
              ]}
            >
              <AppIcon name="wallet" size={20} color={colors.text} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <AppText variant="bodyBold">CommunityPark Wallet</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Balance: ${user.wallet.balance.toFixed(2)} available
                </AppText>
              </View>
              <AppIcon
                name={paymentMethod === 'wallet' ? 'radio-button-on' : 'radio-button-off'}
                size={20}
                color={paymentMethod === 'wallet' ? colors.primaryForeground === '#171A18' && colors.background === '#171A18' ? colors.primary : '#49570B' : colors.secondaryText}
              />
            </Pressable>
          </View>
        </View>

        {/* Transparent Fee Breakdown */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h3">Cost Breakdown</AppText>
          <AppCard style={{ marginTop: spacing.sm }}>
            <View style={styles.feeRow}>
              <AppText variant="body" color={colors.secondaryText}>
                Parking Fee ({duration} hrs @ ${space.pricePerHour.toFixed(2)}/hr)
              </AppText>
              <AppText variant="bodyBold">${subtotal.toFixed(2)}</AppText>
            </View>

            <View style={[styles.feeRow, { marginTop: spacing.xs }]}>
              <AppText variant="body" color={colors.secondaryText}>
                Community Platform & Security Fee
              </AppText>
              <AppText variant="bodyBold">${serviceFee.toFixed(2)}</AppText>
            </View>

            <View
              style={[
                styles.totalRow,
                {
                  borderTopColor: colors.borderSubtle,
                  borderTopWidth: 1,
                  paddingTop: spacing.sm,
                  marginTop: spacing.md,
                },
              ]}
            >
              <AppText variant="h3">Total Due</AppText>
              <AppText variant="h2" weight="extraBold" color={colors.text}>
                ${totalAmount.toFixed(2)}
              </AppText>
            </View>
          </AppCard>
        </View>
      </ScrollView>

      {/* Bottom Floating Checkout Action */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingHorizontal: spacing.lg,
          },
        ]}
      >
        <AppButton
          title={isSubmitting ? 'Confirming Reservation...' : `Confirm & Pay $${totalAmount.toFixed(2)}`}
          onPress={handleConfirm}
          loading={isSubmitting}
          variant="primary"
          size="lg"
          rightIcon={<AppIcon name="arrow-forward" size={18} color={colors.primaryForeground} />}
        />
      </View>
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
  spaceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationChip: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
  },
});
