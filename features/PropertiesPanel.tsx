
// src/features/PropertiesPanel.tsx
import React, { useState, useEffect } from 'react';
import { PhoenixEnginePanelProps, Wall, ProjectData, Room, UserCorrection } from '../types/index';
import { PREDEFINED_MATERIALS } from '../lib/constants';
import { getVastuQuickIndicator } from '../lib/vastuUtils';
import { calculateRoomArea } from '../lib/geometryUtils';
import * as projectService from '../services/projectService';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

// NEW: Project Details Editor Component
const ProjectDetailsEditor: React.FC<PhoenixEnginePanelProps> = ({ currentProject, loadProject, addNotification }) => {
    const [details, setDetails] = useState({
        location: '',
        clientProfile: '',
        siteContext: '',
        specificRequirements: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentProject) {
            setDetails({
                location: currentProject.location || '',
                clientProfile: currentProject.clientProfile || '',
                siteContext: currentProject.siteContext || '',
                specificRequirements: currentProject.specificRequirements || '',
            });
        }
    }, [currentProject]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = async () => {
        if (!currentProject) return;
        setIsLoading(true);
        try {
            const projectData: Partial<ProjectData> = {
                ...details
            };
            
            const result = await projectService.saveProject({
                projectContent: { ...currentProject, ...projectData },
                projectName: currentProject.name,
                commitMessage: 'Updated project details from properties panel',
                existingProjectId: currentProject.id,
            });
            addNotification('Project details updated successfully.', 'success');
            await loadProject(result.project.id);
        } catch (error: any) {
            addNotification(`Failed to save details: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    if (!currentProject) {
        return <p className="p-4 text-slate-400">No project loaded.</p>
    }

    return (
        <div className="p-4 space-y-4">
            <h4 className="font-bold text-sky-300">Project Details</h4>
            <p className="text-xs text-slate-400 -mt-2">Providing these details helps the AI generate more accurate and context-aware designs.</p>
            
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Location</label>
                <input type="text" name="location" value={details.location} onChange={handleChange} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" placeholder="e.g., Goa, India" />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Client Profile</label>
                <textarea name="clientProfile" value={details.clientProfile} onChange={handleChange} rows={3} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" placeholder="Describe the client, their family, lifestyle..." />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Site & Climate Context</label>
                <textarea name="siteContext" value={details.siteContext} onChange={handleChange} rows={3} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md" placeholder="Describe the site's surroundings, climate..." />
            </div>
            <div className="flex justify-end">
                <button onClick={handleSave} disabled={isLoading} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-md font-semibold text-white disabled:opacity-50 flex items-center text-sm">
                    {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />} Save Details
                </button>
            </div>
        </div>
    );
};


const InputGroup: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
    <div>
        <label className="block text-xs font-medium text-slate-400 mb-1">{label}</label>
        {children}
    </div>
);

const NumberInput: React.FC<{ value: number; onBlur: (val: number) => void; onKeyDown?: (e: React.KeyboardEvent) => void; }> = ({ value, onBlur, onKeyDown }) => {
    const [localValue, setLocalValue] = React.useState(value.toFixed(2));
    
    React.useEffect(() => {
        setLocalValue(value.toFixed(2));
    }, [value]);

    const handleBlur = () => {
        const numValue = parseFloat(localValue);
        if (!isNaN(numValue)) {
            onBlur(numValue);
        } else {
            setLocalValue(value.toFixed(2)); // Revert if invalid
        }
    };

    return (
        <input
            type="number"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={onKeyDown}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm"
        />
    );
};


const SelectInput: React.FC<{ value: string; onChange: (val: string) => void; children: React.ReactNode }> = ({ value, onChange, children }) => (
     <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-slate-100 text-sm">
        {children}
    </select>
);

export const PropertiesPanel: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { selectedObject, levels, pushToUndoStack, setSingleLevelProp, planNorthDirection, logUserCorrection } = props;

    if (!selectedObject) {
        return <ProjectDetailsEditor {...props} />;
    }
    
    const { id, type, levelIndex } = selectedObject;
    const level = levels[levelIndex];

    const handleUpdate = (updateFn: (item: any) => any, correction?: Omit<UserCorrection, 'id' | 'timestamp'>) => {
        pushToUndoStack();
        const propMap = {
            wall: 'walls',
            room: 'rooms',
            placement: 'placements',
            placedModel: 'placedModels',
        } as const;

        const propKey = propMap[type as keyof typeof propMap];
        if (!propKey) return;
        setSingleLevelProp(propKey, (prev: any[]) =>
            prev.map(item => (item.id === id ? updateFn(item) : item))
        );
        if (correction && logUserCorrection) {
            logUserCorrection(correction);
        }
    };

    const renderProperties = () => {
        switch (type) {
            case 'wall':
                const wall = level.walls.find(w => w.id === id);
                if (!wall) return null;
                return (
                    <div className="space-y-4">
                        <InputGroup label="Wall Length"><NumberInput value={Math.hypot(wall.x2 - wall.x1, wall.y2 - wall.y1)} onBlur={() => {}} /></InputGroup>
                        <InputGroup label="Height">
                            <NumberInput value={wall.height} onBlur={(val) => handleUpdate(w => ({ ...w, height: val }), { type: 'modify-wall', objectId: id, property: 'height', oldValue: wall.height, newValue: val })} />
                        </InputGroup>
                        <InputGroup label="Thickness">
                            <NumberInput value={wall.thickness} onBlur={(val) => handleUpdate(w => ({ ...w, thickness: val }), { type: 'modify-wall', objectId: id, property: 'thickness', oldValue: wall.thickness, newValue: val })} />
                        </InputGroup>
                        <InputGroup label="Material">
                            <SelectInput value={wall.material || ''} onChange={(val) => handleUpdate((w: Wall) => ({ ...w, material: val }))}>
                                <option value="">-- Select Material --</option>
                                {PREDEFINED_MATERIALS.map(mat => <option key={mat.key} value={mat.key}>{mat.name}</option>)}
                            </SelectInput>
                        </InputGroup>
                    </div>
                );
             case 'room':
                const room = level.rooms.find(r => r.id === id);
                if (!room) return null;
                const vastuInfo = getVastuQuickIndicator(room, planNorthDirection as any);
                return (
                    <div className="space-y-4">
                        <InputGroup label="Room Name">
                            <input type="text" value={room.name} onChange={(e) => handleUpdate((r: any) => ({...r, name: e.target.value}))} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm" />
                        </InputGroup>
                         <InputGroup label="Room Type">
                            <input type="text" value={room.type} onChange={(e) => handleUpdate((r: any) => ({...r, type: e.target.value}))} className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-sm" />
                        </InputGroup>
                        <InputGroup label="Area (sq. ft.)"><p className="p-2 text-sm font-mono">{((room.calculatedArea || 0) / 100).toFixed(2)}</p></InputGroup>
                         <InputGroup label="Vastu Compliance">
                            <div className={`p-2 rounded-md text-sm border-l-4 ${vastuInfo.colorHint === 'text-emerald-400' ? 'border-emerald-400' : vastuInfo.colorHint === 'text-red-400' ? 'border-red-400' : 'border-yellow-400'}`}>
                                <p className={`${vastuInfo.colorHint}`}>{vastuInfo.summary}</p>
                            </div>
                        </InputGroup>
                    </div>
                );
            case 'placedModel':
                 const model = level.placedModels.find(m => m.id === id);
                 if (!model) return null;
                 return (
                     <div className="space-y-4">
                         <InputGroup label="Name"><p className="p-2 text-sm">{model.name}</p></InputGroup>
                         <InputGroup label="Rotation"><NumberInput value={model.rotation} onBlur={(val) => handleUpdate((m: any) => ({ ...m, rotation: val }))} /></InputGroup>
                     </div>
                 );
            default:
                return <p>No properties to display for this object type.</p>;
        }
    };

    return (
        <div className="p-4">
            <h4 className="font-bold text-sky-300 capitalize">{type} Properties</h4>
            <div className="mt-4">
                {renderProperties()}
            </div>
        </div>
    );
};