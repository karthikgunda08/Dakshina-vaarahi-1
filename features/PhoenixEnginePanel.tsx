
// src/features/PhoenixEnginePanel.tsx
import React from 'react';
import { PhoenixEnginePanelProps, PhoenixEngineTab } from '../types/index';
import { MasterArchitectTool } from './MasterArchitectTool';
import { ResearchTool } from './tools/ResearchTool';
import { BoqTool } from './tools/BoqTool';
import { SustainabilityTool } from './tools/SustainabilityTool';
import { ComplianceTool } from './tools/ComplianceTool';
import { MaterialTool } from './tools/MaterialTool';
import { StructureTool } from './tools/StructureTool';
import { DreamWeaverTool } from './tools/DreamWeaverTool';
import { InteriorDecoratorTool } from './InteriorDecoratorTool';
import { StagingEngine } from './StagingEngine';
import { OracleTool } from './tools/OracleTool';
import { PhoenixEyeTool } from './tools/PhoenixEyeTool';
import { CommentsTool } from './tools/CommentsTool';
import { ModelLibraryPanel } from './editor/components/ModelLibraryPanel';
import { RenderTool } from './tools/RenderTool';
import { VishwakarmaTool } from './tools/VishwakarmaTool';
import { FabricatorTool } from './tools/FabricatorTool';
import { IndraNetTool } from './tools/IndraNetTool';
import { VayuAstraTool } from './tools/LokaSimulatorTool';
import { HydroEngineerTool } from './tools/HydroEngineerTool';
import { VastuTool } from './tools/VastuTool';
import { NexusAdvisorTool } from './tools/NexusAdvisorTool';
import { ThreeDSynthesisTool } from './tools/ThreeDSynthesisTool';
import { SamaranganTool } from './tools/SamaranganTool';
import { HolocronAuthoringTool } from './tools/HolocronAuthoringTool';
import {
  NavagrahaTool,
  AkashaTool,
  SamsaraTool,
  ShilpaSutraTool,
  AtmanSignatureTool,
  ParamAstraTool,
  SamudraManthanTool,
  SingularityEngineTool,
} from './tools/transcendence/TranscendenceTools';
import { PrithviAstraTool, AgniAstraTool } from './tools/civil/CivilEngineeringTools';
import {
  SketchToPlanTool,
  PlumbingTool,
  ElectricalTool,
  HVACTool,
  FlowTool,
  CinematicTourTool,
  SiteAnalysisTool
} from './tools/misc/SimpleTools';

const TabButton: React.FC<{ id?: string; isActive: boolean; onClick: () => void; children: React.ReactNode; isPremium?: boolean }> = ({ id, isActive, onClick, children, isPremium }) => (
    <button
        id={id}
        onClick={onClick}
        className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${isActive ? (isPremium ? 'border-amber-400 text-amber-300' : 'border-sky-400 text-sky-300') : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {isPremium && '✨'} {children}
    </button>
);

const toolCategories: Record<string, { label: string; tools: PhoenixEngineTab[] }> = {
    core: { label: 'Core AI', tools: ['aiArchitect', 'samarangan', 'conceptExplorer', 'sketchToPlan', 'nexus', 'research', 'oracle'] },
    analysis: { label: 'Analysis', tools: ['boq', 'sustainability', 'compliance', 'structural', 'vastu', 'flow', 'material', 'constructionCam'] },
    civil: { label: 'Civil & Site', tools: ['geotechnical', 'structuralDetailing', 'site', 'hydro', 'climate'] },
    fabrication: { label: 'Fabrication', tools: ['gfcDrawings', '3dSynthesis', 'fabrication'] },
    presentation: { label: 'Presentation', tools: ['render', 'aiDecorator', 'cinematicTour', 'mediaKit', 'holocron', 'staging'] },
    mep: { label: 'MEP', tools: ['plumbing', 'electrical', 'hvac'] },
    advanced: { label: 'Transcendence', tools: ['cosmicTiming', 'akasha', 'lifecycle', 'aesthetics', 'atmanSignature', 'optimizer', 'holisticAnalysis', 'singularity'] },
    utility: { label: 'Utility', tools: ['comments', 'modelLibrary'] },
};


const getCategoryForTool = (tool: PhoenixEngineTab): string => {
    for (const category in toolCategories) {
        if (toolCategories[category].tools.includes(tool)) {
            return category;
        }
    }
    return 'core';
};

export const PhoenixEnginePanel: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { activeTool, setActiveTool } = props;
    const [activeCategory, setActiveCategory] = React.useState(getCategoryForTool(activeTool));

    const handleCategoryChange = (category: string) => {
        setActiveCategory(category);
        setActiveTool(toolCategories[category].tools[0]);
    };
    
    React.useEffect(() => {
        setActiveCategory(getCategoryForTool(activeTool));
    }, [activeTool]);

    const renderTool = () => {
        switch (activeTool) {
            case 'aiArchitect': return <div id="mission-step-2-target"><MasterArchitectTool {...props} /></div>;
            case 'samarangan': return <SamaranganTool {...props} />;
            case 'conceptExplorer': return <DreamWeaverTool {...props} />;
            case 'sketchToPlan': return <SketchToPlanTool {...props} />;
            case 'nexus': return <NexusAdvisorTool {...props} />;
            case 'research': return <ResearchTool {...props} />;
            case 'oracle': return <OracleTool {...props} />;

            case 'boq': return <BoqTool {...props} />;
            case 'sustainability': return <SustainabilityTool {...props} />;
            case 'compliance': return <ComplianceTool {...props} />;
            case 'structural': return <StructureTool {...props} />;
            case 'vastu': return <VastuTool {...props} />;
            case 'flow': return <FlowTool {...props} />;
            case 'material': return <MaterialTool {...props} />;
            case 'constructionCam': return <PhoenixEyeTool {...props} />;
            
            // Civil & Site
            case 'geotechnical': return <PrithviAstraTool {...props} />;
            case 'structuralDetailing': return <AgniAstraTool {...props} />;
            case 'site': return <SiteAnalysisTool {...props} />;
            case 'hydro': return <HydroEngineerTool {...props} />;
            case 'climate': return <VayuAstraTool {...props} />;

            // Fabrication
            case 'gfcDrawings': return <VishwakarmaTool {...props} />;
            case '3dSynthesis': return <ThreeDSynthesisTool {...props} />;
            case 'fabrication': return <FabricatorTool {...props} />;

            case 'render': return <div id="mission-step-3-target"><RenderTool {...props} /></div>;
            case 'aiDecorator': return <InteriorDecoratorTool {...props} />;
            case 'cinematicTour': return <CinematicTourTool {...props} />;
            case 'mediaKit': return <IndraNetTool {...props} />;
            case 'staging': return <StagingEngine {...props} />;
            
            case 'plumbing': return <PlumbingTool {...props} />;
            case 'electrical': return <ElectricalTool {...props} />;
            case 'hvac': return <HVACTool {...props} />;

            case 'cosmicTiming': return <NavagrahaTool {...props} />;
            case 'akasha': return <AkashaTool {...props} />;
            case 'lifecycle': return <SamsaraTool {...props} />;
            case 'aesthetics': return <ShilpaSutraTool {...props} />;
            case 'atmanSignature': return <AtmanSignatureTool {...props} />;
            case 'optimizer': return <ParamAstraTool {...props} />;
            case 'holisticAnalysis': return <SamudraManthanTool {...props} />;
            case 'singularity': return <SingularityEngineTool {...props} />;

            case 'comments': return <CommentsTool {...props} />;
            case 'modelLibrary': return <ModelLibraryPanel {...props} />;

            // Default/Fallbacks
            case 'holocron': return <HolocronAuthoringTool {...props} />;
            
            default: return <p>Tool '{activeTool}' not implemented yet.</p>;
        }
    };

    return (
        <div className="h-full flex flex-col">
            <div className="border-b border-slate-700 flex-shrink-0">
                <div className="flex overflow-x-auto">
                    {Object.entries(toolCategories).map(([key, { label }]) => (
                        <TabButton key={key} isActive={activeCategory === key} onClick={() => handleCategoryChange(key)}>
                            {label}
                        </TabButton>
                    ))}
                </div>
            </div>
            <div className="flex-grow overflow-y-auto p-4">
                {renderTool()}
            </div>
        </div>
    );
};