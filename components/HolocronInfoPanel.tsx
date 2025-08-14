// src/components/HolocronInfoPanel.tsx
import React from 'react';
import { HolocronHotspot } from '../types/index';

interface HolocronInfoPanelProps {
  hotspot: HolocronHotspot;
  onClose: () => void;
}

export const HolocronInfoPanel: React.FC<HolocronInfoPanelProps> = ({ hotspot, onClose }) => {
  const renderContent = () => {
    switch (hotspot.type) {
      case 'narrative':
        return <p className="text-slate-300 whitespace-pre-wrap">{hotspot.content}</p>;
      case 'render':
        return <img src={hotspot.content} alt={hotspot.title} className="w-full h-auto rounded-md shadow-lg" />;
      case 'document':
        return (
          <a
            href={hotspot.content}
            target="_blank"
            rel="noopener noreferrer"
            download={hotspot.title}
            className="inline-block px-4 py-2 bg-sky-600 text-white font-semibold rounded-md hover:bg-sky-500"
          >
            Download {hotspot.title}
          </a>
        );
      default:
        return <p>Unsupported content type.</p>;
    }
  };

  return (
    <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-slate-900/70 backdrop-blur-md shadow-2xl border-l border-slate-700 flex flex-col animate-fade-in-right z-50">
      <div className="flex justify-between items-center p-4 border-b border-slate-700 flex-shrink-0">
        <h3 className="text-lg font-bold text-sky-300">{hotspot.title}</h3>
        <button onClick={onClose} className="text-slate-400 hover:text-white">&times;</button>
      </div>
      <div className="p-4 flex-grow overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};