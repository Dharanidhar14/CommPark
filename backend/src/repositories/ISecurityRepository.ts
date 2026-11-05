export type VerificationResult = 'APPROVED' | 'DENIED' | 'EXIT_RECORDED';

export interface SecurityVerificationEntity {
  id: string;
  bookingId: string;
  guardId: string;
  gateNumber: string;
  verifiedAt: Date;
  licensePlateMatches: boolean;
  result: VerificationResult;
  failureReason?: string | null;
  guardIncentiveAmount: number;
  createdAt: Date;
}

export interface ISecurityRepository {
  createVerification(data: Omit<SecurityVerificationEntity, 'id' | 'createdAt'>): Promise<SecurityVerificationEntity>;
  findByBookingId(bookingId: string): Promise<SecurityVerificationEntity[]>;
  findRecentVerifications(guardId?: string, limit?: number): Promise<SecurityVerificationEntity[]>;
}
