import {
  IWalletRepository,
  WalletEntity,
  WalletTransactionEntity,
} from '../repositories/IWalletRepository';

export class WalletService {
  constructor(private walletRepo: IWalletRepository) {}

  async getWallet(userId: string): Promise<WalletEntity> {
    let wallet = await this.walletRepo.findByUserId(userId);
    if (!wallet) {
      wallet = await this.walletRepo.createWallet(userId);
    }
    return wallet;
  }

  async getTransactions(
    userId: string,
    limit: number = 50
  ): Promise<WalletTransactionEntity[]> {
    const wallet = await this.getWallet(userId);
    return this.walletRepo.getTransactions(wallet.id, limit);
  }

  async topUp(
    userId: string,
    amount: number,
    paymentMethod: string = 'UPI (Instant)'
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    if (amount <= 0) {
      throw new Error('Top-up amount must be greater than zero.');
    }
    const wallet = await this.getWallet(userId);
    return this.walletRepo.recordTransaction({
      walletId: wallet.id,
      type: 'WALLET_TOPUP',
      title: 'Wallet Balance Top-up',
      amount,
      category: 'Top-up',
      paymentMethodUsed: paymentMethod,
      note: `Added ₹${amount.toFixed(2)} via ${paymentMethod}`,
    });
  }

  async debitForBooking(
    userId: string,
    bookingId: string,
    amount: number,
    listingName: string
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    if (amount <= 0) {
      throw new Error('Debit amount must be greater than zero.');
    }
    const wallet = await this.getWallet(userId);
    if (wallet.availableBalance < amount) {
      throw new Error(
        `Insufficient wallet balance. Required: ₹${amount.toFixed(2)}, Available: ₹${wallet.availableBalance.toFixed(2)}`
      );
    }

    return this.walletRepo.recordTransaction({
      walletId: wallet.id,
      type: 'PARKING_PAYMENT',
      title: `Parking Fee — ${listingName}`,
      amount: -amount,
      category: 'Parking',
      relatedBookingId: bookingId,
      paymentMethodUsed: 'CommunityPark Wallet',
      note: `Debit for booking at ${listingName}`,
    });
  }

  async creditForRefund(
    userId: string,
    bookingId: string,
    amount: number,
    reason: string = 'Booking Cancellation Refund'
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    if (amount <= 0) {
      throw new Error('Refund amount must be greater than zero.');
    }
    const wallet = await this.getWallet(userId);
    return this.walletRepo.recordTransaction({
      walletId: wallet.id,
      type: 'PARKING_REFUND',
      title: `Refund — ${reason}`,
      amount,
      category: 'Refund',
      relatedBookingId: bookingId,
      paymentMethodUsed: 'Platform Credit',
      note: `Refund credited for booking ${bookingId}: ${reason}`,
    });
  }

  async creditForOwnerEarning(
    ownerId: string,
    bookingId: string,
    amount: number,
    listingName: string
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    const wallet = await this.getWallet(ownerId);
    return this.walletRepo.recordTransaction({
      walletId: wallet.id,
      type: 'OWNER_EARNING',
      title: `Rental Earning — ${listingName}`,
      amount,
      category: 'Earnings',
      relatedBookingId: bookingId,
      paymentMethodUsed: 'Platform Credit',
      note: `Host payout for completed parking reservation at ${listingName}`,
    });
  }

  async creditForGuardIncentive(
    guardId: string,
    bookingId: string,
    amount: number = 15.0
  ): Promise<{ wallet: WalletEntity; transaction: WalletTransactionEntity }> {
    const wallet = await this.getWallet(guardId);
    return this.walletRepo.recordTransaction({
      walletId: wallet.id,
      type: 'GUARD_INCENTIVE',
      title: 'Gate Access Verification Incentive',
      amount,
      category: 'Security Incentive',
      relatedBookingId: bookingId,
      paymentMethodUsed: 'Platform Credit',
      note: `Incentive reward for verifying vehicle entry at Gate`,
    });
  }
}
