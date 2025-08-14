// src/features/editor/components/ModelLibraryPanel.tsx
import React, { useState } from 'react';
import { PREDEFINED_3D_MODELS } from '../../../lib/constants';
import type { Predefined3DModel, PhoenixEnginePanelProps } from '../../../types/index';

export const ModelLibraryPanel: React.FC<PhoenixEnginePanelProps> = ({ setCurrentPlacingModelKey, currentPlacingModelKey }) => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const categories = Array.from(new Set(PREDEFINED_3D_MODELS.map(model => model.category)));

  const modelsByCategory = PREDEFINED_3D_MODELS.reduce<Record<string, Predefined3DModel[]>>((acc, model) => {
    if (!acc[model.category]) {
      acc[model.category] = [];
    }
    acc[model.category].push(model);
    return acc;
  }, {});


  return (
    <div className="p-3 bg-slate-700 rounded-md h-full flex flex-col">
      <h4 className="text-lg font-semibold text-sky-300 mb-3">Place 3D Models</h4>
      
      <div className="mb-3">
        <label htmlFor="categoryFilter" className="text-xs text-slate-300 mr-2">Filter by Category:</label>
        <select 
          id="categoryFilter"
          value={activeCategory || ""}
          onChange={(e) => setActiveCategory(e.target.value || null)}
          className="text-xs p-1.5 bg-slate-600 border border-slate-500 rounded text-white focus:ring-sky-500"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="flex-grow overflow-y-auto pr-1 space-y-3">
        {Object.entries(modelsByCategory).map(([category, models]) => {
          if (activeCategory && activeCategory !== category) {
            return null;
          }
          return (
            <div key={category}>
              <h5 className="text-md font-semibold text-emerald-300 mb-1.5">{category}</h5>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {models.map(model => (
                  <button
                    key={model.key}
                    onClick={() => setCurrentPlacingModelKey(currentPlacingModelKey === model.key ? null : model.key)}
                    title={`Place ${model.name}`}
                    className={`p-2 rounded-md text-xs transition-all duration-150 ease-in-out text-center
                                ${currentPlacingModelKey === model.key ? 'bg-sky-500 ring-2 ring-sky-300 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}
                  >
                    {model.name}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
