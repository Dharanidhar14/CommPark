import { create } from 'zustand';
import {
  MapCoordinate,
  LocationPermissionStatus,
  LocationState,
} from '../services/maps/types';
import { locationService, DEFAULT_FALLBACK_COORDINATE } from '../services/location/LocationService';

interface LocationStoreState extends LocationState {
  isExplanationVisible: boolean;
  hasExplainedToUser: boolean;

  // Actions
  checkInitialPermission: () => Promise<LocationPermissionStatus>;
  promptLocationAccess: () => Promise<void>;
  confirmExplanationAndRequest: () => Promise<MapCoordinate | null>;
  dismissExplanation: () => void;
  fetchCurrentLocation: (force?: boolean) => Promise<MapCoordinate | null>;
  openSettings: () => Promise<void>;
  setUserLocation: (coord: MapCoordinate | null) => void;
}

export const useLocationStore = create<LocationStoreState>((set, get) => ({
  coordinate: null,
  permissionStatus: 'undetermined',
  isLoading: false,
  error: null,
  lastUpdated: null,
  isExplanationVisible: false,
  hasExplainedToUser: false,

  checkInitialPermission: async () => {
    try {
      const status = await locationService.getPermissionStatusAsync();
      set({ permissionStatus: status });
      if (status === 'granted') {
        get().fetchCurrentLocation(false);
      }
      return status;
    } catch {
      set({ permissionStatus: 'undetermined' });
      return 'undetermined';
    }
  },

  promptLocationAccess: async () => {
    const { permissionStatus, hasExplainedToUser } = get();

    if (permissionStatus === 'granted') {
      await get().fetchCurrentLocation(true);
      return;
    }

    if (permissionStatus === 'blocked') {
      await locationService.openSettingsAsync();
      return;
    }

    // If permission has not been granted yet and user hasn't seen the rationale, show the rationale modal first
    if (!hasExplainedToUser) {
      set({ isExplanationVisible: true });
      return;
    }

    // User already saw explanation once, request directly
    await get().confirmExplanationAndRequest();
  },

  confirmExplanationAndRequest: async () => {
    set({ isExplanationVisible: false, hasExplainedToUser: true, isLoading: true, error: null });

    try {
      const { status } = await locationService.requestPermissionAsync();
      set({ permissionStatus: status });

      if (status === 'granted') {
        const coord = await locationService.getCurrentLocationAsync();
        set({
          coordinate: coord,
          isLoading: false,
          lastUpdated: Date.now(),
          error: null,
        });
        return coord;
      }

      set({
        isLoading: false,
        error: status === 'blocked'
          ? 'Location access is blocked in settings. Tap to enable.'
          : 'Location access was denied. You can still search by locality.',
      });
      return null;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Unable to retrieve location.',
      });
      return null;
    }
  },

  dismissExplanation: () => {
    set({ isExplanationVisible: false, hasExplainedToUser: true });
  },

  fetchCurrentLocation: async (force = false) => {
    const { permissionStatus, isLoading } = get();
    if (isLoading && !force) return get().coordinate;

    if (permissionStatus !== 'granted') {
      return null;
    }

    set({ isLoading: true, error: null });
    try {
      const coord = await locationService.getCurrentLocationAsync();
      set({
        coordinate: coord,
        isLoading: false,
        lastUpdated: Date.now(),
        error: null,
      });
      return coord;
    } catch (err: any) {
      set({
        isLoading: false,
        error: err.message || 'Location fetch timed out',
      });
      return null;
    }
  },

  openSettings: async () => {
    await locationService.openSettingsAsync();
  },

  setUserLocation: (coord) => {
    set({ coordinate: coord, lastUpdated: Date.now() });
  },
}));
