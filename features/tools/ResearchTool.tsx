
// src/features/tools/ResearchTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, AiResearchResponse } from '../../types/index';
import { researchWithGoogleApi } from '../../services/geminiService';
import { GenericApiTool } from './misc/GenericApiTool';

const renderResearchResult = (result: AiResearchResponse) => (
     <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
        <div className="prose prose-sm prose-invert max-w-none text-slate-200 whitespace-pre-wrap">
            {result.text}
        </div>
        {result.sources && result.sources.length > 0 && (
            <div className="mt-4 border-t border-slate-600 pt-2">
                <h5 className="text-xs font-semibold text-slate-400 mb-1">Sources:</h5>
                <ul className="text-xs list-disc list-inside text-sky-400 space-y-1">
                    {result.sources.map((source, i) => (
                        <li key={i}>
                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="hover:underline">{source.web.title || source.web.uri}</a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);

export const ResearchTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const [prompt, setPrompt] = useState('');
    
    return (
        <GenericApiTool
            {...props}
            toolName="AI Research Assistant"
            description="Ask your AI Research Assistant anything related to architecture, engineering, materials, or building codes."
            creditCost={1}
            icon="🌐"
            apiFn={researchWithGoogleApi}
            buildPayload={(p) => {
                if (!prompt.trim()) {
                    p.addNotification('Please enter a research query.', 'error');
                    return null;
                }
                return [prompt];
            }}
            onSuccess={(result) => { /* Handled locally */ }}
            buttonText="Ask"
            renderResult={renderResearchResult}
        >
            <div className="flex gap-2 mb-4">
                <input 
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && document.getElementById('generic-tool-button')?.click()}
                    className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                    placeholder="e.g., Benefits of CLT, or 'CLT के क्या फायदे हैं?'"
                />
            </div>
        </GenericApiTool>
    );
};