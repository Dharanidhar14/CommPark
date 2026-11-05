import {
  IAuditRepository,
  AuditLogEntity,
} from '../IAuditRepository';

export class MemoryAuditRepository implements IAuditRepository {
  private auditLogs: Map<string, AuditLogEntity> = new Map();

  constructor(initialAuditLogs: AuditLogEntity[] = []) {
    for (const log of initialAuditLogs) {
      this.auditLogs.set(log.id, { ...log });
    }
  }

  async create(data: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity> {
    const id = `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date();
    const log: AuditLogEntity = {
      ...data,
      id,
      createdAt: now,
    };
    this.auditLogs.set(id, log);
    return { ...log };
  }

  async findAll(limit: number = 100): Promise<AuditLogEntity[]> {
    return Array.from(this.auditLogs.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((log) => ({ ...log }));
  }
}
