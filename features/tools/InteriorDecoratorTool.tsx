// src/features/tools/InteriorDecoratorTool.tsx
import React, { useState, useRef } from 'react';
import { PhoenixEnginePanelProps, InteriorSchemeResponse } from '../../types/index';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import * as geminiService from '../../services/geminiService';
import { CreditCostDisplay } from '../../components/common/CreditCostDisplay';
import { useAppStore } from '../../state/appStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../../components/ui/Input';

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

const PhotoStagingTool: React.FC<PhoenixEnginePanelProps> = ({ currentProject }) => {
    const { currentUser, setBuyCreditsModalOpen, refreshCurrentUser } = useAppStore();
    const { addNotification } = useNotificationStore();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [emptiedImage, setEmptiedImage] = useState<string | null>(null);
    const [stagedImage, setStagedImage] = useState<string | null>(null);
    const [style, setStyle] = useState('modern minimalist');
    const [isLoading, setIsLoading] = useState<'analyzing' | 'emptying' | 'staging' | null>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !currentProject) return;
        
        setOriginalImage(null);
        setEmptiedImage(null);
        setStagedImage(null);

        const reader = new FileReader();
        reader.onload = async (e) => {
            const dataUrl = e.target?.result as string;
            setOriginalImage(dataUrl);
            const base64Image = dataUrl.split(',')[1];
            
            if (!currentUser) return;
            if (currentUser.role !== 'owner' && currentUser.credits < 5) {
                addNotification('You need 5 credits for style analysis.', 'info');
                setBuyCreditsModalOpen(true);
                return;
            }

            setIsLoading('analyzing');
            try {
                const { style: analyzedStyle } = await geminiService.analyzeStyleFromImageApi(currentProject.id, base64Image, file.type);
                setStyle(analyzedStyle);
                addNotification("Style analysis complete!", "success");
                await refreshCurrentUser();
            } catch (err: any) {
                addNotification(err.message, "error");
            } finally {
                setIsLoading(null);
            }
        };
        reader.readAsDataURL(file);
    };
    
    const handleEmptyRoom = async () => {
        if (!originalImage || !currentProject || !currentUser) return;
        if (currentUser.role !== 'owner' && currentUser.credits < 25) {
             addNotification('You need 25 credits to empty a room.', 'info');
             setBuyCreditsModalOpen(true);
             return;
        }
        setIsLoading('emptying');
        try {
            const base64Image = originalImage.split(',')[1];
            const mimeType = originalImage.substring(originalImage.indexOf(':') + 1, originalImage.indexOf(';'));
            const { imageUrl } = await geminiService.emptyRoomApi(currentProject.id, base64Image, mimeType);
            setEmptiedImage(imageUrl);
            await refreshCurrentUser();
        } catch(err: any) {
             addNotification(err.message, "error");
        } finally {
            setIsLoading(null);
        }
    };

    const handleStageRoom = async () => {
        if (!emptiedImage || !currentProject || !currentUser) return;
        if (currentUser.role !== 'owner' && currentUser.credits < 20) {
             addNotification('You need 20 credits to stage a room.', 'info');
             setBuyCreditsModalOpen(true);
             return;
        }
        setIsLoading('staging');
        try {
            const base64Image = emptiedImage.split(',')[1];
            const mimeType = emptiedImage.substring(emptiedImage.indexOf(':') + 1, emptiedImage.indexOf(';'));
            const { imageUrl } = await geminiService.stageRoomApi(currentProject.id, base64Image, mimeType, style);
            setStagedImage(imageUrl);
            await refreshCurrentUser();
        } catch(err: any) {
             addNotification(err.message, "error");
        } finally {
            setIsLoading(null);
        }
    }


    return (
        <div className="p-4 bg-slate-900/50 rounded-lg border border-dashed border-slate-600 space-y-4">
            <h4 className="font-semibold text-amber-300">Aura Instant Staging</h4>
             <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
             <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!!isLoading}
                className="w-full px-4 py-2 text-sm text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-amber-600 hover:bg-amber-500"
            >
                {isLoading === 'analyzing' ? <LoadingSpinner size="h-5 w-5 mr-2" /> : '✨'}
                <span className="flex-grow">{isLoading === 'analyzing' ? 'Analyzing...' : 'Upload Photo & Analyze Style'}</span>
                <CreditCostDisplay cost={5} />
            </button>
            <AnimatePresence>
            {originalImage && (
                <MotionDiv initial={{opacity: 0, height: 0}} animate={{opacity: 1, height: 'auto'}} exit={{opacity: 0, height: 0}} className="space-y-4 overflow-hidden">
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <label className="text-xs font-semibold text-slate-400">Original</label>
                            <img src={originalImage} alt="Original" className="w-full aspect-square object-cover rounded mt-1" />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-400">Emptied</label>
                             {emptiedImage ? (
                                <img src={emptiedImage} alt="Emptied" className="w-full aspect-square object-cover rounded mt-1" />
                            ) : (
                                <div className="w-full aspect-square flex items-center justify-center bg-slate-800 rounded mt-1">
                                    {isLoading === 'emptying' && <LoadingSpinner />}
                                </div>
                            )}
                        </div>
                    </div>
                    <button onClick={handleEmptyRoom} disabled={!!isLoading || !!emptiedImage} className="w-full text-sm p-2 rounded-md bg-sky-600 hover:bg-sky-500 disabled:bg-slate-600">
                        Empty Room (25 Cr)
                    </button>
                    {emptiedImage && (
                         <div className="space-y-2 pt-2 border-t border-slate-700">
                            <label className="text-sm font-medium">Refurnish Style</label>
                            <Input value={style} onChange={e => setStyle(e.target.value)} disabled={!!isLoading} />
                            <button onClick={handleStageRoom} disabled={!!isLoading} className="w-full text-sm p-2 rounded-md bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600">
                                Stage Room (20 Cr)
                            </button>
                            {stagedImage && <img src={stagedImage} alt="Staged" className="w-full rounded mt-2" />}
                         </div>
                    )}
                </MotionDiv>
            )}
            </AnimatePresence>
        </div>
    );
};


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
            <PhotoStagingTool {...props} />

            <div className="relative text-center my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative inline-block px-2 bg-slate-800 text-xs text-slate-500">OR</div>
            </div>

            <h3 className="text-lg font-bold text-sky-300">AI Interior Decorator (for Digital Model)</h3>
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
                <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
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
                </div>
            )}
        </div>
    );
};