import * as Location from 'expo-location';
import { Linking, Platform } from 'react-native';
import {
  ILocationService,
  LocationPermissionStatus,
  MapCoordinate,
} from '../maps/types';

// Default neutral hub for the application (Bengaluru City Center, MG Road / Brigade Road)
export const DEFAULT_FALLBACK_COORDINATE: MapCoordinate = {
  latitude: 12.9716,
  longitude: 77.5946,
};

export class LocationService implements ILocationService {
  private lastKnownLocation: MapCoordinate | null = null;
  private lastFetchedTimestamp: number | null = null;
  private readonly CACHE_TTL_MS = 60 * 1000; // 1 minute cache

  async getPermissionStatusAsync(): Promise<LocationPermissionStatus> {
    try {
      const { status, canAskAgain } = await Location.getForegroundPermissionsAsync();
      if (status === Location.PermissionStatus.GRANTED) {
        return 'granted';
      }
      if (!canAskAgain) {
        return 'blocked';
      }
      if (status === Location.PermissionStatus.DENIED) {
        return 'denied';
      }
      return 'undetermined';
    } catch {
      return 'undetermined';
    }
  }

  async requestPermissionAsync(): Promise<{
    status: LocationPermissionStatus;
    canAskAgain: boolean;
  }> {
    try {
      const response = await Location.requestForegroundPermissionsAsync();
      const canAskAgain = response.canAskAgain !== false;

      if (response.status === Location.PermissionStatus.GRANTED) {
        return { status: 'granted', canAskAgain: true };
      }

      if (!canAskAgain) {
        return { status: 'blocked', canAskAgain: false };
      }

      return { status: 'denied', canAskAgain: true };
    } catch (error) {
      return { status: 'denied', canAskAgain: true };
    }
  }

  async getCurrentLocationAsync(): Promise<MapCoordinate | null> {
    // Return cached coordinate if within TTL
    const now = Date.now();
    if (
      this.lastKnownLocation &&
      this.lastFetchedTimestamp &&
      now - this.lastFetchedTimestamp < this.CACHE_TTL_MS
    ) {
      return this.lastKnownLocation;
    }

    try {
      const permissionStatus = await this.getPermissionStatusAsync();
      if (permissionStatus !== 'granted') {
        return null;
      }

      // Fetch with timeout safety to prevent indefinite hanging on slow GPS
      const locationPromise = Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const timeoutPromise = new Promise<null>((_, reject) =>
        setTimeout(() => reject(new Error('Location request timed out')), 8000)
      );

      const position = (await Promise.race([
        locationPromise,
        timeoutPromise,
      ])) as Location.LocationObject | null;

      if (!position || !position.coords) {
        return null;
      }

      const coord: MapCoordinate = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };

      this.lastKnownLocation = coord;
      this.lastFetchedTimestamp = now;
      return coord;
    } catch (error) {
      // Fallback to last known position if available
      return this.lastKnownLocation;
    }
  }

  async openSettingsAsync(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await Linking.openSettings();
      }
    } catch {
      // Ignore settings opening failures on platforms without settings handler
    }
  }
}

export const locationService = new LocationService();
