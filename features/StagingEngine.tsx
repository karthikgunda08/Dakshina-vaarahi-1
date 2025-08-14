
// src/features/StagingEngine.tsx
import React, { useState, useRef } from 'react';
import { PhoenixEnginePanelProps, TimeOfDay, StagingSettings } from '../types/index';
import { useAppStore } from '../state/appStore';
import { useNotificationStore } from '../state/notificationStore';
import * as geminiService from '../services/geminiService';
import { AnimatePresence, motion } from 'framer-motion';
import { Input } from '../components/ui/Input';
import { CreditCostDisplay } from '../components/common/CreditCostDisplay';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const MotionDiv = motion.div as any;

const Slider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }> = ({ label, value, min, max, step, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">{label}</label>
        <div className="flex items-center gap-2">
            <input type="range" min={min} max={max} step={step} value={value} onChange={onChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer" />
            <span className="text-xs font-mono text-slate-400 w-12 text-right">{value.toFixed(0)}</span>
        </div>
    </div>
);

const RadioButtonGroup: React.FC<{ label: string; options: { value: TimeOfDay; label: string }[]; selected: TimeOfDay; onChange: (value: TimeOfDay) => void }> = ({ label, options, selected, onChange }) => (
    <div>
        <label className="block text-sm font-medium text-slate-300 mb-2">{label}</label>
        <div className="flex gap-2">
            {options.map(opt => (
                <button
                    key={opt.value}
                    onClick={() => onChange(opt.value)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-colors ${selected === opt.value ? 'bg-sky-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    </div>
);

const AuraInstantStaging: React.FC<PhoenixEnginePanelProps> = ({ currentProject }) => {
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
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-sky-300">Aura Instant Staging (Photo)</h3>
            <p className="text-sm text-slate-300 -mt-2">
                Virtually stage real photos. Upload a picture of an empty or furnished room, and the AI will refurnish it based on your style.
            </p>
             <div className="p-4 bg-slate-900/50 rounded-lg border border-dashed border-slate-600 space-y-4">
                <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />
                <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!!isLoading}
                    className="w-full px-4 py-2 text-sm text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-amber-600 hover:bg-amber-500"
                >
                    {isLoading === 'analyzing' ? <LoadingSpinner size="h-5 w-5 mr-2" /> : '✨'}
                    <span className="flex-grow">{isLoading === 'analyzing' ? 'Analyzing...' : '1. Upload Photo & Analyze Style'}</span>
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
                            2. Empty Room <CreditCostDisplay cost={25} />
                        </button>
                        {emptiedImage && (
                            <div className="space-y-2 pt-2 border-t border-slate-700">
                                <label className="text-sm font-medium">Refurnish Style</label>
                                <Input value={style} onChange={e => setStyle(e.target.value)} disabled={!!isLoading} />
                                <button onClick={handleStageRoom} disabled={!!isLoading} className="w-full text-sm p-2 rounded-md bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600">
                                    3. Stage Room <CreditCostDisplay cost={20} />
                                </button>
                                {stagedImage && <img src={stagedImage} alt="Staged" className="w-full rounded mt-2" />}
                            </div>
                        )}
                    </MotionDiv>
                )}
                </AnimatePresence>
            </div>
        </div>
    );
};

const SceneLightingTool: React.FC<PhoenixEnginePanelProps> = ({ sunPosition, setSunPosition, stagingSettings, setStagingSettings }) => {
    
    const handleSettingChange = <K extends keyof StagingSettings>(key: K, value: StagingSettings[K]) => {
        setStagingSettings(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-bold text-sky-300">Scene Lighting (3D Model)</h3>
             <p className="text-sm text-slate-300 -mt-2">
                Control the lighting and atmosphere of your digital 3D model.
            </p>
            <Slider label="Sun Direction" value={sunPosition.azimuth} min={0} max={360} step={1} onChange={e => setSunPosition(prev => ({ ...prev, azimuth: Number(e.target.value) }))} />
            <Slider label="Sun Height" value={sunPosition.altitude} min={0} max={180} step={1} onChange={e => setSunPosition(prev => ({ ...prev, altitude: Number(e.target.value) }))} />
            <RadioButtonGroup label="Time of Day Preset" options={[{ value: 'midday', label: 'Midday' }, { value: 'sunset', label: 'Sunset' }, { value: 'night', label: 'Night' }]} selected={stagingSettings.timeOfDay} onChange={val => handleSettingChange('timeOfDay', val)} />
        </div>
    );
};

export const StagingEngine: React.FC<PhoenixEnginePanelProps> = (props) => {
    return (
        <div className="space-y-6">
            <SceneLightingTool {...props} />
            <div className="relative text-center my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
                <div className="relative inline-block px-2 bg-slate-800 text-xs text-slate-500">OR</div>
            </div>
            <AuraInstantStaging {...props} />
        </div>
    );
};
