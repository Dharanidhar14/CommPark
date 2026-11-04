import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Switch,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useOwnerStore } from '../../src/store/useOwnerStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppButton } from '../../src/components/ui/AppButton';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';

export default function OwnerDashboardScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const {
    listings,
    reservations,
    totalEarnings,
    occupancyRatePercent,
    toggleAvailability,
    simulateCommunityApproval,
  } = useOwnerStore();

  const [activeTab, setActiveTab] = useState<'listings' | 'reservations'>('listings');

  const activeListingsCount = listings.filter((l) => l.isAvailable && l.approvalStatus === 'approved').length;
  const upcomingReservations = reservations.filter((r) => r.status === 'upcoming');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title="Owner Dashboard"
        subtitle="Manage spaces, availability & earnings"
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
        {/* Performance Metrics Cards */}
        <View style={styles.metricsGrid}>
          {/* Earnings Metric */}
          <AppCard style={styles.metricCard}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                TOTAL EARNINGS
              </AppText>
              <AppBadge label="SIMULATED" variant="default" size="sm" />
            </View>
            <AppText
              variant="h2"
              weight="extraBold"
              color={isDark ? colors.primary : '#49570B'}
              style={{ marginTop: 4 }}
            >
              ₹{totalEarnings.toFixed(2)}
            </AppText>
            <Pressable
              onPress={() => router.push('/owner/earnings' as any)}
              style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}
            >
              <AppText variant="captionSmall" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                View Payouts & History
              </AppText>
              <AppIcon name="chevron-forward" size={14} color={isDark ? colors.primary : '#49570B'} />
            </Pressable>
          </AppCard>

          {/* Active Listings & Occupancy */}
          <AppCard style={styles.metricCard}>
            <AppText variant="captionSmall" color={colors.secondaryText}>
              ACTIVE / TOTAL LISTINGS
            </AppText>
            <AppText variant="h2" weight="extraBold" style={{ marginTop: 4 }}>
              {activeListingsCount} / {listings.length}
            </AppText>
            <View style={{ marginTop: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Occupancy
                </AppText>
                <AppText variant="captionSmall" weight="bold">
                  {occupancyRatePercent}%
                </AppText>
              </View>
              <View
                style={[
                  styles.progressBarBg,
                  { backgroundColor: colors.surfaceSubtle, borderRadius: radius.pill, marginTop: 4 },
                ]}
              >
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${occupancyRatePercent}%`,
                      backgroundColor: colors.primary,
                      borderRadius: radius.pill,
                    },
                  ]}
                />
              </View>
            </View>
          </AppCard>
        </View>

        {/* Quick Actions Row */}
        <View style={{ marginTop: spacing.md, flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <AppButton
              title="+ List Parking Space"
              onPress={() => router.push('/owner/new-listing' as any)}
              variant="primary"
              size="md"
              leftIcon={<AppIcon name="add-circle" size={18} color={colors.primaryForeground} />}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              title="Earnings & Payouts"
              onPress={() => router.push('/owner/earnings' as any)}
              variant="secondary"
              size="md"
              leftIcon={<AppIcon name="wallet-outline" size={18} color={colors.text} />}
            />
          </View>
        </View>

        {/* Tab Segment Selector */}
        <View
          style={[
            styles.segmentContainer,
            {
              backgroundColor: colors.surfaceSubtle,
              borderRadius: radius.pill,
              borderColor: colors.border,
              marginTop: spacing.xl,
            },
          ]}
        >
          <Pressable
            onPress={() => setActiveTab('listings')}
            style={[
              styles.segmentButton,
              {
                backgroundColor: activeTab === 'listings' ? colors.surface : 'transparent',
                borderRadius: radius.pill,
              },
            ]}
          >
            <AppText
              variant="captionSmall"
              weight={activeTab === 'listings' ? 'bold' : 'medium'}
              color={activeTab === 'listings' ? colors.text : colors.secondaryText}
            >
              My Listings ({listings.length})
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setActiveTab('reservations')}
            style={[
              styles.segmentButton,
              {
                backgroundColor: activeTab === 'reservations' ? colors.surface : 'transparent',
                borderRadius: radius.pill,
              },
            ]}
          >
            <AppText
              variant="captionSmall"
              weight={activeTab === 'reservations' ? 'bold' : 'medium'}
              color={activeTab === 'reservations' ? colors.text : colors.secondaryText}
            >
              Upcoming Bookings ({upcomingReservations.length})
            </AppText>
          </Pressable>
        </View>

        {/* Tab Content: My Listings */}
        {activeTab === 'listings' && (
          <View style={{ marginTop: spacing.md }}>
            {listings.map((space) => {
              const isApproved = space.approvalStatus === 'approved';
              const isPending = space.approvalStatus === 'pending_approval';
              const isRejected = space.approvalStatus === 'rejected';

              return (
                <AppCard key={space.id} style={styles.listingCard}>
                  <View style={styles.listingHeader}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <AccessTypePill accessType={space.accessType} compact />
                        {isApproved && (
                          <AppBadge label="APPROVED" variant="success" size="sm" />
                        )}
                        {isPending && (
                          <AppBadge label="PENDING RWA APPROVAL" variant="warning" size="sm" />
                        )}
                        {isRejected && (
                          <AppBadge label="DISAPPROVED BY RWA" variant="error" size="sm" />
                        )}
                      </View>

                      <AppText variant="h3" numberOfLines={1} style={{ marginTop: 8 }}>
                        {space.name}
                      </AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        {space.address}, {space.locality}
                      </AppText>
                    </View>

                    {/* Live/Paused Switch (only enabled if approved) */}
                    <View style={styles.switchWrapper}>
                      <Switch
                        value={space.isAvailable && isApproved}
                        disabled={!isApproved}
                        onValueChange={() => toggleAvailability(space.id)}
                        trackColor={{ false: colors.border, true: colors.primary }}
                        thumbColor={isDark ? '#000' : '#fff'}
                      />
                      <AppText
                        variant="captionSmall"
                        weight="bold"
                        color={space.isAvailable && isApproved ? colors.success : colors.secondaryText}
                        style={{ marginTop: 2 }}
                      >
                        {space.isAvailable && isApproved ? 'LIVE' : 'PAUSED'}
                      </AppText>
                    </View>
                  </View>

                  {/* Pending Approval Explanatory Banner & Simulator CTA */}
                  {isPending && (
                    <View
                      style={[
                        styles.pendingNotice,
                        {
                          backgroundColor: 'rgba(234, 179, 8, 0.1)',
                          borderColor: colors.warning,
                          borderRadius: radius.md,
                          padding: spacing.sm,
                          marginTop: spacing.sm,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                        <AppIcon name="time-outline" size={16} color={colors.warning} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <AppText variant="captionSmall" weight="bold" color={colors.warning}>
                            Apartment Association Verification Required
                          </AppText>
                          <AppText variant="captionSmall" color={colors.warning} style={{ marginTop: 2 }}>
                            {space.communityInfo?.societyName || 'Society Management'} must verify slot ownership before public bookings are accepted.
                          </AppText>
                          <Pressable
                            onPress={() => simulateCommunityApproval(space.id)}
                            style={{ marginTop: 6 }}
                          >
                            <AppText
                              variant="captionSmall"
                              weight="bold"
                              color={isDark ? colors.primary : '#49570B'}
                            >
                              ⚡ Simulate RWA Approval (Test Action)
                            </AppText>
                          </Pressable>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Rejected Explanatory Banner */}
                  {isRejected && (
                    <View
                      style={[
                        styles.rejectedNotice,
                        {
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          borderColor: colors.error,
                          borderRadius: radius.md,
                          padding: spacing.sm,
                          marginTop: spacing.sm,
                        },
                      ]}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 6 }}>
                        <AppIcon name="alert-circle" size={16} color={colors.error} style={{ marginTop: 2 }} />
                        <View style={{ flex: 1 }}>
                          <AppText variant="captionSmall" weight="bold" color={colors.error}>
                            Listing Rejected by Society
                          </AppText>
                          <AppText variant="captionSmall" color={colors.error} style={{ marginTop: 2 }}>
                            {space.communityInfo?.rejectionReason || 'Commercial sublease not permitted by society bylaws.'}
                          </AppText>
                        </View>
                      </View>
                    </View>
                  )}

                  {/* Listing Footer Details */}
                  <View
                    style={[
                      styles.listingFooter,
                      {
                        borderTopColor: colors.borderSubtle,
                        borderTopWidth: 1,
                        marginTop: spacing.md,
                        paddingTop: spacing.sm,
                      },
                    ]}
                  >
                    <View>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        Pricing Rate
                      </AppText>
                      <AppText variant="bodyBold">
                        ₹{space.pricePerHour}/hr • ₹{space.pricePerDay}/day
                      </AppText>
                    </View>

                    <AppButton
                      title="Manage Space"
                      onPress={() => router.push(`/owner/listing/${space.id}` as any)}
                      variant="secondary"
                      size="sm"
                      fullWidth={false}
                      rightIcon={<AppIcon name="chevron-forward" size={14} color={colors.text} />}
                    />
                  </View>
                </AppCard>
              );
            })}
          </View>
        )}

        {/* Tab Content: Upcoming Reservations */}
        {activeTab === 'reservations' && (
          <View style={{ marginTop: spacing.md }}>
            {upcomingReservations.length === 0 ? (
              <AppCard style={{ padding: 24, alignItems: 'center' }}>
                <AppIcon name="calendar-outline" size={36} color={colors.secondaryText} />
                <AppText variant="bodyBold" style={{ marginTop: 12 }}>
                  No Upcoming Reservations
                </AppText>
                <AppText variant="captionSmall" color={colors.secondaryText} align="center" style={{ marginTop: 4 }}>
                  Ensure your approved parking spots are marked LIVE to receive bookings.
                </AppText>
              </AppCard>
            ) : (
              upcomingReservations.map((res) => (
                <AppCard key={res.id} style={styles.resCard}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <View style={{ flex: 1 }}>
                      <AppBadge label="UPCOMING BOOKING" variant="primary" size="sm" />
                      <AppText variant="h3" style={{ marginTop: 6 }}>
                        {res.spaceName}
                      </AppText>
                      <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
                        Slot: {res.slotNumber}
                      </AppText>
                    </View>
                    <View style={{ alignItems: 'flex-end', marginLeft: 8 }}>
                      <AppText variant="captionSmall" color={colors.secondaryText}>
                        Owner Payout
                      </AppText>
                      <AppText variant="h3" color={isDark ? colors.primary : '#49570B'}>
                        ₹{res.earningsAmount.toFixed(2)}
                      </AppText>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.resDetailsBox,
                      {
                        backgroundColor: colors.surfaceSubtle,
                        borderRadius: radius.sm,
                        padding: spacing.sm,
                        marginTop: spacing.sm,
                      },
                    ]}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View>
                        <AppText variant="captionSmall" color={colors.secondaryText}>
                          CUSTOMER
                        </AppText>
                        <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                          {res.customerName}
                        </AppText>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <AppText variant="captionSmall" color={colors.secondaryText}>
                          VEHICLE
                        </AppText>
                        <AppText variant="bodyBold" style={{ marginTop: 2 }}>
                          {res.vehiclePlate}
                        </AppText>
                        <AppText variant="captionSmall" color={colors.secondaryText}>
                          {res.vehicleModel}
                        </AppText>
                      </View>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 }}>
                      <AppIcon name="time-outline" size={14} color={colors.secondaryText} />
                      <AppText variant="captionSmall" color={colors.text}>
                        {res.startTime} → {res.endTime} ({res.durationHours} hrs)
                      </AppText>
                    </View>
                  </View>
                </AppCard>
              ))
            )}
          </View>
        )}

        {/* Reservation Protection Banner */}
        <View
          style={[
            styles.safetyBanner,
            {
              backgroundColor: colors.surfaceSubtle,
              borderColor: colors.border,
              borderRadius: radius.md,
              padding: spacing.md,
              marginTop: spacing.xl,
            },
          ]}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <AppIcon name="shield-checkmark-outline" size={18} color={isDark ? colors.primary : '#49570B'} />
            <AppText variant="caption" weight="bold">
              Reservation Guarantee Protocol
            </AppText>
          </View>
          <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4, lineHeight: 16 }}>
            Pausing or updating a listing does not cancel or modify already confirmed customer bookings. Confirmed drivers retain valid gate access.
          </AppText>
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
  metricsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  metricCard: {
    flex: 1,
    padding: 14,
  },
  progressBarBg: {
    height: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
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
  listingCard: {
    marginBottom: 12,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  switchWrapper: {
    alignItems: 'center',
    marginLeft: 8,
  },
  pendingNotice: {
    borderWidth: 1,
  },
  rejectedNotice: {
    borderWidth: 1,
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resCard: {
    marginBottom: 12,
  },
  resDetailsBox: {},
  safetyBanner: {
    borderWidth: 1,
  },
});
