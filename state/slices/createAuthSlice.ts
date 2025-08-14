// src/state/slices/createAuthSlice.ts
import { StateCreator } from 'zustand';
import { AppStore, AuthSlice } from '../../types/index';
import * as authService from '../../services/authService';
import * as analyticsService from '../../services/analyticsService';
import * as socketService from '../../services/socketService';
import * as adminService from '../../services/adminService';
import * as guildService from '../../services/guildService';
import * as projectService from '../../services/projectService';

export const createAuthSlice: StateCreator<AppStore, [], [], AuthSlice> = (set, get) => ({
    currentUser: null,
    isLoadingAuth: true,
    authError: null,
    userAnalytics: null,
    guilds: [],
    myGuild: null,
    strategicInsights: null,

    initApp: async () => {
        const token = authService.getToken();
        if (token) {
            try {
                const user = await authService.getCurrentUserProfile();
                set({ currentUser: user, isLoadingAuth: false });
                analyticsService.setUser(user.id, { email: user.email, name: user.name });
                socketService.connectSocket(token);
                get().setupSocketListeners();
                get().refreshCurrentUser();
            } catch (error) {
                authService.clearToken();
                set({ currentUser: null, isLoadingAuth: false });
            }
        } else {
            set({ isLoadingAuth: false });
        }
        setTimeout(() => set({ globalLoadingMessage: null }), 500);
    },

    login: async (email, passwordPlain) => {
        set({ globalLoadingMessage: 'Logging in...', authError: null });
        try {
            const { token, user } = await authService.loginUser(email, passwordPlain);
            authService.storeToken(token);
            set({ currentUser: user, authModal: null });
            analyticsService.setUser(user.id, { email: user.email, name: user.name });
            analyticsService.trackEvent('User Logged In');
            socketService.connectSocket(token);
            get().setupSocketListeners();
            await get().refreshCurrentUser();
            set({ view: 'userDashboard' });
        } catch (error: any) {
            set({ authError: error.message });
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    register: async (email, passwordPlain, phoneNumber, whatsappOptIn) => {
        set({ globalLoadingMessage: 'Creating account...', authError: null });
        try {
            const { token, user } = await authService.registerUser(email, passwordPlain, phoneNumber, whatsappOptIn);
            authService.storeToken(token);
            set({ currentUser: user, authModal: null });
            analyticsService.setUser(user.id, { email: user.email, name: user.name });
            analyticsService.trackEvent('User Registered');
            socketService.connectSocket(token);
            get().setupSocketListeners();
            await get().refreshCurrentUser();
            set({
                view: 'userDashboard',
                onboardingChecklist: {
                    profileCompleted: false,
                    projectCreated: false,
                    aiToolUsed: false,
                    versionSaved: false,
                    featureSpotlightViewed: false,
                },
                isWelcomeModalOpen: true
            });
        } catch (error: any) {
            set({ authError: error.message });
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    forgotPassword: async (email: string) => {
        set({ globalLoadingMessage: 'Sending reset link...', authError: null });
        try {
            const { message } = await authService.forgotPassword(email);
            get().addNotification(message, 'success');
            set({ authModal: 'login' });
        } catch (error: any) {
            set({ authError: error.message });
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    logout: () => {
        authService.clearToken();
        socketService.disconnectSocket();
        set({ currentUser: null, projects: [], currentProject: null, view: 'landing' });
        analyticsService.trackEvent('User Logged Out');
    },

    refreshCurrentUser: async () => {
        try {
            const user = await authService.getCurrentUserProfile();
            const projects = await projectService.loadUserProjects();
            set({ currentUser: user, projects });
        } catch (error: any) {
            console.error('Failed to refresh user data:', error);
            get().addNotification("Your session may have expired. Please log in again.", 'error');
            get().logout();
        }
    },

    fetchUserAnalytics: async () => {
        try {
            const analytics = await authService.getUserAnalytics();
            set({ userAnalytics: analytics });
        } catch (error: any) {
            get().addNotification(`Failed to load analytics: ${error.message}`, 'error');
        }
    },
    
    // Guilds
    fetchGuilds: async () => {
        try {
            const guilds = await guildService.getGuilds();
            set({ guilds });
        } catch (error: any) {
            get().addNotification(`Failed to load guilds: ${error.message}`, 'error');
        }
    },
    fetchMyGuild: async () => {
        try {
            const myGuild = await guildService.getMyGuild(get().currentUser);
            set({ myGuild });
        } catch (error: any) {
            get().addNotification(`Failed to load your guild: ${error.message}`, 'error');
        }
    },
    createGuild: async (name) => {
        const user = get().currentUser;
        if (!user) return;
        set({ globalLoadingMessage: "Creating guild..." });
        try {
            const newGuild = await guildService.createGuild(name, user);
            set({ myGuild: newGuild, guilds: [...get().guilds, newGuild] });
            get().addNotification(`Guild "${name}" created successfully!`, 'success');
        } catch (error: any) {
            get().addNotification(`Failed to create guild: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    joinGuild: async (guildId) => {
        const user = get().currentUser;
        if (!user) return;
        set({ globalLoadingMessage: "Joining guild..." });
        try {
            const joinedGuild = await guildService.joinGuild(guildId, user);
            set({ myGuild: joinedGuild });
            get().addNotification(`Successfully joined "${joinedGuild.name}"!`, 'success');
        } catch (error: any) {
            get().addNotification(`Failed to join guild: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    leaveGuild: async () => {
        const { myGuild, currentUser } = get();
        if (!myGuild || !currentUser) return;
        set({ globalLoadingMessage: "Leaving guild..." });
        try {
            await guildService.leaveGuild(myGuild.id, currentUser);
            set({ myGuild: null });
            get().addNotification(`You have left "${myGuild.name}".`, 'info');
        } catch (error: any) {
            get().addNotification(`Failed to leave guild: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    fetchStrategicInsights: async () => {
        try {
            const insights = await adminService.getStrategicInsightsApi();
            set({ strategicInsights: insights });
        } catch (error: any) {
            get().addNotification(`Failed to fetch strategic insights: ${error.message}`, 'error');
        }
    }
});
