import { IUserRepository, UserEntity, CreateUserData } from '../IUserRepository';

export class MemoryUserRepository implements IUserRepository {
  private users: Map<string, UserEntity> = new Map();

  constructor(initialUsers: UserEntity[] = []) {
    for (const u of initialUsers) {
      this.users.set(u.id, { ...u });
    }
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = this.users.get(id);
    return user ? { ...user } : null;
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const lower = email.toLowerCase().trim();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === lower) {
        return { ...user };
      }
    }
    return null;
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const id = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date();
    const newUser: UserEntity = {
      id,
      email: data.email.toLowerCase().trim(),
      passwordHash: data.passwordHash,
      name: data.name,
      phone: data.phone,
      avatarUrl: null,
      activeRole: data.activeRole || 'CUSTOMER',
      eligibleRoles: data.eligibleRoles || ['CUSTOMER'],
      city: data.city || 'Bengaluru',
      verificationStatus: 'PENDING',
      memberSince: 'Just now',
      createdAt: now,
      updatedAt: now,
    };
    this.users.set(id, newUser);
    return { ...newUser };
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    const existing = this.users.get(id);
    if (!existing) return null;
    const updated: UserEntity = {
      ...existing,
      ...updates,
      updatedAt: new Date(),
    };
    this.users.set(id, updated);
    return { ...updated };
  }

  async delete(id: string): Promise<boolean> {
    return this.users.delete(id);
  }
}
