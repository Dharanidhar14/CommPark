import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { useBookingStore } from '../../src/store/useBookingStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import {
  getFilteredParkingSpaces,
  SEARCH_SUGGESTIONS_MOCK,
  RECENT_SEARCHES_MOCK,
} from '../../src/features/discovery';
import { ParkingCategory } from '../../src/types/parking';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { ParkingSearchBar } from '../../src/components/parking/ParkingSearchBar';
import { ParkingCard } from '../../src/components/parking/ParkingCard';
import { ActivePassBanner } from '../../src/components/common/ActivePassBanner';
import { LocationSelectorModal } from '../../src/components/home/LocationSelectorModal';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const user = useAuthStore((s) => s.user);
  const activeBooking = useBookingStore((s) => s.activeBooking);

  const [selectedLocality, setSelectedLocality] = useState('Indiranagar');
  const [isLocationModalVisible, setIsLocationModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ParkingCategory | 'all'>('all');

  const spaces = getFilteredParkingSpaces({
    query: searchQuery,
    category: selectedCategory,
    locality: selectedLocality === 'All Localities' ? undefined : selectedLocality,
  });

  const securitySpaces = spaces.filter((s) => s.accessType === 'security_verified');
  const drivewaySpaces = spaces.filter((s) => s.category === 'driveway');
  const directSpaces = spaces.filter((s) => s.accessType === 'direct_access');
  const commercialSpaces = spaces.filter((s) => s.category === 'commercial');

  const handleNotificationPress = () => {
    Alert.alert(
      'Community Notifications',
      '• Gate 2 verification active for your Nexon EV.\n• Indiranagar parking demand is high this evening.\n• Guard incentive balance: ₹750.00 earned.'
    );
  };

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
        {/* Top Destination & Notification Header */}
        <View style={[styles.headerRow, { paddingHorizontal: spacing.lg }]}>
          <Pressable
            onPress={() => setIsLocationModalVisible(true)}
            style={({ pressed }) => [styles.locationTouchable, pressed && { opacity: 0.8 }]}
          >
            <View style={styles.locationPill}>
              <AppIcon name="location" size={14} color={isDark ? colors.primary : '#49570B'} />
              <AppText variant="captionSmall" weight="bold" style={{ marginLeft: 4 }}>
                CURRENT HUB
              </AppText>
              <AppBadge label="INDIA" variant="default" size="sm" style={{ marginLeft: 6 }} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
              <AppText variant="h3">{selectedLocality}, Bengaluru</AppText>
              <AppIcon name="chevron-down" size={16} color={colors.text} style={{ marginLeft: 4 }} />
            </View>
          </Pressable>

          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Pressable
              onPress={handleNotificationPress}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              ]}
            >
              <AppIcon name="notifications-outline" size={18} color={colors.text} />
              <View style={[styles.notifDot, { backgroundColor: colors.primary }]} />
            </Pressable>

            <Pressable
              onPress={() => router.push('/(tabs)/profile' as any)}
              style={[
                styles.iconBtn,
                { backgroundColor: colors.surfaceSubtle, borderColor: colors.border },
              ]}
            >
              <AppIcon name="person-outline" size={18} color={colors.text} />
            </Pressable>
          </View>
        </View>

        {/* Active Parking Pass Hero (Demo) */}
        {activeBooking && (
          <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.md }}>
            <ActivePassBanner booking={activeBooking} />
          </View>
        )}

        {/* Search Bar & Auto-Suggestions */}
        <View style={{ paddingHorizontal: spacing.lg, marginTop: spacing.lg, zIndex: 30 }}>
          <ParkingSearchBar
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            suggestions={SEARCH_SUGGESTIONS_MOCK}
            recentSearches={RECENT_SEARCHES_MOCK}
            onSelectSuggestion={(sug) => {
              setSearchQuery(sug.query);
              if (sug.type === 'locality') setSelectedLocality(sug.query);
            }}
            onFilterPress={() => router.push('/(tabs)/explore' as any)}
          />
        </View>

        {/* Primary Dual Actions: "Find Parking" vs "List Your Space" */}
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
              Explore live map & book
            </AppText>
          </Pressable>

          {/* List Your Space */}
          <Pressable
            onPress={() => router.push('/owner/new-listing' as any)}
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
              Monetize empty driveways
            </AppText>
          </Pressable>
        </View>

        {/* Section 1: Security-Verified Residential Apartments */}
        <View style={{ marginTop: spacing.xl }}>
          <View style={[styles.sectionHeader, { paddingHorizontal: spacing.lg }]}>
            <View>
              <AppText variant="h3">Security-Verified</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Apartments with guard QR & vehicle verification
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

        {/* Section 2: Owner-Assisted Private Bungalow Driveways */}
        {drivewaySpaces.length > 0 && (
          <View style={{ marginTop: spacing.lg, paddingHorizontal: spacing.lg }}>
            <View style={styles.sectionHeader}>
              <View>
                <AppText variant="h3">Private Bungalow Driveways</AppText>
                <AppText variant="captionSmall" color={colors.secondaryText}>
                  Owner-assisted parking with dedicated gate guidance
                </AppText>
              </View>
            </View>

            <View style={{ marginTop: spacing.md }}>
              {drivewaySpaces.map((space) => (
                <ParkingCard key={space.id} space={space} />
              ))}
            </View>
          </View>
        )}

        {/* Host Invitation Banner */}
        <View style={{ marginTop: spacing.xl, paddingHorizontal: spacing.lg }}>
          <View
            style={[
              styles.hostBanner,
              {
                backgroundColor: colors.pricePinBg,
                borderColor: colors.primary,
                borderRadius: radius.card,
                padding: spacing.md,
                borderWidth: 1.5,
              },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AppIcon name="cash-outline" size={18} color={colors.primary} />
              <AppText variant="captionSmall" weight="bold" color={colors.primary}>
                MONETIZE IDLE SPACES
              </AppText>
            </View>
            <AppText variant="h3" color={colors.pricePinText} style={{ marginTop: 4 }}>
              Earn ₹5,000 – ₹12,000/month
            </AppText>
            <AppText variant="captionSmall" color={colors.secondaryText} style={{ marginTop: 2, lineHeight: 16 }}>
              Share your vacant residential parking slot or bungalow driveway with verified community members.
            </AppText>
            <Pressable
              onPress={() => router.push('/owner/new-listing' as any)}
              style={[
                styles.hostBtn,
                {
                  backgroundColor: colors.primary,
                  borderRadius: radius.pill,
                  paddingVertical: 8,
                  paddingHorizontal: 16,
                  alignSelf: 'flex-start',
                  marginTop: spacing.sm,
                },
              ]}
            >
              <AppText variant="caption" weight="bold" color={colors.primaryForeground}>
                + List Your Parking Space
              </AppText>
            </Pressable>
          </View>
        </View>

        {/* Section 3: Direct Sensor Bays & Tech Commercial Hubs */}
        <View style={{ marginTop: spacing.lg, paddingHorizontal: spacing.lg }}>
          <View style={styles.sectionHeader}>
            <View>
              <AppText variant="h3">Commercial Tech Hubs & Direct Bays</AppText>
              <AppText variant="captionSmall" color={colors.secondaryText}>
                Automated barrier & sensor-monitored slots
              </AppText>
            </View>
          </View>

          <View style={{ marginTop: spacing.md }}>
            {[...directSpaces, ...commercialSpaces].map((space) => (
              <ParkingCard key={space.id} space={space} />
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Destination Selector Modal */}
      <LocationSelectorModal
        visible={isLocationModalVisible}
        onClose={() => setIsLocationModalVisible(false)}
        selectedLocality={selectedLocality}
        onSelectLocality={setSelectedLocality}
      />
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
  locationTouchable: {
    flex: 1,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 7,
    height: 7,
    borderRadius: 3.5,
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
  hostBanner: {},
  hostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
