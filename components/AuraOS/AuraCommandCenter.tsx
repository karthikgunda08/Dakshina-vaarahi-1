
// src/components/AuraOS/AuraCommandCenter.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { useNotificationStore } from '../../state/notificationStore';
import * as adminService from '../../services/adminService';
import * as foundationService from '../../services/foundationService';
import { KpiData, ProjectSummary, User, Feedback, KpiChartData, Submission, AdjudicationReport } from '../../types/index';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { KpiCard } from '../auraCommand/KpiCard';
import { BusinessAnalystTool } from '../auraCommand/BusinessAnalystTool';
import { SupportInsightsTool } from '../auraCommand/SupportInsightsTool';
import { SocialMediaTool } from '../auraCommand/SocialMediaTool';
import { UserManagementTable } from '../auraCommand/UserManagementTable';
import { ProjectManagementTable } from '../auraCommand/ProjectManagementTable';
import { FeedbackManagementTable } from '../auraCommand/FeedbackManagementTable';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../state/appStore';

const KpiChart = React.lazy(() => import('../auraCommand/KpiChart'));
const MotionDiv = motion.div as any;

// --- START: ADJUDICATION PANEL COMPONENT ---
const ReportView: React.FC<{ report: AdjudicationReport }> = ({ report }) => {
    const chartData = report.detailedCritique.map(c => ({
        subject: c.category.split(' & ')[0], // Shorten for label
        score: c.score,
        fullMark: 100,
    }));

    return (
        <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
            <div className="flex flex-col md:flex-row gap-6 items-center">
                <div className="w-full md:w-1/3 text-center">
                    <p className="text-sm text-slate-400">Overall Score</p>
                    <p className="text-7xl font-bold text-amber-300">{report.overallScore}</p>
                    <p className="text-xs text-slate-300 mt-2">{report.overallSummary}</p>
                </div>
                <div className="w-full md:w-2/3 h-64">
                    <ResponsiveContainer>
                        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                            <PolarGrid stroke="#475569" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} />
                            <Radar name="Score" dataKey="score" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                            <Tooltip contentStyle={{ backgroundColor: 'rgba(30, 41, 59, 0.9)', borderColor: 'rgba(255, 255, 255, 0.2)'}} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            <div className="mt-6 border-t border-slate-700 pt-4 space-y-4">
                <h4 className="text-lg font-semibold">Detailed Critique</h4>
                {report.detailedCritique.map(c => (
                     <div key={c.category}>
                        <h5 className="font-semibold text-sky-300">{c.category} - <span className="text-amber-300">{c.score}/100</span></h5>
                        <p className="text-sm text-slate-300 pl-2 border-l-2 border-slate-600 ml-1 mt-1">{c.critique}</p>
                     </div>
                ))}
            </div>
        </div>
    );
};

const AdjudicationPanel: React.FC = () => {
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [adjudicatingId, setAdjudicatingId] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        foundationService.getSubmissionsForOwner()
            .then(setSubmissions)
            .catch(err => addNotification(err.message, 'error'))
            .finally(() => setIsLoading(false));
    }, [addNotification]);
    
    const handleAdjudicate = async (submissionId: string) => {
        setAdjudicatingId(submissionId);
        try {
            const updatedSubmission = await foundationService.adjudicateSubmissionApi(submissionId);
            setSubmissions(prev => prev.map(s => s._id === submissionId ? updatedSubmission : s));
            addNotification("Adjudication complete!", "success");
        } catch (error: any) {
             addNotification(`Adjudication failed: ${error.message}`, 'error');
        } finally {
            setAdjudicatingId(null);
        }
    };

    if (isLoading) return <div className="p-8 text-center"><LoadingSpinner /></div>;

    return (
        <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <h2 className="text-xl font-semibold text-slate-100 mb-4">The Vaarahi Prize Submissions</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-700/50 text-xs text-slate-400 uppercase">
                        <tr>
                            <th className="px-4 py-3">Project Name</th>
                            <th className="px-4 py-3">Applicant</th>
                            <th className="px-4 py-3">Status</th>
                            <th className="px-4 py-3">Score</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {submissions.length > 0 ? (
                            submissions.map(sub => (
                                <React.Fragment key={sub._id}>
                                <tr className="border-b border-slate-700 hover:bg-slate-700/30">
                                    <td className="px-4 py-3 font-medium">{sub.projectId?.name || 'N/A'}</td>
                                    <td className="px-4 py-3">{sub.userId?.email || 'N/A'}</td>
                                    <td className="px-4 py-3 capitalize">{sub.status.replace('_', ' ')}</td>
                                    <td className="px-4 py-3 font-mono text-amber-300">{sub.adjudicationReport?.overallScore || 'N/A'}</td>
                                    <td className="px-4 py-3 text-center">
                                         {sub.status === 'submitted' && (
                                            <button 
                                                onClick={() => handleAdjudicate(sub._id)} 
                                                disabled={adjudicatingId === sub._id}
                                                className="px-3 py-1 text-xs bg-amber-600 hover:bg-amber-500 rounded-md disabled:opacity-50 flex items-center"
                                            >
                                                {adjudicatingId === sub._id ? <LoadingSpinner size="h-3 w-3 mr-1" /> : '✨'}
                                                Adjudicate
                                            </button>
                                         )}
                                          {sub.status === 'adjudicated' && (
                                            <button onClick={() => setExpandedRow(expandedRow === sub._id ? null : sub._id)} className="px-3 py-1 text-xs bg-sky-600 hover:bg-sky-500 rounded-md">
                                                {expandedRow === sub._id ? 'Hide Report' : 'View Report'}
                                            </button>
                                         )}
                                          {sub.status === 'under_review' && <LoadingSpinner size="h-4 w-4"/>}
                                    </td>
                                </tr>
                                {expandedRow === sub._id && sub.adjudicationReport && (
                                    <tr>
                                        <td colSpan={5} className="p-0">
                                             <MotionDiv
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: 'auto', opacity: 1 }}
                                                transition={{ duration: 0.3 }}
                                                className="overflow-hidden"
                                            >
                                                <ReportView report={sub.adjudicationReport} />
                                            </MotionDiv>
                                        </td>
                                    </tr>
                                )}
                                </React.Fragment>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={5} className="text-center p-4 text-slate-400">
                                    No submissions yet for this cycle.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
// --- END: ADJUDICATION PANEL COMPONENT ---

// --- START: BRAHMAN PROTOCOL PANEL ---
const BrahmanProtocolPanel: React.FC = () => {
    const { strategicInsights, fetchStrategicInsights } = useAppStore(state => ({
        strategicInsights: state.strategicInsights,
        fetchStrategicInsights: state.fetchStrategicInsights
    }));
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!strategicInsights) {
            setIsLoading(true);
            fetchStrategicInsights().finally(() => setIsLoading(false));
        }
    }, [strategicInsights, fetchStrategicInsights]);

    if (isLoading) {
        return <div className="p-8 text-center"><LoadingSpinner /></div>;
    }
    
    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 space-y-6">
            <h2 className="text-xl font-semibold text-slate-100">Akasha Engine: Strategic Intelligence</h2>
            <p className="text-sm text-slate-400 -mt-4">The platform's meta-cognition layer. The Akasha Engine analyzes platform-wide data to discover trends and generate actionable intelligence, continuously refining its own design and business logic.</p>
            {strategicInsights?.map(insight => (
                <div key={insight.id} className="p-4 bg-slate-900/50 rounded-lg border-l-4 border-purple-400">
                    <h3 className="font-bold text-purple-300">{insight.finding}</h3>
                    <p className="text-sm text-slate-300 mt-2"><strong>Observation:</strong> {insight.observation}</p>
                    <p className="text-sm text-slate-400 mt-1"><strong>Hypothesis:</strong> <em>{insight.hypothesis}</em></p>
                    <p className="text-sm text-emerald-300 mt-2"><strong>System Action:</strong> {insight.actionable_intelligence}</p>
                </div>
            ))}
        </div>
    );
};
// --- END: BRAHMAN PROTOCOL PANEL ---


type CommandCenterTab = 'dashboard' | 'users' | 'projects' | 'feedback' | 'ai_tools' | 'prize' | 'brahman'; 

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            isActive
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-white'
        }`}
    >
        {children}
    </button>
);

export const AuraCommandCenter: React.FC = () => {
    const [kpiData, setKpiData] = useState<KpiData | null>(null);
    const [kpiChartData, setKpiChartData] = useState<KpiChartData[]>([]);
    const [projects, setProjects] = useState<ProjectSummary[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<CommandCenterTab>('dashboard');
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const fetchData = async () => {
            try {
                const [kpis, projs, allUsers, allFeedback, chartData] = await Promise.all([
                    adminService.getKpiData(),
                    adminService.getAllProjectsForOwner(),
                    adminService.getAllUsersForOwner(),
                    adminService.getAllFeedback(),
                    adminService.getKpiChartData(),
                ]);
                if (isMounted) {
                    setKpiData(kpis);
                    setProjects(projs);
                    setUsers(allUsers);
                    setFeedback(allFeedback);
                    setKpiChartData(chartData);
                }
            } catch (error: any) {
                if (isMounted) addNotification(`Failed to load command center data: ${error.message}`, 'error');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchData();

        const intervalId = setInterval(() => {
            adminService.getKpiData().then(kpis => {
                if (isMounted) setKpiData(kpis);
            }).catch(err => console.error("KPI auto-refresh failed", err));
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(intervalId);
        };
    }, [addNotification]);
    
    if (isLoading) {
        return <div className="flex-grow flex items-center justify-center animated-gradient-bg-studio"><LoadingSpinner /></div>;
    }

    if (!kpiData) {
        return <div className="flex-grow flex items-center justify-center animated-gradient-bg-studio"><p className="text-red-400">Could not load dashboard data.</p></div>;
    }
    
    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return (
                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <KpiCard title="Total Revenue" value={`₹${kpiData.totalRevenue.toLocaleString('en-IN')}`} icon="💰" />
                            <KpiCard title="Total Users" value={kpiData.totalUsers.toLocaleString()} icon="👥" />
                            <KpiCard title="Total Projects" value={kpiData.totalProjects.toLocaleString()} icon="🏗️" />
                            <KpiCard title="Architect Packs Sold" value={kpiData.creditsSold['pack_architect'] || 0} icon="💎" />
                        </div>
                        <Suspense fallback={<LoadingSpinner />}>
                            <KpiChart data={kpiChartData} />
                        </Suspense>
                    </div>
                );
            case 'users':
                return <UserManagementTable users={users} />;
            case 'projects':
                return <ProjectManagementTable projects={projects} />;
            case 'feedback':
                return <FeedbackManagementTable feedback={feedback} />;
            case 'ai_tools':
                return (
                    <div className="space-y-6">
                        <BusinessAnalystTool kpiData={kpiData} />
                        <SupportInsightsTool projects={projects} />
                        <SocialMediaTool projects={projects} />
                    </div>
                );
            case 'prize':
                return <AdjudicationPanel />;
            case 'brahman':
                return <BrahmanProtocolPanel />;
            default:
                return null;
        }
    };

    return (
        <div className="flex-grow p-4 md:p-8 overflow-y-auto animated-gradient-bg-studio">
            <div className="max-w-7xl mx-auto">
                 <header className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white">Aura Command Center</h1>
                    <p className="text-lg text-slate-300">Your central hub for platform management and analytics.</p>
                </header>

                <div className="border-b border-slate-700 mb-6">
                    <nav className="flex flex-wrap -mb-px">
                        <TabButton isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')}>Dashboard</TabButton>
                        <TabButton isActive={activeTab === 'users'} onClick={() => setActiveTab('users')}>Users</TabButton>
                        <TabButton isActive={activeTab === 'projects'} onClick={() => setActiveTab('projects')}>Projects</TabButton>
                        <TabButton isActive={activeTab === 'feedback'} onClick={() => setActiveTab('feedback')}>Feedback</TabButton>
                        <TabButton isActive={activeTab === 'ai_tools'} onClick={() => setActiveTab('ai_tools')}>AI Tools</TabButton>
                        <TabButton isActive={activeTab === 'prize'} onClick={() => setActiveTab('prize')}>Vaarahi Prize</TabButton>
                        <TabButton isActive={activeTab === 'brahman'} onClick={() => setActiveTab('brahman')}>Brahman Protocol</TabButton>
                    </nav>
                </div>
                
                <AnimatePresence mode="wait">
                    <MotionDiv
                        key={activeTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </MotionDiv>
                </AnimatePresence>
            </div>
        </div>
    );
};