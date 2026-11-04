import { create } from 'zustand';
import { Booking, RegisteredVehicle } from '../types/booking';
import { ParkingSpace } from '../types/parking';
import { MOCK_ACTIVE_BOOKING, MOCK_RECENT_BOOKINGS } from '../constants/mockData';

interface DraftBooking {
  space: ParkingSpace | null;
  vehicle: RegisteredVehicle | null;
  durationHours: number;
}

interface BookingState {
  activeBooking: Booking | null;
  bookings: Booking[];
  draft: DraftBooking;
  setDraftSpace: (space: ParkingSpace) => void;
  setDraftVehicle: (vehicle: RegisteredVehicle) => void;
  setDraftDuration: (hours: number) => void;
  confirmBooking: () => Booking | null;
  cancelBooking: (id: string) => void;
}

export const useBookingStore = create<BookingState>((set, get) => ({
  activeBooking: MOCK_ACTIVE_BOOKING,
  bookings: MOCK_RECENT_BOOKINGS,
  draft: {
    space: null,
    vehicle: null,
    durationHours: 2,
  },
  setDraftSpace: (space) =>
    set((state) => ({ draft: { ...state.draft, space } })),
  setDraftVehicle: (vehicle) =>
    set((state) => ({ draft: { ...state.draft, vehicle } })),
  setDraftDuration: (hours) =>
    set((state) => ({ draft: { ...state.draft, durationHours: hours } })),
  confirmBooking: () => {
    const { draft, bookings } = get();
    if (!draft.space || !draft.vehicle) return null;

    const subtotal = Number((draft.space.pricePerHour * draft.durationHours).toFixed(2));
    const serviceFee = 1.50;
    const totalAmount = Number((subtotal + serviceFee).toFixed(2));

    const newBooking: Booking = {
      id: `bk_${Date.now()}`,
      bookingNumber: `CP-${Math.floor(1000 + Math.random() * 9000)}`,
      spaceId: draft.space.id,
      space: draft.space,
      vehicle: draft.vehicle,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + draft.durationHours * 3600000).toISOString(),
      durationHours: draft.durationHours,
      accessType: draft.space.accessType,
      subtotal,
      serviceFee,
      totalAmount,
      currency: draft.space.currency,
      status: 'active',
      qrCodeToken: `CP:PASS:${Date.now()}:${draft.space.accessType}:${draft.vehicle.licensePlate}:VALID`,
      accessCode: draft.space.accessType === 'direct_access' ? 'KEY-9921' : undefined,
      createdAt: new Date().toISOString(),
    };

    set({
      activeBooking: newBooking,
      bookings: [newBooking, ...bookings],
      draft: { space: null, vehicle: null, durationHours: 2 },
    });

    return newBooking;
  },
  cancelBooking: (id) =>
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const } : b
      ),
      activeBooking: state.activeBooking?.id === id ? null : state.activeBooking,
    })),
}));
