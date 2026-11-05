import { apiRequest, ApiResponse } from './client';

export interface VerifyPassPayload {
  qrCodeToken: string;
  licensePlate: string;
  gateNumber?: string;
}

export interface VerificationResultData {
  verification: {
    id: string;
    bookingId: string;
    guardId: string;
    gateNumber: string;
    verifiedAt: string;
    licensePlateMatches: boolean;
    result: 'APPROVED' | 'DENIED' | 'EXIT_RECORDED';
    guardIncentiveAmount: number;
  };
  status: 'APPROVED' | 'DENIED' | 'EXIT_RECORDED';
  message: string;
  booking?: any;
}

export async function verifyPassApi(
  payload: VerifyPassPayload
): Promise<ApiResponse<VerificationResultData>> {
  return apiRequest<VerificationResultData>('/security/verify', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function recordExitApi(
  bookingId: string,
  gateNumber: string = 'Gate 2'
): Promise<ApiResponse<any>> {
  return apiRequest('/security/exit', {
    method: 'POST',
    body: JSON.stringify({ bookingId, gateNumber }),
  });
}

export async function fetchRecentVerificationsApi(): Promise<ApiResponse<any[]>> {
  return apiRequest<any[]>('/security/recent');
}
