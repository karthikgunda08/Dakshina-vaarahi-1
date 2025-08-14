// src/services/walletService.ts
import { Transaction } from '../types/index';
import { BACKEND_API_BASE_URL } from '../lib/constants';
import { getToken } from './authService';

const fetchWalletApi = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required to access wallet.");
  }

  const headersInit: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const requestOptions: RequestInit = {
    ...options,
    headers: new Headers(headersInit),
  };

  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/wallet${endpoint}`, requestOptions);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
      throw new Error(errorData.message || 'An error occurred.');
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error('Failed to connect to the server. Please check your network connection.');
    }
    throw error;
  }
};

/**
 * Fetches the transaction history for the current user.
 */
export const getTransactions = async (page = 1, limit = 50): Promise<{transactions: Transaction[], totalPages: number, currentPage: number}> => {
  return fetchWalletApi(`/transactions?page=${page}&limit=${limit}`);
};
