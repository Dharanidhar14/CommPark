import { AccessMethod } from './IParkingRepository';

export type BookingStatus = 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export interface BookingEntity {
  id: string;
  bookingNumber: string;
  listingId: string;
  customerId: string;
  vehicleId: string;
  bookingDate: string;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  accessType: AccessMethod;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  currency: string;
  status: BookingStatus;
  paymentMethod: string;
  qrCodeToken: string;
  accessCode?: string | null;
  specialInstructions?: string | null;
  isDemoData: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookingData {
  listingId: string;
  customerId: string;
  vehicleId: string;
  bookingDate: string;
  startTime: Date;
  endTime: Date;
  durationHours: number;
  accessType: AccessMethod;
  subtotal: number;
  serviceFee: number;
  totalAmount: number;
  currency?: string;
  paymentMethod?: string;
  accessCode?: string;
  specialInstructions?: string;
}

export interface IBookingRepository {
  findById(id: string): Promise<BookingEntity | null>;
  findByBookingNumber(num: string): Promise<BookingEntity | null>;
  findByQrCodeToken(token: string): Promise<BookingEntity | null>;
  findByCustomerId(customerId: string): Promise<BookingEntity[]>;
  findByListingId(listingId: string): Promise<BookingEntity[]>;
  checkOverlappingBookings(
    listingId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<BookingEntity[]>;
  create(data: CreateBookingData): Promise<BookingEntity>;
  updateStatus(
    id: string,
    status: BookingStatus,
    reason?: string,
    changedById?: string
  ): Promise<BookingEntity | null>;
}
