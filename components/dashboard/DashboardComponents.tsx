// src/components/dashboard/DashboardComponents.tsx
import React, { useState, Suspense, useCallback } from 'react';
import { motion } from 'framer-motion';
import { User, ProjectSummary, UserAnalyticsData } from '../../types/index';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
const PublishModal = React.lazy(() => import('../marketplace/PublishModal'));
const TokenizeModal = React.lazy(() => import('./TokenizeModal').then(module => ({ default: module.TokenizeModal })));

const MotionDiv = motion.div as any;

const activityIconMap: Record<string, React.ReactNode> = {
    'Updated Project': '🔄',
    'Created Project': '✨',
    'AI Tool Used': '🤖',
    'Version Saved': '💾',
    'Collaborator Added': '👥',
};

// --- UserHeader ---
export const UserHeader: React.FC<{ currentUser: User }> = ({ currentUser }) => {
    return (
        <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-4"
        >
            <img 
                src={currentUser.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${currentUser.name || currentUser.email}`} 
                alt="User Avatar"
                className="w-16 h-16 rounded-full border-2 border-slate-600"
            />
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">Mission Control</h1>
                <p className="text-lg text-slate-300 font-body">Welcome, {currentUser.name || currentUser.email.split('@')[0]}.</p>
                <div className="flex items-center gap-4 mt-2">
                    {currentUser.role === 'owner' && (
                        <span className="px-2 py-0.5 text-xs font-bold bg-primary text-primary-foreground rounded-full">Founder Access</span>
                    )}
                </div>
            </div>
        </MotionDiv>
    );
};


// --- QuickStartCard ---
interface QuickStartCardProps {
    title: string;
    icon: React.ReactNode;
    onClick: () => void;
    isPremium?: boolean;
    className?: string;
    id?: string;
}
const QuickStartCard: React.FC<QuickStartCardProps> = ({ title, icon, onClick, isPremium = false, className = '', id }) => (
    <button
        id={id}
        onClick={onClick}
        className={`relative w-full text-center p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors border border-transparent ${isPremium ? 'hover:border-primary' : 'hover:border-accent'} ${className}`}
    >
        {isPremium && <div className="absolute top-1 right-1 text-[10px] text-primary">✦</div>}
        <div className="text-3xl mb-1">{icon}</div>
        <h3 className="font-semibold text-xs text-slate-100">{title}</h3>
    </button>
);


// --- MissionControlPanel (Replaces CreditManager, Sidebar, QuickStart) ---
export const MissionControlPanel: React.FC<{ currentUser: User; userAnalytics: UserAnalyticsData | null }> = ({ currentUser, userAnalytics }) => {
    const { setView, setBuyCreditsModalOpen, setNewProjectModalOpen } = useAppStore();

    return (
        <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-xl border border-slate-700 space-y-6">
            <div>
                 <h3 className="font-semibold text-lg text-slate-200 mb-4">Resource Allocation</h3>
                {currentUser.role === 'owner' ? (
                     <div className="bg-gradient-to-r from-primary/80 to-amber-500/80 p-4 rounded-lg text-white shadow-lg text-center border-2 border-primary premium-glow">
                        <p className="font-bold text-base">Owner Access</p>
                        <p className="text-3xl font-extrabold">👑</p>
                        <p className="text-xs opacity-80">Unlimited Credits</p>
                    </div>
                ) : (
                    <div className="bg-gradient-to-r from-accent to-purple-700 p-4 rounded-lg text-white shadow-lg">
                        <p className="font-bold text-base">AI Credits</p>
                        <p className="text-4xl font-extrabold my-1">{currentUser.credits}</p>
                        <button onClick={() => setBuyCreditsModalOpen(true)} className="w-full mt-2 bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-md font-semibold text-xs transition-colors">
                            Manage Credits
                        </button>
                    </div>
                )}
            </div>
            
             <div>
                <h3 className="font-semibold text-lg text-slate-200 mb-4">Quick Actions</h3>
                 <div className="grid grid-cols-2 gap-3">
                    <QuickStartCard id="mission-step-1-target" title="New Project" icon={'🏢'} onClick={() => setNewProjectModalOpen(true)} />
                    <QuickStartCard title="Help & Docs" icon={'🎓'} onClick={() => useAppStore.getState().setHelpModalOpen(true)} />
                    <QuickStartCard title="Brahma-Astra" icon={'✨'} onClick={() => setView('brahmaAstra')} isPremium className="premium-glow"/>
                    <QuickStartCard title="Marketplace" icon={'🛒'} onClick={() => setView('marketplace')} isPremium />
                </div>
            </div>

            {userAnalytics && (
                <div>
                    <h3 className="font-semibold text-lg text-slate-200 mb-4">Activity Log</h3>
                    <ul className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {userAnalytics.activityLog.length > 0 ? userAnalytics.activityLog.map(log => (
                             <li key={log.id} className="flex items-start gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex-shrink-0 flex items-center justify-center text-sm">{activityIconMap[log.action] || '🔄'}</div>
                                <div>
                                    <p className="text-sm text-slate-200">{log.action}: <span className="font-semibold">{log.details}</span></p>
                                    <p className="text-xs text-slate-500">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </li>
                        )) : <p className="text-center text-slate-500 text-sm py-4">No recent activity.</p>}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- ProjectList & ProjectCard ---
const ProjectCard: React.FC<{ project: ProjectSummary; }> = ({ project }) => {
    const { loadProject, refreshCurrentUser, setView, setTokenizeModalOpen, deleteProject } = useAppStore();
    const { addNotification } = useNotificationStore();

    const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
    const [isTogglingPublic, setIsTogglingPublic] = useState(false);

    const handlePublished = useCallback(() => {
        refreshCurrentUser();
    }, [refreshCurrentUser]);
    
    const handleTokenizeClick = () => {
        if (project.tokenization?.isTokenized) {
            setView('realEstateExchange');
        } else {
            setTokenizeModalOpen(true, project);
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to permanently delete "${project.name}"? This action cannot be undone.`)) {
            deleteProject(project.id);
        }
    };
    
    const handleTogglePublic = async () => {
        setIsTogglingPublic(true);
        try {
            const updatedProject = await projectService.toggleProjectPublicStatus(project.id);
             useAppStore.setState(state => ({
                projects: state.projects.map(p => p.id === updatedProject.id ? { ...p, ...updatedProject } : p)
            }));
            addNotification(`Project is now ${updatedProject.isPublic ? 'public' : 'private'}.`, 'success');
        } catch (error: any) {
            addNotification(error.message, 'error');
        } finally {
            setIsTogglingPublic(false);
        }
    }

    const isTokenized = project.tokenization?.isTokenized;

    return (
        <>
            <MotionDiv
                whileHover={{ y: -5, scale: 1.02 }}
                className={`bg-slate-800/50 backdrop-blur-md flex flex-col overflow-hidden rounded-xl border border-slate-700 transition-shadow duration-300 ${isTokenized ? 'shadow-purple-900/50 shadow-lg' : ''}`}
            >
                <div className="h-40 bg-slate-700 cursor-pointer relative group" onClick={() => loadProject(project.id)}>
                    {project.previewImageUrl ? (
                        <img src={project.previewImageUrl} alt={project.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    ) : (
                         <div className={`w-full h-full bg-gradient-to-br ${project.projectType === 'masterPlan' ? 'from-indigo-500 to-purple-600' : 'from-sky-500 to-cyan-600'} flex items-center justify-center text-5xl opacity-50`}>
                            {project.projectType === 'masterPlan' ? '🗺️' : '🏢'}
                         </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <p className="font-bold text-lg text-white">Open Studio</p>
                    </div>
                     {isTokenized && (
                        <div className="absolute top-2 right-2 text-xs font-bold px-2 py-1 bg-accent text-accent-foreground rounded-full shadow-lg">
                            Listed on Exchange
                        </div>
                    )}
                     <div className="absolute bottom-0 left-0 p-4">
                        <h3 className="font-semibold text-white truncate text-shadow-custom" title={project.name}>{project.name}</h3>
                        <p className="text-xs text-slate-300 mt-1 font-body text-shadow-custom">
                            Last updated: {new Date(project.updatedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
                
                <div className="p-3 bg-slate-800/80 border-t border-slate-700/50 flex flex-wrap gap-2 items-center">
                    <button
                        onClick={handleTogglePublic}
                        disabled={isTogglingPublic}
                        className={`flex-grow text-xs px-2 py-1 rounded-md transition-colors flex items-center justify-center gap-1 ${project.isPublic ? 'bg-green-800/50 text-green-300 hover:bg-green-700' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'}`}
                    >
                        {isTogglingPublic ? <LoadingSpinner size="h-3 w-3" /> : (project.isPublic ? '🌐 Public' : '🔒 Private')}
                    </button>
                    <button
                        onClick={() => setIsPublishModalOpen(true)}
                        className="text-xs px-2 py-1 bg-primary/20 text-primary hover:bg-primary/40 rounded-md transition-colors"
                        title="Publish to Marketplace"
                    >
                        Publish
                    </button>
                     <button
                        onClick={handleTokenizeClick}
                        className="text-xs px-2 py-1 bg-accent/20 text-accent-foreground hover:bg-accent/40 rounded-md transition-colors"
                        title={isTokenized ? "Manage on Real Estate Exchange" : "Tokenize for Real Estate Exchange"}
                    >
                        {isTokenized ? 'Manage' : 'Tokenize'}
                    </button>
                     <button
                        onClick={handleDelete}
                        className="text-xs px-2 py-1 text-red-400 hover:bg-red-500/20 rounded-md transition-colors"
                        title="Delete Project"
                    >
                        Delete
                    </button>
                </div>
            </MotionDiv>
            {isPublishModalOpen && (
                <Suspense fallback={<div />}>
                    <PublishModal
                        project={project}
                        onClose={() => setIsPublishModalOpen(false)}
                        onPublished={handlePublished}
                    />
                </Suspense>
            )}
            {useAppStore.getState().projectToTokenize?.id === project.id && (
                 <Suspense fallback={<div />}>
                    <TokenizeModal 
                        project={project}
                        onClose={() => setTokenizeModalOpen(false, null)}
                        onTokenized={handlePublished}
                    />
                 </Suspense>
            )}
        </>
    );
};

export const ProjectList: React.FC<{ projects: ProjectSummary[]; }> = ({ projects }) => {
    const { setNewProjectModalOpen } = useAppStore();
    return (
        <section>
            <h2 className="text-2xl font-bold text-slate-200 mb-4">Project Repository</h2>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {projects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                        />
                    ))}
                </div>
            ) : (
                 <div className="md:col-span-2 text-center p-8 bg-slate-800/30 rounded-lg border border-dashed border-slate-600 flex flex-col items-center">
                    <div className="text-4xl mb-4">✨</div>
                    <p className="text-slate-300 font-semibold">Your repository is ready.</p>
                    <p className="text-sm text-slate-500 mt-1 mb-4">Start your first project to see it here.</p>
                    <button onClick={() => setNewProjectModalOpen(true)} className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90">
                        Create New Project
                    </button>
                </div>
            )}
        </section>
    );
};