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
    await setApiAuthToken(res.data.token);
  }
  return res;
}

export async function registerApi(data: {
  email: string;
  password: string;
  name: string;
  phone: string;
  city?: string;
}): Promise<ApiResponse<UserAuthData>> {
  const res = await apiRequest<UserAuthData>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
  });

  if (res.data?.token) {
    await setApiAuthToken(res.data.token);
  }
  return res;
}

export async function switchRoleApi(role: string): Promise<ApiResponse<UserAuthData>> {
  const res = await apiRequest<UserAuthData>('/auth/switch-role', {
    method: 'POST',
    body: JSON.stringify({ role: role.toUpperCase() }),
  });

  if (res.data?.token) {
    await setApiAuthToken(res.data.token);
  }
  return res;
}

export async function getMeApi(): Promise<ApiResponse<any>> {
  return apiRequest('/auth/me');
}

export async function logoutApi(): Promise<ApiResponse<any>> {
  const res = await apiRequest('/auth/logout', { method: 'POST' });
  await setApiAuthToken(null);
  return res;
}
