
// src/components/AuraOS/BottomDock.tsx
import React from 'react';
import { useAppStore } from '../../state/appStore';

interface BottomDockProps {
  onPhoenixClick?: () => void;
  onLayersClick?: () => void;
  onSaveClick: () => void;
  onProjectHubClick?: () => void;
  onPropertiesClick?: () => void;
  onShareClick: () => void;
  cinematicTourReady: boolean;
  onPlayTour: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onChatClick?: () => void;
}

const ToolButton: React.FC<{
  title: string;
  isActive?: boolean;
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
  id?: string;
  className?: string;
}> = ({ title, isActive, onClick, disabled, children, id, className }) => (
  <div className="relative group" id={id}>
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={title}
      className={`p-3 rounded-lg transition-all duration-200 ${
        isActive ? 'bg-sky-500 text-white' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50'
      } disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
    <div role="tooltip" className="absolute bottom-full mb-2 px-2 py-1 bg-slate-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 whitespace-nowrap">
      {title}
    </div>
  </div>
);

export const BottomDock: React.FC<BottomDockProps> = ({ 
    onPhoenixClick, onLayersClick, onSaveClick, onProjectHubClick, onPropertiesClick, 
    onShareClick, cinematicTourReady, onPlayTour,
    canUndo, canRedo, onUndo, onRedo, onChatClick
}) => {
    
  const { isCompanionActive } = useAppStore(state => ({
    isCompanionActive: state.isCompanionActive,
  }));
  
  const toggleCompanion = () => {
    useAppStore.setState((state) => ({ isCompanionActive: !state.isCompanionActive }));
  }

  return (
    <div className="aura-bottom-dock">
      {/* Panel Toggles */}
      {onPhoenixClick && <ToolButton title="Phoenix AI Engine" onClick={onPhoenixClick} id="tutorial-target-phoenix">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>
      </ToolButton>}
      {onLayersClick && <ToolButton title="Layers" onClick={onLayersClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18M3 6h18" /></svg>
      </ToolButton>}
       {onPropertiesClick && <ToolButton title="Properties" onClick={onPropertiesClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066 2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </ToolButton>}
      {onChatClick && <ToolButton title="Chat / Command History" onClick={onChatClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
      </ToolButton>}
      <ToolButton title="Integrations" onClick={() => useAppStore.getState().togglePanelVisibility('integrationsPanel')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25z" />
        </svg>
      </ToolButton>
      
      <div className="mx-1 h-8 w-px bg-slate-700"></div>

      {/* History */}
      <ToolButton title="Undo" onClick={onUndo} disabled={!canUndo}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z" /></svg>
      </ToolButton>
      <ToolButton title="Redo" onClick={onRedo} disabled={!canRedo}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </ToolButton>
      
       <div className="mx-1 h-8 w-px bg-slate-700"></div>
      
       <ToolButton title="AI Companion" onClick={toggleCompanion} isActive={isCompanionActive} className="w-16 h-12 bg-purple-600/50 hover:bg-purple-500 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
       </ToolButton>

       <div className="mx-1 h-8 w-px bg-slate-700"></div>

      {/* Main Actions */}
       <ToolButton title="Play Cinematic Tour" onClick={onPlayTour} disabled={!cinematicTourReady} className={cinematicTourReady ? 'text-amber-300 premium-glow' : ''}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
      </ToolButton>
      <ToolButton title="Save Version" id="tutorial-target-save" onClick={onSaveClick} className="bg-sky-600/50 hover:bg-sky-500 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
      </ToolButton>
      <ToolButton title="Share & Collaborate" onClick={onShareClick}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
      </ToolButton>
    </div>
  );
};