// src/types/api.ts
import type { Wall, Room, Placement, PlacedModel, DimensionLine, PlumbingLine, ElectricalLayout, HvacLayout, TerrainMesh, ProjectData, GFCDrawingSet, Zone, InfrastructureLine, Footing, ProjectSummary, Level, ConstructionPhase, SelectedObject } from './project';

// =================================================================
// --- NEWLY ADDED TYPES ---
// =================================================================

export interface BillOfQuantitiesReport {
    summary: string;
    lineItems: BoqItem[];
}
export interface BoqItem {
    item: string;
    description: string;
    quantity: number;
    unit: string;
}

export interface SustainabilityReport {
    score: number;
    summary: string;
    scoreBreakdown: { metric: string; score: number; assessment: string }[];
    recommendations: { title: string; description: string }[];
}

export interface VastuGridAnalysis {
    padas: {
        id: number;
        zone: string;
        direction: string;
        element: string;
        deity: string;
        roomType: string | null;
        compliance: 'good' | 'neutral' | 'bad';
        reason: string;
    }[];
}


// =================================================================
// --- AI & GEMINI SERVICE ---
// =================================================================

export interface AiSketchToPlanResponse {
  levels: Level[];
  rooms?: Room[];
}

export interface AiResearchResponse {
  text: string;
  sources: { web: { uri: string, title: string } }[];
}

export interface AiFixResponse {
  fix: {
    addedWalls?: Omit<Wall, 'id' | 'height' | 'thickness' | 'layerId'>[];
    modifiedWalls?: Partial<Wall>[];
    deletedWallIds?: string[];
  };
}

export interface AiFixPreview {
    commentId: string;
    fix: AiFixResponse['fix'];
}

export interface CodeComplianceReport {
  standard: string;
  summary: string;
  overallResult: 'Pass' | 'Fail' | 'Pass with warnings';
  items: { check: string; details: string; status: 'Pass' | 'Fail' | 'Warning' }[];
}

export interface MaterialAnalysisReport {
  materialName: string;
  description: string;
  sustainabilityScore: number;
  pros: string[];
  cons: string[];
  typicalUseCases: string[];
}

export interface AdvancedStructuralReport {
  loadBearingWalls: string[];
  preliminaryLoadCalculations: { area: string; deadLoad: string; liveLoad: string }[];
  sizingSuggestions: { type: 'column' | 'beam'; location?: any; p1?: any; p2?: any; suggestedSize: string; reason: string }[];
  summary: string;
}

export interface MasterArchitectResponseWrapper {
  persona: string;
  concept: MasterArchitectResponse;
}
export interface MultiConceptResponse extends Array<MasterArchitectResponseWrapper> {}


export interface ProjectCertificationReport {
  certificationStatus: 'Certified' | 'Certified with Recommendations' | 'Needs Review';
  executiveSummary: string;
  scorecard: {
    vastu: number;
    structural: number;
    sustainability: number;
    flow: number;
    compliance: number;
  };
}

export interface SiteAnalysisReport {
  summary: string;
  optimalPlacementSuggestion: { x: number; y: number; reason: string };
  foundationSuggestion: { type: string; reason: string };
  drainageSuggestion: { description: string; paths: { x: number; y: number }[][] };
}

export interface MasterArchitectResponse {
  projectData: ProjectData & { billOfQuantities?: BillOfQuantitiesReport, sustainabilityReport?: SustainabilityReport };
  structuralReport: AdvancedStructuralReport;
  vastuReport: VastuGridAnalysis;
  boq: BillOfQuantitiesReport;
  previewRender: { imageUrl: string; prompt: string };
  summary: string;
  refinedPrompt?: string;
}

export interface SuggestedItem {
    name: string;
    modelKey: string;
    x: number;
    y: number;
    rotation: number;
    width?: number;
    depth?: number;
    height3d?: number;
    justification: string;
    roomId?: string;
}

export interface InteriorSchemeResponse {
  designNarrative: string;
  materials: {
    floor: { materialKey: string, justification: string },
    primaryWall: { materialKey: string, justification: string },
    accentWall?: { wallId: string, materialKey: string, justification: string },
    trim: { materialKey: string, justification: string }
  };
  furniture?: SuggestedItem[];
  lighting?: SuggestedItem[];
  textiles?: SuggestedItem[];
  decor?: SuggestedItem[];
}

export interface LandscapePlanResponse {
  narrative: string;
  landscapingElements: PlacedModel[];
}

export interface MasterPlanLayoutResponse {
    zones: Zone[];
    infrastructure: InfrastructureLine[];
}

export interface FlowIssue {
    id: string;
    type: "flow" | "ergonomics";
    message: string;
    location: { x: number, y: number };
    area: { x: number, y: number, width: number, height: number };
}

export interface Discrepancy {
  id: string;
  type: 'material' | 'structural' | 'dimensional' | 'safety' | 'progress';
  severity: 'low' | 'medium' | 'high';
  description: string;
  recommendation: string;
  imageCoordinates?: { x: number; y: number };
}

export interface PhoenixEyeReport {
  overallAssessment: string;
  progressPercentage: number;
  scheduleAdherence: 'on_schedule' | 'behind_schedule' | 'ahead_of_schedule';
  discrepancies: Discrepancy[];
}

export interface CinematicTour {
  title: string;
  shots: any[]; // CinematicShot
}

export interface ArSuggestionsResponse {
  suggestedWallPalette: string[];
  suggestedFloorMaterialKey: string;
  narrative: string;
}

export interface OracleAnalysisResponse {
  text: string;
  sources: { web: { uri: string; title: string } }[];
}

export interface CostSustainabilityReport {
  overallSummary: string;
  suggestions: {
    originalItem: string;
    suggestedAlternative: string;
    costImpact: string;
    sustainabilityImpact: string;
    reason: string;
  }[];
}

export interface BrahmaAstraMission {
    goal: string;
    location: string;
    targetDemographic: string;
    budget: string;
    constraints: string;
}

export interface BrahmaAstraReport {
  mission: BrahmaAstraMission;
  marketAnalysis: {
    summary: string;
    keyDataPoints: { label: string; value: string }[];
  };
  masterPlan: {
    narrative: string;
    zones: Zone[];
    infrastructure: InfrastructureLine[];
  };
  buildingDesigns: {
    buildingType: string;
    summary: string;
    levels: Level[];
  }[];
  financialProjections: {
    summary: string;
    estimatedCost: string;
    projectedRevenue: string;
    roi: string;
  };
  overallNarrative: string;
}

export interface FabricationFile {
    fileName: string;
    mimeType: string;
    content: string;
}

export interface IndraNetVisual {
    title: string;
    prompt: string;
    generatedImageUrl?: string;
}

export interface IndraNetReport {
    brandIdentity: {
        logoConcept: string;
        colorPalette: string[];
        tagline: string;
    };
    visuals: IndraNetVisual[];
    videoStoryboard: {
        sceneNumber: number;
        visual: string;
        narration: string;
        onScreenText: string;
    }[];
    websiteCopy: {
        headline: string;
        bodyText: string;
    };
}

export interface VarunaReport {
  narrative: string;
  topographySummary: string;
  reservoirs: { name: string; location: { x: number; y: number }; capacity: string; purpose: string }[];
  dams: { name: string; river: string; location: { x: number; y: number }; type: string; height: string }[];
  canals: { name: string; path: { x: number; y: number }[]; flowRate: string; type: string }[];
  environmentalImpact: string;
}

export interface LokaSimulatorReport {
  summary: string;
  solarIrradiance: { annual: number; units: string; peakMonths: string[] };
  windPatterns: { dominantDirection: string; averageSpeed: number; units: string };
  temperatureRange: { annualMin: number; annualMax: number; units: string };
  precipitation: { annualAverage: number; units: string; wettestMonths: string[] };
}

export interface NavagrahaReport {
  analysis: string;
  auspiciousTimings: { event: string; date: string; notes: string }[];
}

export interface AkashaReport {
  response: string;
  citations: { projectId: string; summary: string }[];
}

export interface SamsaraReport {
  summary: string;
  maintenanceSchedule: { item: string; frequency: string; estimatedCost: string }[];
  materialReincarnationPlan: { material: string; potentialNewUse: string; environmentalNote: string }[];
}

export interface ShilpaSutraReport {
  narrative: string;
  potentialEmbellishments: { location: string; suggestion: string }[];
}

export interface SingularityReport {
    summary: string;
    generatedAssets: { type: string; status: string; details: string }[];
}

export interface StrategicAdviceReport {
    strategicOverview: string;
    growthOpportunities: { title: string, description: string }[];
    potentialRisks: { title: string, description: string }[];
    suggestedActions: { title: string, description: string, cta: string }[];
}

export interface ProjectAnalyticsData {
    vastuScore: number;
    sustainabilityScore: number;
    materialDistribution: { name: string, value: number }[];
    creditUsage: { name: string, cost: number }[];
}

export interface PrithviAstraReport {
    geotechnicalReport: {
        assumedSoilType: string;
        estimatedSbc: string;
        waterTableDepth: string;
        recommendations: string[];
    };
    recommendedFoundation: {
        type: string;
        reasoning: string;
        preliminaryPlan: Footing[];
    };
}

export interface AgniAstraReport {
    structuralSystemSummary: string;
    materialSpecifications: { concreteGrade: string; steelGrade: string };
    foundationDesign: { id: string; x: number; y: number; size: string; depth: string; reinforcement: string }[];
    columnSchedule: { id: string; level: number; location: { x: number; y: number }; size: string; reinforcement: string }[];
    beamLayout: { id: string; level: number; p1: { x: number; y: number }; p2: { x: number; y: number }; size: string; reinforcement: string }[];
    slabDetails: { level: number; thickness: string; type: string }[];
    structuralNotes: string[];
}

export interface SvaDharmaResponse {
    signature: string;
    analysis: string;
    sourceImageUrls?: string[];
}

export interface NexusReport {
  strategicOverview: string;
  growthOpportunities: { title: string, description: string }[];
  potentialRisks: { title: string, description: string }[];
  suggestedActions: { title: string, description: string, cta: string }[];
  svaDharmaAnalysis: SvaDharmaResponse;
  akashicInsights: string[];
}

export interface AiCompanionCommandResponse {
    action: string;
    payload: any;
    narrative: string;
}

export interface AtmanSignatureResponse {
    narrative: string;
    projectData: ProjectData;
}

export interface ParamAstraResponse {
  solutions: {
    id: string;
    scores: Record<string, number>;
    thumbnailUrl: string;
  }[];
}

export interface SanjeevaniReport {
  summary: string;
  conflicts: {
    description: string;
    elementIds: string[];
    solutionPrompt?: string;
  }[];
  synergies: {
    description: string;
    elementIds: string[];
  }[];
}

export interface JuggernautPrediction {
  elementId: string;
  elementType: string;
  status: 'on_schedule' | 'at_risk' | 'delayed' | 'misaligned' | 'new';
  severity: 'low' | 'medium' | 'high' | 'critical';
  details: string;
  predictedDelay: string;
  costImpact: string;
  suggestedAction?: string;
}

export interface JuggernautReport {
  realityMesh?: TerrainMesh;
  predictions: JuggernautPrediction[];
  summary: string;
}

export interface AdjudicationReport {
  overallScore: number;
  overallSummary: string;
  detailedCritique: { category: string; score: number; critique: string }[];
}

// Atman Forge & Sutra Engine Types
export interface AtmanSparringSession {
    prompt: string;
    aiResponse: string;
    userFeedback: string;
    refinedSignature: string;
}
export interface SutraAction {
    id: string;
    name: string;
    description: string;
    creditCost: number;
    icon: string;
}
export interface Sutra {
    _id: string;
    name: string;
    description: string;
    actions: string[]; // Array of SutraAction IDs
}

// Samarangan Engine Types
export interface ImpactAnalysis {
    vastu: string;
    structural: string;
    cost: string;
    sustainability: string;
}

export interface SamaranganSolution {
    description: string;
    impactAnalysis: ImpactAnalysis;
    fix: AiFixResponse['fix'];
}