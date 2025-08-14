// src/components/AuraOS/ChatPanel.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useAppStore } from '../../state/appStore';
import * as socketService from '../../services/socketService';
import { LoadingSpinner } from '../common/LoadingSpinner';

const ChatPanel: React.FC = () => {
    const { chatHistory, currentProject, currentUser, addChatMessage } = useAppStore(state => ({
        chatHistory: state.chatHistory,
        currentProject: state.currentProject,
        currentUser: state.currentUser,
        addChatMessage: state.addChatMessage
    }));
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isThinking, setIsThinking] = useState(false);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatHistory]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || !currentProject || !currentUser) return;
        
        const userMessage = { userId: currentUser.id, userName: currentUser.name || currentUser.email.split('@')[0], text: input, isAI: false, timestamp: new Date().toISOString() };
        addChatMessage(userMessage);

        socketService.emitChatMessage(currentProject.id, input);

        if (input.toLowerCase().startsWith('@aura')) {
            setIsThinking(true);
            const timer = setTimeout(() => {
                setIsThinking(false);
            }, 15000); // Timeout for AI response
            return () => clearTimeout(timer);
        }
        
        setInput('');
    };
    
    useEffect(() => {
        // If the last message is from the AI, stop "thinking"
        if (chatHistory.length > 0 && chatHistory[chatHistory.length - 1].isAI) {
            setIsThinking(false);
        }
    }, [chatHistory]);


    return (
        <div className="p-2 h-full flex flex-col bg-slate-800 text-white">
            <div className="flex-grow overflow-y-auto pr-2 space-y-4 mb-2">
                {chatHistory.map((msg, index) => (
                    <div key={index} className={`flex gap-3 ${msg.isAI ? 'justify-start' : 'justify-end'}`}>
                        {msg.isAI && <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-sm font-bold">AI</div>}
                        <div className={`max-w-xs px-4 py-2 rounded-2xl ${msg.isAI ? 'bg-secondary rounded-bl-none' : 'bg-primary text-primary-foreground rounded-br-none'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className={`text-xs mt-1 ${msg.isAI ? 'text-slate-400' : 'text-slate-200/70'}`}>{msg.userName}</p>
                        </div>
                    </div>
                ))}
                 {isThinking && (
                    <div className="flex justify-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex-shrink-0 flex items-center justify-center text-sm font-bold">AI</div>
                        <div className="px-4 py-2 bg-secondary rounded-2xl rounded-bl-none flex items-center">
                            <LoadingSpinner size="h-4 w-4" />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSend} className="flex gap-2 flex-shrink-0">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    type="text"
                    placeholder="Type a message or @aura command..."
                    className="flex-grow p-2 bg-slate-700 border border-slate-600 rounded-md text-sm"
                />
                <button type="submit" className="px-4 bg-sky-600 hover:bg-sky-500 rounded-md font-semibold text-sm">Send</button>
            </form>
        </div>
    );
};

export default ChatPanel;