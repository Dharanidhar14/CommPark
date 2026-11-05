import { PrismaClient, Role as PrismaRole } from '@prisma/client';
import { IUserRepository, UserEntity, CreateUserData, Role } from '../IUserRepository';

export class PrismaUserRepository implements IUserRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) return null;
    return {
      ...user,
      activeRole: user.activeRole as Role,
      eligibleRoles: user.eligibleRoles as Role[],
    };
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) return null;
    return {
      ...user,
      activeRole: user.activeRole as Role,
      eligibleRoles: user.eligibleRoles as Role[],
    };
  }

  async create(data: CreateUserData): Promise<UserEntity> {
    const user = await this.prisma.user.create({
      data: {
        email: data.email.toLowerCase().trim(),
        passwordHash: data.passwordHash,
        name: data.name,
        phone: data.phone,
        city: data.city || 'Bengaluru',
        activeRole: (data.activeRole as PrismaRole) || PrismaRole.CUSTOMER,
        eligibleRoles: (data.eligibleRoles as PrismaRole[]) || [PrismaRole.CUSTOMER],
        verificationStatus: 'PENDING',
        memberSince: 'Just now',
      },
    });
    return {
      ...user,
      activeRole: user.activeRole as Role,
      eligibleRoles: user.eligibleRoles as Role[],
    };
  }

  async update(id: string, updates: Partial<UserEntity>): Promise<UserEntity | null> {
    try {
      const data: any = { ...updates };
      delete data.id;
      delete data.createdAt;
      delete data.updatedAt;

      const user = await this.prisma.user.update({
        where: { id },
        data,
      });
      return {
        ...user,
        activeRole: user.activeRole as Role,
        eligibleRoles: user.eligibleRoles as Role[],
      };
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      await this.prisma.user.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}
