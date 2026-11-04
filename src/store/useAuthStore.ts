import { create } from 'zustand';
import { UserProfile, UserRole } from '../types/user';
import { RegisteredVehicle } from '../types/booking';
import { MOCK_CURRENT_USER, MOCK_VEHICLES } from '../constants/mockData';

interface AuthState {
  user: UserProfile;
  vehicles: RegisteredVehicle[];
  selectedVehicleId: string;
  switchRole: (role: UserRole) => void;
  setSelectedVehicleId: (id: string) => void;
  addVehicle: (vehicle: Omit<RegisteredVehicle, 'id' | 'userId'>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
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
  setSelectedVehicleId: (id: string) => set({ selectedVehicleId: id }),
  addVehicle: (vehData) =>
    set((state) => {
      const newVeh: RegisteredVehicle = {
        id: `veh_${Date.now()}`,
        userId: state.user.id,
        ...vehData,
      };
      return {
        vehicles: [...state.vehicles, newVeh],
        selectedVehicleId: newVeh.id,
      };
    }),
}));
