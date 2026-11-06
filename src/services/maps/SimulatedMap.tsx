import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  PanResponder,
  LayoutChangeEvent,
  PanResponderGestureState,
} from 'react-native';
import { useTheme } from '../../theme';
import { CommunityMapViewProps, MapCoordinate, MapRegion } from './types';
import { AppText } from '../../components/ui/AppText';
import { AppIcon } from '../../components/ui/AppIcon';
import { ParkingPrice } from '../../components/parking/ParkingPrice';
import { DEFAULT_FALLBACK_COORDINATE } from '../location/LocationService';

export const SimulatedMap: React.FC<CommunityMapViewProps> = ({
  markers,
  selectedMarkerId,
  onMarkerSelect,
  userLocation,
  initialRegion,
  currentRegion,
  onRegionChangeComplete,
  onRecenterPress,
  isLocating = false,
  showSearchThisArea = false,
  onSearchThisAreaPress,
  style,
}) => {
  const { colors, radius, isDark } = useTheme();

  // Canvas layout dimensions
  const [layout, setLayout] = useState({ width: 380, height: 500 });

  // Pan & Zoom state for map exploration
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);
  const [hasPanned, setHasPanned] = useState(false);

  // Active map center coordinate (User Location > Initial Region > Default Bengaluru Hub)
  const mapCenter = useMemo<MapCoordinate>(() => {
    if (currentRegion) {
      return { latitude: currentRegion.latitude, longitude: currentRegion.longitude };
    }
    if (initialRegion) {
      return { latitude: initialRegion.latitude, longitude: initialRegion.longitude };
    }
    if (userLocation) {
      return userLocation;
    }
    return DEFAULT_FALLBACK_COORDINATE;
  }, [currentRegion, initialRegion, userLocation]);

  // Handle region updates when user finishes panning/zooming
  const reportRegionChange = useRef((dx: number, dy: number, zoom: number) => {
    if (!onRegionChangeComplete) return;

    // Approximated degree shifts for simulated canvas (0.01 deg ~ 1.1 km)
    const latDelta = 0.05 / zoom;
    const lngDelta = 0.05 / zoom;
    const latShift = -(dy / (layout.height || 500)) * latDelta;
    const lngShift = (dx / (layout.width || 380)) * lngDelta;

    const newRegion: MapRegion = {
      latitude: mapCenter.latitude + latShift,
      longitude: mapCenter.longitude + lngShift,
      latitudeDelta: latDelta,
      longitudeDelta: lngDelta,
    };

    onRegionChangeComplete(newRegion);
  });

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => false,
        onMoveShouldSetPanResponder: (_, gesture: PanResponderGestureState) =>
          Math.abs(gesture.dx) > 4 || Math.abs(gesture.dy) > 4,
        onPanResponderGrant: () => {
          setHasPanned(true);
        },
        onPanResponderMove: (_, gesture: PanResponderGestureState) => {
          setOffset((prev) => ({
            x: Math.max(-180, Math.min(180, prev.x + gesture.dx * 0.12)),
            y: Math.max(-180, Math.min(180, prev.y + gesture.dy * 0.12)),
          }));
        },
        onPanResponderRelease: () => {
          reportRegionChange.current(offset.x, offset.y, zoomLevel);
        },
      }),
    [offset.x, offset.y, zoomLevel]
  );

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel((prev) => {
      const nextZoom =
        direction === 'in' ? Math.min(prev + 0.25, 2.0) : Math.max(prev - 0.25, 0.6);
      reportRegionChange.current(offset.x, offset.y, nextZoom);
      return nextZoom;
    });
    setHasPanned(true);
  };

  const handleRecenter = () => {
    setOffset({ x: 0, y: 0 });
    setZoomLevel(1);
    setHasPanned(false);
    if (onRecenterPress) {
      onRecenterPress();
    }
  };

  const handleLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    if (width > 0 && height > 0) {
      setLayout({ width, height });
    }
  };

  // Convert marker geographic coordinates to canvas pixel positions
  const projectedMarkers = useMemo(() => {
    const cx = layout.width / 2;
    const cy = layout.height / 2;
    // Base spread factor: 1 degree approx 4000px on canvas
    const scale = 3600 * zoomLevel;

    return markers.map((marker, index) => {
      const dLat = marker.coordinate.latitude - mapCenter.latitude;
      const dLng = marker.coordinate.longitude - mapCenter.longitude;

      let posX = cx + dLng * scale + offset.x;
      let posY = cy - dLat * scale + offset.y;

      // Ensure markers remain within an accessible viewable bounds box if coordinates are distant
      if (isNaN(posX) || !isFinite(posX)) posX = cx + (index % 3 - 1) * 80;
      if (isNaN(posY) || !isFinite(posY)) posY = cy + (Math.floor(index / 3) - 1) * 80;

      // Safe clamp to canvas with margins
      const clampedX = Math.max(30, Math.min(layout.width - 90, posX));
      const clampedY = Math.max(50, Math.min(layout.height - 130, posY));

      return {
        ...marker,
        canvasX: clampedX,
        canvasY: clampedY,
      };
    });
  }, [markers, mapCenter, layout, zoomLevel, offset]);

  // Projected User Location Pin Position
  const projectedUserLoc = useMemo(() => {
    if (!userLocation) return null;
    const cx = layout.width / 2;
    const cy = layout.height / 2;
    const scale = 3600 * zoomLevel;

    const dLat = userLocation.latitude - mapCenter.latitude;
    const dLng = userLocation.longitude - mapCenter.longitude;

    const posX = cx + dLng * scale + offset.x;
    const posY = cy - dLat * scale + offset.y;

    return {
      x: Math.max(20, Math.min(layout.width - 40, posX)),
      y: Math.max(40, Math.min(layout.height - 60, posY)),
    };
  }, [userLocation, mapCenter, layout, zoomLevel, offset]);

  return (
    <View
      onLayout={handleLayout}
      style={[styles.container, { backgroundColor: colors.mapBackground }, style]}
    >
      {/* Interactive Map Canvas */}
      <View {...panResponder.panHandlers} style={styles.mapCanvas}>
        {/* Decorative Water Area */}
        <View
          style={[
            styles.waterBody,
            { backgroundColor: colors.mapWater, borderRadius: radius.xl },
          ]}
        />

        {/* Decorative Green Park Area */}
        <View
          style={[
            styles.parkArea,
            { backgroundColor: colors.mapPark, borderRadius: radius.lg },
          ]}
        />

        {/* City Street Grid */}
        <View
          style={[
            styles.mainAvenue,
            {
              backgroundColor: colors.mapRoad,
              borderColor: colors.mapRoadOutline,
              left: layout.width * 0.45 + offset.x * 0.3,
            },
          ]}
        />
        <View
          style={[
            styles.secondaryRoad1,
            {
              backgroundColor: colors.mapRoad,
              borderColor: colors.mapRoadOutline,
              top: layout.height * 0.3 + offset.y * 0.3,
            },
          ]}
        />
        <View
          style={[
            styles.secondaryRoad2,
            {
              backgroundColor: colors.mapRoad,
              borderColor: colors.mapRoadOutline,
              top: layout.height * 0.65 + offset.y * 0.3,
            },
          ]}
        />
        <View
          style={[
            styles.diagonalBoulevard,
            {
              backgroundColor: colors.mapRoad,
              borderColor: colors.mapRoadOutline,
            },
          ]}
        />

        {/* City Blocks */}
        <View style={[styles.block1, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />
        <View style={[styles.block2, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />
        <View style={[styles.block3, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />
        <View style={[styles.block4, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />

        {/* User Location Beacon */}
        {projectedUserLoc && (
          <View
            style={[
              styles.userBeaconContainer,
              { top: projectedUserLoc.y - 14, left: projectedUserLoc.x - 14 },
            ]}
          >
            <View
              style={[
                styles.userBeaconPulse,
                { backgroundColor: colors.userLocationRing },
              ]}
            />
            <View
              style={[
                styles.userBeaconDot,
                { backgroundColor: colors.userLocationPin },
              ]}
            />
          </View>
        )}

        {/* Parking Spot Floating Price Pins */}
        {projectedMarkers.map((marker) => {
          const isSelected = selectedMarkerId === marker.id;

          return (
            <Pressable
              key={marker.id}
              onPress={() => onMarkerSelect(marker.id)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={`Parking space: ${marker.title}, ${marker.currency || '₹'}${marker.price} per hour`}
              style={[
                styles.markerPinWrapper,
                {
                  top: marker.canvasY,
                  left: marker.canvasX,
                  zIndex: isSelected ? 999 : 50,
                  transform: [{ scale: isSelected ? 1.08 : 1.0 }],
                },
              ]}
            >
              <ParkingPrice
                price={marker.price}
                currency={marker.currency || '₹'}
                variant="floating"
                isSelected={isSelected}
              />
              <View
                style={[
                  styles.pinPointer,
                  {
                    borderTopColor: isSelected ? colors.primary : colors.pricePinBg,
                  },
                ]}
              />
            </Pressable>
          );
        })}
      </View>

      {/* "Search This Area" Pill - shown when user has moved map */}
      {(hasPanned || showSearchThisArea) && (
        <View style={styles.searchThisAreaContainer}>
          <Pressable
            onPress={() => {
              if (onSearchThisAreaPress) {
                onSearchThisAreaPress();
              }
              setHasPanned(false);
            }}
            accessibilityRole="button"
            accessibilityLabel="Search this map area"
            style={({ pressed }) => [
              styles.searchThisAreaBtn,
              {
                backgroundColor: colors.surface,
                borderColor: colors.border,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: isDark ? 0.35 : 0.12,
                shadowRadius: 8,
                elevation: 4,
                opacity: pressed ? 0.85 : 1,
              },
            ]}
          >
            <AppIcon
              name="refresh-outline"
              size={14}
              color={isDark ? colors.primary : '#49570B'}
              style={{ marginRight: 6 }}
            />
            <AppText variant="captionSmall" weight="bold">
              Search This Area
            </AppText>
          </Pressable>
        </View>
      )}

      {/* Map Controls: Recenter and Zoom Overlays */}
      <View style={styles.controlsOverlay}>
        <Pressable
          onPress={handleRecenter}
          disabled={isLocating}
          accessibilityRole="button"
          accessibilityLabel="Recenter map to current location"
          style={({ pressed }) => [
            styles.controlButton,
            {
              backgroundColor: colors.surface,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <AppIcon
            name={userLocation ? 'navigate' : 'locate-outline'}
            size={18}
            color={
              userLocation
                ? (isDark ? colors.primary : '#49570B')
                : colors.secondaryText
            }
          />
        </Pressable>

        <View
          style={[
            styles.zoomButtonGroup,
            { backgroundColor: colors.surface, borderColor: colors.border },
          ]}
        >
          <Pressable
            onPress={() => handleZoom('in')}
            accessibilityRole="button"
            accessibilityLabel="Zoom in map"
            style={styles.zoomButton}
          >
            <AppIcon name="add" size={18} color={colors.text} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable
            onPress={() => handleZoom('out')}
            accessibilityRole="button"
            accessibilityLabel="Zoom out map"
            style={styles.zoomButton}
          >
            <AppIcon name="remove" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Provider Independence Notice Tag */}
      <View
        style={[
          styles.providerTag,
          { backgroundColor: colors.surface, borderColor: colors.border },
        ]}
      >
        <AppIcon
          name="map-outline"
          size={12}
          color={colors.secondaryText}
          style={{ marginRight: 4 }}
        />
        <AppText variant="captionSmall" color={colors.secondaryText}>
          Vector Discovery Surface (Simulated)
        </AppText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
  },
  waterBody: {
    position: 'absolute',
    top: 30,
    right: -20,
    width: 140,
    height: 180,
    opacity: 0.8,
  },
  parkArea: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    width: 110,
    height: 90,
    opacity: 0.7,
  },
  mainAvenue: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 44,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  secondaryRoad1: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  secondaryRoad2: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  diagonalBoulevard: {
    position: 'absolute',
    top: 60,
    left: -40,
    width: 320,
    height: 24,
    transform: [{ rotate: '38deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  block1: {
    position: 'absolute',
    top: 50,
    left: 30,
    width: 90,
    height: 70,
    borderRadius: 8,
    borderWidth: 1,
  },
  block2: {
    position: 'absolute',
    top: 200,
    left: 35,
    width: 100,
    height: 85,
    borderRadius: 8,
    borderWidth: 1,
  },
  block3: {
    position: 'absolute',
    top: 200,
    right: 25,
    width: 95,
    height: 85,
    borderRadius: 8,
    borderWidth: 1,
  },
  block4: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 110,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
  },
  userBeaconContainer: {
    position: 'absolute',
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 60,
  },
  userBeaconPulse: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    opacity: 0.35,
  },
  userBeaconDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  markerPinWrapper: {
    position: 'absolute',
    alignItems: 'center',
  },
  pinPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 5,
    borderRightWidth: 5,
    borderTopWidth: 5,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  searchThisAreaContainer: {
    position: 'absolute',
    top: 14,
    alignSelf: 'center',
    zIndex: 200,
  },
  searchThisAreaBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  controlsOverlay: {
    position: 'absolute',
    top: 14,
    right: 14,
    gap: 8,
    zIndex: 100,
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButtonGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  zoomButton: {
    width: 40,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  providerTag: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    opacity: 0.85,
    zIndex: 20,
  },
});
