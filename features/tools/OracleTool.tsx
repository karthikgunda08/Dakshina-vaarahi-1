// src/features/tools/OracleTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, OracleAnalysisResponse, ProjectData } from '../../types/index';
import { runOracleAnalysisApi } from '../../services/geminiService';
import { GenericApiTool } from './misc/GenericApiTool';

const renderOracleResult = (result: OracleAnalysisResponse) => (
    <div className="mt-4 p-4 bg-slate-700/50 rounded-lg space-y-4">
        <div className="prose prose-sm prose-invert max-w-none text-slate-200 whitespace-pre-wrap">
            {result.text}
        </div>
        {result.sources && result.sources.length > 0 && (
            <div className="border-t border-slate-600 pt-3">
                <h5 className="font-semibold text-slate-200 mb-2">Sources</h5>
                <ul className="space-y-1 text-xs list-disc list-inside">
                   {result.sources.map((source, i) => (
                        <li key={i}>
                            <a href={source.web.uri} target="_blank" rel="noopener noreferrer" className="text-sky-400 hover:underline">{source.web.title || source.web.uri}</a>
                        </li>
                    ))}
                </ul>
            </div>
        )}
    </div>
);


export const OracleTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentProject } = props;
    const [location, setLocation] = useState(currentProject?.location || '');
    const [question, setQuestion] = useState('');
    
    return (
        <GenericApiTool
            {...props}
            toolName="Oracle AI Analysis"
            description="Ask financial, market, or performance questions about your project. The Oracle uses real-world data via Google Search to provide grounded answers."
            creditCost={15}
            icon="🔮"
            apiFn={runOracleAnalysisApi}
            buildPayload={(p): [ProjectData, string, string] | null => {
                if (!location.trim() || !question.trim()) {
                    p.addNotification('Please provide a project location and a question.', 'error');
                    return null;
                }
                const projectData: ProjectData = { projectType: p.currentProject?.projectType || 'building', levels: p.levels, planNorthDirection: p.planNorthDirection, propertyLines: p.propertyLines, terrainMesh: p.terrainMesh, zones: [], infrastructure: [] };
                return [
                     projectData,
                     location,
                     question
                ];
            }}
            onSuccess={(result) => { /* Handled locally */ }}
            buttonText="Run Predictive Analysis"
            renderResult={renderOracleResult}
        >
            <div className="space-y-4 mb-4">
                 <div>
                    <label htmlFor="location-input" className="block text-sm font-medium text-slate-300 mb-1">Project Location</label>
                    <input type="text" id="location-input" value={location} onChange={e => setLocation(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" placeholder="e.g., Mumbai, India" />
                </div>
                 <div>
                    <label htmlFor="question-input" className="block text-sm font-medium text-slate-300 mb-1">Your Question</label>
                    <textarea id="question-input" rows={3} value={question} onChange={e => setQuestion(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" placeholder="e.g., Estimated cost for this design, or 'इस डिज़ाइन की अनुमानित लागत क्या है?'"/>
                </div>
            </div>
        </GenericApiTool>
    );
};
