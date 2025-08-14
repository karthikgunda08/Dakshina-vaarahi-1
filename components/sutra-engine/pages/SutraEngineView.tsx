// src/features/sutra-engine/pages/SutraEngineView.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../../state/appStore';
import { SutraAction, Sutra } from '../../../types/index';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

const MotionDiv = motion.div as any;
const MotionP = motion.p as any;

const AVAILABLE_ACTIONS: SutraAction[] = [
    { id: 'vastu', name: 'Run Vastu Analysis', description: 'Generates a Vastu compliance report.', creditCost: 10, icon: '🕉️' },
    { id: 'boq', name: 'Generate BoQ', description: 'Creates a Bill of Quantities for the project.', creditCost: 15, icon: '🧾' },
    { id: 'structure', name: 'Analyze Structure', description: 'Performs a preliminary structural analysis.', creditCost: 25, icon: '🏛️' },
    { id: 'sustainability', name: 'Analyze Sustainability', description: 'Generates a sustainability report.', creditCost: 10, icon: '🌿' },
    { id: 'render_living', name: 'Render Living Room', description: 'Generates one photorealistic render of the living room.', creditCost: 5, icon: '🖼️' },
    { id: 'render_master_bedroom', name: 'Render Master Bedroom', description: 'Generates one photorealistic render of the master bedroom.', creditCost: 5, icon: '🖼️' },
    { id: 'folio', name: 'Generate Folio', description: 'Creates an Architect\'s Folio presentation.', creditCost: 15, icon: '📖' },
];

const SutraBuilder: React.FC = () => {
    const { saveSutra } = useAppStore();
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedActions, setSelectedActions] = useState<string[]>([]);

    const handleToggleAction = (actionId: string) => {
        setSelectedActions(prev =>
            prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
        );
    };
    
    const handleSave = () => {
        if (!name || selectedActions.length === 0) {
            useAppStore.getState().addNotification("Please provide a name and select at least one action.", "error");
            return;
        }
        const newSutra: Omit<Sutra, '_id'> = { name, description, actions: selectedActions };
        saveSutra(newSutra);
        setName('');
        setDescription('');
        setSelectedActions([]);
    };
    
    const totalCost = selectedActions.reduce((acc, id) => {
        const action = AVAILABLE_ACTIONS.find(a => a.id === id);
        return acc + (action?.creditCost || 0);
    }, 0);

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-bold text-sky-300 mb-4">Sutra Composer</h2>
            <div className="space-y-4">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name your Sutra (e.g., 'Client Pitch Deck')" />
                <textarea value={description} onChange={e => setDescription(e.target.value)} rows={2} className="w-full p-2 bg-input rounded-md" placeholder="Describe what this workflow does..." />
                
                <div>
                    <h3 className="text-lg font-semibold text-slate-300 mb-2">Available Actions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {AVAILABLE_ACTIONS.map(action => (
                            <button key={action.id} onClick={() => handleToggleAction(action.id)} className={`p-3 text-left rounded-lg border-2 transition-colors ${selectedActions.includes(action.id) ? 'border-primary bg-primary/20' : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'}`}>
                                <div className="font-semibold text-white">{action.icon} {action.name}</div>
                                <div className="text-xs text-slate-400">{action.description} ({action.creditCost} Cr)</div>
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="flex justify-between items-center pt-4">
                    <div className="text-lg font-semibold">Total Cost: <span className="text-primary">{totalCost} Credits</span></div>
                    <Button onClick={handleSave} disabled={!name || selectedActions.length === 0}>Save Sutra</Button>
                </div>
            </div>
        </div>
    );
};

const SutraRunner: React.FC = () => {
    const { sutras, projects, executeSutra, runningSutraId, sutraExecutionLogs } = useAppStore();
    const [selectedSutraId, setSelectedSutraId] = useState<string>('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const isRunning = !!runningSutraId;

    return (
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
            <h2 className="text-2xl font-bold text-amber-300 mb-4">Sutra Executor</h2>
            <div className="grid md:grid-cols-2 gap-4">
                <select value={selectedSutraId} onChange={e => setSelectedSutraId(e.target.value)} className="w-full p-2 bg-input rounded-md">
                    <option value="">-- Select a Sutra --</option>
                    {sutras.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
                <select value={selectedProjectId} onChange={e => setSelectedProjectId(e.target.value)} className="w-full p-2 bg-input rounded-md">
                    <option value="">-- Select a Project --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
            </div>
            <Button onClick={() => executeSutra(selectedSutraId, selectedProjectId)} disabled={!selectedSutraId || !selectedProjectId || isRunning} className="w-full mt-4">
                {isRunning ? <LoadingSpinner /> : 'Execute Sutra'}
            </Button>

            {isRunning && (
                <div className="mt-4 p-4 bg-slate-900/50 rounded-lg">
                    <h4 className="font-semibold text-slate-300 mb-2">Execution Log:</h4>
                    <div className="font-mono text-xs text-slate-400 space-y-1 h-32 overflow-y-auto">
                        <AnimatePresence>
                            {sutraExecutionLogs.map((log, i) => (
                                <MotionP key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>{log}</MotionP>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
};


const SutraEngineView: React.FC = () => {
    const { loadSutras } = useAppStore();
    useEffect(() => { loadSutras() }, [loadSutras]);

    return (
        <div className="flex-grow animated-gradient-bg-studio py-16 md:py-24 overflow-y-auto h-full">
            <MotionDiv
                className="container mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">📜 The Sutra Engine</h1>
                    <p className="mt-4 text-lg text-slate-300 max-w-3xl mx-auto">Automate your genius. Chain AI actions into powerful, one-click workflows.</p>
                </header>
                <div className="grid lg:grid-cols-2 gap-8 items-start">
                    <SutraBuilder />
                    <SutraRunner />
                </div>
            </MotionDiv>
        </div>
    );
};

export default SutraEngineView;
