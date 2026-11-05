import {
  ICommunityRepository,
  CommunityEntity,
  CommunityApprovalEntity,
} from '../repositories/ICommunityRepository';
import { IParkingRepository } from '../repositories/IParkingRepository';
import { IAuditRepository } from '../repositories/IAuditRepository';
import { IUserRepository } from '../repositories/IUserRepository';

export class CommunityService {
  constructor(
    private communityRepo: ICommunityRepository,
    private parkingRepo: IParkingRepository,
    private auditRepo: IAuditRepository,
    private userRepo: IUserRepository
  ) {}

  async getCommunities(): Promise<CommunityEntity[]> {
    return this.communityRepo.findAll();
  }

  async getCommunityById(id: string): Promise<CommunityEntity | null> {
    return this.communityRepo.findById(id);
  }

  async getPendingApprovals(communityId: string): Promise<CommunityApprovalEntity[]> {
    const list = await this.communityRepo.findApprovalsByCommunityId(communityId);
    return list.filter((a) => a.status === 'PENDING_APPROVAL');
  }

  async processApproval(
    approvalId: string,
    status: 'APPROVED' | 'REJECTED',
    adminId: string,
    reason?: string
  ): Promise<CommunityApprovalEntity> {
    const admin = await this.userRepo.findById(adminId);
    if (!admin) {
      throw new Error('Admin user not found.');
    }

    const updated = await this.communityRepo.processApproval(
      approvalId,
      status,
      adminId,
      reason
    );

    if (!updated) {
      throw new Error('Approval request not found.');
    }

    // Also ensure listing status is updated
    await this.parkingRepo.updateApprovalStatus(updated.listingId, status);

    // Record audit log
    await this.auditRepo.create({
      action: status === 'APPROVED' ? 'LISTING_APPROVED' : 'LISTING_REJECTED',
      actorId: admin.id,
      actorName: admin.name,
      actorRole: admin.activeRole,
      targetId: updated.listingId,
      targetDescription: `Parking listing ${updated.listingId}`,
      details: reason || (status === 'APPROVED' ? 'RWA committee approval granted' : 'Rejected by RWA committee'),
      isDemoRecord: false,
    });

    return updated;
  }
}
