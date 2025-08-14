// src/components/dashboard/TokenizeModal.tsx
import React, { useState } from 'react';
import { ProjectSummary } from '../../types/index';
import * as projectService from '../../services/projectService';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal, ModalHeader, ModalTitle, ModalDescription, ModalContent, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface TokenizeModalProps {
  project: ProjectSummary;
  onClose: () => void;
  onTokenized: () => void;
}

export const TokenizeModal: React.FC<TokenizeModalProps> = ({ project, onClose, onTokenized }) => {
  const [totalTokens, setTotalTokens] = useState(10000);
  const [pricePerToken, setPricePerToken] = useState(100);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { addNotification } = useNotificationStore();

  const handleTokenize = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalTokens <= 0 || pricePerToken <= 0 || !description.trim()) {
      addNotification("Please fill in all fields with valid values.", "error");
      return;
    }
    setIsLoading(true);
    try {
      await projectService.tokenizeProjectApi(project.id, {
        totalTokens,
        pricePerToken,
        offeringDescription: description
      });
      addNotification("Your project has been tokenized and is now listed on the Exchange!", "success");
      onTokenized();
      onClose();
    } catch (error: any) {
      addNotification(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };
  
  const totalValue = totalTokens * pricePerToken;

  return (
    <Modal onClose={onClose}>
      <ModalHeader>
        <ModalTitle>Tokenize Project for Exchange</ModalTitle>
        <ModalDescription>
            Create a simulated investment offering for "{project.name}". This will list it on the Real Estate Exchange.
        </ModalDescription>
      </ModalHeader>
      <ModalContent>
        <form id="tokenize-form" onSubmit={handleTokenize} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="totalTokens">Total Tokens</Label>
                    <Input
                        id="totalTokens"
                        type="number"
                        value={totalTokens}
                        onChange={(e) => setTotalTokens(parseInt(e.target.value, 10) || 0)}
                        min="1"
                        required
                    />
                </div>
                 <div>
                    <Label htmlFor="pricePerToken">Price per Token (Credits)</Label>
                    <Input
                        id="pricePerToken"
                        type="number"
                        value={pricePerToken}
                        onChange={(e) => setPricePerToken(parseInt(e.target.value, 10) || 0)}
                        min="1"
                        required
                    />
                </div>
            </div>
            
            <div className="p-3 bg-slate-900/50 rounded-md text-center">
                <Label>Total Offering Value</Label>
                <p className="text-2xl font-bold text-purple-300">
                    {totalValue.toLocaleString()} Credits
                </p>
            </div>

            <div>
                <Label htmlFor="description">Offering Description</Label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full mt-1 p-2 bg-input rounded-md text-sm"
                    placeholder="Describe the investment opportunity, potential ROI, and project highlights..."
                    required
                />
            </div>
        </form>
      </ModalContent>
      <ModalFooter>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
          <Button type="submit" form="tokenize-form" disabled={isLoading}>
              {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
              {isLoading ? 'Tokenizing...' : 'List on Exchange'}
          </Button>
      </ModalFooter>
    </Modal>
  );
};
