// src/components/Router.tsx
import React, { useEffect, Suspense } from 'react';
import { useAppStore } from '../state/appStore';
import { GlobalSpinner } from './GlobalSpinner';

// Lazy-loaded components for different views
const LandingPage = React.lazy(() => import('../features/landing/pages/LandingPage'));
const DashboardLayout = React.lazy(() => import('./dashboard/DashboardLayout'));
const AuraOS = React.lazy(() => import('./AuraOS/AuraOSWrapper'));
const WorldBuilder = React.lazy(() => import('./WorldBuilder'));
const KwinCityShowcaseView = React.lazy(() => import('../features/public-views/pages/KwinCityShowcaseView'));
const ClientPortalView = React.lazy(() => import('../features/public-views/pages/ClientPortalView'));
const ArchitectsFolioView = React.lazy(() => import('../features/public-views/pages/ArchitectsFolioView'));
const HolocronView = React.lazy(() => import('../features/public-views/pages/HolocronView'));
const ResetPasswordPage = React.lazy(() => import('../features/auth/pages/ResetPasswordPage'));
const FoundationPage = React.lazy(() => import('./foundation/FoundationPage'));
const CommunityShowcase = React.lazy(() => import('./community/CommunityShowcase'));
const PublicProfileView = React.lazy(() => import('./community/PublicProfileView'));
const StoryboardEngine = React.lazy(() => import('../features/StoryboardEngine'));
const TermsPage = React.lazy(() => import('../features/legal/pages/TermsPage'));
const PrivacyPage = React.lazy(() => import('../features/legal/pages/PrivacyPage'));
const NotFoundPage = React.lazy(() => import('../features/status/pages/NotFoundPage'));

export const Router: React.FC = () => {
    const { view, currentUser, setView } = useAppStore();
    
    // Hash-based router logic
    useEffect(() => {
        const handleHashChange = () => {
            const path = window.location.hash.substring(1);
            if (path.startsWith('/client/')) setView('clientPortal');
            else if (path.startsWith('/folio/')) setView('architectsFolio');
            else if (path.startsWith('/holocron/')) setView('holocron');
            else if (path.startsWith('/reset-password/')) setView('resetPassword');
            else if (path.startsWith('/showcase')) setView('communityShowcase');
            else if (path.startsWith('/profiles/')) setView('publicProfile');
            else if (path.startsWith('/foundation')) setView('foundation');
            else if (path.startsWith('/kwin-city')) setView('kwinCity');
            else if (path.startsWith('/terms')) setView('terms');
            else if (path.startsWith('/privacy')) setView('privacy');
        };

        window.addEventListener('hashchange', handleHashChange);
        handleHashChange(); // Initial check on load
        return () => window.removeEventListener('hashchange', handleHashChange);
    }, [setView]);
    
    const renderView = () => {
        const path = window.location.hash.substring(1);
        const shareableLink = path.split('/').pop()?.split('?')[0] || '';
        const userId = path.split('/')[2];

        // Specific, public, full-page routes based on URL hash
        if (path.startsWith('/client/')) return <ClientPortalView shareableLink={shareableLink} />;
        if (path.startsWith('/folio/')) return <ArchitectsFolioView shareableLink={shareableLink} />;
        if (path.startsWith('/holocron/')) return <HolocronView shareableLink={shareableLink} />;
        if (path.startsWith('/reset-password/')) return <ResetPasswordPage token={shareableLink} />;
        if (path.startsWith('/showcase')) return <CommunityShowcase />;
        if (path.startsWith('/profiles/')) return <PublicProfileView userId={userId} />;
        if (path.startsWith('/foundation')) return <FoundationPage />;
        if (path.startsWith('/kwin-city')) return <KwinCityShowcaseView />;
        if (path.startsWith('/terms')) return <TermsPage />;
        if (path.startsWith('/privacy')) return <PrivacyPage />;

        // Fallback to state-driven view for logged-in users or landing
        if (currentUser || view === 'landing') {
            switch (view) {
                case 'landing': return <LandingPage />;
                case 'userDashboard':
                case 'marketplace':
                case 'wallet':
                case 'astraSupplyChain':
                case 'guilds':
                case 'chronicles':
                case 'realEstateExchange':
                case 'auraCommandCenter':
                case 'brahmaAstra':
                case 'developer':
                case 'atmanForge':
                case 'sutraEngine':
                    return <DashboardLayout view={view} />;
                case 'auraOS': return <AuraOS />;
                case 'worldBuilder': return <WorldBuilder />;
                case 'storyboard': return <StoryboardEngine />;
                default:
                     if (path === '/' || path === '') return <LandingPage />;
                     return <NotFoundPage />; // Catch-all for unknown views
            }
        }
        
        if (path !== '/' && path !== '') return <NotFoundPage />;

        return <LandingPage />;
    };

    return <Suspense fallback={<GlobalSpinner message="Loading Universe..." />}>{renderView()}</Suspense>;
};