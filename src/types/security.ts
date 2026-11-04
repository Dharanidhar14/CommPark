export type GuardDutyStatus = 'on_duty' | 'off_duty' | 'break';

export type VerificationResult =
  | 'approved'
  | 'invalid_token'
  | 'expired_pass'
  | 'cancelled_booking'
  | 'plate_mismatch'
  | 'already_checked_in'
  | 'unapproved_listing';

export interface SecurityGuard {
  id: string;
  name: string;
  badgeNumber: string;
  propertyId: string;
  propertyName: string;
  gateNumber: string;
  dutyStatus: GuardDutyStatus;
  shiftStartTime: string;
  isAuthorized: boolean;
}

export interface VerificationCheck {
  id: string;
  timestamp: string;
  bookingId: string;
  bookingNumber: string;
  spaceName: string;
  customerName: string;
  expectedPlate: string;
  arrivingPlate: string;
  slotNumber: string;
  result: VerificationResult;
  statusLabel: string;
  gateName: string;
  guardName: string;
  incentiveCredited: number; // ₹15 if approved
  notes?: string;
  isDemoData: boolean;
}

export interface VehicleMovement {
  id: string;
  bookingId: string;
  bookingNumber: string;
  vehiclePlate: string;
  vehicleModel: string;
  customerName: string;
  slotNumber: string;
  entryTime: string;
  exitTime?: string;
  status: 'parked' | 'exited';
}

export interface GuardIncentiveSummary {
  shiftEarned: number;
  totalLifetimeEarned: number;
  verificationsCount: number;
  pendingIncentives: number;
  currency: string;
}
