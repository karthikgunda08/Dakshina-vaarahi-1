// src/state/slices/createCollaborationSlice.ts
import { StateCreator } from 'zustand';
import { AppStore, CollaborationSlice, LiveCursor, LiveSelection, ChatMessage } from '../../types/index';
import * as socketService from '../../services/socketService';
import { getColorForUserId } from '../../lib/colorUtils';

export const createCollaborationSlice: StateCreator<AppStore, [], [], CollaborationSlice> = (set, get) => ({
    chatHistory: [],
    collaborators: [],
    liveCursors: {},
    liveSelections: {},

    setChatHistory: (messages) => set({ chatHistory: messages }),
    addChatMessage: (message) => set(state => ({ chatHistory: [...state.chatHistory, message] })),
    setCollaborators: (collaborators) => set({ collaborators }),
    setLiveCursors: (updater) => set(state => ({ liveCursors: typeof updater === 'function' ? updater(state.liveCursors) : updater })),
    setLiveSelections: (updater) => set(state => ({ liveSelections: typeof updater === 'function' ? updater(state.liveSelections) : updater })),
    
    setupSocketListeners: () => {
        const socket = socketService.getSocket();
        if (!socket) return;

        socket.off('geometry_update');
        socket.off('chat_message');
        socket.off('load_chat_history');
        socket.off('cursor_update');
        socket.off('selection_update');
        socket.off('iot_data_update');
        socket.off('error_message');
        socket.off('samarangan_solutions'); // NEW: Unbind previous listener

        socket.on('geometry_update', (data) => {
            set({
                levels: data.levels,
                zones: data.zones || get().zones,
                infrastructure: data.infrastructure || get().infrastructure,
                hasUnsavedChanges: true // Mark as unsaved for the recipient as well
            });
        });

        socket.on('chat_message', (message) => {
            if(message.isAI) {
                set({ companionState: 'speaking' });
                setTimeout(() => {
                    set({ companionState: 'idle', companionTranscript: null });
                }, 5000);
            }
            get().addChatMessage(message);
        });

        socket.on('load_chat_history', (messages) => {
            get().setChatHistory(messages);
        });

        socket.on('cursor_update', ({ userId, userName, position }) => {
            get().setLiveCursors(prev => ({
                ...prev,
                [userId]: { x: position.x, y: position.y, userName, color: getColorForUserId(userId) }
            }));
        });
        
        socket.on('selection_update', ({ userId, selection }) => {
            get().setLiveSelections(prev => {
                const newSelections = { ...prev };
                if (selection) {
                    newSelections[userId] = { userId, objectId: selection.id, objectType: selection.type };
                } else {
                    delete newSelections[userId];
                }
                return newSelections;
            });
        });

        socket.on('iot_data_update', (data) => {
            set(state => ({
                digitalTwinData: state.digitalTwinData
                    ? {
                        ...state.digitalTwinData,
                        structuralStress: state.digitalTwinData.structuralStress.map(s =>
                            s.wallId === data.wallId ? { ...s, stressFactor: data.stressFactor } : s
                        )
                      }
                    : null
            }));
        });

        socket.on('error_message', (message) => {
            get().addNotification(`Server error: ${message}`, 'error');
        });

        // NEW: Listener for Samarangan Engine solutions
        socket.on('samarangan_solutions', (solutions) => {
            get().setSamaranganSolutions(solutions);
            get().addProactiveSuggestion({
                title: 'Design Solutions Ready',
                message: 'The Samarangan AI has proposed multiple solutions to your request. Click here to review them.',
                cta: {
                    label: 'Review Solutions',
                    action: (store) => {
                        store.togglePanelVisibility('phoenixEngine');
                        store.setActiveTool('samarangan');
                    }
                }
            });
            // Also update companion state
            set({ companionState: 'speaking' });
            setTimeout(() => {
                set({ companionState: 'idle', companionTranscript: null });
            }, 5000);
        });


        const projectId = get().currentProject?.id;
        if (projectId) {
            socketService.joinProjectRoom(projectId);
        }
    },
});