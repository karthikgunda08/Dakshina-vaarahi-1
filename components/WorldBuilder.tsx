// src/components/WorldBuilder.tsx
import React, { useState, useRef, Suspense } from 'react';
import { useAppStore } from '../state/appStore';
import { FloorPlanSketcherSection } from '../features/FloorPlanSketcherSection';
import { Basic3dViewPanel } from '../features/editor/components/Basic3dViewPanel';
import { ViewPanelCard } from '../features/editor/components/ViewPanelCard';
import { WorldBuilderToolbar } from './WorldBuilderToolbar';
import { AuraOSHeader } from './AuraOS/AuraOSHeader';
import { BottomDock } from './AuraOS/BottomDock';
import { ExportModal } from '../features/editor/components/ExportModal';
import CollaborationModal from './collaboration/CollaborationModal';
import { GlobalSpinner } from './GlobalSpinner';
import { SketcherHandles, View3DHandles } from '../types/index';
import { SaveVersionModal } from './AuraOS/SaveVersionModal';

const WorldBuilder: React.FC = () => {
    const store = useAppStore();
    const sketcherRef = useRef<SketcherHandles>(null);
    const view3dRef = useRef<View3DHandles>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

    const {
        currentProject, isExportModalOpen, setExportModalOpen,
        activeSketcherTool, setActiveSketcherTool, saveProjectVersion,
        editorMode, setEditorMode, addZone, addInfrastructure, updateWall
    } = store;

    const handleSave = async (commitMessage: string) => {
        await saveProjectVersion(commitMessage);
    };

    return (
        <div className="relative w-screen h-screen overflow-hidden bg-slate-900">
            <AuraOSHeader />
            <main className="w-full h-full pt-20 pb-20 px-4">
                <div className="flex h-full gap-4">
                    <div className="w-2/3 h-full">
                        <ViewPanelCard title="2D Master Plan">
                            <FloorPlanSketcherSection 
                                ref={sketcherRef} 
                                {...store} 
                                currentTool={activeSketcherTool} 
                                setActiveSketcherTool={setActiveSketcherTool}
                                editorMode={editorMode}
                                setEditorMode={setEditorMode}
                                addZone={addZone}
                                addInfrastructure={addInfrastructure}
                                updateWall={updateWall}
                            />
                        </ViewPanelCard>
                    </div>
                    <div className="w-1/3 h-full">
                        <ViewPanelCard title="3D Site Visualization">
                            <Basic3dViewPanel ref={view3dRef} {...store} />
                        </ViewPanelCard>
                    </div>
                </div>
            </main>

            <WorldBuilderToolbar 
                activeTool={activeSketcherTool}
                onToolChange={(tool) => setActiveSketcherTool(tool)}
            />

            <BottomDock
                onSaveClick={() => setIsSaveModalOpen(true)}
                onShareClick={() => setIsShareModalOpen(true)}
                cinematicTourReady={!!store.cinematicTourData}
                onPlayTour={() => store.setIsCinematicTourPlaying(true)}
                canUndo={store.canUndo}
                canRedo={store.canRedo}
                onUndo={store.undo}
                onRedo={store.redo}
            />
            
            {isSaveModalOpen && <SaveVersionModal onClose={() => setIsSaveModalOpen(false)} onSave={handleSave} />}
            {isExportModalOpen && currentProject && <ExportModal onClose={() => setExportModalOpen(false)} sketcherRef={sketcherRef} view3dRef={view3dRef} projectName={currentProject?.name || 'Untitled'} />}
            {isShareModalOpen && currentProject && (
                <Suspense fallback={<GlobalSpinner message="Loading..." />}>
                    <CollaborationModal 
                        isOpen={isShareModalOpen} 
                        onClose={() => setIsShareModalOpen(false)}
                        projectId={currentProject.id}
                        initialCollaborators={store.collaborators}
                        onCollaboratorsUpdate={store.setCollaborators}
                    />
                </Suspense>
            )}
        </div>
    );
};

export default WorldBuilder;