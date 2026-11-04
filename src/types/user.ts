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

export interface SavedPlace {
  id: string;
  label: 'Home' | 'Office' | 'College' | 'Gym' | 'Custom';
  customName?: string;
  address: string;
  locality: string;
  city: string;
  coordinates: { latitude: number; longitude: number };
}

export interface UserPreferences {
  language: string;
  preferredVehicleId?: string;
  notificationToggles: {
    bookingConfirmations: boolean;
    bookingReminders: boolean;
    paymentUpdates: boolean;
    listingActivity: boolean;
    communityUpdates: boolean;
    promotional: boolean;
  };
  privacySettings: {
    sharePlateWithGuards: boolean;
    showProfilePhotoToHosts: boolean;
    shareContactWithOwners: boolean;
  };
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
  memberSince: string;
  verificationStatus: 'verified' | 'pending' | 'unverified';
  savedPlaces: SavedPlace[];
  preferences: UserPreferences;
  isDemoProfile: boolean;
}
