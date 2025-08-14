
// src/features/public-views/pages/ArchitectsFolioView.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { Project } from '../../../types/index';
import * as authService from '../../../services/authService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Basic3dViewPanel } from '../../editor/components/Basic3dViewPanel';

interface ArchitectsFolioViewProps {
  shareableLink: string;
}

const ArchitectsFolioView: React.FC<ArchitectsFolioViewProps> = ({ shareableLink }) => {
    const [project, setProject] = useState<Project | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        authService.getPublicFolioApi(shareableLink)
            .then(data => setProject(data.project))
            .catch(err => setError(err.message || 'Could not load this folio.'))
            .finally(() => setIsLoading(false));
    }, [shareableLink]);

    if (isLoading) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background"><LoadingSpinner /></div>;
    }

    if (error || !project) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background text-red-400">{error || 'Folio not found.'}</div>;
    }

    return (
        <div className="w-screen h-screen flex flex-col lg:flex-row bg-background text-white">
            <div className="lg:w-1/2 h-1/2 lg:h-full relative">
                 <Suspense fallback={<LoadingSpinner />}>
                    <Basic3dViewPanel 
                        levels={project.levels}
                        activeLevelIndex={0}
                        propertyLines={project.propertyLines}
                        terrainMesh={project.terrainMesh}
                        sunPosition={{azimuth: 135, altitude: 45}}
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
            </div>
            <div className="lg:w-1/2 h-1/2 lg:h-full overflow-y-auto p-8 md:p-12">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl md:text-4xl font-bold text-primary">{project.folio?.title || project.name}</h1>
                    <div className="mt-4 prose prose-lg prose-invert text-slate-300">
                        <p>{project.folio?.narrative || 'An exceptional project designed with AuraOS.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ArchitectsFolioView;
