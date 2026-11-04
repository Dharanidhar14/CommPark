import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Share,
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

  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Reserve parking at ${space.name} (${space.locality}, ${space.city}) on CommunityPark for ₹${space.pricePerHour}/hr.`,
      });
    } catch {
      // ignore
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppHeader
        title={space.name}
        subtitle={`${space.locality}, ${space.city}`}
        showBack
        rightAction={
          <Pressable onPress={handleShare} style={styles.shareBtn} hitSlop={8}>
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
        {/* Photo Gallery with Indicator */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.xs }}>
          <ParkingImage
            uri={space.images[activeImageIndex] || space.images[0]}
            height={220}
            covered={space.covered}
          />
          {space.images.length > 1 && (
            <View style={styles.galleryThumbnailsRow}>
              {space.images.map((img, idx) => (
                <Pressable
                  key={idx}
                  onPress={() => setActiveImageIndex(idx)}
                  style={[
                    styles.thumbnailDot,
                    {
                      backgroundColor: activeImageIndex === idx ? colors.primary : colors.border,
                      width: activeImageIndex === idx ? 20 : 8,
                    },
                  ]}
                />
              ))}
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
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
              {space.address}, {space.locality}, {space.city} ({space.distanceKm} km away)
            </AppText>
          </View>

          {/* Ratings & Operating Hours */}
          <View style={[styles.ratingRow, { marginTop: spacing.sm }]}>
            <View style={styles.starBadge}>
              <AppIcon name="star" size={15} color="#F59E0B" />
              <AppText variant="bodyBold" style={{ marginLeft: 4 }}>
                {space.rating.toFixed(2)}
              </AppText>
            </View>
            <AppText variant="caption" color={colors.secondaryText} style={{ marginLeft: 8 }}>
              • {space.reviewCount} verified reviews
            </AppText>
            <View style={[styles.hoursBadge, { backgroundColor: colors.surfaceSubtle, borderRadius: radius.sm }]}>
              <AppIcon name="time-outline" size={12} color={colors.secondaryText} style={{ marginRight: 4 }} />
              <AppText variant="captionSmall" color={colors.secondaryText}>
                {space.operatingHours}
              </AppText>
            </View>
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

            {space.accessType === 'security_verified' && (
              <View style={[styles.guardNotice, { backgroundColor: colors.surface, borderRadius: radius.md, marginTop: spacing.sm }]}>
                <AppIcon name="shield-checkmark" size={16} color={colors.success} />
                <AppText variant="captionSmall" weight="semiBold" style={{ marginLeft: 6, flex: 1 }}>
                  Residential Community Approval: Society gate security verifies your digital booking pass and checks registered vehicle plate before authorized entry.
                </AppText>
              </View>
            )}

            {space.accessType === 'direct_access' && (
              <View style={[styles.guardNotice, { backgroundColor: colors.surface, borderRadius: radius.md, marginTop: spacing.sm }]}>
                <AppIcon name="flash" size={16} color={isDark ? colors.primary : '#49570B'} />
                <AppText variant="captionSmall" weight="semiBold" style={{ marginLeft: 6, flex: 1 }}>
                  Direct Entry: No security guard check required. Automatic smart bollard or open parking slot.
                </AppText>
              </View>
            )}
          </AppCard>

          {/* Space Specifications & Dimensions */}
          <View style={{ marginTop: spacing.xl }}>
            <AppText variant="h3">Space Specifications</AppText>
            <View style={[styles.specsGrid, { marginTop: spacing.sm }]}>
              <View style={[styles.specBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
                <AppIcon name="resize-outline" size={18} color={colors.secondaryText} />
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
                  DIMENSIONS
                </AppText>
                <AppText variant="bodyBold">
                  {space.dimensions.lengthMeters}m × {space.dimensions.widthMeters}m
                </AppText>
              </View>

              <View style={[styles.specBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
                <AppIcon name={space.covered ? 'umbrella' : 'sunny'} size={18} color={colors.secondaryText} />
                <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
                  CANOPY
                </AppText>
                <AppText variant="bodyBold">
                  {space.covered ? 'Covered / Shaded' : 'Open Sky Bay'}
                </AppText>
              </View>

              {space.dimensions.heightClearanceMeters && (
                <View style={[styles.specBox, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: radius.md }]}>
                  <AppIcon name="swap-vertical" size={18} color={colors.secondaryText} />
                  <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 4 }}>
                    MAX HEIGHT
                  </AppText>
                  <AppText variant="bodyBold">
                    {space.dimensions.heightClearanceMeters}m
                  </AppText>
                </View>
              )}
            </View>
          </View>

          {/* Supported Vehicles Chips */}
          <View style={{ marginTop: spacing.lg }}>
            <AppText variant="caption" weight="bold" color={colors.secondaryText}>
              SUPPORTED VEHICLES
            </AppText>
            <View style={[styles.vehicleChipsRow, { marginTop: spacing.xs }]}>
              {space.supportedVehicles.map((veh) => (
                <View
                  key={veh}
                  style={[
                    styles.vehicleChip,
                    { backgroundColor: colors.surfaceSubtle, borderColor: colors.borderSubtle, borderRadius: radius.pill },
                  ]}
                >
                  <AppIcon name="car" size={14} color={isDark ? colors.primary : '#49570B'} style={{ marginRight: 6 }} />
                  <AppText variant="captionSmall" weight="bold">
                    {veh.toUpperCase()}
                  </AppText>
                </View>
              ))}
            </View>
          </View>

          {/* Host / Owner Info */}
          <AppCard style={{ marginTop: spacing.xl }}>
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
                  {space.owner.communityName || 'Verified Property Host'} • Member since {space.owner.joinedYear || 2024}
                </AppText>
                <AppText variant="captionSmall" color={colors.success} weight="semiBold" style={{ marginTop: 2 }}>
                  {space.owner.responseRatePercent}% response rate
                </AppText>
              </View>
            </View>
          </AppCard>

          {/* Nearby Landmarks */}
          {space.nearbyLandmarks.length > 0 && (
            <View style={{ marginTop: spacing.xl }}>
              <AppText variant="h3">Nearby Landmarks</AppText>
              <View style={{ marginTop: spacing.xs }}>
                {space.nearbyLandmarks.map((lm, idx) => (
                  <View key={idx} style={styles.landmarkRow}>
                    <AppIcon name="navigate-circle-outline" size={16} color={isDark ? colors.primary : '#49570B'} />
                    <AppText variant="body" color={colors.secondaryText} style={{ marginLeft: 8 }}>
                      {lm}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          )}

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

          {/* Community Guidelines */}
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
            or {space.currency}{space.pricePerDay}/day
          </AppText>
        </View>

        <View style={{ width: 180 }}>
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
  galleryThumbnailsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },
  thumbnailDot: {
    height: 8,
    borderRadius: 4,
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
    flexWrap: 'wrap',
    gap: 8,
  },
  starBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hoursBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  accessExplainerCard: {
    borderWidth: 1,
  },
  guardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  specsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  specBox: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  vehicleChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vehicleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
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
  landmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
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
