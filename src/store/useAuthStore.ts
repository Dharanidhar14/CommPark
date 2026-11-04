import { create } from 'zustand';
import { UserProfile, UserRole, SavedPlace, UserPreferences } from '../types/user';
import { RegisteredVehicle } from '../types/booking';
import { MOCK_CURRENT_USER, MOCK_VEHICLES } from '../constants/mockData';
import { useBookingStore } from './useBookingStore';

interface AuthState {
  user: UserProfile;
  vehicles: RegisteredVehicle[];
  selectedVehicleId: string;

  // Role
  switchRole: (role: UserRole) => void;

  // Profile
  updateProfile: (data: Partial<UserProfile>) => void;

  // Vehicle Management
  setSelectedVehicleId: (id: string) => void;
  addVehicle: (vehicle: Omit<RegisteredVehicle, 'id' | 'userId'>) => RegisteredVehicle;
  updateVehicle: (id: string, data: Partial<RegisteredVehicle>) => void;
  removeVehicle: (id: string) => { success: boolean; reason?: string };
  setDefaultVehicle: (id: string) => void;

  // Saved Places
  addSavedPlace: (place: Omit<SavedPlace, 'id'>) => void;
  updateSavedPlace: (id: string, place: Partial<SavedPlace>) => void;
  removeSavedPlace: (id: string) => void;

  // Preferences
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  updateNotificationToggle: (
    key: keyof UserPreferences['notificationToggles'],
    value: boolean
  ) => void;
  updatePrivacySetting: (
    key: keyof UserPreferences['privacySettings'],
    value: boolean
  ) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: MOCK_CURRENT_USER,
  vehicles: MOCK_VEHICLES,
  selectedVehicleId: MOCK_VEHICLES[0]?.id || '',

  switchRole: (role: UserRole) =>
    set((state) => ({
      user: {
        ...state.user,
        activeRole: role,
      },
    })),

  updateProfile: (data) =>
    set((state) => ({
      user: {
        ...state.user,
        ...data,
      },
    })),

  setSelectedVehicleId: (id: string) => set({ selectedVehicleId: id }),

  addVehicle: (vehData) => {
    const { user, vehicles } = get();
    const isFirst = vehicles.length === 0;
    const newVeh: RegisteredVehicle = {
      id: `veh_${Date.now()}`,
      userId: user.id,
      ...vehData,
      isDefault: vehData.isDefault || isFirst,
    };

    set({
      vehicles: [...vehicles, newVeh],
      selectedVehicleId: newVeh.id,
    });
    return newVeh;
  },

  updateVehicle: (id, data) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => (v.id === id ? { ...v, ...data } : v)),
    })),

  removeVehicle: (id) => {
    // Check if linked to active reservation in useBookingStore
    try {
      const activeBooking = useBookingStore.getState().activeBooking;
      if (activeBooking && activeBooking.vehicle.id === id && activeBooking.status === 'active') {
        return {
          success: false,
          reason: `Vehicle ${activeBooking.vehicle.licensePlate} is linked to active booking #${activeBooking.bookingNumber}. Please complete or cancel the booking first.`,
        };
      }
    } catch {
      // ignore
    }

    const { vehicles, selectedVehicleId } = get();
    const remaining = vehicles.filter((v) => v.id !== id);
    const newSelectedId = selectedVehicleId === id ? remaining[0]?.id || '' : selectedVehicleId;

    set({
      vehicles: remaining,
      selectedVehicleId: newSelectedId,
    });
    return { success: true };
  },

  setDefaultVehicle: (id) =>
    set((state) => ({
      vehicles: state.vehicles.map((v) => ({
        ...v,
        isDefault: v.id === id,
      })),
      selectedVehicleId: id,
    })),

  addSavedPlace: (placeData) =>
    set((state) => {
      const newPlace: SavedPlace = {
        id: `sp_${Date.now()}`,
        ...placeData,
      };
      return {
        user: {
          ...state.user,
          savedPlaces: [...state.user.savedPlaces, newPlace],
        },
      };
    }),

  updateSavedPlace: (id, placeData) =>
    set((state) => ({
      user: {
        ...state.user,
        savedPlaces: state.user.savedPlaces.map((sp) =>
          sp.id === id ? { ...sp, ...placeData } : sp
        ),
      },
    })),

  removeSavedPlace: (id) =>
    set((state) => ({
      user: {
        ...state.user,
        savedPlaces: state.user.savedPlaces.filter((sp) => sp.id !== id),
      },
    })),

  updatePreferences: (prefUpdates) =>
    set((state) => ({
      user: {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          ...prefUpdates,
        },
      },
    })),

  updateNotificationToggle: (key, value) =>
    set((state) => ({
      user: {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          notificationToggles: {
            ...state.user.preferences.notificationToggles,
            [key]: value,
          },
        },
      },
    })),

  updatePrivacySetting: (key, value) =>
    set((state) => ({
      user: {
        ...state.user,
        preferences: {
          ...state.user.preferences,
          privacySettings: {
            ...state.user.preferences.privacySettings,
            [key]: value,
          },
        },
      },
    })),
}));
