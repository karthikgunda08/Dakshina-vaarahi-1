
// src/components/auraCommand/BusinessAnalystTool.tsx
import React, { useState } from 'react';
import { KpiData } from '../../types/index';
import * as adminService from '../../services/adminService';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface BusinessAnalystToolProps {
    kpiData: KpiData;
}

export const BusinessAnalystTool: React.FC<BusinessAnalystToolProps> = ({ kpiData }) => {
    const [query, setQuery] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleAsk = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        setAnswer('');
        try {
            const result = await adminService.analyzeBusinessDataApi(query, kpiData);
            setAnswer(result.answer);
        } catch (error: any) {
            setAnswer(`Error: ${error.message}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-200">Ask your AI Business Analyst</h3>
            <p className="text-sm text-slate-400 mb-4">Ask questions in natural language about your platform's performance based on the current data.</p>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
                    placeholder="e.g., Which credit pack is the most popular?"
                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                />
                <button
                    onClick={handleAsk}
                    disabled={isLoading || !query.trim()}
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold text-white disabled:opacity-50"
                >
                    {isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Ask'}
                </button>
            </div>
            
            {answer && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-slate-300 whitespace-pre-wrap">{answer}</p>
                </div>
            )}
        </div>
    );
};