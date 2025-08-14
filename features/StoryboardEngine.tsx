// src/features/StoryboardEngine.tsx
import React, { useState, useMemo } from 'react';
import { useAppStore } from '../state/appStore';
import { Scene, Storyboard } from '../types/index';
import { motion, AnimatePresence } from 'framer-motion';
import { Basic3dViewPanel } from './editor/components/Basic3dViewPanel';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';

const MotionDiv = motion.div as any;
const generateId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const SceneCard: React.FC<{ scene: Scene, isActive: boolean, onClick: () => void }> = ({ scene, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`w-full p-3 text-left rounded-lg border-l-4 transition-all duration-200 ${isActive ? 'bg-slate-700 border-primary' : 'bg-slate-800/50 border-slate-600 hover:bg-slate-700/50'}`}
    >
        <h4 className="font-semibold text-white truncate">{scene.title || 'Untitled Scene'}</h4>
        <p className="text-xs text-slate-400 truncate">{scene.narrative || 'No narrative.'}</p>
        <div className="text-right text-xs text-slate-500 mt-1">{scene.duration}s</div>
    </button>
);

const StoryboardEngine: React.FC = () => {
    const store = useAppStore();
    const { currentProject, updateCurrentProject } = store;
    
    const storyboard = useMemo(() => currentProject?.storyboard, [currentProject]);
    const [activeSceneId, setActiveSceneId] = useState<string | null>(storyboard?.scenes[0]?.id || null);
    
    const activeScene = useMemo(() => storyboard?.scenes.find(s => s.id === activeSceneId), [storyboard, activeSceneId]);

    const handleUpdateStoryboard = (updatedStoryboard: Storyboard | null) => {
        updateCurrentProject({ storyboard: updatedStoryboard });
    };

    const handleAddScene = () => {
        const newScene: Scene = {
            id: generateId('scene'),
            title: `New Scene ${storyboard ? storyboard.scenes.length + 1 : 1}`,
            narrative: '',
            cameraViewId: null,
            duration: 5,
        };
        const newStoryboard: Storyboard = storyboard 
            ? { ...storyboard, scenes: [...storyboard.scenes, newScene] }
            : { id: generateId('storyboard'), title: 'Main Storyboard', scenes: [newScene] };
        
        handleUpdateStoryboard(newStoryboard);
        setActiveSceneId(newScene.id);
    };

    const handleDeleteScene = () => {
        if (!storyboard || !activeSceneId) return;
        const newScenes = storyboard.scenes.filter(s => s.id !== activeSceneId);
        handleUpdateStoryboard({ ...storyboard, scenes: newScenes });
        setActiveSceneId(newScenes[0]?.id || null);
    };

    const handleUpdateScene = (updates: Partial<Scene>) => {
        if (!storyboard || !activeSceneId) return;
        const newScenes = storyboard.scenes.map(s => s.id === activeSceneId ? { ...s, ...updates } : s);
        handleUpdateStoryboard({ ...storyboard, scenes: newScenes });
    };

    return (
        <div className="w-screen h-screen flex flex-col bg-black text-white">
            <header className="h-16 px-6 flex-shrink-0 flex justify-between items-center border-b border-slate-800">
                <h1 className="text-xl font-bold">Storyboard Engine: <span className="text-slate-400">{currentProject?.name}</span></h1>
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">Play Full Sequence</Button>
                    <Button variant="secondary" size="sm" onClick={() => store.setView('auraOS')}>Exit to Studio</Button>
                </div>
            </header>
            <main className="flex-grow flex overflow-hidden">
                {/* Scene Timeline */}
                <div className="w-1/4 max-w-xs flex-shrink-0 border-r border-slate-800 flex flex-col">
                    <div className="p-4 flex-shrink-0">
                        <Button onClick={handleAddScene} className="w-full">Add Scene</Button>
                    </div>
                    <div className="flex-grow overflow-y-auto p-4 space-y-3">
                        {storyboard?.scenes.map(scene => (
                            <SceneCard key={scene.id} scene={scene} isActive={activeSceneId === scene.id} onClick={() => setActiveSceneId(scene.id)} />
                        ))}
                    </div>
                </div>

                {/* 3D Preview */}
                <div className="flex-grow">
                    <Basic3dViewPanel {...store} />
                </div>

                {/* Scene Editor */}
                <div className="w-1/3 max-w-md flex-shrink-0 border-l border-slate-800 flex flex-col">
                    <AnimatePresence mode="wait">
                        {activeScene ? (
                            <MotionDiv key={activeSceneId} className="flex-grow flex flex-col p-6 space-y-4" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}>
                                <h3 className="text-lg font-semibold text-primary">Scene Editor</h3>
                                <div>
                                    <Label htmlFor="scene-title">Title</Label>
                                    <Input id="scene-title" value={activeScene.title} onChange={e => handleUpdateScene({ title: e.target.value })} />
                                </div>
                                <div>
                                    <Label htmlFor="scene-narrative">Narrative / Script</Label>
                                    <textarea id="scene-narrative" rows={8} value={activeScene.narrative} onChange={e => handleUpdateScene({ narrative: e.target.value })} className="w-full mt-1 p-2 text-sm bg-input rounded-md" />
                                </div>
                                <div>
                                    <Label htmlFor="scene-camera">Camera View</Label>
                                    <select id="scene-camera" value={activeScene.cameraViewId || ''} onChange={e => handleUpdateScene({ cameraViewId: e.target.value || null })} className="w-full mt-1 p-2 bg-input rounded-md">
                                        <option value="">-- Select Camera --</option>
                                        {store.savedCameraViews?.map(view => (
                                            <option key={view.id} value={view.id}>{view.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <Label htmlFor="scene-duration">Duration (seconds)</Label>
                                    <Input id="scene-duration" type="number" value={activeScene.duration} onChange={e => handleUpdateScene({ duration: parseInt(e.target.value) || 0 })} />
                                </div>
                                <div className="mt-auto pt-4 flex-shrink-0">
                                    <Button variant="destructive" onClick={handleDeleteScene}>Delete Scene</Button>
                                </div>
                            </MotionDiv>
                        ) : (
                            <div className="flex items-center justify-center h-full text-slate-500">
                                <p>Select a scene or create a new one to begin.</p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default StoryboardEngine;
