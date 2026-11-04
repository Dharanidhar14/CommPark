import { create } from 'zustand';
import { ParkingSpace, ApprovalStatus } from '../types/parking';
import { OwnerReservation, OwnerPayout } from '../types/owner';
import { MOCK_PARKING_SPACES } from '../constants/mockData';

interface OwnerState {
  listings: ParkingSpace[];
  reservations: OwnerReservation[];
  payouts: OwnerPayout[];
  totalEarnings: number;
  pendingEarnings: number;
  completedBookingsCount: number;
  occupancyRatePercent: number;

  // Actions
  addListing: (listing: Omit<ParkingSpace, 'id'>) => ParkingSpace;
  updateListing: (id: string, updates: Partial<ParkingSpace>) => void;
  toggleAvailability: (id: string) => void;
  simulateCommunityApproval: (id: string) => void;
  simulateCommunityRejection: (id: string, reason: string) => void;
}

const INITIAL_OWNER_LISTINGS: ParkingSpace[] = [
  {
    ...MOCK_PARKING_SPACES[0],
    id: 'own_sp_01',
    name: 'Greenwood Heights Resident Slot 14',
    approvalStatus: 'approved',
    communityInfo: {
      societyName: 'Greenwood Palms RWA',
      unitOrFlatNumber: 'Tower B, Flat 402',
      slotNumber: 'Basement P1 - Bay 14',
      associationContact: 'estate.manager@greenwood.in',
      submittedAt: '2026-10-15T10:00:00Z',
      approvedAt: '2026-10-16T14:30:00Z',
    },
    isAvailable: true,
  },
  {
    ...MOCK_PARKING_SPACES[1],
    id: 'own_sp_02',
    name: 'Defence Colony Private Gated Driveway',
    approvalStatus: 'approved',
    isAvailable: true,
  },
  {
    id: 'own_sp_03',
    name: 'Prestige Sunrise Park — Reserved Bay 22',
    description: 'Covered basement bay in gated apartment complex with 24/7 boom barrier. Suitable for electric cars and sedans.',
    address: 'Electronics City Phase 1, NeoTown Road',
    locality: 'Electronic City',
    neighborhood: 'Phase 1',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560100',
    coordinates: { latitude: 12.8452, longitude: 77.6602 },
    distanceKm: 8.2,
    category: 'residential',
    accessType: 'security_verified',
    pricePerHour: 35,
    pricePerDay: 220,
    currency: '₹',
    covered: true,
    supportedVehicles: ['sedan', 'suv', 'ev'],
    amenities: ['security_guard', 'cctv', 'covered', 'gated', '24_7_access'],
    images: [
      'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 0,
    reviewCount: 0,
    isAvailable: false,
    availableSpots: 0,
    totalSpots: 1,
    approvalStatus: 'pending_approval',
    communityInfo: {
      societyName: 'Prestige Sunrise Park Owners Association',
      unitOrFlatNumber: 'Block 3, Flat 804',
      slotNumber: 'Lower Basement Bay 22',
      associationContact: 'rwa@prestigesunrise.org',
      submittedAt: '2026-11-03T16:00:00Z',
    },
    accessInstructions: 'Security check mandatory at Gate 1. Guard scans booking QR code before barrier opens.',
    securityGuardOnSite: true,
    guardVerificationReward: 15,
    owner: {
      id: 'usr_sarah_01',
      name: 'Sarah Jenkins',
      rating: 4.95,
      responseRatePercent: 99,
      isVerified: true,
      communityName: 'Greenwood Heights RWA',
      joinedYear: 2024,
    },
    rules: ['Park strictly within yellow line', 'Max speed 10 km/h'],
    dimensions: { lengthMeters: 5.2, widthMeters: 2.6, heightClearanceMeters: 2.2 },
    operatingHours: '08:00 AM – 10:00 PM',
    nearbyLandmarks: ['Wipro Gate 5', 'Infosys Convention Center'],
    isDemoData: true,
  },
  {
    id: 'own_sp_04',
    name: 'Maple Leaf Condos Stilt Bay 08',
    description: 'Independent stilt slot in apartment community.',
    address: '4th Block, 80 Feet Road',
    locality: 'Koramangala',
    neighborhood: '4th Block',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560034',
    coordinates: { latitude: 12.9320, longitude: 77.6250 },
    distanceKm: 2.1,
    category: 'residential',
    accessType: 'security_verified',
    pricePerHour: 45,
    pricePerDay: 280,
    currency: '₹',
    covered: true,
    supportedVehicles: ['sedan', 'suv', 'ev'],
    amenities: ['covered', 'cctv'],
    images: [
      'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80',
    ],
    rating: 0,
    reviewCount: 0,
    isAvailable: false,
    availableSpots: 0,
    totalSpots: 1,
    approvalStatus: 'rejected',
    communityInfo: {
      societyName: 'Maple Leaf Residents Welfare Association',
      unitOrFlatNumber: 'Flat 101',
      slotNumber: 'Ground Stilt 08',
      submittedAt: '2026-10-20T11:00:00Z',
      rejectionReason: 'Tenant subleasing without written Landlord NOC is prohibited by Society Bylaw Section 14.',
    },
    accessInstructions: 'Entry requires verification.',
    securityGuardOnSite: true,
    owner: {
      id: 'usr_sarah_01',
      name: 'Sarah Jenkins',
      rating: 4.95,
      responseRatePercent: 99,
      isVerified: true,
    },
    rules: ['Speed limit 10 km/h'],
    dimensions: { lengthMeters: 5.0, widthMeters: 2.5 },
    operatingHours: '24 Hours',
    nearbyLandmarks: ['Sony World Signal'],
    isDemoData: true,
  },
];

const INITIAL_RESERVATIONS: OwnerReservation[] = [
  {
    id: 'res_own_01',
    spaceId: 'own_sp_01',
    spaceName: 'Greenwood Heights Resident Slot 14',
    customerName: 'Rahul Verma',
    vehiclePlate: 'KA 01 MJ 4821',
    vehicleModel: 'Tata Nexon EV (White)',
    slotNumber: 'Basement P1 - Bay 14',
    startTime: 'Today, 07:00 PM',
    endTime: 'Today, 11:00 PM',
    durationHours: 4,
    earningsAmount: 160.00,
    currency: '₹',
    status: 'upcoming',
    accessType: 'security_verified',
  },
  {
    id: 'res_own_02',
    spaceId: 'own_sp_02',
    spaceName: 'Defence Colony Private Gated Driveway',
    customerName: 'Ananya Iyer',
    vehiclePlate: 'KA 05 NE 3319',
    vehicleModel: 'Hyundai Creta (Silver)',
    slotNumber: 'Driveway Bay A',
    startTime: 'Tomorrow, 10:00 AM',
    endTime: 'Tomorrow, 04:00 PM',
    durationHours: 6,
    earningsAmount: 180.00,
    currency: '₹',
    status: 'upcoming',
    accessType: 'owner_assisted',
  },
  {
    id: 'res_own_03',
    spaceId: 'own_sp_01',
    spaceName: 'Greenwood Heights Resident Slot 14',
    customerName: 'Vikram Sen',
    vehiclePlate: 'MH 02 BP 9920',
    vehicleModel: 'MG ZS EV (Blue)',
    slotNumber: 'Basement P1 - Bay 14',
    startTime: 'Yesterday, 02:00 PM',
    endTime: 'Yesterday, 06:00 PM',
    durationHours: 4,
    earningsAmount: 160.00,
    currency: '₹',
    status: 'completed',
    accessType: 'security_verified',
  },
];

const INITIAL_PAYOUTS: OwnerPayout[] = [
  {
    id: 'pay_01',
    date: '02 Nov 2026',
    amount: 4200.00,
    currency: '₹',
    status: 'completed',
    method: 'IMPS Direct Bank Transfer',
    bankAccountLast4: '9012',
    utrReference: 'CP-PAY-2026-88192',
  },
  {
    id: 'pay_02',
    date: '25 Oct 2026',
    amount: 3850.00,
    currency: '₹',
    status: 'completed',
    method: 'IMPS Direct Bank Transfer',
    bankAccountLast4: '9012',
    utrReference: 'CP-PAY-2026-77210',
  },
  {
    id: 'pay_03',
    date: '15 Oct 2026',
    amount: 5400.00,
    currency: '₹',
    status: 'completed',
    method: 'IMPS Direct Bank Transfer',
    bankAccountLast4: '9012',
    utrReference: 'CP-PAY-2026-66104',
  },
];

export const useOwnerStore = create<OwnerState>((set) => ({
  listings: INITIAL_OWNER_LISTINGS,
  reservations: INITIAL_RESERVATIONS,
  payouts: INITIAL_PAYOUTS,
  totalEarnings: 18450.00,
  pendingEarnings: 340.00,
  completedBookingsCount: 48,
  occupancyRatePercent: 78,

  addListing: (newSpaceData) => {
    const newId = `own_sp_${Date.now()}`;
    const newListing: ParkingSpace = {
      ...newSpaceData,
      id: newId,
      ownerId: 'usr_sarah_01',
      rating: 0,
      reviewCount: 0,
      isDemoData: true,
      isAvailable: newSpaceData.approvalStatus === 'approved',
      availableSpots: newSpaceData.approvalStatus === 'approved' ? 1 : 0,
    };

    set((state) => ({
      listings: [newListing, ...state.listings],
    }));

    return newListing;
  },

  updateListing: (id, updates) =>
    set((state) => ({
      listings: state.listings.map((l) =>
        l.id === id ? { ...l, ...updates } : l
      ),
    })),

  toggleAvailability: (id) =>
    set((state) => ({
      listings: state.listings.map((l) => {
        if (l.id !== id) return l;
        // Do not allow toggling to available if unapproved
        if (l.approvalStatus !== 'approved' && !l.isAvailable) {
          return l;
        }
        return {
          ...l,
          isAvailable: !l.isAvailable,
          availableSpots: !l.isAvailable ? l.totalSpots : 0,
        };
      }),
    })),

  simulateCommunityApproval: (id) =>
    set((state) => ({
      listings: state.listings.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          approvalStatus: 'approved' as ApprovalStatus,
          isAvailable: true,
          availableSpots: l.totalSpots || 1,
          communityInfo: l.communityInfo
            ? {
                ...l.communityInfo,
                approvedAt: new Date().toISOString(),
              }
            : undefined,
        };
      }),
    })),

  simulateCommunityRejection: (id, reason) =>
    set((state) => ({
      listings: state.listings.map((l) => {
        if (l.id !== id) return l;
        return {
          ...l,
          approvalStatus: 'rejected' as ApprovalStatus,
          isAvailable: false,
          availableSpots: 0,
          communityInfo: l.communityInfo
            ? {
                ...l.communityInfo,
                rejectionReason: reason,
              }
            : undefined,
        };
      }),
    })),
}));
