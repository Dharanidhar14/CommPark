export type SupportTicketCategory =
  | 'booking_issue'
  | 'space_unavailable'
  | 'incorrect_listing'
  | 'access_problem'
  | 'payment_issue'
  | 'dispute'
  | 'safety_concern'
  | 'other';

export type SupportTicketStatus =
  | 'submitted'
  | 'under_review'
  | 'resolved'
  | 'closed';

export interface SupportTicket {
  id: string;
  ticketNumber: string;
  userId: string;
  category: SupportTicketCategory;
  categoryLabel: string;
  subject: string;
  description: string;
  relatedBookingId?: string;
  relatedBookingNumber?: string;
  imageUri?: string;
  createdAt: string;
  status: SupportTicketStatus;
  responsePlaceholder?: string;
  resolvedAt?: string;
  isDemoTicket: boolean;
}
