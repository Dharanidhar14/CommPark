import { PrismaClient, TicketCategoryEnum, TicketStatusEnum } from '@prisma/client';
import {
  ISupportRepository,
  SupportTicketEntity,
  TicketStatus,
  TicketCategory,
} from '../ISupportRepository';

export class PrismaSupportRepository implements ISupportRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToEntity(t: any): SupportTicketEntity {
    return {
      id: t.id,
      ticketNumber: t.ticketNumber,
      userId: t.userId,
      category: t.category as TicketCategory,
      categoryLabel: t.categoryLabel,
      subject: t.subject,
      description: t.description,
      relatedBookingId: t.relatedBookingId,
      relatedBookingNumber: t.relatedBookingNumber,
      imageUri: t.imageUri,
      status: t.status as TicketStatus,
      responseText: t.responseText,
      resolvedAt: t.resolvedAt,
      isDemoTicket: t.isDemoTicket,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    };
  }

  async create(
    data: Omit<SupportTicketEntity, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'updatedAt'>
  ): Promise<SupportTicketEntity> {
    const randomHex = Math.floor(100 + Math.random() * 900).toString();
    const ticketNumber = `CP-TKT-${new Date().getFullYear()}-${randomHex}`;

    const t = await this.prisma.supportTicket.create({
      data: {
        ...data,
        ticketNumber,
        category: data.category as TicketCategoryEnum,
        status: TicketStatusEnum.SUBMITTED,
        isDemoTicket: false,
      },
    });
    return this.mapToEntity(t);
  }

  async findById(id: string): Promise<SupportTicketEntity | null> {
    const t = await this.prisma.supportTicket.findUnique({ where: { id } });
    return t ? this.mapToEntity(t) : null;
  }

  async findByUserId(userId: string): Promise<SupportTicketEntity[]> {
    const items = await this.prisma.supportTicket.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return items.map((i) => this.mapToEntity(i));
  }

  async updateStatus(
    id: string,
    status: TicketStatus,
    responseText?: string
  ): Promise<SupportTicketEntity | null> {
    try {
      const now = new Date();
      const t = await this.prisma.supportTicket.update({
        where: { id },
        data: {
          status: status as TicketStatusEnum,
          responseText: responseText !== undefined ? responseText : undefined,
          resolvedAt: status === 'RESOLVED' ? now : undefined,
        },
      });
      return this.mapToEntity(t);
    } catch {
      return null;
    }
  }
}
