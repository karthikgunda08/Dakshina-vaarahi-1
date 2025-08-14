
// src/features/DetailingTool.tsx
import React from 'react';
import { PhoenixEnginePanelProps, DimensionLine, ProjectData } from '../types/index';
import { generateBlueprintDetailsApi } from '../services/geminiService';
import { GenericApiTool } from './tools/misc/GenericApiTool';

const renderBlueprintResult = (result: { dimensionLines: DimensionLine[] }) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
        <p className="text-sm text-slate-200">Generated <span className="font-bold text-amber-300">{result.dimensionLines.length}</span> dimension lines.</p>
        <p className="text-xs text-slate-400">The new dimensions have been applied to your drawing.</p>
    </div>
);

export const DetailingTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <GenericApiTool
            {...props}
            toolName="Auto-Dimensioning"
            description="Generate a comprehensive set of dimension lines for your floor plan automatically. This is useful for creating professional blueprints."
            creditCost={10}
            icon="📏"
            apiFn={generateBlueprintDetailsApi}
            buildPayload={(p) => {
                const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
                return [projectData];
            }}
            onSuccess={(result, p) => {
                const typedResult = result as { dimensionLines: DimensionLine[] };
                p.pushToUndoStack();
                p.setSingleLevelProp('dimensionLines', prev => [...(prev || []), ...typedResult.dimensionLines]);
            }}
            buttonText="Generate Dimensions"
            renderResult={renderBlueprintResult}
        />
    );
};