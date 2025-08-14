// src/features/editor/components/ViewPanelCard.tsx
import React from 'react';

interface ViewPanelCardProps {
  title: string;
  children: React.ReactNode;
}

export const ViewPanelCard: React.FC<ViewPanelCardProps> = ({ title, children }) => {
  return (
    <div className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/50 rounded-xl shadow-xl h-full flex flex-col">
      <div className="p-4 border-b border-slate-700/50">
        <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-sky-300 to-emerald-300">
          {title}
        </h3>
      </div>
      <div className="flex-grow p-1 relative">
        {children}
      </div>
    </div>
  );
};
