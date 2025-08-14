// src/features/editor/components/ExportModal.tsx
import React, { useState } from 'react';
import type { SketcherHandles, View3DHandles } from '../../../types/index';
import { useAppStore } from '../../../state/appStore';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { exportToXml } from '../../../lib/exportUtils';

interface ExportModalProps {
    onClose: () => void;
    sketcherRef: React.RefObject<SketcherHandles>;
    view3dRef: React.RefObject<View3DHandles>;
    projectName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({ onClose, sketcherRef, view3dRef, projectName }) => {
    const { exportCometPackage, currentProject, exportAsDxf } = useAppStore();
    const [isPackaging, setIsPackaging] = useState(false);

    const handleExport = (type: '2d_png' | '3d_png' | '3d_glb' | 'xml') => {
        const download = (dataUrl: string, filename: string) => {
            if (!dataUrl) return;
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        };

        switch (type) {
            case '2d_png':
                const png2d = sketcherRef.current?.exportAsPNG();
                if (png2d) download(png2d, `${projectName}_2D_Plan.png`);
                break;
            case '3d_png':
                const png3d = view3dRef.current?.exportAsPNG();
                if (png3d) download(png3d, `${projectName}_3D_View.png`);
                break;
            case '3d_glb':
                view3dRef.current?.exportAsGLB(projectName);
                break;
            case 'xml':
                if (currentProject) {
                    exportToXml(currentProject, `${projectName}_Data.xml`);
                }
                break;
        }
        onClose();
    };

    const handleCometExport = async () => {
        setIsPackaging(true);
        await exportCometPackage(sketcherRef, view3dRef);
        setIsPackaging(false);
        onClose();
    };


    return (
        <div
            className="fixed inset-0 bg-slate-900/75 backdrop-blur-sm z-[200] flex items-center justify-center"
            onClick={onClose}
        >
            <div
                className="bg-slate-800 p-6 rounded-xl shadow-2xl w-full max-w-md m-4 border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <h2 className="text-lg font-bold text-sky-300 mb-4">Export Project</h2>
                <p className="text-sm text-slate-400 mb-6">Choose a format to export your project.</p>
                <div className="space-y-3">
                    <button onClick={() => handleExport('2d_png')} className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                        <h3 className="font-semibold text-white">2D Floor Plan (PNG)</h3>
                        <p className="text-xs text-slate-400">Export the current 2D canvas view as a PNG image.</p>
                    </button>
                    <button onClick={() => handleExport('3d_png')} className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                        <h3 className="font-semibold text-white">3D View (PNG)</h3>
                        <p className="text-xs text-slate-400">Export the current 3D view as a high-resolution PNG image.</p>
                    </button>
                    <button onClick={() => handleExport('3d_glb')} className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                        <h3 className="font-semibold text-white">3D Model (GLB)</h3>
                        <p className="text-xs text-slate-400">Export the entire 3D model for use in other 3D software.</p>
                    </button>
                    <button onClick={exportAsDxf} className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                        <h3 className="font-semibold text-white">Technical Drawing (DXF)</h3>
                        <p className="text-xs text-slate-400">Export the 2D plan to a DXF file for use in CAD software.</p>
                    </button>
                    <button onClick={() => handleExport('xml')} className="w-full p-4 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors">
                        <h3 className="font-semibold text-white">Project Data (XML)</h3>
                        <p className="text-xs text-slate-400">Export all project data as an XML file for interoperability.</p>
                    </button>
                    <button onClick={handleCometExport} disabled={isPackaging} className="w-full p-4 bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-500 hover:to-indigo-600 rounded-lg text-left transition-colors border border-purple-500 disabled:opacity-50">
                        <h3 className="font-semibold text-white flex items-center gap-2">✨ Comet Package (.pdf)</h3>
                        <p className="text-xs text-slate-300">Bundle all project assets (drawings, renders, folio, BoQ) into a single document.</p>
                        {isPackaging && <div className="mt-2 flex items-center gap-2 text-xs text-purple-200"><LoadingSpinner size="h-4 w-4" /> Packaging assets...</div>}
                    </button>
                </div>
                <div className="mt-6 text-right">
                    <button onClick={onClose} className="px-4 py-2 text-sm rounded-md bg-slate-600 hover:bg-slate-500 text-white">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportModal;