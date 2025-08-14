// src/features/help/components/SupportAgentModal.tsx
import React, { useState, useRef, useEffect } from 'react';
import { LoadingSpinner } from '../../../components/common/LoadingSpinner';
import { Modal, ModalContent, ModalHeader, ModalTitle } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { getSupportAgentResponseApi } from '../../../services/geminiService';

interface SupportAgentModalProps {
  onClose: () => void;
}
interface Message {
  id: number;
  text: string;
  sender: 'user' | 'ai';
}

const SupportAgentModal: React.FC<SupportAgentModalProps> = ({ onClose }) => {
    const [messages, setMessages] = useState<Message[]>([{ id: 1, text: 'Hello! How can I help you with AuraOS today?', sender: 'ai' }]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    useEffect(scrollToBottom, [messages]);
    
    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const { text } = await getSupportAgentResponseApi(input);
            const aiMessage: Message = { id: Date.now() + 1, text, sender: 'ai' };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            const errorMessage: Message = { id: Date.now() + 1, text: `Sorry, I encountered an error: ${error.message}`, sender: 'ai' };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal onClose={onClose} className="max-w-md">
            <ModalHeader>
                <ModalTitle>AI Support Agent</ModalTitle>
            </ModalHeader>
            <ModalContent className="flex flex-col h-[70vh]">
                <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-4">
                    {messages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'}`}>
                                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && <div className="flex justify-start"><LoadingSpinner size="h-5 w-5" /></div>}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSend} className="flex gap-2">
                    <Input value={input} onChange={e => setInput(e.target.value)} placeholder="Ask about AuraOS..." />
                    <Button type="submit" disabled={isLoading}>Send</Button>
                </form>
            </ModalContent>
        </Modal>
    );
};

export default SupportAgentModal;
