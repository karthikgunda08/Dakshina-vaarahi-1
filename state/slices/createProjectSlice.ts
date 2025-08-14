// src/state/slices/createProjectSlice.ts
import { StateCreator } from 'zustand';
import { AppStore, ProjectSlice, ProjectData, GeneratedDocument, GeneratedRender, Rfq, User, SketcherHandles, View3DHandles, UserCorrection } from '../../types/index';
import * as projectService from '../../services/projectService';
import * as analyticsService from '../../services/analyticsService';
import jsPDF from 'jspdf';

const generateId = (prefix: string): string => `${prefix}_${new Date().getTime()}_${Math.random().toString(36).substring(2, 7)}`;

const createDefaultLevel = (name = 'Ground Floor', elevation = 0) => ({
    id: `level_${Date.now()}`, name, elevation, walls: [], rooms: [], placements: [], placedModels: [],
    dimensionLines: [], comments: [], suggestedFurniture: [], plumbingLayout: [], electricalLayout: null, 
    hvacLayout: null, drawingSet: null,
    layers: [{ id: 'layer_default', name: 'Default', isVisible: true, isLocked: false }], activeLayerId: 'layer_default',
});

const mockRfqs: Rfq[] = [
    { _id: 'rfq_1', projectId: { id: 'proj_1', name: 'Mumbai Highrise', updatedAt: '', projectType: 'building', isPublic: true }, architectId: { id: 'user_A', name: 'ArchiCorp', email: 'contact@archicorp.com' } as User, items: [{ item: 'Structural Concrete', quantity: 500, unit: 'cum', description: '' }], status: 'open', createdAt: new Date().toISOString() },
    { _id: 'rfq_2', projectId: { id: 'proj_2', name: 'Goa Villa', updatedAt: '', projectType: 'building', isPublic: true }, architectId: { id: 'user_B', name: 'DesignScapes', email: 'info@designscapes.com' } as User, items: [{ item: 'Reinforcement Steel', quantity: 80, unit: 'T', description: '' }], status: 'open', createdAt: new Date().toISOString() },
];


export const createProjectSlice: StateCreator<AppStore, [], [], ProjectSlice> = (set, get) => ({
    projects: [],
    currentProject: null,
    isProjectLoading: false,
    projectError: null,
    globalRfqs: [],

    newProject: (type) => {
        get().pushToUndoStack();
        const newProjData: ProjectData = {
            name: type === 'building' ? 'New Building Project' : 'New Master Plan',
            projectType: type,
            levels: [createDefaultLevel()],
            userCorrections: [],
        };
        get().importProjectData(newProjData, newProjData.name!);
        get().completeOnboardingChecklistItem('projectCreated');
        set({ view: type === 'building' ? 'auraOS' : 'worldBuilder' });
    },

    loadProject: async (projectId) => {
        set({ isProjectLoading: true, projectError: null, globalLoadingMessage: "Loading project..." });
        try {
            const project = await projectService.getProjectDetails(projectId);
            set({
                currentProject: project,
                levels: project.levels,
                zones: project.zones || [],
                infrastructure: project.infrastructure || [],
                planNorthDirection: project.planNorthDirection,
                propertyLines: project.propertyLines || [],
                terrainMesh: project.terrainMesh || null,
                stagingSettings: project.stagingSettings || { timeOfDay: 'midday', enableBloom: true },
                savedCameraViews: project.savedCameraViews || [],
                holocron: project.holocron || null,
                storyboard: project.storyboard || null,
                collaborators: project.collaborators || [],
                billOfQuantities: project.billOfQuantities || null,
                sustainabilityReport: project.sustainabilityReport || null,
                constructionSequence: project.constructionSequence || null,
                isProjectLoading: false,
                view: project.projectType === 'masterPlan' ? 'worldBuilder' : 'auraOS',
                undoStack: [],
                redoStack: [],
                hasUnsavedChanges: false,
            });
            get().setupSocketListeners();
            analyticsService.trackEvent('Project Loaded', { projectId });
        } catch (error: any) {
            set({ projectError: error.message, isProjectLoading: false });
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    importProjectData: (projectData, name) => {
        set({
            currentProject: null,
            levels: projectData.levels,
            planNorthDirection: projectData.planNorthDirection || 'N',
            propertyLines: projectData.propertyLines || [],
            terrainMesh: projectData.terrainMesh || null,
            zones: projectData.zones || [],
            infrastructure: projectData.infrastructure || [],
            view: projectData.projectType === 'masterPlan' ? 'worldBuilder' : 'auraOS',
            undoStack: [],
            redoStack: [],
            hasUnsavedChanges: true,
        });
    },

    autoSaveProject: async () => {
        const { currentProject, levels, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron, storyboard } = get();
        if (!currentProject) return;
        set({ saveStatus: 'saving' });
        try {
            const projectData = { projectType: currentProject.projectType, name: currentProject.name, levels, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron, storyboard, userCorrections: currentProject.userCorrections };
            await projectService.saveProject({
                projectContent: projectData,
                projectName: currentProject.name,
                commitMessage: `Auto-saved at ${new Date().toLocaleTimeString()}`,
                existingProjectId: currentProject.id,
                commitType: 'auto',
            });
            set({ saveStatus: 'saved', hasUnsavedChanges: false });
            get().addNotification('Project auto-saved.', 'info');
        } catch (error: any) {
            set({ saveStatus: 'error' });
            get().addNotification(`Auto-save failed: ${error.message}`, 'error');
        }
    },

    saveProjectVersion: async (commitMessage: string) => {
        const { currentProject, levels, zones, infrastructure, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron, storyboard } = get();
        const projectData = { projectType: currentProject?.projectType || 'building', name: currentProject?.name || 'Untitled', levels, zones, infrastructure, planNorthDirection, propertyLines, terrainMesh, stagingSettings, savedCameraViews, holocron, storyboard, userCorrections: currentProject?.userCorrections };
        
        set({ saveStatus: 'saving' });
        try {
            const { project: savedProject } = await projectService.saveProject({
                projectContent: projectData,
                projectName: currentProject?.name || 'Untitled',
                commitMessage,
                existingProjectId: currentProject?.id,
            });
            set({ currentProject: savedProject, saveStatus: 'saved', hasUnsavedChanges: false });
            get().addNotification('Version saved successfully!', 'success');
            get().completeOnboardingChecklistItem('versionSaved');
        } catch (error: any) {
            set({ saveStatus: 'error' });
            get().addNotification(`Save failed: ${error.message}`, 'error');
        }
    },
    
    deleteProject: async (projectId) => {
        set({ globalLoadingMessage: 'Deleting project...' });
        try {
            await projectService.deleteProject(projectId);
            set(state => ({
                projects: state.projects.filter(p => p.id !== projectId),
                currentProject: state.currentProject?.id === projectId ? null : state.currentProject,
            }));
            get().addNotification('Project deleted successfully.', 'success');
        } catch (error: any) {
            get().addNotification(`Error deleting project: ${error.message}`, 'error');
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    updateCurrentProject: (updates) => {
        if (get().currentProject) {
            set(state => ({
                currentProject: { ...state.currentProject!, ...updates },
                hasUnsavedChanges: true
            }));
        }
    },

    logUserCorrection: (correction: Omit<UserCorrection, 'id' | 'timestamp'>) => {
        const newCorrection: UserCorrection = {
            ...correction,
            id: generateId('correction'),
            timestamp: new Date().toISOString(),
        };
        set(state => {
            const currentCorrections = state.currentProject?.userCorrections || [];
            // Keep only the last 20 corrections to avoid bloating the project data
            const updatedCorrections = [...currentCorrections, newCorrection].slice(-20);
            if (state.currentProject) {
                return {
                    currentProject: {
                        ...state.currentProject,
                        userCorrections: updatedCorrections,
                    },
                    hasUnsavedChanges: true,
                };
            }
            return {};
        });
    },

    exportCometPackage: async (sketcherRef, view3dRef) => {
        const { currentProject, addNotification, billOfQuantities, sustainabilityReport, vastuGridAnalysis } = get();
        if (!currentProject) {
            addNotification("No project is currently loaded.", "error");
            return;
        }

        set({ globalLoadingMessage: 'Assembling Comet Package...' });

        try {
            const doc = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4'
            });

            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();
            const margin = 15;
            const contentWidth = pageWidth - margin * 2;
            let yPos = margin;

            const addTextSection = (title: string, textContent?: string) => {
                if (!textContent) return;
                if (yPos > pageHeight - margin * 3) { // Check if space for title + a line
                    doc.addPage();
                    yPos = margin;
                }
                doc.setFontSize(16);
                doc.setTextColor(45, 85, 120); // Blueish
                doc.text(title, margin, yPos);
                yPos += 10;
                doc.setFontSize(10);
                doc.setTextColor(50, 50, 50);
                const splitText = doc.splitTextToSize(textContent, contentWidth);
                const textHeight = splitText.length * 5;

                if (yPos + textHeight > pageHeight - margin) {
                    doc.addPage();
                    yPos = margin;
                }
                doc.text(splitText, margin, yPos);
                yPos += textHeight + 10;
            };

            const addImageSection = (title: string, imageDataUrl?: string) => {
                if (!imageDataUrl) return;
                doc.addPage();
                yPos = margin;
                doc.setFontSize(16);
                doc.setTextColor(45, 85, 120);
                doc.text(title, margin, yPos);
                yPos += 10;

                const imgProps = doc.getImageProperties(imageDataUrl);
                let imgHeight = (imgProps.height * contentWidth) / imgProps.width;
                let availableHeight = pageHeight - yPos - margin;

                if (imgHeight > availableHeight) {
                    imgHeight = availableHeight;
                }

                doc.addImage(imageDataUrl, 'PNG', margin, yPos, contentWidth, imgHeight);
                yPos += imgHeight + 10;
            };

            // 1. Title Page
            doc.setFontSize(28);
            doc.setTextColor(0, 0, 0);
            doc.text('Comet Package', pageWidth / 2, pageHeight / 2 - 20, { align: 'center' });
            doc.setFontSize(18);
            doc.text(currentProject.name, pageWidth / 2, pageHeight / 2, { align: 'center' });
            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, pageHeight / 2 + 10, { align: 'center' });
            
            // 2. Architect's Folio
            if (currentProject.folio?.narrative) {
                doc.addPage();
                yPos = margin;
                addTextSection("Architect's Folio: " + (currentProject.folio.title || 'Project Vision'), currentProject.folio.narrative);
            }

            // 3. Reports
            if (billOfQuantities) {
                const boqText = billOfQuantities.lineItems.map(item => `${item.item}: ${item.quantity.toFixed(2)} ${item.unit}`).join('\n');
                addTextSection("Bill of Quantities Summary", boqText);
            }
            if (sustainabilityReport) {
                const susText = sustainabilityReport.recommendations.map(r => `- ${r.title}: ${r.description}`).join('\n');
                addTextSection(`Sustainability Report (Score: ${sustainabilityReport.score}/100)`, susText);
            }
            if (vastuGridAnalysis) {
                 const vastuSummary = vastuGridAnalysis.padas.filter(p => p.compliance === 'bad').map(p => p.reason).slice(0, 5).join('\n');
                 addTextSection("Vastu Analysis Summary", vastuSummary || 'No major Vastu defects found.');
            }

            // 4. Drawings
            const planPNG = sketcherRef.current?.exportAsPNG();
            addImageSection("2D Floor Plan", planPNG);
            
            const view3DPNG = view3dRef.current?.exportAsPNG();
            addImageSection("3D Visualization", view3DPNG);

            // 5. Renders
            if (currentProject.generatedRenders && currentProject.generatedRenders.length > 0) {
                for (const render of currentProject.generatedRenders) {
                    if (render.url) {
                        addImageSection(`Render: ${render.prompt.substring(0, 50)}...`, render.url);
                    }
                }
            }
            
            // 6. Project Data
            doc.addPage();
            yPos = margin;
            const projectDataString = JSON.stringify({
                name: currentProject.name,
                projectType: currentProject.projectType,
                levels: currentProject.levels.map(l => ({ name: l.name, elevation: l.elevation, rooms: l.rooms.length, walls: l.walls.length })),
            }, null, 2);
            addTextSection("Project Data Summary", projectDataString);

            doc.save(`${currentProject.name.replace(/\s+/g, '_')}_CometPackage.pdf`);
            addNotification("Comet Package successfully exported as PDF.", "success");

        } catch (error: any) {
            console.error("Error creating Comet Package:", error);
            addNotification(`Failed to create package: ${error.message}`, "error");
        } finally {
            set({ globalLoadingMessage: null });
        }
    },

    exportAsDxf: async () => {
        const { currentProject, addNotification, setGlobalLoading } = get();
        if (!currentProject) {
            addNotification("No project is loaded to export.", "error");
            return;
        }
        setGlobalLoading("Exporting to DXF...");
        try {
            await projectService.exportDwgApi(currentProject.id, currentProject.name);
            addNotification("DXF export started successfully.", "success");
        } catch (error: any) {
            addNotification(`DXF export failed: ${error.message}`, "error");
        } finally {
            setGlobalLoading(null);
        }
    },

    importDwgProject: async (file: File) => {
        const { addNotification, setGlobalLoading, importProjectData, setNewProjectModalOpen } = get();
        if (!file) return;

        setGlobalLoading("Importing DWG/DXF file...");
        setNewProjectModalOpen(false); // Close the modal as the process starts

        try {
            const result = await projectService.importDwgApi(file);
            importProjectData(result, result.name);
            addNotification(`Successfully imported "${result.name}". Save to create a new project.`, "success");
        } catch (error: any) {
            addNotification(`Import failed: ${error.message}`, "error");
        } finally {
            setGlobalLoading(null);
        }
    },
    
    importRevitProject: async (revitProjectId: string) => {
        const { addNotification, setGlobalLoading, importProjectData, togglePanelVisibility } = get();
        if (!revitProjectId.trim()) {
            addNotification("Please enter a mock Revit Project ID.", "error");
            return;
        }

        setGlobalLoading("Importing Revit Project (Simulation)...");
        try {
            const result = await projectService.importRevitProject(revitProjectId);
            importProjectData(result, result.name);
            addNotification(`Successfully imported project "${result.name}". Save to create a new project.`, "success");
            togglePanelVisibility('integrationsPanel'); // Close panel on success
        } catch (error: any) {
            addNotification(`Import failed: ${error.message}`, "error");
        } finally {
            setGlobalLoading(null);
        }
    },

    setGeneratedDocuments: (documents: GeneratedDocument[]) => {
        get().updateCurrentProject({ generatedDocuments: documents });
    },
    setGeneratedRenders: (renders: GeneratedRender[]) => {
        get().updateCurrentProject({ generatedRenders: renders });
    },

    fetchGlobalRfqs: async () => {
        set({ globalRfqs: mockRfqs });
    },
});
