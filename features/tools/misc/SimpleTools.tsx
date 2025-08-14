// src/features/tools/misc/SimpleTools.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, FlowIssue, SiteAnalysisReport, PlumbingLine, ElectricalLayout, HvacLayout, CinematicTour, ProjectData, Project, Level, PropertyLine, TerrainMesh } from '../../../types/index';
import { useNotificationStore } from '../../../state/notificationStore';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { 
    generateArSuggestionsApi, 
    generatePlanFromImageApi,
    generatePlumbingLayoutApi,
    generateElectricalLayoutApi,
    generateHvacLayoutApi,
    analyzeFlowAndErgonomicsApi,
    generateCinematicTourApi,
    analyzeSiteApi,
} from '../../../services/geminiService';
import { GenericApiTool } from './GenericApiTool';

// --- AR Design Lab Tool ---
export const ARDesignLabTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser } = props;
    const { addNotification } = useNotificationStore();

    const handleAnalyzeWall = async () => {
        if (!currentUser) { addNotification("Please log in.", "error"); return; }
        addNotification("AR feature coming soon! This will analyze your wall via camera.", "info");
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">AR Design Lab</h3>
            <p className="text-sm text-slate-300 my-3">Use your device's camera to analyze your physical room and get AI-powered design suggestions. (This feature is under development).</p>
            <button onClick={handleAnalyzeWall} className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700">
                <span className="mr-2 text-lg">🪄</span> Activate AR Scanner (Coming Soon)
            </button>
        </div>
    );
};


// --- Sketch to Plan Tool ---
export const SketchToPlanTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, setBuyCreditsModalOpen, refreshCurrentUser, setLevels, pushToUndoStack, currentProject, setLastAiToolRun } = props;
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!currentUser) { addNotification("Please log in.", "error"); return; }
        if (currentUser.role !== 'owner' && currentUser.credits < 20) {
            addNotification(`You need 20 credits.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        setIsLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
            const base64Image = (e.target?.result as string).split(',')[1];
            try {
                pushToUndoStack();
                const result = await generatePlanFromImageApi(currentProject?.id || '', base64Image, file.type);
                setLevels(result.levels || []);
                addNotification("Floor plan generated from image!", "success");
                setLastAiToolRun('Sketch to Plan');
                await refreshCurrentUser();
            } catch (err: any) {
                addNotification(`Failed to generate plan: ${err.message}`, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Sketch to Plan</h3>
            <p className="text-sm text-slate-300 my-3">Upload an image of a hand-drawn sketch or a blueprint, and the AI will convert it into an editable digital floor plan.</p>
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
            <button onClick={() => fileInputRef.current?.click()} disabled={isLoading} className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700">
                 {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">✍️</span>}
                 {isLoading ? 'Analyzing Image...' : 'Upload Image & Generate Plan (20 Cr)'}
            </button>
        </div>
    );
};

// --- Tool Definitions using the Factory ---
export const PlumbingTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="Plumbing Layout"
        description="Generates a preliminary plumbing layout for wet areas."
        creditCost={15}
        icon="💧"
        apiFn={generatePlumbingLayoutApi}
        buildPayload={(p): [ProjectData] | null => {
            const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
            return [projectData];
        }}
        onSuccess={(result, p) => p.setSingleLevelProp('plumbingLayout', (result as { plumbingLayout: PlumbingLine[] }).plumbingLayout)}
    />
);

export const ElectricalTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="Electrical Layout"
        description="Generates a preliminary electrical layout with circuits and wiring paths."
        creditCost={15}
        icon="⚡️"
        apiFn={generateElectricalLayoutApi}
        buildPayload={(p): [ProjectData] | null => {
             const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
             return [projectData];
        }}
        onSuccess={(result, p) => p.setSingleLevelProp('electricalLayout', result as ElectricalLayout)}
    />
);

export const HVACTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="HVAC Layout"
        description="Generates a preliminary HVAC layout with ducts and vents."
        creditCost={15}
        icon="💨"
        apiFn={generateHvacLayoutApi}
        buildPayload={(p): [ProjectData] | null => {
            const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
            return [projectData];
        }}
        onSuccess={(result, p) => p.setSingleLevelProp('hvacLayout', result as HvacLayout)}
    />
);

export const FlowTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="Flow & Ergonomics Analysis"
        description="Analyzes the floor plan for movement pathways and potential ergonomic issues."
        creditCost={2}
        icon="🚶"
        apiFn={analyzeFlowAndErgonomicsApi}
        buildPayload={(p): [ProjectData] | null => {
            const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
            return [projectData];
        }}
        onSuccess={(result, p) => {
            const typedResult = result as FlowIssue[];
            p.addNotification(`${typedResult.length} flow/ergonomics issues found. Check console for details.`, 'info');
            console.log("Flow & Ergonomics Report:", typedResult);
        }}
    />
);

export const CinematicTourTool: React.FC<PhoenixEnginePanelProps> = (props) => (
    <GenericApiTool
        {...props}
        toolName="Cinematic Tour"
        description="Generates a cinematic tour script and camera path for your project."
        creditCost={40}
        icon="🎬"
        apiFn={generateCinematicTourApi}
        buildPayload={(p): [ProjectData] | null => {
            const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
            return [projectData];
        }}
        onSuccess={(result, p) => {
            p.setCinematicTourData(result as CinematicTour);
            p.addNotification("Cinematic tour is ready! Click the ▶️ button on the bottom dock.", "success");
        }}
    />
);

export const SiteAnalysisTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { addNotification } = useNotificationStore();
    return (
        <GenericApiTool
            {...props}
            toolName="Site Analysis"
            description="Analyzes the project site, including terrain and property lines."
            creditCost={10}
            icon="🗺️"
            apiFn={analyzeSiteApi}
            buildPayload={(p): [Pick<Project, 'terrainMesh' | 'propertyLines' | 'projectType' | 'levels' | 'planNorthDirection'>] | null => {
                if (!p.terrainMesh) {
                    addNotification("Please generate a terrain before analyzing the site.", "error");
                    return null;
                }
                const projectData = {
                    projectType: p.currentProject?.projectType || 'building',
                    levels: p.levels,
                    planNorthDirection: p.planNorthDirection,
                    propertyLines: p.propertyLines,
                    terrainMesh: p.terrainMesh,
                };
                return [projectData];
            }}
            onSuccess={(result, p) => {
                p.addNotification(`Site Analysis Complete: ${(result as SiteAnalysisReport).summary}`, 'success');
            }}
        />
    );
};