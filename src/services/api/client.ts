// API Client Configuration for CommunityPark Mobile Frontend
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const TOKEN_STORAGE_KEY = 'commpark_auth_token_secure';

let authToken: string | null = null;

// Initialize token from SecureStore asynchronously
(async () => {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.localStorage) {
        authToken = window.localStorage.getItem(TOKEN_STORAGE_KEY);
      }
    } else {
      authToken = await SecureStore.getItemAsync(TOKEN_STORAGE_KEY);
    }
  } catch {
    // Ignore initialization failure in non-storage environments
  }
})();

export async function setApiAuthToken(token: string | null): Promise<void> {
  authToken = token;
  try {
    if (!token) {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.removeItem(TOKEN_STORAGE_KEY);
        }
      } else {
        await SecureStore.deleteItemAsync(TOKEN_STORAGE_KEY);
      }
    } else {
      if (Platform.OS === 'web') {
        if (typeof window !== 'undefined' && window.localStorage) {
          window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
        }
      } else {
        await SecureStore.setItemAsync(TOKEN_STORAGE_KEY, token);
      }
    }
  } catch {
    // Graceful fallback to memory storage
  }
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

    // Automatic token cleanup on session expiration
    if (res.status === 401) {
      await setApiAuthToken(null);
    }

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
