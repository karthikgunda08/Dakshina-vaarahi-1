// src/features/tools/FabricatorTool.tsx
import React, { useState } from 'react';
import { PhoenixEnginePanelProps } from '../../types/index';
import { generateFabricationFilesApi } from '../../services/geminiService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { addProjectDocument } from '../../services/projectService';

export const FabricatorTool: React.FC<PhoenixEnginePanelProps> = (props) => {
    const { currentUser, setBuyCreditsModalOpen, refreshCurrentUser, selectedObject, currentProject, setGeneratedDocuments } = props;
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleGenerate = async () => {
        if (!selectedObject) {
            addNotification("Please select an object in the 2D or 3D view first.", "info");
            return;
        }
        if (!currentUser || !currentProject) {
            addNotification("Please log in and open a project.", "error");
            return;
        }
        if (currentUser.role !== 'owner' && currentUser.credits < 50) {
            addNotification(`You need 50 credits for the Fabricator Engine.`, 'info');
            setBuyCreditsModalOpen(true);
            return;
        }

        setIsLoading(true);
        try {
            const { files, elementName } = await generateFabricationFilesApi(currentProject.id, selectedObject);

            // Add each generated file to the project hub
            const promises = files.map(file => {
                 const newDocument = {
                    name: `${elementName}_${file.fileName}`,
                    type: 'Fabrication File',
                    // Create a downloadable data URL
                    url: `data:${file.mimeType};charset=utf-8,${encodeURIComponent(file.content)}`,
                };
                return addProjectDocument(currentProject.id, newDocument);
            });

            const results = await Promise.all(promises);
            // The last result will be the most up-to-date list of documents
            if(results.length > 0) {
                setGeneratedDocuments(results[results.length - 1]);
            }
            
            addNotification(`Fabrication files for "${elementName}" generated and saved to Project Hub.`, "success");
            await refreshCurrentUser();
        } catch (error: any) {
            addNotification(`Fabrication failed: ${error.message}`, "error");
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <div>
            <h3 className="text-lg font-bold text-sky-300">Astra Fabricator Engine</h3>
            <p className="text-sm text-slate-300 my-3">Bridge the gap between digital design and physical reality. Select a single object (like a wall, custom furniture, or a complex facade piece) and the AI will generate machine-readable files for digital fabrication.</p>
            
            <div className="p-4 bg-slate-700/50 rounded-lg text-center">
                <p className="text-sm text-slate-400">Selected Object:</p>
                {selectedObject ? (
                    <p className="font-semibold text-amber-300 capitalize">{selectedObject.type} - ID: {selectedObject.id}</p>
                ) : (
                    <p className="text-slate-500 italic">None selected. Click an object in the 2D or 3D view.</p>
                )}
            </div>

            <button
                onClick={handleGenerate}
                disabled={isLoading || !selectedObject}
                className="w-full mt-4 px-4 py-3 text-white font-semibold rounded-md disabled:opacity-50 flex items-center justify-center transition-all bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700"
            >
                {isLoading ? <LoadingSpinner size="h-5 w-5 mr-2" /> : <span className="mr-2 text-lg">⚙️</span>}
                <span className="flex-grow">{isLoading ? 'Generating Files...' : 'Generate Fabrication Files'}</span>
                <span className="text-xs bg-black/30 px-2 py-0.5 rounded-full">50 credits</span>
            </button>
        </div>
    );
};