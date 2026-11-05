import {
  ISecurityRepository,
  SecurityVerificationEntity,
} from '../ISecurityRepository';

export class MemorySecurityRepository implements ISecurityRepository {
  private verifications: Map<string, SecurityVerificationEntity> = new Map();

  constructor(initialVerifications: SecurityVerificationEntity[] = []) {
    for (const v of initialVerifications) {
      this.verifications.set(v.id, { ...v });
    }
  }

  async createVerification(
    data: Omit<SecurityVerificationEntity, 'id' | 'createdAt'>
  ): Promise<SecurityVerificationEntity> {
    const id = `sec_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const verification: SecurityVerificationEntity = {
      ...data,
      id,
      createdAt: now,
    };
    this.verifications.set(id, verification);
    return { ...verification };
  }

  async findByBookingId(bookingId: string): Promise<SecurityVerificationEntity[]> {
    return Array.from(this.verifications.values())
      .filter((v) => v.bookingId === bookingId)
      .map((v) => ({ ...v }));
  }

  async findRecentVerifications(
    guardId?: string,
    limit: number = 20
  ): Promise<SecurityVerificationEntity[]> {
    return Array.from(this.verifications.values())
      .filter((v) => (!guardId ? true : v.guardId === guardId))
      .sort((a, b) => b.verifiedAt.getTime() - a.verifiedAt.getTime())
      .slice(0, limit)
      .map((v) => ({ ...v }));
  }
}
