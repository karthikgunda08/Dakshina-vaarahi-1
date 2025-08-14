// src/features/tools/IndraNetTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, IndraNetReport, IndraNetVisual, ProjectData } from '../../types/index';
import { runIndraNetEngineApi, generateImageApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ReportSection: React.FC<{ title: string; children: React.ReactNode; }> = ({ title, children }) => (
    <div className="mt-4">
        <h4 className="font-bold text-lg text-sky-300 mb-2">{title}</h4>
        <div className="space-y-3 pl-2 border-l-2 border-slate-700">{children}</div>
    </div>
);

export const IndraNetTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, setBuyCreditsModalOpen, refreshCurrentUser, levels, planNorthDirection, propertyLines, terrainMesh, currentProject } = props;
    const [report, setReport] = useState<IndraNetReport | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [generatingImageIndex, setGeneratingImageIndex] = useState<number | null>(null);
    const { addNotification } = useNotificationStore();

    const projectData: ProjectData = { name: currentProject?.name || 'Untitled Project', projectType: currentProject?.projectType || 'building', levels, planNorthDirection, propertyLines, terrainMesh, zones: [], infrastructure: [] };

    const handleGenerateKit = async () => {
        if (!currentUser) {
            addNotification("Please log in.", "error");
            return;
        }
        if (currentUser.role !== 'owner' && currentUser.credits < 60) {
            addNotification(`You need 60 credits for this feature.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        setIsLoading(true);
        setReport(null);
        try {
            const response = await runIndraNetEngineApi(currentProject?.id || '', projectData);
            setReport(response);
            addNotification("Indra-Net has generated your media kit!", "success");
            await refreshCurrentUser();
        } catch (error: any) {
            addNotification(`Generation failed: ${error.message}`, "error");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateVisual = async (visual: IndraNetVisual, index: number) => {
        if (!currentUser) { addNotification("Please log in.", "error"); return; }
        if (currentUser.role !== 'owner' && currentUser.credits < 5) {
            addNotification(`You need 5 credits per image.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        setGeneratingImageIndex(index);
        try {
            const { imageUrl } = await generateImageApi(currentProject?.id || '', visual.prompt, { aspectRatio: '16:9' });
            setReport(prev => {
                if (!prev) return null;
                const newVisuals = [...prev.visuals];
                newVisuals[index] = { ...newVisuals[index], generatedImageUrl: imageUrl };
                return { ...prev, visuals: newVisuals };
            });
            await refreshCurrentUser();
        } catch (error: any) {
            addNotification(`Image generation failed: ${error.message}`, "error");
        } finally {
            setGeneratingImageIndex(null);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Indra-Net Media Kit Engine</h3>
            <p className="text-sm text-slate-300 my-3">Generate a complete marketing and media kit for your project, including brand identity, visuals, and copy.</p>
            
            <button
                onClick={handleGenerateKit}
                disabled={isLoading}
                className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-sky-500 to-cyan-600 hover:from-sky-600 hover:to-cyan-700"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">⚡</span>}
                <span className="flex-grow">{isLoading ? 'Generating Kit...' : 'Generate Media Kit'}</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">60 credits</span>
            </button>

            {report && (
                <div className="mt-4 bg-slate-700/50 rounded-lg p-3">
                    <ReportSection title="Brand Identity">
                        <p><strong>Logo Concept:</strong> {report.brandIdentity.logoConcept}</p>
                        <p><strong>Tagline:</strong> "{report.brandIdentity.tagline}"</p>
                    </ReportSection>
                    <ReportSection title="Visuals">
                        {report.visuals.map((visual, index) => (
                            <div key={index} className="p-2 bg-slate-900/50 rounded-md">
                                <p className="text-xs text-slate-400">"{visual.prompt}"</p>
                                {visual.generatedImageUrl ? (
                                    <img src={visual.generatedImageUrl} alt={visual.title} className="w-full h-auto rounded-md mt-2" />
                                ) : (
                                    <button onClick={() => handleGenerateVisual(visual, index)} disabled={generatingImageIndex === index} className="w-full text-xs p-2 mt-2 bg-sky-600 hover:bg-sky-500 rounded-md">
                                        {generatingImageIndex === index ? <LoadingSpinner size="h-4 w-4" /> : `Generate Visual (5 Cr)`}
                                    </button>
                                )}
                            </div>
                        ))}
                    </ReportSection>
                </div>
            )}
        </div>
    );
};