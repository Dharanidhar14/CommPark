import { ParkingSpace, AccessType } from './parking';

export interface OwnerReservation {
  id: string;
  spaceId: string;
  spaceName: string;
  customerName: string;
  vehiclePlate: string;
  vehicleModel: string;
  slotNumber: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  earningsAmount: number;
  currency: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  accessType: AccessType;
}

export interface OwnerPayout {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'completed' | 'processing' | 'failed';
  method: string;
  bankAccountLast4: string;
  utrReference: string;
}

export interface OwnerEarningsSummary {
  lifetimeEarnings: number;
  pendingEarnings: number;
  completedBookingsCount: number;
  currency: string;
  occupancyRatePercent: number;
}
