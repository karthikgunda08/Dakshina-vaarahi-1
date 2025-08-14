// src/services/communityService.ts
import { ProjectSummary, User, Project } from '../types/index';
import { BACKEND_API_BASE_URL } from '../lib/constants';

// --- PUBLIC-FACING API CALLS (NO AUTH NEEDED) ---

const fetchPublic = async (endpoint: string): Promise<any> => {
  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/community${endpoint}`);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
      const err = new Error(errorData.message || `Request failed with status ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  } catch (error) {
    if (error instanceof TypeError) {
      console.error("Network or CORS error connecting to community endpoints:", error);
      throw new Error(`Failed to connect to the community API. Please check server status and your network connection.`);
    }
    throw error;
  }
};

/**
 * Fetches all projects that have been made public for the showcase.
 */
export const getPublicProjects = async (): Promise<ProjectSummary[]> => {
  return fetchPublic('/projects');
};

/**
 * Fetches a single user's public profile data along with their public projects.
 */
export const getPublicUserProfile = async (userId: string): Promise<{ user: User, projects: ProjectSummary[] }> => {
  return fetchPublic(`/users/${userId}`);
};

/**
 * NEW: Fetches the single featured project for the dashboard showcase.
 */
export const getFeaturedProjectApi = async (): Promise<Project> => {
    return fetchPublic('/featured-project');
};
