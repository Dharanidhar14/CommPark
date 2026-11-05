import {
  PrismaClient,
  TransactionTypeEnum,
  TransactionStatusEnum,
  Prisma,
} from '@prisma/client';
import {
  IWalletRepository,
  WalletEntity,
  WalletTransactionEntity,
  CreateTransactionData,
  TransactionType,
  TransactionStatus,
} from '../IWalletRepository';

export class PrismaWalletRepository implements IWalletRepository {
  constructor(private prisma: PrismaClient) {}

  private mapWalletToEntity(w: any): WalletEntity {
    return {
      id: w.id,
      userId: w.userId,
      availableBalance: Number(w.availableBalance),
      earnedAsOwner: Number(w.earnedAsOwner),
      earnedAsGuard: Number(w.earnedAsGuard),
      pendingCredits: Number(w.pendingCredits),
      currency: w.currency,
      createdAt: w.createdAt,
      updatedAt: w.updatedAt,
    };
  }

  private mapTxToEntity(tx: any): WalletTransactionEntity {
    return {
      id: tx.id,
      walletId: tx.walletId,
      txNumber: tx.txNumber,
      type: tx.type as TransactionType,
      title: tx.title,
      amount: Number(tx.amount),
      status: tx.status as TransactionStatus,
      category: tx.category,
      relatedBookingId: tx.relatedBookingId,
      paymentMethodUsed: tx.paymentMethodUsed,
      referenceNumber: tx.referenceNumber,
      note: tx.note,
      isDemo: tx.isDemo,
      createdAt: tx.createdAt,
    };
  }

  async findByUserId(userId: string): Promise<WalletEntity | null> {
    const w = await this.prisma.wallet.findUnique({ where: { userId } });
    return w ? this.mapWalletToEntity(w) : null;
  }

  async createWallet(userId: string): Promise<WalletEntity> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;

    const w = await this.prisma.wallet.create({
      data: {
        userId,
        availableBalance: 0.0,
        earnedAsOwner: 0.0,
        earnedAsGuard: 0.0,
        pendingCredits: 0.0,
        currency: '₹',
      },
    });
    return this.mapWalletToEntity(w);
  }

  async getTransactions(walletId: string, limit: number = 50): Promise<WalletTransactionEntity[]> {
    const items = await this.prisma.walletTransaction.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
    return items.map((i) => this.mapTxToEntity(i));
  }

  async recordTransaction(
    data: CreateTransactionData
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    return await this.prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({
        where: { id: data.walletId },
      });

      if (!wallet) {
        throw new Error(`Wallet not found for id: ${data.walletId}`);
      }

      const currentBalance = Number(wallet.availableBalance);
      if (data.amount < 0 && currentBalance + data.amount < 0) {
        throw new Error(
          `Insufficient wallet balance. Required: ${Math.abs(data.amount)}, Available: ${currentBalance}`
        );
      }

      const newBalance = currentBalance + data.amount;
      let newEarnedAsOwner = Number(wallet.earnedAsOwner);
      let newEarnedAsGuard = Number(wallet.earnedAsGuard);

      if (data.type === 'OWNER_EARNING') {
        newEarnedAsOwner += data.amount;
      } else if (data.type === 'GUARD_INCENTIVE') {
        newEarnedAsGuard += data.amount;
      }

      const updatedWallet = await tx.wallet.update({
        where: { id: data.walletId },
        data: {
          availableBalance: new Prisma.Decimal(newBalance.toFixed(2)),
          earnedAsOwner: new Prisma.Decimal(newEarnedAsOwner.toFixed(2)),
          earnedAsGuard: new Prisma.Decimal(newEarnedAsGuard.toFixed(2)),
        },
      });

      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const txNumber = `TXN-BLR-${randomSuffix}`;
      const referenceNumber = `REF-${Date.now()}-${randomSuffix}`;

      const createdTx = await tx.walletTransaction.create({
        data: {
          walletId: data.walletId,
          txNumber,
          type: data.type as TransactionTypeEnum,
          title: data.title,
          amount: new Prisma.Decimal(data.amount.toFixed(2)),
          status: TransactionStatusEnum.COMPLETED,
          category: data.category,
          relatedBookingId: data.relatedBookingId || null,
          paymentMethodUsed: data.paymentMethodUsed || 'CommunityPark Wallet',
          referenceNumber,
          note: data.note || null,
          isDemo: false,
        },
      });

      return {
        wallet: this.mapWalletToEntity(updatedWallet),
        transaction: this.mapTxToEntity(createdTx),
      };
    });
  }
}
