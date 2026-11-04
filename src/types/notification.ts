export type NotificationCategory =
  | 'booking'
  | 'payment'
  | 'reminder'
  | 'owner'
  | 'approval'
  | 'security'
  | 'promotional';

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: NotificationCategory;
  timestamp: string;
  isRead: boolean;
  relatedRoute?: string;
  relatedId?: string;
  isDemoData: boolean;
}
