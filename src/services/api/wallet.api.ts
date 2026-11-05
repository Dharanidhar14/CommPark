import { apiRequest, ApiResponse } from './client';

export interface WalletData {
  id: string;
  userId: string;
  availableBalance: number;
  earnedAsOwner: number;
  earnedAsGuard: number;
  pendingCredits: number;
  currency: string;
}

export interface WalletTransactionData {
  id: string;
  txNumber: string;
  type: string;
  title: string;
  amount: number;
  status: string;
  category: string;
  createdAt: string;
}

export async function fetchWalletApi(): Promise<ApiResponse<WalletData>> {
  return apiRequest<WalletData>('/wallet');
}

export async function fetchTransactionsApi(
  limit: number = 50
): Promise<ApiResponse<WalletTransactionData[]>> {
  return apiRequest<WalletTransactionData[]>(`/wallet/transactions?limit=${limit}`);
}

export async function topUpWalletApi(
  amount: number,
  paymentMethod: string = 'UPI (Instant)'
): Promise<ApiResponse<{ wallet: WalletData; transaction: WalletTransactionData }>> {
  return apiRequest('/wallet/topup', {
    method: 'POST',
    body: JSON.stringify({ amount, paymentMethod }),
  });
}
