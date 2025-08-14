// src/features/help/components/HelpSupportModal.tsx
import React from 'react';
import { useAppStore } from '../../../state/appStore';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';

interface HelpSupportModalProps {
  onClose: () => void;
}

const faqs = [
    { q: 'What are AI Credits?', a: 'AI Credits are used to power all generative and analytical tools. Each tool has a different credit cost, which is displayed before you run it. You start with free credits and can purchase more as needed.' },
    { q: 'How do I save my project?', a: 'You can save a version of your project at any time using the Save button in the bottom dock. It\'s good practice to save regularly with a descriptive message.' },
    { q: 'Can I collaborate with others?', a: 'Yes! Use the Share button in the bottom dock to invite other users to your project via email. They can view or edit the project in real-time alongside you.'},
];

const HelpSupportModal: React.FC<HelpSupportModalProps> = ({ onClose }) => {
    const { setSupportModalOpen } = useAppStore();
    const handleOpenSupport = () => {
        onClose();
        setSupportModalOpen(true);
    };

    return (
        <Modal onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Help & Support</ModalTitle>
            </ModalHeader>
            <ModalContent className="space-y-6">
                <div>
                    <h3 className="font-semibold text-lg text-slate-200 mb-2">Frequently Asked Questions</h3>
                    <div className="space-y-4">
                        {faqs.map(faq => (
                            <details key={faq.q}>
                                <summary className="cursor-pointer font-medium text-slate-300">{faq.q}</summary>
                                <p className="text-sm text-slate-400 mt-1 pl-4 border-l-2 border-slate-700">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
                 <div className="p-4 bg-slate-900/50 rounded-lg text-center">
                    <h3 className="font-semibold text-lg text-slate-200 mb-2">Still need help?</h3>
                    <p className="text-sm text-slate-400 mb-4">Chat with our 24/7 AI Support Agent for instant assistance.</p>
                    <Button onClick={handleOpenSupport}>Chat with AI Support</Button>
                </div>
            </ModalContent>
        </Modal>
    );
};

export default HelpSupportModal;
