import {
  IParkingRepository,
  ParkingListingEntity,
  ParkingFilterQuery,
  ListingApprovalStatus,
} from '../IParkingRepository';

export class MemoryParkingRepository implements IParkingRepository {
  private listings: Map<string, ParkingListingEntity> = new Map();

  constructor(initialListings: ParkingListingEntity[] = []) {
    for (const l of initialListings) {
      this.listings.set(l.id, { ...l });
    }
  }

  async findById(id: string): Promise<ParkingListingEntity | null> {
    const l = this.listings.get(id);
    return l ? { ...l } : null;
  }

  async findAll(filter?: ParkingFilterQuery): Promise<ParkingListingEntity[]> {
    let result = Array.from(this.listings.values());

    if (!filter) {
      return result.map((l) => ({ ...l }));
    }

    if (filter.query) {
      const q = filter.query.toLowerCase().trim();
      result = result.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q) ||
          l.locality.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          (l.neighborhood && l.neighborhood.toLowerCase().includes(q))
      );
    }

    if (filter.locality) {
      const loc = filter.locality.toLowerCase().trim();
      result = result.filter((l) => l.locality.toLowerCase().includes(loc));
    }

    if (filter.category) {
      result = result.filter((l) => l.category === filter.category);
    }

    if (filter.accessType) {
      result = result.filter((l) => l.accessType === filter.accessType);
    }

    if (filter.supportedVehicle) {
      result = result.filter((l) =>
        l.supportedVehicles.includes(filter.supportedVehicle!)
      );
    }

    if (filter.isCovered !== undefined) {
      result = result.filter((l) => l.isCovered === filter.isCovered);
    }

    if (filter.maxPrice !== undefined) {
      result = result.filter((l) => l.pricePerHour <= filter.maxPrice!);
    }

    if (filter.approvalStatus) {
      result = result.filter((l) => l.approvalStatus === filter.approvalStatus);
    }

    if (filter.onlyAvailable) {
      result = result.filter((l) => l.isAvailable && l.availableSpots > 0);
    }

    return result.map((l) => ({ ...l }));
  }

  async findByOwnerId(ownerId: string): Promise<ParkingListingEntity[]> {
    return Array.from(this.listings.values())
      .filter((l) => l.ownerId === ownerId)
      .map((l) => ({ ...l }));
  }

  async findByCommunityId(communityId: string): Promise<ParkingListingEntity[]> {
    return Array.from(this.listings.values())
      .filter((l) => l.communityId === communityId)
      .map((l) => ({ ...l }));
  }

  async create(
    data: Omit<ParkingListingEntity, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>
  ): Promise<ParkingListingEntity> {
    const id = `space_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const listing: ParkingListingEntity = {
      ...data,
      id,
      rating: 0,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.listings.set(id, listing);
    return { ...listing };
  }

  async update(id: string, updates: Partial<ParkingListingEntity>): Promise<ParkingListingEntity | null> {
    const existing = this.listings.get(id);
    if (!existing) return null;
    const updated: ParkingListingEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.listings.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.listings.delete(id);
  }

  async updateApprovalStatus(
    id: string,
    status: ListingApprovalStatus
  ): Promise<ParkingListingEntity | null> {
    const existing = this.listings.get(id);
    if (!existing) return null;
    const updated: ParkingListingEntity = {
      ...existing,
      approvalStatus: status,
      isAvailable: status === 'APPROVED',
      updatedAt: new Date(),
    };
    this.listings.set(id, updated);
    return { ...updated };
  }
}
