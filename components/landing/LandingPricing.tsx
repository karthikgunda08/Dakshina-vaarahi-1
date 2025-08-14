
// src/components/landing/LandingPricing.tsx
import React from 'react';
import type { User, CreditPack } from '../../types/index';
import { CREDIT_PACKS } from '../../lib/constants';
import { Button } from '../ui/Button';

interface LandingPricingProps {
  onGetStarted: () => void;
  currentUser: User | null;
  onBuyCreditsClick: (pack: CreditPack) => void;
}

const tierStyles = {
    explorer: 'border-sky-700/50 hover:border-sky-500',
    architect: 'border-purple-600/50 hover:border-purple-400',
    firm: 'border-amber-500/80',
};

const tierButtonStyles = {
    explorer: 'bg-sky-600 hover:bg-sky-500',
    architect: 'bg-purple-600 hover:bg-purple-500',
    firm: 'bg-primary text-primary-foreground hover:bg-primary/90',
};

const tierIcons = {
    explorer: '🚀',
    architect: '💎',
    firm: '🏢'
};

const PricingCard: React.FC<{
    pack: CreditPack;
    isLoggedIn: boolean;
    onGetStarted: () => void;
    onBuyCreditsClick: (pack: CreditPack) => void;
}> = ({ pack, isLoggedIn, onGetStarted, onBuyCreditsClick }) => {
    const isStudio = pack.name === 'Studio';
    const isEnterprise = pack.name === 'Enterprise';

    return (
        <div className={`relative flex flex-col p-6 rounded-lg bg-slate-800/50 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${tierStyles[pack.tier]} ${isEnterprise ? 'ring-2 ring-amber-500/50' : ''} ${isStudio ? 'bg-gradient-to-br from-slate-800 to-purple-900/30' : ''}`}>
            {isStudio && (
                <div className="absolute -top-3 right-4 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    Most Popular
                </div>
            )}
            <div className="text-4xl mb-4">{tierIcons[pack.tier]}</div>
            <h3 className="text-2xl font-bold text-white">{pack.name}</h3>
            <p className="text-4xl font-extrabold text-primary my-4">
                {pack.credits.toLocaleString()}
                <span className="text-lg font-medium text-slate-300 ml-2">Credits</span>
            </p>
            <p className="text-sm text-slate-400 flex-grow mb-6 font-body">{pack.description}</p>
            <Button
                onClick={isLoggedIn ? () => onBuyCreditsClick(pack) : onGetStarted}
                className={`w-full font-semibold text-lg py-3 ${tierButtonStyles[pack.tier]}`}
            >
                {isLoggedIn ? `Buy for ₹${pack.price.toLocaleString('en-IN')}` : 'Get Started'}
            </Button>
        </div>
    );
}


export const LandingPricing: React.FC<LandingPricingProps> = ({ onGetStarted, currentUser, onBuyCreditsClick }) => {
  return (
    <section id="pricing" className="py-16 md:py-24 bg-slate-900/70">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Fuel Your Revolution</h2>
          <p className="text-lg text-slate-300 max-w-3xl mx-auto font-body">
            Our AI tools consume credits on a pay-per-use basis, ensuring you only pay for the value you receive. Start free, and scale as your vision grows.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {CREDIT_PACKS.map(pack => (
                <PricingCard 
                    key={pack.id} 
                    pack={pack} 
                    isLoggedIn={!!currentUser}
                    onGetStarted={onGetStarted}
                    onBuyCreditsClick={onBuyCreditsClick}
                />
            ))}
        </div>
      </div>
    </section>
  );
};