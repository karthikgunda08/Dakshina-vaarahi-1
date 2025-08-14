// src/components/kwin-city/InfoPanel.tsx
import React from 'react';
import { StatCard } from './StatCard';
import { Button } from '../ui/Button';

export const InfoPanel: React.FC = () => {
    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700 h-full flex flex-col">
            <h2 className="text-2xl font-bold text-sky-300 mb-6">City Vitals</h2>
            <div className="grid grid-cols-2 gap-4 flex-grow">
                <StatCard label="Total Area" value="40,000" unit="Acres" />
                <StatCard label="Population" value="500,000" unit="Citizens" />
                <StatCard label="Green Space" value="35%" unit="Allocation" />
                <StatCard label="Residential" value="45%" unit="Zoning" />
                <StatCard label="Commercial" value="15%" unit="Zoning" />
                <StatCard label="Infrastructure" value="5%" unit="Zoning" />
            </div>

            <div className="mt-8">
                <Button
                    size="lg"
                    className="w-full font-semibold text-lg premium-glow"
                >
                    Showcase Details
                </Button>
            </div>
        </div>
    );
};
