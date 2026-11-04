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
  | '24_7_access';

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface ParkingOwner {
  id: string;
  name: string;
  avatarUrl?: string;
  rating: number;
  responseRatePercent: number;
  isVerified: boolean;
  communityName?: string;
}

export interface ParkingSpace {
  id: string;
  name: string;
  description: string;
  address: string;
  neighborhood: string;
  city: string;
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
  accessInstructions: string;
  securityGuardOnSite: boolean;
  guardVerificationReward?: number;
  owner: ParkingOwner;
  rules: string[];
}
