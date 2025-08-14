// src/components/marketplace/TemplateCard.tsx
import React, { useState } from 'react';
import { ProjectSummary } from '../../types/index';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface TemplateCardProps {
    template: ProjectSummary;
    onPurchase: (templateId: string) => Promise<void>;
}

export const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPurchase }) => {
    const { currentUser } = useAppStore();
    const [isPurchasing, setIsPurchasing] = useState(false);

    const handlePurchaseClick = async () => {
        setIsPurchasing(true);
        await onPurchase(template.id);
        setIsPurchasing(false);
    };

    const canAfford = currentUser && currentUser.credits >= (template.marketplace?.price || 0);

    return (
        <div className="bg-slate-800/50 rounded-lg shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:shadow-amber-900/50 hover:-translate-y-1 border border-slate-700">
            <div className="h-48 bg-slate-700">
                 {template.previewImageUrl ? (
                    <img src={template.previewImageUrl} alt={template.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-5xl opacity-50">
                        {template.projectType === 'masterPlan' ? '🗺️' : '🏢'}
                    </div>
                )}
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-slate-100 truncate flex-grow" title={template.name}>
                    {template.name}
                </h3>
                <div className="text-xs text-slate-400 mt-1 mb-3">
                    by <a href={`/profiles/${template.userId?.id}`} className="hover:text-sky-300">{template.userId?.name || 'Anonymous'}</a>
                </div>
                
                 <button 
                    onClick={handlePurchaseClick}
                    disabled={isPurchasing || !currentUser || !canAfford}
                    className="w-full mt-auto px-4 py-2 text-sm font-semibold rounded-md bg-amber-600 hover:bg-amber-500 text-white disabled:bg-slate-600 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                    {isPurchasing ? <LoadingSpinner size="h-5 w-5" /> : (
                        <>
                           <span className="mr-2">Buy for</span>
                           <span>{template.marketplace?.price || 0}</span>
                           <span className="text-amber-200 ml-1">credits</span>
                        </>
                    )}
                </button>
                 {!canAfford && currentUser && (
                    <p className="text-xs text-center mt-1 text-red-400">Insufficient credits</p>
                )}
            </div>
        </div>
    );
};