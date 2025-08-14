// src/components/dashboard/DashboardLayout.tsx
import React from 'react';
import { Sidebar } from './Sidebar';
import ProjectDashboard from './ProjectDashboard';
import { AppView } from '../../types/index';
import MarketplaceView from '../marketplace/MarketplaceView';
import WalletView from '../wallet/WalletView';
import AstraSupplyChainView from '../AstraSupplyChainView';
import GuildsView from '../guilds/GuildsView';
import { AuraCommandCenter } from '../AuraOS/AuraCommandCenter';
import BrahmaAstraEngineView from '../brahmaAstra/BrahmaAstraEngineView';
import ChroniclesView from '../chronicles/ChroniclesView';
import RealEstateExchangeView from '../exchange/RealEstateExchangeView';
import DeveloperHubView from '../developer/DeveloperHubView';
import StoryboardEngine from '../../features/StoryboardEngine';
import AtmanForgeView from '../atman-forge/AtmanForgeView';
import SutraEngineView from '../../features/sutra-engine/pages/SutraEngineView';


interface DashboardLayoutProps {
    view: AppView;
}

const renderView = (view: AppView) => {
    switch (view) {
        case 'userDashboard': return <ProjectDashboard />;
        case 'marketplace': return <MarketplaceView />;
        case 'wallet': return <WalletView />;
        case 'astraSupplyChain': return <AstraSupplyChainView />;
        case 'guilds': return <GuildsView />;
        case 'chronicles': return <ChroniclesView />;
        case 'realEstateExchange': return <RealEstateExchangeView />;
        case 'auraCommandCenter': return <AuraCommandCenter />;
        case 'brahmaAstra': return <BrahmaAstraEngineView />;
        case 'developer': return <DeveloperHubView />;
        case 'storyboard': return <StoryboardEngine />;
        case 'atmanForge': return <AtmanForgeView />;
        case 'sutraEngine': return <SutraEngineView />;
        // Add other views here as they are integrated into the dashboard
        default: return <ProjectDashboard />;
    }
};

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ view }) => {
    return (
        <div className="flex h-screen w-screen">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                {renderView(view)}
            </div>
        </div>
    );
};

export default DashboardLayout;