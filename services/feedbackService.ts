

// src/services/feedbackService.ts
import { getToken } from './authService';
import { BACKEND_API_BASE_URL } from '../lib/constants';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required to submit feedback.");
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
    const response = await fetch(`${BACKEND_API_BASE_URL}${endpoint}`, requestOptions);

    if (!response.ok) {
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
          console.error("Network or CORS error connecting to feedback endpoint:", error);
          throw new Error(`Failed to connect to the server. Please check your network connection.`);
      }
      throw error;
  }
};

export const submitFeedback = async (category: 'bug_report' | 'feature_request' | 'general_feedback', message: string): Promise<{ message: string }> => {
    return fetchWithAuth('/feedback', {
        method: 'POST',
        body: JSON.stringify({ category, message }),
    });
};