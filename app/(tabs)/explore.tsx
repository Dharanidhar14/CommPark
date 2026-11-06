import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../src/theme';
import {
  getFilteredParkingSpaces,
  SEARCH_SUGGESTIONS_MOCK,
  RECENT_SEARCHES_MOCK,
} from '../../src/features/discovery';
import { DiscoveryFilters, SortOption, SearchSuggestionItem } from '../../src/features/discovery/types';
import { ParkingCategory, ParkingSpace } from '../../src/types/parking';
import {
  CommunityMapView,
  MapMarkerItem,
  MapRegion,
} from '../../src/services/maps/MapView';
import { ParkingSearchBar } from '../../src/components/parking/ParkingSearchBar';
import { ParkingCard } from '../../src/components/parking/ParkingCard';
import { AppText } from '../../src/components/ui/AppText';
import { AppIcon } from '../../src/components/ui/AppIcon';
import { AppBadge } from '../../src/components/ui/AppBadge';
import { EmptyState } from '../../src/components/ui/EmptyState';
import { FilterBottomSheet } from '../../src/components/parking/FilterBottomSheet';
import { LocationPermissionModal } from '../../src/components/location/LocationPermissionModal';
import { LocationStatusBanner } from '../../src/components/location/LocationStatusBanner';
import { useLocationStore } from '../../src/store/useLocationStore';
import { geocodingService } from '../../src/services/geocoding/GeocodingService';
import { DEFAULT_FALLBACK_COORDINATE } from '../../src/services/location/LocationService';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CARD_WIDTH = Math.min(SCREEN_WIDTH - 48, 340);
const CARD_GAP = 12;

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { colors, spacing, radius, isDark } = useTheme();

  // Location Store
  const {
    coordinate: userCoordinate,
    permissionStatus,
    isLoading: isLocating,
    checkInitialPermission,
    promptLocationAccess,
  } = useLocationStore();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ParkingCategory | 'all'>('all');
  const [selectedMarkerId, setSelectedMarkerId] = useState<string>('space_01');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [sortOption, setSortOption] = useState<SortOption>('recommended');
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);

  // Map Region & "Search This Area" State
  const [currentRegion, setCurrentRegion] = useState<MapRegion | undefined>(undefined);
  const [showSearchThisArea, setShowSearchThisArea] = useState(false);
  const [activeAreaLabel, setActiveAreaLabel] = useState<string | null>(null);

  // Geocoding Suggestions State
  const [dynamicSuggestions, setDynamicSuggestions] = useState<SearchSuggestionItem[]>(SEARCH_SUGGESTIONS_MOCK);

  // Carousel FlatList Ref
  const flatListRef = useRef<FlatList<ParkingSpace>>(null);
  const isUserScrollingCarousel = useRef(false);

  // Initialize location permissions on mount
  useEffect(() => {
    checkInitialPermission();
  }, [checkInitialPermission]);

  // Set initial map center when user coordinate becomes available and currentRegion is unset
  useEffect(() => {
    if (userCoordinate && !currentRegion) {
      setCurrentRegion({
        latitude: userCoordinate.latitude,
        longitude: userCoordinate.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    }
  }, [userCoordinate, currentRegion]);

  // Dynamic geocoding suggestions as user types
  useEffect(() => {
    let isCancelled = false;

    if (searchQuery.trim().length >= 2) {
      geocodingService.geocodeAsync(searchQuery).then((results) => {
        if (!isCancelled && results.length > 0) {
          const mapped: SearchSuggestionItem[] = results.map((r) => ({
            id: r.id,
            title: r.title,
            subtitle: r.subtitle,
            type: r.type === 'landmark' ? 'landmark' : 'locality',
            query: r.title,
          }));
          setDynamicSuggestions(mapped);
        }
      });
    } else {
      setDynamicSuggestions(SEARCH_SUGGESTIONS_MOCK);
    }

    return () => {
      isCancelled = true;
    };
  }, [searchQuery]);

  const activeFiltersCount =
    (filters.maxPrice ? 1 : 0) +
    (filters.maxDistanceKm ? 1 : 0) +
    (filters.accessType ? 1 : 0) +
    (filters.coveredOnly ? 1 : 0) +
    (filters.evChargingOnly ? 1 : 0) +
    (filters.latitude ? 1 : 0) +
    (sortOption !== 'recommended' ? 1 : 0);

  // Filtered parking spaces combining text, category, and spatial filters
  const spaces = useMemo(() => {
    return getFilteredParkingSpaces(
      {
        ...filters,
        query: searchQuery,
        category: selectedCategory,
      },
      sortOption
    );
  }, [filters, searchQuery, selectedCategory, sortOption]);

  const markers: MapMarkerItem[] = useMemo(() => {
    return spaces.map((s) => ({
      id: s.id,
      coordinate: s.coordinates,
      title: s.name,
      price: s.pricePerHour,
      currency: s.currency,
      accessType: s.accessType,
    }));
  }, [spaces]);

  const selectedSpace = useMemo(() => {
    return spaces.find((s) => s.id === selectedMarkerId) || spaces[0];
  }, [spaces, selectedMarkerId]);

  // Synchronize carousel scroll when marker selection changes
  const handleMarkerSelect = useCallback(
    (id: string) => {
      setSelectedMarkerId(id);
      const index = spaces.findIndex((s) => s.id === id);
      if (index >= 0 && flatListRef.current && !isUserScrollingCarousel.current) {
        flatListRef.current.scrollToIndex({
          index,
          animated: true,
          viewPosition: 0.5,
        });
      }
    },
    [spaces]
  );

  // Synchronize marker selection when user swipes carousel
  const handleCarouselScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const offsetX = e.nativeEvent.contentOffset.x;
      const index = Math.round(offsetX / (CARD_WIDTH + CARD_GAP));
      if (spaces[index] && spaces[index].id !== selectedMarkerId) {
        setSelectedMarkerId(spaces[index].id);
      }
      isUserScrollingCarousel.current = false;
    },
    [spaces, selectedMarkerId]
  );

  // Recenter Map on User Location
  const handleRecenterPress = useCallback(async () => {
    if (permissionStatus !== 'granted') {
      await promptLocationAccess();
    }

    if (userCoordinate) {
      setCurrentRegion({
        latitude: userCoordinate.latitude,
        longitude: userCoordinate.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
      setShowSearchThisArea(false);
    } else {
      // Default to neutral Bengaluru hub if coordinate not yet ready
      setCurrentRegion({
        latitude: DEFAULT_FALLBACK_COORDINATE.latitude,
        longitude: DEFAULT_FALLBACK_COORDINATE.longitude,
        latitudeDelta: 0.04,
        longitudeDelta: 0.04,
      });
    }
  }, [permissionStatus, promptLocationAccess, userCoordinate]);

  // Pan / Region Change Callback
  const handleRegionChangeComplete = useCallback((region: MapRegion) => {
    setCurrentRegion(region);
    setShowSearchThisArea(true);
  }, []);

  // "Search This Area" Trigger
  const handleSearchThisAreaPress = useCallback(() => {
    if (!currentRegion) return;

    setFilters((prev) => ({
      ...prev,
      latitude: currentRegion.latitude,
      longitude: currentRegion.longitude,
      radiusKm: 6.0,
    }));
    setShowSearchThisArea(false);
    setActiveAreaLabel('Custom Area');
  }, [currentRegion]);

  // Suggestion Selection
  const handleSelectSuggestion = useCallback(
    (suggestion: SearchSuggestionItem) => {
      setSearchQuery(suggestion.title);

      // Check if suggestion corresponds to a known metro directory coordinate
      const match = geocodingService.reverseLookupDirectory(suggestion.title);
      if (match) {
        setCurrentRegion({
          latitude: match.coordinate.latitude,
          longitude: match.coordinate.longitude,
          latitudeDelta: 0.03,
          longitudeDelta: 0.03,
        });
        setFilters((prev) => ({
          ...prev,
          locality: match.locality || undefined,
        }));
      }
    },
    []
  );

  const handleResetFilters = () => {
    setFilters({});
    setSearchQuery('');
    setSelectedCategory('all');
    setSortOption('recommended');
    setShowSearchThisArea(false);
    setActiveAreaLabel(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Location Permission Modal (Rationale shown before OS prompt) */}
      <LocationPermissionModal />

      {/* Top Search, Category & Filter Bar Overlay */}
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
              suggestions={dynamicSuggestions}
              onSelectSuggestion={handleSelectSuggestion}
              recentSearches={RECENT_SEARCHES_MOCK}
              onSelectRecent={(q) => setSearchQuery(q)}
            />
          </View>

          {/* Toggle Map / List View Button */}
          <Pressable
            onPress={() => setViewMode(viewMode === 'map' ? 'list' : 'map')}
            accessibilityRole="button"
            accessibilityLabel={`Switch to ${viewMode === 'map' ? 'list' : 'map'} view`}
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

        {/* Location Status Banner (when permission denied or blocked) */}
        <LocationStatusBanner />

        {/* Active Filter Indicators Bar */}
        {activeFiltersCount > 0 && (
          <View style={[styles.activeFiltersBar, { marginTop: spacing.xs }]}>
            <AppBadge
              label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
              variant="primary"
              size="sm"
            />
            {activeAreaLabel && (
              <AppBadge label={`📍 ${activeAreaLabel}`} variant="default" size="sm" style={{ marginLeft: 6 }} />
            )}
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
            onMarkerSelect={handleMarkerSelect}
            userLocation={userCoordinate || undefined}
            currentRegion={currentRegion}
            onRegionChangeComplete={handleRegionChangeComplete}
            onRecenterPress={handleRecenterPress}
            isLocating={isLocating}
            showSearchThisArea={showSearchThisArea}
            onSearchThisAreaPress={handleSearchThisAreaPress}
          />

          {/* Floating Bottom Snapping Carousel for Parking Listings */}
          {spaces.length > 0 ? (
            <View
              style={[
                styles.bottomCarouselContainer,
                {
                  paddingBottom: Math.max(insets.bottom + 12, 24),
                },
              ]}
            >
              <FlatList
                ref={flatListRef}
                horizontal
                data={spaces}
                keyExtractor={(item) => item.id}
                showsHorizontalScrollIndicator={false}
                snapToInterval={CARD_WIDTH + CARD_GAP}
                snapToAlignment="start"
                decelerationRate="fast"
                contentContainerStyle={{
                  paddingHorizontal: spacing.md,
                }}
                onScrollBeginDrag={() => {
                  isUserScrollingCarousel.current = true;
                }}
                onMomentumScrollEnd={handleCarouselScrollEnd}
                onScrollToIndexFailed={(info) => {
                  setTimeout(() => {
                    flatListRef.current?.scrollToOffset({
                      offset: info.index * (CARD_WIDTH + CARD_GAP),
                      animated: true,
                    });
                  }, 100);
                }}
                renderItem={({ item }) => {
                  const isSelected = item.id === selectedMarkerId;
                  return (
                    <View
                      style={[
                        styles.carouselItemWrapper,
                        {
                          width: CARD_WIDTH,
                          marginRight: CARD_GAP,
                        },
                      ]}
                    >
                      <ParkingCard
                        space={item}
                        compact
                        onPress={() => router.push(`/parking/${item.id}` as any)}
                        style={
                          isSelected
                            ? {
                                borderColor: colors.primary,
                                borderWidth: 2,
                              }
                            : undefined
                        }
                      />
                    </View>
                  );
                }}
              />
            </View>
          ) : (
            <View
              style={[
                styles.noSpotsOnMapBox,
                {
                  backgroundColor: colors.surface,
                  borderRadius: radius.md,
                  borderColor: colors.border,
                },
              ]}
            >
              <AppText variant="caption" align="center">
                No spots match current filters in this area
              </AppText>
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
              <AppText
                variant="captionSmall"
                weight="bold"
                color={isDark ? colors.primary : '#49570B'}
                style={{ marginLeft: 4 }}
              >
                Sort
              </AppText>
            </Pressable>
          </View>

          {spaces.length === 0 ? (
            <EmptyState
              icon="search-outline"
              title="No Spaces Found"
              description="No parking spaces match your search criteria. Try adjusting your filters or search radius."
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
  bottomCarouselContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  carouselItemWrapper: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  noSpotsOnMapBox: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    zIndex: 100,
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
