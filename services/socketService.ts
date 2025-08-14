// src/services/socketService.ts
import { io, Socket } from 'socket.io-client';
import { ProjectData, ChatMessage, LiveCursor, LiveSelection, SelectedObject } from '../types/index';
import { BACKEND_API_BASE_URL } from '../lib/constants';
import throttle from 'lodash.throttle';

interface ServerToClientEvents {
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (err: Error) => void;
  geometry_update: (data: ProjectData) => void;
  chat_message: (message: ChatMessage) => void;
  load_chat_history: (messages: ChatMessage[]) => void;
  cursor_update: (data: { userId: string; userName: string; position: { x: number; y: number; }; }) => void;
  selection_update: (data: { userId: string; selection: SelectedObject | null; }) => void;
  iot_data_update: (data: { wallId: string; stressFactor: number; }) => void;
  error_message: (message: string) => void;
}

interface ClientToServerEvents {
  join_project: (projectId: string) => void;
  leave_project: (projectId: string) => void;
  geometry_update: (data: { projectId: string; updatedProjectData: Partial<ProjectData>; }) => void;
  chat_message: (data: { projectId: string; message: string; }) => void;
  cursor_move: (data: { projectId: string; position: { x: number; y: number; }; }) => void;
  object_selection: (data: { projectId: string; selection: SelectedObject | null; }) => void;
}

const BACKEND_URL = BACKEND_API_BASE_URL.replace('/api', '');

let socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;

export const getSocket = (): Socket<ServerToClientEvents, ClientToServerEvents> | null => {
    return socket;
};

export const connectSocket = (token: string): Socket<ServerToClientEvents, ClientToServerEvents> => {
    if (socket && socket.connected) {
        return socket;
    }
    
    socket = io(BACKEND_URL, {
        auth: { token }
    });

    socket.on('connect', () => {
        console.log('✅ Socket connected:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('🔥 Socket disconnected:', reason);
    });
    
    socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
    });

    return socket;
};

export const disconnectSocket = (): void => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

export const joinProjectRoom = (projectId: string) => {
    socket?.emit('join_project', projectId);
};

export const emitGeometryUpdate = (projectId: string, updatedProjectData: Partial<ProjectData>) => {
    socket?.emit('geometry_update', { projectId, updatedProjectData });
};

export const emitChatMessage = (projectId: string, message: string) => {
    socket?.emit('chat_message', { projectId, message });
};

// --- NEW COLLABORATION EMITTERS ---
export const emitCursorMove = throttle((projectId: string, position: { x: number, y: number }) => {
    if(!socket || !socket.connected) return;
    socket.emit('cursor_move', { projectId, position });
}, 50); // Throttle to prevent overwhelming the server

export const emitObjectSelection = (projectId: string, selection: SelectedObject | null) => {
    if(!socket || !socket.connected) return;
    socket.emit('object_selection', { projectId, selection });
}


// --- LISTENERS ---
export const onGeometryUpdate = (callback: (data: ProjectData) => void) => {
    socket?.on('geometry_update', callback);
};

export const onChatMessage = (callback: (message: ChatMessage) => void) => {
    socket?.on('chat_message', callback);
};

export const onLoadChatHistory = (callback: (messages: ChatMessage[]) => void) => {
    socket?.on('load_chat_history', callback);
};

// --- NEW COLLABORATION LISTENERS ---
export const onCursorUpdate = (callback: (data: { userId: string, userName: string, position: { x: number, y: number } }) => void) => {
    socket?.on('cursor_update', callback);
}

export const onSelectionUpdate = (callback: (data: { userId: string, selection: SelectedObject | null }) => void) => {
    socket?.on('selection_update', callback);
}

// NEW IoT LISTENER
export const onIotDataUpdate = (callback: (data: { wallId: string; stressFactor: number }) => void) => {
    socket?.on('iot_data_update', callback);
};

export const onError = (callback: (message: string) => void) => {
    socket?.on('error_message', callback);
};
