import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
} from 'react-native';
import { useTheme } from '../../theme';
import { CommunityMapViewProps } from './types';
import { AppText } from '../../components/ui/AppText';
import { AppIcon } from '../../components/ui/AppIcon';
import { ParkingPrice } from '../../components/parking/ParkingPrice';

export const SimulatedMap: React.FC<CommunityMapViewProps> = ({
  markers,
  selectedMarkerId,
  onMarkerSelect,
  userLocation = { latitude: 37.7749, longitude: -122.4194 },
  style,
}) => {
  const { colors, radius, isDark } = useTheme();

  // Pan & Zoom state for map exploration
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [zoomLevel, setZoomLevel] = useState(1);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gesture: PanResponderGestureState) =>
      Math.abs(gesture.dx) > 2 || Math.abs(gesture.dy) > 2,
    onPanResponderMove: (_, gesture: PanResponderGestureState) => {
      setOffset((prev) => ({
        x: Math.max(-120, Math.min(120, prev.x + gesture.dx * 0.15)),
        y: Math.max(-120, Math.min(120, prev.y + gesture.dy * 0.15)),
      }));
    },
  });

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel((prev) =>
      direction === 'in' ? Math.min(prev + 0.2, 1.6) : Math.max(prev - 0.2, 0.7)
    );
  };

  const handleReset = () => {
    setOffset({ x: 0, y: 0 });
    setZoomLevel(1);
  };

  // Convert marker relative coordinates to map canvas positions
  const basePositions = [
    { x: 190, y: 140 },
    { x: 80, y: 220 },
    { x: 260, y: 280 },
    { x: 140, y: 340 },
    { x: 280, y: 110 },
    { x: 60, y: 100 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: colors.mapBackground }, style]}>
      {/* Interactive Map Canvas */}
      <View
        {...panResponder.panHandlers}
        style={[
          styles.mapCanvas,
          {
            transform: [
              { translateX: offset.x },
              { translateY: offset.y },
              { scale: zoomLevel },
            ],
          },
        ]}
      >
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
        <View style={[styles.mainAvenue, { backgroundColor: colors.mapRoad, borderColor: colors.mapRoadOutline }]} />
        <View style={[styles.secondaryRoad1, { backgroundColor: colors.mapRoad, borderColor: colors.mapRoadOutline }]} />
        <View style={[styles.secondaryRoad2, { backgroundColor: colors.mapRoad, borderColor: colors.mapRoadOutline }]} />
        <View style={[styles.diagonalBoulevard, { backgroundColor: colors.mapRoad, borderColor: colors.mapRoadOutline }]} />

        {/* City Blocks */}
        <View style={[styles.block1, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />
        <View style={[styles.block2, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />
        <View style={[styles.block3, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />
        <View style={[styles.block4, { backgroundColor: colors.mapBlock, borderColor: colors.borderSubtle }]} />

        {/* User Location Beacon */}
        <View style={[styles.userBeaconContainer, { top: 220, left: 160 }]}>
          <View style={[styles.userBeaconPulse, { backgroundColor: colors.userLocationRing }]} />
          <View style={[styles.userBeaconDot, { backgroundColor: colors.userLocationPin }]} />
        </View>

        {/* Parking Spot Floating Price Pins */}
        {markers.map((marker, idx) => {
          const pos = basePositions[idx % basePositions.length];
          const isSelected = selectedMarkerId === marker.id;

          return (
            <Pressable
              key={marker.id}
              onPress={() => onMarkerSelect(marker.id)}
              style={[
                styles.markerPinWrapper,
                { top: pos.y, left: pos.x },
                isSelected && { zIndex: 100 },
              ]}
            >
              <ParkingPrice
                price={marker.price}
                currency={marker.currency || '$'}
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

      {/* Map Controls Overlay */}
      <View style={styles.controlsOverlay}>
        <Pressable
          onPress={handleReset}
          style={[styles.controlButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
        >
          <AppIcon name="navigate" size={18} color={colors.primaryForeground === '#171A18' ? colors.primary : colors.text} />
        </Pressable>

        <View style={[styles.zoomButtonGroup, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Pressable onPress={() => handleZoom('in')} style={styles.zoomButton}>
            <AppIcon name="add" size={18} color={colors.text} />
          </Pressable>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Pressable onPress={() => handleZoom('out')} style={styles.zoomButton}>
            <AppIcon name="remove" size={18} color={colors.text} />
          </Pressable>
        </View>
      </View>

      {/* Provider Independence Notice Tag */}
      <View style={[styles.providerTag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <AppIcon name="map-outline" size={12} color={colors.secondaryText} style={{ marginRight: 4 }} />
        <AppText variant="captionSmall" color={colors.secondaryText}>
          Vector Discovery Surface
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
    left: 170,
    width: 44,
    borderLeftWidth: 1,
    borderRightWidth: 1,
  },
  secondaryRoad1: {
    position: 'absolute',
    top: 150,
    left: 0,
    right: 0,
    height: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  secondaryRoad2: {
    position: 'absolute',
    top: 310,
    left: 0,
    right: 0,
    height: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  diagonalBoulevard: {
    position: 'absolute',
    top: -50,
    left: 50,
    width: 32,
    height: 550,
    transform: [{ rotate: '45deg' }],
    borderLeftWidth: 1,
    borderRightWidth: 1,
    opacity: 0.6,
  },
  block1: {
    position: 'absolute',
    top: 40,
    left: 30,
    width: 100,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
  },
  block2: {
    position: 'absolute',
    top: 200,
    left: 40,
    width: 100,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
  },
  block3: {
    position: 'absolute',
    top: 50,
    right: 30,
    width: 100,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
  },
  block4: {
    position: 'absolute',
    top: 200,
    right: 30,
    width: 110,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
  },
  userBeaconContainer: {
    position: 'absolute',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userBeaconPulse: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  userBeaconDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#171A18',
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
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -1,
  },
  controlsOverlay: {
    position: 'absolute',
    right: 16,
    top: 16,
    alignItems: 'center',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
  },
  zoomButtonGroup: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    elevation: 2,
  },
  zoomButton: {
    width: 40,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
  },
  providerTag: {
    position: 'absolute',
    bottom: 12,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
});
