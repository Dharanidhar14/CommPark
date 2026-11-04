import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Image,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../../src/theme';
import { useOwnerStore } from '../../../src/store/useOwnerStore';
import { AppHeader } from '../../../src/components/ui/AppHeader';
import { AppText } from '../../../src/components/ui/AppText';
import { AppIcon } from '../../../src/components/ui/AppIcon';
import { AppCard } from '../../../src/components/ui/AppCard';
import { AppBadge } from '../../../src/components/ui/AppBadge';
import { AppButton } from '../../../src/components/ui/AppButton';
import { AppInput } from '../../../src/components/ui/AppInput';
import { AccessTypePill } from '../../../src/components/parking/AccessTypePill';

export default function ListingManageScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, spacing, radius, isDark } = useTheme();

  const {
    listings,
    reservations,
    updateListing,
    toggleAvailability,
    simulateCommunityApproval,
  } = useOwnerStore();

  const space = listings.find((l) => l.id === id);

  // Form State
  const [pricePerHour, setPricePerHour] = useState(space ? space.pricePerHour.toString() : '40');
  const [pricePerDay, setPricePerDay] = useState(space ? space.pricePerDay.toString() : '250');
  const [operatingHours, setOperatingHours] = useState(space ? space.operatingHours : '24 Hours (Daily)');
  const [accessInstructions, setAccessInstructions] = useState(space ? space.accessInstructions : '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Manage Space" showBack onBack={() => router.back()} />
        <View style={{ padding: 24, alignItems: 'center', marginTop: 40 }}>
          <AppIcon name="alert-circle-outline" size={48} color={colors.secondaryText} />
          <AppText variant="h3" style={{ marginTop: 16 }}>
            Listing Not Found
          </AppText>
          <AppButton
            title="Back to Dashboard"
            onPress={() => router.replace('/owner' as any)}
            style={{ marginTop: 24 }}
          />
        </View>
      </View>
    );
  }

  const isApproved = space.approvalStatus === 'approved';
  const isPending = space.approvalStatus === 'pending_approval';
  const isRejected = space.approvalStatus === 'rejected';

  const upcomingReservations = reservations.filter((r) => r.spaceId === space.id && r.status === 'upcoming');

  const handleSave = () => {
    updateListing(space.id, {
      pricePerHour: parseInt(pricePerHour, 10) || space.pricePerHour,
      pricePerDay: parseInt(pricePerDay, 10) || space.pricePerDay,
      operatingHours,
      accessInstructions,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Manage Space"
        subtitle={space.name}
        showBack
        onBack={() => router.back()}
      />

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
        {/* Cover Photo & Badges */}
        <View style={styles.imageBox}>
          <Image
            source={{ uri: space.images[0] }}
            style={[styles.coverImage, { borderRadius: radius.card }]}
          />
          <View style={styles.imageOverlayBadges}>
            <AccessTypePill accessType={space.accessType} compact />
            {isApproved && <AppBadge label="APPROVED" variant="success" size="sm" />}
            {isPending && <AppBadge label="PENDING RWA APPROVAL" variant="warning" size="sm" />}
            {isRejected && <AppBadge label="DISAPPROVED BY RWA" variant="error" size="sm" />}
          </View>
        </View>

        {/* Live Status Card */}
        <AppCard style={{ marginTop: spacing.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <AppText variant="h3">
                {space.isAvailable && isApproved ? 'Listing is LIVE' : 'Listing is PAUSED'}
              </AppText>
              <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                {!isApproved
                  ? 'Space cannot be activated until association approval is granted.'
                  : space.isAvailable
                  ? 'Discoverable on map; accepting new customer bookings.'
                  : 'Temporarily hidden from search; existing reservations remain protected.'}
              </AppText>
            </View>

            <Switch
              value={space.isAvailable && isApproved}
              disabled={!isApproved}
              onValueChange={() => toggleAvailability(space.id)}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={isDark ? '#000' : '#fff'}
            />
          </View>
        </AppCard>

        {/* Community Approval Section */}
        {space.communityInfo && (
          <View style={{ marginTop: spacing.lg }}>
            <AppText variant="h4" weight="bold">
              Community Association Status
            </AppText>

            <AppCard style={{ marginTop: spacing.xs }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <AppText variant="bodyBold">{space.communityInfo.societyName}</AppText>
                  <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                    Unit: {space.communityInfo.unitOrFlatNumber} • Slot: {space.communityInfo.slotNumber}
                  </AppText>
                </View>
                <AppBadge
                  label={space.approvalStatus.toUpperCase()}
                  variant={isApproved ? 'success' : isPending ? 'warning' : 'error'}
                  size="sm"
                />
              </View>

              {isPending && (
                <View
                  style={[
                    styles.pendingBox,
                    {
                      backgroundColor: 'rgba(234, 179, 8, 0.12)',
                      borderColor: colors.warning,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                      marginTop: spacing.md,
                    },
                  ]}
                >
                  <AppText variant="captionSmall" color={colors.warning} weight="bold">
                    Verification In Progress
                  </AppText>
                  <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
                    Society Estate Office has been notified. You can use the test button below to simulate committee approval.
                  </AppText>
                  <Pressable
                    onPress={() => simulateCommunityApproval(space.id)}
                    style={{ marginTop: 8 }}
                  >
                    <AppText variant="captionSmall" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                      ⚡ Simulate RWA Approval (Test Action)
                    </AppText>
                  </Pressable>
                </View>
              )}

              {isRejected && (
                <View
                  style={[
                    styles.rejectedBox,
                    {
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      borderColor: colors.error,
                      borderRadius: radius.md,
                      padding: spacing.sm,
                      marginTop: spacing.md,
                    },
                  ]}
                >
                  <AppText variant="captionSmall" color={colors.error} weight="bold">
                    Rejection Reason
                  </AppText>
                  <AppText variant="captionSmall" color={colors.error} style={{ marginTop: 2 }}>
                    {space.communityInfo.rejectionReason}
                  </AppText>
                </View>
              )}
            </AppCard>
          </View>
        )}

        {/* Editable Pricing & Parameters */}
        <View style={{ marginTop: spacing.lg }}>
          <AppText variant="h4" weight="bold">
            Edit Pricing & Rules
          </AppText>

          <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.sm }}>
            <View style={{ flex: 1 }}>
              <AppInput
                label="Hourly Rate (₹)"
                value={pricePerHour}
                onChangeText={setPricePerHour}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppInput
                label="Daily Rate (₹)"
                value={pricePerDay}
                onChangeText={setPricePerDay}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <AppInput
              label="Operating Hours"
              value={operatingHours}
              onChangeText={setOperatingHours}
            />
          </View>

          <View style={{ marginTop: spacing.sm }}>
            <AppInput
              label="Access Instructions for Drivers"
              value={accessInstructions}
              onChangeText={setAccessInstructions}
              multiline
              numberOfLines={3}
            />
          </View>

          {saveSuccess && (
            <View
              style={[
                styles.saveAlert,
                {
                  backgroundColor: 'rgba(34, 197, 94, 0.15)',
                  borderColor: colors.success,
                  borderRadius: radius.md,
                  padding: spacing.sm,
                  marginTop: spacing.sm,
                },
              ]}
            >
              <AppText variant="captionSmall" weight="bold" color={colors.success}>
                ✓ Changes saved successfully!
              </AppText>
            </View>
          )}

          <AppButton
            title="Save Space Updates"
            onPress={handleSave}
            variant="primary"
            size="md"
            style={{ marginTop: spacing.md }}
          />
        </View>

        {/* Upcoming Reservations on this Bay */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <AppText variant="h4" weight="bold">
              Upcoming Reservations ({upcomingReservations.length})
            </AppText>
            <AppBadge label="PROTECTED" variant="default" size="sm" />
          </View>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
            Existing bookings remain active even if you pause or update rates.
          </AppText>

          <View style={{ marginTop: spacing.sm }}>
            {upcomingReservations.length === 0 ? (
              <AppCard style={{ padding: 16, alignItems: 'center' }}>
                <AppText variant="caption" color={colors.secondaryText}>
                  No active reservations currently scheduled for this slot.
                </AppText>
              </AppCard>
            ) : (
              upcomingReservations.map((res) => (
                <AppCard key={res.id} style={{ marginBottom: 8, padding: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View>
                      <AppText variant="bodyBold">{res.customerName}</AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        Plate: {res.vehiclePlate} ({res.vehicleModel})
                      </AppText>
                      <AppText variant="captionSmall" color={colors.text} style={{ marginTop: 2 }}>
                        {res.startTime} → {res.endTime}
                      </AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <AppText variant="bodyBold" color={isDark ? colors.primary : '#49570B'}>
                        ₹{res.earningsAmount.toFixed(2)}
                      </AppText>
                      <AppBadge label="CONFIRMED" variant="success" size="sm" style={{ marginTop: 4 }} />
                    </View>
                  </View>
                </AppCard>
              ))
            )}
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
  imageBox: {
    position: 'relative',
    marginTop: 4,
  },
  coverImage: {
    width: '100%',
    height: 180,
  },
  imageOverlayBadges: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  pendingBox: {
    borderWidth: 1,
  },
  rejectedBox: {
    borderWidth: 1,
  },
  saveAlert: {
    borderWidth: 1,
  },
});
