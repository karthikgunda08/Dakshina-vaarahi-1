// src/state/slices/createAISlice.ts
import { StateCreator } from 'zustand';
import { AppStore, AISlice, BrahmaAstraMission, SuggestedItem, GFCDrawingSet, CinematicTour, SutraAction, Sutra, AiFixResponse, PlacedModel, InteriorSchemeResponse, BrahmaAstraReport, SingularityReport, SamaranganSolution, ProjectData } from '../../types/index';
import * as geminiService from '../../services/geminiService';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../notificationStore';

const generateId = (prefix: string): string => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;

const AVAILABLE_SUTRA_ACTIONS: SutraAction[] = [
    { id: 'vastu', name: 'Run Vastu Analysis', description: 'Generates a Vastu compliance report.', creditCost: 10, icon: '🕉️' },
    { id: 'boq', name: 'Generate BoQ', description: 'Creates a Bill of Quantities for the project.', creditCost: 15, icon: '🧾' },
    { id: 'structure', name: 'Analyze Structure', description: 'Performs a preliminary structural analysis.', creditCost: 25, icon: '🏛️' },
    { id: 'sustainability', name: 'Analyze Sustainability', description: 'Generates a sustainability report.', creditCost: 10, icon: '🌿' },
    { id: 'render_living', name: 'Render Living Room', description: 'Generates one photorealistic render of the living room.', creditCost: 5, icon: '🖼️' },
    { id: 'render_master_bedroom', name: 'Render Master Bedroom', description: 'Generates one photorealistic render of the master bedroom.', creditCost: 5, icon: '🖼️' },
    { id: 'folio', name: 'Generate Folio', description: 'Creates an Architect\'s Folio presentation.', creditCost: 15, icon: '📖' },
];


export const createAISlice: StateCreator<AppStore, [], [], AISlice> = (set, get) => ({
    aiFixPreview: null,
    cinematicTourData: null,
    isCinematicTourPlaying: false,
    activeTool: 'aiArchitect',
    advancedStructuralReport: null,
    vastuGridAnalysis: null,
    showVastuGrid: false,
    companionLog: [],
    isCompanionActive: false,
    companionState: 'idle',
    companionTranscript: null,
    billOfQuantities: null,
    sustainabilityReport: null,
    brahmaAstraReport: null,
    isBrahmaAstraRunning: false,
    lokaSimulatorReport: null,
    navagrahaReport: null,
    akashaReport: null,
    samsaraReport: null,
    shilpaSutraReport: null,
    prithviAstraReport: null,
    agniAstraReport: null,
    nexusReport: null,
    atmanSignature: null,
    atmanSignatureReport: null,
    paramAstraReport: null,
    svaDharmaReport: null,
    sanjeevaniReport: null,
    isSingularityRunning: false,
    singularityProgress: null,
    singularityReport: null,
    isBrahmandaAstraActive: false,
    generativeFeedbackActive: false,
    isJuggernautModeActive: false,
    realityMesh: null,
    juggernautPredictions: null,
    fixingDiscrepancyId: null,
    juggernautIntervalId: null,
    isDigitalTwinModeActive: false,
    digitalTwinData: null,
    activeDataOverlays: { energy: false, stress: false, occupancy: false },
    constructionSequence: null,
    activeTimelineWeek: null,
    isSimulatingLiveData: false,
    // NEW Features State
    atmanSparringHistory: [],
    sutras: [],
    runningSutraId: null,
    sutraExecutionLogs: [],
    samaranganSolutions: null,
    lastAiToolRun: null,


    // Setters
    setLastAiToolRun: (tool) => {
        set({ lastAiToolRun: tool });
        get().completeOnboardingChecklistItem('aiToolUsed');
        // Proactive suggestion logic
        if (tool && ['MasterArchitect', 'DreamWeaver', 'Sketch to Plan'].includes(tool)) {
            setTimeout(() => {
                const projectHasVastuReport = !!get().vastuGridAnalysis;
                if (!projectHasVastuReport) {
                    get().addProactiveSuggestion({
                        title: 'Harmonize Your Space',
                        message: 'You\'ve created a new floor plan. Would you like to run a Vastu Grid Analysis to check its energetic balance?',
                        cta: {
                            label: 'Analyze Vastu',
                            action: (store) => {
                                store.togglePanelVisibility('phoenixEngine');
                                store.setActiveTool('vastu');
                            }
                        }
                    });
                }
            }, 5000); // 5 second delay
        }
    },
    setAiFixPreview: (fix) => set({ aiFixPreview: fix }),
    setIsCinematicTourPlaying: (isPlaying) => set({ isCinematicTourPlaying: isPlaying }),
    setActiveTool: (tool) => set({ activeTool: tool }),
    setCompanionState: (state) => set({ companionState: state }),
    setCompanionTranscript: (transcript) => set({ companionTranscript: transcript }),
    setShowVastuGrid: (show) => set(state => ({ showVastuGrid: typeof show === 'function' ? show(state.showVastuGrid) : show })),
    setIsBrahmandaAstraActive: (value) => set({ isBrahmandaAstraActive: value }),
    setVastuGridAnalysis: (analysis) => set({ vastuGridAnalysis: analysis }),
    setAdvancedStructuralReport: (report) => set({ advancedStructuralReport: report }),
    setBillOfQuantities: (report) => set({ billOfQuantities: report }),
    setSustainabilityReport: (report) => set({ sustainabilityReport: report }),
    setDrawingSet: (gfcSet) => get().setSingleLevelProp('drawingSet', gfcSet),
    setCinematicTourData: (tour) => set({ cinematicTourData: tour }),
    setLokaSimulatorReport: (report) => set({ lokaSimulatorReport: report }),
    setNavagrahaReport: (report) => set({ navagrahaReport: report }),
    setAkashaReport: (report) => set({ akashaReport: report }),
    setSamsaraReport: (report) => set({ samsaraReport: report }),
    setShilpaSutraReport: (report) => set({ shilpaSutraReport: report }),
    setPrithviAstraReport: (report) => set({ prithviAstraReport: report }),
    setAgniAstraReport: (report) => set({ agniAstraReport: report }),
    setNexusReport: (report) => set({ nexusReport: report }),
    setSvaDharmaReport: (report) => set({ svaDharmaReport: report }),
    setAtmanSignatureReport: (report) => set({ atmanSignatureReport: report }),
    setParamAstraReport: (report) => set({ paramAstraReport: report }),
    setSanjeevaniReport: (report) => set({ sanjeevaniReport: report }),
    setSingularityReport: (report) => set({ singularityReport: report }),
    setActiveDataOverlays: (updater) => set(state => ({ activeDataOverlays: updater(state.activeDataOverlays) })),
    setActiveTimelineWeek: (week) => set(state => ({ activeTimelineWeek: typeof week === 'function' ? week(state.activeTimelineWeek) : week })),
    setIsSimulatingLiveData: (isSimulating) => set(state => ({ isSimulatingLiveData: isSimulating, activeDataOverlays: { ...state.activeDataOverlays, stress: isSimulating }})),
    setSamaranganSolutions: (solutions) => set({ samaranganSolutions: solutions }),

    // AI Actions
    runBrahmaAstra: async (mission) => {
        const { addNotification, refreshCurrentUser, setBuyCreditsModalOpen, currentUser, currentProject } = get();
        const creditCost = 250;
        if (currentUser && currentUser.role !== 'owner' && currentUser.credits < creditCost) {
            addNotification(`You need ${creditCost} credits for the Brahma-Astra Engine.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        set({ isBrahmaAstraRunning: true, brahmaAstraReport: null });
        try {
            const report = await geminiService.runBrahmaAstraEngineApi(currentProject?.id || '', mission);
            set({ brahmaAstraReport: report });
            await refreshCurrentUser();
            addNotification("Brahma-Astra mission complete. Report generated.", "success");
        } catch (error: any) {
            addNotification(`Brahma-Astra failed: ${error.message}`, 'error');
        } finally {
            set({ isBrahmaAstraRunning: false });
        }
    },
    
    runSvaDharmaAnalyzer: async () => {
        set({ globalLoadingMessage: 'Analyzing your architectural DNA...' });
        try {
            const report = await geminiService.runSvaDharmaAnalyzerApi(get().currentProject?.id || '', get().projects);
            set({ svaDharmaReport: report, atmanSignature: report.signature });
            get().addNotification("Your Atman Signature has been discovered!", "success");
        } catch (error: any) {
            get().addNotification(`Analysis failed: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    runVisualSvaDharmaAnalyzer: async (files: FileList) => {
        const { addNotification, refreshCurrentUser, setBuyCreditsModalOpen, currentUser, currentProject } = get();
        const creditCost = 50;
        if (!currentUser) {
            addNotification("Please log in to use this feature.", "error");
            return;
        }
        if (currentUser.role !== 'owner' && currentUser.credits < creditCost) {
            addNotification(`You need ${creditCost} credits for Visual Signature Analysis.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        set({ globalLoadingMessage: 'Analyzing visual portfolio...' });
        try {
            const imagePromises = Array.from(files).map(file => {
                return new Promise<{ base64: string, mimeType: string }>((resolve, reject) => {
                    const reader = new FileReader();
                    reader.onload = () => {
                        const base64 = (reader.result as string).split(',')[1];
                        resolve({ base64, mimeType: file.type });
                    };
                    reader.onerror = error => reject(error);
                    reader.readAsDataURL(file);
                });
            });

            const images = await Promise.all(imagePromises);

            const report = await geminiService.analyzeVisualPortfolioApi(currentProject?.id || '', images);
            set({ svaDharmaReport: report, atmanSignature: report.signature });
            addNotification("Your visual Atman Signature has been discovered!", "success");
            await refreshCurrentUser();
        } catch (error: any) {
            addNotification(`Visual analysis failed: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    runAiFurnishRoom: async (roomId: string, style: string, atmanSignature?: string, applyPlacement?: boolean, existingResult?: InteriorSchemeResponse | null): Promise<InteriorSchemeResponse | void> => {
        const { currentProject, levels, refreshCurrentUser } = get();
        if (!currentProject) {
            throw new Error("No project loaded.");
        }

        let schemeResult: InteriorSchemeResponse;
        
        if (existingResult) {
            schemeResult = existingResult;
        } else {
            const projectData = { name: currentProject.name, projectType: currentProject.projectType, levels, planNorthDirection: get().planNorthDirection };
            schemeResult = await geminiService.generateInteriorSchemeApi(currentProject.id, projectData, roomId, style, atmanSignature);
            await refreshCurrentUser();
            if (!applyPlacement) {
                return schemeResult; // Return the generated scheme without applying it
            }
        }

        // --- Apply Placement Logic ---
        get().pushToUndoStack();

        const allItems: SuggestedItem[] = [
            ...(schemeResult.furniture || []),
            ...(schemeResult.lighting || []),
            ...(schemeResult.textiles || []),
            ...(schemeResult.decor || [])
        ];

        const newModels: PlacedModel[] = allItems.map(item => ({
            ...item,
            id: generateId('model_decor'),
            layerId: get().levels[get().activeLevelIndex].activeLayerId,
            roomId: roomId,
            width: item.width || 50,
            depth: item.depth || 50,
            height3d: item.height3d || 50,
        }));

        // BUG FIX: Apply new models, removing any old ones from the same room to prevent stacking
        get().setSingleLevelProp('placedModels', (prevModels: PlacedModel[] = []) => [
            ...prevModels.filter(m => m.roomId !== roomId),
            ...newModels
        ]);

        // Apply room materials
        get().setSingleLevelProp('rooms', prevRooms => prevRooms.map(room => {
            if (room.id === roomId) {
                return {
                    ...room,
                    floorMaterial: schemeResult.materials.floor.materialKey,
                    wallMaterialOverride: schemeResult.materials.primaryWall.materialKey
                };
            }
            return room;
        }));

        // Apply accent wall material
        if (schemeResult.materials.accentWall) {
            const accentWallId = schemeResult.materials.accentWall.wallId;
            get().setSingleLevelProp('walls', prevWalls => prevWalls.map(wall => {
                if (wall.id === accentWallId) {
                    return { ...wall, material: schemeResult.materials.accentWall!.materialKey };
                }
                return wall;
            }));
        }
    },

    runSingularityEngine: async () => {
        const { currentProject, levels, addNotification, refreshCurrentUser, setBuyCreditsModalOpen, currentUser } = get();
        if (!currentProject) {
            addNotification("Please load a project before activating the Singularity Engine.", "error");
            return;
        }
        const creditCost = 500;
        if (currentUser && currentUser.role !== 'owner' && currentUser.credits < creditCost) {
            addNotification(`The Singularity Engine requires ${creditCost} credits.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }
        set({ isSingularityRunning: true, singularityReport: null });
        try {
            const projectData = { projectType: currentProject.projectType, levels, planNorthDirection: get().planNorthDirection };
            const report = await geminiService.runSingularityEngineApi(currentProject.id, projectData);
            set({ singularityReport: report });
            await refreshCurrentUser(); // To reflect credit cost
            // A full project load might be needed to see all the new assets
            await get().loadProject(currentProject.id);
            addNotification("Singularity Engine complete! Project Hub has been updated.", "success");
        } catch (error: any) {
            addNotification(`Singularity Engine failed: ${error.message}`, 'error');
        } finally {
            set({ isSingularityRunning: false });
        }
    },


    toggleJuggernautMode: () => {
        set(state => {
            const isActive = !state.isJuggernautModeActive;
            if (!isActive) {
                set({ juggernautPredictions: null });
            }
            return { isJuggernautModeActive: isActive };
        });
    },

    runSiteAdjudicator: async () => {
        const { currentProject } = get();
        if (!currentProject) return;
        set({ globalLoadingMessage: "Juggernaut is running predictive analysis..." });
        try {
            const report = await geminiService.runSiteAdjudicatorApi(currentProject.id, currentProject);
            set({ 
                juggernautPredictions: report.predictions, 
                realityMesh: report.realityMesh || null 
            });
            get().updateCurrentProject({ juggernautReport: report });
            get().addNotification("Juggernaut predictive analysis complete.", "success");
        } catch (error: any) {
            get().addNotification(`Juggernaut failed: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },
    
    toggleDigitalTwinMode: async () => {
        const { currentProject, isDigitalTwinModeActive, togglePanelVisibility } = get();
        if (!currentProject) return;
        
        const digitalTwinPanelState = get().panelStates.digitalTwinPanel;
        if (!digitalTwinPanelState.isVisible) {
            togglePanelVisibility('digitalTwinPanel');
        }

        if (!isDigitalTwinModeActive) {
            set({ globalLoadingMessage: 'Activating Digital Twin...' });
            try {
                const data = await projectService.getDigitalTwinData(currentProject.id);
                set({ digitalTwinData: data, isDigitalTwinModeActive: true });
            } catch (error: any) {
                get().addNotification(`Failed to activate Digital Twin: ${error.message}`, 'error');
            } finally {
                set({ globalLoadingMessage: null });
            }
        } else {
            set({ isDigitalTwinModeActive: false, digitalTwinData: null });
        }
    },

    startSparringSession: async (prompt) => {
        set({ globalLoadingMessage: 'Sparring with Atman AI...' });
        await new Promise(res => setTimeout(res, 1500)); // Simulate API call
        const currentSignature = get().currentUser?.atmanSignatureFineTuned || get().atmanSignature || 'minimalist, clean lines';
        const aiResponse = `Based on your signature of "${currentSignature}", for a "${prompt}", I would propose using natural materials like light oak and travertine, with a focus on uncluttered spaces and integrated storage.`;
        const refinedSignature = `${currentSignature}, natural materials, integrated storage`;

        set(state => ({
            atmanSparringHistory: [...state.atmanSparringHistory, { prompt, aiResponse, userFeedback: '', refinedSignature }],
            currentUser: state.currentUser ? { ...state.currentUser, atmanSignatureFineTuned: refinedSignature } : null,
            globalLoadingMessage: null
        }));
    },

    loadSutras: async () => {
        const savedSutras = localStorage.getItem('auraos_sutras');
        if (savedSutras) {
            set({ sutras: JSON.parse(savedSutras) });
        }
    },

    saveSutra: async (sutra: Omit<Sutra, '_id'>) => {
        const newSutra: Sutra = { ...sutra, _id: generateId('sutra') };
        set(state => {
            const updatedSutras = [...state.sutras, newSutra];
            localStorage.setItem('auraos_sutras', JSON.stringify(updatedSutras));
            return { sutras: updatedSutras };
        });
        get().addNotification(`Sutra "${sutra.name}" saved!`, 'success');
    },
    
    executeSutra: async (sutraId, projectId) => {
        const sutra = get().sutras.find(s => s._id === sutraId);
        const project = get().projects.find(p => p.id === projectId);
        if (!sutra || !project) {
            get().addNotification("Sutra or Project not found.", "error");
            return;
        }
        
        await get().loadProject(projectId);
        
        set({ runningSutraId: sutraId, sutraExecutionLogs: [] });
        
        const log = (msg: string) => set(state => ({ sutraExecutionLogs: [...state.sutraExecutionLogs, `[${new Date().toLocaleTimeString()}] ${msg}`] }));

        const { setVastuGridAnalysis, setBillOfQuantities, setAdvancedStructuralReport, setSustainabilityReport, setLastAiToolRun, refreshCurrentUser } = get();

        log(`Starting Sutra: "${sutra.name}" on Project: "${project.name}"`);

        for (const actionId of sutra.actions) {
            const actionDef = AVAILABLE_SUTRA_ACTIONS.find(a => a.id === actionId);
            if (!actionDef) {
                log(`ERROR: Action ${actionId} not found.`);
                continue;
            }
            
            log(`Executing: ${actionDef.name}...`);
            
            try {
                const fullProject = get().currentProject;
                if (!fullProject) throw new Error("Current project data is not available.");
                
                const projectData: ProjectData = {
                    projectType: fullProject.projectType,
                    levels: fullProject.levels,
                    planNorthDirection: fullProject.planNorthDirection,
                    propertyLines: fullProject.propertyLines,
                    terrainMesh: fullProject.terrainMesh
                };
                
                switch (actionId) {
                    case 'vastu':
                        const vastuResult = await geminiService.analyzeVastuGridApi(projectId, projectData);
                        setVastuGridAnalysis(vastuResult);
                        break;
                    case 'boq':
                        const boqResult = await geminiService.generateBoqApi(projectId, projectData);
                        setBillOfQuantities(boqResult);
                        break;
                    case 'structure':
                        const structResult = await geminiService.estimateStructureApi(projectId, projectData);
                        setAdvancedStructuralReport(structResult);
                        break;
                    case 'sustainability':
                        const susResult = await geminiService.analyzeSustainabilityApi(projectId, projectData);
                        setSustainabilityReport(susResult);
                        break;
                    case 'render_living': {
                        const livingRoom = fullProject.levels[0]?.rooms.find(r => r.type.toLowerCase().includes('living'));
                        if (!livingRoom) throw new Error("Living room not found for render.");
                        await geminiService.generateRenderApi(projectId, projectData, livingRoom.id, "photorealistic architectural render");
                        break;
                    }
                    case 'render_master_bedroom': {
                        const masterBedroom = fullProject.levels[0]?.rooms.find(r => r.type.toLowerCase().includes('master bedroom'));
                        if (!masterBedroom) throw new Error("Master bedroom not found for render.");
                        await geminiService.generateRenderApi(projectId, projectData, masterBedroom.id, "photorealistic architectural render");
                        break;
                    }
                    case 'folio':
                        await projectService.generateArchitectsFolioApi(projectId);
                        break;
                }
                setLastAiToolRun(actionDef.name);
                await refreshCurrentUser();
                log(`...Success.`);
            } catch(e: any) {
                log(`...Failed: ${e.message}`);
                set({ runningSutraId: null });
                return;
            }
        }
        
        log(`✅ Sutra execution complete.`);
        set({ runningSutraId: null });
    },

    proposeSamaranganFixes: async (command) => {
        const { currentProject, levels, planNorthDirection, propertyLines, terrainMesh, addNotification, refreshCurrentUser } = get();
        if (!currentProject) return;
        
        const creditCost = 15;
        const currentUser = get().currentUser;
        if (currentUser && currentUser.role !== 'owner' && currentUser.credits < creditCost) {
            addNotification(`You need ${creditCost} credits for the Samarangan Engine.`, 'info');
            get().setBuyCreditsModalOpen(true);
            return;
        }

        const projectData = { projectType: currentProject.projectType, levels, planNorthDirection, propertyLines, terrainMesh };
        
        try {
            const solutions = await geminiService.proposeSamaranganFixesApi(currentProject.id, command, projectData);
            set({ samaranganSolutions: solutions });
            if (currentUser && currentUser.role !== 'owner') {
                await refreshCurrentUser();
            }
        } catch (error: any) {
            addNotification(`Samarangan Engine failed: ${error.message}`, 'error');
            set({ samaranganSolutions: null });
        }
    },
    
    applySamaranganFix: (fix) => {
        const { pushToUndoStack, setSingleLevelProp, addNotification } = get();
        pushToUndoStack();
        const { addedWalls, modifiedWalls, deletedWallIds } = fix;
        
        setSingleLevelProp('walls', (currentWalls: any[]) => {
            let newWalls = [...currentWalls];
            if (deletedWallIds) {
                newWalls = newWalls.filter(w => !deletedWallIds.includes(w.id));
            }
            if (modifiedWalls) {
                newWalls = newWalls.map(w => {
                    const mod = modifiedWalls.find(m => m.id === w.id);
                    return mod ? { ...w, ...mod } : w;
                });
            }
            if (addedWalls) {
                const activeLayerId = get().levels[get().activeLevelIndex].activeLayerId;
                const newWallObjects = addedWalls.map(w => ({
                    ...w,
                    id: generateId('wall_fix'),
                    height: 240,
                    thickness: 10,
                    layerId: activeLayerId
                }));
                newWalls.push(...newWallObjects);
            }
            return newWalls;
        });
        
        addNotification("AI's solution has been applied to the design.", 'success');
        set({ samaranganSolutions: null, aiFixPreview: null }); // Clear solutions and preview after applying
    },
});
