import {
  ISupportRepository,
  SupportTicketEntity,
  TicketStatus,
} from '../ISupportRepository';

export class MemorySupportRepository implements ISupportRepository {
  private tickets: Map<string, SupportTicketEntity> = new Map();

  constructor(initialTickets: SupportTicketEntity[] = []) {
    for (const t of initialTickets) {
      this.tickets.set(t.id, { ...t });
    }
  }

  async create(
    data: Omit<SupportTicketEntity, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<SupportTicketEntity> {
    const id = `tkt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const randomHex = Math.floor(100 + Math.random() * 900).toString();
    const ticketNumber = `CP-TKT-${new Date().getFullYear()}-${randomHex}`;
    const now = new Date();

    const ticket: SupportTicketEntity = {
      ...data,
      id,
      ticketNumber,
      status: 'SUBMITTED',
      createdAt: now,
      updatedAt: now,
    };
    this.tickets.set(id, ticket);
    return { ...ticket };
  }

  async findById(id: string): Promise<SupportTicketEntity | null> {
    const t = this.tickets.get(id);
    return t ? { ...t } : null;
  }

  async findByUserId(userId: string): Promise<SupportTicketEntity[]> {
    return Array.from(this.tickets.values())
      .filter((t) => t.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((t) => ({ ...t }));
  }

  async updateStatus(
    id: string,
    status: TicketStatus,
    responseText?: string
  ): Promise<SupportTicketEntity | null> {
    const existing = this.tickets.get(id);
    if (!existing) return null;

    const now = new Date();
    const updated: SupportTicketEntity = {
      ...existing,
      status,
      responseText: responseText !== undefined ? responseText : existing.responseText,
      resolvedAt: status === 'RESOLVED' ? now : existing.resolvedAt,
      updatedAt: now,
    };
    this.tickets.set(id, updated);
    return { ...updated };
  }
}
