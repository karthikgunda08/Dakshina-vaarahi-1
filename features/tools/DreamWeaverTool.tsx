
// src/features/tools/DreamWeaverTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, MultiConceptResponse, MasterArchitectResponse } from '../../types/index';
import { generateMultiConceptApi } from '../../services/geminiService';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { CreditCostDisplay } from '../../components/common/CreditCostDisplay';

const TabButton: React.FC<{ isActive: boolean, onClick: () => void, children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`py-2 px-3 text-sm font-medium border-b-2 transition-colors flex-grow ${isActive ? 'border-pink-400 text-pink-300' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {children}
    </button>
);

export const DreamWeaverTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { pushToUndoStack, setLevels, addNotification, currentProject, setLastAiToolRun } = props;
    const [prompt, setPrompt] = useState('A modern 2-story villa with an infinity pool and large glass windows.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<MultiConceptResponse | null>(null);
    const [activeTab, setActiveTab] = useState(0);

    const handleGenerate = async () => {
        if (!prompt.trim()) {
            addNotification("Please enter a prompt.", 'error');
            return;
        }
        setIsLoading(true);
        setError(null);
        setResult(null);
        try {
            const response = await generateMultiConceptApi(currentProject?.id || '', prompt);
            setResult(response);
            setActiveTab(0);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const applyConcept = (concept: MasterArchitectResponse) => {
        pushToUndoStack();
        setLevels(concept.projectData.levels || []);
        addNotification(`Applied '${concept.summary.substring(0, 20)}...' concept.`, "success");
        setLastAiToolRun('DreamWeaver');
    };

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">DreamWeaver Engine</h3>
            <p className="text-sm text-slate-300 my-3">Explore multiple design directions from a single prompt. The AI will generate concepts from different architectural personas.</p>
            <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100"
                placeholder="Describe your vision..."
                disabled={isLoading}
            />
            <button
                onClick={handleGenerate}
                disabled={isLoading || !prompt.trim()}
                className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">🌌</span>}
                <span className="flex-grow">{isLoading ? 'Weaving Dreams...' : 'Generate Concepts'}</span>
                <CreditCostDisplay cost={80} />
            </button>

            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}

            {result && (
                <div className="mt-4 bg-slate-700/50 rounded-lg">
                    <div className="flex border-b border-slate-600">
                        {result.map((item, index) => (
                            <TabButton key={index} isActive={activeTab === index} onClick={() => setActiveTab(index)}>
                                {item.persona}
                            </TabButton>
                        ))}
                    </div>
                    <div className="p-3">
                        {result[activeTab] && (
                            <div>
                                <p className="text-sm text-slate-300 italic mb-2">"{result[activeTab].concept.summary}"</p>
                                <img src={result[activeTab].concept.previewRender.imageUrl} alt={`${result[activeTab].persona} concept`} className="w-full rounded-md mb-2" />
                                <button
                                    onClick={() => applyConcept(result[activeTab].concept)}
                                    className="w-full py-2 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold"
                                >
                                    Apply this Concept
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};