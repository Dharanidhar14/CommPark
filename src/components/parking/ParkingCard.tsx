import React from 'react';
import { View, StyleSheet, Pressable, ViewStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { useTheme } from '../../theme';
import { ParkingSpace } from '../../types/parking';
import { ParkingImage } from './ParkingImage';
import { ParkingPrice } from './ParkingPrice';
import { AccessTypePill } from './AccessTypePill';
import { ParkingAvailabilityBadge } from './ParkingAvailabilityBadge';
import { AppText } from '../ui/AppText';
import { AppIcon } from '../ui/AppIcon';

export interface ParkingCardProps {
  space: ParkingSpace;
  onPress?: () => void;
  compact?: boolean;
  style?: ViewStyle;
}

export const ParkingCard: React.FC<ParkingCardProps> = ({
  space,
  onPress,
  compact = false,
  style,
}) => {
  const router = useRouter();
  const { colors, radius, spacing, isDark } = useTheme();

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/parking/${space.id}` as any);
    }
  };

  if (compact) {
    // Horizontal compact card (e.g., for map bottom preview or horizontal scroll)
    return (
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.compactCard,
          {
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            borderRadius: radius.card,
            padding: spacing.md,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: isDark ? 0.35 : 0.08,
            shadowRadius: 10,
            elevation: 3,
            opacity: pressed ? 0.94 : 1,
          },
          style,
        ]}
      >
        <View style={styles.compactRow}>
          <View style={styles.compactImageWrapper}>
            <ParkingImage
              uri={space.images[0]}
              height={76}
              covered={space.covered}
              style={{ borderRadius: radius.md }}
            />
          </View>

          <View style={styles.compactDetails}>
            <View style={styles.metaRow}>
              <AccessTypePill accessType={space.accessType} compact />
              <View style={styles.ratingBadge}>
                <AppIcon name="star" size={12} color="#F59E0B" />
                <AppText variant="captionSmall" weight="bold" style={{ marginLeft: 3 }}>
                  {space.rating.toFixed(1)}
                </AppText>
              </View>
            </View>

            <AppText variant="h4" numberOfLines={1} style={{ marginTop: 4 }}>
              {space.name}
            </AppText>

            <AppText variant="captionSmall" color={colors.secondaryText} numberOfLines={1}>
              {space.address} • {space.distanceKm} km
            </AppText>

            <View style={[styles.compactFooter, { marginTop: 6 }]}>
              <ParkingPrice price={space.pricePerHour} currency={space.currency} />
              <ParkingAvailabilityBadge isAvailable={space.isAvailable} availableSpots={space.availableSpots} />
            </View>
          </View>
        </View>
      </Pressable>
    );
  }

  // Full-width vertical hero card
  return (
    <Pressable
      onPress={handlePress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          borderColor: colors.cardBorder,
          borderRadius: radius.card,
          padding: spacing.md,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: isDark ? 0.4 : 0.07,
          shadowRadius: 14,
          elevation: 4,
          opacity: pressed ? 0.95 : 1,
        },
        style,
      ]}
    >
      <ParkingImage uri={space.images[0]} height={170} covered={space.covered} />

      <View style={[styles.cardBody, { paddingTop: spacing.md }]}>
        <View style={styles.topRow}>
          <AccessTypePill accessType={space.accessType} />
          <View style={styles.ratingBadge}>
            <AppIcon name="star" size={13} color="#F59E0B" />
            <AppText variant="captionSmall" weight="bold" style={{ marginLeft: 3 }}>
              {space.rating.toFixed(1)}
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginLeft: 2 }}>
              ({space.reviewCount})
            </AppText>
          </View>
        </View>

        <AppText variant="h3" numberOfLines={1} style={{ marginTop: spacing.xs }}>
          {space.name}
        </AppText>

        <View style={[styles.locationRow, { marginTop: 2 }]}>
          <AppIcon name="location-sharp" size={14} color={colors.secondaryText} />
          <AppText
            variant="caption"
            color={colors.secondaryText}
            numberOfLines={1}
            style={{ marginLeft: 4, flex: 1 }}
          >
            {space.address} • {space.distanceKm} km away
          </AppText>
        </View>

        <View style={[styles.footerRow, { marginTop: spacing.md, borderTopColor: colors.borderSubtle, borderTopWidth: 1, paddingTop: spacing.sm }]}>
          <ParkingPrice price={space.pricePerHour} currency={space.currency} />
          <ParkingAvailabilityBadge isAvailable={space.isAvailable} availableSpots={space.availableSpots} />
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardBody: {
    width: '100%',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactCard: {
    borderWidth: 1,
    width: '100%',
  },
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  compactImageWrapper: {
    width: 86,
    height: 76,
    marginRight: 12,
  },
  compactDetails: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  compactFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
