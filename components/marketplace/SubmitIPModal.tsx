// src/components/marketplace/SubmitIPModal.tsx
import React, { useState } from 'react';
import { useNotificationStore } from '../../state/notificationStore';
import { LoadingSpinner } from '../common/LoadingSpinner';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';

interface SubmitIPModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SubmitIPModal: React.FC<SubmitIPModalProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(100);
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate an API call
        await new Promise(res => setTimeout(res, 1500));
        setIsLoading(false);
        addNotification(`"${name}" has been submitted for review.`, 'success');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <Modal onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Submit Generative IP</ModalTitle>
                <p className="text-sm text-muted-foreground">Share your creations with the community and earn credits.</p>
            </ModalHeader>
            <ModalContent>
                <form id="submit-ip-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="ip-name">IP Name</Label>
                        <Input id="ip-name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g., Parametric Facade Generator" required />
                    </div>
                     <div>
                        <Label htmlFor="ip-description">Description</Label>
                        <textarea id="ip-description" value={description} onChange={e => setDescription(e.target.value)} rows={4} className="w-full mt-1 p-2 bg-input rounded-md" placeholder="Describe what your component does..." required />
                    </div>
                     <div>
                        <Label htmlFor="ip-price">Price (in Credits)</Label>
                        <Input id="ip-price" type="number" value={price} onChange={e => setPrice(parseInt(e.target.value, 10) || 0)} min="10" required />
                    </div>
                     <div>
                        <Label htmlFor="ip-thumbnail">Thumbnail Image</Label>
                        <Input id="ip-thumbnail" type="file" accept="image/png, image/jpeg" className="pt-2" />
                         <p className="text-xs text-muted-foreground mt-1">A preview image for the marketplace card.</p>
                    </div>
                </form>
            </ModalContent>
            <ModalFooter>
                <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                <Button type="submit" form="submit-ip-form" disabled={isLoading}>
                    {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
                    Submit for Review
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default SubmitIPModal;