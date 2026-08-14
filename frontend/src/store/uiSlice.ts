import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UIState {
  activeStudioTab: 'swarm' | 'research' | 'architecture' | 'code' | 'terminal' | 'delivery';
  selectedCodeFile: string;
  isApprovalModalOpen: boolean;
  activeAgentModal: string | null;
  notification: { type: 'success' | 'error' | 'info'; message: string } | null;
}

const initialState: UIState = {
  activeStudioTab: 'swarm',
  selectedCodeFile: 'app/main.py',
  isApprovalModalOpen: false,
  activeAgentModal: null,
  notification: null,
};

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setActiveStudioTab: (state, action: PayloadAction<UIState['activeStudioTab']>) => {
      state.activeStudioTab = action.payload;
    },
    setSelectedCodeFile: (state, action: PayloadAction<string>) => {
      state.selectedCodeFile = action.payload;
    },
    setApprovalModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isApprovalModalOpen = action.payload;
    },
    setActiveAgentModal: (state, action: PayloadAction<string | null>) => {
      state.activeAgentModal = action.payload;
    },
    showNotification: (
      state,
      action: PayloadAction<{ type: 'success' | 'error' | 'info'; message: string }>
    ) => {
      state.notification = action.payload;
    },
    clearNotification: (state) => {
      state.notification = null;
    },
  },
});

export const {
  setActiveStudioTab,
  setSelectedCodeFile,
  setApprovalModalOpen,
  setActiveAgentModal,
  showNotification,
  clearNotification,
} = uiSlice.actions;

export default uiSlice.reducer;
