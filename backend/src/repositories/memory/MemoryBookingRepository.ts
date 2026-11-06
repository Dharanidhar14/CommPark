import crypto from 'crypto';
import {
  IBookingRepository,
  BookingEntity,
  CreateBookingData,
  BookingStatus,
} from '../IBookingRepository';

export class MemoryBookingRepository implements IBookingRepository {
  private bookings: Map<string, BookingEntity> = new Map();
  private listingLocks: Map<string, Promise<void>> = new Map();

  constructor(initialBookings: BookingEntity[] = []) {
    for (const b of initialBookings) {
      this.bookings.set(b.id, { ...b });
    }
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const b = this.bookings.get(id);
    return b ? { ...b } : null;
  }

  async findByBookingNumber(num: string): Promise<BookingEntity | null> {
    for (const b of this.bookings.values()) {
      if (b.bookingNumber.toUpperCase() === num.toUpperCase().trim()) {
        return { ...b };
      }
    }
    return null;
  }

  async findByQrCodeToken(token: string): Promise<BookingEntity | null> {
    for (const b of this.bookings.values()) {
      if (b.qrCodeToken === token.trim()) {
        return { ...b };
      }
    }
    return null;
  }

  async findByCustomerId(customerId: string): Promise<BookingEntity[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.customerId === customerId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime())
      .map((b) => ({ ...b }));
  }

  async findByListingId(listingId: string): Promise<BookingEntity[]> {
    return Array.from(this.bookings.values())
      .filter((b) => b.listingId === listingId)
      .map((b) => ({ ...b }));
  }

  async checkOverlappingBookings(
    listingId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<BookingEntity[]> {
    const sTime = startTime.getTime();
    const eTime = endTime.getTime();

    return Array.from(this.bookings.values()).filter((b) => {
      if (b.listingId !== listingId) return false;
      if (b.status === 'CANCELLED') return false;
      if (excludeBookingId && b.id === excludeBookingId) return false;

      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();

      // Overlap condition: start < otherEnd && end > otherStart
      return sTime < bEnd && eTime > bStart;
    });
  }

  async create(data: CreateBookingData): Promise<BookingEntity> {
    // Acquire sequential lock for this listing to serialize concurrent reservations
    let releaseLock: () => void = () => {};
    const currentLock = this.listingLocks.get(data.listingId) || Promise.resolve();
    const newLock = new Promise<void>((resolve) => {
      releaseLock = resolve;
    });
    this.listingLocks.set(data.listingId, newLock);

    try {
      await currentLock;

      // ATOMIC CONCURRENCY CHECK
      const overlaps = await this.checkOverlappingBookings(
        data.listingId,
        new Date(data.startTime),
        new Date(data.endTime)
      );

      if (overlaps.length > 0) {
        throw new Error(
          'This parking space is already reserved for the selected time window. Please choose another slot.'
        );
      }

      const id = `bk_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;
      const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const bookingNumber = `CP-BLR-${new Date().getFullYear()}-${randomHex}`;
      const secureQrToken = `CP-PASS-BLR-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

      const now = new Date();
      const booking: BookingEntity = {
        id,
        bookingNumber,
        listingId: data.listingId,
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: data.durationHours,
        accessType: data.accessType,
        subtotal: data.subtotal,
        serviceFee: data.serviceFee,
        totalAmount: data.totalAmount,
        currency: data.currency || '₹',
        status: 'UPCOMING',
        paymentMethod: data.paymentMethod || 'CommunityPark Wallet',
        qrCodeToken: secureQrToken,
        accessCode: data.accessCode || `AC-${randomHex}`,
        specialInstructions: data.specialInstructions || null,
        isDemoData: false,
        createdAt: now,
        updatedAt: now,
      };

      this.bookings.set(id, booking);
      return { ...booking };
    } finally {
      releaseLock();
    }
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    reason?: string,
    changedById?: string
  ): Promise<BookingEntity | null> {
    const existing = this.bookings.get(id);
    if (!existing) return null;

    // Validate state machine transitions
    if (existing.status === 'COMPLETED' && status !== 'COMPLETED') {
      throw new Error('Completed bookings cannot change status.');
    }
    if (existing.status === 'CANCELLED' && status !== 'CANCELLED') {
      throw new Error('Cancelled bookings cannot change status.');
    }
    if (existing.status === status) {
      // Duplicate transition attempt
      return { ...existing };
    }

    const updated: BookingEntity = {
      ...existing,
      status,
      updatedAt: new Date(),
    };
    this.bookings.set(id, updated);
    return { ...updated };
  }
}
