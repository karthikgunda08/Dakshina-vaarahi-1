

// src/services/astraService.ts
import { Supplier, Quote, BoqItem } from '../types/index';
import { BACKEND_API_BASE_URL } from '../lib/constants';
import { getToken } from './authService';

const fetchAstraApi = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const token = getToken();
    if (!token) throw new Error("Authentication required for Astra Network.");

    const headers: HeadersInit = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
    };
    const requestOptions: RequestInit = { ...options, headers: new Headers(headers) };

    const response = await fetch(`${BACKEND_API_BASE_URL}/astra${endpoint}`, requestOptions);

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Astra Network request failed.');
    }
    return response.json();
};

export const findSuppliers = (materialCategory: string): Promise<Supplier[]> => {
    return fetchAstraApi(`/suppliers?materialCategory=${encodeURIComponent(materialCategory)}`);
};

export const getProjectQuotes = (projectId: string): Promise<Quote[]> => {
    return fetchAstraApi(`/projects/${projectId}/quotes`);
};

export const createRfqForProject = (projectId: string, items: BoqItem[]): Promise<{ message: string }> => {
    return fetchAstraApi(`/projects/${projectId}/rfq`, {
        method: 'POST',
        body: JSON.stringify({ items }),
    });
};

export const getUserQuotes = (): Promise<Quote[]> => {
    return fetchAstraApi('/quotes');
};
