// src/features/tools/StructureTool.tsx
import React from 'react';
import { GenericApiTool } from './misc/GenericApiTool';
import { PhoenixEnginePanelProps, AdvancedStructuralReport, ProjectData } from '../../types/index';
import { estimateStructureApi } from '../../services/geminiService';

const renderStructuralResult = (report: AdvancedStructuralReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-4">
        <div>
            <h4 className="font-semibold text-slate-200">Structural Summary</h4>
            <p className="text-sm text-slate-300 italic">{report.summary}</p>
        </div>
        <div>
            <h5 className="font-semibold text-slate-200 mb-1">Load Bearing Walls ({report.loadBearingWalls.length}):</h5>
            <p className="text-xs text-slate-400 break-all">{report.loadBearingWalls.join(', ')}</p>
        </div>
         <div>
            <h5 className="font-semibold text-slate-200 mb-1">Preliminary Load Calculations:</h5>
            <ul className="space-y-1 text-sm">
                {report.preliminaryLoadCalculations.map((item, i) => (
                    <li key={i}><strong>{item.area}:</strong> DL {item.deadLoad}, LL {item.liveLoad}</li>
                ))}
            </ul>
        </div>
        <div>
            <h5 className="font-semibold text-slate-200 mb-1">Sizing Suggestions:</h5>
            <ul className="space-y-1 text-sm">
                {report.sizingSuggestions.map((item, i) => (
                    <li key={i} className="text-xs p-2 bg-slate-900/50 rounded-md">
                        <strong className="capitalize">{item.type}:</strong> {item.suggestedSize} - {item.reason}
                    </li>
                ))}
            </ul>
        </div>
    </div>
);


export const StructureTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <GenericApiTool
            {...props}
            toolName="Structural Analysis"
            description="Get a preliminary structural analysis, including load-bearing wall identification and suggestions for column and beam sizing."
            creditCost={25}
            icon="🏛️"
            apiFn={estimateStructureApi}
            buildPayload={(p): [ProjectData] => {
                const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
                return [projectData];
            }}
            onSuccess={(result, p) => p.setAdvancedStructuralReport(result as AdvancedStructuralReport)}
            buttonText="Run Structural Analysis"
            renderResult={renderStructuralResult}
        />
    );
};