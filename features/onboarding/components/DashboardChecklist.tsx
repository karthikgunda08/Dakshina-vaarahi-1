// src/components/onboarding/DashboardChecklist.tsx
import React from 'react';
import { useAppStore } from '../../../state/appStore';
import { OnboardingChecklist } from '../../../types/index';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const checklistItems: { id: Extract<keyof OnboardingChecklist, string>; text: string; elementId?: string }[] = [
    { id: 'profileCompleted', text: 'Complete your profile' },
    { id: 'projectCreated', text: 'Create your first project', elementId: 'mission-step-1-target' },
    { id: 'aiToolUsed', text: 'Use any AI tool' },
    { id: 'versionSaved', text: 'Save a project version' },
];

const ChecklistItem: React.FC<{ text: string; isCompleted: boolean; elementId?: string }> = ({ text, isCompleted, elementId }) => (
    <div id={elementId} className="flex items-center gap-3">
        <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-colors ${isCompleted ? 'bg-green-500' : 'bg-slate-600'}`}>
            {isCompleted && <span className="text-white text-xs">✓</span>}
        </div>
        <span className={`transition-colors ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-200'}`}>
            {text}
        </span>
    </div>
);

const DashboardChecklist: React.FC = () => {
    const { onboardingChecklist, startInteractiveTutorial } = useAppStore();

    if (!onboardingChecklist) return null;

    const completedCount = checklistItems.filter(item => onboardingChecklist[item.id]).length;
    const totalCount = checklistItems.length;
    const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
    
    // Hide checklist once completed
    if (completedCount === totalCount) return null;

    return (
        <MotionDiv
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-slate-900/50 rounded-lg border border-slate-700"
        >
            <div className="flex justify-between items-center mb-3">
                <h4 className="font-semibold text-amber-300">Your First Mission</h4>
                <button onClick={() => startInteractiveTutorial()} className="text-xs text-sky-400 hover:underline">
                    Restart Guided Mission
                </button>
            </div>
            <div className="space-y-2 mb-4">
                {checklistItems.map(item => (
                    <ChecklistItem
                        key={item.id}
                        text={item.text}
                        isCompleted={onboardingChecklist[item.id]}
                        elementId={item.elementId}
                    />
                ))}
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2">
                <MotionDiv
                    className="bg-green-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                />
            </div>
        </MotionDiv>
    );
};

export default DashboardChecklist;