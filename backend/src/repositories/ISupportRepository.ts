export type TicketCategory =
  | 'ACCESS_PROBLEM'
  | 'SPACE_UNAVAILABLE'
  | 'PAYMENT_ISSUE'
  | 'BOOKING_ISSUE'
  | 'INCORRECT_LISTING'
  | 'DISPUTE'
  | 'SAFETY_CONCERN'
  | 'OTHER';

export type TicketStatus = 'SUBMITTED' | 'UNDER_REVIEW' | 'RESOLVED' | 'CLOSED';

export interface SupportTicketEntity {
  id: string;
  ticketNumber: string;
  userId: string;
  category: TicketCategory;
  categoryLabel: string;
  subject: string;
  description: string;
  relatedBookingId?: string | null;
  relatedBookingNumber?: string | null;
  imageUri?: string | null;
  status: TicketStatus;
  responseText?: string | null;
  resolvedAt?: Date | null;
  isDemoTicket: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupportRepository {
  create(data: Omit<SupportTicketEntity, 'id' | 'ticketNumber' | 'status' | 'createdAt' | 'updatedAt'>): Promise<SupportTicketEntity>;
  findById(id: string): Promise<SupportTicketEntity | null>;
  findByUserId(userId: string): Promise<SupportTicketEntity[]>;
  updateStatus(id: string, status: TicketStatus, responseText?: string): Promise<SupportTicketEntity | null>;
}
