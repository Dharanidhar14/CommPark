export type Role = 'CUSTOMER' | 'OWNER' | 'SECURITY' | 'COMMUNITY_ADMIN';

export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  avatarUrl?: string | null;
  activeRole: Role;
  eligibleRoles: Role[];
  city: string;
  verificationStatus: string;
  memberSince: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  name: string;
  phone: string;
  city?: string;
  activeRole?: Role;
  eligibleRoles?: Role[];
}

export interface IUserRepository {
  findById(id: string): Promise<UserEntity | null>;
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
  update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null>;
  delete(id: string): Promise<boolean>;
}
