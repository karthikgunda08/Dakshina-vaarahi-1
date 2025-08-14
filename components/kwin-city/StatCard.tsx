// src/components/kwin-city/StatCard.tsx
import React from 'react';

interface StatCardProps {
    label: string;
    value: string;
    unit: string;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, unit }) => {
    return (
        <div className="bg-slate-900/50 p-3 rounded-md text-center">
            <p className="text-2xl font-bold text-primary">{value}</p>
            <p className="text-xs text-slate-400">{label}</p>
            <p className="text-xs text-slate-500 -mt-1">{unit}</p>
        </div>
    );
};
