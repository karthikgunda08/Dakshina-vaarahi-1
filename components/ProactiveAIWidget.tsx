// src/components/ProactiveAIWidget.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../state/appStore';
import { ProactiveSuggestion } from '../types/index';

const MotionDiv = motion.div as any;

const SuggestionCard: React.FC<{ suggestion: ProactiveSuggestion }> = ({ suggestion }) => {
    const { dismissProactiveSuggestion } = useAppStore();
    const store = useAppStore();

    const handleCtaClick = () => {
        if (suggestion.cta) {
            suggestion.cta.action(store);
        }
        dismissProactiveSuggestion(suggestion.id);
    };

    return (
        <MotionDiv
            layout
            initial={{ opacity: 0, y: 50, scale: 0.3 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
            className="w-full max-w-sm p-4 bg-slate-800/80 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700"
        >
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 text-xl pt-1">💡</div>
                <div className="flex-grow">
                    <h4 className="font-bold text-amber-300">{suggestion.title}</h4>
                    <p className="text-sm text-slate-200 mt-1">{suggestion.message}</p>
                    <div className="mt-3 flex gap-2">
                        {suggestion.cta && (
                            <button
                                onClick={handleCtaClick}
                                className="px-3 py-1 text-xs font-semibold bg-sky-600 hover:bg-sky-500 rounded-md text-white"
                            >
                                {suggestion.cta.label}
                            </button>
                        )}
                        <button
                            onClick={() => dismissProactiveSuggestion(suggestion.id)}
                            className="px-3 py-1 text-xs font-semibold bg-slate-600 hover:bg-slate-500 rounded-md text-slate-300"
                        >
                            Dismiss
                        </button>
                    </div>
                </div>
            </div>
        </MotionDiv>
    );
};

const ProactiveAIWidget: React.FC = () => {
    const suggestions = useAppStore(state => state.proactiveSuggestions);

    if (suggestions.length === 0) {
        return null;
    }

    return (
        <div className="fixed bottom-24 right-6 z-[70] w-full max-w-sm">
             <AnimatePresence>
                {suggestions.map(suggestion => (
                    <SuggestionCard key={suggestion.id} suggestion={suggestion} />
                ))}
            </AnimatePresence>
        </div>
    );
};

export default ProactiveAIWidget;
