// src/components/collaboration/CollaborationModal.tsx
import React, { useState } from 'react';
import { Collaborator } from '../../types/index';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface CollaborationModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: string;
  initialCollaborators: Collaborator[];
  onCollaboratorsUpdate: (collaborators: Collaborator[]) => void;
}

const CollaborationModal: React.FC<CollaborationModalProps> = ({ isOpen, onClose, projectId, initialCollaborators, onCollaboratorsUpdate }) => {
  const [collaborators, setCollaborators] = useState(initialCollaborators);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setIsLoading(true);
    try {
      const result = await projectService.inviteCollaborator(projectId, inviteEmail);
      addNotification(result.message, 'success');
      setCollaborators(result.collaborators);
      onCollaboratorsUpdate(result.collaborators);
      setInviteEmail('');
    } catch (error: any) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async (collaboratorId: string) => {
    if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
    setIsLoading(true);
    try {
      const result = await projectService.removeCollaborator(projectId, collaboratorId);
      addNotification(result.message, 'success');
      setCollaborators(result.collaborators);
      onCollaboratorsUpdate(result.collaborators);
    } catch (error: any) {
      addNotification(error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/75 z-[150] flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-md shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-sky-300 mb-4">Share Project</h2>
        
        <form onSubmit={handleInvite} className="flex gap-2 mb-6">
          <input
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="Invite by email..."
            className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-400"
            disabled={isLoading}
          />
          <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md font-semibold text-white disabled:opacity-50" disabled={isLoading || !inviteEmail.trim()}>
            {isLoading ? <LoadingSpinner size="h-5 w-5"/> : 'Invite'}
          </button>
        </form>

        <h3 className="text-md font-semibold text-slate-300 mb-2">Project Members</h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto">
          {collaborators.map(({ userId }) => (
            <li key={userId.id} className="flex items-center justify-between p-2 bg-slate-700/50 rounded-md">
              <div className="flex items-center gap-2">
                <img src={userId.profileImageUrl || `https://api.dicebear.com/8.x/initials/svg?seed=${userId.name || userId.email}`} alt="avatar" className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-sm font-medium text-slate-100">{userId.name || 'Invited User'}</p>
                  <p className="text-xs text-slate-400">{userId.email}</p>
                </div>
              </div>
              <button onClick={() => handleRemove(userId.id)} className="text-xs text-red-400 hover:text-red-300" disabled={isLoading}>
                Remove
              </button>
            </li>
          ))}
          {collaborators.length === 0 && (
            <p className="text-sm text-center text-slate-400 py-4">You are the only member.</p>
          )}
        </ul>
      </div>
    </div>
  );
};

export default CollaborationModal;