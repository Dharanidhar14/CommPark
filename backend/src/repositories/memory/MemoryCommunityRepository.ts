import {
  ICommunityRepository,
  CommunityEntity,
  CommunityApprovalEntity,
  CommunityMembershipEntity,
} from '../ICommunityRepository';

export class MemoryCommunityRepository implements ICommunityRepository {
  private communities: Map<string, CommunityEntity> = new Map();
  private approvals: Map<string, CommunityApprovalEntity> = new Map();
  private memberships: Map<string, CommunityMembershipEntity> = new Map();

  constructor(
    initialCommunities: CommunityEntity[] = [],
    initialApprovals: CommunityApprovalEntity[] = [],
    initialMemberships: CommunityMembershipEntity[] = []
  ) {
    for (const c of initialCommunities) {
      this.communities.set(c.id, { ...c });
    }
    for (const a of initialApprovals) {
      this.approvals.set(a.id, { ...a });
    }
    for (const m of initialMemberships) {
      const key = `${m.communityId}_${m.userId}`;
      this.memberships.set(key, { ...m });
    }
  }

  async findById(id: string): Promise<CommunityEntity | null> {
    const c = this.communities.get(id);
    return c ? { ...c } : null;
  }

  async findAll(): Promise<CommunityEntity[]> {
    return Array.from(this.communities.values()).map((c) => ({ ...c }));
  }

  async create(data: Omit<CommunityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunityEntity> {
    const id = `comm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const community: CommunityEntity = {
      ...data,
      id,
      createdAt: now,
      updatedAt: now,
    };
    this.communities.set(id, community);
    return { ...community };
  }

  async findApprovalsByCommunityId(communityId: string): Promise<CommunityApprovalEntity[]> {
    return Array.from(this.approvals.values())
      .filter((a) => a.communityId === communityId)
      .map((a) => ({ ...a }));
  }

  async findApprovalById(approvalId: string): Promise<CommunityApprovalEntity | null> {
    const a = this.approvals.get(approvalId);
    return a ? { ...a } : null;
  }

  async createApprovalRequest(listingId: string, communityId: string): Promise<CommunityApprovalEntity> {
    const id = `appr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const approval: CommunityApprovalEntity = {
      id,
      listingId,
      communityId,
      status: 'PENDING_APPROVAL',
      reviewedById: null,
      rejectionReason: null,
      submittedAt: now,
      approvedAt: null,
      createdAt: now,
      updatedAt: now,
    };
    this.approvals.set(id, approval);
    return { ...approval };
  }

  async processApproval(
    approvalId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewedById: string,
    rejectionReason?: string
  ): Promise<CommunityApprovalEntity | null> {
    const existing = this.approvals.get(approvalId);
    if (!existing) return null;

    const now = new Date();
    const updated: CommunityApprovalEntity = {
      ...existing,
      status,
      reviewedById,
      rejectionReason: rejectionReason || null,
      approvedAt: status === 'APPROVED' ? now : null,
      updatedAt: now,
    };
    this.approvals.set(approvalId, updated);
    return { ...updated };
  }

  async getMembership(communityId: string, userId: string): Promise<CommunityMembershipEntity | null> {
    const key = `${communityId}_${userId}`;
    const m = this.memberships.get(key);
    return m ? { ...m } : null;
  }

  async setMembershipStatus(communityId: string, userId: string, isAuthorized: boolean): Promise<boolean> {
    const key = `${communityId}_${userId}`;
    const existing = this.memberships.get(key);
    if (!existing) return false;
    existing.isAuthorized = isAuthorized;
    existing.updatedAt = new Date();
    this.memberships.set(key, existing);
    return true;
  }
}
