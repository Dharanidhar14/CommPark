import React from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../src/theme';
import { getParkingSpaceById } from '../../src/features/discovery';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { AppHeader } from '../../src/components/ui/AppHeader';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { AppCard } from '../../src/components/ui/AppCard';
import { AppButton } from '../../src/components/ui/AppButton';
import { ParkingImage } from '../../src/components/parking/ParkingImage';
import { AccessTypePill } from '../../src/components/parking/AccessTypePill';
import { ParkingPrice } from '../../src/components/parking/ParkingPrice';
import { ParkingAvailabilityBadge } from '../../src/components/parking/ParkingAvailabilityBadge';
import { EmptyState } from '../../src/components/ui/EmptyState';

export default function ParkingDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const space = getParkingSpaceById(id || 'space_01');
  const setDraftSpace = useBookingStore((s) => s.setDraftSpace);
  const setDraftVehicle = useBookingStore((s) => s.setDraftVehicle);
  const vehicles = useAuthStore((s) => s.vehicles);

  if (!space) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <AppHeader title="Parking Details" showBack />
        <EmptyState
          icon="alert-circle-outline"
          title="Space Not Found"
          description="The parking space you are looking for does not exist or has been removed."
          actionTitle="Back to Discovery"
          onAction={() => router.back()}
        />
      </View>
    );
  }

  const handleBookNow = () => {
    setDraftSpace(space);
    if (vehicles.length > 0) {
      setDraftVehicle(vehicles[0]);
    }
    router.push('/booking/summary' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={space.name}
        subtitle={space.neighborhood}
        showBack
        rightAction={
          <Pressable style={styles.shareBtn}>
            <AppIcon name="share-outline" size={20} color={colors.text} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 90 },
        ]}
      >
        {/* Photo Gallery Hero */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xs }}>
          <ParkingImage uri={space.images[0]} height={220} covered={space.covered} />
        </View>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          {/* Top Access Badge & Availability */}
          <View style={styles.metaHeaderRow}>
            <AccessTypePill accessType={space.accessType} />
            <ParkingAvailabilityBadge
              isAvailable={space.isAvailable}
              availableSpots={space.availableSpots}
            />
          </View>

          {/* Title & Location */}
          <AppText variant="h2" style={{ marginTop: spacing.sm }}>
            {space.name}
          </AppText>

          <View style={[styles.locationRow, { marginTop: spacing.xs }]}>
            <AppIcon name="location-sharp" size={16} color={isDark ? colors.primary : '#49570B'} />
            <AppText variant="body" color={colors.secondaryText} style={{ marginLeft: 6 }}>
              {space.address}, {space.city} ({space.distanceKm} km away)
            </AppText>
          </View>

          {/* Ratings & Reviews */}
          <View style={[styles.ratingRow, { marginTop: spacing.sm }]}>
            <View style={styles.starBadge}>
              <AppIcon name="star" size={15} color="#F59E0B" />
              <AppText variant="bodyBold" style={{ marginLeft: 4 }}>
                {space.rating.toFixed(2)}
              </AppText>
            </View>
            <AppText variant="caption" color={colors.secondaryText} style={{ marginLeft: 8 }}>
              • {space.reviewCount} community verified reviews
            </AppText>
          </View>

          {/* Access Workflow Explainer Card (Key Differentiator) */}
          <AppCard
            style={[
              styles.accessExplainerCard,
              {
                backgroundColor: colors.surfaceSubtle,
                borderColor: colors.border,
                marginTop: spacing.lg,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppIcon
                name={
                  space.accessType === 'security_verified'
                    ? 'shield-checkmark'
                    : space.accessType === 'owner_assisted'
                    ? 'person'
                    : space.accessType === 'direct_access'
                    ? 'flash'
                    : 'business'
                }
                size={22}
                color={isDark ? colors.primary : '#49570B'}
              />
              <AppText variant="h4" style={{ marginLeft: 8 }}>
                Access Procedure
              </AppText>
            </View>

            <AppText variant="body" color={colors.secondaryText} style={{ marginTop: spacing.xs }}>
              {space.accessInstructions}
            </AppText>

            {space.securityGuardOnSite && (
              <View style={[styles.guardNotice, { backgroundColor: colors.surface, borderRadius: radius.md, marginTop: spacing.sm }]}>
                <AppIcon name="checkmark-circle" size={16} color={colors.success} />
                <AppText variant="captionSmall" weight="semiBold" style={{ marginLeft: 6, flex: 1 }}>
                  Security guard verified at entry gate. Digital booking QR code pass issued upon booking.
                </AppText>
              </View>
            )}
          </AppCard>

          {/* Host / Owner Info */}
          <AppCard style={{ marginTop: spacing.md }}>
            <View style={styles.hostRow}>
              <View
                style={[
                  styles.hostAvatar,
                  { backgroundColor: colors.primary, borderRadius: radius.pill },
                ]}
              >
                <AppText variant="h3" weight="bold" color={colors.primaryForeground}>
                  {space.owner.name.charAt(0)}
                </AppText>
              </View>

              <View style={{ flex: 1, marginLeft: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <AppText variant="h4">{space.owner.name}</AppText>
                  {space.owner.isVerified && (
                    <AppIcon name="checkmark-circle" size={16} color={colors.success} style={{ marginLeft: 4 }} />
                  )}
                </View>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  {space.owner.communityName || 'Verified Property Host'} • {space.owner.responseRatePercent}% response rate
                </AppText>
              </View>
            </View>
          </AppCard>

          {/* Amenities Grid */}
          <View style={{ marginTop: spacing.xl }}>
            <AppText variant="h3">Space Amenities</AppText>
            <View style={[styles.amenitiesGrid, { marginTop: spacing.sm }]}>
              {space.amenities.map((amenity) => (
                <View
                  key={amenity}
                  style={[
                    styles.amenityChip,
                    {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                      borderRadius: radius.md,
                    },
                  ]}
                >
                  <AppIcon name="checkmark" size={14} color={colors.success} style={{ marginRight: 6 }} />
                  <AppText variant="caption" weight="medium">
                    {amenity.replace('_', ' ').toUpperCase()}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Parking Rules */}
          <View style={{ marginTop: spacing.xl }}>
            <AppText variant="h3">Community Guidelines</AppText>
            <View style={{ marginTop: spacing.xs }}>
              {space.rules.map((rule, idx) => (
                <View key={idx} style={styles.ruleRow}>
                  <AppIcon name="information-circle-outline" size={16} color={colors.secondaryText} />
                  <AppText variant="body" color={colors.secondaryText} style={{ marginLeft: 8, flex: 1 }}>
                    {rule}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Bottom Booking Action Bar */}
      <View
        style={[
          styles.bottomActionBar,
          {
            backgroundColor: colors.surface,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            paddingBottom: Math.max(insets.bottom, 12),
            paddingHorizontal: spacing.lg,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -3 },
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 10,
            elevation: 8,
          },
        ]}
      >
        <View style={styles.priceContainer}>
          <ParkingPrice price={space.pricePerHour} currency={space.currency} period="hr" />
          <AppText variant="captionSmall" color={colors.secondaryText}>
            or {space.currency}{space.pricePerDay.toFixed(2)}/day
          </AppText>
        </View>

        <View style={{ width: 170 }}>
          <AppButton
            title="Book Space"
            onPress={handleBookNow}
            variant="primary"
            size="lg"
            rightIcon={<AppIcon name="arrow-forward" size={18} color={colors.primaryForeground} />}
          />
        </View>
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
  shareBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  accessExplainerCard: {
    borderWidth: 1,
  },
  guardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  hostRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hostAvatar: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
  },
  ruleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  bottomActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
});
