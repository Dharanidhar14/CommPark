import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import { getFilteredParkingSpaces } from '../../src/features/discovery';
import { ParkingCategory } from '../../src/types/parking';
import { CommunityMapView, MapMarkerItem } from '../../src/services/maps/MapView';
import { ParkingSearchBar } from '../../src/components/parking/ParkingSearchBar';
import { ParkingCard } from '../../src/components/parking/ParkingCard';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ParkingCategory | 'all'>('all');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>('space_01');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const spaces = getFilteredParkingSpaces({
    query: searchQuery,
    category: selectedCategory,
  });

  const markers: MapMarkerItem[] = spaces.map((s) => ({
    id: s.id,
    coordinate: s.coordinates,
    title: s.name,
    price: s.pricePerHour,
    currency: s.currency,
    accessType: s.accessType,
  }));

  const selectedSpace = spaces.find((s) => s.id === selectedMarkerId) || spaces[0];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Search & Filter Bar Overlay */}
      <View
        style={[
          styles.topBarOverlay,
          {
            paddingTop: Math.max(insets.top, 12),
            paddingHorizontal: spacing.md,
            backgroundColor: colors.background,
            borderBottomColor: colors.border,
            borderBottomWidth: 1,
          },
        ]}
      >
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <ParkingSearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
            />
          </View>

          {/* Toggle Map / List view */}
          <Pressable
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            style={[
              styles.viewToggleBtn,
              {
                backgroundColor: colors.pricePinBg,
                borderRadius: radius.pill,
                borderColor: colors.border,
              },
            ]}
          >
            <AppIcon
              name={viewMode === 'map' ? 'list' : 'map'}
              size={18}
              color={colors.primary}
            />
          </Pressable>
        </View>
      </View>

      {/* Main View Area: Map or List */}
      {viewMode === 'map' ? (
        <View style={styles.mapContainer}>
          <CommunityMapView
            markers={markers}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={(id) => setSelectedMarkerId(id)}
          />

          {/* Floating Bottom Card Preview for Selected Spot */}
          {selectedSpace && (
            <View
              style={[
                styles.bottomCardContainer,
                {
                  paddingBottom: insets.bottom + 16,
                  paddingHorizontal: spacing.md,
                },
              ]}
            >
              <ParkingCard
                space={selectedSpace}
                compact
                onPress={() => router.push(`/parking/${selectedSpace.id}` as any)}
              />
            </View>
          )}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.listContainer,
            {
              paddingHorizontal: spacing.md,
              paddingTop: spacing.md,
              paddingBottom: insets.bottom + 80,
            },
          ]}
        >
          <AppText variant="caption" color={colors.secondaryText} style={{ marginBottom: spacing.sm }}>
            Found {spaces.length} parking spaces nearby
          </AppText>
          {spaces.map((space) => (
            <ParkingCard key={space.id} space={space} />
          ))}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBarOverlay: {
    zIndex: 10,
    paddingBottom: 8,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  viewToggleBtn: {
    width: 48,
    height: 48,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  bottomCardContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  listContainer: {
    flexGrow: 1,
  },
});
