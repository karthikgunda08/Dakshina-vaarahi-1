// src/features/tools/ThreeDSynthesisTool.tsx
import React from 'react';
import { PhoenixEnginePanelProps } from '../../types/index';

export const ThreeDSynthesisTool: React.FC<PhoenixEnginePanelProps> = () => {
    return (
        <div className="text-center p-4 flex flex-col items-center justify-center h-full">
            <div className="text-6xl mb-4">
                <span className="text-slate-400">2D</span>
                <span className="mx-2 text-sky-400">→</span>
                <span className="text-white font-bold">3D</span>
            </div>
            <h3 className="text-lg font-bold text-sky-300">Live 3D Synthesis</h3>
            <p className="text-sm text-slate-300 my-3">
                Your 3D model is generated instantly and is always synchronized with your 2D plan. Any changes you make on the canvas are immediately reflected in the 3D Visualization panel.
            </p>
            <p className="text-xs text-slate-400 italic">
                There's no 'convert' button because it's always live. This is the power of AuraOS.
            </p>
            <button
                className="mt-6 w-full px-4 py-3 text-white font-semibold rounded-md flex items-center justify-center transition-all bg-sky-600 hover:bg-sky-500"
            >
                View 3D Model
            </button>
        </div>
    );
};