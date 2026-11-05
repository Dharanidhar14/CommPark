import { ListingApprovalStatus } from './IParkingRepository';

export interface CommunityEntity {
  id: string;
  name: string;
  locality: string;
  city: string;
  totalResidentialUnits: number;
  totalRegisteredBays: number;
  rwaRegistrationNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunityApprovalEntity {
  id: string;
  listingId: string;
  communityId: string;
  status: ListingApprovalStatus;
  reviewedById?: string | null;
  rejectionReason?: string | null;
  submittedAt: Date;
  approvedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommunityRepository {
  findById(id: string): Promise<CommunityEntity | null>;
  findAll(): Promise<CommunityEntity[]>;
  create(data: Omit<CommunityEntity, 'id' | 'createdAt' | 'updatedAt'>): Promise<CommunityEntity>;
  findApprovalsByCommunityId(communityId: string): Promise<CommunityApprovalEntity[]>;
  createApprovalRequest(listingId: string, communityId: string): Promise<CommunityApprovalEntity>;
  processApproval(
    approvalId: string,
    status: 'APPROVED' | 'REJECTED',
    reviewedById: string,
    rejectionReason?: string
  ): Promise<CommunityApprovalEntity | null>;
}
