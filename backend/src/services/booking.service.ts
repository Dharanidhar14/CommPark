import {
  IBookingRepository,
  BookingEntity,
  BookingStatus,
} from '../repositories/IBookingRepository';
import { IParkingRepository } from '../repositories/IParkingRepository';
import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { WalletService } from './wallet.service';

export interface CreateBookingDTO {
  listingId: string;
  vehicleId: string;
  startTime: string; // ISO date string
  endTime: string;   // ISO date string
  paymentMethod?: string;
  specialInstructions?: string;
}

export class BookingService {
  constructor(
    private bookingRepo: IBookingRepository,
    private parkingRepo: IParkingRepository,
    private vehicleRepo: IVehicleRepository,
    private walletService: WalletService
  ) {}

  async createBooking(
    customerId: string,
    data: CreateBookingDTO
  ): Promise<BookingEntity> {
    const sTime = new Date(data.startTime);
    const eTime = new Date(data.endTime);

    if (isNaN(sTime.getTime()) || isNaN(eTime.getTime())) {
      throw new Error('Invalid start or end time format.');
    }

    if (sTime >= eTime) {
      throw new Error('End time must be after start time.');
    }

    // 1. Verify listing
    const listing = await this.parkingRepo.findById(data.listingId);
    if (!listing) {
      throw new Error('Parking space listing not found.');
    }

    // 2. Verify community approval for apartment/residential spaces
    if (listing.category === 'RESIDENTIAL' && listing.approvalStatus !== 'APPROVED') {
      throw new Error(
        'This residential parking bay is pending community RWA approval and cannot be booked yet.'
      );
    }

    // 3. Verify vehicle belongs to user
    const vehicle = await this.vehicleRepo.findById(data.vehicleId);
    if (!vehicle) {
      throw new Error('Selected vehicle not found.');
    }
    if (vehicle.userId !== customerId) {
      throw new Error('Unauthorized: vehicle does not belong to your account.');
    }

    // 4. Server-authoritative price calculation
    const durationMs = eTime.getTime() - sTime.getTime();
    const durationHours = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60)));
    const subtotal = Math.round(listing.pricePerHour * durationHours * 100) / 100;
    const serviceFee = 15.0; // ₹15 platform service fee
    const totalAmount = Math.round((subtotal + serviceFee) * 100) / 100;

    const paymentMethod = data.paymentMethod || 'CommunityPark Wallet';
    const isWalletPayment = paymentMethod.toLowerCase().includes('wallet');

    // 5. Pre-validate wallet funds before creating reservation
    if (isWalletPayment) {
      const wallet = await this.walletService.getWallet(customerId);
      if (wallet.availableBalance < totalAmount) {
        throw new Error(
          `Insufficient wallet balance. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${wallet.availableBalance.toFixed(2)}`
        );
      }
    }

    // 6. Create booking record (executes atomic overlap check in repository)
    const bookingDate = sTime.toISOString().split('T')[0];
    const booking = await this.bookingRepo.create({
      listingId: listing.id,
      customerId,
      vehicleId: vehicle.id,
      bookingDate,
      startTime: sTime,
      endTime: eTime,
      durationHours,
      accessType: listing.accessType,
      subtotal,
      serviceFee,
      totalAmount,
      currency: '₹',
      paymentMethod,
      specialInstructions: data.specialInstructions,
    });

    // 7. Process payment atomically with idempotency key
    if (isWalletPayment) {
      try {
        await this.walletService.debitForBooking(
          customerId,
          booking.id,
          totalAmount,
          listing.name,
          `booking_debit_${booking.id}`
        );
      } catch (err: any) {
        // Rollback booking if payment fails
        await this.bookingRepo.updateStatus(booking.id, 'CANCELLED', 'Payment processing failed');
        throw new Error(`Booking payment failed: ${err.message}`);
      }
    }

    return booking;
  }

  async getCustomerBookings(customerId: string): Promise<BookingEntity[]> {
    return this.bookingRepo.findByCustomerId(customerId);
  }

  async getBookingById(id: string, userId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(id);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    // Check if customer or listing owner
    if (booking.customerId !== userId) {
      const listing = await this.parkingRepo.findById(booking.listingId);
      if (!listing || listing.ownerId !== userId) {
        throw new Error('Unauthorized to view this booking.');
      }
    }

    return booking;
  }

  async cancelBooking(
    bookingId: string,
    userId: string,
    reason: string = 'User requested cancellation'
  ): Promise<{ booking: BookingEntity; refundAmount: number }> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.customerId !== userId) {
      throw new Error('Unauthorized to cancel this booking.');
    }

    if (booking.status === 'CANCELLED') {
      throw new Error('This booking has already been cancelled.');
    }

    if (booking.status === 'COMPLETED') {
      throw new Error('Completed bookings cannot be cancelled.');
    }

    // Calculate refund according to server-controlled cancellation policy:
    // Full refund if cancelled prior to start time; subtotal refund if cancelled mid-session
    const now = new Date();
    const isBeforeStart = now < new Date(booking.startTime);
    const refundAmount = isBeforeStart ? booking.totalAmount : booking.subtotal;

    // Atomically transition status
    const updated = await this.bookingRepo.updateStatus(
      booking.id,
      'CANCELLED',
      reason,
      userId
    );

    // Credit refund to wallet idempotently
    if (refundAmount > 0) {
      await this.walletService.creditForRefund(
        userId,
        booking.id,
        refundAmount,
        `Cancellation refund for booking ${booking.bookingNumber}`,
        `refund_${booking.id}`
      );
    }

    return {
      booking: updated!,
      refundAmount,
    };
  }

  async completeBooking(bookingId: string): Promise<BookingEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.status === 'COMPLETED') {
      return booking; // Idempotent completion check
    }

    if (booking.status === 'CANCELLED') {
      throw new Error('Cancelled bookings cannot be completed.');
    }

    const updated = await this.bookingRepo.updateStatus(bookingId, 'COMPLETED');
    const listing = await this.parkingRepo.findById(booking.listingId);

    if (listing) {
      // Credit host payout idempotently
      await this.walletService.creditForOwnerEarning(
        listing.ownerId,
        booking.id,
        booking.subtotal,
        listing.name,
        `payout_${booking.id}`
      );
    }

    return updated!;
  }
}
