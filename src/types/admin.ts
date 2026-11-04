import { VehicleType } from './parking';

export interface CommunityProperty {
  id: string;
  name: string;
  locality: string;
  city: string;
  totalResidentialUnits: number;
  totalRegisteredBays: number;
  approvedBaysCount: number;
  rwaRegistrationNumber: string;
}

export interface CommunityPolicy {
  externalSharingAllowed: boolean;
  maxBookingHours: number;
  permittedHours: string;
  speedLimitKmh: number;
  permittedVehicles: VehicleType[];
  requireSecurityQrCheck: boolean;
  visitorOvernightParking: boolean;
  allowWeekendGuestSharing: boolean;
  updatedAt: string;
  updatedBy: string;
}

export interface StaffMember {
  id: string;
  name: string;
  staffId: string;
  role: 'security_guard' | 'security_supervisor' | 'gate_attendant';
  assignedGate: string;
  phone: string;
  dutyStatus: 'on_duty' | 'off_duty' | 'break';
  authorizationStatus: 'authorized' | 'suspended';
  joinedDate: string;
}

export interface AdminAuditRecord {
  id: string;
  timestamp: string;
  action:
    | 'listing_approved'
    | 'listing_rejected'
    | 'staff_authorized'
    | 'staff_suspended'
    | 'policy_updated'
    | 'security_alert'
    | 'guest_entry_logged';
  actorName: string;
  actorRole: string;
  targetId: string;
  targetDescription: string;
  details?: string;
  isDemoRecord: boolean;
}
