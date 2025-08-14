// src/components/AuraOS/CinematicPlayer.tsx
import React from 'react';
import type { CinematicTour } from '../../types/index';

interface CinematicPlayerProps {
    tourData: CinematicTour;
    currentScript: string;
    onClose: () => void;
}

export const CinematicPlayer: React.FC<CinematicPlayerProps> = ({ tourData, currentScript, onClose }) => {
    
    return (
        <div className="absolute inset-0 bg-black/50 z-[100] flex flex-col justify-between pointer-events-none">
            {/* Top letterbox */}
            <div className="h-16 md:h-24 bg-black pointer-events-auto">
                 <div className="w-full h-full flex items-center justify-between px-6">
                    <h2 className="text-lg md:text-xl font-bold text-slate-200">{tourData.title}</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-300 hover:text-white transition-colors"
                        aria-label="Close cinematic tour"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                 </div>
            </div>
            
            {/* Main content area is transparent to show 3D view */}
            <div className="flex-grow"></div>

            {/* Bottom letterbox with script */}
            <div className="h-24 md:h-32 bg-black pointer-events-auto flex items-center justify-center p-4">
                <p className="text-base md:text-lg text-slate-100 text-center font-serif italic text-shadow-custom max-w-4xl">
                    {currentScript}
                </p>
            </div>
        </div>
    );
};