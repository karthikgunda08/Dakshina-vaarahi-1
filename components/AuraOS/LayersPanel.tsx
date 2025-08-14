// src/components/AuraOS/LayersPanel.tsx
import React from 'react';
import type { Layer } from '../../types/index';

interface LayersPanelProps {
  layers: Layer[];
  activeLayerId: string;
  setActiveLayerId: (id: string) => void;
  onAddLayer: () => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
  onDeleteLayer: (id: string) => void;
}

export const LayersPanel: React.FC<LayersPanelProps> = ({
  layers,
  activeLayerId,
  setActiveLayerId,
  onAddLayer,
  onUpdateLayer,
  onDeleteLayer,
}) => {
  return (
    <div className="h-full flex flex-col p-2 text-white">
      <ul className="flex-grow space-y-1 overflow-y-auto pr-1">
        {layers.map((layer) => (
          <li
            key={layer.id}
            onClick={() => setActiveLayerId(layer.id)}
            className={`flex items-center gap-2 p-2 rounded-md cursor-pointer transition-colors ${
              activeLayerId === layer.id
                ? 'bg-sky-700/80 ring-1 ring-sky-500'
                : 'bg-slate-700/50 hover:bg-slate-600/50'
            }`}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateLayer(layer.id, { isVisible: !layer.isVisible });
              }}
              title={layer.isVisible ? 'Hide Layer' : 'Show Layer'}
              className="flex-shrink-0"
            >
              {layer.isVisible ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.367zM10 18a8 8 0 01-8-8c0-1.421.38-2.75.996-3.896l11.898 11.898A7.962 7.962 0 0110 18z" clipRule="evenodd" /></svg>
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdateLayer(layer.id, { isLocked: !layer.isLocked });
              }}
              title={layer.isLocked ? 'Unlock Layer' : 'Lock Layer'}
              className="flex-shrink-0"
            >
              {layer.isLocked ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2-2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a5 5 0 00-5 5v2a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2v-5a2 2 0 00-2-2V7a5 5 0 00-5-5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" /></svg>
              )}
            </button>
            <span
              onDoubleClick={(e) => {
                e.stopPropagation();
                const newName = prompt("Enter new layer name:", layer.name);
                if (newName) {
                  onUpdateLayer(layer.id, { name: newName });
                }
              }}
              className="text-sm flex-grow truncate"
              title={layer.name}
            >
              {layer.name}
            </span>
             <button
              onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
              title="Delete Layer"
              className="text-slate-500 hover:text-red-400 disabled:cursor-not-allowed disabled:text-slate-600"
              disabled={layers.length <= 1}
            >
              &times;
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-2 flex-shrink-0">
        <button
          onClick={onAddLayer}
          className="w-full p-2 text-sm bg-slate-600 hover:bg-slate-500 rounded-md"
        >
          + Add Layer
        </button>
      </div>
    </div>
  );
};
