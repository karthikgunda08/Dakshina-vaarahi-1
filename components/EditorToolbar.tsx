
// src/components/EditorToolbar.tsx
import React from 'react';
import type { SketcherTool, EditorMode } from '../types/index';

interface EditorToolbarProps {
  activeTool: SketcherTool;
  onToolChange: (tool: SketcherTool) => void;
  editorMode: EditorMode;
  onModeChange: (mode: EditorMode) => void;
}

const tools: { id: SketcherTool, title: string, icon: React.ReactNode }[] = [
  { id: 'select', title: 'Select & Modify', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2.5m6-6a1.5 1.5 0 00-3 0v6a1.5 1.5 0 003 0m-3-6a1.5 1.5 0 013 0v2.5m0 0a1.5 1.5 0 013 0m-3-6a1.5 1.5 0 013 0v6a1.5 1.5 0 01-3 0m6-2.5v-2.5a1.5 1.5 0 013 0v2.5" /></svg> },
  { id: 'wall', title: 'Draw Wall', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg> },
  { id: 'door', title: 'Add Door', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 7v10a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2zm12-1V5a2 2 0 00-2-2H8a2 2 0 00-2 2v1m5 5a1 1 0 11-2 0 1 1 0 012 0z" /></svg> },
  { id: 'window', title: 'Add Window', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16M6 4v16M18 4v16" /></svg> },
  { id: 'dimension', title: 'Add Dimension', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v4m0 0h-4m4 0l-5-5" /></svg> },
  { id: 'comment', title: 'Add Comment', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg> },
  { id: 'zone', title: 'Draw Zone', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg> },
  { id: 'road', title: 'Draw Road/Infra', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg> },
];

export const EditorToolbar: React.FC<EditorToolbarProps> = ({ activeTool, onToolChange, editorMode, onModeChange }) => {
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
      <div className="my-1 h-px bg-slate-700"></div>
      <button
        onClick={() => onModeChange(editorMode === 'concept' ? 'precision' : 'concept')}
        title={`Switch to ${editorMode === 'concept' ? 'Precision' : 'Concept'} Mode`}
        className="p-2 text-xs text-center text-slate-300 hover:bg-slate-700 rounded-md"
      >
        <div className="font-bold capitalize">{editorMode}</div>
        <div className="text-slate-400">Mode</div>
      </button>
    </div>
  );
};