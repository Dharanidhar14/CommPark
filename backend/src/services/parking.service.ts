import {
  IParkingRepository,
  ParkingListingEntity,
  ParkingFilterQuery,
  ParkingCategory,
  AccessMethod,
} from '../repositories/IParkingRepository';
import { ICommunityRepository } from '../repositories/ICommunityRepository';
import { IBookingRepository } from '../repositories/IBookingRepository';
import { VehicleCategory } from '../repositories/IVehicleRepository';

export interface CreateListingDTO {
  name: string;
  description: string;
  address: string;
  locality: string;
  neighborhood?: string;
  city: string;
  state?: string;
  postalCode: string;
  latitude: number;
  longitude: number;
  category: ParkingCategory;
  accessType: AccessMethod;
  pricePerHour: number;
  pricePerDay: number;
  isCovered?: boolean;
  supportedVehicles?: VehicleCategory[];
  amenities?: string[];
  totalSpots?: number;
  communityId?: string;
  unitNumber?: string;
  slotNumber?: string;
  accessInstructions?: string;
  securityGuardOnSite?: boolean;
  operatingHours?: string;
  images?: string[];
}

export class ParkingService {
  constructor(
    private parkingRepo: IParkingRepository,
    private communityRepo: ICommunityRepository,
    private bookingRepo: IBookingRepository
  ) {}

  async getListings(
    filter?: ParkingFilterQuery,
    isAdminOrOwner: boolean = false
  ): Promise<ParkingListingEntity[]> {
    const finalFilter: ParkingFilterQuery = { ...filter };
    if (!isAdminOrOwner && !finalFilter.approvalStatus) {
      finalFilter.approvalStatus = 'APPROVED';
    }
    return this.parkingRepo.findAll(finalFilter);
  }

  async getListingById(id: string): Promise<ParkingListingEntity | null> {
    return this.parkingRepo.findById(id);
  }

  async getOwnerListings(ownerId: string): Promise<ParkingListingEntity[]> {
    return this.parkingRepo.findByOwnerId(ownerId);
  }

  async createListing(
    ownerId: string,
    data: CreateListingDTO
  ): Promise<ParkingListingEntity> {
    const isCommunityApartment =
      data.category === 'RESIDENTIAL' || Boolean(data.communityId);

    const approvalStatus = isCommunityApartment ? 'PENDING_APPROVAL' : 'APPROVED';
    const isAvailable = !isCommunityApartment;

    const listing = await this.parkingRepo.create({
      ownerId,
      name: data.name,
      description: data.description,
      address: data.address,
      locality: data.locality,
      neighborhood: data.neighborhood || null,
      city: data.city,
      state: data.state || 'Karnataka',
      postalCode: data.postalCode,
      latitude: data.latitude,
      longitude: data.longitude,
      category: data.category,
      accessType: data.accessType,
      pricePerHour: data.pricePerHour,
      pricePerDay: data.pricePerDay,
      currency: '₹',
      isCovered: data.isCovered ?? false,
      supportedVehicles: data.supportedVehicles || ['SEDAN', 'SUV', 'HATCHBACK'],
      amenities: data.amenities || [],
      isAvailable,
      totalSpots: data.totalSpots || 1,
      availableSpots: isAvailable ? data.totalSpots || 1 : 0,
      approvalStatus,
      communityId: data.communityId || null,
      unitNumber: data.unitNumber || null,
      slotNumber: data.slotNumber || null,
      accessInstructions: data.accessInstructions || null,
      securityGuardOnSite: data.securityGuardOnSite ?? false,
      operatingHours: data.operatingHours || '24/7 Access',
      images: data.images || [],
    });

    // If community approval is required, create the approval request
    if (isCommunityApartment && data.communityId) {
      await this.communityRepo.createApprovalRequest(listing.id, data.communityId);
    }

    return listing;
  }

  async updateListing(
    id: string,
    ownerId: string,
    updates: Partial<ParkingListingEntity>
  ): Promise<ParkingListingEntity> {
    const existing = await this.parkingRepo.findById(id);
    if (!existing) {
      throw new Error('Parking listing not found.');
    }
    if (existing.ownerId !== ownerId) {
      throw new Error('Unauthorized to update this listing.');
    }

    const updated = await this.parkingRepo.update(id, updates);
    if (!updated) {
      throw new Error('Failed to update listing.');
    }
    return updated;
  }

  async deleteListing(id: string, ownerId: string): Promise<boolean> {
    const existing = await this.parkingRepo.findById(id);
    if (!existing) {
      throw new Error('Parking listing not found.');
    }
    if (existing.ownerId !== ownerId) {
      throw new Error('Unauthorized to delete this listing.');
    }

    // Check for active or upcoming bookings
    const bookings = await this.bookingRepo.findByListingId(id);
    const hasActiveBookings = bookings.some(
      (b) => b.status === 'UPCOMING' || b.status === 'ACTIVE'
    );
    if (hasActiveBookings) {
      throw new Error(
        'Cannot delete listing with active or upcoming reservations. Please cancel or fulfill them first.'
      );
    }

    return this.parkingRepo.delete(id);
  }
}
