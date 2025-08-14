// src/components/AuraOS/DigitalTwinPanel.tsx
import React from 'react';
import { useAppStore } from '../../state/appStore';
import { LoadingSpinner } from '../common/LoadingSpinner';

const Toggle: React.FC<{ label: string; isEnabled: boolean; onToggle: () => void; }> = ({ label, isEnabled, onToggle }) => (
    <div className="flex justify-between items-center bg-slate-900/50 p-2 rounded-md">
        <label className="text-sm text-slate-200">{label}</label>
        <button
            onClick={onToggle}
            className={`relative inline-flex items-center h-5 rounded-full w-10 transition-colors ${isEnabled ? 'bg-sky-500' : 'bg-slate-600'}`}
        >
            <span
                className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
        </button>
    </div>
);

const StatDisplay: React.FC<{ label: string; value: string; unit: string; color: string }> = ({ label, value, unit, color }) => (
    <div className="bg-slate-900/50 p-3 rounded-lg text-center">
        <p className="text-xs text-slate-400">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}<span className="text-sm text-slate-300 ml-1">{unit}</span></p>
    </div>
);

export const DigitalTwinPanel: React.FC = () => {
    const { 
        isDigitalTwinModeActive,
        toggleDigitalTwinMode,
        digitalTwinData,
        activeDataOverlays,
        setActiveDataOverlays
    } = useAppStore();

    if (!isDigitalTwinModeActive) {
        return (
            <div className="p-4 h-full flex flex-col items-center justify-center text-center">
                <p className="text-sm text-slate-400 mb-4">Digital Twin mode is inactive. Activate it to see live IoT data simulations from your project.</p>
                <button onClick={toggleDigitalTwinMode} className="px-4 py-2 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold">
                    Activate Digital Twin
                </button>
            </div>
        );
    }

    if (!digitalTwinData) {
        return <div className="p-4 h-full flex items-center justify-center"><LoadingSpinner /></div>;
    }

    const { totalPowerDraw, peakStressFactor, totalOccupancy } = digitalTwinData;

    return (
        <div className="p-4 h-full flex flex-col space-y-4">
            <div className="grid grid-cols-3 gap-2">
                <StatDisplay label="Power Draw" value={(totalPowerDraw / 1000).toFixed(2)} unit="kW" color="text-yellow-300" />
                <StatDisplay label="Peak Stress" value={(peakStressFactor * 100).toFixed(1)} unit="%" color="text-red-300" />
                <StatDisplay label="Occupancy" value={totalOccupancy.toString()} unit="people" color="text-cyan-300" />
            </div>
            
            <div>
                <h4 className="font-semibold text-sky-300 mb-2">3D Overlays</h4>
                <div className="space-y-2">
                    <Toggle label="Energy Usage" isEnabled={activeDataOverlays.energy} onToggle={() => setActiveDataOverlays(p => ({ ...p, energy: !p.energy }))} />
                    <Toggle label="Structural Stress" isEnabled={activeDataOverlays.stress} onToggle={() => setActiveDataOverlays(p => ({ ...p, stress: !p.stress }))} />
                    <Toggle label="Live Occupancy" isEnabled={activeDataOverlays.occupancy} onToggle={() => setActiveDataOverlays(p => ({ ...p, occupancy: !p.occupancy }))} />
                </div>
            </div>
            
            <div className="mt-auto pt-4 border-t border-slate-700">
                <button onClick={toggleDigitalTwinMode} className="w-full px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md font-semibold text-sm">
                    Deactivate Digital Twin
                </button>
            </div>
        </div>
    );
};