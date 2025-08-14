// src/features/public-views/pages/HolocronView.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { HolocronData } from '../../../types/index';
import * as projectService from '../../../services/projectService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Basic3dViewPanel } from '../../editor/components/Basic3dViewPanel';
import { HolocronInfoPanel } from '../../../components/HolocronInfoPanel';

interface HolocronViewProps {
  shareableLink: string;
}

const HolocronView: React.FC<HolocronViewProps> = ({ shareableLink }) => {
    const [data, setData] = useState<HolocronData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeHotspot, setActiveHotspot] = useState<HolocronData['hotspots'][0] | null>(null);

    useEffect(() => {
        projectService.getPublicHolocronDataApi(shareableLink)
            .then(setData)
            .catch(err => setError(err.message || "Could not load this Holocron presentation."))
            .finally(() => setIsLoading(false));
    }, [shareableLink]);

    if (isLoading) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background"><LoadingSpinner /></div>;
    }

    if (error || !data) {
        return <div className="w-screen h-screen flex items-center justify-center bg-background text-red-400">{error || 'Presentation not found.'}</div>;
    }

    return (
        <div className="w-screen h-screen bg-background relative overflow-hidden">
            <header className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent z-10">
                 <h1 className="text-2xl font-bold text-white text-shadow-custom">{data.projectName}</h1>
                 <p className="text-sm text-slate-300 text-shadow-custom">An Interactive Holocron Presentation by AuraOS</p>
            </header>
            
            <Suspense fallback={<LoadingSpinner />}>
                <Basic3dViewPanel 
                    levels={data.levels}
                    activeLevelIndex={0}
                    propertyLines={data.propertyLines}
                    terrainMesh={data.terrainMesh}
                    sunPosition={{ azimuth: 135, altitude: 45 }}
                    hotspots={data.hotspots}
                    onHotspotClick={setActiveHotspot}
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
                    activeDataOverlays={{ energy: false, stress: false, occupancy: false }}
                    liveSelections={{}}
                    currentUser={null}
                    collaborators={[]}
                    isHolocronAuthoringMode={false}
                />
            </Suspense>

            {activeHotspot && (
                <HolocronInfoPanel hotspot={activeHotspot} onClose={() => setActiveHotspot(null)} />
            )}
        </div>
    );
};

export default HolocronView;
