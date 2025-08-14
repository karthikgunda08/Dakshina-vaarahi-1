// src/features/tools/OptimizerTool.tsx
import React from 'react';
import { PhoenixEnginePanelProps, CostSustainabilityReport, BillOfQuantitiesReport, SustainabilityReport } from '../../types/index';
import { runCostSustainabilityOptimizerApi } from '../../services/geminiService';
import { GenericApiTool } from './misc/GenericApiTool';

const renderOptimizerResult = (report: CostSustainabilityReport) => (
    <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-4">
        <div>
            <h4 className="font-semibold text-slate-200">Executive Summary</h4>
            <p className="text-sm text-slate-300 italic">{report.overallSummary}</p>
        </div>
        <div className="space-y-3">
             <h4 className="font-semibold text-slate-200">Suggestions:</h4>
            {report.suggestions.map((item, i) => (
               <div key={i} className="p-3 bg-slate-900/50 rounded-md border-l-4 border-amber-400">
                    <p className="font-semibold text-slate-200">Replace <span className="text-amber-300">{item.originalItem}</span> with <span className="text-sky-300">{item.suggestedAlternative}</span></p>
                    <p className="text-sm mt-1"><strong>Cost Impact:</strong> <span className="text-emerald-300">{item.costImpact}</span></p>
                    <p className="text-sm"><strong>Sustainability Impact:</strong> <span className="text-green-300">{item.sustainabilityImpact}</span></p>
                    <p className="text-xs text-slate-400 mt-2">{item.reason}</p>
               </div>
            ))}
        </div>
    </div>
);

export const OptimizerTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { billOfQuantities, sustainabilityReport, setActiveTool } = props;

    if (!billOfQuantities || !sustainabilityReport) {
        return (
            <div className="text-center p-4">
                <p className="text-sm text-slate-300 mb-4">The Optimizer requires a Bill of Quantities and a Sustainability Report to function. Please generate them first.</p>
                <div className="space-y-2">
                    {!billOfQuantities && <button onClick={() => setActiveTool('boq')} className="w-full p-2 bg-sky-600 hover:bg-sky-500 rounded-md text-sm">Go to BoQ Tool</button>}
                    {!sustainabilityReport && <button onClick={() => setActiveTool('sustainability')} className="w-full p-2 bg-emerald-600 hover:bg-emerald-500 rounded-md text-sm">Go to Sustainability Tool</button>}
                </div>
            </div>
        )
    }

    return (
        <GenericApiTool
            {...props}
            toolName="Cost & Sustainability Optimizer"
            description="Analyze your generated reports to find opportunities for cost savings and improved environmental impact."
            creditCost={15}
            icon="💡"
            apiFn={runCostSustainabilityOptimizerApi}
            buildPayload={(p): [BillOfQuantitiesReport, SustainabilityReport] | null => {
                if (!p.billOfQuantities || !p.sustainabilityReport) {
                    p.addNotification("BoQ and Sustainability reports are required.", "error");
                    return null;
                }
                return [p.billOfQuantities, p.sustainabilityReport];
            }}
            onSuccess={(result) => { /* Handled locally */ }}
            buttonText="Run Optimizer"
            renderResult={renderOptimizerResult}
        />
    );
};