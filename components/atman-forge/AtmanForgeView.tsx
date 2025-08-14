// src/components/atman-forge/AtmanForgeView.tsx
import React, { useState, useCallback } from 'react';
import { useAppStore } from '../../state/appStore';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { motion } from 'framer-motion';
import { CreditCostDisplay } from '../common/CreditCostDisplay';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../ui/Modal';
import * as geminiService from '../../services/geminiService';

const MotionDiv = motion.div as any;

const ImageUploader: React.FC<{
    onFilesSelected: (files: File[]) => void;
    isLoading: boolean;
}> = ({ onFilesSelected, isLoading }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);
    const [files, setFiles] = useState<File[]>([]);

    const handleFiles = useCallback((selectedFiles: FileList | null) => {
        if (!selectedFiles) return;
        const imageFiles = Array.from(selectedFiles).filter(file => file.type.startsWith('image/'));
        const newFiles = [...files, ...imageFiles].slice(0, 10); // Limit to 10 files
        setFiles(newFiles);
        
        const urls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(urls);
        onFilesSelected(newFiles);
    }, [files, onFilesSelected]);
    
    const handleDragEnter = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        handleFiles(e.dataTransfer.files);
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFiles(e.target.files);
    };
    
    const handleRemoveImage = (index: number) => {
        const newFiles = files.filter((_, i) => i !== index);
        setFiles(newFiles);
        const newUrls = newFiles.map(file => URL.createObjectURL(file));
        setPreviewUrls(newUrls);
        onFilesSelected(newFiles);
    };

    return (
        <div className="space-y-4">
            <label
                htmlFor="file-upload"
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-slate-600 hover:border-slate-500'}`}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-slate-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <p className="text-sm text-slate-400">Drag & drop images here, or click to select</p>
                <p className="text-xs text-slate-500">Up to 10 images (PNG, JPG)</p>
                <input id="file-upload" type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} disabled={isLoading} />
            </label>
            {previewUrls.length > 0 && (
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {previewUrls.map((url, index) => (
                        <div key={index} className="relative group aspect-square">
                            <img src={url} alt={`preview ${index}`} className="w-full h-full object-cover rounded-md" />
                            <button onClick={() => handleRemoveImage(index)} className="absolute top-0 right-0 m-1 bg-black/50 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                &times;
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const AtmanForgeView: React.FC = () => {
    const { svaDharmaReport, runVisualSvaDharmaAnalyzer, globalLoadingMessage, setSvaDharmaReport, currentUser, addNotification } = useAppStore();
    const [files, setFiles] = useState<File[]>([]);
    const [isForgeModalOpen, setIsForgeModalOpen] = useState(false);
    
    const isLoading = !!globalLoadingMessage?.includes('Analyzing');
    const isForging = currentUser?.atmanModelStatus === 'in_progress';

    const handleAnalyzeVisuals = () => {
        if (files.length > 0) {
            const fileList = new DataTransfer();
            files.forEach(file => fileList.items.add(file));
            runVisualSvaDharmaAnalyzer(fileList.files);
        }
    };
    
    const handleForge = async () => {
        setIsForgeModalOpen(false);
        useAppStore.setState({ globalLoadingMessage: 'Initiating Atman fine-tuning...' });
        try {
            // This is a mock API call to simulate credit deduction and backend process start
            await geminiService.runAtmanSignatureApi('mock_project_id', 'mock_signature', 'fine_tune');
            
            if (currentUser) {
                useAppStore.setState({ currentUser: {...currentUser, atmanModelStatus: 'in_progress' }});
            }
            addNotification("Fine-tuning process started. This may take some time. We'll notify you when it's complete.", 'success');
            
            // Simulate completion after a delay
            setTimeout(() => {
                const user = useAppStore.getState().currentUser;
                if(user) {
                     useAppStore.setState({ currentUser: {...user, atmanModelStatus: 'ready' }});
                    addNotification("Your personal Atman AI has been forged!", "success");
                }
                 useAppStore.setState({ globalLoadingMessage: null });
            }, 30000); // 30 second simulation

        } catch (error: any) {
             addNotification(error.message, 'error');
             useAppStore.setState({ globalLoadingMessage: null });
        }
    };
    
    return (
        <div className="flex-grow animated-gradient-bg-studio py-16 md:py-24 overflow-y-auto h-full">
            <MotionDiv
                className="container mx-auto px-4 max-w-4xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
            >
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-white text-shadow-custom">🔥 The Atman Forge</h1>
                    <p className="mt-4 text-lg text-slate-300">Forge your unique design identity. Teach the AI to think, create, and design... like you.</p>
                </header>

                <div className="space-y-8">
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                         <h2 className="text-2xl font-bold text-sky-300 mb-4">1. Discover Your Signature</h2>
                         <p className="text-sm text-slate-400 mb-4">Upload images of your past work. The SvaDharma analyzer will deconstruct your portfolio to discover your core design principles.</p>
                         <ImageUploader onFilesSelected={setFiles} isLoading={isLoading} />
                         <Button onClick={handleAnalyzeVisuals} disabled={!files.length || isLoading} className="w-full mt-4 flex items-center justify-center">
                             {isLoading ? <LoadingSpinner size="h-5 w-5" /> : 'Analyze Visual Portfolio'}
                             <CreditCostDisplay cost={50} className="ml-2" />
                         </Button>
                    </div>
                    {svaDharmaReport && (
                        <MotionDiv 
                            className="bg-slate-800/50 p-6 rounded-xl border border-slate-700"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                             <h2 className="text-2xl font-bold text-purple-300 mb-4">2. Your Architectural DNA</h2>
                             <div className="p-3 bg-slate-900/50 rounded-md">
                                <p className="font-bold text-lg text-white mb-2">"{svaDharmaReport.signature}"</p>
                                <p className="text-xs text-purple-200">{svaDharmaReport.analysis}</p>
                                <Button variant="link" size="sm" onClick={() => setSvaDharmaReport(null)} className="mt-2">Clear Signature</Button>
                            </div>
                        </MotionDiv>
                    )}
                    {svaDharmaReport && (
                         <MotionDiv 
                            className="bg-slate-800/50 p-6 rounded-xl border border-slate-700"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                         >
                            <h2 className="text-2xl font-bold text-amber-300 mb-4">3. Forge Your Atman AI</h2>
                            <p className="text-sm text-slate-400 mb-4">Use your discovered signature to fine-tune a personal version of the generative AI. This makes its baseline output intrinsically aligned with your style.</p>
                            {currentUser?.atmanModelStatus === 'ready' ? (
                                <div className="p-4 bg-green-900/50 border border-green-700 text-center rounded-lg">
                                    <p className="text-lg font-bold text-green-300">✅ Your Atman AI is Forged & Active</p>
                                    <p className="text-xs text-green-400">AI tools will now be influenced by your personal model.</p>
                                </div>
                            ) : isForging ? (
                                <div className="p-4 bg-slate-700 text-center rounded-lg">
                                    <LoadingSpinner />
                                    <p className="text-sm text-slate-300 mt-2">Fine-tuning in progress...</p>
                                    <p className="text-xs text-slate-400">This may take up to an hour.</p>
                                </div>
                            ) : (
                                <Button onClick={() => setIsForgeModalOpen(true)} disabled={!svaDharmaReport} className="w-full premium-glow">
                                    Forge My Atman AI
                                    <CreditCostDisplay cost={1000} className="ml-2" />
                                </Button>
                            )}
                        </MotionDiv>
                    )}
                </div>
            </MotionDiv>
            
            {isForgeModalOpen && (
                <Modal onClose={() => setIsForgeModalOpen(false)}>
                    <ModalHeader>
                        <ModalTitle>Confirm AI Fine-Tuning</ModalTitle>
                    </ModalHeader>
                    <ModalContent>
                        <p className="text-sm text-slate-300">You are about to start the fine-tuning process for your personal Atman AI based on your signature: <strong>"{svaDharmaReport?.signature}"</strong></p>
                        <p className="text-sm text-slate-400 mt-2">This is a one-time process that will consume <strong>1,000 AI Credits</strong>. The process can take up to an hour. You can close this window after it starts.</p>
                    </ModalContent>
                    <ModalFooter>
                        <Button variant="secondary" onClick={() => setIsForgeModalOpen(false)}>Cancel</Button>
                        <Button onClick={handleForge} className="bg-amber-600 hover:bg-amber-500">Confirm & Begin Forging</Button>
                    </ModalFooter>
                </Modal>
            )}
        </div>
    );
};

export default AtmanForgeView;