import {
  PrismaClient,
  ParkingCategoryType,
  AccessMethod,
  ListingApprovalStatus,
  VehicleCategory,
} from '@prisma/client';
import {
  IParkingRepository,
  ParkingListingEntity,
  ParkingFilterQuery,
  ParkingCategory,
  AccessMethod as RepAccessMethod,
  ListingApprovalStatus as RepApprovalStatus,
} from '../IParkingRepository';

export class PrismaParkingRepository implements IParkingRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToEntity(item: any): ParkingListingEntity {
    return {
      id: item.id,
      ownerId: item.ownerId,
      name: item.name,
      description: item.description,
      address: item.address,
      locality: item.locality,
      neighborhood: item.neighborhood,
      city: item.city,
      state: item.state,
      postalCode: item.postalCode,
      latitude: item.latitude,
      longitude: item.longitude,
      category: item.category as ParkingCategory,
      accessType: item.accessType as RepAccessMethod,
      pricePerHour: Number(item.pricePerHour),
      pricePerDay: Number(item.pricePerDay),
      currency: item.currency,
      isCovered: item.isCovered,
      supportedVehicles: item.supportedVehicles,
      amenities: item.amenities,
      isAvailable: item.isAvailable,
      totalSpots: item.totalSpots,
      availableSpots: item.availableSpots,
      approvalStatus: item.approvalStatus as RepApprovalStatus,
      communityId: item.communityId,
      unitNumber: item.unitNumber,
      slotNumber: item.slotNumber,
      accessInstructions: item.accessInstructions,
      securityGuardOnSite: item.securityGuardOnSite,
      operatingHours: item.operatingHours,
      rating: Number(item.rating),
      reviewCount: item.reviewCount,
      images: item.images ? item.images.map((img: any) => img.imageUrl) : [],
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async findById(id: string): Promise<ParkingListingEntity | null> {
    const item = await this.prisma.parkingListing.findUnique({
      where: { id },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    });
    return item ? this.mapToEntity(item) : null;
  }

  async findAll(filter?: ParkingFilterQuery): Promise<ParkingListingEntity[]> {
    const where: any = {};

    if (filter) {
      if (filter.locality) {
        where.locality = { contains: filter.locality, mode: 'insensitive' };
      }
      if (filter.category) {
        where.category = filter.category as ParkingCategoryType;
      }
      if (filter.accessType) {
        where.accessType = filter.accessType as AccessMethod;
      }
      if (filter.supportedVehicle) {
        where.supportedVehicles = { has: filter.supportedVehicle as VehicleCategory };
      }
      if (filter.isCovered !== undefined) {
        where.isCovered = filter.isCovered;
      }
      if (filter.city) {
        where.city = { contains: filter.city, mode: 'insensitive' };
      }
      if (filter.minPrice !== undefined) {
        where.pricePerHour = { ...(where.pricePerHour || {}), gte: filter.minPrice };
      }
      if (filter.maxPrice !== undefined) {
        where.pricePerHour = { ...(where.pricePerHour || {}), lte: filter.maxPrice };
      }
      if (
        filter.minLat !== undefined &&
        filter.maxLat !== undefined &&
        filter.minLng !== undefined &&
        filter.maxLng !== undefined
      ) {
        where.latitude = { gte: filter.minLat, lte: filter.maxLat };
        where.longitude = { gte: filter.minLng, lte: filter.maxLng };
      }
      if (filter.approvalStatus) {
        where.approvalStatus = filter.approvalStatus as ListingApprovalStatus;
      }
      if (filter.onlyAvailable) {
        where.isAvailable = true;
        where.availableSpots = { gt: 0 };
      }
      if (filter.query) {
        where.OR = [
          { name: { contains: filter.query, mode: 'insensitive' } },
          { description: { contains: filter.query, mode: 'insensitive' } },
          { locality: { contains: filter.query, mode: 'insensitive' } },
          { address: { contains: filter.query, mode: 'insensitive' } },
        ];
      }
    }

    const items = await this.prisma.parkingListing.findMany({
      where,
      include: { images: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    let results = items.map((i) => this.mapToEntity(i));

    if (filter?.latitude !== undefined && filter?.longitude !== undefined) {
      const targetLat = filter.latitude;
      const targetLng = filter.longitude;
      const radius = filter.radiusKm ?? 50;

      const withDistances = results.map((l) => {
        const dLat = ((l.latitude - targetLat) * Math.PI) / 180;
        const dLon = ((l.longitude - targetLng) * Math.PI) / 180;
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos((targetLat * Math.PI) / 180) *
            Math.cos((l.latitude * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distanceKm = 6371 * c;
        return { item: l, distanceKm };
      });

      results = withDistances
        .filter((entry) => entry.distanceKm <= radius)
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .map((entry) => entry.item);
    }

    return results;
  }

  async findByOwnerId(ownerId: string): Promise<ParkingListingEntity[]> {
    const items = await this.prisma.parkingListing.findMany({
      where: { ownerId },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((i) => this.mapToEntity(i));
  }

  async findByCommunityId(communityId: string): Promise<ParkingListingEntity[]> {
    const items = await this.prisma.parkingListing.findMany({
      where: { communityId },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((i) => this.mapToEntity(i));
  }

  async create(
    data: Omit<ParkingListingEntity, 'id' | 'createdAt' | 'updatedAt' | 'rating' | 'reviewCount'>
  ): Promise<ParkingListingEntity> {
    const { images, ...rest } = data;
    const item = await this.prisma.parkingListing.create({
      data: {
        ...rest,
        category: rest.category as ParkingCategoryType,
        accessType: rest.accessType as AccessMethod,
        approvalStatus: rest.approvalStatus as ListingApprovalStatus,
        supportedVehicles: rest.supportedVehicles as VehicleCategory[],
        images: images && images.length > 0 ? {
          create: images.map((url, idx) => ({
            imageUrl: url,
            displayOrder: idx,
          })),
        } : undefined,
      },
      include: { images: { orderBy: { displayOrder: 'asc' } } },
    });
    return this.mapToEntity(item);
  }

  async update(id: string, updates: Partial<ParkingListingEntity>): Promise<ParkingListingEntity | null> {
    try {
      const data: any = { ...updates };
      delete data.id;
      delete data.images;
      delete data.createdAt;
      delete data.updatedAt;

      const item = await this.prisma.parkingListing.update({
        where: { id },
        data,
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      });
      return this.mapToEntity(item);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.parkingListing.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }

  async updateApprovalStatus(
    id: string,
    status: RepApprovalStatus
  ): Promise<ParkingListingEntity | null> {
    try {
      const item = await this.prisma.parkingListing.update({
        where: { id },
        data: {
          approvalStatus: status as ListingApprovalStatus,
          isAvailable: status === 'APPROVED',
        },
        include: { images: { orderBy: { displayOrder: 'asc' } } },
      });
      return this.mapToEntity(item);
    } catch {
      return null;
    }
  }
}
