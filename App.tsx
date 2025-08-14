
// src/App.tsx
import React, { Suspense, useEffect, useState } from 'react';
import { useAppStore } from './state/appStore';
import { NotificationContainer } from './components/common/NotificationContainer';
import ErrorBoundary from './components/common/ErrorBoundary';
import { GlobalSpinner } from './components/GlobalSpinner';
import { AnimatePresence, motion } from 'framer-motion';
import { Router } from './components/Router';

// Lazy load modals and other global components that are not pages
const AuthModal = React.lazy(() => import('./features/auth/components/AuthModal'));
const ProfilePage = React.lazy(() => import('./features/auth/components/ProfilePage'));
const BuyCreditsModal = React.lazy(() => import('./features/payments/components/BuyCreditsModal'));
const HelpSupportModal = React.lazy(() => import('./features/help/components/HelpSupportModal'));
const FeedbackModal = React.lazy(() => import('./features/feedback/components/FeedbackModal'));
const SupportAgentModal = React.lazy(() => import('./features/help/components/SupportAgentModal'));
const LaunchSequence = React.lazy(() => import('./components/dashboard/LaunchSequence'));
const ProjectModal = React.lazy(() => import('./features/projects/components/ProjectModal'));
const ProactiveAIWidget = React.lazy(() => import('./components/ProactiveAIWidget'));
const InteractiveTutorial = React.lazy(() => import('./features/onboarding/components/InteractiveTutorial'));
const WelcomeModal = React.lazy(() => import('./features/onboarding/components/WelcomeModal'));


const MotionDiv = motion.div as any;

export const App: React.FC = () => (
    <ErrorBoundary>
        <AppContent />
    </ErrorBoundary>
);

const OfflineIndicator: React.FC = () => (
    <MotionDiv
        className="fixed bottom-0 left-0 right-0 z-[9999] bg-destructive/90 p-3 text-center text-sm font-semibold text-white"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
        You are currently offline. Some features may be unavailable.
    </MotionDiv>
);

const ReconnectedIndicator: React.FC = () => (
    <MotionDiv
        className="fixed bottom-0 left-0 right-0 z-[9999] bg-emerald-600/90 p-3 text-center text-sm font-semibold text-white"
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
        You are back online. Connection restored.
    </MotionDiv>
);


const AppContent: React.FC = () => {
    const { 
        view, currentUser, globalLoadingMessage, isProfilePageOpen, 
        isHelpModalOpen, isFeedbackModalOpen, isSupportModalOpen, isBuyCreditsModalOpen,
        setBuyCreditsModalOpen,
        authModal, initApp, isLaunchSequenceActive,
        isNewProjectModalOpen, setNewProjectModalOpen, isLoadingAuth,
        onboardingStep,
        isWelcomeModalOpen
    } = useAppStore();
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [showReconnected, setShowReconnected] = useState(false);
    
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowReconnected(true);
            setTimeout(() => setShowReconnected(false), 4000); // Show for 4 seconds
        };
        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (!currentUser && !isLoadingAuth) {
            initApp();
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [initApp, currentUser, isLoadingAuth]);

    return (
        <Suspense fallback={<GlobalSpinner message="Loading Universe..." />}>
            {globalLoadingMessage && <GlobalSpinner message={globalLoadingMessage} />}
            
            <AnimatePresence>
                {isLaunchSequenceActive && <LaunchSequence />}
            </AnimatePresence>

            <AnimatePresence>
                {!isOnline && <OfflineIndicator />}
                {showReconnected && <ReconnectedIndicator />}
            </AnimatePresence>
            
            <Router />

            <NotificationContainer />
            
            <AnimatePresence>
                {authModal && <AuthModal />}
                {isProfilePageOpen && <ProfilePage />}
                {isBuyCreditsModalOpen && <BuyCreditsModal isOpen={isBuyCreditsModalOpen} onClose={() => setBuyCreditsModalOpen(false)} />}
                {isHelpModalOpen && <HelpSupportModal onClose={() => useAppStore.setState({ isHelpModalOpen: false })} />}
                {isFeedbackModalOpen && <FeedbackModal onClose={() => useAppStore.setState({ isFeedbackModalOpen: false })} />}
                {isSupportModalOpen && <SupportAgentModal onClose={() => useAppStore.setState({ isSupportModalOpen: false })} />}
                {isNewProjectModalOpen && <ProjectModal isOpen={isNewProjectModalOpen} onClose={() => setNewProjectModalOpen(false)} />}
                {onboardingStep > -1 && <InteractiveTutorial />}
                {isWelcomeModalOpen && <WelcomeModal />}
            </AnimatePresence>

            { currentUser && view === 'auraOS' && <ProactiveAIWidget /> }
        </Suspense>
    );
};