
// src/state/appStore.ts
import { create } from 'zustand';
import { AppStore } from '../types/index';
import { createAuthSlice } from './slices/createAuthSlice';
import { createUISlice } from './slices/createUISlice';
import { createProjectSlice } from './slices/createProjectSlice';
import { createEditorSlice } from './slices/createEditorSlice';
import { createAISlice } from './slices/createAISlice';
import { createCollaborationSlice } from './slices/createCollaborationSlice';

export const useAppStore = create<AppStore>()((...a) => ({
    ...createAuthSlice(...a),
    ...createUISlice(...a),
    ...createProjectSlice(...a),
    ...createEditorSlice(...a),
    ...createAISlice(...a),
    ...createCollaborationSlice(...a),
}));