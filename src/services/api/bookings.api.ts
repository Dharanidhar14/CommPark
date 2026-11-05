import { apiRequest, ApiResponse } from './client';
import { Booking } from '../../types/booking';

export interface CreateBookingPayload {
  listingId: string;
  vehicleId: string;
  startTime: string;
  endTime: string;
  paymentMethod?: string;
  specialInstructions?: string;
}

export async function createBookingApi(
  payload: CreateBookingPayload
): Promise<ApiResponse<Booking>> {
  return apiRequest<Booking>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function fetchMyBookingsApi(): Promise<ApiResponse<Booking[]>> {
  return apiRequest<Booking[]>('/bookings');
}

export async function getBookingByIdApi(id: string): Promise<ApiResponse<Booking>> {
  return apiRequest<Booking>(`/bookings/${id}`);
}

export async function cancelBookingApi(
  id: string,
  reason?: string
): Promise<ApiResponse<{ booking: Booking; refundAmount: number }>> {
  return apiRequest(`/bookings/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
