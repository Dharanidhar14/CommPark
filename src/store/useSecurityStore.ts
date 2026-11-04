import { create } from 'zustand';
import {
  SecurityGuard,
  VerificationCheck,
  VehicleMovement,
  GuardIncentiveSummary,
  VerificationResult,
} from '../types/security';
import { useAdminStore } from './useAdminStore';

interface ExpectedArrival {
  id: string;
  bookingNumber: string;
  customerName: string;
  vehiclePlate: string;
  vehicleModel: string;
  slotNumber: string;
  scheduledTime: string;
  spaceName: string;
  status: 'pending' | 'arrived';
}

interface SecurityState {
  guard: SecurityGuard;
  expectedArrivals: ExpectedArrival[];
  parkedVehicles: VehicleMovement[];
  verificationLogs: VerificationCheck[];
  incentiveStats: GuardIncentiveSummary;

  // Actions
  toggleDutyStatus: () => void;
  runVerificationScenario: (
    scenario:
      | 'valid'
      | 'expired'
      | 'cancelled'
      | 'plate_mismatch'
      | 'duplicate'
      | 'unapproved',
    arrivingPlateInput?: string
  ) => VerificationCheck;
  recordExit: (movementId: string) => void;
}

const INITIAL_GUARD: SecurityGuard = {
  id: 'guard_ramesh_042',
  name: 'Ramesh Kumar',
  badgeNumber: 'SEC-BLR-042',
  propertyId: 'comm_greenwood_blr',
  propertyName: 'Greenwood Palms Residents Welfare Association',
  gateNumber: 'Gate 2 (Main Residential Barrier)',
  dutyStatus: 'on_duty',
  shiftStartTime: '02:00 PM',
  isAuthorized: true,
};

const INITIAL_EXPECTED_ARRIVALS: ExpectedArrival[] = [
  {
    id: 'arr_01',
    bookingNumber: 'CP-2026-IND-8812',
    customerName: 'Aditya Sharma',
    vehiclePlate: 'KA 01 MJ 4821',
    vehicleModel: 'Tata Nexon EV (Teal Blue)',
    slotNumber: 'Basement P1 - Bay 14',
    scheduledTime: '07:00 PM – 11:30 PM',
    spaceName: 'Greenwood Palms Bay 14',
    status: 'pending',
  },
  {
    id: 'arr_02',
    bookingNumber: 'CP-2026-IND-7204',
    customerName: 'Kavita Menon',
    vehiclePlate: 'KA 05 NE 3319',
    vehicleModel: 'Hyundai Creta (Polar White)',
    slotNumber: 'Basement P1 - Bay 08',
    scheduledTime: '08:15 PM – 10:45 PM',
    spaceName: 'Greenwood Palms Bay 08',
    status: 'pending',
  },
  {
    id: 'arr_03',
    bookingNumber: 'CP-2026-IND-6419',
    customerName: 'Sunil Rao',
    vehiclePlate: 'MH 02 BP 9920',
    vehicleModel: 'MG ZS EV (Sky Blue)',
    slotNumber: 'Ground Podium Bay 02',
    scheduledTime: '09:00 PM – 11:00 PM',
    spaceName: 'Greenwood Palms Bay 02',
    status: 'pending',
  },
];

const INITIAL_PARKED_VEHICLES: VehicleMovement[] = [
  {
    id: 'mov_01',
    bookingId: 'bk_live_01',
    bookingNumber: 'CP-2026-IND-5510',
    vehiclePlate: 'KA 03 NA 9012',
    vehicleModel: 'Honda City (Grey)',
    customerName: 'Pooja Reddy',
    slotNumber: 'Basement P1 - Bay 04',
    entryTime: '03:45 PM',
    status: 'parked',
  },
  {
    id: 'mov_02',
    bookingId: 'bk_live_02',
    bookingNumber: 'CP-2026-IND-4421',
    vehiclePlate: 'KA 04 MM 1120',
    vehicleModel: 'Kia Seltos (Black)',
    customerName: 'Deepak Varma',
    slotNumber: 'Basement P1 - Bay 09',
    entryTime: '04:15 PM',
    status: 'parked',
  },
];

const INITIAL_VERIFICATION_LOGS: VerificationCheck[] = [
  {
    id: 'chk_01',
    timestamp: '04:15 PM',
    bookingId: 'bk_live_02',
    bookingNumber: 'CP-2026-IND-4421',
    spaceName: 'Greenwood Palms Bay 09',
    customerName: 'Deepak Varma',
    expectedPlate: 'KA 04 MM 1120',
    arrivingPlate: 'KA 04 MM 1120',
    slotNumber: 'Bay 09',
    result: 'approved',
    statusLabel: 'ENTRY APPROVED',
    gateName: 'Gate 2',
    guardName: 'Ramesh Kumar',
    incentiveCredited: 15,
    notes: 'Plate matched. Driver verified via QR pass.',
    isDemoData: true,
  },
  {
    id: 'chk_02',
    timestamp: '03:45 PM',
    bookingId: 'bk_live_01',
    bookingNumber: 'CP-2026-IND-5510',
    spaceName: 'Greenwood Palms Bay 04',
    customerName: 'Pooja Reddy',
    expectedPlate: 'KA 03 NA 9012',
    arrivingPlate: 'KA 03 NA 9012',
    slotNumber: 'Bay 04',
    result: 'approved',
    statusLabel: 'ENTRY APPROVED',
    gateName: 'Gate 2',
    guardName: 'Ramesh Kumar',
    incentiveCredited: 15,
    notes: 'Plate matched. Driver verified via QR pass.',
    isDemoData: true,
  },
  {
    id: 'chk_03',
    timestamp: '02:30 PM',
    bookingId: 'bk_prev_99',
    bookingNumber: 'CP-2026-IND-1102',
    spaceName: 'Greenwood Palms Bay 14',
    customerName: 'Unknown Driver',
    expectedPlate: 'KA 01 MJ 4821',
    arrivingPlate: 'DL 08 CC 4310',
    slotNumber: 'Bay 14',
    result: 'plate_mismatch',
    statusLabel: 'PLATE MISMATCH',
    gateName: 'Gate 2',
    guardName: 'Ramesh Kumar',
    incentiveCredited: 0,
    notes: 'Arriving vehicle plate does not match booking pass. Entry denied.',
    isDemoData: true,
  },
];

export const useSecurityStore = create<SecurityState>((set, get) => ({
  guard: INITIAL_GUARD,
  expectedArrivals: INITIAL_EXPECTED_ARRIVALS,
  parkedVehicles: INITIAL_PARKED_VEHICLES,
  verificationLogs: INITIAL_VERIFICATION_LOGS,
  incentiveStats: {
    shiftEarned: 90.00,
    totalLifetimeEarned: 345.00,
    verificationsCount: 6,
    pendingIncentives: 30.00,
    currency: '₹',
  },

  toggleDutyStatus: () =>
    set((state) => {
      const next: 'on_duty' | 'break' =
        state.guard.dutyStatus === 'on_duty' ? 'break' : 'on_duty';
      return {
        guard: {
          ...state.guard,
          dutyStatus: next,
        },
      };
    }),

  runVerificationScenario: (scenario, arrivingPlateInput) => {
    const timeNow = new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });

    let check: VerificationCheck;

    switch (scenario) {
      case 'valid': {
        const expectedPlate = 'KA 01 MJ 4821';
        const arrivingPlate = arrivingPlateInput || expectedPlate;

        check = {
          id: `chk_${Date.now()}`,
          timestamp: timeNow,
          bookingId: 'bk_live_blr_9081',
          bookingNumber: 'CP-2026-IND-8812',
          spaceName: 'Greenwood Palms Bay 14',
          customerName: 'Aditya Sharma',
          expectedPlate,
          arrivingPlate,
          slotNumber: 'Basement P1 - Bay 14',
          result: 'approved',
          statusLabel: 'ENTRY APPROVED',
          gateName: 'Gate 2',
          guardName: get().guard.name,
          incentiveCredited: 15,
          notes: 'Pass verified. Vehicle number plate matched. Security barrier raised.',
          isDemoData: true,
        };

        const newMovement: VehicleMovement = {
          id: `mov_${Date.now()}`,
          bookingId: 'bk_live_blr_9081',
          bookingNumber: 'CP-2026-IND-8812',
          vehiclePlate: expectedPlate,
          vehicleModel: 'Tata Nexon EV (Teal Blue)',
          customerName: 'Aditya Sharma',
          slotNumber: 'Basement P1 - Bay 14',
          entryTime: timeNow,
          status: 'parked',
        };

        set((state) => ({
          verificationLogs: [check, ...state.verificationLogs],
          parkedVehicles: [newMovement, ...state.parkedVehicles],
          expectedArrivals: state.expectedArrivals.map((arr) =>
            arr.bookingNumber === 'CP-2026-IND-8812'
              ? { ...arr, status: 'arrived' as const }
              : arr
          ),
          incentiveStats: {
            ...state.incentiveStats,
            shiftEarned: state.incentiveStats.shiftEarned + 15,
            totalLifetimeEarned: state.incentiveStats.totalLifetimeEarned + 15,
            verificationsCount: state.incentiveStats.verificationsCount + 1,
          },
        }));

        // Log to Admin Audit
        useAdminStore.getState().addAuditRecord({
          action: 'guest_entry_logged',
          actorName: get().guard.name,
          actorRole: 'Security Guard (Gate 2)',
          targetId: check.bookingNumber,
          targetDescription: `Vehicle ${expectedPlate} entry approved for Slot Bay 14`,
          details: 'Digital pass verified; ₹15 guard incentive awarded.',
        });

        break;
      }

      case 'expired': {
        check = {
          id: `chk_${Date.now()}`,
          timestamp: timeNow,
          bookingId: 'bk_expired_01',
          bookingNumber: 'CP-2026-IND-3390',
          spaceName: 'Greenwood Palms Bay 14',
          customerName: 'Vikram Joshi',
          expectedPlate: 'KA 01 AB 9988',
          arrivingPlate: 'KA 01 AB 9988',
          slotNumber: 'Bay 14',
          result: 'expired_pass',
          statusLabel: 'EXPIRED PASS',
          gateName: 'Gate 2',
          guardName: get().guard.name,
          incentiveCredited: 0,
          notes: 'Pass expired at 02:00 PM. Verification rejected.',
          isDemoData: true,
        };

        set((state) => ({
          verificationLogs: [check, ...state.verificationLogs],
        }));

        useAdminStore.getState().addAuditRecord({
          action: 'security_alert',
          actorName: get().guard.name,
          actorRole: 'Security Guard',
          targetId: check.bookingNumber,
          targetDescription: 'Expired booking pass presented at Gate 2',
          details: 'Entry denied by guard.',
        });
        break;
      }

      case 'cancelled': {
        check = {
          id: `chk_${Date.now()}`,
          timestamp: timeNow,
          bookingId: 'bk_canc_01',
          bookingNumber: 'CP-2026-IND-2009',
          spaceName: 'Greenwood Palms Bay 08',
          customerName: 'Sanjay Dutt',
          expectedPlate: 'KA 03 NA 1199',
          arrivingPlate: 'KA 03 NA 1199',
          slotNumber: 'Bay 08',
          result: 'cancelled_booking',
          statusLabel: 'CANCELLED PASS',
          gateName: 'Gate 2',
          guardName: get().guard.name,
          incentiveCredited: 0,
          notes: 'Customer cancelled booking prior to arrival. Barrier remains closed.',
          isDemoData: true,
        };

        set((state) => ({
          verificationLogs: [check, ...state.verificationLogs],
        }));
        break;
      }

      case 'plate_mismatch': {
        const expected = 'KA 05 NE 3319';
        const arriving = arrivingPlateInput || 'HR 26 DQ 5541';

        check = {
          id: `chk_${Date.now()}`,
          timestamp: timeNow,
          bookingId: 'bk_live_blr_9082',
          bookingNumber: 'CP-2026-IND-7204',
          spaceName: 'Greenwood Palms Bay 08',
          customerName: 'Kavita Menon',
          expectedPlate: expected,
          arrivingPlate: arriving,
          slotNumber: 'Bay 08',
          result: 'plate_mismatch',
          statusLabel: 'PLATE MISMATCH',
          gateName: 'Gate 2',
          guardName: get().guard.name,
          incentiveCredited: 0,
          notes: `Vehicle mismatch: Expected ${expected}, but physical vehicle has ${arriving}. Entry denied.`,
          isDemoData: true,
        };

        set((state) => ({
          verificationLogs: [check, ...state.verificationLogs],
        }));

        useAdminStore.getState().addAuditRecord({
          action: 'security_alert',
          actorName: get().guard.name,
          actorRole: 'Security Guard',
          targetId: check.bookingNumber,
          targetDescription: `Vehicle plate mismatch: expected ${expected}, saw ${arriving}`,
          details: 'Entry denied at Gate 2.',
        });
        break;
      }

      case 'duplicate': {
        check = {
          id: `chk_${Date.now()}`,
          timestamp: timeNow,
          bookingId: 'bk_live_blr_9081',
          bookingNumber: 'CP-2026-IND-8812',
          spaceName: 'Greenwood Palms Bay 14',
          customerName: 'Aditya Sharma',
          expectedPlate: 'KA 01 MJ 4821',
          arrivingPlate: 'KA 01 MJ 4821',
          slotNumber: 'Bay 14',
          result: 'already_checked_in',
          statusLabel: 'DUPLICATE CHECK-IN PREVENTED',
          gateName: 'Gate 2',
          guardName: get().guard.name,
          incentiveCredited: 0,
          notes: 'Pass was already scanned and is currently recorded as parked inside.',
          isDemoData: true,
        };

        set((state) => ({
          verificationLogs: [check, ...state.verificationLogs],
        }));
        break;
      }

      case 'unapproved': {
        check = {
          id: `chk_${Date.now()}`,
          timestamp: timeNow,
          bookingId: 'bk_unapproved_01',
          bookingNumber: 'CP-2026-IND-9999',
          spaceName: 'Maple Leaf Condos Bay 08',
          customerName: 'Rajesh Nair',
          expectedPlate: 'KA 02 AB 1234',
          arrivingPlate: 'KA 02 AB 1234',
          slotNumber: 'Bay 08',
          result: 'unapproved_listing',
          statusLabel: 'UNAPPROVED LISTING',
          gateName: 'Gate 2',
          guardName: get().guard.name,
          incentiveCredited: 0,
          notes: 'Space is not approved by Society Committee. Entry unauthorized.',
          isDemoData: true,
        };

        set((state) => ({
          verificationLogs: [check, ...state.verificationLogs],
        }));
        break;
      }
    }

    return check;
  },

  recordExit: (movementId) =>
    set((state) => {
      const target = state.parkedVehicles.find((m) => m.id === movementId);
      if (!target) return state;

      const exitTime = new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      useAdminStore.getState().addAuditRecord({
        action: 'guest_entry_logged',
        actorName: state.guard.name,
        actorRole: 'Security Guard (Gate 2)',
        targetId: target.bookingNumber,
        targetDescription: `Vehicle ${target.vehiclePlate} exited premises at ${exitTime}`,
      });

      return {
        parkedVehicles: state.parkedVehicles.filter((m) => m.id !== movementId),
      };
    }),
}));
