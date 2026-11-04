export type UserRole =
  | 'customer'
  | 'owner'
  | 'security'
  | 'community_admin';

export interface UserWallet {
  balance: number;
  currency: string;
  earnedAsOwner: number;
  earnedAsSecurityGuard: number;
  pendingWithdrawals: number;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  activeRole: UserRole;
  eligibleRoles: UserRole[];
  communityId?: string;
  communityName?: string;
  city: string;
  wallet: UserWallet;
  ratingAsCustomer: number;
  ratingAsOwner?: number;
  totalBookingsCount: number;
  totalListingsCount: number;
  isDemoProfile: boolean;
}
