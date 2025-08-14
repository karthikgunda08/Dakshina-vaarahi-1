// src/types/store.ts
import type { ReactNode, SetStateAction, RefObject } from 'react';
import type { 
    User, UserAnalyticsData, Guild, StrategicInsight, Collaborator, LiveCursor, LiveSelection, ChatMessage 
} from './user';
import type { CreditPack, Rfq } from './payments';
import type { Project, ProjectSummary, GeneratedDocument, GeneratedRender, HolocronHotspot, StagingSettings, GFCDrawingSet, DigitalTwinData, SelectedObject, ConstructionPhase, DigitalTwinDataOverlay, SunPosition, Point3D, CinematicTour } from './project';
import type { PanelState, UndoableState, SketcherTool, EditorMode, ContextMenuData, SketcherHandles, View3DHandles, PhoenixEngineTab, EditorSlice } from './editor';
import type { AiFixPreview, AdvancedStructuralReport, BrahmaAstraMission, BillOfQuantitiesReport, SustainabilityReport, VastuGridAnalysis, LokaSimulatorReport, NavagrahaReport, AkashaReport, SamsaraReport, ShilpaSutraReport, PrithviAstraReport, AgniAstraReport, NexusReport, AtmanSignatureResponse, ParamAstraResponse, SvaDharmaResponse, SanjeevaniReport, JuggernautPrediction, Sutra, AtmanSparringSession, BrahmaAstraReport, SamaranganSolution, AiFixResponse, InteriorSchemeResponse, SingularityReport } from './api';
import type { ProjectSlice } from './project';

// =================================================================
// --- NEWLY ADDED TYPES ---
// =================================================================

export interface ProactiveSuggestion {
    id: string;
    title: string;
    message: string;
    cta?: {
        label: string;
        action: (store: AppStore) => void;
    };
}

export interface OnboardingChecklist {
    profileCompleted: boolean;
    projectCreated: boolean;
    aiToolUsed: boolean;
    versionSaved: boolean;
    featureSpotlightViewed: boolean;
}

// =================================================================
// --- ZUSTAND STORE ---
// =================================================================

export type AppView =
  | 'landing' | 'userDashboard' | 'auraOS' | 'worldBuilder'
  | 'marketplace' | 'wallet' | 'astraSupplyChain' | 'guilds'
  | 'chronicles' | 'realEstateExchange' | 'auraCommandCenter' | 'brahmaAstra'
  | 'kwinCity' | 'clientPortal' | 'architectsFolio' | 'holocron' | 'resetPassword'
  | 'foundation' | 'communityShowcase' | 'publicProfile' | 'staging' | 'storyboard'
  | 'developer' | 'atmanForge' | 'sutraEngine' | 'terms' | 'privacy' | 'notFound';

export interface Command {
    id: string;
    label: string;
    category: string;
    action: () => void;
    icon?: ReactNode;
    disabled?: boolean;
}

export interface Notification {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info';
}

export interface AICompanionLogEntry {
  id: number;
  timestamp: number;
  type: 'user' | 'ai' | 'system';
  message: string;
  payload?: any;
}

// --- Slice Definitions ---

export interface AuthSlice {
    currentUser: User | null;
    isLoadingAuth: boolean;
    authError: string | null;
    userAnalytics: UserAnalyticsData | null;
    guilds: Guild[];
    myGuild: Guild | null;
    strategicInsights: StrategicInsight[] | null;
    initApp: () => Promise<void>;
    login: (email: string, passwordPlain: string) => Promise<void>;
    register: (email: string, passwordPlain: string, phoneNumber: string, whatsappOptIn: boolean) => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    logout: () => void;
    refreshCurrentUser: () => Promise<void>;
    fetchUserAnalytics: () => Promise<void>;
    fetchGuilds: () => Promise<void>;
    fetchMyGuild: () => Promise<void>;
    createGuild: (name: string) => Promise<void>;
    joinGuild: (guildId: string) => Promise<void>;
    leaveGuild: () => Promise<void>;
    fetchStrategicInsights: () => Promise<void>;
}

export interface UISlice {
    view: AppView;
    authModal: 'login' | 'register' | null;
    isProfilePageOpen: boolean;
    isHelpModalOpen: boolean;
    isFeedbackModalOpen: boolean;
    isSupportModalOpen: boolean;
    isBuyCreditsModalOpen: boolean;
    isExportModalOpen: boolean;
    isTokenizeModalOpen: boolean;
    isNewProjectModalOpen: boolean;
    isWelcomeModalOpen: boolean;
    projectToTokenize: ProjectSummary | null;
    selectedCreditPack: CreditPack | null;
    isCommandPaletteOpen: boolean;
    isLaunchSequenceActive: boolean;
    globalLoadingMessage: string | null;
    saveStatus: 'idle' | 'saving' | 'saved' | 'error';
    hasUnsavedChanges: boolean;
    panelStates: Record<string, PanelState>;
    contextMenu: ContextMenuData | null;
    isHotspotEditorOpen: boolean;
    hotspotEditorTarget: { position: Point3D, existingHotspotId?: string } | null;
    proactiveSuggestions: ProactiveSuggestion[];
    seenSpotlights: string[];
    onboardingChecklist: OnboardingChecklist | null;
    onboardingStep: number;
    set: (updater: (state: AppStore) => Partial<AppStore> | Partial<AppStore>) => void;
    setView: (view: AppView) => void;
    setAuthModal: (modal: 'login' | 'register' | null) => void;
    setProfilePageOpen: (isOpen: boolean) => void;
    setBuyCreditsModalOpen: (isOpen: boolean, pack?: CreditPack | null) => void;
    setHelpModalOpen: (isOpen: boolean) => void;
    setFeedbackModalOpen: (isOpen: boolean) => void;
    setSupportModalOpen: (isOpen: boolean) => void;
    setExportModalOpen: (isOpen: boolean) => void;
    setTokenizeModalOpen: (isOpen: boolean, project: ProjectSummary | null) => void;
    setNewProjectModalOpen: (isOpen: boolean) => void;
    setWelcomeModalOpen: (isOpen: boolean) => void;
    setIsCommandPaletteOpen: (updater: SetStateAction<boolean>) => void;
    setGlobalLoading: (message: string | null) => void;
    setLaunchSequenceActive: (isActive: boolean) => void;
    setPanelStates: (updater: SetStateAction<Record<string, PanelState>>) => void;
    togglePanelVisibility: (panelId: string) => void;
    focusPanel: (panelId: string) => void;
    setContextMenu: (menu: ContextMenuData | null) => void;
    setHotspotEditorOpen: (isOpen: boolean, target?: { position: Point3D, existingHotspotId?: string } | null) => void;
    addProactiveSuggestion: (suggestion: Omit<ProactiveSuggestion, 'id'>) => void;
    dismissProactiveSuggestion: (id: string) => void;
    markSpotlightSeen: (spotlightId: string) => void;
    addNotification: (message: string, type: 'success' | 'error' | 'info') => void;
    completeOnboardingChecklistItem: (item: keyof OnboardingChecklist) => void;
    startInteractiveTutorial: () => void;
    advanceTutorialStep: () => void;
    endInteractiveTutorial: () => void;
}

export interface AISlice {
    aiFixPreview: AiFixPreview | null;
    cinematicTourData: CinematicTour | null;
    isCinematicTourPlaying: boolean;
    activeTool: PhoenixEngineTab;
    advancedStructuralReport: AdvancedStructuralReport | null;
    vastuGridAnalysis: VastuGridAnalysis | null;
    showVastuGrid: boolean;
    companionLog: AICompanionLogEntry[];
    isCompanionActive: boolean;
    companionState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';
    companionTranscript: string | null;
    billOfQuantities: BillOfQuantitiesReport | null;
    sustainabilityReport: SustainabilityReport | null;
    brahmaAstraReport: BrahmaAstraReport | null;
    isBrahmaAstraRunning: boolean;
    lokaSimulatorReport: LokaSimulatorReport | null;
    navagrahaReport: NavagrahaReport | null;
    akashaReport: AkashaReport | null;
    samsaraReport: SamsaraReport | null;
    shilpaSutraReport: ShilpaSutraReport | null;
    prithviAstraReport: PrithviAstraReport | null;
    agniAstraReport: AgniAstraReport | null;
    nexusReport: NexusReport | null;
    atmanSignature: string | null;
    atmanSignatureReport: AtmanSignatureResponse | null;
    paramAstraReport: ParamAstraResponse | null;
    svaDharmaReport: SvaDharmaResponse | null;
    sanjeevaniReport: SanjeevaniReport | null;
    isSingularityRunning: boolean;
    singularityProgress: string | null;
    singularityReport: SingularityReport | null;
    isBrahmandaAstraActive: boolean;
    generativeFeedbackActive: boolean;
    isJuggernautModeActive: boolean;
    realityMesh: any | null; // TerrainMesh
    juggernautPredictions: JuggernautPrediction[] | null;
    fixingDiscrepancyId: string | null;
    juggernautIntervalId: number | null;
    isDigitalTwinModeActive: boolean;
    digitalTwinData: DigitalTwinData | null;
    activeDataOverlays: DigitalTwinDataOverlay;
    constructionSequence: ConstructionPhase[] | null;
    activeTimelineWeek: number | null;
    atmanSparringHistory: AtmanSparringSession[];
    sutras: Sutra[];
    runningSutraId: string | null;
    sutraExecutionLogs: string[];
    isSimulatingLiveData: boolean;
    samaranganSolutions: SamaranganSolution[] | null;
    lastAiToolRun: string | null;
    setLastAiToolRun: (tool: string | null) => void;
    setSamaranganSolutions: (solutions: SamaranganSolution[] | null) => void;
    proposeSamaranganFixes: (command: string) => Promise<void>;
    applySamaranganFix: (fix: AiFixResponse['fix']) => void;
    setIsSimulatingLiveData: (isSimulating: boolean) => void;
    setAiFixPreview: (fix: AiFixPreview | null) => void;
    setIsCinematicTourPlaying: (isPlaying: boolean) => void;
    setActiveTool: (tool: PhoenixEngineTab) => void;
    setCompanionState: (state: 'idle' | 'listening' | 'thinking' | 'speaking' | 'error') => void;
    setCompanionTranscript: (transcript: string | null) => void;
    setShowVastuGrid: (show: boolean | ((s: boolean) => boolean)) => void;
    runBrahmaAstra: (mission: BrahmaAstraMission) => Promise<void>;
    runSvaDharmaAnalyzer: () => Promise<void>;
    runVisualSvaDharmaAnalyzer: (files: FileList) => Promise<void>;
    runAiFurnishRoom: (roomId: string, style: string, atmanSignature?: string, applyPlacement?: boolean, existingResult?: InteriorSchemeResponse | null) => Promise<InteriorSchemeResponse | void>;
    toggleJuggernautMode: () => void;
    runSiteAdjudicator: () => Promise<void>;
    toggleDigitalTwinMode: () => Promise<void>;
    setIsBrahmandaAstraActive: (value: boolean) => void;
    setVastuGridAnalysis: (analysis: VastuGridAnalysis | null) => void;
    setAdvancedStructuralReport: (report: AdvancedStructuralReport | null) => void;
    setBillOfQuantities: (report: BillOfQuantitiesReport | null) => void;
    setSustainabilityReport: (report: SustainabilityReport | null) => void;
    setDrawingSet: (set: GFCDrawingSet | null) => void;
    setCinematicTourData: (tour: CinematicTour | null) => void;
    setLokaSimulatorReport: (report: LokaSimulatorReport | null) => void;
    setNavagrahaReport: (report: NavagrahaReport | null) => void;
    setAkashaReport: (report: AkashaReport | null) => void;
    setSamsaraReport: (report: SamsaraReport | null) => void;
    setShilpaSutraReport: (report: ShilpaSutraReport | null) => void;
    setPrithviAstraReport: (report: PrithviAstraReport | null) => void;
    setAgniAstraReport: (report: AgniAstraReport | null) => void;
    setNexusReport: (report: NexusReport | null) => void;
    setSvaDharmaReport: (report: SvaDharmaResponse | null) => void;
    setAtmanSignatureReport: (report: AtmanSignatureResponse | null) => void;
    setParamAstraReport: (report: ParamAstraResponse | null) => void;
    setSanjeevaniReport: (report: SanjeevaniReport | null) => void;
    runSingularityEngine: () => Promise<void>;
    setSingularityReport: (report: SingularityReport | null) => void;
    setActiveDataOverlays: (updater: (prev: DigitalTwinDataOverlay) => DigitalTwinDataOverlay) => void;
    setActiveTimelineWeek: (week: number | null | ((prev: number | null) => number | null)) => void;
    startSparringSession: (prompt: string) => Promise<void>;
    loadSutras: () => Promise<void>;
    saveSutra: (sutra: Omit<Sutra, '_id'>) => Promise<void>;
    executeSutra: (sutraId: string, projectId: string) => void;
}

export interface CollaborationSlice {
    chatHistory: ChatMessage[];
    collaborators: Collaborator[];
    liveCursors: Record<string, LiveCursor>;
    liveSelections: Record<string, LiveSelection>;
    setChatHistory: (messages: ChatMessage[]) => void;
    addChatMessage: (message: ChatMessage) => void;
    setCollaborators: (collaborators: Collaborator[]) => void;
    setLiveCursors: (updater: SetStateAction<Record<string, LiveCursor>>) => void;
    setLiveSelections: (updater: SetStateAction<Record<string, LiveSelection>>) => void;
    setupSocketListeners: () => void;
}

export interface AppStore extends AuthSlice, UISlice, ProjectSlice, EditorSlice, AISlice, CollaborationSlice {}
