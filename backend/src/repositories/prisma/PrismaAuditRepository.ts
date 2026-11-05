import { PrismaClient, AuditActionEnum } from '@prisma/client';
import {
  IAuditRepository,
  AuditLogEntity,
  AuditAction,
} from '../IAuditRepository';

export class PrismaAuditRepository implements IAuditRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToEntity(log: any): AuditLogEntity {
    return {
      id: log.id,
      action: log.action as AuditAction,
      actorId: log.actorId,
      actorName: log.actorName,
      actorRole: log.actorRole,
      targetId: log.targetId,
      targetDescription: log.targetDescription,
      details: log.details,
      isDemoRecord: log.isDemoRecord,
      createdAt: log.createdAt,
    };
  }

  async create(data: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity> {
    const log = await this.prisma.auditLog.create({
      data: {
        ...data,
        action: data.action as AuditActionEnum,
        isDemoRecord: false,
      },
    });
    return this.mapToEntity(log);
  }

  async findAll(limit: number = 100): Promise<AuditLogEntity[]> {
    const items = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return items.map((i) => this.mapToEntity(i));
  }
}
