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
import { getFilteredParkingSpaces } from '../../src/features/discovery';
import { ParkingCategory } from '../../src/types/parking';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { ParkingSearchBar } from '../../src/components/parking/ParkingSearchBar';
import { ParkingCard } from '../../src/components/parking/ParkingCard';
import { ActivePassBanner } from '../../src/components/common/ActivePassBanner';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const user = useAuthStore((s) => s.user);
  const activeBooking = useBookingStore((s) => s.activeBooking);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ParkingCategory | 'all'>('all');

  const spaces = getFilteredParkingSpaces({
    query: searchQuery,
    category: selectedCategory,
  });

  const securitySpaces = spaces.filter((s) => s.accessType === 'security_verified');
  const directAndDriveway = spaces.filter((s) => s.accessType !== 'security_verified');

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: insets.bottom + 80,
          },
        ]}
      >
        {/* Top Location & Profile Header */}
        <View style={[styles.headerRow, { paddingHorizontal: spacing.lg }]}>
          <View>
            <View style={styles.locationPill}>
              <AppIcon name="location" size={14} color={isDark ? colors.primary : '#49570B'} />
              <AppText variant="captionSmall" weight="bold" style={{ marginLeft: 4 }}>
                CURRENT LOCATION
              </AppText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <AppText variant="h3">Downtown West, Metro City</AppText>
              <AppIcon name="chevron-down" size={16} color={colors.text} style={{ marginLeft: 4 }} />
            </View>
          </View>

          <Pressable
            onPress={() => router.push('/(tabs)/profile' as any)}
            style={[
              styles.avatarButton,
              { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
            ]}
          >
            <AppIcon name="person" size={18} color={colors.text} />
          </Pressable>
        </View>

        {/* Active Parking Pass (if any) */}
        {activeBooking && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            <ActivePassBanner booking={activeBooking} />
          </View>
        )}

        {/* Search Bar & Category Chips */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg }}>
          <ParkingSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onFilterPress={() => router.push('/(tabs)/explore' as any)}
          />
        </View>

        {/* Quick Dual Action Banners: "Find Parking" vs "List Your Space" */}
        <View style={[styles.actionRow, { paddingHorizontal: spacing.lg, marginTop: spacing.lg }]}>
          {/* Find Parking */}
          <Pressable
            onPress={() => router.push('/(tabs)/explore' as any)}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.primary,
                borderRadius: radius.card,
                padding: spacing.md,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <View style={styles.actionIconCircleDark}>
              <AppIcon name="compass" size={20} color="#FFFFFF" />
            </View>
            <AppText variant="h4" color={colors.primaryForeground} style={{ marginTop: spacing.sm }}>
              Find Parking
            </AppText>
            <AppText variant="captionSmall" color="rgba(23, 26, 24, 0.75)" style={{ marginTop: 2 }}>
              Explore map & book spots
            </AppText>
          </Pressable>

          {/* List Your Space */}
          <Pressable
            onPress={() => router.push('/owner' as any)}
            style={({ pressed }) => [
              styles.actionCard,
              {
                backgroundColor: colors.pricePinBg,
                borderRadius: radius.card,
                padding: spacing.md,
                borderColor: colors.border,
                borderWidth: 1,
                opacity: pressed ? 0.92 : 1,
              },
            ]}
          >
            <View style={[styles.actionIconCircleLime, { backgroundColor: colors.primary }]}>
              <AppIcon name="add" size={20} color={colors.primaryForeground} />
            </View>
            <AppText variant="h4" color={colors.pricePinText} style={{ marginTop: spacing.sm }}>
              List Space
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2 }}>
              Monetize unused parking
            </AppText>
          </Pressable>
        </View>

        {/* Section 1: Security-Verified Residential Parking */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg }]}>
            <View>
              <AppText variant="h3">Security-Verified</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Apartment bays with gated guard verification
              </AppText>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/explore' as any)}>
              <AppText variant="caption" weight="bold" color={isDark ? colors.primary : '#49570B'}>
                View all ({securitySpaces.length})
              </AppText>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.horizontalList, { paddingHorizontal: spacing.lg, marginTop: spacing.md }]}
          >
            {securitySpaces.map((space) => (
              <View key={space.id} style={{ width: 280, marginRight: spacing.md }}>
                <ParkingCard space={space} />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Section 2: Direct Bays & Driveways */}
        <View style={{ marginTop: spacing.lg, paddingHorizontal: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="h3">Direct & Driveway Bays</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Instant access without security gates
              </AppText>
            </View>
          </View>

          <View style={{ marginTop: spacing.md }}>
            {directAndDriveway.map((space) => (
              <ParkingCard key={space.id} space={space} />
            ))}
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    minHeight: 115,
    justifyContent: 'space-between',
  },
  actionIconCircleDark: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#171A18',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconCircleLime: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 4,
  },
  horizontalList: {
    paddingVertical: 4,
  },
});
