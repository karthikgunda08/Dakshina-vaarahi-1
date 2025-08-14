// src/types/editor.ts
import type { SetStateAction } from 'react';
import type { AppStore } from './store';
import type { User, Collaborator, LiveSelection, LiveCursor } from './user';
import type { Level, PropertyLine, TerrainMesh, Zone, InfrastructureLine, StagingSettings, CameraView, Holocron, Storyboard, Point3D, DigitalTwinData, Wall, Placement, DimensionLine, AppComment, SelectedObject, PlanNorthDirection, HolocronHotspot, Layer, SunPosition, Room } from './project';


// =================================================================
// --- EDITOR & VIEWPORT ---
// =================================================================
export type SketcherTool = 'select' | 'wall' | 'door' | 'window' | 'dimension' | 'comment' | 'zone' | 'road';
export type EditorMode = 'concept' | 'precision';

export interface PanelState {
  id: PanelId;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isVisible: boolean;
}
export type PanelId = 'phoenixEngine' | 'propertiesPanel' | 'projectHub' | 'layersPanel' | 'chatPanel' | 'analyticsPanel' | 'digitalTwinPanel' | 'integrationsPanel' | 'mayaLayer';

export interface UndoableState {
  levels: Level[];
  activeLevelIndex: number;
  zones: Zone[];
  infrastructure: InfrastructureLine[];
  planNorthDirection: string;
  propertyLines: PropertyLine[];
  terrainMesh: TerrainMesh | null;
  stagingSettings: StagingSettings;
  savedCameraViews: CameraView[];
  holocron: Holocron | null;
  storyboard: Storyboard | null;
}

export interface ContextMenuData {
  x: number;
  y: number;
  object: SelectedObject | null;
}

export interface ReadOnlySketcherProps {
  levels: Level[];
  activeLevelIndex: number;
  planNorthDirection: string;
  propertyLines: PropertyLine[];
  terrainMesh: TerrainMesh | null;
  zones: Zone[];
  infrastructure: InfrastructureLine[];
  selectedObject: SelectedObject | null;
  currentProject: any;
}

export interface SharedEditorProps extends Omit<AppStore, 'set' | 'login' | 'register' | 'logout' | 'initApp'> {}

export type PhoenixEngineTab =
  | 'aiArchitect' | 'conceptExplorer' | 'sketchToPlan' | 'nexus' | 'research' | 'oracle' | 'samarangan'
  | 'boq' | 'sustainability' | 'compliance' | 'structural' | 'vastu' | 'flow' | 'material' | 'constructionCam'
  | 'geotechnical' | 'structuralDetailing' | 'site' | 'hydro' | 'climate'
  | 'gfcDrawings' | '3dSynthesis' | 'fabrication'
  | 'presentation' | 'render' | 'aiDecorator' | 'cinematicTour' | 'mediaKit' | 'holocron' | 'staging'
  | 'mep' | 'plumbing' | 'electrical' | 'hvac'
  | 'advanced' | 'cosmicTiming' | 'akasha' | 'lifecycle' | 'aesthetics' | 'atmanSignature' | 'optimizer' | 'holisticAnalysis' | 'singularity'
  | 'utility' | 'comments' | 'modelLibrary' | 'arMode';


export type TimeOfDay = 'midday' | 'sunset' | 'night';

export interface SketcherHandles {
  exportAsPNG: () => string | undefined;
}
export interface View3DHandles {
  exportAsPNG: () => string | undefined;
  exportAsGLB: (projectName: string) => void;
}

export interface FloorPlanSketcherSectionProps extends Omit<SharedEditorProps, 'addWall' | 'updateWall' | 'addPlacement' | 'addDimensionLine' | 'addComment' | 'addZone' | 'addInfrastructure'> {
  currentTool: SketcherTool;
  setActiveSketcherTool: (tool: SketcherTool) => void;
  editorMode: EditorMode;
  setEditorMode: (mode: EditorMode) => void;
  onViewCommentThread: (commentId: string) => void;
  addWall?: (wall: Omit<Wall, 'id' | 'layerId'>) => void;
  updateWall?: (wallId: string, updates: Partial<Wall>) => void;
  addPlacement?: (placement: Omit<Placement, 'id' | 'layerId'>) => void;
  addDimensionLine?: (line: Omit<DimensionLine, 'id' | 'layerId'>) => void;
  addComment?: (comment: Omit<AppComment, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt' | 'resolved' | 'layerId' | 'replies'>) => void;
  addZone?: (zone: Omit<Zone, 'id' | 'layerId' | 'name'>) => void;
  addInfrastructure?: (line: Omit<InfrastructureLine, 'id' | 'layerId' | 'type' | 'width'>) => void;
}

export interface PhoenixEnginePanelProps extends SharedEditorProps {
    setCurrentPlacingModelKey: (key: string | null) => void;
    currentPlacingModelKey: string | null;
}

export interface EditorSlice extends UndoableState {
    undoStack: UndoableState[];
    redoStack: UndoableState[];
    canUndo: boolean;
    canRedo: boolean;
    selectedObject: SelectedObject | null;
    currentPlacingModelKey: string | null;
    activeSketcherTool: SketcherTool;
    editorMode: EditorMode;
    focusedCommentId: string | null;
    sunPosition: SunPosition;
    isWalkthroughActive: boolean;
    isHolocronAuthoringMode: boolean;
    pushToUndoStack: () => void;
    undo: () => void;
    redo: () => void;
    setLevels: (levels: Level[]) => void;
    setSingleLevelProp: <K extends keyof Level>(prop: K, value: SetStateAction<Level[K]>) => void;
    setSelectedObject: (payload: SetStateAction<SelectedObject | null>) => void;
    deleteSelectedObject: () => void;
    addLayer: (name: string) => void;
    updateLayer: (id: string, updates: Partial<Layer>) => void;
    deleteLayer: (id: string) => void;
    addWall: (wall: Omit<Wall, 'id' | 'layerId'>) => void;
    updateWall: (wallId: string, updates: Partial<Wall>) => void;
    addPlacement: (placement: Omit<Placement, 'id' | 'layerId'>) => void;
    addDimensionLine: (line: Omit<DimensionLine, 'id' | 'layerId'>) => void;
    addComment: (comment: Omit<AppComment, 'id' | 'userId' | 'userName' | 'createdAt' | 'updatedAt' | 'resolved' | 'layerId' | 'replies'>) => void;
    addZone: (zone: Omit<Zone, 'id' | 'layerId' | 'name'>) => void;
    addInfrastructure: (line: Omit<InfrastructureLine, 'id' | 'layerId' | 'type' | 'width'>) => void;
    onViewCommentThread: (commentId: string) => void;
    updateHolocronHotspots: (hotspots: HolocronHotspot[]) => void;
    setActiveSketcherTool: (tool: SketcherTool) => void;
    setEditorMode: (mode: EditorMode) => void;
    setCurrentPlacingModelKey: (key: string | null) => void;
    setSunPosition: (updater: SetStateAction<SunPosition>) => void;
    setStagingSettings: (updater: SetStateAction<StagingSettings>) => void;
    setIsWalkthroughActive: (active: boolean) => void;
    setIsHolocronAuthoringMode: (active: boolean) => void;
    setFocusedCommentId: (id: string | null) => void;
    toggleHolocronEnabled: () => Promise<void>;
    updateRoomsFromWalls: () => void;
}
