// src/features/tools/RenderTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, ProjectData, GeneratedRender } from '../../types/index';
import { generateRenderApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { addProjectRender } from '../../services/projectService';
import { CreditCostDisplay } from '../../components/common/CreditCostDisplay';

const stylePresets = [
    { name: 'Photorealistic', prompt: 'award-winning photorealistic architectural photography, cinematic lighting, ultra-detailed, 8k' },
    { name: 'Clay Model', prompt: 'monochromatic clay model render, ambient occlusion, studio lighting, minimalist' },
    { name: 'Blueprint', prompt: 'schematic blueprint style, white lines on a blue background, technical drawing' },
    { name: 'Watercolor', prompt: 'architectural watercolor sketch, soft edges, artistic, vibrant colors' },
];

export const RenderTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { levels, activeLevelIndex, currentUser, setBuyCreditsModalOpen, refreshCurrentUser, planNorthDirection, propertyLines, terrainMesh, currentProject, setGeneratedRenders, setLastAiToolRun } = props;
    const activeLevel = levels[activeLevelIndex];

    const [roomId, setRoomId] = useState('');
    const [stylePrompt, setStylePrompt] = useState(stylePresets[0].prompt);
    const [aspectRatio, setAspectRatio] = useState('16:9');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [renderUrl, setRenderUrl] = useState<string | null>(null);
    const { addNotification } = useNotificationStore();
    
    const projectData: ProjectData = { name: props.currentProject?.name || 'Untitled Project', projectType: props.currentProject?.projectType || 'building', levels, planNorthDirection, propertyLines, terrainMesh, zones: [], infrastructure: [] };
    const creditCost = 5;

    const handleGenerate = async () => {
        if (!roomId || !stylePrompt) {
            addNotification("Please select a room and provide a style prompt.", "error");
            return;
        }
        if (!currentUser || !currentProject) { addNotification("Please log in and open a project.", "error"); return; }
        if (currentUser.role !== 'owner' && currentUser.credits < creditCost) {
            addNotification(`You need ${creditCost} credits.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setRenderUrl(null);
        try {
            const config = { aspectRatio };
            const response = await generateRenderApi(currentProject.id, projectData, roomId, stylePrompt, config);
            setRenderUrl(response.imageUrl);
            
            const newRender: Omit<GeneratedRender, '_id' | 'createdAt'> = {
                prompt: stylePrompt,
                url: response.imageUrl
            };

            const updatedRenders = await addProjectRender(currentProject.id, newRender);
            setGeneratedRenders(updatedRenders);
            setLastAiToolRun('Render');
            addNotification("Render generated and saved to Project Hub!", "success");
            await refreshCurrentUser();
        } catch (err: any) {
            setError(err.message);
            addNotification(err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <p className="text-sm text-slate-300 mb-3">Generate a photorealistic render for a specific room on the current level ({activeLevel.name}).</p>
            <div className="space-y-4">
                <div>
                    <label htmlFor="room-select-render" className="block text-sm font-medium text-slate-300 mb-1">Select Room</label>
                    <select id="room-select-render" value={roomId} onChange={e => setRoomId(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                        <option value="">-- Select a room --</option>
                        {activeLevel.rooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="aspect-ratio-select" className="block text-sm font-medium text-slate-300 mb-1">Aspect Ratio</label>
                    <select id="aspect-ratio-select" value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                        <option value="16:9">16:9 (Widescreen)</option>
                        <option value="1:1">1:1 (Square)</option>
                        <option value="9:16">9:16 (Portrait)</option>
                         <option value="4:3">4:3 (Standard)</option>
                         <option value="3:4">3:4 (Portrait)</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="style-preset-select" className="block text-sm font-medium text-slate-300 mb-1">Style Preset</label>
                    <select id="style-preset-select" onChange={e => setStylePrompt(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                        {stylePresets.map(preset => <option key={preset.name} value={preset.prompt}>{preset.name}</option>)}
                        <option value="">Custom...</option>
                    </select>
                </div>
                 <div>
                    <label htmlFor="style-prompt-render" className="block text-sm font-medium text-slate-300 mb-1">Style Prompt Details</label>
                    <textarea id="style-prompt-render" rows={3} value={stylePrompt} onChange={e => setStylePrompt(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" />
                </div>
            </div>
             <button
                onClick={handleGenerate}
                disabled={isLoading || !roomId || !stylePrompt}
                className="w-full mt-4 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">🖼️</span>}
                <span className="flex-grow">{isLoading ? 'Rendering...' : 'Generate Render'}</span>
                <CreditCostDisplay cost={creditCost} />
            </button>
             {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

             {renderUrl && (
                <div className="mt-4">
                    <h4 className="font-semibold text-slate-200 mb-2">Generated Render:</h4>
                    <img src={renderUrl} alt="Generated render" className="w-full rounded-md shadow-lg" />
                </div>
             )}
        </div>
    );
};
