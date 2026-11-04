import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Modal,
  Switch,
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
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';
import { AddVehicleModal } from '../../src/components/booking/AddVehicleModal';
import { PaymentMethodType } from '../../src/types/booking';

type UpiApp = 'gpay' | 'phonepe' | 'paytm' | 'bhim';

export default function BookingSummaryScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const {
    draft,
    setDraftDuration,
    setDraftVehicle,
    setDraftDate,
    setDraftStartTime,
    setDraftPaymentMethod,
    setDraftUpiApp,
    setSimulateFailure,
    confirmBooking,
  } = useBookingStore();

  const { vehicles, user, addVehicle } = useAuthStore();

  const space = draft.space;
  const selectedVehicle = draft.vehicle || vehicles[0];
  const duration = draft.durationHours || 2;
  const bookingDate = draft.bookingDate || 'Today';
  const startTime = draft.startTime || 'Immediate / Now';
  const paymentMethod = draft.paymentMethod || 'upi';
  const upiApp = draft.upiApp || 'gpay';
  const simulateFailure = draft.simulateFailure || false;

  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Booking Summary" showBack />
        <View style={{ padding: 24, alignItems: 'center', marginTop: 40 }}>
          <AppIcon name="car-outline" size={48} color={colors.secondaryText} />
          <AppText variant="h3" style={{ marginTop: 16 }}>
            No Space Selected
          </AppText>
          <AppText variant="body" color={colors.secondaryText} align="center" style={{ marginTop: 8 }}>
            Please select a verified parking location from Explore to proceed.
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

  const subtotal = Math.round(space.pricePerHour * duration);
  const serviceFee = 15; // ₹15 platform & security verification fee
  const totalAmount = subtotal + serviceFee;

  const dates = ['Today', 'Tomorrow', 'In 2 Days'];
  const times = ['Immediate / Now', '10:00 AM', '01:00 PM', '04:30 PM', '07:00 PM'];
  const durations = [1, 2, 4, 8, 24];

  const upiOptions: { id: UpiApp; name: string; subtitle: string; icon: string }[] = [
    { id: 'gpay', name: 'Google Pay', subtitle: 'UPI Instant Mandate', icon: 'logo-google' },
    { id: 'phonepe', name: 'PhonePe', subtitle: 'UPI / Direct Bank', icon: 'flash' },
    { id: 'paytm', name: 'Paytm UPI', subtitle: 'Wallet & Bank UPI', icon: 'wallet-outline' },
    { id: 'bhim', name: 'BHIM UPI', subtitle: 'NPCI Unified Payments', icon: 'shield-checkmark-outline' },
  ];

  const handleConfirm = () => {
    setPaymentError(null);
    setIsProcessing(true);
    setProcessingStep(
      paymentMethod === 'upi'
        ? `Requesting UPI mandate from ${upiApp.toUpperCase()}...`
        : paymentMethod === 'wallet'
        ? 'Deducting from CommunityPark Wallet...'
        : 'Authorizing card with 3D Secure...'
    );

    setTimeout(() => {
      if (simulateFailure) {
        setIsProcessing(false);
        setPaymentError('Simulated UPI / Bank Payment Failure: Authorization declined by issuer (Testing Mode). You can toggle failure off and retry.');
      } else {
        setProcessingStep('Security verification slot reserved! Generating pass...');
        setTimeout(() => {
          setIsProcessing(false);
          const booking = confirmBooking();
          if (booking) {
            router.replace('/booking/confirmation' as any);
          }
        }, 600);
      }
    }, 1200);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Booking Summary"
        subtitle="Review schedule, vehicle & payment"
        showBack
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingHorizontal: spacing.lg,
            paddingBottom: insets.bottom + 100,
          },
        ]}
      >
        {/* Selected Space Overview */}
        <AppCard style={{ marginTop: spacing.xs }}>
          <View style={styles.spaceCardTop}>
            <View style={{ flex: 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <AccessTypePill accessType={space.accessType} compact />
                <AppBadge label="VERIFIED SPOT" variant="default" size="sm" />
              </View>
              <AppText variant="h3" style={{ marginTop: 8 }}>
                {space.name}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {space.address}, {space.locality}
              </AppText>
            </View>
            <View style={{ alignItems: 'flex-end', marginLeft: 12 }}>
              <AppText variant="h3" color={isDark ? colors.primary : '#49570B'}>
                ₹{space.pricePerHour}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                per hour
              </AppText>
            </View>
          </View>
        </AppCard>

        {/* Date Selection */}
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="h4" weight="bold">
            1. Select Booking Date
          </AppText>
          <View style={[styles.chipRow, { marginTop: spacing.sm }]}>
            {dates.map((d) => {
              const isSelected = bookingDate === d;
              return (
                <Pressable
                  key={d}
                  onPress={() => setDraftDate(d)}
                  style={[
                    styles.chip,
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
                    {d}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Start Time Selection */}
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="h4" weight="bold">
            2. Select Start Time
          </AppText>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.chipRow, { marginTop: spacing.sm }]}
          >
            {times.map((t) => {
              const isSelected = startTime === t;
              return (
                <Pressable
                  key={t}
                  onPress={() => setDraftStartTime(t)}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: isSelected ? colors.pricePinBg : colors.surface,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderRadius: radius.pill,
                      paddingVertical: spacing.sm,
                      paddingHorizontal: spacing.md,
                      marginRight: 8,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? colors.pricePinText : colors.text}
                  >
                    {t}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Parking Duration */}
        <View style={{ marginTop: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <AppText variant="h4" weight="bold">
              3. Parking Duration
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              Overtime grace: 15 mins
            </AppText>
          </View>
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
                      paddingHorizontal: spacing.sm,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'bold' : 'medium'}
                    color={isSelected ? colors.pricePinText : colors.text}
                  >
                    {hrs === 24 ? 'Full Day' : `${hrs} hr${hrs > 1 ? 's' : ''}`}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Vehicle Selection */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="h4" weight="bold">
                4. Select Registered Vehicle
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                Required for residential security QR check
              </AppText>
            </View>
            <Pressable
              onPress={() => setIsAddVehicleOpen(true)}
              style={({ pressed }) => [
                styles.addVehBtn,
                {
                  backgroundColor: colors.surfaceSubtle,
                  borderRadius: radius.pill,
                  paddingHorizontal: spacing.sm,
                  paddingVertical: 4,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <AppIcon name="add" size={16} color={isDark ? colors.primary : '#49570B'} />
              <AppText variant="captionSmall" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                Add Vehicle
              </AppText>
            </Pressable>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            {vehicles.map((veh) => {
              const isSelected = (selectedVehicle?.id || vehicles[0]?.id) === veh.id;
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
                  <AppIcon
                    name="car-sport"
                    size={22}
                    color={isSelected ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <AppText variant="bodyBold">
                        {veh.licensePlate}
                      </AppText>
                      {veh.isDefault && (
                        <AppBadge label="DEFAULT" variant="primary" size="sm" />
                      )}
                    </View>
                    <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                      {veh.make} {veh.model} • {veh.color} • {veh.type.toUpperCase()}
                    </AppText>
                  </View>
                  <AppIcon
                    name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                    size={22}
                    color={isSelected ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
                  />
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Payment Method Selector */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h4" weight="bold">
            5. Payment Method (Simulated Demo)
          </AppText>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Simulate realistic Indian payment options without real bank charges.
          </AppText>

          {/* UPI Option */}
          <Pressable
            onPress={() => setDraftPaymentMethod('upi')}
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'upi' ? colors.surfaceSubtle : colors.surface,
                borderColor: paymentMethod === 'upi' ? colors.primary : colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.sm,
                borderWidth: paymentMethod === 'upi' ? 2 : 1,
              },
            ]}
          >
            <AppIcon name="phone-portrait-outline" size={20} color={colors.text} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold">UPI (Instant AutoPay / QR)</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Google Pay, PhonePe, Paytm, BHIM UPI
              </AppText>
            </View>
            <AppIcon
              name={paymentMethod === 'upi' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'upi' ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
            />
          </Pressable>

          {/* UPI Sub-App Selector */}
          {paymentMethod === 'upi' && (
            <View style={[styles.upiGrid, { borderColor: colors.border, borderRadius: radius.md }]}>
              {upiOptions.map((opt) => {
                const isChosen = upiApp === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setDraftUpiApp(opt.id)}
                    style={[
                      styles.upiAppItem,
                      {
                        backgroundColor: isChosen ? colors.pricePinBg : colors.surface,
                        borderColor: isChosen ? colors.primary : colors.borderSubtle,
                        borderRadius: radius.sm,
                      },
                    ]}
                  >
                    <AppIcon
                      name={opt.icon as any}
                      size={18}
                      color={isChosen ? colors.pricePinText : colors.text}
                    />
                    <AppText
                      variant="captionSmall"
                      weight={isChosen ? 'bold' : 'medium'}
                      color={isChosen ? colors.pricePinText : colors.text}
                      style={{ marginTop: 4 }}
                    >
                      {opt.name}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          )}

          {/* Card Option */}
          <Pressable
            onPress={() => setDraftPaymentMethod('card')}
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'card' ? colors.surfaceSubtle : colors.surface,
                borderColor: paymentMethod === 'card' ? colors.primary : colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.sm,
                borderWidth: paymentMethod === 'card' ? 2 : 1,
              },
            ]}
          >
            <AppIcon name="card-outline" size={20} color={colors.text} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold">Debit / Credit Card</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Visa, MasterCard, RuPay (HDFC •••• 4812)
              </AppText>
            </View>
            <AppIcon
              name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'card' ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
            />
          </Pressable>

          {/* Wallet Option */}
          <Pressable
            onPress={() => setDraftPaymentMethod('wallet')}
            style={[
              styles.paymentOption,
              {
                backgroundColor: paymentMethod === 'wallet' ? colors.surfaceSubtle : colors.surface,
                borderColor: paymentMethod === 'wallet' ? colors.primary : colors.border,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.sm,
                borderWidth: paymentMethod === 'wallet' ? 2 : 1,
              },
            ]}
          >
            <AppIcon name="wallet-outline" size={20} color={colors.text} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <AppText variant="bodyBold">CommunityPark Wallet</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Available Balance: ₹{user.wallet.balance.toFixed(2)}
              </AppText>
            </View>
            <AppIcon
              name={paymentMethod === 'wallet' ? 'radio-button-on' : 'radio-button-off'}
              size={20}
              color={paymentMethod === 'wallet' ? (isDark ? colors.primary : '#49570B') : colors.secondaryText}
            />
          </Pressable>
        </View>

        {/* Demo Simulation Failure Toggle */}
        <View
          style={[
            styles.simToggleCard,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginTop: spacing.lg,
            },
          ]}
        >
          <View style={{ flex: 1, marginRight: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppIcon name="bug-outline" size={16} color={colors.secondaryText} />
              <AppText variant="caption" weight="bold">
                Simulate Payment Failure
              </AppText>
            </View>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Enable to verify declined transaction error handling and retry recovery.
            </AppText>
          </View>
          <Switch
            value={simulateFailure}
            onValueChange={setSimulateFailure}
            trackColor={{ false: colors.border, true: colors.primary }}
            thumbColor={isDark ? '#000' : '#fff'}
          />
        </View>

        {/* Payment Failure Error Notice (if simulated failure was triggered) */}
        {paymentError && (
          <View
            style={[
              styles.errorNotice,
              {
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                borderColor: colors.error,
                borderRadius: radius.md,
                padding: spacing.md,
                marginTop: spacing.md,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 8 }}>
              <AppIcon name="alert-circle" size={20} color={colors.error} />
              <View style={{ flex: 1 }}>
                <AppText variant="caption" weight="bold" color={colors.error}>
                  Payment Simulation Failed
                </AppText>
                <AppText variant="captionSmall" color={colors.error} style={{ marginTop: 2 }}>
                  {paymentError}
                </AppText>
                <AppButton
                  title="Retry Payment"
                  variant="outline"
                  size="sm"
                  onPress={handleConfirm}
                  style={{ marginTop: 8, alignSelf: 'flex-start' }}
                />
              </View>
            </View>
          </View>
        )}

        {/* Transparent Cost Breakdown */}
        <View style={{ marginTop: spacing.xl }}>
          <AppText variant="h4" weight="bold">
            Cost Breakdown
          </AppText>
          <AppCard style={{ marginTop: spacing.sm }}>
            <View style={styles.feeRow}>
              <AppText variant="body" color={colors.secondaryText}>
                Parking Rate ({duration}h @ ₹{space.pricePerHour}/hr)
              </AppText>
              <AppText variant="bodyBold">₹{subtotal.toFixed(2)}</AppText>
            </View>

            <View style={[styles.feeRow, { marginTop: spacing.xs }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <AppText variant="body" color={colors.secondaryText}>
                  Platform & Security Verification
                </AppText>
                <AppIcon name="information-circle-outline" size={14} color={colors.secondaryText} />
              </View>
              <AppText variant="bodyBold">₹{serviceFee.toFixed(2)}</AppText>
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
              <View>
                <AppText variant="h3">Total Payable</AppText>
                <AppText variant="captionSmall" color={colors.success} weight="semiBold">
                  Includes security check & GST
                </AppText>
              </View>
              <AppText variant="h2" weight="extraBold" color={colors.text}>
                ₹{totalAmount.toFixed(2)}
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
          title={isProcessing ? 'Processing Transaction...' : `Pay ₹${totalAmount.toFixed(2)} & Reserve`}
          onPress={handleConfirm}
          disabled={isProcessing}
          variant="primary"
          size="lg"
          rightIcon={<AppIcon name="arrow-forward" size={18} color={colors.primaryForeground} />}
        />
      </View>

      {/* Add Vehicle Modal */}
      <AddVehicleModal
        visible={isAddVehicleOpen}
        onClose={() => setIsAddVehicleOpen(false)}
        onVehicleAdded={(veh) => {
          addVehicle(veh);
        }}
      />

      {/* Payment Processing Modal Overlay */}
      <Modal visible={isProcessing} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.processingBox,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                padding: spacing.xl,
              },
            ]}
          >
            <ActivityIndicator size="large" color={colors.primary} />
            <AppText variant="h3" align="center" style={{ marginTop: 16 }}>
              Simulating Payment
            </AppText>
            <AppText variant="body" color={colors.secondaryText} align="center" style={{ marginTop: 8 }}>
              {processingStep}
            </AppText>
            <AppBadge
              label="DEMO MODE — NO REAL CHARGES"
              variant="default"
              size="sm"
              style={{ marginTop: 16 }}
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
  spaceCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    alignItems: 'center',
    justifyContent: 'center',
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
  addVehBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vehicleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    padding: 8,
    borderWidth: 1,
  },
  upiAppItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
  },
  simToggleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  errorNotice: {
    borderWidth: 1,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  processingBox: {
    width: '100%',
    maxWidth: 340,
    alignItems: 'center',
  },
});
