// src/features/tools/SamaranganTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, SamaranganSolution } from '../../types/index';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCostDisplay } from '../../components/common/CreditCostDisplay';

const MotionDiv = motion.div as any;

const SolutionCard: React.FC<{ solution: SamaranganSolution, onApply: () => void, isLoading: boolean }> = ({ solution, onApply, isLoading }) => {
    return (
        <MotionDiv
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="p-4 bg-slate-900/50 rounded-lg border border-slate-700"
        >
            <p className="font-semibold text-sky-300 mb-3">{solution.description}</p>
            <div className="grid grid-cols-2 gap-2 text-xs mb-4">
                <div title={solution.impactAnalysis.cost}><strong>Cost:</strong> <span className="text-slate-300 truncate">{solution.impactAnalysis.cost}</span></div>
                <div title={solution.impactAnalysis.structural}><strong>Structure:</strong> <span className="text-slate-300 truncate">{solution.impactAnalysis.structural}</span></div>
                <div title={solution.impactAnalysis.vastu}><strong>Vastu:</strong> <span className="text-slate-300 truncate">{solution.impactAnalysis.vastu}</span></div>
                <div title={solution.impactAnalysis.sustainability}><strong>Sustainability:</strong> <span className="text-slate-300 truncate">{solution.impactAnalysis.sustainability}</span></div>
            </div>
            <button onClick={onApply} disabled={isLoading} className="w-full py-1 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold disabled:opacity-50">
                Apply this Solution
            </button>
        </MotionDiv>
    );
};

export const SamaranganTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const {
        proposeSamaranganFixes,
        applySamaranganFix,
        samaranganSolutions,
        setSamaranganSolutions,
        globalLoadingMessage,
    } = useAppStore();
    const [command, setCommand] = useState('');
    const [error, setError] = useState<string | null>(null);
    const isLoading = !!globalLoadingMessage?.includes('Adjudicating');

    const handlePropose = async () => {
        if (!command.trim()) return;
        setError(null);
        useAppStore.setState({ globalLoadingMessage: 'Adjudicating design options...' });
        try {
            await proposeSamaranganFixes(command);
        } catch (err: any) {
            setError(err.message);
        } finally {
            useAppStore.setState({ globalLoadingMessage: null });
        }
    };

    const handleApply = (solution: SamaranganSolution) => {
        applySamaranganFix(solution.fix);
        setCommand(''); // Clear command after applying
    };
    
    const handleClear = () => {
        setSamaranganSolutions(null);
        setCommand('');
        setError(null);
    }

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Samarangan: AI Design Adjudicator</h3>
            <p className="text-sm text-slate-300 my-3">
                Issue high-level commands to iterate on your design. The AI will analyze the context and propose multiple intelligent solutions with impact analyses for your review.
            </p>

            {!samaranganSolutions ? (
                <>
                    <textarea
                        value={command}
                        onChange={(e) => setCommand(e.target.value)}
                        rows={3}
                        className="w-full p-2 border border-slate-600 rounded-md bg-slate-700 text-slate-100 focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g., 'Make the master bedroom 20% larger' or 'Add a powder room near the entrance'"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handlePropose}
                        disabled={isLoading || !command.trim()}
                        className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
                    >
                        {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">⚖️</span>}
                        <span className="flex-grow">{isLoading ? 'Adjudicating...' : 'Propose Solutions'}</span>
                        <CreditCostDisplay cost={15} />
                    </button>
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                </>
            ) : (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h4 className="font-semibold text-lg text-slate-100">AI-Proposed Solutions</h4>
                        <button onClick={handleClear} className="text-xs text-sky-400 hover:underline">Start Over</button>
                    </div>
                    <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                         <AnimatePresence>
                             {samaranganSolutions.map((solution, index) => (
                                <SolutionCard key={index} solution={solution} onApply={() => handleApply(solution)} isLoading={isLoading} />
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};
