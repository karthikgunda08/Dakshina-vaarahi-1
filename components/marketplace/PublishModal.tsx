// src/components/marketplace/PublishModal.tsx
import React, { useState } from 'react';
import { ProjectSummary } from '../../types/index';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';

interface PublishModalProps {
  project: ProjectSummary;
  onClose: () => void;
  onPublished: () => void;
}

export const PublishModal: React.FC<PublishModalProps> = ({ project, onClose, onPublished }) => {
  const [price, setPrice] = useState(project.marketplace?.price || 100);
  const [description, setDescription] = useState(project.marketplace?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price < 10) {
      addNotification("Price must be at least 10 credits.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await projectService.publishProjectToMarketplace(project.id, { price, description });
      addNotification("Your project is now live on the marketplace!", "success");
      onPublished();
      onClose();
    } catch (error: any) {
      addNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/75 z-[150] flex items-center justify-center" onClick={onClose}>
      <div className="bg-slate-800 p-6 rounded-lg w-full max-w-lg shadow-2xl border border-slate-700" onClick={e => e.stopPropagation()}>
        <h2 className="text-xl font-bold text-amber-300 mb-2">Publish Template</h2>
        <p className="text-sm text-slate-400 mb-6">Set a price and description for your project "{project.name}". It will be listed in the Architect's Marketplace for others to purchase.</p>

        <form onSubmit={handlePublish} className="space-y-4">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-slate-300 mb-1">Price (in Credits)</label>
            <input
              id="price"
              type="number"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value, 10) || 0)}
              min="10"
              step="10"
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              required
            />
            <p className="text-xs text-slate-500 mt-1">You will receive 90% of this amount when your template is sold.</p>
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">Description</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              placeholder="Describe what makes your design special..."
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button type="button" onClick={onClose} disabled={isLoading} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-md text-sm">Cancel</button>
            <button type="submit" disabled={isLoading} className="px-6 py-2 bg-amber-600 hover:bg-amber-500 rounded-md font-semibold text-white text-sm flex items-center">
              {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
              {isLoading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PublishModal;