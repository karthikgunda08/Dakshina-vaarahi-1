// src/services/guildService.ts
import { Guild, User, BrahmanTierProject, GuildMember } from '../types/index';

// --- MOCK DATABASE ---
const mockBrahmanProjects: BrahmanTierProject[] = [
  {
    id: 'proj_brahman_1',
    title: 'Himalayan Wellness Retreat',
    description: 'A luxury sustainable retreat integrating advanced Vastu principles.',
    budget: 'High',
    timeline: '18 Months',
    requiredSkills: ['Vastu', 'Sustainable Design', 'Luxury Hospitality']
  },
  {
    id: 'proj_brahman_2',
    title: 'Mumbai Arcology Prototype',
    description: 'A self-sustaining vertical city concept for dense urban environments.',
    budget: 'Very High',
    timeline: '36 Months',
    requiredSkills: ['Master Planning', 'Parametric Design', 'Structural Engineering']
  }
];

let mockGuilds: Guild[] = [
  {
    id: 'guild_1',
    name: 'The Vastu Visionaries',
    members: [{ id: 'user_1', name: 'A. Sharma' }, { id: 'user_2', name: 'P. Rao' }] as GuildMember[],
    activeProject: mockBrahmanProjects[0]
  },
  {
    id: 'guild_2',
    name: 'Urban Futurists',
    members: [{ id: 'user_3', name: 'R. Chen' }] as GuildMember[],
    activeProject: mockBrahmanProjects[1]
  }
];

const generateId = () => `guild_${Date.now()}`;

const simulateDelay = <T>(data: T): Promise<T> => 
    new Promise(resolve => setTimeout(() => resolve(JSON.parse(JSON.stringify(data))), 500));

// --- MOCK API FUNCTIONS ---

export const getGuilds = async (): Promise<Guild[]> => {
    return simulateDelay(mockGuilds);
};

export const getMyGuild = async (currentUser: User | null): Promise<Guild | null> => {
    if (!currentUser?.guildId) return simulateDelay(null);
    const guild = mockGuilds.find(g => g.id === currentUser.guildId) || null;
    return simulateDelay(guild);
};

export const createGuild = async (name: string, creator: User): Promise<Guild> => {
    if (mockGuilds.some(g => g.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("A guild with this name already exists.");
    }
    const newGuild: Guild = {
        id: generateId(),
        name,
        members: [{ id: creator.id, name: creator.name || creator.email, profileImageUrl: creator.profileImageUrl }],
        activeProject: null,
    };
    mockGuilds.push(newGuild);
    return simulateDelay(newGuild);
};

export const joinGuild = async (guildId: string, user: User): Promise<Guild> => {
    const guild = mockGuilds.find(g => g.id === guildId);
    if (!guild) throw new Error("Guild not found.");
    if (guild.members.some(m => m.id === user.id)) return guild; // Already a member

    guild.members.push({ id: user.id, name: user.name || user.email, profileImageUrl: user.profileImageUrl });
    return simulateDelay(guild);
};

export const leaveGuild = async (guildId: string, user: User): Promise<{ message: string }> => {
    const guild = mockGuilds.find(g => g.id === guildId);
    if (!guild) throw new Error("Guild not found.");
    
    guild.members = guild.members.filter(m => m.id !== user.id);

    // If guild becomes empty, delete it
    if (guild.members.length === 0) {
        mockGuilds = mockGuilds.filter(g => g.id !== guildId);
    }

    return simulateDelay({ message: "You have left the guild." });
};
