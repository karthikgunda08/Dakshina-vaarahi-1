// src/components/marketplace/MarketplaceView.tsx
import React, { useState, useEffect, Suspense } from 'react';
import { ProjectSummary, GenerativeIP } from '../../types/index';
import * as projectService from '../../services/projectService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { TemplateCard } from './TemplateCard';
import { useAppStore } from '../../state/appStore';
import { useNotificationStore } from '../../state/notificationStore';
import { GenerativeIPCard } from './GenerativeIPCard';
import { Button } from '../ui/Button';
import { GlobalSpinner } from '../GlobalSpinner';
const SubmitIPModal = React.lazy(() => import('./SubmitIPModal'));


// Mock data for Generative IP
const mockGenerativeIPs: GenerativeIP[] = [
  { id: 'ip_1', name: 'Parametric Jaali Facade', author: 'Studio Innovate', description: 'A fully parametric facade system that generates complex traditional Jaali patterns based on solar analysis.', price: 250, thumbnailUrl: '/images/mock-jaali.png' },
  { id: 'ip_2', name: 'Vastu Layout Optimizer', author: 'Design Harmony', description: 'An algorithmic component that automatically arranges rooms in a new plan for optimal Vastu compliance.', price: 400, thumbnailUrl: '/images/mock-vastu-ip.png' },
  { id: 'ip_3', name: 'Generative Courtyard System', author: 'Bio-Scapes', description: 'Generates multi-level, climate-responsive courtyard designs to enhance natural ventilation and light.', price: 300, thumbnailUrl: '/images/mock-courtyard.png' },
];

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-6 py-3 font-medium rounded-t-lg border-b-2 transition-colors ${
            isActive ? 'border-amber-400 text-amber-300' : 'border-transparent text-slate-400 hover:text-white'
        }`}
    >
        {children}
    </button>
);


export const MarketplaceView: React.FC = () => {
    const [templates, setTemplates] = useState<ProjectSummary[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'templates' | 'ip'>('templates');
    const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
    const { addNotification } = useNotificationStore();
    const { loadProject, refreshCurrentUser } = useAppStore();

    useEffect(() => {
        let isMounted = true;
        projectService.getMarketplaceTemplates()
            .then(data => { if (isMounted) setTemplates(data); })
            .catch(err => { if (isMounted) setError(err.message || "Could not load the marketplace."); })
            .finally(() => { if (isMounted) setIsLoading(false); });

        return () => { isMounted = false; };
    }, []);
    
    const handlePurchase = async (templateId: string) => {
        if (!window.confirm("Are you sure you want to purchase this template? The credit cost will be deducted from your account.")) {
            return;
        }
        try {
            const result = await projectService.buyMarketplaceTemplate(templateId);
            addNotification(result.message, 'success');
            await refreshCurrentUser();
            await loadProject(result.newProjectId);
        } catch (error: any) {
             addNotification(error.message, 'error');
        }
    }

    return (
         <div className="flex-grow animated-gradient-bg-studio">
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">Architect's Marketplace</h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">Acquire premium, ready-to-use project templates and powerful generative components designed by top architects.</p>
                </div>
                
                <div className="border-b border-slate-700 mb-8 flex flex-col sm:flex-row justify-center items-center gap-4">
                     <nav className="flex space-x-4">
                        <TabButton isActive={activeTab === 'templates'} onClick={() => setActiveTab('templates')}>Project Templates</TabButton>
                        <TabButton isActive={activeTab === 'ip'} onClick={() => setActiveTab('ip')}>Generative IP</TabButton>
                    </nav>
                     <Button onClick={() => setIsSubmitModalOpen(true)} className="sm:ml-auto" variant="outline">
                        Sell on Marketplace
                    </Button>
                </div>


                {isLoading && <div className="flex justify-center p-8"><LoadingSpinner /></div>}
                {error && <p className="text-center text-red-400">{error}</p>}
                
                 {!isLoading && !error && (
                    <>
                    {activeTab === 'templates' && (
                        templates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {templates.map(template => (
                                    <TemplateCard 
                                        key={template.id} 
                                        template={template} 
                                        onPurchase={handlePurchase}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-16 text-slate-400">
                               <p>The marketplace is brand new. No templates have been published yet.</p>
                            </div>
                        )
                    )}
                    {activeTab === 'ip' && (
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {mockGenerativeIPs.map(ip => (
                                <GenerativeIPCard key={ip.id} ip={ip} />
                            ))}
                        </div>
                    )}
                    </>
                )}
            </div>
            {isSubmitModalOpen && (
                <Suspense fallback={<GlobalSpinner message="Loading..." />}>
                    <SubmitIPModal isOpen={isSubmitModalOpen} onClose={() => setIsSubmitModalOpen(false)} />
                </Suspense>
            )}
        </div>
    );
};

export default MarketplaceView;
