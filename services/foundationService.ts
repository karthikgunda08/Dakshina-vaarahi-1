

// src/services/foundationService.ts
import { BACKEND_API_BASE_URL } from '../lib/constants';
import { getToken } from './authService';
import { Submission } from '../types/index';

const fetchWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
  const token = getToken();
  if (!token) {
    throw new Error("Authentication required for this action.");
  }

  const headersInit: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
  
  const requestOptions: RequestInit = {
    ...options,
    headers: new Headers(headersInit),
  };

  const response = await fetch(`${BACKEND_API_BASE_URL}/foundation${endpoint}`, requestOptions);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
    throw new Error(errorData.message || 'An error occurred.');
  }
  return response.json();
};

export const submitToVaarahiPrize = async (projectId: string, proposal: string): Promise<{ message: string }> => {
    return fetchWithAuth('/submit', {
        method: 'POST',
        body: JSON.stringify({ projectId, proposal }),
    });
};

export const getSubmissionsForOwner = async (): Promise<Submission[]> => {
    return fetchWithAuth('/submissions');
};

export const adjudicateSubmissionApi = async (submissionId: string): Promise<Submission> => {
    return fetchWithAuth(`/submissions/${submissionId}/adjudicate`, {
        method: 'POST',
    });
};