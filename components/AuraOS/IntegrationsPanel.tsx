// src/components/AuraOS/IntegrationsPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../state/appStore';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { LoadingSpinner } from '../common/LoadingSpinner';

export const IntegrationsPanel: React.FC = () => {
    const { importRevitProject, globalLoadingMessage } = useAppStore(state => ({
        importRevitProject: state.importRevitProject,
        globalLoadingMessage: state.globalLoadingMessage,
    }));
    const [revitId, setRevitId] = useState('RVT-2024-HS-001'); // Mock ID
    const isLoading = !!globalLoadingMessage?.includes('Importing');

    const handleImport = () => {
        importRevitProject(revitId);
    };

    return (
        <div className="p-4 h-full flex flex-col">
            <h3 className="text-lg font-bold text-sky-300">Integrations</h3>
            <p className="text-sm text-slate-300 my-3">
                Connect AuraOS with your existing workflows by importing data from other platforms.
            </p>

            <div className="mt-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <h4 className="font-semibold text-amber-300">Revit / BIM Import (Simulation)</h4>
                <p className="text-xs text-slate-400 my-2">
                    Enter a mock Revit Project ID to simulate importing a BIM model. This will load a predefined project structure into the editor.
                </p>
                <div className="space-y-2">
                    <Label htmlFor="revit-id">Mock Revit Project ID</Label>
                    <Input id="revit-id" value={revitId} onChange={e => setRevitId(e.target.value)} disabled={isLoading} />
                </div>
                 <Button onClick={handleImport} className="w-full mt-4" disabled={isLoading}>
                    {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
                    Import Project
                </Button>
            </div>
        </div>
    );
};