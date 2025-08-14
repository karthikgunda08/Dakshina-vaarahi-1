// src/features/onboarding/components/WebsiteTourModal.tsx
import React from 'react';
import { useAppStore } from '../../../state/useAppStore';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface WebsiteTourModalProps {
  onClose: () => void;
}

const WebsiteTourModal: React.FC<WebsiteTourModalProps> = ({ onClose }) => {
    const { startInteractiveTutorial } = useAppStore();

    const handleStartTour = () => {
        onClose();
        // A small delay might be needed for the modal to close before the tour starts
        setTimeout(() => {
            startInteractiveTutorial();
        }, 100);
    };

    return (
        <Modal onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Welcome to the AuraOS Studio Tour!</ModalTitle>
            </ModalHeader>
            <ModalContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                    This interactive tour will guide you through the core features of the AuraOS design studio. We'll highlight the key panels and tools to get you started on your first project.
                </p>
                 <p className="text-sm text-muted-foreground">
                    Would you like to begin?
                </p>
            </ModalContent>
            <ModalFooter>
                 <Button variant="secondary" onClick={onClose}>Maybe Later</Button>
                 <Button onClick={handleStartTour}>Start Tour</Button>
            </ModalFooter>
        </Modal>
    );
};

export default WebsiteTourModal;
