import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Image,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useAdminStore } from '../../src/store/useAdminStore';
import { useOwnerStore } from '../../src/store/useOwnerStore';
import { ParkingSpace } from '../../src/types/parking';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AppInput } from '../../src/components/ui/AppInput';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';

export default function AdminApprovalsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const { approveListing, rejectListing } = useAdminStore();
  const listings = useOwnerStore((s) => s.listings);

  const [activeTab, setActiveTab] = useState<'pending' | 'all'>('pending');
  const [rejectingListing, setRejectingListing] = useState<ParkingSpace | null>(null);
  const [rejectReason, setRejectReason] = useState(
    'Tenant subleasing without written Landlord NOC is prohibited by Society Bylaw Section 14.'
  );
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  const pendingListings = listings.filter((l) => l.approvalStatus === 'pending_approval');
  const displayedListings = activeTab === 'pending' ? pendingListings : listings;

  const handleApprove = (space: ParkingSpace) => {
    approveListing(space.id);
    setActionSuccessMessage(`✓ Approved "${space.name}". Slot is now published and active.`);
    setTimeout(() => setActionSuccessMessage(null), 3000);
  };

  const handleConfirmReject = () => {
    if (rejectingListing) {
      rejectListing(rejectingListing.id, rejectReason);
      const name = rejectingListing.name;
      setRejectingListing(null);
      setActionSuccessMessage(`✓ Rejected "${name}". Owner has been notified with the reason.`);
      setTimeout(() => setActionSuccessMessage(null), 3000);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Listing Authorizations"
        subtitle="Review resident parking submissions"
        showBack
        onBack={() => router.back()}
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
        {/* Success Alert */}
        {actionSuccessMessage && (
          <View
            style={[
              styles.successBanner,
              {
                backgroundColor: 'rgba(34, 197, 94, 0.15)',
                borderColor: colors.success,
                borderRadius: radius.md,
                padding: spacing.sm,
                marginTop: spacing.xs,
              },
            ]}
          >
            <AppText variant="captionSmall" weight="bold" color={colors.success}>
              {actionSuccessMessage}
            </AppText>
          </View>
        )}

        {/* Tab Filter */}
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radius.pill,
              borderColor: colors.border,
              marginTop: spacing.sm,
            },
          ]}
        >
          <Pressable
            onPress={() => setActiveTab('pending')}
            style={[
              styles.segmentButton,
              {
                backgroundColor: activeTab === 'pending' ? colors.surface : 'transparent',
                borderRadius: radius.pill,
              },
            ]}
          >
            <AppText
              variant="captionSmall"
              weight={activeTab === 'pending' ? 'bold' : 'medium'}
              color={activeTab === 'pending' ? colors.text : colors.secondaryText}
            >
              Pending Verification ({pendingListings.length})
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('all')}
            style={[
              styles.segmentButton,
              {
                backgroundColor: activeTab === 'all' ? colors.surface : 'transparent',
                borderRadius: radius.pill,
              },
            ]}
          >
            <AppText
              variant="captionSmall"
              weight={activeTab === 'all' ? 'bold' : 'medium'}
              color={activeTab === 'all' ? colors.text : colors.secondaryText}
            >
              All Society Listings ({listings.length})
            </AppText>
          </Pressable>
        </View>

        {/* Listings List */}
        {displayedListings.length === 0 ? (
          <AppCard style={{ marginTop: spacing.xl, padding: 32, alignItems: 'center' }}>
            <AppIcon name="checkmark-done-circle" size={48} color={colors.success} />
            <AppText variant="h3" style={{ marginTop: 12 }}>
              All Submissions Reviewed
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} align="center" style={{ marginTop: 4 }}>
              There are no pending apartment parking listings awaiting association authorization.
            </AppText>
          </AppCard>
        ) : (
          <View style={{ marginTop: spacing.md, gap: 14 }}>
            {displayedListings.map((space) => {
              const isPending = space.approvalStatus === 'pending_approval';
              const isApproved = space.approvalStatus === 'approved';
              const isRejected = space.approvalStatus === 'rejected';

              return (
                <AppCard key={space.id} style={{ padding: 14 }}>
                  {/* Space Image & Header */}
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    <Image
                      source={{ uri: space.images[0] }}
                      style={[styles.listingThumb, { borderRadius: radius.md }]}
                    />

                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <AccessTypePill accessType={space.accessType} compact />
                        <AppBadge
                          label={space.approvalStatus.toUpperCase()}
                          variant={isApproved ? 'success' : isPending ? 'warning' : 'error'}
                          size="sm"
                        />
                      </View>

                      <AppText variant="h3" style={{ marginTop: 4 }}>
                        {space.name}
                      </AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        {space.address}, {space.locality}
                      </AppText>
                    </View>
                  </View>

                  {/* Resident & Apartment Details Box */}
                  <View
                    style={[
                      styles.detailsBox,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderRadius: radius.md,
                        padding: spacing.sm,
                        marginTop: spacing.md,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <AppText variant="captionSmall" color={colors.secondaryText}>
                          APPLICANT RESIDENT
                        </AppText>
                        <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                          {space.owner.name}
                        </AppText>
                        <AppText variant="captionSmall" color={colors.secondaryText}>
                          Host Rating: {space.owner.rating} ★
                        </AppText>
                      </View>

                      <View style={{ alignItems: 'flex-end' }}>
                        <AppText variant="captionSmall" color={colors.secondaryText}>
                          FLAT & BAY NUMBER
                        </AppText>
                        <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                          {space.communityInfo?.unitOrFlatNumber || 'Unit Verified'}
                        </AppText>
                        <AppText variant="captionSmall" color={colors.secondaryText}>
                          Slot: {space.communityInfo?.slotNumber || 'P1 - Assigned'}
                        </AppText>
                      </View>
                    </View>

                    <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: 8 }]} />

                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        Requested Rates: ₹{space.pricePerHour}/hr • ₹{space.pricePerDay}/day
                      </AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        {space.dimensions.lengthMeters}m × {space.dimensions.widthMeters}m
                      </AppText>
                    </View>

                    {space.communityInfo?.rejectionReason && (
                      <View style={{ marginTop: 6 }}>
                        <AppText variant="captionSmall" weight="bold" color={colors.error}>
                          Rejection Reason: {space.communityInfo.rejectionReason}
                        </AppText>
                      </View>
                    )}
                  </View>

                  {/* Administrator Action Buttons (if pending) */}
                  {isPending && (
                    <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.md }}>
                      <View style={{ flex: 1 }}>
                        <AppButton
                          title="✓ Authorize & Publish"
                          onPress={() => handleApprove(space)}
                          variant="primary"
                          size="md"
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppButton
                          title="✕ Reject Listing"
                          onPress={() => setRejectingListing(space)}
                          variant="outline"
                          size="md"
                        />
                      </View>
                    </View>
                  )}
                </AppCard>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Rejection Reason Modal */}
      <Modal visible={!!rejectingListing} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              {
                backgroundColor: colors.surface,
                borderRadius: radius.card,
                padding: spacing.lg,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="h3">Reject Listing</AppText>
              <Pressable onPress={() => setRejectingListing(null)} hitSlop={8}>
                <AppIcon name="close" size={20} color={colors.secondaryText} />
              </Pressable>
            </View>

            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
              Specify the society bylaw or ownership verification ground for declining {rejectingListing?.name}:
            </AppText>

            <View style={{ marginTop: spacing.md, gap: 8 }}>
              {[
                'Tenant subleasing without written Landlord NOC is prohibited by Society Bylaw Section 14.',
                'Parking bay identification number clashes with emergency/visitor slot.',
                'Flat number provided does not match current registered association roll.',
                'Commercial passenger vehicle parking not permitted in residential towers.',
              ].map((reason) => {
                const isSelected = rejectReason === reason;
                return (
                  <Pressable
                    key={reason}
                    onPress={() => setRejectReason(reason)}
                    style={[
                      styles.reasonOption,
                      {
                        backgroundColor: isSelected ? colors.surfaceSubtle : colors.surface,
                        borderColor: isSelected ? colors.primary : colors.border,
                        borderRadius: radius.md,
                        padding: spacing.sm,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <AppText variant="captionSmall" style={{ flex: 1 }}>
                      {reason}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>

            <View style={{ marginTop: spacing.md }}>
              <AppInput
                label="Custom Rejection Notes"
                value={rejectReason}
                onChangeText={setRejectReason}
                multiline
                numberOfLines={2}
              />
            </View>

            <View style={{ flexDirection: 'row', gap: 10, marginTop: spacing.lg }}>
              <View style={{ flex: 1 }}>
                <AppButton
                  title="Cancel"
                  variant="secondary"
                  size="md"
                  onPress={() => setRejectingListing(null)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <AppButton
                  title="Confirm Rejection"
                  variant="outline"
                  size="md"
                  onPress={handleConfirmReject}
                />
              </View>
            </View>
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
  successBanner: {
    borderWidth: 1,
  },
  segmentContainer: {
    flexDirection: 'row',
    padding: 3,
    borderWidth: 1,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listingThumb: {
    width: 80,
    height: 80,
  },
  detailsBox: {},
  divider: {
    height: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    width: '100%',
  },
  reasonOption: {
    flexDirection: 'row',
  },
});
