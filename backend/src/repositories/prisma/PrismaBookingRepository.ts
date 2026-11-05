import {
  PrismaClient,
  BookingStatusEnum,
  AccessMethod,
} from '@prisma/client';
import {
  IBookingRepository,
  BookingEntity,
  CreateBookingData,
  BookingStatus,
} from '../IBookingRepository';
import { AccessMethod as RepAccessMethod } from '../IParkingRepository';

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private prisma: PrismaClient) {}

  private mapToEntity(item: any): BookingEntity {
    return {
      id: item.id,
      bookingNumber: item.bookingNumber,
      listingId: item.listingId,
      customerId: item.customerId,
      vehicleId: item.vehicleId,
      bookingDate: item.bookingDate,
      startTime: item.startTime,
      endTime: item.endTime,
      durationHours: item.durationHours,
      accessType: item.accessType as RepAccessMethod,
      subtotal: Number(item.subtotal),
      serviceFee: Number(item.serviceFee),
      totalAmount: Number(item.totalAmount),
      currency: item.currency,
      status: item.status as BookingStatus,
      paymentMethod: item.paymentMethod,
      qrCodeToken: item.qrCodeToken,
      accessCode: item.accessCode,
      specialInstructions: item.specialInstructions,
      isDemoData: item.isDemoData,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  }

  async findById(id: string): Promise<BookingEntity | null> {
    const item = await this.prisma.booking.findUnique({ where: { id } });
    return item ? this.mapToEntity(item) : null;
  }

  async findByBookingNumber(num: string): Promise<BookingEntity | null> {
    const item = await this.prisma.booking.findUnique({
      where: { bookingNumber: num.toUpperCase().trim() },
    });
    return item ? this.mapToEntity(item) : null;
  }

  async findByQrCodeToken(token: string): Promise<BookingEntity | null> {
    const item = await this.prisma.booking.findUnique({
      where: { qrCodeToken: token.trim() },
    });
    return item ? this.mapToEntity(item) : null;
  }

  async findByCustomerId(customerId: string): Promise<BookingEntity[]> {
    const items = await this.prisma.booking.findMany({
      where: { customerId },
      orderBy: { startTime: 'desc' },
    });
    return items.map((i) => this.mapToEntity(i));
  }

  async findByListingId(listingId: string): Promise<BookingEntity[]> {
    const items = await this.prisma.booking.findMany({
      where: { listingId },
      orderBy: { startTime: 'desc' },
    });
    return items.map((i) => this.mapToEntity(i));
  }

  async checkOverlappingBookings(
    listingId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<BookingEntity[]> {
    const items = await this.prisma.booking.findMany({
      where: {
        listingId,
        status: { not: BookingStatusEnum.CANCELLED },
        ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
    });
    return items.map((i) => this.mapToEntity(i));
  }

  async create(data: CreateBookingData): Promise<BookingEntity> {
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const bookingNumber = `CP-BLR-${new Date().getFullYear()}-${randomHex}`;
    const qrCodeToken = `CP-PASS-BLR-${randomHex}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const item = await this.prisma.booking.create({
      data: {
        bookingNumber,
        listingId: data.listingId,
        customerId: data.customerId,
        vehicleId: data.vehicleId,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: data.durationHours,
        accessType: data.accessType as AccessMethod,
        subtotal: data.subtotal,
        serviceFee: data.serviceFee,
        totalAmount: data.totalAmount,
        currency: data.currency || '₹',
        status: BookingStatusEnum.UPCOMING,
        paymentMethod: data.paymentMethod || 'CommunityPark Wallet',
        qrCodeToken,
        accessCode: data.accessCode || `AC-${randomHex.substring(0, 4)}`,
        specialInstructions: data.specialInstructions || null,
        isDemoData: false,
      },
    });

    return this.mapToEntity(item);
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    reason?: string,
    changedById?: string
  ): Promise<BookingEntity | null> {
    try {
      const existing = await this.prisma.booking.findUnique({ where: { id } });
      if (!existing) return null;

      const [item] = await this.prisma.$transaction([
        this.prisma.booking.update({
          where: { id },
          data: { status: status as BookingStatusEnum },
        }),
        this.prisma.bookingStatusHistory.create({
          data: {
            bookingId: id,
            fromStatus: existing.status,
            toStatus: status as BookingStatusEnum,
            reason: reason || null,
            changedById: changedById || null,
          },
        }),
      ]);

      return this.mapToEntity(item);
    } catch {
      return null;
    }
  }
}
