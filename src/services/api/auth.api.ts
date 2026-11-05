import { apiRequest, setApiAuthToken, ApiResponse } from './client';

export interface UserAuthData {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    activeRole: string;
    eligibleRoles: string[];
    city: string;
    verificationStatus: string;
  };
  token: string;
}

export async function loginApi(
  email: string,
  password: string
): Promise<ApiResponse<UserAuthData>> {
  const res = await apiRequest<UserAuthData>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (res.data?.token) {
    setApiAuthToken(res.data.token);
  }
  return res;
}

export async function registerApi(data: {
  email: string;
  password: string;
  name: string;
  phone: string;
  city?: string;
  role?: string;
}): Promise<ApiResponse<UserAuthData>> {
  const res = await apiRequest<UserAuthData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (res.data?.token) {
    setApiAuthToken(res.data.token);
  }
  return res;
}

export async function getMeApi(): Promise<ApiResponse<any>> {
  return apiRequest('/auth/me');
}
