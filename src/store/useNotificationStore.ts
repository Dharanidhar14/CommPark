import { create } from 'zustand';
import { NotificationItem, NotificationCategory } from '../types/notification';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;

  // Actions
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  dismissNotification: (id: string) => void;
  clearAll: () => void;
  addNotification: (
    item: Omit<NotificationItem, 'id' | 'timestamp' | 'isRead' | 'isDemoData'>
  ) => void;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    title: 'Digital Parking Pass Ready!',
    body: 'Your pass for Greenwood Palms Bay B-14 is active. Present QR code at Gate 2 boom barrier.',
    category: 'booking',
    timestamp: 'Today, 06:15 PM',
    isRead: false,
    relatedRoute: '/booking/pass',
    relatedId: 'bk_live_blr_9081',
    isDemoData: true,
  },
  {
    id: 'notif_02',
    title: 'Parking Window Reminder',
    body: 'Your reservation at Greenwood Palms expires in 30 minutes (at 11:30 PM). Please exit or extend.',
    category: 'reminder',
    timestamp: 'Today, 11:00 PM',
    isRead: false,
    relatedRoute: '/booking/pass',
    relatedId: 'bk_live_blr_9081',
    isDemoData: true,
  },
  {
    id: 'notif_03',
    title: 'Wallet Debited: ₹195.00',
    body: 'Debited for Booking #CP-2026-IND-8812 at Greenwood Palms Bay B-14.',
    category: 'payment',
    timestamp: 'Today, 06:15 PM',
    isRead: true,
    relatedRoute: '/(tabs)/wallet',
    relatedId: 'tx_01',
    isDemoData: true,
  },
  {
    id: 'notif_04',
    title: 'RWA Slot Approval Certified',
    body: 'Greenwood Palms RWA certified your Bay B-14 listing. It is now live and discoverable on the map.',
    category: 'approval',
    timestamp: '03 Nov 2026',
    isRead: true,
    relatedRoute: '/owner/listing/space_01',
    relatedId: 'space_01',
    isDemoData: true,
  },
  {
    id: 'notif_05',
    title: 'Guard Verification Incentive: +₹15',
    body: 'Earned ₹15 for verifying visitor pass QR for vehicle KA 04 MM 1120 at Gate 2.',
    category: 'security',
    timestamp: '01 Nov 2026',
    isRead: true,
    relatedRoute: '/security',
    relatedId: 'tx_04',
    isDemoData: true,
  },
  {
    id: 'notif_06',
    title: 'New Booking on Your Driveway!',
    body: 'A guest reserved Bandra Carter Road Portico for 6 hours. Payout of ₹450.00 confirmed.',
    category: 'owner',
    timestamp: '02 Nov 2026',
    isRead: true,
    relatedRoute: '/owner',
    relatedId: 'space_06',
    isDemoData: true,
  },
  {
    id: 'notif_07',
    title: 'Indiranagar EV Community Special',
    body: 'Get 20% off community EV parking spots across Indiranagar this weekend with coupon EV20.',
    category: 'promotional',
    timestamp: '30 Oct 2026',
    isRead: true,
    relatedRoute: '/(tabs)/explore',
    isDemoData: true,
  },
];

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,

  markAsRead: (id: string) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    })),

  dismissNotification: (id: string) =>
    set((state) => {
      const filtered = state.notifications.filter((n) => n.id !== id);
      return {
        notifications: filtered,
        unreadCount: filtered.filter((n) => !n.isRead).length,
      };
    }),

  clearAll: () =>
    set({
      notifications: [],
      unreadCount: 0,
    }),

  addNotification: (itemData) =>
    set((state) => {
      const newNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        timestamp: 'Just now',
        isRead: false,
        isDemoData: true,
        ...itemData,
      };
      const updated = [newNotif, ...state.notifications];
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    }),
}));
