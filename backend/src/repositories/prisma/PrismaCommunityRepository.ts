import { PrismaClient, ListingApprovalStatus } from '@prisma/client';
import {
  ICommunityRepository,
  CommunityEntity,
  CommunityApprovalEntity,
  CommunityMembershipEntity,
  CommunityRole,
} from '../ICommunityRepository';
import { ListingApprovalStatus as RepApprovalStatus } from '../IParkingRepository';

export class PrismaCommunityRepository implements ICommunityRepository {
  constructor(private prisma: PrismaClient) {}

  private mapCommunityToEntity(c: any): CommunityEntity {
    return {
      id: c.id,
      name: c.name,
      locality: c.locality,
      city: c.city,
      totalResidentialUnits: c.totalResidentialUnits,
      totalRegisteredBays: c.totalRegisteredBays,
      rwaRegistrationNumber: c.rwaRegistrationNumber,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    };
  }

  private mapApprovalToEntity(a: any): CommunityApprovalEntity {
    return {
      id: a.id,
      listingId: a.listingId,
      communityId: a.communityId,
      status: a.status as RepApprovalStatus,
      reviewedById: a.reviewedById,
      rejectionReason: a.rejectionReason,
      submittedAt: a.submittedAt,
      approvedAt: a.approvedAt,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
    };
  }

  private mapMembershipToEntity(m: any): CommunityMembershipEntity {
    return {
      id: m.id,
      communityId: m.communityId,
      userId: m.userId,
      role: m.role as CommunityRole,
      unitOrFlatNumber: m.unitOrFlatNumber,
      assignedGate: m.assignedGate,
      isAuthorized: m.isAuthorized,
      createdAt: m.createdAt,
      updatedAt: m.updatedAt,
    };
  }

  async findById(id: string): Promise<CommunityEntity | null> {
    const c = await this.prisma.community.findUnique({ where: { id } });
    return c ? this.mapCommunityToEntity(c) : null;
  }

  async findAll(): Promise<CommunityEntity[]> {
    const items = await this.prisma.community.findMany({
      orderBy: { name: 'asc' },
    });
    return items.map((c) => this.mapCommunityToEntity(c));
  }

  async create(data: Omit<CommunityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunityEntity> {
    const c = await this.prisma.community.create({ data });
    return this.mapCommunityToEntity(c);
  }

  async findApprovalsByCommunityId(communityId: string): Promise<CommunityApprovalEntity[]> {
    const items = await this.prisma.communityApproval.findMany({
      where: { communityId },
      orderBy: { submittedAt: 'desc' },
    });
    return items.map((a) => this.mapApprovalToEntity(a));
  }

  async findApprovalById(approvalId: string): Promise<CommunityApprovalEntity | null> {
    const a = await this.prisma.communityApproval.findUnique({ where: { id: approvalId } });
    return a ? this.mapApprovalToEntity(a) : null;
  }

  async createApprovalRequest(listingId: string, communityId: string): Promise<CommunityApprovalEntity> {
    const a = await this.prisma.communityApproval.create({
      data: {
        listingId,
        communityId,
        status: ListingApprovalStatus.PENDING_APPROVAL,
      },
    });
    return this.mapApprovalToEntity(a);
  }

  async processApproval(
    approvalId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewedById: string,
    rejectionReason?: string
  ): Promise<CommunityApprovalEntity | null> {
    try {
      const now = new Date();
      const a = await this.prisma.communityApproval.update({
        where: { id: approvalId },
        data: {
          status: status as ListingApprovalStatus,
          reviewedById,
          rejectionReason: rejectionReason || null,
          approvedAt: status === 'APPROVED' ? now : null,
        },
      });

      // Also update the associated listing status
      await this.prisma.parkingListing.update({
        where: { id: a.listingId },
        data: {
          approvalStatus: status as ListingApprovalStatus,
          isAvailable: status === 'APPROVED',
        },
      });

      return this.mapApprovalToEntity(a);
    } catch {
      return null;
    }
  }

  async getMembership(communityId: string, userId: string): Promise<CommunityMembershipEntity | null> {
    const m = await this.prisma.communityMembership.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
    });
    return m ? this.mapMembershipToEntity(m) : null;
  }

  async setMembershipStatus(communityId: string, userId: string, isAuthorized: boolean): Promise<boolean> {
    try {
      await this.prisma.communityMembership.update({
        where: {
          communityId_userId: {
            communityId,
            userId,
          },
        },
        data: { isAuthorized },
      });
      return true;
    } catch {
      return false;
    }
  }
}
