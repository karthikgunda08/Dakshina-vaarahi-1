// src/features/tools/PhoenixEyeTool.tsx
import React, { useState } from 'react';
import type { PhoenixEnginePanelProps, JuggernautPrediction, ProjectData } from '../../types/index';
import { useAppStore } from '../../state/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { proposeJuggernautFixApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { CreditCostDisplay } from '../../components/common/CreditCostDisplay';

const MotionDiv = motion.div as any;

const DiscrepancyCard: React.FC<{
    prediction: JuggernautPrediction;
    onProposeFix: (prediction: JuggernautPrediction) => void;
    isFixing: boolean;
    isPreviewActive: boolean;
    onAcceptFix: () => void;
    onRejectFix: () => void;
}> = ({ prediction, onProposeFix, isFixing, isPreviewActive, onAcceptFix, onRejectFix }) => {
    const statusColors = {
        on_schedule: 'border-green-500',
        at_risk: 'border-yellow-500',
        delayed: 'border-red-500',
        misaligned: 'border-orange-500',
        new: 'border-sky-500',
    };
    return (
        <MotionDiv
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-3 bg-slate-900/50 rounded-lg border-l-4 ${statusColors[prediction.status]}`}
        >
            <p className="font-semibold text-slate-200 capitalize">{prediction.elementType} <span className="text-xs">({prediction.elementId})</span> - <span className="uppercase">{prediction.status.replace('_', ' ')}</span></p>
            <p className="text-sm text-slate-300 mt-1">{prediction.details}</p>
            {prediction.suggestedAction && (
                <p className="text-sm text-sky-300 mt-2">
                    <strong>Suggested Action:</strong> {prediction.suggestedAction}
                </p>
            )}
            {isPreviewActive ? (
                <div className="mt-2 p-2 bg-purple-900/50 border border-purple-600 rounded-lg text-center">
                    <p className="text-sm text-purple-200 mb-2">💡 AI has proposed a fix. Preview it on the 2D canvas.</p>
                    <div className="flex gap-2">
                        <button onClick={onAcceptFix} className="flex-1 p-1 text-xs bg-emerald-600 hover:bg-emerald-500 rounded-md">Accept Fix</button>
                        <button onClick={onRejectFix} className="flex-1 p-1 text-xs bg-slate-600 hover:bg-slate-500 rounded-md">Reject</button>
                    </div>
                </div>
            ) : (
                prediction.status === 'misaligned' && (
                     <div className="mt-2">
                        <button 
                            onClick={() => onProposeFix(prediction)} 
                            disabled={isFixing}
                            className="w-full text-xs p-1 rounded-md bg-sky-600 hover:bg-sky-500 text-white font-semibold flex items-center justify-center disabled:bg-sky-800"
                        >
                            {isFixing ? <LoadingSpinner size="h-4 w-4 mr-2" /> : '💡'} 
                            <span className="flex-grow">Propose AI Fix</span>
                            <CreditCostDisplay cost={5} />
                        </button>
                    </div>
                )
            )}
        </MotionDiv>
    );
};


export const PhoenixEyeTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { 
        isJuggernautModeActive, juggernautPredictions, runSiteAdjudicator, globalLoadingMessage,
        currentProject, levels, planNorthDirection, propertyLines, terrainMesh,
        aiFixPreview, setAiFixPreview, applySamaranganFix,
        currentUser, setBuyCreditsModalOpen, refreshCurrentUser,
        isSimulatingLiveData, setIsSimulatingLiveData
    } = useAppStore();

    const [fixingDiscrepancyId, setFixingDiscrepancyId] = useState<string | null>(null);
    const { addNotification } = useNotificationStore();

    const handleProposeFix = async (prediction: JuggernautPrediction) => {
        if (!currentUser) { addNotification("Please log in.", "error"); return; }
        if (currentUser.role !== 'owner' && currentUser.credits < 5) {
            addNotification(`You need 5 credits to propose a fix.`, 'info'); 
            setBuyCreditsModalOpen(true); 
            return;
        }
        setFixingDiscrepancyId(prediction.elementId);
        try {
            const projectData: ProjectData = { 
                name: props.currentProject?.name || '', 
                projectType: props.currentProject?.projectType || 'building', 
                levels, 
                planNorthDirection, 
                propertyLines, 
                terrainMesh, 
                zones: [], 
                infrastructure: [] 
            };
            const fixResponse = await proposeJuggernautFixApi(currentProject?.id || '', prediction, projectData);
            setAiFixPreview({ commentId: prediction.elementId, fix: fixResponse.fix });
            addNotification("AI has proposed a fix! Preview it on the canvas.", "success");
            await refreshCurrentUser();
        } catch (err: any) {
            addNotification(`AI Fix failed: ${err.message}`, 'error');
        } finally {
            setFixingDiscrepancyId(null);
        }
    };

    const handleAcceptFix = () => {
        if (!aiFixPreview) return;
        applySamaranganFix(aiFixPreview.fix);
    };

    const handleRejectFix = () => {
        setAiFixPreview(null);
    };
    
    const isAdjudicatorRunning = globalLoadingMessage?.includes('Adjudicator');
    const highSeverity = juggernautPredictions?.filter(p => p.status === 'delayed' || p.status === 'misaligned') || [];
    const atRisk = juggernautPredictions?.filter(p => p.status === 'at_risk') || [];
    const onScheduleCount = juggernautPredictions?.filter(p => p.status === 'on_schedule').length || 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                 <h3 className="text-lg font-bold text-sky-300">Site Adjudicator AI</h3>
                 <div className="flex items-center gap-2 text-xs font-semibold">
                    <span className={`relative flex h-3 w-3`}>
                        {isJuggernautModeActive && <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isJuggernautModeActive ? 'bg-red-400' : 'bg-slate-500'} opacity-75`}></span>}
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${isJuggernautModeActive ? 'bg-red-500' : 'bg-slate-600'}`}></span>
                    </span>
                    {isJuggernautModeActive ? 'LIVE FEED ACTIVE' : 'INACTIVE'}
                 </div>
            </div>
            <p className="text-sm text-slate-300 mb-4">
                This panel displays a live feed from the Juggernaut Protocol, analyzing on-site progress against the digital plan in real-time.
            </p>

            <div className="p-3 my-4 bg-slate-700/50 rounded-lg flex items-center justify-between">
                <label htmlFor="live-data-toggle" className="text-sm font-medium text-slate-200">Simulate Live Data Feed</label>
                <input
                    type="checkbox"
                    id="live-data-toggle"
                    checked={isSimulatingLiveData}
                    onChange={(e) => setIsSimulatingLiveData(e.target.checked)}
                    className="h-4 w-4 rounded text-primary bg-slate-600 border-slate-500 focus:ring-primary"
                />
            </div>

            {!isJuggernautModeActive ? (
                <div className="text-center p-8 bg-slate-700/50 rounded-lg">
                    <p className="text-slate-400">Activate the Juggernaut Protocol from the bottom dock to begin live site monitoring.</p>
                </div>
            ) : (
                <div className="space-y-6">
                     {!juggernautPredictions && (
                        <div className="text-center p-4">
                            <p className="text-slate-400 mb-2">Live feed is active. Run initial site scan to populate data.</p>
                            <button
                                onClick={runSiteAdjudicator}
                                disabled={isAdjudicatorRunning}
                                className="px-4 py-2 text-sm font-semibold text-white rounded-md transition-all bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-700 hover:to-orange-600 disabled:opacity-50 flex items-center justify-center"
                            >
                                {isAdjudicatorRunning ? <LoadingSpinner size="h-5 w-5" /> : 'Run Manual Adjudication Scan (20 Cr)'}
                            </button>
                        </div>
                    )}
                    <AnimatePresence>
                        {juggernautPredictions && (
                            <MotionDiv initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-red-400 mb-2">High-Severity Discrepancies ({highSeverity.length})</h4>
                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {highSeverity.length > 0 ? highSeverity.map(p => 
                                                <DiscrepancyCard 
                                                    key={p.elementId} 
                                                    prediction={p}
                                                    onProposeFix={handleProposeFix}
                                                    isFixing={fixingDiscrepancyId === p.elementId}
                                                    isPreviewActive={aiFixPreview?.commentId === p.elementId}
                                                    onAcceptFix={handleAcceptFix}
                                                    onRejectFix={handleRejectFix}
                                                />
                                            ) : <p className="text-xs text-slate-500">None detected.</p>}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-yellow-400 mb-2">Elements at Risk ({atRisk.length})</h4>
                                    <div className="space-y-2">
                                        <AnimatePresence>
                                            {atRisk.length > 0 ? atRisk.map(p => 
                                                <DiscrepancyCard 
                                                    key={p.elementId} 
                                                    prediction={p}
                                                    onProposeFix={handleProposeFix}
                                                    isFixing={fixingDiscrepancyId === p.elementId}
                                                    isPreviewActive={aiFixPreview?.commentId === p.elementId}
                                                    onAcceptFix={handleAcceptFix}
                                                    onRejectFix={handleRejectFix}
                                                />
                                            ) : <p className="text-xs text-slate-500">None detected.</p>}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-green-400 mb-2">On Schedule ({onScheduleCount})</h4>
                                    <p className="text-xs text-slate-500">{onScheduleCount > 0 ? `${onScheduleCount} elements are progressing as planned.` : 'Awaiting data...'}</p>
                                </div>
                            </MotionDiv>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
};