import crypto from 'crypto';
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
    return await this.prisma.$transaction(async (tx) => {
      // POSTGRESQL CONCURRENCY LOCK: Serializes concurrent reservations on this listing
      try {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${data.listingId}))`;
      } catch {
        // Safe fallback if raw execute is not supported by driver
      }

      // Check overlapping bookings inside isolated transaction
      const overlaps = await tx.booking.findMany({
        where: {
          listingId: data.listingId,
          status: { not: BookingStatusEnum.CANCELLED },
          startTime: { lt: data.endTime },
          endTime: { gt: data.startTime },
        },
      });

      if (overlaps.length > 0) {
        throw new Error(
          'This parking space is already reserved for the selected time window. Please choose another slot.'
        );
      }

      const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
      const bookingNumber = `CP-BLR-${new Date().getFullYear()}-${randomHex}`;
      const secureQrToken = `CP-PASS-BLR-${crypto.randomBytes(16).toString('hex').toUpperCase()}`;

      const item = await tx.booking.create({
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
          qrCodeToken: secureQrToken,
          accessCode: data.accessCode || `AC-${randomHex}`,
          specialInstructions: data.specialInstructions || null,
          isDemoData: false,
        },
      });

      return this.mapToEntity(item);
    });
  }

  async updateStatus(
    id: string,
    status: BookingStatus,
    reason?: string,
    changedById?: string
  ): Promise<BookingEntity | null> {
    return await this.prisma.$transaction(async (tx) => {
      const existing = await tx.booking.findUnique({ where: { id } });
      if (!existing) return null;

      // Validate state machine transitions
      if (existing.status === BookingStatusEnum.COMPLETED && status !== 'COMPLETED') {
        throw new Error('Completed bookings cannot change status.');
      }
      if (existing.status === BookingStatusEnum.CANCELLED && status !== 'CANCELLED') {
        throw new Error('Cancelled bookings cannot change status.');
      }
      if (existing.status === status) {
        return this.mapToEntity(existing);
      }

      const [item] = await Promise.all([
        tx.booking.update({
          where: { id },
          data: { status: status as BookingStatusEnum },
        }),
        tx.bookingStatusHistory.create({
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
    });
  }
}
