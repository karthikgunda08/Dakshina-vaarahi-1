
// src/features/MasterArchitectTool.tsx
import React, { useState, Suspense } from 'react';
import { PhoenixEnginePanelProps, MasterArchitectResponse } from '../types/index';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CreditCostDisplay } from '../components/common/CreditCostDisplay';
const DesignDialogueModal = React.lazy(() => import('../components/DesignDialogueModal'));

export const MasterArchitectTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const [isDialogueOpen, setIsDialogueOpen] = useState(false);
    const { setLevels, pushToUndoStack, addNotification, currentProject, setBillOfQuantities, setSustainabilityReport, setAdvancedStructuralReport, setVastuGridAnalysis, setLastAiToolRun } = props;

    const applyConcept = (result: MasterArchitectResponse) => {
        pushToUndoStack();
        const { projectData, structuralReport, vastuReport, boq } = result;
        setLevels(projectData.levels || []);
        
        // Also update the individual reports in the store
        if(boq) setBillOfQuantities(boq);
        if(projectData.sustainabilityReport) setSustainabilityReport(projectData.sustainabilityReport);
        if(structuralReport) setAdvancedStructuralReport(structuralReport);
        if(vastuReport) setVastuGridAnalysis(vastuReport);

        addNotification(`Applied '${result.summary.substring(0, 20)}...' concept to the editor!`, "success");
        setLastAiToolRun('MasterArchitect');
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Master Architect AI</h3>
            <p className="text-sm text-slate-300 my-3">Engage in a design dialogue with the AI to generate a complete project concept — including floor plans, structural analysis, BoQ, and Vastu reports — from a simple idea.</p>
            
            <div className="p-3 my-4 bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-l-4 border-amber-400 text-amber-200 text-sm rounded-r-lg">
              <p className="font-bold text-amber-100">💡 Enhance AI Precision</p>
              <p className="mt-1">
                  For superior results, add project details like location and client profile in the{' '}
                  <strong className="text-white">Properties panel</strong> (when no object is selected). The AI will use this context.
              </p>
          </div>

            <button
                onClick={() => setIsDialogueOpen(true)}
                className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md flex items-center justify-center transition-all bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700"
            >
                <span className="mr-2 text-lg">✨</span>
                <span className="flex-grow">Start Design Dialogue</span>
                 <CreditCostDisplay cost={100} />
            </button>
            {isDialogueOpen && (
                <Suspense fallback={<LoadingSpinner />}>
                    <DesignDialogueModal
                        {...props}
                        onClose={() => setIsDialogueOpen(false)}
                        onApplyConcept={applyConcept}
                    />
                </Suspense>
            )}
        </div>
    );
};