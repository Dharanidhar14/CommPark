export type AccessType =
  | 'security_verified'
  | 'owner_assisted'
  | 'direct_access'
  | 'facility_managed';

export type ParkingCategory =
  | 'residential'
  | 'driveway'
  | 'street_bay'
  | 'commercial';

export type VehicleType =
  | 'sedan'
  | 'suv'
  | 'ev'
  | 'hatchback'
  | 'motorcycle'
  | 'van';

export type Amenity =
  | 'security_guard'
  | 'cctv'
  | 'ev_charging'
  | 'covered'
  | 'accessible'
  | 'gated'
  | 'paved'
  | '24_7_access'
  | 'water_wash';

export type ApprovalStatus =
  | 'submitted'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'suspended';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface CommunityApprovalInfo {
  societyName: string;
  unitOrFlatNumber: string;
  slotNumber: string;
  associationContact?: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectionReason?: string;
}

export interface ParkingOwner {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  responseRatePercent: number;
  isVerified: boolean;
  communityName?: string;
  joinedYear?: number;
}

export interface SpaceDimensions {
  lengthMeters: number;
  widthMeters: number;
  heightClearanceMeters?: number;
}

export interface ParkingSpace {
  id: string;
  name: string;
  description: string;
  address: string;
  locality: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  coordinates: Coordinates;
  distanceKm: number;
  category: ParkingCategory;
  accessType: AccessType;
  pricePerHour: number;
  pricePerDay: number;
  currency: string;
  covered: boolean;
  supportedVehicles: VehicleType[];
  amenities: Amenity[];
  images: string[];
  rating: number;
  reviewCount: number;
  isAvailable: boolean;
  availableSpots: number;
  totalSpots: number;
  approvalStatus: ApprovalStatus;
  communityInfo?: CommunityApprovalInfo;
  accessInstructions: string;
  securityGuardOnSite: boolean;
  guardVerificationReward?: number;
  ownerId?: string;
  owner: ParkingOwner;
  rules: string[];
  dimensions: SpaceDimensions;
  operatingHours: string;
  nearbyLandmarks: string[];
  isDemoData: boolean;
}
