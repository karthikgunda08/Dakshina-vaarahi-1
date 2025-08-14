
// src/services/adminService.ts
import { KpiData, ProjectSummary, User, Feedback, KpiChartData, StrategicInsight } from '../types/index';
import { getToken } from './authService';
import { BACKEND_API_BASE_URL } from '../lib/constants';

const fetchAdminWithAuth = async (endpoint: string, options: RequestInit = {}): Promise<any> => {
    const token = getToken();
    if (!token) {
        throw new Error("No auth token found for admin request.");
    }

    const headersInit: HeadersInit = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };

    const requestOptions: RequestInit = { ...options, headers: new Headers(headersInit) };

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/admin${endpoint}`, requestOptions);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            const err = new Error(errorData.message || `Admin request failed with status ${response.status}`);
            (err as any).status = response.status;
            throw err;
        }
        return response.json();
    } catch (error) {
        if (error instanceof TypeError) {
            console.error("Network or CORS error connecting to admin endpoints:", error);
            throw new Error(`Failed to connect to the admin API. Please check server status and your connection.`);
        }
        throw error;
    }
};

const fetchAdminAI = async (endpoint: string, body: any): Promise<any> => {
    const token = getToken();
    if (!token) {
        throw new Error("No auth token found for admin AI request.");
    }
    
    const requestOptions: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
    };

    try {
        const response = await fetch(`${BACKEND_API_BASE_URL}/gemini${endpoint}`, requestOptions);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
            const err = new Error(errorData.message || `Admin AI request failed with status ${response.status}`);
            (err as any).status = response.status;
            throw err;
        }
        return response.json();
    } catch (error) {
         if (error instanceof TypeError) {
            console.error("Network or CORS error connecting to admin AI endpoints:", error);
            throw new Error(`Failed to connect to the admin AI API. Please check server status and your connection.`);
        }
        throw error;
    }
};


// --- KPI and Data Fetching ---
export const getKpiData = async (): Promise<KpiData> => {
    return fetchAdminWithAuth('/kpis');
};

export const getKpiChartData = async (): Promise<KpiChartData[]> => {
    return fetchAdminWithAuth('/kpi-chart-data');
};

export const getAllProjectsForOwner = async (): Promise<ProjectSummary[]> => {
    return fetchAdminWithAuth('/all-projects');
};

export const getAllUsersForOwner = async (): Promise<User[]> => {
    return fetchAdminWithAuth('/all-users');
};

export const getAllFeedback = async (): Promise<Feedback[]> => {
    return fetchAdminWithAuth('/all-feedback');
}

// NEW: Fetch strategic insights for Brahman Protocol
export const getStrategicInsightsApi = async (): Promise<StrategicInsight[]> => {
    return fetchAdminWithAuth('/strategic-insights');
};


// --- AI Tools ---
export const analyzeBusinessDataApi = async (query: string, kpiData: KpiData): Promise<{ answer: string }> => {
    return fetchAdminAI('/analyze-business-data', { query, kpiData });
};

export const analyzeSupportIssuesApi = async (projectNames: string[]): Promise<{ topIssues: any[], topSuggestions: any[] }> => {
    return fetchAdminAI('/analyze-support-issues', { projectNames });
};

export const generateSocialMediaPostApi = async (projectTitle: string, projectNarrative: string): Promise<{ post: string }> => {
    return fetchAdminAI('/generate-social-media-post', { projectTitle, projectNarrative });
};