// src/features/projects/components/ProjectModal.tsx
import React, { useState, useRef } from 'react';
import { useAppStore } from '../../../state/appStore';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProjectModal: React.FC<ProjectModalProps> = ({ isOpen, onClose }) => {
  const { newProject, importDwgProject } = useAppStore(state => ({
    newProject: state.newProject,
    importDwgProject: state.importDwgProject
  }));
  const [projectType, setProjectType] = useState<'building' | 'masterPlan'>('building');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCreate = () => {
    newProject(projectType);
    onClose();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
          importDwgProject(file);
      }
  };

  if (!isOpen) return null;

  return (
    <Modal onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Create a New Project</ModalTitle>
      </ModalHeader>
      <ModalContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
            Choose how you'd like to begin. You can start from a blank canvas, or import an existing drawing.
        </p>
        <div className="flex flex-col gap-4">
            <button 
                onClick={() => setProjectType('building')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${projectType === 'building' ? 'border-sky-500 bg-sky-900/50' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
            >
                <div className="text-2xl mb-1">🏢</div>
                <h4 className="font-bold text-lg text-slate-100">Building Design</h4>
                <p className="text-sm text-slate-400">Design a residential, commercial, or mixed-use building from scratch.</p>
            </button>
             <button 
                onClick={() => setProjectType('masterPlan')}
                className={`p-4 rounded-lg border-2 text-left transition-all ${projectType === 'masterPlan' ? 'border-purple-500 bg-purple-900/50' : 'border-slate-700 bg-slate-800 hover:border-slate-500'}`}
            >
                <div className="text-2xl mb-1">🗺️</div>
                <h4 className="font-bold text-lg text-slate-100">Master Plan</h4>
                <p className="text-sm text-slate-400">Design a community with terrain, zones, and infrastructure from scratch.</p>
            </button>
        </div>
        <div className="relative text-center my-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-700"></div></div>
            <div className="relative inline-block px-2 bg-card text-xs text-slate-500">OR</div>
        </div>

        <div>
            <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".dwg,.dxf"
                onChange={handleFileChange}
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full p-6 rounded-lg border-2 border-dashed border-slate-600 hover:border-sky-500 hover:bg-sky-900/30 transition-all flex flex-col items-center justify-center text-slate-400"
            >
                <div className="text-4xl mb-2">📄</div>
                <h4 className="font-bold text-lg text-slate-100">Import DWG/DXF</h4>
                <p className="text-sm">Start a new project from an existing CAD file.</p>
            </button>
        </div>
      </ModalContent>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>Cancel</Button>
        <Button onClick={handleCreate}>Create Blank Project</Button>
      </ModalFooter>
    </Modal>
  );
};

export default ProjectModal;