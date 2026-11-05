export type AuditAction =
  | 'LISTING_APPROVED'
  | 'LISTING_REJECTED'
  | 'STAFF_AUTHORIZED'
  | 'STAFF_SUSPENDED'
  | 'POLICY_UPDATED'
  | 'SECURITY_ALERT'
  | 'GUEST_ENTRY_LOGGED';

export interface AuditLogEntity {
  id: string;
  action: AuditAction;
  actorId?: string | null;
  actorName: string;
  actorRole: string;
  targetId: string;
  targetDescription: string;
  details?: string | null;
  isDemoRecord: boolean;
  createdAt: Date;
}

export interface IAuditRepository {
  create(data: Omit<AuditLogEntity, 'id' | 'createdAt'>): Promise<AuditLogEntity>;
  findAll(limit?: number): Promise<AuditLogEntity[]>;
}
