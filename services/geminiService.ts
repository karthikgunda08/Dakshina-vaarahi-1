
// src/services/geminiService.ts
import { BACKEND_API_BASE_URL, PREDEFINED_3D_MODELS } from '../lib/constants';
import { AiSketchToPlanResponse, Wall, Room, Placement, PlacedModel, AiResearchResponse, SunPosition, ProjectData, AiFixResponse, CodeComplianceReport, MaterialAnalysisReport, SustainabilityReport, AdvancedStructuralReport, BillOfQuantitiesReport, BoqItem, MultiConceptResponse, DimensionLine, ProjectCertificationReport, VastuGridAnalysis, ConstructionPhase, PlumbingLine, ElectricalLayout, HvacLayout, TerrainMesh, SiteAnalysisReport, Project, GFCDrawingSet, MasterArchitectResponse, InteriorSchemeResponse, LandscapePlanResponse, MasterPlanLayoutResponse, FlowIssue, PhoenixEyeReport, CinematicTour, ArSuggestionsResponse, OracleAnalysisResponse, CostSustainabilityReport, BrahmaAstraMission, BrahmaAstraReport, SelectedObject, FabricationFile, IndraNetReport, VarunaReport, LokaSimulatorReport, NavagrahaReport, AkashaReport, SamsaraReport, ShilpaSutraReport, SingularityReport, StrategicAdviceReport, ProjectAnalyticsData, PrithviAstraReport, AgniAstraReport, NexusReport, ProjectSummary, AiCompanionCommandResponse, AtmanSignatureResponse, ParamAstraResponse, SvaDharmaResponse, SanjeevaniReport, JuggernautReport, JuggernautPrediction, SamaranganSolution } from "../types/index"; 
import { getToken } from './authService'; 

const fetchWithAuth = async <T>(endpoint: string, body: any, method: string = 'POST'): Promise<T> => {
  const token = getToken();
  const headersInit: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headersInit['Authorization'] = `Bearer ${token}`;
  }

  const requestOptions: RequestInit = {
    method: method,
    headers: new Headers(headersInit),
    body: JSON.stringify(body),
  };

  try {
    const response = await fetch(`${BACKEND_API_BASE_URL}/gemini${endpoint}`, requestOptions);
    if (!response.ok) {
      if (response.status === 401) {
          throw new Error('Your session has expired. Please log in again.');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText || "Unknown error" }));
      const err = new Error(errorData.message || `Request failed with status ${response.status}`);
      (err as any).status = response.status;
      throw err;
    }
    return response.json();
  } catch (error) {
     if (error instanceof TypeError) { // Catches network errors (e.g., CORS, offline, backend down)
        console.error("Network or CORS error connecting to the Gemini service proxy. Is the backend running and configured correctly in .env.local?", error);
        throw new Error("Cannot connect to the AI service. Please check your connection and ensure the backend is running.");
     }
     throw error; // Re-throw other errors (like the ones we created above)
  }
};

export const runCompanionCommandApi = async (projectId: string, command: string, projectData: ProjectData): Promise<AiCompanionCommandResponse> => {
    // This isn't a standard route, it's handled by socket.io, but we can keep a placeholder if needed,
    // or refactor the socket logic to use it. For now, assuming socket handles it.
    // This is a conceptual placeholder. The actual logic is in the socket handler.
    console.warn("runCompanionCommandApi is conceptual. Actual command sent via socket.");
    return Promise.reject("Use socket.io for companion commands.");
};

export const getSupportAgentResponseApi = async (query: string): Promise<{ text: string }> => {
    return fetchWithAuth<{ text: string }>('/get-support-response', { prompt: query });
};

export const refineAndGeneratePlanApi = async (projectId: string, prompt: string): Promise<MasterArchitectResponse> => {
    return fetchWithAuth<MasterArchitectResponse>('/refine-and-generate', { projectId, prompt });
};

export const getDesignClarificationsApi = async (projectId: string, prompt: string): Promise<any[]> => {
    return fetchWithAuth<any[]>('/get-design-clarifications', { projectId, prompt });
};

export const generateMasterArchitectPlanApi = async (projectId: string, prompt: string): Promise<MasterArchitectResponse> => {
    return fetchWithAuth<MasterArchitectResponse>('/generate-master-architect-plan', { projectId, prompt });
};

export const generateGenesisPlanApi = async (projectId: string, prompt: string): Promise<AiSketchToPlanResponse> => {
    return fetchWithAuth<AiSketchToPlanResponse>('/generate-genesis-plan', { projectId, prompt });
};

// NEW: Public API for landing page demo
export const generatePublicGenesisPlanApi = async (prompt: string): Promise<AiSketchToPlanResponse> => {
  const response = await fetch(`${BACKEND_API_BASE_URL}/gemini/public/generate-genesis-plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate plan');
  }
  return response.json();
};

export const generatePlanFromImageApi = async (projectId: string, image: string, mimeType: string): Promise<AiSketchToPlanResponse> => {
  return fetchWithAuth<AiSketchToPlanResponse>('/generate-plan-from-image', { projectId, image, mimeType });
};

export const researchWithGoogleApi = async (projectId: string, prompt: string): Promise<AiResearchResponse> => {
  return fetchWithAuth<AiResearchResponse>('/research-with-google', { projectId, prompt });
};

export const generateMultiConceptApi = async (projectId: string, prompt: string): Promise<MultiConceptResponse> => {
  return fetchWithAuth<MultiConceptResponse>('/generate-multi-concept', { projectId, prompt });
};

export const analyzeFlowAndErgonomicsApi = async (projectId: string, projectData: ProjectData): Promise<FlowIssue[]> => {
    const response = await fetchWithAuth<FlowIssue[]>('/analyze-flow', { projectId, projectData });
    return Array.isArray(response) ? response : [];
};

export const generateBoqApi = async (projectId: string, projectData: ProjectData): Promise<BillOfQuantitiesReport> => {
    return fetchWithAuth<BillOfQuantitiesReport>('/generate-boq', { projectId, projectData });
};

export const estimateStructureApi = async (projectId: string, projectData: ProjectData): Promise<AdvancedStructuralReport> => {
    return fetchWithAuth<AdvancedStructuralReport>('/estimate-structure', { projectId, projectData });
};

export const analyzeSustainabilityApi = async (projectId: string, projectData: ProjectData): Promise<SustainabilityReport> => {
    return fetchWithAuth<SustainabilityReport>('/analyze-sustainability', { projectId, projectData });
};

export const analyzeCodeComplianceApi = async (projectId: string, roomId: string, standard: string, projectData: ProjectData): Promise<CodeComplianceReport> => {
    return fetchWithAuth<CodeComplianceReport>('/analyze-compliance', { projectId, projectData, standard, roomId });
};

export const analyzeMaterialApi = async (projectId: string, materialName: string): Promise<MaterialAnalysisReport> => {
    return fetchWithAuth<MaterialAnalysisReport>('/analyze-material', { projectId, prompt: materialName });
};

export const generateBlueprintDetailsApi = async (projectId: string, projectData: ProjectData): Promise<{ dimensionLines: DimensionLine[] }> => {
    return fetchWithAuth<{ dimensionLines: DimensionLine[] }>('/generate-blueprint-details', { projectId, projectData });
};

export const generateProjectCertificationApi = async (projectId: string, projectData: ProjectData): Promise<ProjectCertificationReport> => {
    return fetchWithAuth<ProjectCertificationReport>('/generate-project-certification', { projectId, projectData });
};

export const analyzeVastuGridApi = async (projectId: string, projectData: ProjectData): Promise<VastuGridAnalysis> => {
    return fetchWithAuth<VastuGridAnalysis>('/analyze-vastu-grid', { projectId, projectData });
};

export const generateConstructionPlanApi = async (projectId: string, projectData: ProjectData): Promise<ConstructionPhase[]> => {
    return fetchWithAuth<ConstructionPhase[]>('/generate-construction-plan', { projectId, projectData });
};

export const generatePlumbingLayoutApi = async (projectId: string, projectData: ProjectData): Promise<{ plumbingLayout: PlumbingLine[] }> => {
    return fetchWithAuth<{ plumbingLayout: PlumbingLine[] }>('/generate-plumbing-layout', { projectId, projectData });
};

export const generateElectricalLayoutApi = async (projectId: string, projectData: ProjectData): Promise<ElectricalLayout> => {
    return fetchWithAuth<ElectricalLayout>('/generate-electrical-layout', { projectId, projectData });
};

export const generateHvacLayoutApi = async (projectId: string, projectData: ProjectData): Promise<HvacLayout> => {
    return fetchWithAuth<HvacLayout>('/generate-hvac-layout', { projectId, projectData });
};

export const generateTerrainApi = async (projectId: string, prompt: string): Promise<TerrainMesh> => {
    return fetchWithAuth<TerrainMesh>('/generate-terrain', { projectId, prompt });
};

export const analyzeSiteApi = async (projectId: string, projectData: Pick<Project, 'terrainMesh' | 'propertyLines' | 'projectType' | 'levels' | 'planNorthDirection'>): Promise<SiteAnalysisReport> => {
    return fetchWithAuth<SiteAnalysisReport>('/analyze-site', { projectId, projectData });
};

export const generateRenderApi = async (projectId: string, projectData: ProjectData, roomId: string, stylePrompt: string, config?: object): Promise<{ imageUrl: string }> => {
    return fetchWithAuth<{ imageUrl: string }>('/generate-render', { projectId, projectData, roomId, stylePrompt, config });
};

export const analyzeProjectProgressApi = async (projectId: string, projectData: Project): Promise<{ analysis: string }> => {
    return fetchWithAuth<{ analysis: string }>('/analyze-project-progress', { projectId, projectData });
};

export const generateGfcDrawingsApi = async (projectId: string, projectData: ProjectData): Promise<GFCDrawingSet> => {
    return fetchWithAuth<GFCDrawingSet>('/generate-gfc-drawings', { projectId, projectData });
};

export const resolveDesignCommentApi = async (projectId: string, commentText: string, projectData: ProjectData, commentPosition: {x:number, y:number}): Promise<AiFixResponse> => {
    return fetchWithAuth<AiFixResponse>('/resolve-design-comment', { projectId, commentText, projectData, commentPosition });
};

// LIVE IMPLEMENTATION
export const generateInteriorSchemeApi = async (projectId: string, projectData: ProjectData, roomId: string, style: string, atmanSignature?: string): Promise<InteriorSchemeResponse> => {
    return fetchWithAuth<InteriorSchemeResponse>('/generate-interior-scheme', {
        projectId,
        projectData,
        roomId,
        style,
        atmanSignature,
    });
};

export const generateLandscapePlanApi = async (projectId: string, projectData: ProjectData): Promise<LandscapePlanResponse> => {
    return fetchWithAuth<LandscapePlanResponse>('/generate-landscape-plan', { projectId, projectData });
};

export const analyzeSiteMediaApi = async (projectId: string, constructionPlan: ConstructionPhase[], images: { base64: string, mimeType: string }[]): Promise<PhoenixEyeReport> => {
    return fetchWithAuth<PhoenixEyeReport>('/analyze-site-media', { projectId, constructionPlan, images });
};

export const generateCinematicTourApi = async (projectId: string, projectData: ProjectData): Promise<CinematicTour> => {
    return fetchWithAuth<CinematicTour>('/generate-cinematic-tour', { projectId, projectData });
};

export const generateArSuggestionsApi = async (projectId: string, wallColor: string, style: string): Promise<ArSuggestionsResponse> => {
    return fetchWithAuth<ArSuggestionsResponse>('/generate-ar-suggestions', { projectId, wallColor, style });
};

export const runOracleAnalysisApi = async (projectId: string, projectData: ProjectData, location: string, question: string): Promise<OracleAnalysisResponse> => {
    return fetchWithAuth<OracleAnalysisResponse>('/run-oracle-analysis', { projectId, projectData, location, question });
};

export const runCostSustainabilityOptimizerApi = async (projectId: string, boq: BillOfQuantitiesReport, sustainabilityReport: SustainabilityReport): Promise<CostSustainabilityReport> => {
    return fetchWithAuth<CostSustainabilityReport>('/optimize-cost-sustainability', { projectId, boq, sustainabilityReport });
};

export const generateMasterPlanLayoutApi = async (projectId: string, prompt: string): Promise<MasterPlanLayoutResponse> => {
    return fetchWithAuth<MasterPlanLayoutResponse>('/generate-master-plan', { projectId, prompt });
};

export const runBrahmaAstraEngineApi = async (projectId: string, mission: BrahmaAstraMission): Promise<BrahmaAstraReport> => {
    return fetchWithAuth<BrahmaAstraReport>('/run-brahma-astra-engine', { projectId, prompt: JSON.stringify(mission) });
};

export const generateFabricationFilesApi = async (projectId: string, selectedObject: SelectedObject): Promise<{ files: FabricationFile[], elementName: string }> => {
    return fetchWithAuth<{ files: FabricationFile[], elementName: string }>('/generate-fabrication-files', { projectId, selectedObject });
};

export const runIndraNetEngineApi = async (projectId: string, projectData: ProjectData): Promise<IndraNetReport> => {
    return fetchWithAuth<IndraNetReport>('/run-indra-net-engine', { projectId, projectData });
};

export const runVarunaEngineApi = async (projectId: string, prompt: string): Promise<VarunaReport> => {
    return fetchWithAuth<VarunaReport>('/run-varuna-engine', { projectId, prompt });
};

export const runLokaSimulatorApi = async (projectId: string, location: string): Promise<LokaSimulatorReport> => {
    return fetchWithAuth<LokaSimulatorReport>('/run-loka-simulator', { projectId, location });
};

// GRAND LAUNCH
export const runNavagrahaEngineApi = async (projectId: string, projectData: ProjectData): Promise<NavagrahaReport> => {
    return fetchWithAuth<NavagrahaReport>('/run-navagraha-engine', { projectId, projectData });
};

export const runAkashaEngineApi = async (projectId: string, query: string): Promise<AkashaReport> => {
    return fetchWithAuth<AkashaReport>('/run-akasha-engine', { projectId, query });
};

export const runSamsaraEngineApi = async (projectId: string, projectData: ProjectData): Promise<SamsaraReport> => {
    return fetchWithAuth<SamsaraReport>('/run-samsara-engine', { projectId, projectData });
};

export const runShilpaSutraAnalysisApi = async (projectId: string, projectData: ProjectData): Promise<ShilpaSutraReport> => {
    return fetchWithAuth<ShilpaSutraReport>('/run-shilpa-sutra', { projectId, projectData });
};

// NEW: Singularity Engine API Call
export const runSingularityEngineApi = async (projectId: string, projectData: ProjectData): Promise<SingularityReport> => {
    return fetchWithAuth<SingularityReport>('/run-singularity-engine', { projectId, projectData });
};

// NEW: AI Strategic Advisor API Call
export const getStrategicAdviceApi = async (projectId: string, analyticsData: ProjectAnalyticsData): Promise<StrategicAdviceReport> => {
    return fetchWithAuth<StrategicAdviceReport>('/get-strategic-advice', { projectId, projectData: analyticsData });
};

// NEW: Civil Engineering Engines
export const runPrithviAstraEngineApi = async (projectId: string, projectData: ProjectData): Promise<PrithviAstraReport> => {
    return fetchWithAuth<PrithviAstraReport>('/run-prithvi-astra', { projectId, projectData });
};

export const runAgniAstraEngineApi = async (projectId: string, projectData: ProjectData, foundationData: any): Promise<AgniAstraReport> => {
    return fetchWithAuth<AgniAstraReport>('/run-agni-astra', { projectId, projectData, foundationData });
};

// NEW: Nexus Advisor API Call
export const runNexusAdvisorApi = async (projectId: string, projects: ProjectSummary[]): Promise<NexusReport> => {
    return fetchWithAuth<NexusReport>('/run-nexus-advisor', { projectId, projectData: projects });
};

// --- BRAHMAN & JUGGERNAUT PROTOCOLS ---
export const runAtmanSignatureApi = async (projectId: string, styleSignature: string, prompt: string): Promise<AtmanSignatureResponse> => {
    return fetchWithAuth<AtmanSignatureResponse>('/run-atman-signature', { projectId, styleSignature, prompt });
};

export const runParamAstraApi = async (projectId: string, objectives: any): Promise<ParamAstraResponse> => {
    return fetchWithAuth<ParamAstraResponse>('/run-param-astra', { projectId, objectives });
};

export const runSvaDharmaAnalyzerApi = async (projectId: string, allProjects: ProjectSummary[]): Promise<SvaDharmaResponse> => {
    return fetchWithAuth<SvaDharmaResponse>('/run-sva-dharma-analyzer', { projectId, allProjects });
};

// NEW: Visual Sva-Dharma Analyzer API Call
export const analyzeVisualPortfolioApi = async (projectId: string, images: { base64: string; mimeType: string }[]): Promise<SvaDharmaResponse> => {
    return fetchWithAuth<SvaDharmaResponse>('/analyze-visual-portfolio', { projectId, images });
};

export const runSamudraManthanApi = async (projectId: string, projectData: ProjectData): Promise<SanjeevaniReport> => {
    return fetchWithAuth<SanjeevaniReport>('/run-samudra-manthan', { projectId, projectData });
};

// NEW: Juggernaut Corrective Action
export const proposeJuggernautFixApi = async (projectId: string, discrepancy: JuggernautPrediction, projectData: ProjectData): Promise<AiFixResponse> => {
    return fetchWithAuth<AiFixResponse>('/propose-juggernaut-fix', { projectId, discrepancy, projectData });
};

// NEW: Juggernaut Predictive Analysis
export const runSiteAdjudicatorApi = async (projectId: string, projectData: ProjectData): Promise<JuggernautReport> => {
    return fetchWithAuth<JuggernautReport>('/run-site-adjudicator', { projectId, projectData });
};

export const generateImageApi = async (projectId: string, prompt: string, config: object): Promise<{ imageUrl: string }> => {
    return fetchWithAuth<{ imageUrl: string }>('/generate-image', { projectId, prompt, config });
};

export const generateShowcaseImageFromApi = async (promptIndex: number, config?: object): Promise<{imageUrl: string}> => {
  const response = await fetch(`${BACKEND_API_BASE_URL}/gemini/generate-showcase-image`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ promptIndex, config }),
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to generate showcase image');
  }
  return response.json();
};

// NEW: Samarangan Engine API Call
export const proposeSamaranganFixesApi = async (projectId: string, command: string, projectData: ProjectData): Promise<SamaranganSolution[]> => {
    return fetchWithAuth<SamaranganSolution[]>('/run-samarangan-engine', { projectId, command, projectData });
};

// NEW: Style My Photo
export const analyzeStyleFromImageApi = async (projectId: string, image: string, mimeType: string): Promise<{ style: string }> => {
    return fetchWithAuth<{ style: string }>('/analyze-style-from-image', { projectId, image, mimeType });
};

// NEW: Aura Instant Staging
export const emptyRoomApi = async (projectId: string, image: string, mimeType: string): Promise<{ imageUrl: string }> => {
    return fetchWithAuth<{ imageUrl: string }>('/empty-room-from-image', { projectId, image, mimeType });
};

export const stageRoomApi = async (projectId: string, image: string, mimeType: string, prompt: string): Promise<{ imageUrl: string }> => {
    return fetchWithAuth<{ imageUrl: string }>('/stage-room-from-image', { projectId, image, mimeType, prompt });
};