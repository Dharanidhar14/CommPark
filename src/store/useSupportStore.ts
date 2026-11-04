import { create } from 'zustand';
import { SupportTicket, SupportTicketCategory, SupportTicketStatus } from '../types/support';

interface SupportState {
  tickets: SupportTicket[];

  // Actions
  createTicket: (
    data: Omit<
      SupportTicket,
      'id' | 'ticketNumber' | 'createdAt' | 'status' | 'isDemoTicket'
    >
  ) => SupportTicket;
  getTicketById: (id: string) => SupportTicket | undefined;
}

const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'tkt_01',
    ticketNumber: 'TKT-2026-IND-8841',
    userId: 'usr_aditya_01',
    category: 'access_problem',
    categoryLabel: 'Vehicle Access Problem',
    subject: 'Gate barrier code SMS delay on 100 Feet Rd',
    description: 'Arrived at the driveway space but direct keypad access SMS was delayed by 2 minutes. Was able to use in-app code.',
    relatedBookingId: 'bk_prev_blr_4410',
    relatedBookingNumber: 'CP-2026-IND-7201',
    createdAt: '02 Nov 2026',
    status: 'resolved',
    responsePlaceholder: 'CommunityPark Support verified in-app pass delivery. Platform fee ₹15 credited back as a goodwill gesture.',
    resolvedAt: '02 Nov 2026, 04:30 PM',
    isDemoTicket: true,
  },
  {
    id: 'tkt_02',
    ticketNumber: 'TKT-2026-IND-9012',
    userId: 'usr_aditya_01',
    category: 'payment_issue',
    categoryLabel: 'Payment & Wallet Refund',
    subject: 'Refund confirmation for cancelled Metro Rail reservation',
    description: 'Checking whether ₹180 refund for cancelled reservation CP-2026-IND-7712 was processed.',
    relatedBookingId: 'bk_cancelled_01',
    relatedBookingNumber: 'CP-2026-IND-7712',
    createdAt: '03 Nov 2026',
    status: 'resolved',
    responsePlaceholder: 'Refund of ₹180.00 was successfully processed to your CommunityPark Wallet balance on 03 Nov 2026 (Ref: REF-CP-7712-IND).',
    resolvedAt: '03 Nov 2026, 11:15 AM',
    isDemoTicket: true,
  },
];

export const useSupportStore = create<SupportState>((set, get) => ({
  tickets: INITIAL_TICKETS,

  createTicket: (data) => {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newTicket: SupportTicket = {
      id: `tkt_${Date.now()}`,
      ticketNumber: `TKT-2026-IND-${randomSuffix}`,
      createdAt: 'Today',
      status: 'submitted',
      responsePlaceholder: 'Our community support team has received your ticket and is reviewing the details. Typical response time is under 15 minutes during operating hours.',
      isDemoTicket: true,
      ...data,
    };

    set((state) => ({
      tickets: [newTicket, ...state.tickets],
    }));

    return newTicket;
  },

  getTicketById: (id: string) => {
    return get().tickets.find((t) => t.id === id);
  },
}));
