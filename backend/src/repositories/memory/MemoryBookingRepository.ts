import {
  IBookingRepository,
  BookingEntity,
  CreateBookingData,
  BookingStatus,
} from '../IBookingRepository';

export class MemoryBookingRepository implements IBookingRepository {
  private bookings: Map<string, BookingEntity> = new Map();

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
    const id = `bk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingNumber = `CP-BLR-${new Date().getFullYear()}-${randomHex}`;
    const qrCodeToken = `CP-PASS-BLR-${randomHex}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

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
      qrCodeToken,
      accessCode: data.accessCode || `AC-${randomHex.substring(0, 4)}`,
      specialInstructions: data.specialInstructions || null,
      isDemoData: false,
      createdAt: now,
      updatedAt: now,
    };

    this.bookings.set(id, booking);
    return { ...booking };
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    _reason?: string,
    _changedById?: string
  ): Promise<BookingEntity | null> {
    const existing = this.bookings.get(id);
    if (!existing) return null;

    const updated: BookingEntity = {
      ...existing,
      status,
      updatedAt: new Date(),
    };
    this.bookings.set(id, updated);
    return { ...updated };
  }
}
