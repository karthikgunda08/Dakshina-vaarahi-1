
// services/authService.ts
import type { User, AuthResponse, UpdateUserPayload, ChangePasswordPayload, UserAnalyticsData } from '../types/index';
import { BACKEND_API_BASE_URL } from '../lib/constants';

const TOKEN_KEY = 'dakshin_vaarahi_auth_token';

// ---- Token Management ----
export const storeToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

// ---- API Helper ----
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  const headersInit: HeadersInit = options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' };
  
  if (token) {
    headersInit['Authorization'] = `Bearer ${token}`;
  }
  
  const requestOptions: RequestInit = {
    ...options,
    headers: new Headers(headersInit),
  };

  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
      if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
      const err = new Error(errorData.message || `Request failed with status ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }

    if (response.status === 204) {
      return null; 
    }
    return response.json();
  } catch (error) {
      if (error instanceof TypeError) {
          console.error("Network or CORS error connecting to auth endpoints:", error);
          throw new Error(`Failed to connect to the backend server. Please check the server status and your network connection.`);
      }
      throw error;
  }
};


// ---- Authentication ----
export const registerUser = async (email: string, passwordPlain: string, phoneNumber: string, whatsappOptIn: boolean): Promise<AuthResponse> => {
  return fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password: passwordPlain, phoneNumber, whatsappOptIn }),
  });
};

export const loginUser = async (email: string, passwordPlain: string): Promise<AuthResponse> => {
  return fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password: passwordPlain }),
  });
};

export const forgotPassword = async (email: string): Promise<{ message: string }> => {
    return fetchWithAuth('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
    });
};

export const resetPassword = async (token: string, password: string): Promise<AuthResponse> => {
    return fetchWithAuth(`/auth/reset-password/${token}`, {
        method: 'POST',
        body: JSON.stringify({ password }),
    });
};

export const logoutUser = (): void => {
  clearToken();
};

export const getCurrentUserProfile = async (): Promise<User> => {
  return fetchWithAuth('/auth/me'); 
};

// --- User Profile & Analytics ---
export const getUserAnalytics = async (): Promise<UserAnalyticsData> => {
  return fetchWithAuth('/auth/me/analytics');
};

export const updateUserProfile = async (payload: Partial<UpdateUserPayload>): Promise<User> => {
  return fetchWithAuth('/auth/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
};

export const changeUserPassword = async (payload: ChangePasswordPayload): Promise<{ message: string }> => {
  return fetchWithAuth('/auth/me/change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

// --- PUBLIC VIEWS ---
export const getPublicProjectByShareLink = async (shareableLink: string): Promise<{ project: any }> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/projects/public/${shareableLink}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not fetch project.');
    }
    return response.json();
};

export const getPublicFolioApi = async (shareableLink: string): Promise<{ project: any }> => {
    const response = await fetch(`${BACKEND_API_BASE_URL}/projects/folio/${shareableLink}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Could not fetch folio.');
    }
    return response.json();
};

export const generateApiKey = async (): Promise<{ apiKey: string }> => {
  return fetchWithAuth('/auth/me/api-key', {
    method: 'POST',
  });
};