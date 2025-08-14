
// src/components/auraCommand/SupportInsightsTool.tsx
import React, { useState } from 'react';
import * as adminService from '../../services/adminService';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { ProjectSummary } from '../../types/index';

interface SupportInsightsToolProps {
    projects: ProjectSummary[];
}

interface Insights {
    topIssues: { topic: string; mentions: number }[];
    topSuggestions: { topic: string; mentions: number }[];
}

export const SupportInsightsTool: React.FC<SupportInsightsToolProps> = ({ projects }) => {
    const [insights, setInsights] = useState<Insights | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setInsights(null);
        try {
            // Pass a few project names for context
            const projectNames = projects.slice(0, 5).map(p => p.name);
            const result = await adminService.analyzeSupportIssuesApi(projectNames);
            setInsights(result);
        } catch (error: any) {
            // Handle error display
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h3 className="text-lg font-semibold text-slate-200">AI Support Insights</h3>
            <p className="text-sm text-slate-400 mb-4">Analyze common user feedback patterns to identify top issues and feature requests. (This uses placeholder data for demonstration).</p>
            <button
                onClick={handleAnalyze}
                disabled={isLoading}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold text-white disabled:opacity-50"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Generate Insights'}
            </button>
            
            {insights && (
                 <div className="mt-4 grid md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/50 rounded-lg">
                        <h4 className="font-semibold text-amber-300 mb-2">Top Issues</h4>
                        <ul className="space-y-1 text-sm text-slate-300">
                            {insights.topIssues.map(issue => (
                                <li key={issue.topic}>{issue.topic} ({issue.mentions} mentions)</li>
                            ))}
                        </ul>
                    </div>
                     <div className="p-4 bg-slate-900/50 rounded-lg">
                        <h4 className="font-semibold text-sky-300 mb-2">Top Suggestions</h4>
                        <ul className="space-y-1 text-sm text-slate-300">
                             {insights.topSuggestions.map(sugg => (
                                <li key={sugg.topic}>{sugg.topic} ({sugg.mentions} mentions)</li>
                            ))}
                        </ul>
                    </div>
                 </div>
            )}
        </div>
    );
};