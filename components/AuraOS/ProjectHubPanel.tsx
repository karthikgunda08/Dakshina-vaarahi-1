// src/components/AuraOS/ProjectHubPanel.tsx
import React, { useState } from 'react';
import { useAppStore } from '../../state/appStore';
import { GeneratedDocument, GeneratedRender } from '../../types/index';

const TabButton: React.FC<{ isActive: boolean; onClick: () => void; children: React.ReactNode }> = ({ isActive, onClick, children }) => (
    <button
        onClick={onClick}
        className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${isActive ? 'border-sky-400 text-sky-300' : 'border-transparent text-slate-400 hover:text-white'}`}
    >
        {children}
    </button>
);

const DocumentItem: React.FC<{ doc: GeneratedDocument }> = ({ doc }) => (
    <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-md">
        <div>
            <p className="text-sm font-medium text-slate-200">{doc.name}</p>
            <p className="text-xs text-slate-400">{doc.type} - {new Date(doc.createdAt).toLocaleDateString()}</p>
        </div>
        <a href={doc.url} download={doc.name} className="px-3 py-1 text-xs bg-slate-600 hover:bg-slate-500 rounded-md">
            Download
        </a>
    </div>
);

const RenderItem: React.FC<{ render: GeneratedRender }> = ({ render }) => (
    <div className="bg-slate-900/50 rounded-lg overflow-hidden group">
        <img src={render.url} alt={render.prompt} className="w-full h-32 object-cover" />
        <div className="p-2">
            <p className="text-xs text-slate-400 truncate group-hover:whitespace-normal">{render.prompt}</p>
            <a href={render.url} download={`render_${render._id}.png`} className="text-xs mt-2 inline-block text-sky-400 hover:underline">
                Download
            </a>
        </div>
    </div>
);


export const ProjectHubPanel: React.FC = () => {
    const { currentProject } = useAppStore();
    const [activeTab, setActiveTab] = useState<'docs' | 'renders'>('docs');

    if (!currentProject) {
        return <div className="p-4 text-center text-slate-400">No project loaded.</div>;
    }

    const { generatedDocuments = [], generatedRenders = [] } = currentProject;

    return (
        <div className="p-2 h-full flex flex-col">
            <div className="border-b border-slate-700 flex-shrink-0">
                <nav className="flex space-x-2">
                    <TabButton isActive={activeTab === 'docs'} onClick={() => setActiveTab('docs')}>Documents ({generatedDocuments.length})</TabButton>
                    <TabButton isActive={activeTab === 'renders'} onClick={() => setActiveTab('renders')}>Renders ({generatedRenders.length})</TabButton>
                </nav>
            </div>

            <div className="flex-grow overflow-y-auto pt-4">
                {activeTab === 'docs' && (
                    <div className="space-y-2 pr-2">
                        {generatedDocuments.length > 0 ? (
                            generatedDocuments.map(doc => <DocumentItem key={doc._id} doc={doc} />)
                        ) : (
                            <p className="text-center text-sm text-slate-500 pt-8">No documents have been generated yet.</p>
                        )}
                    </div>
                )}
                {activeTab === 'renders' && (
                     <div className="grid grid-cols-2 gap-3 pr-2">
                        {generatedRenders.length > 0 ? (
                            generatedRenders.map(render => <RenderItem key={render._id} render={render} />)
                        ) : (
                            <p className="col-span-2 text-center text-sm text-slate-500 pt-8">No renders have been generated yet.</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};