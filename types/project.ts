// src/types/project.ts
import type { Collaborator, User } from './user';
import type { BillOfQuantitiesReport, SustainabilityReport, VastuGridAnalysis, CinematicTour, JuggernautReport } from './api';

export type { CinematicTour };

// =================================================================
// --- NEWLY ADDED TYPES ---
// =================================================================

export type PlanNorthDirection = 'N' | 'S' | 'E' | 'W' | 'NE' | 'NW' | 'SE' | 'SW';

export interface SelectedObject {
    id: string;
    type: 'wall' | 'room' | 'placement' | 'placedModel' | 'zone' | 'infrastructure' | 'comment' | 'dimension';
    levelIndex: number;
}

export interface DigitalTwinDataOverlay {
    energy: boolean;
    stress: boolean;
    occupancy: boolean;
}

export interface MarketplaceInfo {
    price: number;
    description: string;
    tags?: string[];
    numPurchases: number;
}

export interface TokenizationDetails {
    isTokenized: boolean;
    totalTokens: number;
    pricePerToken: number;
    offeringDescription: string;
}

export interface ConstructionPhase {
    week: number;
    description: string;
    tasks: string[];
    estimatedMaterials: [{ item: string, quantity: number, unit: string }];
    constructionNotes: string[];
    elementIds: { walls: string[], placements: string[], models: string[] };
}

export interface UserCorrection {
  id: string;
  type: 'modify-wall' | 'modify-placement' | 'modify-room';
  objectId: string;
  property: string;
  oldValue: any;
  newValue: any;
  timestamp: string;
}

// =================================================================
// --- CORE ARCHITECTURAL DOMAIN MODELS ---
// =================================================================

export interface Layer {
  id: string;
  name: string;
  isVisible: boolean;
  isLocked: boolean;
}

export interface CameraView {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  target: { x: number; y: number; z: number };
}

export interface StagingSettings {
  timeOfDay: 'midday' | 'sunset' | 'night';
  enableBloom: boolean;
}

export interface Point3D {
  x: number;
  y: number;
  z: number;
}

export interface SunPosition {
    azimuth: number;
    altitude: number;
}

export interface Scene {
  id: string;
  title: string;
  narrative: string;
  cameraViewId: string | null; // Link to a saved CameraView
  duration: number; // in seconds
}

export interface Storyboard {
  id: string;
  title: string;
  scenes: Scene[];
}

export interface Project {
  id: string;
  _id?: string;
  userId: string | { id: string, name: string, email: string };
  name: string;
  location?: string;
  projectType: 'building' | 'masterPlan';
  isPublic: boolean;
  isForSale?: boolean;
  marketplace?: MarketplaceInfo;
  tokenization?: TokenizationDetails;
  levels: Level[];
  planNorthDirection: string;
  propertyLines: PropertyLine[];
  terrainMesh: TerrainMesh | null;
  previewImageUrl?: string | null;
  stagingSettings?: StagingSettings;
  savedCameraViews?: CameraView[];
  status?: ProjectStatus;
  budget?: BudgetCategory[];
  tasks?: ProjectTask[];
  clientAccess?: { isEnabled: boolean; shareableLink: string };
  folio?: { title: string; narrative: string; shareableLink: string; isEnabled: boolean };
  holocron?: Holocron;
  cinematicTour?: CinematicTour;
  storyboard?: Storyboard | null;
  phoenixEyeReports?: any[];
  version: number;
  collaborators: Collaborator[];
  generatedDocuments?: GeneratedDocument[];
  generatedRenders?: GeneratedRender[];
  chatHistory?: any[];
  clientProfile?: string;
  siteContext?: string;
  specificRequirements?: string;
  billOfQuantities?: BillOfQuantitiesReport;
  sustainabilityReport?: SustainabilityReport;
  aiCreditUsage?: { tool: string; cost: number; timestamp: Date }[];
  constructionSequence?: ConstructionPhase[];
  updatedAt: string;
  createdAt: string;
  zones?: Zone[];
  infrastructure?: InfrastructureLine[];
  juggernautReport?: JuggernautReport;
  vastuGridAnalysis?: VastuGridAnalysis;
  userCorrections?: UserCorrection[];
}

export interface ProjectData extends Partial<Project> {
  name?: string;
  levels: Level[];
}

export interface ProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
  projectType: 'building' | 'masterPlan';
  previewImageUrl?: string;
  userId?: { id: string; name: string; email: string };
  isPublic: boolean;
  folio?: { isEnabled: boolean, shareableLink: string };
  marketplace?: MarketplaceInfo;
  tokenization?: TokenizationDetails;
}

export interface Level {
  id: string;
  name: string;
  elevation: number;
  walls: Wall[];
  rooms: Room[];
  placements: Placement[];
  placedModels: PlacedModel[];
  dimensionLines: DimensionLine[];
  comments: AppComment[];
  suggestedFurniture: SuggestedFurnitureItem[];
  plumbingLayout: PlumbingLine[];
  electricalLayout: ElectricalLayout | null;
  hvacLayout: HvacLayout | null;
  drawingSet: GFCDrawingSet | null;
  layers: Layer[];
  activeLayerId: string;
  foundationPlan?: Footing[];
  zones?: Zone[];
  infrastructure?: InfrastructureLine[];
}

export interface Wall {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  thickness: number;
  height: number;
  material?: string;
  layerId: string;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  type: string;
  wallIds: string[];
  calculatedArea?: number;
  orientation?: string;
  floorMaterial?: string;
  wallMaterialOverride?: string;
  layerId: string;
}

export interface Placement {
  id: string;
  wallId: string;
  type: 'door' | 'window';
  positionRatio: number;
  width: number;
  height: number;
  layerId: string;
}

export interface SuggestedFurnitureItem {
  id: string;
  roomId: string;
  itemType: string;
  x: number; 
  y: number; 
  width: number; 
  depth: number; 
  height3d: number;
  rotation: number;
  vastuRemark?: string;
  layerId: string; 
  modelKey: string;
  name: string;
  justification?: string;
}

export interface PlacedModel {
  id: string;
  modelKey: string;
  name: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height3d: number;
  rotation: number;
  layerId: string;
  brand?: string;
  style?: string;
  justification?: string;
  roomId?: string;
}

export interface DimensionLine {
  id: string;
  type: 'manual' | 'auto';
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  textPosition?: { x: number; y: number };
  offsetDistance: number;
  isTemporary?: boolean;
  layerId: string;
}

export interface MaterialDefinition {
  key: string;
  name: string;
  type: 'color' | 'texture';
  value: string;
  category: 'Paint' | 'Wood' | 'Stone' | 'Concrete' | 'Metal' | 'Tile' | 'Masonry' | 'Plaster';
  finish: 'matte' | 'satin' | 'glossy';
  appliesTo: 'wall' | 'floor' | 'model' | 'any';
  metalness?: number;
  roughness?: number;
  uvScale?: { x: number, y: number };
}

export interface Predefined3DModel {
  key: string;
  name: string;
  category: string;
  defaultWidth: number;
  defaultDepth: number;
  defaultHeight3d: number;
  modelUrl?: string;
}

export interface PropertyLine {
  id: string;
  points: { x: number; y: number }[];
}

export interface TerrainMesh {
  vertices: number[];
  indices: number[];
}

export interface Zone {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'green_space' | 'infrastructure';
  path: { x: number; y: number }[];
  layerId: string;
}

export interface InfrastructureLine {
  id: string;
  type: 'road' | 'utility_line';
  path: { x: number; y: number }[];
  width?: number;
  layerId: string;
}

export interface Footing {
  id: string;
  x: number;
  y: number;
  size: string;
  depth: string;
  reinforcement: string;
}

export interface PlumbingLine {
  id: string;
  type: string;
  path: { x: number, y: number }[];
  layerId: string;
}

export interface Circuit {
  id: string;
  name: string;
  breakerRating: number;
  description: string;
}

export interface WiringPath {
  id: string;
  circuitId: string;
  path: { x: number, y: number }[];
}

export interface ElectricalLayout {
  breakerPanel: {
    x: number;
    y: number;
    circuits: Circuit[];
  };
  wiringPaths: WiringPath[];
  layerId: string;
}

export interface Duct {
  id: string;
  type: string;
  path: { x: number, y: number }[];
  width: number;
}
export interface Vent {
  id: string;
  type: string;
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
}
export interface HvacLayout {
  ducts: Duct[];
  vents: Vent[];
  ahuLocation: { x: number, y: number };
  condenserLocation: { x: number, y: number };
  layerId: string;
}

export interface GeneralNotes {
  civil: string[];
  structural: string[];
  mep: string[];
  safety: string[];
}
export interface MaterialLegendItem {
  tag: string;
  description: string;
  details: string;
}
export interface MepLayer {
  lines: { id: string, path: { x: number, y: number }[] }[];
  symbols: { id: string, x: number, y: number }[];
}
export interface ScheduleItem {
  id: string;
  type: string;
  size: string;
  material: string;
  remarks: string;
}
export interface GFCDrawingSet {
  generalNotes: GeneralNotes;
  materialLegend: MaterialLegendItem[];
  mepLayers: {
    plumbing: MepLayer;
    electrical: MepLayer;
    fire: MepLayer;
  };
  schedules: {
    doorSchedule: ScheduleItem[];
    windowSchedule: ScheduleItem[];
  };
}

export interface GeneratedDocument {
  _id: string;
  name: string;
  type: string;
  url: string;
  createdAt: string;
}

export interface GeneratedRender {
  _id: string;
  prompt: string;
  url: string;
  createdAt: string;
}

export interface KpiData {
  totalUsers: number;
  totalProjects: number;
  totalRevenue: number;
  creditsSold: Record<string, number>;
}
export interface KpiChartData {
    name: string;
    users: number;
    revenue: number;
}

export type ProjectStatus = 'design' | 'planning' | 'construction' | 'completed' | 'on_hold';
export interface ProjectTask {
    id: string;
    text: string;
    isCompleted: boolean;
}
export interface BudgetCategory {
    id: string;
    name: string;
    planned: number;
    actual: number;
}

export interface Reply {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface AppComment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  x: number;
  y: number;
  resolved: boolean;
  replies?: Reply[];
  createdAt: string;
  updatedAt: string;
  layerId: string;
}

export interface HolocronHotspot {
  id: string;
  title: string;
  type: 'narrative' | 'render' | 'document';
  content: string; // Narrative text or a URL
  position: Point3D;
}

export interface Holocron {
  isEnabled: boolean;
  shareableLink: string;
  hotspots: HolocronHotspot[];
}

export interface HolocronData {
  projectName: string;
  levels: Level[];
  planNorthDirection: string;
  propertyLines: PropertyLine[];
  terrainMesh: TerrainMesh | null;
  hotspots: HolocronHotspot[];
}

export interface DigitalTwinData {
    totalPowerDraw: number;
    peakStressFactor: number;
    totalOccupancy: number;
    energyUsage: { roomId: string; powerDraw: number }[];
    structuralStress: { wallId: string; stressFactor: number }[];
    occupancy: { roomId: string; count: number }[];
}

export interface ProjectVersion {
  _id: string;
  versionNumber: number;
  commitMessage: string;
  createdAt: string;
}

export interface ProjectSlice {
    projects: ProjectSummary[];
    currentProject: Project | null;
    isProjectLoading: boolean;
    projectError: string | null;
    globalRfqs: any[]; // Replace with proper Rfq[] type later
    newProject: (type: 'building' | 'masterPlan') => void;
    loadProject: (projectId: string) => Promise<void>;
    importProjectData: (projectData: ProjectData, name: string) => void;
    autoSaveProject: () => Promise<void>;
    saveProjectVersion: (commitMessage: string) => Promise<void>;
    deleteProject: (projectId: string) => Promise<void>;
    updateCurrentProject: (updates: Partial<Project>) => void;
    logUserCorrection: (correction: Omit<UserCorrection, 'id' | 'timestamp'>) => void;
    exportCometPackage: (sketcherRef: React.RefObject<any>, view3dRef: React.RefObject<any>) => Promise<void>;
    setGeneratedDocuments: (documents: GeneratedDocument[]) => void;
    setGeneratedRenders: (renders: GeneratedRender[]) => void;
    fetchGlobalRfqs: () => Promise<void>;
    exportAsDxf: () => Promise<void>;
    importDwgProject: (file: File) => Promise<void>;
    importRevitProject: (revitProjectId: string) => Promise<void>;
}