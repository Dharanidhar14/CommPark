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
import {
  getFilteredParkingSpaces,
  SEARCH_SUGGESTIONS_MOCK,
  RECENT_SEARCHES_MOCK,
} from '../../src/features/discovery';
import { DiscoveryFilters, SortOption } from '../../src/features/discovery/types';
import { ParkingCategory } from '../../src/types/parking';
import { CommunityMapView, MapMarkerItem } from '../../src/services/maps/MapView';
import { ParkingSearchBar } from '../../src/components/parking/ParkingSearchBar';
import { ParkingCard } from '../../src/components/parking/ParkingCard';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { FilterBottomSheet } from '../../src/components/parking/FilterBottomSheet';

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ParkingCategory | 'all'>('all');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>('space_01');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  // Filter & Sort State
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  const activeFiltersCount =
    (filters.maxPrice ? 1 : 0) +
    (filters.maxDistanceKm ? 1 : 0) +
    (filters.accessType ? 1 : 0) +
    (filters.coveredOnly ? 1 : 0) +
    (filters.evChargingOnly ? 1 : 0) +
    (sortOption !== 'recommended' ? 1 : 0);

  const spaces = getFilteredParkingSpaces(
    {
      ...filters,
      query: searchQuery,
      category: selectedCategory,
    },
    sortOption
  );

  const markers: MapMarkerItem[] = spaces.map((s) => ({
    id: s.id,
    coordinate: s.coordinates,
    title: s.name,
    price: s.pricePerHour,
    currency: s.currency,
    accessType: s.accessType,
  }));

  const selectedSpace = spaces.find((s) => s.id === selectedMarkerId) || spaces[0];

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSelectedCategory('all');
    setSortOption('recommended');
  };

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
              onFilterPress={() => setIsFilterModalVisible(true)}
              suggestions={SEARCH_SUGGESTIONS_MOCK}
              recentSearches={RECENT_SEARCHES_MOCK}
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

        {/* Active Filter Indicators Bar */}
        {activeFiltersCount > 0 && (
          <View style={[styles.activeFiltersBar, { marginTop: spacing.xs }]}>
            <AppBadge
              label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
              variant="primary"
              size="sm"
            />
            {filters.maxPrice && (
              <AppBadge label={`≤ ₹${filters.maxPrice}/hr`} variant="default" size="sm" style={{ marginLeft: 6 }} />
            )}
            {filters.coveredOnly && (
              <AppBadge label="Covered" variant="default" size="sm" style={{ marginLeft: 6 }} />
            )}
            {filters.evChargingOnly && (
              <AppBadge label="⚡ EV" variant="default" size="sm" style={{ marginLeft: 6 }} />
            )}
            <Pressable onPress={handleResetFilters} hitSlop={8} style={{ marginLeft: 'auto' }}>
              <AppText variant="captionSmall" color={colors.secondaryText} weight="bold">
                Clear
              </AppText>
            </Pressable>
          </View>
        )}
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
          {selectedSpace ? (
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
          ) : (
            <View style={[styles.noSpotsOnMapBox, { backgroundColor: colors.surface, borderRadius: radius.md, borderColor: colors.border }]}>
              <AppText variant="caption" align="center">No spots match current filters</AppText>
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
          <View style={styles.listHeaderRow}>
            <AppText variant="caption" color={colors.secondaryText}>
              Found {spaces.length} parking spaces nearby
            </AppText>

            <Pressable
              onPress={() => setIsFilterModalVisible(true)}
              style={styles.sortTriggerRow}
            >
              <AppIcon name="swap-vertical" size={14} color={isDark ? colors.primary : '#49570B'} />
              <AppText variant="captionSmall" weight="bold" color={isDark ? colors.primary : '#49570B'} style={{ marginLeft: 4 }}>
                Sort
              </AppText>
            </Pressable>
          </View>

          {spaces.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="No Spaces Found"
              description="No parking spaces match your search criteria. Try adjusting your filters or price range."
              actionTitle="Reset All Filters"
              onAction={handleResetFilters}
              style={{ marginTop: 40 }}
            />
          ) : (
            <View style={{ marginTop: spacing.sm }}>
              {spaces.map((space) => (
                <ParkingCard key={space.id} space={space} />
              ))}
            </View>
          )}
        </ScrollView>
      )}

      {/* Filter Bottom Sheet Modal */}
      <FilterBottomSheet
        visible={isFilterModalVisible}
        onClose={() => setIsFilterModalVisible(false)}
        filters={filters}
        sort={sortOption}
        onApply={(f, s) => {
          setFilters(f);
          setSortOption(s);
        }}
        onReset={handleResetFilters}
      />
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
  activeFiltersBar: {
    flexDirection: 'row',
    alignItems: 'center',
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
  noSpotsOnMapBox: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
  },
  listContainer: {
    flexGrow: 1,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sortTriggerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
