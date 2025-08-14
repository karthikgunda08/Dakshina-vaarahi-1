// src/components/analysis/SanjeevaniReportDisplay.tsx
import React from 'react';
import { SanjeevaniReport } from '../../types/index';
import { useAppStore } from '../../state/appStore';

interface SanjeevaniReportDisplayProps {
  report: SanjeevaniReport;
}

export const SanjeevaniReportDisplay: React.FC<SanjeevaniReportDisplayProps> = ({ report }) => {
    const { setParamAstraReport, setActiveTool } = useAppStore(state => ({
        setParamAstraReport: state.setParamAstraReport,
        setActiveTool: state.setActiveTool,
    }));

    const handleInvokeOptimizer = (solutionPrompt: string) => {
        try {
            // The prompt is a stringified JSON of objectives for Param-Astra.
            const objectives = JSON.parse(solutionPrompt);
            console.log("Invoking Param-Astra with objectives:", objectives);

            // Simulate a response for visualization
            const mockResponse = {
                solutions: [
                    { id: 'sol_A1', scores: { cost: 90, vastu: 65 }, thumbnailUrl: '/images/param-astra/thumb_simple_rect.png' },
                    { id: 'sol_B2', scores: { cost: 75, vastu: 85 }, thumbnailUrl: '/images/param-astra/thumb_complex_asym.png' },
                    { id: 'sol_C3', scores: { cost: 82, vastu: 80 }, thumbnailUrl: '/images/param-astra/thumb_l-shape.png' },
                ]
            };
            setParamAstraReport(mockResponse); 
            setActiveTool('optimizer');
        } catch (error) {
            console.error("Failed to parse solution prompt for Param-Astra:", error);
            alert("Could not start optimizer due to an invalid solution prompt.");
        }
    };

    return (
        <div className="mt-4 p-3 bg-slate-700/50 rounded-lg space-y-4">
            <div>
                <h4 className="font-semibold text-slate-200">Executive Summary</h4>
                <p className="text-sm text-slate-300 italic">{report.summary}</p>
            </div>

            {report.conflicts && report.conflicts.length > 0 && (
                <div>
                    <h4 className="font-semibold text-red-400 mb-2">Identified Conflicts</h4>
                    <div className="space-y-3">
                        {report.conflicts.map((item, index) => (
                            <div key={index} className="p-3 bg-slate-900/50 rounded-md border-l-4 border-red-500">
                                <p className="text-sm text-slate-200">{item.description}</p>
                                {item.solutionPrompt && (
                                    <button
                                        onClick={() => handleInvokeOptimizer(item.solutionPrompt!)}
                                        className="mt-2 px-3 py-1 text-xs font-semibold text-white rounded-md bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600"
                                    >
                                        ✨ Invoke Param-Astra to Solve
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {report.synergies && report.synergies.length > 0 && (
                 <div>
                    <h4 className="font-semibold text-green-400 mb-2">Potential Synergies</h4>
                    <div className="space-y-3">
                         {report.synergies.map((item, index) => (
                            <div key={index} className="p-3 bg-slate-900/50 rounded-md border-l-4 border-green-500">
                                <p className="text-sm text-slate-200">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
