import {
  ISupportRepository,
  SupportTicketEntity,
  TicketCategory,
  TicketStatus,
} from '../repositories/ISupportRepository';

export interface CreateTicketDTO {
  category: TicketCategory;
  categoryLabel?: string;
  subject: string;
  description: string;
  relatedBookingId?: string;
  relatedBookingNumber?: string;
  imageUri?: string;
}

export class SupportService {
  constructor(private supportRepo: ISupportRepository) {}

  async createTicket(userId: string, data: CreateTicketDTO): Promise<SupportTicketEntity> {
    return this.supportRepo.create({
      userId,
      category: data.category,
      categoryLabel: data.categoryLabel || data.category.replace(/_/g, ' '),
      subject: data.subject.trim(),
      description: data.description.trim(),
      relatedBookingId: data.relatedBookingId || null,
      relatedBookingNumber: data.relatedBookingNumber || null,
      imageUri: data.imageUri || null,
      responseText: null,
      resolvedAt: null,
      isDemoTicket: false,
    });
  }

  async getUserTickets(userId: string): Promise<SupportTicketEntity[]> {
    return this.supportRepo.findByUserId(userId);
  }

  async getTicketById(
    ticketId: string,
    userId: string,
    isAdmin: boolean = false
  ): Promise<SupportTicketEntity> {
    const ticket = await this.supportRepo.findById(ticketId);
    if (!ticket) {
      throw new Error('Support ticket not found.');
    }
    if (!isAdmin && ticket.userId !== userId) {
      throw new Error('Unauthorized to view this ticket.');
    }
    return ticket;
  }

  async updateTicketStatus(
    ticketId: string,
    status: TicketStatus,
    responseText?: string
  ): Promise<SupportTicketEntity> {
    const updated = await this.supportRepo.updateStatus(ticketId, status, responseText);
    if (!updated) {
      throw new Error('Support ticket not found.');
    }
    return updated;
  }
}
