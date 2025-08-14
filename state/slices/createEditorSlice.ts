// src/state/slices/createEditorSlice.ts
import { StateCreator } from 'zustand';
import { AppStore, EditorSlice, UndoableState, Level, Layer, Placement, Holocron, DimensionLine, StagingSettings, Storyboard, Zone, InfrastructureLine, Wall, AppComment, Room } from '../../types/index';
import { detectRooms, calculateRoomArea } from '../../lib/geometryUtils';

const generateId = (prefix: string): string => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;
const defaultLayerId = 'layer_default';
const MAX_UNDO_STEPS = 50;

const createDefaultLayers = (): Layer[] => [
    { id: defaultLayerId, name: 'Default', isVisible: true, isLocked: false },
];

const createDefaultLevel = (name = 'Ground Floor', elevation = 0): Level => ({
    id: generateId('level'), name, elevation, walls: [], rooms: [], placements: [], placedModels: [],
    dimensionLines: [], comments: [], suggestedFurniture: [], plumbingLayout: [], electricalLayout: null, 
    hvacLayout: null, drawingSet: null,
    layers: createDefaultLayers(), activeLayerId: defaultLayerId,
});

const getUndoableState = (state: AppStore): UndoableState => ({
    levels: JSON.parse(JSON.stringify(state.levels)),
    activeLevelIndex: state.activeLevelIndex,
    zones: JSON.parse(JSON.stringify(state.zones)),
    infrastructure: JSON.parse(JSON.stringify(state.infrastructure)),
    planNorthDirection: state.planNorthDirection,
    propertyLines: JSON.parse(JSON.stringify(state.propertyLines)),
    terrainMesh: state.terrainMesh ? JSON.parse(JSON.stringify(state.terrainMesh)) : null,
    stagingSettings: JSON.parse(JSON.stringify(state.stagingSettings)),
    savedCameraViews: JSON.parse(JSON.stringify(state.savedCameraViews)),
    holocron: state.currentProject?.holocron ? JSON.parse(JSON.stringify(state.currentProject.holocron)) : null,
    storyboard: state.currentProject?.storyboard ? JSON.parse(JSON.stringify(state.currentProject.storyboard)) : null,
});

export const createEditorSlice: StateCreator<AppStore, [], [], EditorSlice> = (set, get) => ({
    levels: [createDefaultLevel()],
    activeLevelIndex: 0,
    zones: [],
    infrastructure: [],
    planNorthDirection: 'N',
    propertyLines: [],
    terrainMesh: null,
    stagingSettings: { timeOfDay: 'midday', enableBloom: true },
    savedCameraViews: [],
    holocron: null,
    storyboard: null,
    undoStack: [],
    redoStack: [],
    canUndo: false,
    canRedo: false,
    selectedObject: null,
    currentPlacingModelKey: null,
    activeSketcherTool: 'select',
    editorMode: 'concept',
    focusedCommentId: null,
    sunPosition: { azimuth: 135, altitude: 45 },
    isWalkthroughActive: false,
    isHolocronAuthoringMode: false,

    pushToUndoStack: () => {
        const currentUndoableState = getUndoableState(get());
        set(state => {
            const newStack = [...state.undoStack, currentUndoableState];
            if (newStack.length > MAX_UNDO_STEPS) {
                newStack.shift();
            }
            return {
                undoStack: newStack,
                redoStack: [],
                canUndo: true,
                canRedo: false,
                hasUnsavedChanges: true
            };
        });
    },

    undo: () => {
        const { undoStack } = get();
        if (undoStack.length === 0) return;
        const lastState = undoStack[undoStack.length - 1];
        set(state => ({
            ...lastState,
            undoStack: state.undoStack.slice(0, -1),
            redoStack: [...state.redoStack, getUndoableState(get())],
            canUndo: state.undoStack.length > 1,
            canRedo: true
        }));
    },
    
    redo: () => {
        const { redoStack } = get();
        if (redoStack.length === 0) return;
        const nextState = redoStack[redoStack.length - 1];
        set(state => ({
            ...nextState,
            undoStack: [...state.undoStack, getUndoableState(get())],
            redoStack: state.redoStack.slice(0, -1),
            canUndo: true,
            canRedo: state.redoStack.length > 1
        }));
    },

    setLevels: (levels) => set({ levels, hasUnsavedChanges: true }),

    setSingleLevelProp: (prop, value) => {
        set(state => {
            const newLevels = [...state.levels];
            const activeLevel = { ...newLevels[state.activeLevelIndex] };
            activeLevel[prop] = typeof value === 'function' ? (value as (prevState: any) => any)(activeLevel[prop]) : value;
            newLevels[state.activeLevelIndex] = activeLevel;
            return { levels: newLevels, hasUnsavedChanges: true };
        });
    },
    
    setSelectedObject: (payload) => set(state => ({ selectedObject: typeof payload === 'function' ? payload(state.selectedObject) : payload })),

    deleteSelectedObject: () => {
        const { selectedObject } = get();
        if (!selectedObject) return;
        get().pushToUndoStack();
        const propMap: Record<string, keyof Level> = { wall: 'walls', room: 'rooms', placement: 'placements', placedModel: 'placedModels' };
        const propKey = propMap[selectedObject.type];
        if (propKey) {
            get().setSingleLevelProp(propKey, (prev: any[]) => prev.filter(item => item.id !== selectedObject.id));
        }
        set({ selectedObject: null });
    },

    addLayer: (name) => {
        get().pushToUndoStack();
        const newLayer: Layer = { id: generateId('layer'), name, isVisible: true, isLocked: false };
        get().setSingleLevelProp('layers', (prev) => [...prev, newLayer]);
    },
    
    updateLayer: (id, updates) => {
        get().pushToUndoStack();
        get().setSingleLevelProp('layers', (prev) => prev.map(l => l.id === id ? { ...l, ...updates } : l));
    },

    deleteLayer: (id) => {
        const { activeLevelIndex, levels } = get();
        if (levels[activeLevelIndex].layers.length <= 1) {
            get().addNotification("Cannot delete the last layer.", 'error');
            return;
        }
        get().pushToUndoStack();
        get().setSingleLevelProp('layers', (prev) => prev.filter(l => l.id !== id));
        // TODO: Also delete all objects on this layer.
    },
    
    addWall: (wall) => {
        get().pushToUndoStack();
        const newWall: Wall = {
            ...wall,
            id: generateId('wall'),
            layerId: get().levels[get().activeLevelIndex].activeLayerId,
        };
        get().setSingleLevelProp('walls', (prev = []) => [...prev, newWall]);
        get().updateRoomsFromWalls();
    },

    updateWall: (wallId, updates) => {
        // For parametric geometry, we push to undo stack inside the component
        // to capture the state before the entire chain of updates.
        // get().pushToUndoStack(); 
        get().setSingleLevelProp('walls', (prev) =>
            prev.map((w) => (w.id === wallId ? { ...w, ...updates } : w))
        );
        get().updateRoomsFromWalls();
    },

    addPlacement: (placement) => {
        get().pushToUndoStack();
        const newPlacement: Placement = {
            ...placement,
            id: generateId(placement.type),
            layerId: get().levels[get().activeLevelIndex].activeLayerId,
        };
        get().setSingleLevelProp('placements', (prev) => [...prev, newPlacement]);
    },
    
    addDimensionLine: (line) => {
        get().pushToUndoStack();
        const newDimLine: DimensionLine = {
            ...line,
            id: generateId('dim'),
            layerId: get().levels[get().activeLevelIndex].activeLayerId,
        };
        get().setSingleLevelProp('dimensionLines', (prev) => [...(prev || []), newDimLine]);
    },

    addComment: (comment) => {
        get().pushToUndoStack();
        const { currentUser } = get();
        if (!currentUser) return;
        const newComment: AppComment = {
            ...comment,
            id: generateId('comment'),
            userId: currentUser.id,
            userName: currentUser.name || currentUser.email,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            resolved: false,
            layerId: get().levels[get().activeLevelIndex].activeLayerId,
            replies: []
        };
        get().setSingleLevelProp('comments', (prev = []) => [...prev, newComment]);
    },
    
    onViewCommentThread: (commentId) => {
        get().togglePanelVisibility('phoenixEngine');
        get().setActiveTool('comments');
        set({ focusedCommentId: commentId });
    },
    
    updateHolocronHotspots: () => {}, // To be implemented in later steps

    addZone: (zone) => {
        get().pushToUndoStack();
        const currentLevel = get().levels[get().activeLevelIndex];
        const zones = currentLevel.zones || [];
        const newZone: Zone = {
            path: zone.path,
            type: zone.type,
            id: generateId('zone'),
            name: `Zone ${zones.length + 1}`,
            layerId: currentLevel.activeLayerId,
        };
        get().setSingleLevelProp('zones', (prev = []) => [...prev, newZone]);
    },

    addInfrastructure: (line) => {
        get().pushToUndoStack();
        const currentLevel = get().levels[get().activeLevelIndex];
        const newLine: InfrastructureLine = {
            path: line.path,
            id: generateId('infra'),
            type: 'road',
            width: 10,
            layerId: currentLevel.activeLayerId,
        };
        get().setSingleLevelProp('infrastructure', (prev = []) => [...prev, newLine]);
    },
    
    // Simple setters
    setActiveSketcherTool: (tool) => set({ activeSketcherTool: tool }),
    setEditorMode: (mode) => set({ editorMode: mode }),
    setCurrentPlacingModelKey: (key) => set({ currentPlacingModelKey: key }),
    setSunPosition: (updater) => set(state => ({ sunPosition: typeof updater === 'function' ? updater(state.sunPosition) : updater })),
    setStagingSettings: (updater) => set(state => ({ stagingSettings: typeof updater === 'function' ? updater(state.stagingSettings) : updater, hasUnsavedChanges: true })),
    setIsWalkthroughActive: (active) => set({ isWalkthroughActive: active }),
    setIsHolocronAuthoringMode: (active) => set({ isHolocronAuthoringMode: active }),
    setFocusedCommentId: (id) => set({ focusedCommentId: id }),
    toggleHolocronEnabled: async () => {}, // To be implemented
    
    updateRoomsFromWalls: () => {
        const { levels, activeLevelIndex } = get();
        const activeLevel = levels[activeLevelIndex];
        const detectedRoomLoops = detectRooms(activeLevel.walls);
        
        const existingRooms = activeLevel.rooms || [];
        const newRooms: Room[] = [];
        // Find the highest number in existing rooms named "Room X" to avoid name collisions
        let roomCounter = existingRooms.reduce((max, r) => {
            const match = r.name.match(/^Room (\d+)$/);
            if (match) {
                return Math.max(max, parseInt(match[1], 10));
            }
            return max;
        }, 0);

        detectedRoomLoops.forEach(loop => {
            const loopId = loop.wallIds.slice().sort().join(',');
            const existing = existingRooms.find(r => r.wallIds.slice().sort().join(',') === loopId);
            
            const roomWalls = loop.wallIds.map(id => activeLevel.walls.find(w => w.id === id)).filter(Boolean) as Wall[];
            const area = calculateRoomArea(roomWalls);

            if (existing) {
                newRooms.push({ ...existing, calculatedArea: area });
            } else {
                roomCounter++;
                newRooms.push({
                    id: generateId('room'),
                    name: `Room ${roomCounter}`,
                    type: 'Unspecified',
                    wallIds: loop.wallIds,
                    layerId: activeLevel.activeLayerId,
                    calculatedArea: area,
                });
            }
        });

        get().setSingleLevelProp('rooms', newRooms);
    },
});
