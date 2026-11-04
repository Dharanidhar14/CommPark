import { create } from 'zustand';
import { Booking, RegisteredVehicle, PaymentMethodType } from '../types/booking';
import { ParkingSpace } from '../types/parking';
import { MOCK_ACTIVE_BOOKING, MOCK_RECENT_BOOKINGS } from '../constants/mockData';

export interface DraftBooking {
  space: ParkingSpace | null;
  vehicle: RegisteredVehicle | null;
  durationHours: number;
  bookingDate: string; // e.g., 'Today (04 Nov)', 'Tomorrow (05 Nov)'
  startTime: string; // e.g., 'Immediate / Now', '10:00 AM'
  paymentMethod: PaymentMethodType;
  upiApp?: 'gpay' | 'phonepe' | 'paytm' | 'bhim';
  simulateFailure: boolean;
}

interface BookingState {
  activeBooking: Booking | null;
  bookings: Booking[];
  draft: DraftBooking;
  setDraftSpace: (space: ParkingSpace) => void;
  setDraftVehicle: (vehicle: RegisteredVehicle) => void;
  setDraftDuration: (hours: number) => void;
  setDraftDate: (date: string) => void;
  setDraftStartTime: (time: string) => void;
  setDraftPaymentMethod: (method: PaymentMethodType) => void;
  setDraftUpiApp: (app: 'gpay' | 'phonepe' | 'paytm' | 'bhim') => void;
  setSimulateFailure: (simulate: boolean) => void;
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
    bookingDate: 'Today',
    startTime: 'Immediate / Now',
    paymentMethod: 'upi',
    upiApp: 'gpay',
    simulateFailure: false,
  },
  setDraftSpace: (space) =>
    set((state) => ({ draft: { ...state.draft, space } })),
  setDraftVehicle: (vehicle) =>
    set((state) => ({ draft: { ...state.draft, vehicle } })),
  setDraftDuration: (hours) =>
    set((state) => ({ draft: { ...state.draft, durationHours: hours } })),
  setDraftDate: (date) =>
    set((state) => ({ draft: { ...state.draft, bookingDate: date } })),
  setDraftStartTime: (time) =>
    set((state) => ({ draft: { ...state.draft, startTime: time } })),
  setDraftPaymentMethod: (method) =>
    set((state) => ({ draft: { ...state.draft, paymentMethod: method } })),
  setDraftUpiApp: (app) =>
    set((state) => ({ draft: { ...state.draft, upiApp: app } })),
  setSimulateFailure: (simulate) =>
    set((state) => ({ draft: { ...state.draft, simulateFailure: simulate } })),
  confirmBooking: () => {
    const { draft, bookings } = get();
    if (!draft.space || !draft.vehicle) return null;

    const subtotal = Math.round(draft.space.pricePerHour * draft.durationHours);
    const serviceFee = 15; // ₹15 community platform & verification fee
    const totalAmount = subtotal + serviceFee;
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const bookingNumber = `CP-2026-IND-${randomSuffix}`;

    const newBooking: Booking = {
      id: `bk_demo_${Date.now()}`,
      bookingNumber,
      spaceId: draft.space.id,
      space: draft.space,
      vehicle: draft.vehicle,
      bookingDate: draft.bookingDate,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + draft.durationHours * 3600000).toISOString(),
      durationHours: draft.durationHours,
      accessType: draft.space.accessType,
      subtotal,
      serviceFee,
      totalAmount,
      currency: '₹',
      status: 'active',
      paymentMethod: draft.paymentMethod,
      qrCodeToken: `COMMUNITYPARK:DEMO_PASS:${randomSuffix}:${draft.space.accessType}:${draft.vehicle.licensePlate}:VALID`,
      accessCode:
        draft.space.accessType === 'direct_access'
          ? `PIN-${Math.floor(1000 + Math.random() * 9000)}`
          : draft.space.accessType === 'security_verified'
          ? `GATE-${Math.floor(1000 + Math.random() * 9000)}`
          : undefined,
      specialInstructions: draft.space.accessInstructions,
      createdAt: new Date().toISOString(),
      isDemoData: true,
    };

    set({
      activeBooking: newBooking,
      bookings: [newBooking, ...bookings],
      draft: {
        space: null,
        vehicle: null,
        durationHours: 2,
        bookingDate: 'Today',
        startTime: 'Immediate / Now',
        paymentMethod: 'upi',
        upiApp: 'gpay',
        simulateFailure: false,
      },
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
