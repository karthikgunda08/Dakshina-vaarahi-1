
// src/components/TimelineControls.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import type { ConstructionPhase } from '../types/index';

interface TimelineControlsProps {
    sequence: ConstructionPhase[];
    activeWeek: number | null;
    setActiveWeek: (updater: React.SetStateAction<number | null>) => void;
}

export const TimelineControls: React.FC<TimelineControlsProps> = ({ sequence, activeWeek, setActiveWeek }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef<number | null>(null);
    const maxWeek = sequence.length > 0 ? sequence[sequence.length - 1].week : 0;

    const play = useCallback(() => {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = window.setInterval(() => {
            setActiveWeek(prevWeek => {
                const currentW = prevWeek ?? -1;
                if (currentW >= maxWeek) {
                    clearInterval(intervalRef.current!);
                    setIsPlaying(false);
                    return maxWeek;
                }
                return currentW + 1;
            });
        }, 800);
    }, [maxWeek, setActiveWeek]);
    
    const pause = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    }, []);

    useEffect(() => {
        if (isPlaying) {
            play();
        } else {
            pause();
        }
        return () => pause();
    }, [isPlaying, play, pause]);
    
    const handlePlayPause = () => {
        if (activeWeek === null) return;
        if (activeWeek >= maxWeek) {
            setActiveWeek(0);
            setIsPlaying(true);
        } else {
            setIsPlaying(!isPlaying);
        }
    };
    
    const currentPhase = sequence.find(p => p.week === activeWeek);

    return (
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-full max-w-3xl z-30 px-4">
            <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-slate-700/50">
                <div className="flex items-center gap-4">
                    <button onClick={handlePlayPause} className="p-2 bg-slate-700 rounded-full hover:bg-sky-600 transition-colors">
                        {isPlaying ? (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25v13.5m-7.5-13.5v13.5" /></svg>
                        ) : (
                             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" /></svg>
                        )}
                    </button>
                    <input
                        type="range"
                        min="0"
                        max={maxWeek}
                        value={activeWeek ?? 0}
                        onChange={(e) => setActiveWeek(parseInt(e.target.value, 10))}
                        className="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="text-right w-28">
                        <p className="text-sm font-semibold text-white">Week {activeWeek ?? 0} / {maxWeek}</p>
                        <p className="text-xs text-slate-300 truncate" title={currentPhase?.description || 'Timeline'}>{currentPhase?.description || 'Timeline'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};