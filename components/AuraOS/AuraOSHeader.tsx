// src/components/AuraOS/AuraOSHeader.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { updateProjectName } from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
import { DakshinVaarahiLogo } from '../icons/DakshinVaarahiLogo';
const PresenceAvatars = React.lazy(() => import('../collaboration/PresenceAvatars'));

const SaveStatusIndicator: React.FC = () => {
    const saveStatus = useAppStore(state => state.saveStatus);

    if (saveStatus === 'idle') return null;

    const statusMap = {
        saving: { text: 'Saving...', icon: <LoadingSpinner size="h-4 w-4" /> },
        saved: { text: 'All changes saved', icon: '✓' },
        error: { text: 'Save failed', icon: '✗' },
    };

    const currentStatus = statusMap[saveStatus];

    return (
        <div className="text-xs text-slate-400 flex items-center gap-1">
            {currentStatus.icon}
            <span>{currentStatus.text}</span>
        </div>
    );
};


export const AuraOSHeader: React.FC = () => {
    const { 
        currentProject, collaborators, currentUser, setView,
        updateCurrentProject, setExportModalOpen
    } = useAppStore(state => ({
        currentProject: state.currentProject,
        collaborators: state.collaborators,
        currentUser: state.currentUser,
        setView: state.setView,
        updateCurrentProject: state.updateCurrentProject,
        setExportModalOpen: state.setExportModalOpen,
    }));
    
    const [isEditingName, setIsEditingName] = useState(false);
    const [localProjectName, setLocalProjectName] = useState(currentProject?.name || '');
    const { addNotification } = useNotificationStore();

    useEffect(() => {
        setLocalProjectName(currentProject?.name || '');
    }, [currentProject?.name]);

    const handleNameUpdate = async () => {
        setIsEditingName(false);
        if (!currentProject || localProjectName === currentProject.name) return;
        try {
            const updated = await updateProjectName(currentProject.id, localProjectName);
            updateCurrentProject({ ...currentProject, name: updated.name });
            addNotification("Project name updated.", "success");
        } catch (error: any) {
            addNotification(`Error updating name: ${error.message}`, "error");
            setLocalProjectName(currentProject.name); // Revert on error
        }
    };

    const ownerId = typeof currentProject?.userId === 'string' ? currentProject.userId : currentProject?.userId?.id;

    return (
        <header className="absolute top-0 left-0 right-0 p-3 bg-background/30 backdrop-blur-sm z-50 flex justify-between items-center border-b border-border h-16 flex-shrink-0">
            {/* Left Side: Back and Title */}
            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setView('userDashboard')} 
                    className="p-2 rounded-lg bg-card/50 hover:bg-card transition-colors text-slate-300"
                    title="Back to Dashboard"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>
                 <div className="flex items-center gap-2">
                    <DakshinVaarahiLogo className="w-auto h-8" />
                    <div>
                        {isEditingName ? (
                            <input
                                type="text"
                                value={localProjectName}
                                onChange={(e) => setLocalProjectName(e.target.value)}
                                onBlur={handleNameUpdate}
                                onKeyDown={(e) => e.key === 'Enter' && handleNameUpdate()}
                                autoFocus
                                className="text-lg font-bold bg-input text-white rounded-md px-2 py-0.5 outline-none ring-2 ring-primary"
                            />
                        ) : (
                            <h1 
                                className="text-lg font-bold text-white truncate cursor-pointer"
                                title={currentProject?.name || 'Untitled Project'}
                                onDoubleClick={() => setIsEditingName(true)}
                            >
                                {currentProject?.name || 'Untitled Project'}
                            </h1>
                        )}
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-slate-400">Version {currentProject?.version || 1}</span>
                            <SaveStatusIndicator />
                        </div>
                    </div>
                 </div>
            </div>

            {/* Right Side: Actions and Avatars */}
            <div className="flex items-center gap-4">
                <button
                    onClick={() => setExportModalOpen(true)}
                    className="px-3 py-2 text-sm rounded-lg flex items-center gap-2 bg-card/50 hover:bg-card transition-colors text-slate-200"
                    title="Export Project"
                >
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                    Export
                </button>
                {currentProject && ownerId && (
                    <Suspense fallback={<div className="w-8 h-8 rounded-full bg-slate-700 animate-pulse" />}>
                        <PresenceAvatars collaborators={collaborators} ownerId={ownerId} currentUser={currentUser} />
                    </Suspense>
                )}
            </div>
        </header>
    );
};