// API Client Configuration for CommunityPark Mobile Frontend

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

let authToken: string | null = null;

export function setApiAuthToken(token: string | null) {
  authToken = token;
}

export function getApiAuthToken(): string | null {
  return authToken;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isOffline: boolean;
  status: number;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000); // 6s timeout for mobile resilience

    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      return {
        data: null,
        error: json?.error || `HTTP error ${res.status}`,
        isOffline: false,
        status: res.status,
      };
    }

    return {
      data: (json?.data !== undefined ? json.data : json) as T,
      error: null,
      isOffline: false,
      status: res.status,
    };
  } catch (err: any) {
    // Network failure, offline or timeout
    const isOffline =
      err.name === 'AbortError' ||
      err.message?.includes('Network request failed') ||
      err.message?.includes('Failed to fetch');

    return {
      data: null,
      error: isOffline
        ? 'Offline mode: server unavailable'
        : err.message || 'Network error',
      isOffline: true,
      status: 0,
    };
  }
}
