// src/components/exchange/RealEstateExchangeView.tsx
import React, { useState, useEffect } from 'react';
import { ProjectSummary } from '../../types/index';
import * as projectService from '../../services/projectService';
import { LoadingSpinner } from '../common/LoadingSpinner';

const TokenCard: React.FC<{ project: ProjectSummary }> = ({ project }) => (
    <div className="bg-slate-800/50 rounded-lg shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:shadow-purple-900/50 hover:-translate-y-1 border border-slate-700">
        <div className="h-48 bg-slate-700">
            <img src={project.previewImageUrl || '/images/social-share.png'} alt={project.name} className="w-full h-full object-cover" />
        </div>
        <div className="p-4 flex-grow flex flex-col">
            <h3 className="font-semibold text-slate-100 truncate flex-grow" title={project.name}>{project.name}</h3>
            <p className="text-xs text-slate-400">by {project.userId?.name || 'Anonymous'}</p>
            <div className="flex justify-between items-center my-3">
                <span className="text-sm font-bold text-green-400">18% <span className="text-xs font-normal text-slate-400">Est. ROI</span></span>
                <span className="text-sm font-bold text-sky-400">{project.tokenization?.pricePerToken || 'N/A'} Cr / token</span>
            </div>
            <button
                disabled
                className="w-full mt-auto px-4 py-2 text-sm font-semibold rounded-md bg-slate-600 cursor-not-allowed"
                title="Investment features will be enabled after regulatory approvals and blockchain integration."
            >
                Invest (Coming Soon)
            </button>
        </div>
    </div>
);

const ExchangeStat: React.FC<{ label: string, value: string }> = ({ label, value }) => (
    <div className="bg-slate-900/50 p-4 rounded-lg">
        <p className="text-sm text-slate-400">{label}</p>
        <p className="text-3xl font-bold text-purple-300">{value}</p>
    </div>
);

const RealEstateExchangeView: React.FC = () => {
    const [listings, setListings] = useState<ProjectSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;
        projectService.getExchangeListingsApi()
            .then(data => { if (isMounted) setListings(data); })
            .catch(err => { if (isMounted) setError(err.message || "Could not load the exchange."); })
            .finally(() => { if (isMounted) setIsLoading(false); });
        
        return () => { isMounted = false; };
    }, []);

    const totalValueLocked = listings.reduce((acc, p) => acc + (p.tokenization?.totalTokens || 0) * (p.tokenization?.pricePerToken || 0), 0);

    return (
        <div className="flex-grow animated-gradient-bg-studio">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">Real Estate Exchange</h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">The future of real estate investment. Buy and sell fractional ownership in AI-vetted projects before they're built.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-12">
                    <ExchangeStat label="Total Value Locked" value={`${(totalValueLocked / 1000).toFixed(1)}k Credits`} />
                    <ExchangeStat label="Active Listings" value={listings.length.toString()} />
                </div>
                
                {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
                {error && <p className="text-center text-red-400">{error}</p>}

                {!isLoading && !error && (
                    listings.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {listings.map(project => (
                                <TokenCard key={project.id} project={project} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 text-slate-400 bg-slate-800/30 rounded-lg">
                           <p>No projects have been tokenized for the exchange yet.</p>
                        </div>
                    )
                )}

                 <div className="text-center mt-16 p-6 bg-slate-800/50 rounded-lg border border-purple-500/50">
                    <h2 className="text-2xl font-bold text-purple-300">Blockchain Integration Coming Soon</h2>
                    <p className="text-slate-400 mt-2">Our team is developing a secure, transparent, and decentralized platform for real estate tokenization. Stay tuned for updates.</p>
                </div>
            </div>
        </div>
    );
};

export default RealEstateExchangeView;