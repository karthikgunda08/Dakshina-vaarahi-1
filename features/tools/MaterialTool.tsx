// src/features/tools/MaterialTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, MaterialAnalysisReport } from '../../types/index';
import { analyzeMaterialApi } from '../../services/geminiService';
import { GenericApiTool } from './misc/GenericApiTool';

const renderMaterialResult = (report: MaterialAnalysisReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-3">
        <h4 className="text-lg font-bold text-amber-300">{report.materialName}</h4>
        <p className="text-sm">{report.description}</p>
        <p className="text-sm"><strong>Sustainability Score:</strong> {report.sustainabilityScore}/10</p>
        <div>
            <h5 className="font-semibold text-emerald-300">Pros:</h5>
            <ul className="list-disc list-inside text-sm">
                {report.pros.map((pro, i) => <li key={i}>{pro}</li>)}
            </ul>
        </div>
        <div>
            <h5 className="font-semibold text-red-300">Cons:</h5>
            <ul className="list-disc list-inside text-sm">
                {report.cons.map((con, i) => <li key={i}>{con}</li>)}
            </ul>
        </div>
    </div>
);

export const MaterialTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const [materialName, setMaterialName] = useState('');
    
    return (
        <GenericApiTool
            {...props}
            toolName="Material Analysis"
            description="Get a detailed report on any construction material, including its properties, pros, cons, and sustainability score."
            creditCost={1}
            icon="🧱"
            apiFn={analyzeMaterialApi}
            buildPayload={(p) => {
                if (!materialName.trim()) {
                    p.addNotification('Please enter a material name.', 'error');
                    return null;
                }
                return [materialName];
            }}
            onSuccess={(result) => { /* Handled by local state */ }}
            buttonText="Analyze Material"
            renderResult={renderMaterialResult}
        >
            <div className="flex gap-2 mb-4">
                <input 
                    type="text"
                    value={materialName}
                    onChange={(e) => setMaterialName(e.target.value)}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                    placeholder="e.g., Cross-Laminated Timber"
                />
            </div>
        </GenericApiTool>
    );
};
