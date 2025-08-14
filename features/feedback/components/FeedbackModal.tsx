// src/features/feedback/components/FeedbackModal.tsx
import React, { useState } from 'react';
import { useNotificationStore } from '../../../state/notificationStore';
import * as feedbackService from '../../../services/feedbackService';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle, ModalFooter } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface FeedbackModalProps {
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ onClose }) => {
    const [category, setCategory] = useState<'bug_report' | 'feature_request' | 'general_feedback'>('general_feedback');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { addNotification } = useNotificationStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) {
            addNotification("Please enter your feedback message.", "error");
            return;
        }
        setIsLoading(true);
        try {
            const result = await feedbackService.submitFeedback(category, message);
            addNotification(result.message, 'success');
            onClose();
        } catch (error: any) {
            addNotification(`Error: ${error.message}`, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Submit Feedback</ModalTitle>
            </ModalHeader>
            <ModalContent>
                <form id="feedback-form" onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="category" className="block text-sm font-medium mb-1">Category</label>
                        <select id="category" value={category} onChange={e => setCategory(e.target.value as any)} className="w-full p-2 bg-input rounded-md">
                            <option value="general_feedback">General Feedback</option>
                            <option value="feature_request">Feature Request</option>
                            <option value="bug_report">Bug Report</option>
                        </select>
                    </div>
                    <div>
                         <label htmlFor="message" className="block text-sm font-medium mb-1">Message</label>
                        <textarea id="message" value={message} onChange={e => setMessage(e.target.value)} rows={6} className="w-full p-2 bg-input rounded-md" placeholder="Your feedback helps us improve AuraOS..." required />
                    </div>
                </form>
            </ModalContent>
            <ModalFooter>
                 <Button variant="secondary" onClick={onClose} disabled={isLoading}>Cancel</Button>
                 <Button type="submit" form="feedback-form" disabled={isLoading}>
                    {isLoading && <LoadingSpinner size="h-4 w-4 mr-2" />}
                    Submit
                </Button>
            </ModalFooter>
        </Modal>
    );
};

export default FeedbackModal;
