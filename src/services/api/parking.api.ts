import { apiRequest, ApiResponse } from './client';
import { ParkingSpace } from '../../types/parking';

export interface ParkingQueryParams {
  query?: string;
  locality?: string;
  category?: string;
  accessType?: string;
  supportedVehicle?: string;
  isCovered?: boolean;
  maxPrice?: number;
}

export async function fetchListingsApi(
  filters?: ParkingQueryParams
): Promise<ApiResponse<ParkingSpace[]>> {
  const queryParams = new URLSearchParams();
  if (filters) {
    if (filters.query) queryParams.append('query', filters.query);
    if (filters.locality) queryParams.append('locality', filters.locality);
    if (filters.category) queryParams.append('category', filters.category.toUpperCase());
    if (filters.accessType) queryParams.append('accessType', filters.accessType.toUpperCase());
    if (filters.supportedVehicle) queryParams.append('supportedVehicle', filters.supportedVehicle.toUpperCase());
    if (filters.isCovered !== undefined) queryParams.append('isCovered', String(filters.isCovered));
    if (filters.maxPrice !== undefined) queryParams.append('maxPrice', String(filters.maxPrice));
  }

  const queryStr = queryParams.toString();
  const endpoint = `/parking${queryStr ? `?${queryStr}` : ''}`;
  return apiRequest<ParkingSpace[]>(endpoint);
}

export async function fetchListingByIdApi(id: string): Promise<ApiResponse<ParkingSpace>> {
  return apiRequest<ParkingSpace>(`/parking/${id}`);
}

export async function fetchOwnerListingsApi(): Promise<ApiResponse<ParkingSpace[]>> {
  return apiRequest<ParkingSpace[]>('/parking/owner/my-listings');
}

export async function createListingApi(data: any): Promise<ApiResponse<ParkingSpace>> {
  return apiRequest<ParkingSpace>('/parking', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
