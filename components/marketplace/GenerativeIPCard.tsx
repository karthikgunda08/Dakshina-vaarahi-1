// src/components/marketplace/GenerativeIPCard.tsx
import React from 'react';
import { GenerativeIP } from '../../types/index';
import { Button } from '../ui/Button';

interface GenerativeIPCardProps {
    ip: GenerativeIP;
}

export const GenerativeIPCard: React.FC<GenerativeIPCardProps> = ({ ip }) => {
    return (
        <div className="bg-slate-800/50 rounded-lg shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:shadow-purple-900/50 hover:-translate-y-1 border border-slate-700">
            <div className="h-48 bg-slate-700">
                <img src={ip.thumbnailUrl} alt={ip.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4 flex-grow flex flex-col">
                <h3 className="font-semibold text-slate-100" title={ip.name}>
                    {ip.name}
                </h3>
                 <div className="text-xs text-slate-400 mt-1 mb-2">
                    by <span className="hover:text-sky-300">{ip.author}</span>
                </div>
                <p className="text-sm text-slate-300 flex-grow">{ip.description}</p>
                 <Button disabled className="w-full mt-3">
                    Buy for {ip.price} credits (Coming Soon)
                </Button>
            </div>
        </div>
    );
};
