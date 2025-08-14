// src/state/slices/createUISlice.ts
import { StateCreator } from 'zustand';
import { AppStore, UISlice, PanelId, ContextMenuData, Point3D, CreditPack, ProactiveSuggestion, PanelState, ProjectSummary, OnboardingChecklist } from '../../types/index';
import { useNotificationStore } from '../notificationStore';
import * as authService from '../../services/authService';

const generateId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const initialPanelStates = {
  phoenixEngine: { id: 'phoenixEngine' as PanelId, x: window.innerWidth - 470, y: 80, width: 450, height: 700, zIndex: 10, isVisible: true },
  propertiesPanel: { id: 'propertiesPanel' as PanelId, x: window.innerWidth - 370, y: 80, width: 350, height: 500, zIndex: 10, isVisible: false },
  projectHub: { id: 'projectHub' as PanelId, x: 100, y: 100, width: 800, height: 600, zIndex: 10, isVisible: false },
  layersPanel: { id: 'layersPanel' as PanelId, x: window.innerWidth - 830, y: 80, width: 350, height: 300, zIndex: 10, isVisible: false },
  chatPanel: { id: 'chatPanel' as PanelId, x: 150, y: 150, width: 400, height: 550, zIndex: 10, isVisible: false },
  analyticsPanel: { id: 'analyticsPanel' as PanelId, x: 200, y: 200, width: 600, height: 450, zIndex: 10, isVisible: false },
  digitalTwinPanel: { id: 'digitalTwinPanel' as PanelId, x: 250, y: 250, width: 380, height: 400, zIndex: 10, isVisible: false },
  integrationsPanel: { id: 'integrationsPanel' as PanelId, x: 300, y: 300, width: 500, height: 400, zIndex: 10, isVisible: false },
};

export const createUISlice: StateCreator<AppStore, [], [], UISlice> = (set, get) => ({
    view: 'landing',
    authModal: null,
    isProfilePageOpen: false,
    isHelpModalOpen: false,
    isFeedbackModalOpen: false,
    isSupportModalOpen: false,
    isBuyCreditsModalOpen: false,
    isExportModalOpen: false,
    isTokenizeModalOpen: false,
    isNewProjectModalOpen: false,
    isWelcomeModalOpen: false,
    projectToTokenize: null,
    selectedCreditPack: null,
    isCommandPaletteOpen: false,
    isLaunchSequenceActive: true,
    globalLoadingMessage: "Initializing App...",
    saveStatus: 'idle',
    hasUnsavedChanges: false,
    panelStates: initialPanelStates,
    contextMenu: null,
    isHotspotEditorOpen: false,
    hotspotEditorTarget: null,
    proactiveSuggestions: [],
    seenSpotlights: [],
    onboardingChecklist: null,
    onboardingStep: -1, // -1 means tutorial is not active
    set: (updater) => set(updater),
    setView: (view) => set({ view, hasUnsavedChanges: view === 'auraOS' ? get().hasUnsavedChanges : false }),
    setAuthModal: (modal) => set({ authModal: modal }),
    setProfilePageOpen: (isOpen) => set({ isProfilePageOpen: isOpen }),
    setBuyCreditsModalOpen: (isOpen, pack = null) => set({ isBuyCreditsModalOpen: isOpen, selectedCreditPack: pack }),
    setHelpModalOpen: (isOpen) => set({ isHelpModalOpen: isOpen }),
    setFeedbackModalOpen: (isOpen) => set({ isFeedbackModalOpen: isOpen }),
    setSupportModalOpen: (isOpen) => set({ isSupportModalOpen: isOpen }),
    setExportModalOpen: (isOpen) => set({ isExportModalOpen: isOpen }),
    setTokenizeModalOpen: (isOpen, project) => set({ isTokenizeModalOpen: isOpen, projectToTokenize: project }),
    setNewProjectModalOpen: (isOpen) => set({ isNewProjectModalOpen: isOpen }),
    setWelcomeModalOpen: (isOpen) => set({ isWelcomeModalOpen: isOpen }),
    setIsCommandPaletteOpen: (updater) => set(state => ({ isCommandPaletteOpen: typeof updater === 'function' ? updater(state.isCommandPaletteOpen) : updater })),
    setGlobalLoading: (message) => set({ globalLoadingMessage: message }),
    setLaunchSequenceActive: (isActive) => {
        set({ isLaunchSequenceActive: isActive });
    },
    setPanelStates: (updater) => set(state => ({ panelStates: typeof updater === 'function' ? updater(state.panelStates) : updater })),
    togglePanelVisibility: (panelId) => set(state => ({
        panelStates: {
            ...state.panelStates,
            [panelId]: { ...state.panelStates[panelId], isVisible: !state.panelStates[panelId].isVisible, zIndex: Math.max(...Object.values(state.panelStates).map((p: PanelState) => p.zIndex)) + 1 }
        }
    })),
    focusPanel: (panelId) => set(state => ({
        panelStates: {
            ...state.panelStates,
            [panelId]: { ...state.panelStates[panelId], zIndex: Math.max(...Object.values(state.panelStates).map((p: PanelState) => p.zIndex)) + 1 }
        }
    })),
    setContextMenu: (menu) => set({ contextMenu: menu }),
    setHotspotEditorOpen: (isOpen, target = null) => set({ isHotspotEditorOpen: isOpen, hotspotEditorTarget: target }),
    addProactiveSuggestion: (suggestion) => {
        const newSuggestion = { ...suggestion, id: generateId('suggestion') };
        set(state => ({ proactiveSuggestions: [...state.proactiveSuggestions, newSuggestion] }));
        setTimeout(() => get().dismissProactiveSuggestion(newSuggestion.id), 10000);
    },
    dismissProactiveSuggestion: (id) => set(state => ({ proactiveSuggestions: state.proactiveSuggestions.filter(s => s.id !== id) })),
    markSpotlightSeen: (spotlightId) => set(state => ({ seenSpotlights: [...state.seenSpotlights, spotlightId] })),
    addNotification: (message, type) => useNotificationStore.getState().addNotification(message, type),
    
    // Onboarding Actions
    completeOnboardingChecklistItem: (item) => {
        set(state => {
            if (!state.onboardingChecklist || state.onboardingChecklist[item]) {
                return {}; // No change if checklist doesn't exist or item is already completed
            }
            return {
                onboardingChecklist: {
                    ...state.onboardingChecklist,
                    [item]: true,
                }
            };
        });
    },
    startInteractiveTutorial: () => set({ onboardingStep: 0 }),
    advanceTutorialStep: () => {
        const TUTORIAL_STEPS_LENGTH = 4; // Based on InteractiveTutorial.tsx
        const currentStep = get().onboardingStep;
        if (currentStep + 1 >= TUTORIAL_STEPS_LENGTH) {
            get().addNotification("Tutorial complete! You're ready to build.", 'success');
            get().endInteractiveTutorial();
        } else {
            set({ onboardingStep: currentStep + 1 });
        }
    },
    endInteractiveTutorial: () => {
        const { currentUser, refreshCurrentUser, addNotification } = get();
        // Check if the first mission reward should be given
        if (currentUser && !currentUser.hasCompletedFirstMission) {
            authService.updateUserProfile({ hasCompletedFirstMission: true }).then(() => {
                refreshCurrentUser();
                addNotification("Mission Complete! +25 bonus credits awarded.", 'success');
            }).catch(err => {
                addNotification(`Error completing mission: ${err.message}`, 'error');
            });
        }
        set({ onboardingStep: -1 });
    },
});