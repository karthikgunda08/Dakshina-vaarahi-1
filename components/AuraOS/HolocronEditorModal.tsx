// src/components/AuraOS/HotspotEditorModal.tsx
import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import type { HolocronHotspot } from '../../types/index';
import { Button } from '../ui/Button';

const generateId = (prefix: string): string => `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

const HotspotEditorModal: React.FC = () => {
    const { 
        isHotspotEditorOpen, 
        hotspotEditorTarget, 
        setHotspotEditorOpen, 
        currentProject,
        updateHolocronHotspots 
    } = useAppStore();
    const holocron = currentProject?.holocron;

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [type, setType] = useState<'narrative' | 'render' | 'document'>('narrative');

    const isEditing = hotspotEditorTarget?.existingHotspotId;

    useEffect(() => {
        if (isHotspotEditorOpen && isEditing) {
            const existing = holocron?.hotspots.find(h => h.id === isEditing);
            if (existing) {
                setTitle(existing.title);
                setContent(existing.content);
                setType(existing.type);
            }
        } else {
            setTitle('');
            setContent('');
            setType('narrative');
        }
    }, [isHotspotEditorOpen, isEditing, holocron]);

    const handleSave = () => {
        if (!title || !content || !hotspotEditorTarget) return;

        const currentHotspots = holocron?.hotspots || [];
        let newHotspots: HolocronHotspot[];

        if (isEditing) {
            newHotspots = currentHotspots.map(h => 
                h.id === isEditing 
                    ? { ...h, title, content, type } 
                    : h
            );
        } else {
            const newHotspot: HolocronHotspot = {
                id: generateId('hotspot'),
                title,
                content,
                type,
                position: hotspotEditorTarget.position,
            };
            newHotspots = [...currentHotspots, newHotspot];
        }
        
        updateHolocronHotspots(newHotspots);
        setHotspotEditorOpen(false);
    };
    
    if (!isHotspotEditorOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[150]"
            onClick={() => setHotspotEditorOpen(false)}
        >
            <div 
                className="bg-card border border-border shadow-lg w-full max-w-lg m-4 rounded-xl p-6"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold text-sky-300 mb-4">{isEditing ? 'Edit' : 'Add'} Holocron Hotspot</h2>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm">Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-input rounded-md mt-1" />
                    </div>
                     <div>
                        <label className="text-sm">Type</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full p-2 bg-input rounded-md mt-1">
                            <option value="narrative">Narrative</option>
                            <option value="render">Render URL</option>
                            <option value="document">Document URL</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm">Content</label>
                        <textarea value={content} onChange={e => setContent(e.target.value)} rows={5} className="w-full p-2 bg-input rounded-md mt-1" />
                    </div>
                </div>
                <div className="mt-6 flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setHotspotEditorOpen(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Hotspot</Button>
                </div>
            </div>
        </div>
    );
};

export default HotspotEditorModal;