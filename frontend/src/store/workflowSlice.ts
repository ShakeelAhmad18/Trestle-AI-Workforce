import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import {
  WorkflowSessionState,
  ProjectHistoryItem,
} from '../types';

export interface ExtendedWorkflowState extends WorkflowSessionState {
  projectHistory: ProjectHistoryItem[];
  isHistoryDrawerOpen: boolean;
  isDownloadingZip: boolean;
}

const initialState: ExtendedWorkflowState = {
  threadId: null,
  prompt: 'Build a multi-tenant SaaS project management backend with task assignments, priority levels, and audit logs.',
  status: 'idle',
  currentStep: 'supervisor',
  autoApprove: false,
  researchReport: null,
  architectureSpec: null,
  generatedCodebase: {},
  testSuite: {},
  testResults: null,
  deliveryInfo: null,
  errorLogs: [],
  retryCount: 0,
  events: [],
  isLoading: false,
  error: null,
  projectHistory: [],
  isHistoryDrawerOpen: false,
  isDownloadingZip: false,
};

// Async Thunk: Start Workflow
export const startWorkflow = createAsyncThunk(
  'workflow/startWorkflow',
  async (
    { prompt, autoApprove = false, maxRetries = 3 }: { prompt: string; autoApprove?: boolean; maxRetries?: number },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post('/api/workflow/start', {
        prompt,
        auto_approve: autoApprove,
        max_retries: maxRetries,
      });
      return { threadId: res.data.thread_id, prompt, autoApprove };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to start workflow.');
    }
  }
);

// Async Thunk: Fetch Workflow Status
export const fetchWorkflowStatus = createAsyncThunk(
  'workflow/fetchStatus',
  async (threadId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/workflow/${threadId}`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to fetch status.');
    }
  }
);

// Async Thunk: Resume Interrupted Workflow
export const resumeWorkflow = createAsyncThunk(
  'workflow/resumeWorkflow',
  async (threadId: string, { rejectWithValue }) => {
    try {
      const res = await axios.post(`/api/workflow/${threadId}/resume`);
      return { threadId, message: res.data.message };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to resume workflow.');
    }
  }
);

// Async Thunk: Submit Human Approval
export const submitHumanApproval = createAsyncThunk(
  'workflow/submitHumanApproval',
  async (
    { threadId, approved, feedback }: { threadId: string; approved: boolean; feedback?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post(`/api/workflow/${threadId}/approval`, {
        approved,
        feedback,
      });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Approval submission failed.');
    }
  }
);

// Async Thunk: Fetch Project History
export const fetchProjectHistory = createAsyncThunk(
  'workflow/fetchHistory',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/workflows/history');
      return res.data as ProjectHistoryItem[];
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || err.message || 'Failed to fetch project history.');
    }
  }
);

// Async Thunk: Download Project ZIP
export const downloadProjectZip = createAsyncThunk(
  'workflow/downloadZip',
  async (threadId: string, { rejectWithValue }) => {
    try {
      const res = await axios.get(`/api/workflow/${threadId}/download-zip`, {
        responseType: 'blob',
      });
      const blob = new Blob([res.data], { type: 'application/zip' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `trestle-project-${threadId.slice(0, 8)}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return { threadId, success: true };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Download failed.');
    }
  }
);

export const workflowSlice = createSlice({
  name: 'workflow',
  initialState,
  reducers: {
    setPrompt: (state, action: PayloadAction<string>) => {
      state.prompt = action.payload;
    },
    setAutoApprove: (state, action: PayloadAction<boolean>) => {
      state.autoApprove = action.payload;
    },
    toggleHistoryDrawer: (state) => {
      state.isHistoryDrawerOpen = !state.isHistoryDrawerOpen;
    },
    setHistoryDrawerOpen: (state, action: PayloadAction<boolean>) => {
      state.isHistoryDrawerOpen = action.payload;
    },
    resetActiveSession: (state) => {
      state.threadId = null;
      state.prompt = 'Build a multi-tenant SaaS project management backend with task assignments, priority levels, and audit logs.';
      state.status = 'idle';
      state.currentStep = 'supervisor';
      state.researchReport = null;
      state.architectureSpec = null;
      state.generatedCodebase = {};
      state.testSuite = {};
      state.testResults = null;
      state.deliveryInfo = null;
      state.errorLogs = [];
      state.events = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Start
    builder.addCase(startWorkflow.pending, (state) => {
      state.isLoading = true;
      state.error = null;
      state.status = 'running';
      state.currentStep = 'supervisor';
      state.generatedCodebase = {};
      state.testSuite = {};
      state.events = [];
    });
    builder.addCase(startWorkflow.fulfilled, (state, action) => {
      state.isLoading = false;
      state.threadId = action.payload.threadId;
      state.prompt = action.payload.prompt;
      state.autoApprove = action.payload.autoApprove;
    });
    builder.addCase(startWorkflow.rejected, (state, action) => {
      state.isLoading = false;
      state.status = 'failed';
      state.error = action.payload as string;
    });

    // Fetch Status / Load Session
    builder.addCase(fetchWorkflowStatus.fulfilled, (state, action) => {
      const data = action.payload;
      state.threadId = data.thread_id || state.threadId;
      state.prompt = data.prompt || state.prompt;
      state.status = data.status || state.status;
      state.currentStep = data.current_step || state.currentStep;
      state.autoApprove = data.auto_approve ?? state.autoApprove;
      state.researchReport = data.research_report || state.researchReport;
      state.architectureSpec = data.architecture_spec || state.architectureSpec;
      state.generatedCodebase = data.generated_codebase || state.generatedCodebase;
      state.testSuite = data.test_suite || state.testSuite;
      state.testResults = data.test_results || state.testResults;
      state.deliveryInfo = data.delivery_info || state.deliveryInfo;
      state.retryCount = data.retry_count ?? state.retryCount;
      if (data.events && Array.isArray(data.events)) {
        state.events = data.events;
      }
      if (data.error) {
        state.error = data.error;
      }
    });

    // Resume
    builder.addCase(resumeWorkflow.pending, (state) => {
      state.isLoading = true;
      state.status = 'running';
    });
    builder.addCase(resumeWorkflow.fulfilled, (state) => {
      state.isLoading = false;
      state.status = 'running';
    });
    builder.addCase(resumeWorkflow.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Approval
    builder.addCase(submitHumanApproval.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(submitHumanApproval.fulfilled, (state) => {
      state.isLoading = false;
      state.status = 'running';
    });

    // History
    builder.addCase(fetchProjectHistory.fulfilled, (state, action) => {
      state.projectHistory = action.payload;
    });

    // Download ZIP
    builder.addCase(downloadProjectZip.pending, (state) => {
      state.isDownloadingZip = true;
    });
    builder.addCase(downloadProjectZip.fulfilled, (state) => {
      state.isDownloadingZip = false;
    });
    builder.addCase(downloadProjectZip.rejected, (state, action) => {
      state.isDownloadingZip = false;
      state.error = action.payload as string;
    });
  },
});

export const {
  setPrompt,
  setAutoApprove,
  toggleHistoryDrawer,
  setHistoryDrawerOpen,
  resetActiveSession,
} = workflowSlice.actions;

export default workflowSlice.reducer;
