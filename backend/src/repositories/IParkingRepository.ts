import { VehicleCategory } from './IVehicleRepository';

export type ParkingCategory = 'RESIDENTIAL' | 'DRIVEWAY' | 'STREET_BAY' | 'COMMERCIAL';
export type AccessMethod = 'SECURITY_VERIFIED' | 'OWNER_ASSISTED' | 'DIRECT_ACCESS' | 'FACILITY_MANAGED';
export type ListingApprovalStatus = 'SUBMITTED' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface ParkingListingEntity {
  id: string;
  ownerId: string;
  name: string;
  description: string;
  address: string;
  locality: string;
  neighborhood?: string | null;
  city: string;
  state: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  category: ParkingCategory;
  accessType: AccessMethod;
  pricePerHour: number;
  pricePerDay: number;
  currency: string;
  isCovered: boolean;
  supportedVehicles: VehicleCategory[];
  amenities: string[];
  isAvailable: boolean;
  totalSpots: number;
  availableSpots: number;
  approvalStatus: ListingApprovalStatus;
  communityId?: string | null;
  unitNumber?: string | null;
  slotNumber?: string | null;
  accessInstructions?: string | null;
  securityGuardOnSite: boolean;
  operatingHours: string;
  rating: number;
  reviewCount: number;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ParkingFilterQuery {
  query?: string;
  locality?: string;
  category?: ParkingCategory;
  accessType?: AccessMethod;
  supportedVehicle?: VehicleCategory;
  isCovered?: boolean;
  maxPrice?: number;
  approvalStatus?: ListingApprovalStatus;
  onlyAvailable?: boolean;
}

export interface IParkingRepository {
  findById(id: string): Promise<ParkingListingEntity | null>;
  findAll(filter?: ParkingFilterQuery): Promise<ParkingListingEntity[]>;
  findByOwnerId(ownerId: string): Promise<ParkingListingEntity[]>;
  findByCommunityId(communityId: string): Promise<ParkingListingEntity[]>;
  create(data: Omit<ParkingListingEntity, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>): Promise<ParkingListingEntity>;
  update(id: string, updates: Partial<ParkingListingEntity>): Promise<ParkingListingEntity | null>;
  delete(id: string): Promise<boolean>;
  updateApprovalStatus(id: string, status: ListingApprovalStatus): Promise<ParkingListingEntity | null>;
}
