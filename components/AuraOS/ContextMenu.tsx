// src/components/AuraOS/ContextMenu.tsx
import React from 'react';
import { useAppStore } from '../../state/appStore';
import type { SelectedObject } from '../../types/index';

interface ContextMenuProps {
    x: number;
    y: number;
    object: SelectedObject | null;
}

const MenuItem: React.FC<{ onClick: (e: React.MouseEvent) => void; children: React.ReactNode; isPremium?: boolean }> = ({ onClick, children, isPremium = false }) => (
    <button
        onClick={onClick}
        className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center gap-2 ${isPremium ? 'text-amber-200 hover:bg-amber-500/20' : 'text-slate-200 hover:bg-sky-600'}`}
    >
        {children}
    </button>
);

const MenuDivider: React.FC = () => <div className="h-px bg-slate-700 my-1"></div>;

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, object }) => {
    const { setContextMenu, setActiveTool, runAiFurnishRoom, atmanSignature, deleteSelectedObject } = useAppStore();

    const handleAction = (e: React.MouseEvent, tool: string) => {
        e.stopPropagation();
        setActiveTool(tool as any);
        setContextMenu(null);
    };

    const handleFurnish = (e: React.MouseEvent, roomId: string, useAtman: boolean) => {
        e.stopPropagation();
        setContextMenu(null); // Close menu first
        
        let style = "modern minimalist";
        if (!useAtman) {
            style = prompt("Enter an interior design style (e.g., modern minimalist, industrial, scandinavian):", "modern minimalist") || style;
        }

        runAiFurnishRoom(roomId, style, useAtman ? atmanSignature || undefined : undefined);
    };
    
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm("Are you sure you want to delete this object? This action can be undone.")) {
            deleteSelectedObject();
        }
        setContextMenu(null);
    };

    const renderMenuContent = () => {
        if (!object) {
            return (
                <>
                    <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400">AI Actions</div>
                    <MenuItem onClick={(e) => handleAction(e, 'aiArchitect')}>🌟 New Concept...</MenuItem>
                    <MenuItem onClick={(e) => handleAction(e, 'modelLibrary')}>📦 Place 3D Model</MenuItem>
                </>
            );
        }
        switch (object.type) {
            case 'wall':
                return (
                    <>
                        <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400">Wall Actions</div>
                        <MenuItem onClick={(e) => handleAction(e, 'structural')}>🏛️ Analyze Structure</MenuItem>
                        <MenuItem onClick={(e) => handleAction(e, 'material')}>🧱 Suggest Material</MenuItem>
                        <MenuDivider />
                        <MenuItem onClick={handleDelete}>🗑️ Delete</MenuItem>
                    </>
                );
            case 'room':
                return (
                    <>
                         <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400">AI Room Actions</div>
                        <MenuItem onClick={(e) => handleFurnish(e, object.id, false)}>🛋️ Furnish Room...</MenuItem>
                        {atmanSignature && (
                            <MenuItem onClick={(e) => handleFurnish(e, object.id, true)} isPremium>
                                🧬 Furnish Room (Atman Signature)
                            </MenuItem>
                        )}
                        <MenuItem onClick={(e) => handleAction(e, 'vastu')}>🕉️ Analyze Vastu</MenuItem>
                        <MenuItem onClick={(e) => handleAction(e, 'flow')}>🚶 Check Flow & Ergonomics</MenuItem>
                        <MenuItem onClick={(e) => handleAction(e, 'render')}>🖼️ Render Room</MenuItem>
                         <MenuDivider />
                        <MenuItem onClick={(e) => handleAction(e, 'delete')}>🗑️ Delete Room</MenuItem>
                    </>
                );
            case 'placedModel':
                 return (
                    <>
                        <div className="px-4 pt-2 pb-1 text-xs font-semibold text-slate-400">Model Actions</div>
                        <MenuItem onClick={(e) => handleAction(e, 'staging')}>Staging Engine</MenuItem>
                         <MenuDivider />
                        <MenuItem onClick={handleDelete}>🗑️ Delete Model</MenuItem>
                    </>
                );
            default:
                 return <div className="px-4 py-2 text-sm text-slate-400">No actions available</div>;
        }
    };

    return (
        <div
            className="fixed z-[150] bg-slate-800/90 backdrop-blur-md rounded-lg shadow-2xl border border-slate-700 overflow-hidden w-64"
            style={{ top: y, left: x }}
        >
            <div className="py-1">
                {renderMenuContent()}
            </div>
        </div>
    );
};

export default ContextMenu;