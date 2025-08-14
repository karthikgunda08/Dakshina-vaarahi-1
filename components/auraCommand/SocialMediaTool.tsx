
// src/components/auraCommand/SocialMediaTool.tsx
import React, { useState } from 'react';
import * as adminService from '../../services/adminService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ProjectSummary } from '../../types/index';
import { useNotificationStore } from '../../state/notificationStore';

interface SocialMediaToolProps {
    projects: ProjectSummary[];
}

export const SocialMediaTool: React.FC<SocialMediaToolProps> = ({ projects }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [post, setPost] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleGenerate = async () => {
        const project = projects.find(p => p.id === selectedProjectId);
        if (!project || !project.folio || !project.folio.isEnabled) {
            addNotification("Please select a project with a generated Architect's Folio to create a post.", "error");
            return;
        }

        setIsLoading(true);
        setPost('');
        try {
            // In a real app, you would fetch the full narrative. Here we'll just send the title.
            // This is a simplification for the demo.
            const result = await adminService.generateSocialMediaPostApi(project.name, "A beautiful project designed on our platform.");
            setPost(result.post);
        } catch (error: any) {
            // Handle error display
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-200">AI Social Media Assistant</h3>
            <p className="text-sm text-slate-400 mb-4">Select a project with a public Architect's Folio to generate a promotional social media post.</p>
            <div className="flex gap-2">
                <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                >
                    <option value="">-- Select a Project --</option>
                    {projects.filter(p => p.folio && p.folio.isEnabled).map(p => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                </select>
                 <button
                    onClick={handleGenerate}
                    disabled={isLoading || !selectedProjectId}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded-md font-semibold text-white disabled:opacity-50"
                >
                    {isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Generate Post'}
                </button>
            </div>
            
            {post && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                    <textarea
                        readOnly
                        value={post}
                        rows={6}
                        className="w-full bg-transparent text-slate-300 whitespace-pre-wrap border-0 focus:ring-0"
                    />
                     <button
                        onClick={() => {
                            navigator.clipboard.writeText(post);
                            addNotification("Post copied to clipboard!", "success");
                        }}
                        className="text-xs mt-2 px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-md"
                    >
                        Copy to Clipboard
                    </button>
                </div>
            )}
        </div>
    );
};