// src/components/WorldBuilderToolbar.tsx
import React from 'react';
import { SketcherTool } from '../types/index';

interface WorldBuilderToolbarProps {
  activeTool: SketcherTool;
  onToolChange: (tool: SketcherTool) => void;
}

const tools: { id: SketcherTool, title: string, icon: React.ReactNode }[] = [
  { id: 'select', title: 'Select & Modify', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2.5m6-6a1.5 1.5 0 00-3 0v6a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v2.5m0 0a1.5 1.5 0 013 0m-3-6a1.5 1.5 0 013 0v6a1.5 1.5 0 01-3 0m6-2.5v-2.5a1.5 1.5 0 013 0v2.5" /></svg> },
  { id: 'zone', title: 'Draw Zone', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg> },
  { id: 'road', title: 'Draw Road', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
];

export const WorldBuilderToolbar: React.FC<WorldBuilderToolbarProps> = ({ activeTool, onToolChange }) => {
  return (
    <div className="absolute top-20 left-4 z-30 flex flex-col gap-2 p-2 bg-slate-800/80 backdrop-blur-md rounded-lg border border-slate-700">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => onToolChange(tool.id as SketcherTool)}
          title={tool.title}
          className={`p-3 rounded-md transition-colors ${
            activeTool === tool.id ? 'bg-sky-500 text-white' : 'text-slate-300 hover:bg-slate-700'
          }`}
        >
          {tool.icon}
        </button>
      ))}
    </div>
  );
};
