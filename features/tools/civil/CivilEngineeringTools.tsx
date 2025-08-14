

// src/features/tools/civil/CivilEngineeringTools.tsx
import React from 'react';
import { PhoenixEnginePanelProps, PrithviAstraReport, ProjectData, AgniAstraReport } from '../../../types/index';
import { runPrithviAstraEngineApi, runAgniAstraEngineApi } from '../../../services/geminiService';
import { GenericApiTool } from '../misc/GenericApiTool';

// --- Prithvi-Astra (Geotechnical) Tool ---

const renderPrithviResult = (report: PrithviAstraReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <div>
            <h4 className="font-semibold text-slate-200">Geotechnical Report</h4>
            <ul className="text-sm text-slate-300 list-disc list-inside">
                <li>Soil Type: {report.geotechnicalReport.assumedSoilType}</li>
                <li>Est. SBC: {report.geotechnicalReport.estimatedSbc}</li>
                <li>Water Table: {report.geotechnicalReport.waterTableDepth}</li>
            </ul>
        </div>
        <div>
            <h4 className="font-semibold text-slate-200">Recommended Foundation</h4>
            <p className="text-sm text-slate-200"><strong>Type:</strong> {report.recommendedFoundation.type}</p>
            <p className="text-xs text-slate-400"><em>{report.recommendedFoundation.reasoning}</em></p>
        </div>
    </div>
);

export const PrithviAstraTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <GenericApiTool
            {...props}
            toolName="Prithvi-Astra (Geotechnical)"
            description="Analyzes the project's location to provide a preliminary geotechnical report and a recommended foundation plan based on our Living Root Systems philosophy."
            creditCost={20}
            icon="🌱"
            apiFn={runPrithviAstraEngineApi}
            buildPayload={(p) => {
                if (!p.currentProject?.location) {
                    p.addNotification("Please set a project location in the Project Hub first.", "error");
                    return null;
                }
                const projectData: ProjectData = {
                    name: p.currentProject.name,
                    projectType: p.currentProject.projectType,
                    levels: p.levels,
                    planNorthDirection: p.planNorthDirection,
                    propertyLines: p.propertyLines,
                    terrainMesh: p.terrainMesh,
                    zones: p.zones,
                    infrastructure: p.infrastructure,
                    location: p.currentProject.location
                };
                return [projectData];
            }}
            onSuccess={(result, p) => {
                const typedResult = result as PrithviAstraReport;
                p.setPrithviAstraReport(typedResult);
                if (typedResult.recommendedFoundation?.preliminaryPlan && p.levels[0]) {
                    p.setSingleLevelProp('foundationPlan', typedResult.recommendedFoundation.preliminaryPlan);
                }
            }}
            buttonText="Run Geotechnical Analysis"
            renderResult={(result) => renderPrithviResult(result as PrithviAstraReport)}
        />
    );
};


// --- Agni-Astra (Structural) Tool ---
const renderAgniResult = (report: AgniAstraReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3 max-h-96 overflow-y-auto">
        <h4 className="font-semibold text-slate-200">Structural System</h4>
        <p className="text-sm text-slate-300 italic">{report.structuralSystemSummary}</p>
        
        <details>
            <summary className="cursor-pointer font-semibold text-slate-200">Column Schedule ({report.columnSchedule.length})</summary>
            <ul className="text-xs text-slate-300 mt-1 pl-4">
                {report.columnSchedule.map(c => <li key={c.id}>{c.id}: {c.size} - {c.reinforcement}</li>)}
            </ul>
        </details>
        
         <details>
            <summary className="cursor-pointer font-semibold text-slate-200">Beam Layout ({report.beamLayout.length})</summary>
            <ul className="text-xs text-slate-300 mt-1 pl-4">
                 {report.beamLayout.map(b => <li key={b.id}>{b.id}: {b.size} - {b.reinforcement}</li>)}
            </ul>
        </details>
    </div>
);


export const AgniAstraTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { prithviAstraReport, setActiveTool } = props;

    if (!prithviAstraReport) {
        return (
            <div className="text-center p-4">
                <p className="text-sm text-slate-300 mb-4">A Geotechnical Report is required to run the Structural Detailing engine. Please run the Prithvi-Astra tool first.</p>
                <button onClick={() => setActiveTool('geotechnical')} className="w-full p-2 bg-sky-600 hover:bg-sky-500 rounded-md text-sm">
                    Go to Geotechnical Tool
                </button>
            </div>
        )
    }

    return (
        <GenericApiTool
            {...props}
            toolName="Agni-Astra (Structural Detailing)"
            description="Designs a complete RCC structural system (columns, beams, slabs) based on your architectural plan and the geotechnical report."
            creditCost={40}
            icon="🔥"
            apiFn={runAgniAstraEngineApi}
            buildPayload={(p) => {
                if (!p.prithviAstraReport) {
                    p.addNotification("Geotechnical report is missing.", "error");
                    return null;
                }
                const projectData: ProjectData = {
                    name: p.currentProject!.name,
                    projectType: p.currentProject!.projectType,
                    levels: p.levels,
                    planNorthDirection: p.planNorthDirection,
                    propertyLines: p.propertyLines,
                    terrainMesh: p.terrainMesh,
                    zones: p.zones,
                    infrastructure: p.infrastructure,
                    location: p.currentProject!.location
                };
                return [projectData, p.prithviAstraReport] as [ProjectData, any];
            }}
            onSuccess={(result, p) => {
                p.setAgniAstraReport(result as AgniAstraReport);
            }}
            buttonText="Generate Structural System"
            renderResult={(result) => renderAgniResult(result as AgniAstraReport)}
        />
    );
};