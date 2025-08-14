
// src/features/public-views/pages/ClientPortalView.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { Project } from '../../../types/index';
import * as authService from '../../../services/authService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { ViewPanelCard } from '../../editor/components/ViewPanelCard';
import { FloorPlanSketcherSection } from '../../FloorPlanSketcherSection';
import { Basic3dViewPanel } from '../../editor/components/Basic3dViewPanel';

interface ClientPortalViewProps {
  shareableLink: string;
}

const ClientPortalView: React.FC<ClientPortalViewProps> = ({ shareableLink }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        authService.getPublicProjectByShareLink(shareableLink)
            .then(data => setProject(data.project))
            .catch(err => setError(err.message || 'Could not load project.'))
            .finally(() => setIsLoading(false));
    }, [shareableLink]);

    if (isLoading) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background"><LoadingSpinner /></div>;
    }

    if (error || !project) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background text-red-400">{error || 'Project not found.'}</div>;
    }
    
    // Create a read-only store state for the viewer components
    const readOnlyStoreState = {
        levels: project.levels,
        activeLevelIndex: 0,
        planNorthDirection: project.planNorthDirection,
        propertyLines: project.propertyLines,
        terrainMesh: project.terrainMesh,
        zones: [],
        infrastructure: [],
        selectedObject: null,
        currentProject: project
    };

    return (
        <div className="w-screen h-screen bg-background text-white p-4">
            <header className="mb-4">
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <p className="text-sm text-slate-400">Client Portal (Read-Only)</p>
            </header>
            <main className="h-[calc(100%-60px)] flex gap-4">
                 <div className="w-2/3 h-full">
                    <ViewPanelCard title="2D Floor Plan">
                        <FloorPlanSketcherSection isReadOnly={true} {...readOnlyStoreState} />
                    </ViewPanelCard>
                </div>
                <div className="w-1/3 h-full">
                    <ViewPanelCard title="3D Visualization">
                         <Suspense fallback={<LoadingSpinner />}>
                            <Basic3dViewPanel 
                                levels={project.levels}
                                activeLevelIndex={0}
                                propertyLines={project.propertyLines}
                                terrainMesh={project.terrainMesh}
                                sunPosition={{azimuth: 135, altitude: 45}}
                                // Pass empty/default values for props not relevant to public view
                                zones={[]}
                                infrastructure={[]}
                                selectedObject={null}
                                setSelectedObject={() => {}}
                                isWalkthroughActive={false}
                                setIsWalkthroughActive={() => {}}
                                constructionSequence={null}
                                activeTimelineWeek={null}
                                isDigitalTwinModeActive={false}
                                digitalTwinData={null}
                                activeDataOverlays={{energy: false, stress: false, occupancy: false}}
                                liveSelections={{}}
                                currentUser={null}
                                collaborators={[]}
                                isHolocronAuthoringMode={false}
                            />
                        </Suspense>
                    </ViewPanelCard>
                </div>
            </main>
        </div>
    );
};

export default ClientPortalView;
