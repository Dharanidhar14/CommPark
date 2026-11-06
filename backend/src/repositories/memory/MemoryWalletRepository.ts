import crypto from 'crypto';
import {
  IWalletRepository,
  WalletEntity,
  WalletTransactionEntity,
  CreateTransactionData,
} from '../IWalletRepository';

export class MemoryWalletRepository implements IWalletRepository {
  private wallets: Map<string, WalletEntity> = new Map();
  private transactions: Map<string, WalletTransactionEntity> = new Map();

  constructor(
    initialWallets: WalletEntity[] = [],
    initialTransactions: WalletTransactionEntity[] = []
  ) {
    for (const w of initialWallets) {
      this.wallets.set(w.id, { ...w });
    }
    for (const tx of initialTransactions) {
      this.transactions.set(tx.id, { ...tx });
    }
  }

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    for (const w of this.wallets.values()) {
      if (w.userId === userId) {
        return { ...w };
      }
    }
    return null;
  }

  async createWallet(userId: string): Promise<WalletEntity> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const id = `wal_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const now = new Date();
    const wallet: WalletEntity = {
      id,
      userId,
      availableBalance: 0.0,
      earnedAsOwner: 0.0,
      earnedAsGuard: 0.0,
      pendingCredits: 0.0,
      currency: '₹',
      createdAt: now,
      updatedAt: now,
    };
    this.wallets.set(id, wallet);
    return { ...wallet };
  }

  async getTransactions(walletId: string, limit: number = 50): Promise<WalletTransactionEntity[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.walletId === walletId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit)
      .map((tx) => ({ ...tx }));
  }

  async recordTransaction(
    data: CreateTransactionData
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    const wallet = this.wallets.get(data.walletId);
    if (!wallet) {
      throw new Error(`Wallet not found for id: ${data.walletId}`);
    }

    // FINANCIAL IDEMPOTENCY CHECK
    if (data.idempotencyKey) {
      for (const existingTx of this.transactions.values()) {
        if (existingTx.idempotencyKey === data.idempotencyKey) {
          // Idempotent hit: return existing transaction and current wallet state without re-mutating
          return {
            wallet: { ...wallet },
            transaction: { ...existingTx },
          };
        }
      }
    }

    // Cryptographically secure identifiers
    const txId = `tx_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
    const hexSuffix = crypto.randomBytes(3).toString('hex').toUpperCase();
    const txNumber = `TXN-BLR-${hexSuffix}`;
    const referenceNumber = data.referenceNumber || `REF-${Date.now()}-${hexSuffix}`;
    const now = new Date();

    // Check balance for negative amounts (debits)
    if (data.amount < 0 && wallet.availableBalance + data.amount < 0) {
      throw new Error(`Insufficient wallet balance. Required: ${Math.abs(data.amount)}, Available: ${wallet.availableBalance}`);
    }

    let newBalance = wallet.availableBalance + data.amount;
    let earnedAsOwner = wallet.earnedAsOwner;
    let earnedAsGuard = wallet.earnedAsGuard;

    if (data.type === 'OWNER_EARNING') {
      earnedAsOwner += data.amount;
    } else if (data.type === 'GUARD_INCENTIVE') {
      earnedAsGuard += data.amount;
    }

    const updatedWallet: WalletEntity = {
      ...wallet,
      availableBalance: Math.round(newBalance * 100) / 100,
      earnedAsOwner: Math.round(earnedAsOwner * 100) / 100,
      earnedAsGuard: Math.round(earnedAsGuard * 100) / 100,
      updatedAt: now,
    };

    const transaction: WalletTransactionEntity = {
      id: txId,
      walletId: data.walletId,
      txNumber,
      idempotencyKey: data.idempotencyKey || null,
      type: data.type,
      title: data.title,
      amount: data.amount,
      status: 'COMPLETED',
      category: data.category,
      relatedBookingId: data.relatedBookingId || null,
      paymentMethodUsed: data.paymentMethodUsed || 'CommunityPark Wallet',
      referenceNumber,
      note: data.note || null,
      isDemo: false,
      createdAt: now,
    };

    this.wallets.set(wallet.id, updatedWallet);
    this.transactions.set(txId, transaction);

    return {
      wallet: { ...updatedWallet },
      transaction: { ...transaction },
    };
  }
}
