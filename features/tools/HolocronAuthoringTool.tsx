// src/features/tools/HolocronAuthoringTool.tsx
import React from 'react';
import { PhoenixEnginePanelProps, HolocronHotspot } from '../../types/index';
import { useAppStore } from '../../state/appStore';
import { Button } from '../../components/ui/Button';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

const ToggleSwitch: React.FC<{ isEnabled: boolean; onToggle: () => void; disabled: boolean }> = ({ isEnabled, onToggle, disabled }) => (
    <button
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-50 ${isEnabled ? 'bg-primary' : 'bg-slate-600'}`}
    >
        <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${isEnabled ? 'translate-x-6' : 'translate-x-1'}`}
        />
    </button>
);

export const HolocronAuthoringTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const {
        currentProject,
        toggleHolocronEnabled,
        updateHolocronHotspots,
        setHotspotEditorOpen,
        globalLoadingMessage,
    } = useAppStore();

    const holocron = currentProject?.holocron;
    const isLoading = !!globalLoadingMessage?.includes('Holocron');

    const handleEditHotspot = (hotspot: HolocronHotspot) => {
        setHotspotEditorOpen(true, { position: hotspot.position, existingHotspotId: hotspot.id });
    };

    const handleDeleteHotspot = (hotspotId: string) => {
        if (!holocron) return;
        if (window.confirm("Are you sure you want to delete this hotspot?")) {
            const newHotspots = holocron.hotspots.filter(h => h.id !== hotspotId);
            updateHolocronHotspots(newHotspots);
        }
    };

    const shareableLink = holocron?.isEnabled && holocron.shareableLink
        ? `${window.location.origin}/#/holocron/${holocron.shareableLink}`
        : '';

    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Holocron Authoring</h3>
            <p className="text-sm text-slate-300 my-3">
                Create an interactive, shareable 3D presentation of your project. Add narrative points, renders, and documents directly onto your model.
            </p>

            <div className="p-4 bg-slate-700/50 rounded-lg space-y-4">
                <div className="flex justify-between items-center">
                    <label className="font-semibold text-slate-200">Enable Holocron Presentation</label>
                    <ToggleSwitch isEnabled={holocron?.isEnabled || false} onToggle={toggleHolocronEnabled} disabled={isLoading} />
                </div>
                {isLoading && <div className="flex justify-center"><LoadingSpinner /></div>}

                {holocron?.isEnabled && shareableLink && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-semibold text-slate-400">Shareable Link</label>
                            <div className="flex gap-2 mt-1">
                                <input type="text" readOnly value={shareableLink} className="w-full p-2 bg-slate-800 border border-slate-600 rounded-md text-slate-300 text-xs" />
                                <Button size="sm" onClick={() => navigator.clipboard.writeText(shareableLink)}>Copy</Button>
                            </div>
                        </div>

                        <div className="p-3 bg-slate-900/50 rounded-lg border border-dashed border-slate-600 text-center">
                            <h4 className="font-semibold text-amber-300">Add Hotspots</h4>
                            <p className="text-xs text-slate-400 mt-1">
                                Double-click anywhere on the 3D model to add a new interactive hotspot.
                            </p>
                        </div>
                        
                        <div>
                            <h4 className="font-semibold text-slate-200 mb-2">Manage Hotspots ({holocron.hotspots?.length || 0})</h4>
                            <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                                {holocron.hotspots?.length > 0 ? (
                                    holocron.hotspots.map(hotspot => (
                                        <div key={hotspot.id} className="p-2 bg-slate-800/70 rounded-md flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-slate-100">{hotspot.title}</p>
                                                <p className="text-xs text-slate-500 capitalize">{hotspot.type}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button variant="ghost" size="sm" onClick={() => handleEditHotspot(hotspot)}>Edit</Button>
                                                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300" onClick={() => handleDeleteHotspot(hotspot.id)}>Delete</Button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-center text-sm text-slate-500 py-4">No hotspots created yet.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
