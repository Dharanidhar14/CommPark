export type TransactionType =
  | 'PARKING_PAYMENT'
  | 'PARKING_REFUND'
  | 'OWNER_EARNING'
  | 'GUARD_INCENTIVE'
  | 'PROMO_CREDIT'
  | 'WALLET_TOPUP';

export type TransactionStatus = 'COMPLETED' | 'PENDING' | 'FAILED';

export interface WalletEntity {
  id: string;
  userId: string;
  availableBalance: number;
  earnedAsOwner: number;
  earnedAsGuard: number;
  pendingCredits: number;
  currency: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletTransactionEntity {
  id: string;
  walletId: string;
  txNumber: string;
  idempotencyKey?: string | null;
  type: TransactionType;
  title: string;
  amount: number;
  status: TransactionStatus;
  category: string;
  relatedBookingId?: string | null;
  paymentMethodUsed?: string | null;
  referenceNumber: string;
  note?: string | null;
  isDemo: boolean;
  createdAt: Date;
}

export interface CreateTransactionData {
  walletId: string;
  type: TransactionType;
  title: string;
  amount: number;
  category: string;
  relatedBookingId?: string;
  paymentMethodUsed?: string;
  referenceNumber?: string;
  note?: string;
  idempotencyKey?: string;
}

export interface IWalletRepository {
  findByUserId(userId: string): Promise<WalletEntity | null>;
  createWallet(userId: string): Promise<WalletEntity>;
  getTransactions(walletId: string, limit?: number): Promise<WalletTransactionEntity[]>;
  recordTransaction(data: CreateTransactionData): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }>;
}
