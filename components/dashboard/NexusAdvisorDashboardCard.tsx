// src/components/dashboard/NexusAdvisorDashboardCard.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { ProjectSummary, NexusReport, SvaDharmaResponse } from '../../types/index';
import { useAppStore } from '../../state/appStore';
import * as geminiService from '../../services/geminiService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { motion } from 'framer-motion';
import { Button } from '../ui/Button';

interface NexusAdvisorDashboardCardProps {
    projects: ProjectSummary[];
}

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
            // Default action: open phoenix engine and the Nexus Advisor tool
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
                    <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2"><span>📈</span> Growth Opportunities</h4>
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
                    <h4 className="font-semibold text-orange-400 mb-2 flex items-center gap-2"><span>⚠️</span> Potential Risks</h4>
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


export const NexusAdvisorDashboardCard: React.FC<NexusAdvisorDashboardCardProps> = ({ projects }) => {
    const { nexusReport, setNexusReport } = useAppStore(state => ({
        nexusReport: state.nexusReport,
        setNexusReport: state.setNexusReport,
    }));
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { addNotification } = useAppStore();

    const fetchReport = useCallback(async () => {
        if (!projects || projects.length === 0) return;
        setIsLoading(true);
        setError(null);
        try {
            const report = await geminiService.runNexusAdvisorApi(projects[0]?.id || 'no-project', projects);
            setNexusReport(report);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch strategic advice.');
            addNotification(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [projects, setNexusReport, addNotification]);

    useEffect(() => {
        // Fetch report only if it's not already loaded and there are projects
        if (!nexusReport && projects.length > 0) {
            fetchReport();
        }
    }, [nexusReport, projects, fetchReport]);

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    <span className="text-2xl">💎</span> Nexus Strategic Advisor
                </h3>
                <Button onClick={fetchReport} size="sm" variant="ghost" disabled={isLoading}>
                    {isLoading ? <LoadingSpinner size="h-4 w-4" /> : 'Refresh'}
                </Button>
            </div>
            <div className="flex-grow">
                {isLoading && <div className="flex items-center justify-center h-full"><LoadingSpinner /><p className="ml-2">Analyzing portfolio...</p></div>}
                {error && <p className="text-red-400">{error}</p>}
                {!isLoading && !error && nexusReport && <ReportDisplay report={nexusReport} />}
                {!isLoading && !error && !nexusReport && (
                    <div className="text-center flex flex-col items-center justify-center h-full">
                        <p className="text-slate-400">Your personalized AI strategic report will appear here.</p>
                        <Button onClick={fetchReport} disabled={projects.length === 0} className="mt-4">
                            {projects.length > 0 ? 'Generate First Report' : 'Create a project to get started'}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
