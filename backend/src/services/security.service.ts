import {
  ISecurityRepository,
  SecurityVerificationEntity,
  VerificationResult,
} from '../repositories/ISecurityRepository';
import { IBookingRepository } from '../repositories/IBookingRepository';
import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { WalletService } from './wallet.service';
import { BookingService } from './booking.service';

export interface VerifyPassDTO {
  qrCodeToken: string;
  licensePlate: string;
  gateNumber?: string;
}

export class SecurityService {
  constructor(
    private securityRepo: ISecurityRepository,
    private bookingRepo: IBookingRepository,
    private vehicleRepo: IVehicleRepository,
    private walletService: WalletService,
    private bookingService: BookingService
  ) {}

  async verifyPass(
    guardId: string,
    data: VerifyPassDTO
  ): Promise<{
    verification: SecurityVerificationEntity;
    status: VerificationResult;
    message: string;
    booking?: any;
  }> {
    const booking = await this.bookingRepo.findByQrCodeToken(data.qrCodeToken);
    if (!booking) {
      throw new Error('Invalid QR pass token. No booking found.');
    }

    if (booking.status === 'CANCELLED') {
      const v = await this.securityRepo.createVerification({
        bookingId: booking.id,
        guardId,
        gateNumber: data.gateNumber || 'Gate 2',
        verifiedAt: new Date(),
        licensePlateMatches: false,
        result: 'DENIED',
        failureReason: 'Booking has been cancelled.',
        guardIncentiveAmount: 0,
      });
      return {
        verification: v,
        status: 'DENIED',
        message: 'Access Denied: Booking was cancelled.',
      };
    }

    if (booking.status === 'COMPLETED') {
      const v = await this.securityRepo.createVerification({
        bookingId: booking.id,
        guardId,
        gateNumber: data.gateNumber || 'Gate 2',
        verifiedAt: new Date(),
        licensePlateMatches: false,
        result: 'DENIED',
        failureReason: 'Booking has already been completed.',
        guardIncentiveAmount: 0,
      });
      return {
        verification: v,
        status: 'DENIED',
        message: 'Access Denied: Booking session already finished.',
      };
    }

    // Check vehicle match
    const vehicle = await this.vehicleRepo.findById(booking.vehicleId);
    const expectedPlate = vehicle?.licensePlate.replace(/\s+/g, '').toUpperCase() || '';
    const presentedPlate = data.licensePlate.replace(/\s+/g, '').toUpperCase();
    const plateMatches = expectedPlate === presentedPlate;

    if (!plateMatches) {
      const v = await this.securityRepo.createVerification({
        bookingId: booking.id,
        guardId,
        gateNumber: data.gateNumber || 'Gate 2',
        verifiedAt: new Date(),
        licensePlateMatches: false,
        result: 'DENIED',
        failureReason: `Plate mismatch: expected ${vehicle?.licensePlate}, presented ${data.licensePlate}`,
        guardIncentiveAmount: 0,
      });
      return {
        verification: v,
        status: 'DENIED',
        message: `Plate Mismatch! Expected ${vehicle?.licensePlate || 'N/A'}, scanned ${data.licensePlate}`,
      };
    }

    // Vehicle verified and authorized
    const v = await this.securityRepo.createVerification({
      bookingId: booking.id,
      guardId,
      gateNumber: data.gateNumber || 'Gate 2',
      verifiedAt: new Date(),
      licensePlateMatches: true,
      result: 'APPROVED',
      failureReason: null,
      guardIncentiveAmount: 15.0,
    });

    // If upcoming, activate booking
    if (booking.status === 'UPCOMING') {
      await this.bookingRepo.updateStatus(booking.id, 'ACTIVE', 'Guard Gate Entry Verified', guardId);
    }

    // Award guard verification incentive (₹15.00)
    await this.walletService.creditForGuardIncentive(guardId, booking.id, 15.0);

    return {
      verification: v,
      status: 'APPROVED',
      message: 'Access Approved! Boom barrier release authorized.',
      booking: {
        bookingNumber: booking.bookingNumber,
        vehiclePlate: vehicle?.licensePlate,
        accessCode: booking.accessCode,
        durationHours: booking.durationHours,
      },
    };
  }

  async recordExit(
    guardId: string,
    bookingId: string,
    gateNumber: string = 'Gate 2'
  ): Promise<SecurityVerificationEntity> {
    const v = await this.securityRepo.createVerification({
      bookingId,
      guardId,
      gateNumber,
      verifiedAt: new Date(),
      licensePlateMatches: true,
      result: 'EXIT_RECORDED',
      failureReason: null,
      guardIncentiveAmount: 0,
    });

    await this.bookingService.completeBooking(bookingId);
    return v;
  }

  async getRecentVerifications(guardId?: string): Promise<SecurityVerificationEntity[]> {
    return this.securityRepo.findRecentVerifications(guardId);
  }
}
