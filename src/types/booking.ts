import { ParkingSpace, AccessType } from './parking';

export type BookingStatus =
  | 'active'
  | 'upcoming'
  | 'completed'
  | 'cancelled';

export interface RegisteredVehicle {
  id: string;
  userId: string;
  licensePlate: string;
  make: string;
  model: string;
  color: string;
  type: string;
  isDefault: boolean;
}

export interface SecurityVerificationLog {
  id: string;
  bookingId: string;
  guardId: string;
  guardName: string;
  verifiedAt: string;
  licensePlateMatches: boolean;
  status: 'entry_approved' | 'exit_recorded' | 'denied';
  guardIncentiveAmount?: number;
  notes?: string;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  spaceId: string;
  space: ParkingSpace;
  vehicle: RegisteredVehicle;
  startTime: string;
  endTime: string;
  durationHours: number;
  accessType: AccessType;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  qrCodeToken: string;
  accessCode?: string;
  specialInstructions?: string;
  verificationLog?: SecurityVerificationLog;
  createdAt: string;
}
