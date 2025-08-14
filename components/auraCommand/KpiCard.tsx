
// src/components/auraCommand/KpiCard.tsx
import React from 'react';

interface KpiCardProps {
    title: string;
    value: string | number;
    icon: string;
}

export const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon }) => {
    return (
        <div className="bg-slate-800/70 p-6 rounded-lg border border-slate-700 shadow-lg flex items-center gap-4 transition-all duration-300 hover:scale-105 hover:shadow-primary/20 hover:border-slate-600">
            <div className="text-4xl bg-slate-700 p-3 rounded-lg">{icon}</div>
            <div>
                <p className="text-sm text-slate-400">{title}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </div>
    );
};