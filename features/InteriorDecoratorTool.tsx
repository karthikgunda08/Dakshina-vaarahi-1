
// src/features/InteriorDecoratorTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps, InteriorSchemeResponse } from '../types/index';
import { useNotificationStore } from '../state/notificationStore';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { CreditCostDisplay } from '../components/common/CreditCostDisplay';
import { useAppStore } from '../state/appStore';
import { motion } from 'framer-motion';

const MotionDiv = motion.div as any;

const ResultCard: React.FC<{ icon: string; title: string; justification: string; }> = ({ icon, title, justification }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg flex items-start gap-3">
        <div className="text-2xl mt-1">{icon}</div>
        <div>
            <h5 className="font-semibold text-slate-100">{title}</h5>
            <p className="text-xs text-slate-400 italic">"{justification}"</p>
        </div>
    </div>
);

export const InteriorDecoratorTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, levels, activeLevelIndex, setBuyCreditsModalOpen, atmanSignature, runAiFurnishRoom } = useAppStore();
    const [selectedRoomId, setSelectedRoomId] = useState<string>('');
    const [style, setStyle] = useState('modern minimalist');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [result, setResult] = useState<InteriorSchemeResponse | null>(null);
    const [useAtman, setUseAtman] = useState(false);
    const { addNotification } = useNotificationStore();
    const activeLevel = levels[activeLevelIndex];
    const activeLevelRooms = activeLevel?.rooms || [];

    const handleGenerate = async () => {
        if (!selectedRoomId || !style) {
            addNotification("Please select a room and define a style.", "error");
            return;
        }

        if (!currentUser) {
            addNotification("Please log in to use this feature.", "error");
            return;
        }
        const creditCost = useAtman ? 15 : 10;
        if (currentUser.role !== 'owner' && currentUser.credits < creditCost) {
            addNotification(`You need ${creditCost} credits. You have ${currentUser.credits}.`, "info");
            setBuyCreditsModalOpen(true);
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const signatureToUse = useAtman ? atmanSignature || undefined : undefined;
            const response = await runAiFurnishRoom(selectedRoomId, style, signatureToUse, false); // false for generateOnly
            if (response) {
                setResult(response);
                addNotification("Interior scheme generated! Review and apply.", "success");
            }
        } catch (err: any) {
            setError(err.message);
            addNotification(err.message, "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    const applyScheme = async () => {
        if (!result) return;
        setIsLoading(true);
        try {
            await runAiFurnishRoom(selectedRoomId, style, useAtman ? atmanSignature || undefined : undefined, true, result); // true for applyPlacement
            addNotification("AI scheme has been placed in the room!", "success");
            setResult(null); // Clear results after applying
        } catch (err: any) {
             addNotification(`Failed to apply scheme: ${err.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-sky-300">AI Interior Decorator (3D Model)</h3>
            <p className="text-sm text-slate-300 -mt-2 mb-3">
                Automatically furnish your digital 3D model based on a style prompt. The AI will select and place furniture, lighting, decor, and materials.
            </p>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Select Room</label>
                <select value={selectedRoomId} onChange={e => setSelectedRoomId(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white">
                    <option value="">-- Choose a room --</option>
                    {activeLevelRooms.map(room => <option key={room.id} value={room.id}>{room.name}</option>)}
                </select>
            </div>
             <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Design Style</label>
                <input type="text" value={style} onChange={e => setStyle(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white" placeholder="e.g., Scandinavian, Industrial, Boho..."/>
            </div>
            {atmanSignature && (
                <div className="flex items-center space-x-2">
                    <input type="checkbox" id="useAtman" checked={useAtman} onChange={e => setUseAtman(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary" />
                    <label htmlFor="useAtman" className="text-sm text-purple-200 flex items-center gap-2">Use Atman Signature <span className="text-xs text-slate-400">(+5 Credits)</span></label>
                </div>
            )}
             <button
                onClick={handleGenerate}
                disabled={isLoading || !selectedRoomId}
                className="w-full mt-2 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700"
            >
                {isLoading && !result ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">🎨</span>}
                <span className="flex-grow">{isLoading && !result ? 'Designing...' : 'Generate Interior Scheme'}</span>
                <CreditCostDisplay cost={useAtman ? 15 : 10} />
            </button>
            {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            {result && (
                <MotionDiv
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-3 bg-slate-700/50 rounded-lg"
                >
                    <h4 className="font-bold text-pink-300 mb-2">Generated Scheme</h4>
                    <p className="text-sm text-slate-300 italic mb-3">"{result.designNarrative}"</p>
                    
                    <button onClick={applyScheme} disabled={isLoading} className="w-full mb-3 p-3 text-sm bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold flex items-center justify-center">
                       {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : '✨'}
                       {isLoading ? 'Placing Items...' : 'Auto-Place All Items'}
                    </button>

                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                        <h5 className="text-sm font-semibold text-slate-200">Materials</h5>
                        <ResultCard icon="🎨" title="Flooring" justification={result.materials.floor.justification} />
                        <ResultCard icon="🖌️" title="Walls" justification={result.materials.primaryWall.justification} />
                        {result.materials.accentWall && <ResultCard icon="🧱" title="Accent Wall" justification={result.materials.accentWall.justification} />}
                        
                        {(result.furniture?.length || 0) > 0 && <h5 className="text-sm font-semibold text-slate-200 pt-2">Furniture</h5>}
                        {result.furniture?.map(item => <ResultCard key={item.modelKey} icon="🛋️" title={item.name} justification={item.justification || 'No justification provided.'} />)}
                        
                        {(result.lighting?.length || 0) > 0 && <h5 className="text-sm font-semibold text-slate-200 pt-2">Lighting</h5>}
                        {result.lighting?.map(item => <ResultCard key={item.modelKey} icon="💡" title={item.name} justification={item.justification || 'No justification provided.'} />)}

                        {(result.textiles?.length || 0) > 0 && <h5 className="text-sm font-semibold text-slate-200 pt-2">Textiles</h5>}
                        {result.textiles?.map(item => <ResultCard key={item.modelKey} icon="🧣" title={item.name} justification={item.justification || 'No justification provided.'} />)}
                        
                        {(result.decor?.length || 0) > 0 && <h5 className="text-sm font-semibold text-slate-200 pt-2">Decor</h5>}
                        {result.decor?.map(item => <ResultCard key={item.modelKey} icon="🪴" title={item.name} justification={item.justification || 'No justification provided.'} />)}
                    </div>
                </MotionDiv>
            )}
        </div>
    );
};
