import { apiRequest, ApiResponse } from './client';
import { RegisteredVehicle } from '../../types/booking';

export async function fetchVehiclesApi(): Promise<ApiResponse<RegisteredVehicle[]>> {
  return apiRequest<RegisteredVehicle[]>('/vehicles');
}

export async function addVehicleApi(
  vehicle: Omit<RegisteredVehicle, 'id' | 'userId'>
): Promise<ApiResponse<RegisteredVehicle>> {
  return apiRequest<RegisteredVehicle>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicle),
  });
}

export async function updateVehicleApi(
  id: string,
  updates: Partial<RegisteredVehicle>
): Promise<ApiResponse<RegisteredVehicle>> {
  return apiRequest<RegisteredVehicle>(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

export async function deleteVehicleApi(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/vehicles/${id}`, {
    method: 'DELETE',
  });
}

export async function setDefaultVehicleApi(id: string): Promise<ApiResponse<{ message: string }>> {
  return apiRequest<{ message: string }>(`/vehicles/${id}/default`, {
    method: 'POST',
  });
}
