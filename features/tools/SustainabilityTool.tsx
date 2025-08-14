
// src/features/tools/SustainabilityTool.tsx
import React from 'react';
import { GenericApiTool } from './misc/GenericApiTool';
import { PhoenixEnginePanelProps, SustainabilityReport, ProjectData } from '../../types/index';
import { analyzeSustainabilityApi } from '../../services/geminiService';

const renderSustainabilityResult = (report: SustainabilityReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <div className="text-center">
            <p className="text-slate-300">Overall Score</p>
            <p className="text-4xl font-bold text-emerald-300">{report.score}/100</p>
        </div>
        <div>
            <h5 className="font-semibold text-slate-200 mb-1">Breakdown:</h5>
            {report.scoreBreakdown.map((item, i) => (
                 <p key={i} className="text-sm"><strong>{item.metric}:</strong> {item.assessment}</p>
            ))}
        </div>
         <div>
            <h5 className="font-semibold text-slate-200 mb-1">Recommendations:</h5>
            <ul className="list-disc list-inside text-sm">
                {report.recommendations.map((item, i) => <li key={i}><strong>{item.title}:</strong> {item.description}</li>)}
            </ul>
        </div>
    </div>
);

export const SustainabilityTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <GenericApiTool
            {...props}
            toolName="Sustainability Analysis"
            description="Analyze your project's environmental impact, including orientation, daylighting, and material choices."
            creditCost={10}
            icon="🌿"
            apiFn={analyzeSustainabilityApi}
            buildPayload={(p): [ProjectData] => {
                const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
                return [projectData];
            }}
            onSuccess={(result, p) => p.setSustainabilityReport(result as SustainabilityReport)}
            buttonText="Run Sustainability Analysis"
            renderResult={renderSustainabilityResult}
        />
    );
};