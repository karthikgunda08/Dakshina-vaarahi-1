// src/components/AuraOS/SaveVersionModal.tsx
import React, { useState } from 'react';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface SaveVersionModalProps {
  onClose: () => void;
  onSave: (commitMessage: string) => Promise<void>;
}

export const SaveVersionModal: React.FC<SaveVersionModalProps> = ({ onClose, onSave }) => {
  const [commitMessage, setCommitMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commitMessage.trim()) {
      alert("Please enter a short description of your changes.");
      return;
    }
    setIsLoading(true);
    await onSave(commitMessage);
    setIsLoading(false);
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
        <h2 className="text-lg font-bold text-sky-300 mb-4">Save New Version</h2>
        <p className="text-sm text-slate-400 mb-4">Describe the changes you made. This will help you identify this version later.</p>
        <form onSubmit={handleSave}>
          <textarea
            value={commitMessage}
            onChange={(e) => setCommitMessage(e.target.value)}
            rows={3}
            className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white placeholder-slate-500"
            placeholder="e.g., Finalized kitchen layout and window placements."
            required
            autoFocus
            disabled={isLoading}
          />
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm rounded-md bg-slate-600 hover:bg-slate-500 text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !commitMessage.trim()}
              className="px-4 py-2 text-sm rounded-md bg-emerald-600 hover:bg-emerald-500 text-white font-semibold disabled:opacity-50 flex items-center"
            >
              {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
              Save Version
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};