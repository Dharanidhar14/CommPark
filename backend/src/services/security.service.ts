import {
  ISecurityRepository,
  SecurityVerificationEntity,
  VerificationResult,
} from '../repositories/ISecurityRepository';
import { IBookingRepository } from '../repositories/IBookingRepository';
import { IVehicleRepository } from '../repositories/IVehicleRepository';
import { IParkingRepository } from '../repositories/IParkingRepository';
import { ICommunityRepository } from '../repositories/ICommunityRepository';
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
    private parkingRepo: IParkingRepository,
    private communityRepo: ICommunityRepository,
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
    disclaimer: string;
  }> {
    const DISCLAIMER = 'Notice: Simulated verification. Not connected to physical gate boom-barrier hardware.';

    const booking = await this.bookingRepo.findByQrCodeToken(data.qrCodeToken);
    if (!booking) {
      throw new Error('Invalid QR pass token. No booking found.');
    }

    // 1. Verify community & guard authorization
    const listing = await this.parkingRepo.findById(booking.listingId);
    if (!listing) {
      throw new Error('Associated parking listing not found.');
    }

    if (listing.communityId) {
      const membership = await this.communityRepo.getMembership(listing.communityId, guardId);
      if (!membership || membership.role !== 'SECURITY_STAFF') {
        throw new Error('Forbidden: you are not an authorized security staff for this community.');
      }
      if (!membership.isAuthorized) {
        throw new Error('Forbidden: Revoked or suspended security staff authorization.');
      }
    }

    // 2. State & Cancellation Check
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
        disclaimer: DISCLAIMER,
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
        disclaimer: DISCLAIMER,
      };
    }

    // 3. Arrival Window Check (Allowed from 30 mins prior to start until end time)
    const now = new Date();
    const allowedWindowStart = new Date(new Date(booking.startTime).getTime() - 30 * 60 * 1000);
    const allowedWindowEnd = new Date(booking.endTime);

    if (now < allowedWindowStart) {
      const v = await this.securityRepo.createVerification({
        bookingId: booking.id,
        guardId,
        gateNumber: data.gateNumber || 'Gate 2',
        verifiedAt: now,
        licensePlateMatches: false,
        result: 'DENIED',
        failureReason: 'Outside allowed arrival window. Too early.',
        guardIncentiveAmount: 0,
      });
      return {
        verification: v,
        status: 'DENIED',
        message: 'Access Denied: Outside allowed arrival window. Entry is permitted up to 30 minutes before booking start time.',
        disclaimer: DISCLAIMER,
      };
    }

    if (now > allowedWindowEnd) {
      const v = await this.securityRepo.createVerification({
        bookingId: booking.id,
        guardId,
        gateNumber: data.gateNumber || 'Gate 2',
        verifiedAt: now,
        licensePlateMatches: false,
        result: 'DENIED',
        failureReason: 'Booking session has expired.',
        guardIncentiveAmount: 0,
      });
      return {
        verification: v,
        status: 'DENIED',
        message: 'Access Denied: Booking reservation window has expired.',
        disclaimer: DISCLAIMER,
      };
    }

    // 4. Vehicle Plate Match
    const vehicle = await this.vehicleRepo.findById(booking.vehicleId);
    const expectedPlate = vehicle?.licensePlate.replace(/\s+/g, '').toUpperCase() || '';
    const presentedPlate = data.licensePlate.replace(/\s+/g, '').toUpperCase();
    const plateMatches = expectedPlate === presentedPlate;

    if (!plateMatches) {
      const v = await this.securityRepo.createVerification({
        bookingId: booking.id,
        guardId,
        gateNumber: data.gateNumber || 'Gate 2',
        verifiedAt: now,
        licensePlateMatches: false,
        result: 'DENIED',
        failureReason: `Plate mismatch: expected ${vehicle?.licensePlate}, presented ${data.licensePlate}`,
        guardIncentiveAmount: 0,
      });
      return {
        verification: v,
        status: 'DENIED',
        message: `Plate Mismatch! Expected ${vehicle?.licensePlate || 'N/A'}, scanned ${data.licensePlate}`,
        disclaimer: DISCLAIMER,
      };
    }

    // 5. Verification Approved & Idempotent Incentive Award
    const isFirstVerification = booking.status === 'UPCOMING';
    const guardIncentive = isFirstVerification ? 15.0 : 0.0;

    const v = await this.securityRepo.createVerification({
      bookingId: booking.id,
      guardId,
      gateNumber: data.gateNumber || 'Gate 2',
      verifiedAt: now,
      licensePlateMatches: true,
      result: 'APPROVED',
      failureReason: null,
      guardIncentiveAmount: guardIncentive,
    });

    if (isFirstVerification) {
      await this.bookingRepo.updateStatus(booking.id, 'ACTIVE', 'Guard Gate Entry Verified', guardId);
      // Award guard incentive idempotently
      await this.walletService.creditForGuardIncentive(
        guardId,
        booking.id,
        15.0,
        `guard_reward_${booking.id}`
      );
    }

    return {
      verification: v,
      status: 'APPROVED',
      message: isFirstVerification
        ? 'Access Approved! Vehicle entry verified.'
        : 'Access Re-confirmed. Vehicle is already actively checked in.',
      booking: {
        bookingNumber: booking.bookingNumber,
        vehiclePlate: vehicle?.licensePlate,
        slotNumber: listing.slotNumber,
        validUntil: booking.endTime,
      },
      disclaimer: DISCLAIMER,
    };
  }

  async recordExit(
    guardId: string,
    bookingId: string,
    gateNumber: string = 'Gate 2'
  ): Promise<SecurityVerificationEntity> {
    const booking = await this.bookingRepo.findById(bookingId);
    if (!booking) {
      throw new Error('Booking not found.');
    }

    if (booking.status === 'COMPLETED') {
      throw new Error('Duplicate exit request: booking has already completed and exit was recorded.');
    }

    if (booking.status === 'CANCELLED') {
      throw new Error('Cannot record exit for a cancelled booking.');
    }

    const listing = await this.parkingRepo.findById(booking.listingId);
    if (listing?.communityId) {
      const membership = await this.communityRepo.getMembership(listing.communityId, guardId);
      if (!membership || membership.role !== 'SECURITY_STAFF') {
        throw new Error('Forbidden: you are not an authorized security staff for this community.');
      }
      if (!membership.isAuthorized) {
        throw new Error('Forbidden: Revoked or suspended security staff authorization.');
      }
    }

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
