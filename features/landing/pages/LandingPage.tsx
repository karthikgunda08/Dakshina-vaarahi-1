// src/features/landing/pages/LandingPage.tsx
import React from 'react';
import { LandingPricing } from '../../../components/landing/LandingPricing';
import { LandingFeaturesGrid } from '../../../components/landing/LandingFeaturesGrid';
import { LandingValueFlow } from '../../../components/landing/LandingValueFlow';
import { LandingManifesto } from '../../../components/landing/LandingManifesto';
import { useAppStore } from '../../../state/appStore';
import type { CreditPack } from '../../../types/index';
import { Header } from '../../../components/common/Header';
import { Footer } from '../../../components/common/Footer';
import { LandingRevolt } from '../../../components/landing/LandingRevolt';

const LandingPage: React.FC = () => {
  const { currentUser, setBuyCreditsModalOpen, setAuthModal } = useAppStore(state => ({
    currentUser: state.currentUser,
    setBuyCreditsModalOpen: state.setBuyCreditsModalOpen,
    setAuthModal: state.setAuthModal,
  }));
  
  const handleBuyCreditsClick = (pack: CreditPack) => {
    setBuyCreditsModalOpen(true, pack);
  };
  
  const handleGetStarted = () => {
      setAuthModal('register');
  }

  return (
    <div className="flex-grow flex flex-col">
      <Header />
      <main className="flex-grow">
          <LandingManifesto onGetStarted={handleGetStarted} />
          <div className="animated-gradient-bg">
            <LandingValueFlow />
            <LandingRevolt />
            <LandingFeaturesGrid />
            <LandingPricing 
              onGetStarted={handleGetStarted} 
              currentUser={currentUser} 
              onBuyCreditsClick={handleBuyCreditsClick}
            />
          </div>
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;