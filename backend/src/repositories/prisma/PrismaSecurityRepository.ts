import { PrismaClient, VerificationResultEnum, Prisma } from '@prisma/client';
import {
  ISecurityRepository,
  SecurityVerificationEntity,
  VerificationResult,
} from '../ISecurityRepository';

export class PrismaSecurityRepository implements ISecurityRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToEntity(v: any): SecurityVerificationEntity {
    return {
      id: v.id,
      bookingId: v.bookingId,
      guardId: v.guardId,
      gateNumber: v.gateNumber,
      verifiedAt: v.verifiedAt,
      licensePlateMatches: v.licensePlateMatches,
      result: v.result as VerificationResult,
      failureReason: v.failureReason,
      guardIncentiveAmount: Number(v.guardIncentiveAmount),
      createdAt: v.createdAt,
    };
  }

  async createVerification(
    data: Omit<SecurityVerificationEntity, 'id' | 'createdAt'>
  ): Promise<SecurityVerificationEntity> {
    const v = await this.prisma.securityVerification.create({
      data: {
        bookingId: data.bookingId,
        guardId: data.guardId,
        gateNumber: data.gateNumber,
        verifiedAt: data.verifiedAt,
        licensePlateMatches: data.licensePlateMatches,
        result: data.result as VerificationResultEnum,
        failureReason: data.failureReason || null,
        guardIncentiveAmount: new Prisma.Decimal(data.guardIncentiveAmount.toFixed(2)),
      },
    });
    return this.mapToEntity(v);
  }

  async findByBookingId(bookingId: string): Promise<SecurityVerificationEntity[]> {
    const items = await this.prisma.securityVerification.findMany({
      where: { bookingId },
      orderBy: { verifiedAt: 'desc' },
    });
    return items.map((i) => this.mapToEntity(i));
  }

  async findRecentVerifications(
    guardId?: string,
    limit: number = 20
  ): Promise<SecurityVerificationEntity[]> {
    const items = await this.prisma.securityVerification.findMany({
      where: guardId ? { guardId } : {},
      orderBy: { verifiedAt: 'desc' },
      take: limit,
    });
    return items.map((i) => this.mapToEntity(i));
  }
}
