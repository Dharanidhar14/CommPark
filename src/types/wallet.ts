export type TransactionType =
  | 'parking_payment'
  | 'parking_refund'
  | 'owner_earning'
  | 'guard_incentive'
  | 'promo_credit'
  | 'wallet_topup';

export interface WalletTransaction {
  id: string;
  txNumber: string;
  type: TransactionType;
  title: string;
  amount: number; // Positive = credit (+), Negative = debit (-)
  date: string;
  status: 'completed' | 'pending' | 'failed';
  category: string;
  relatedBookingId?: string;
  paymentMethodUsed?: string;
  referenceNumber: string;
  note?: string;
  isDemo: boolean;
}

export interface WalletSummary {
  availableBalance: number;
  pendingCredits: number;
  totalCredits: number;
  totalDebits: number;
  earnedAsOwner: number;
  earnedAsGuard: number;
}
