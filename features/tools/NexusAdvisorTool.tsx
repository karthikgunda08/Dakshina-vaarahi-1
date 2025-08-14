// src/features/tools/NexusAdvisorTool.tsx
import React, { useState, useCallback, useEffect } from 'react';
import { PhoenixEnginePanelProps, NexusReport, SvaDharmaResponse } from '../../types/index';
import { runNexusAdvisorApi } from '../../services/geminiService';
import { useAppStore } from '../../state/useAppStore';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

const ActionButton: React.FC<{ action: { title: string, cta: string }, onAction: (actionType: string) => void }> = ({ action, onAction }) => {
    return (
        <Button onClick={() => onAction(action.cta)} size="sm" variant="outline" className="text-xs flex-shrink-0 ml-2">
            {action.cta}
        </Button>
    );
};

const ReportDisplay: React.FC<{ report: NexusReport }> = ({ report }) => {
    const { setView, setActiveTool } = useAppStore(state => ({
        setView: state.setView,
        setActiveTool: state.setActiveTool,
    }));

    const handleAction = (cta: string) => {
        const ctaLower = cta.toLowerCase();
        if (ctaLower.includes('marketplace')) {
            setView('marketplace');
        } else if (ctaLower.includes('brahma')) {
            setView('brahmaAstra');
        } else {
            setActiveTool('nexus');
        }
    };
    
    return (
        <MotionDiv variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } }} initial="hidden" animate="visible" className="space-y-4 mt-4">
            <MotionP variants={itemVariants} className="text-sm text-slate-300 italic">"{report.strategicOverview}"</MotionP>
            
            {report.svaDharmaAnalysis && (
                 <MotionDiv variants={itemVariants} className="p-4 bg-slate-900/30 rounded-lg border border-purple-600/50">
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                         <span className="text-lg">🧬</span> Your Architectural DNA (Atman Signature)
                    </h4>
                    <p className="font-bold text-lg text-white mb-2">"{report.svaDharmaAnalysis.signature}"</p>
                    <p className="text-xs text-purple-200">{report.svaDharmaAnalysis.analysis}</p>
                </MotionDiv>
            )}
            
            {report.akashicInsights && report.akashicInsights.length > 0 && (
                 <MotionDiv variants={itemVariants} className="p-4 bg-purple-900/30 rounded-lg border border-purple-600/50">
                    <h4 className="font-semibold text-purple-300 mb-2 flex items-center gap-2">
                         <span className="text-lg">📚</span> Akasha Engine Insight
                    </h4>
                    <ul className="space-y-2 text-xs text-purple-200 list-disc list-inside">
                        {report.akashicInsights.map((insight, i) => (
                            <li key={i}>{insight}</li>
                        ))}
                    </ul>
                </MotionDiv>
            )}

            <MotionDiv variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-green-400 mb-2">Growth Opportunities</h4>
                    <ul className="space-y-3">
                        {report.growthOpportunities.map((item, i) => (
                            <li key={i} className="text-xs">
                                <strong className="text-slate-200 block">{item.title}</strong>
                                <p className="text-slate-400">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-semibold text-orange-400 mb-2">Potential Risks</h4>
                    <ul className="space-y-3">
                        {report.potentialRisks.map((item, i) => (
                            <li key={i} className="text-xs">
                                <strong className="text-slate-200 block">{item.title}</strong>
                                <p className="text-slate-400">{item.description}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </MotionDiv>
             <MotionDiv variants={itemVariants}>
                <h4 className="font-semibold text-sky-300 mb-2">Suggested Actions</h4>
                <div className="space-y-2">
                    {report.suggestedActions.map((item, i) => (
                        <div key={i} className="bg-slate-900/50 p-3 rounded-lg flex justify-between items-center">
                            <div className="text-sm">
                                <strong className="text-slate-200 block">{item.title}</strong>
                                <p className="text-slate-400 text-xs">{item.description}</p>
                            </div>
                            <ActionButton action={item} onAction={handleAction} />
                        </div>
                    ))}
                </div>
            </MotionDiv>
        </MotionDiv>
    );
};


export const NexusAdvisorTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { 
        projects, 
        nexusReport, 
        setNexusReport,
        currentUser,
        setBuyCreditsModalOpen,
        refreshCurrentUser,
        addNotification
    } = useAppStore(state => ({
        projects: state.projects,
        nexusReport: state.nexusReport,
        setNexusReport: state.setNexusReport,
        currentUser: state.currentUser,
        setBuyCreditsModalOpen: state.setBuyCreditsModalOpen,
        refreshCurrentUser: state.refreshCurrentUser,
        addNotification: state.addNotification,
    }));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = useCallback(async () => {
        if (!projects || projects.length === 0) {
            addNotification("Create at least one project to get advice.", "error");
            return;
        };
        
        const creditCost = 10;
        if (currentUser && currentUser.role !== 'owner' && currentUser.credits < creditCost) {
            addNotification(`You need ${creditCost} credits for the Nexus Advisor. You have ${currentUser.credits}.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const report = await runNexusAdvisorApi(projects[0]?.id || 'no-project', projects);
            setNexusReport(report);
            addNotification("Nexus Advisor report generated!", "success");
            if (currentUser && currentUser.role !== 'owner') {
                await refreshCurrentUser();
            }
        } catch (err: any) {
            const message = err.message || 'Failed to fetch strategic advice.';
            setError(message);
            addNotification(message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [projects, currentUser, setBuyCreditsModalOpen, refreshCurrentUser, setNexusReport, addNotification]);

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Nexus Strategic Advisor</h3>
            <p className="text-sm text-slate-300 my-3">Receive hyper-personalized strategic advice based on your entire project portfolio. The Nexus Advisor will identify opportunities, risks, and actionable next steps to help you grow.</p>
            <Button onClick={handleGenerate} className="w-full flex items-center justify-center" disabled={isLoading}>
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">💎</span>}
                <span className="flex-grow">{nexusReport ? 'Refresh Advice' : 'Generate Advice'}</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">10 credits</span>
            </Button>
            
            <div className="mt-4">
                 {isLoading && <div className="flex items-center justify-center p-4"><LoadingSpinner /><p className="ml-2 text-sm">Analyzing portfolio...</p></div>}
                 {error && <p className="text-red-400 text-sm p-4">{error}</p>}
                 {!isLoading && !error && nexusReport && <ReportDisplay report={nexusReport} />}
                 {!isLoading && !error && !nexusReport && (
                    <div className="text-center text-slate-400 text-sm p-4 mt-4 bg-slate-900/50 rounded-lg">
                        <p>Your personalized AI strategic report will appear here once generated.</p>
                    </div>
                )}
            </div>
        </div>
    );
};