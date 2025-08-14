// src/types/user.ts

// =================================================================
// --- USER, AUTH, COLLABORATION ---
// =================================================================

export interface User {
  id: string;
  _id?: string;
  email: string;
  passwordHash?: string;
  credits: number;
  role: 'user' | 'owner';
  name?: string;
  profession?: string;
  skills?: string[];
  bio?: string;
  lastLogin?: Date;
  loginStreak?: number;
  trialExpiresAt?: Date;
  phoneNumber?: string;
  whatsappOptIn?: boolean;
  isProfilePublic?: boolean;
  portfolioUrl?: string;
  linkedInUrl?: string;
  profileImageUrl?: string;
  workspaces?: any[];
  marketplaceEarnings?: number;
  createdAt?: string;
  updatedAt?: string;
  guildId?: string;
  onboardingRewardClaimed?: boolean;
  developerHub?: any; // To be defined
  apiKey?: string;
  atmanSignature?: string;
  atmanSignatureFineTuned?: string;
  hasCompletedFirstMission?: boolean;
  atmanModelStatus?: 'none' | 'in_progress' | 'ready';
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface UpdateUserPayload {
  name?: string;
  profession?: string;
  bio?: string;
  isProfilePublic?: boolean;
  portfolioUrl?: string;
  linkedInUrl?: string;
  phoneNumber?: string;
  whatsappOptIn?: boolean;
  hasCompletedFirstMission?: boolean;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface UserAnalyticsData {
  totalProjects: number;
  loginStreak: number;
  activityLog: ActivityLog[];
}

export interface Collaborator {
  userId: {
    id: string;
    name: string;
    email: string;
    profileImageUrl?: string;
  };
  role: 'editor' | 'viewer';
}

export interface GuildMember {
  id: string;
  name: string;
  profileImageUrl?: string;
}
export interface BrahmanTierProject {
  id: string;
  title: string;
  description: string;
  budget: string;
  timeline: string;
  requiredSkills: string[];
}
export interface Guild {
  id: string;
  name: string;
  members: GuildMember[];
  activeProject: BrahmanTierProject | null;
}

export interface Submission {
  _id: string;
  userId: { email: string, name: string };
  projectId: { name: string };
  status: 'submitted' | 'under_review' | 'adjudicated';
  adjudicationReport?: any;
}

export interface Feedback {
    id: string;
    userId: { email: string, name: string };
    category: 'bug_report' | 'feature_request' | 'general_feedback';
    message: string;
    status: 'new' | 'in_progress' | 'resolved' | 'wont_fix';
    createdAt: string;
}

export interface StrategicInsight {
    id: string;
    finding: string;
    observation: string;
    hypothesis: string;
    actionable_intelligence: string;
}

export interface GenerativeIP {
    id: string;
    name: string;
    author: string;
    description: string;
    price: number;
    thumbnailUrl: string;
}

export interface ApiUsageStat {
    endpoint: string;
    calls: number;
    date: string;
}

export interface ChatMessage {
  userId: string;
  userName: string;
  text: string;
  isAI: boolean;
  timestamp: string;
}

export interface LiveCursor {
  x: number;
  y: number;
  userName: string;
  color: string;
}

export interface LiveSelection {
  userId: string;
  objectId: string;
  objectType: string;
}
