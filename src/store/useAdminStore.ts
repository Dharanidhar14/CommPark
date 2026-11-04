import { create } from 'zustand';
import {
  CommunityProperty,
  CommunityPolicy,
  StaffMember,
  AdminAuditRecord,
} from '../types/admin';
import { useOwnerStore } from './useOwnerStore';

interface AdminState {
  property: CommunityProperty;
  policies: CommunityPolicy;
  staff: StaffMember[];
  auditLogs: AdminAuditRecord[];

  // Actions
  approveListing: (listingId: string) => void;
  rejectListing: (listingId: string, reason: string) => void;
  updatePolicy: (updates: Partial<CommunityPolicy>) => void;
  toggleStaffStatus: (staffId: string) => void;
  addAuditRecord: (
    record: Omit<AdminAuditRecord, 'id' | 'timestamp' | 'isDemoRecord'>
  ) => void;
}

const INITIAL_PROPERTY: CommunityProperty = {
  id: 'comm_greenwood_blr',
  name: 'Greenwood Palms Residents Welfare Association',
  locality: 'Indiranagar',
  city: 'Bengaluru',
  totalResidentialUnits: 140,
  totalRegisteredBays: 18,
  approvedBaysCount: 14,
  rwaRegistrationNumber: 'RWA-KAR-BLR-2021-9941',
};

const INITIAL_POLICIES: CommunityPolicy = {
  externalSharingAllowed: true,
  maxBookingHours: 12,
  permittedHours: '07:00 AM – 11:00 PM',
  speedLimitKmh: 10,
  permittedVehicles: ['ev', 'sedan', 'suv', 'hatchback', 'motorcycle'],
  requireSecurityQrCheck: true,
  visitorOvernightParking: false,
  allowWeekendGuestSharing: true,
  updatedAt: '2026-11-01',
  updatedBy: 'Estate Management Committee',
};

const INITIAL_STAFF: StaffMember[] = [
  {
    id: 'stf_01',
    name: 'Ramesh Kumar',
    staffId: 'SEC-BLR-042',
    role: 'security_guard',
    assignedGate: 'Gate 2 (Main Boom Barrier)',
    phone: '+91 98450 44102',
    dutyStatus: 'on_duty',
    authorizationStatus: 'authorized',
    joinedDate: 'Jan 2024',
  },
  {
    id: 'stf_02',
    name: 'Sunita Patil',
    staffId: 'SEC-BLR-043',
    role: 'security_guard',
    assignedGate: 'Gate 1 (Visitor Turnstile)',
    phone: '+91 98450 33201',
    dutyStatus: 'on_duty',
    authorizationStatus: 'authorized',
    joinedDate: 'Apr 2024',
  },
  {
    id: 'stf_03',
    name: 'Vikram Singh',
    staffId: 'SEC-BLR-020',
    role: 'security_supervisor',
    assignedGate: 'Central Security Control Room',
    phone: '+91 98450 11984',
    dutyStatus: 'break',
    authorizationStatus: 'authorized',
    joinedDate: 'Aug 2023',
  },
  {
    id: 'stf_04',
    name: 'Dilip Mehra',
    staffId: 'SEC-BLR-055',
    role: 'gate_attendant',
    assignedGate: 'Service Gate 3',
    phone: '+91 98450 77120',
    dutyStatus: 'off_duty',
    authorizationStatus: 'suspended',
    joinedDate: 'Oct 2024',
  },
];

const INITIAL_AUDIT_LOGS: AdminAuditRecord[] = [
  {
    id: 'aud_01',
    timestamp: 'Today, 04:15 PM',
    action: 'guest_entry_logged',
    actorName: 'Ramesh Kumar',
    actorRole: 'Security Guard',
    targetId: 'CP-2026-IND-4421',
    targetDescription: 'Vehicle KA 04 MM 1120 entry approved at Gate 2',
    details: 'Digital pass verified with ₹15 guard incentive.',
    isDemoRecord: true,
  },
  {
    id: 'aud_02',
    timestamp: 'Today, 02:30 PM',
    action: 'security_alert',
    actorName: 'Ramesh Kumar',
    actorRole: 'Security Guard',
    targetId: 'CP-2026-IND-1102',
    targetDescription: 'Plate mismatch at Gate 2: Expected KA 01 MJ 4821, saw DL 08 CC 4310',
    details: 'Entry denied to unverified vehicle.',
    isDemoRecord: true,
  },
  {
    id: 'aud_03',
    timestamp: '03 Nov 2026',
    action: 'listing_approved',
    actorName: 'K. S. Narayanan',
    actorRole: 'RWA President',
    targetId: 'own_sp_01',
    targetDescription: 'Greenwood Heights Slot 14 (Flat B-402)',
    details: 'Allotted resident parking verified against society allotment register.',
    isDemoRecord: true,
  },
  {
    id: 'aud_04',
    timestamp: '01 Nov 2026',
    action: 'policy_updated',
    actorName: 'Estate Management Committee',
    actorRole: 'Committee Board',
    targetId: 'speed_limit_rule',
    targetDescription: 'Enforced 10 km/h speed limit on internal basement ramps',
    details: 'Speed bump signs placed near Gate 2 ramp.',
    isDemoRecord: true,
  },
  {
    id: 'aud_05',
    timestamp: '28 Oct 2026',
    action: 'staff_suspended',
    actorName: 'K. S. Narayanan',
    actorRole: 'RWA President',
    targetId: 'SEC-BLR-055',
    targetDescription: 'Gate Attendant Dilip Mehra access suspended',
    details: 'Pending safety protocol refresher orientation.',
    isDemoRecord: true,
  },
];

export const useAdminStore = create<AdminState>((set, get) => ({
  property: INITIAL_PROPERTY,
  policies: INITIAL_POLICIES,
  staff: INITIAL_STAFF,
  auditLogs: INITIAL_AUDIT_LOGS,

  approveListing: (listingId) => {
    // 1. Update in useOwnerStore
    useOwnerStore.getState().simulateCommunityApproval(listingId);

    // 2. Add Audit Log
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const listing = useOwnerStore.getState().listings.find((l) => l.id === listingId);

    get().addAuditRecord({
      action: 'listing_approved',
      actorName: 'K. S. Narayanan',
      actorRole: 'RWA Estate Administrator',
      targetId: listingId,
      targetDescription: `Approved parking bay: ${listing?.name || listingId}`,
      details: `Verified flat ${listing?.communityInfo?.unitOrFlatNumber || 'N/A'}. Slot is now live for public booking.`,
    });
  },

  rejectListing: (listingId, reason) => {
    // 1. Update in useOwnerStore
    useOwnerStore.getState().simulateCommunityRejection(listingId, reason);

    // 2. Add Audit Log
    const listing = useOwnerStore.getState().listings.find((l) => l.id === listingId);

    get().addAuditRecord({
      action: 'listing_rejected',
      actorName: 'K. S. Narayanan',
      actorRole: 'RWA Estate Administrator',
      targetId: listingId,
      targetDescription: `Rejected parking bay: ${listing?.name || listingId}`,
      details: `Rejection rationale: ${reason}`,
    });
  },

  updatePolicy: (updates) => {
    set((state) => ({
      policies: {
        ...state.policies,
        ...updates,
        updatedAt: new Date().toISOString().split('T')[0],
      },
    }));

    get().addAuditRecord({
      action: 'policy_updated',
      actorName: 'Estate Management Committee',
      actorRole: 'Committee Board',
      targetId: 'community_policies',
      targetDescription: 'Community parking bylaws and restrictions updated',
    });
  },

  toggleStaffStatus: (staffId) => {
    let newStatus: 'authorized' | 'suspended' = 'authorized';
    let staffName = '';

    set((state) => ({
      staff: state.staff.map((s) => {
        if (s.id !== staffId) return s;
        newStatus = s.authorizationStatus === 'authorized' ? 'suspended' : 'authorized';
        staffName = s.name;
        return {
          ...s,
          authorizationStatus: newStatus,
        };
      }),
    }));

    get().addAuditRecord({
      action: newStatus === 'authorized' ? 'staff_authorized' : 'staff_suspended',
      actorName: 'K. S. Narayanan',
      actorRole: 'RWA Estate Administrator',
      targetId: staffId,
      targetDescription: `${staffName} authorization status changed to ${newStatus.toUpperCase()}`,
    });
  },

  addAuditRecord: (record) => {
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    const newLog: AdminAuditRecord = {
      id: `aud_${Date.now()}`,
      timestamp: `Today, ${timeNow}`,
      isDemoRecord: true,
      ...record,
    };

    set((state) => ({
      auditLogs: [newLog, ...state.auditLogs],
    }));
  },
}));
