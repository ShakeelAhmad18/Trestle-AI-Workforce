import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { AgentProfile } from '../types';

export const DEFAULT_AGENTS: AgentProfile[] = [
  {
    id: 'planner',
    name: 'Planner',
    role: 'PLANNER',
    tagline: 'Optimizes workflow.',
    avatar: '/avatars/planner.png',
    color: '#a855f7',
    model: 'Gemini 2.5 Flash',
    skills: ['Workflow Routing', 'Scope Decomposition', 'Dependency Mapping'],
    description: 'Analyzes client business requirements, validates complexity, and orchestrates the multi-agent graph.',
  },
  {
    id: 'orchestrator',
    name: 'Orchestrator',
    role: 'ORCHESTRATOR',
    tagline: 'Manages the swarm.',
    avatar: '/avatars/orchestrator.png',
    color: '#ec4899',
    model: 'Gemini 2.5 Flash',
    skills: ['Agent State Management', 'Routing Decisions', 'Interrupt Control'],
    description: 'Coordinates data flow between market intelligence, architecture, and code synthesis agents.',
  },
  {
    id: 'architect',
    name: 'Architect',
    role: 'ARCHITECT',
    tagline: 'Designs robust systems.',
    avatar: '/avatars/architect.png',
    color: '#3b82f6',
    model: 'Claude Sonnet 4.6',
    skills: ['SQLAlchemy 2.0 ERD', 'OpenAPI 3.1 Specs', 'Clean Architecture'],
    description: 'Drafts database entity relationship schemas, REST endpoints, and security layers using strict Pydantic v2 schemas.',
  },
  {
    id: 'coder',
    name: 'Coder',
    role: 'CODER',
    tagline: 'Writes production code.',
    avatar: '/avatars/coder.png',
    color: '#ff6b35',
    model: 'Claude Sonnet 4.6',
    skills: ['FastAPI Clean Architecture', 'Pydantic v2 Validation', 'Pytest TestClient'],
    description: 'Generates modular Python backend code (Routers, Services, CRUD, Models) with 100% test coverage.',
  },
  {
    id: 'sentry',
    name: 'Sentry',
    role: 'SENTRY',
    tagline: 'Protects the network.',
    avatar: '/avatars/sentry.png',
    color: '#06b6d4',
    model: 'Claude Sonnet 4.6',
    skills: ['CORS Middleware', 'PBKDF2-HMAC Auth', 'Slowapi Rate Limiting'],
    description: 'Enforces enterprise zero-trust security controls, authentication tokens, and SQL injection prevention.',
  },
  {
    id: 'researcher',
    name: 'Researcher',
    role: 'RESEARCHER',
    tagline: 'Gathers market intelligence.',
    avatar: '/avatars/researcher.png',
    color: '#10b981',
    model: 'Gemini 2.5 Flash',
    skills: ['Tavily Search API', 'Marketplace Feature Discovery', 'Pricing Analysis'],
    description: 'Scrapes global marketplace demand patterns to identify features users actively pay for.',
  },
  {
    id: 'tester',
    name: 'QA Tester',
    role: 'SANDBOX TESTER',
    tagline: 'Executes microVM tests.',
    avatar: '/avatars/tester.png',
    color: '#eab308',
    model: 'E2B Firecracker VM',
    skills: ['E2B MicroVM Sandbox', 'Pytest Runner', 'Traceback Parser'],
    description: 'Runs test suites inside isolated Firecracker microVMs and routes failure logs back to the Coder agent in a self-healing loop.',
  },
  {
    id: 'delivery',
    name: 'Delivery',
    role: 'DELIVERY AGENT',
    tagline: 'Ships to GitHub & Client.',
    avatar: '/avatars/delivery.png',
    color: '#f97316',
    model: 'PyGithub API',
    skills: ['Private Repo Creation', 'Commit Publishing', 'Executive Handoff'],
    description: 'Packages verified code, pushes to a private GitHub repository, and generates an executive client handoff summary.',
  },
];

interface AgentState {
  agents: AgentProfile[];
  selectedAgentId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AgentState = {
  agents: DEFAULT_AGENTS,
  selectedAgentId: 'architect',
  isLoading: false,
  error: null,
};

export const fetchAgents = createAsyncThunk('agents/fetch', async () => {
  try {
    const res = await axios.get('/api/agents');
    return res.data;
  } catch (err: any) {
    // If backend is offline, return default agents
    return DEFAULT_AGENTS;
  }
});

export const agentSlice = createSlice({
  name: 'agents',
  initialState,
  reducers: {
    selectAgent: (state, action: PayloadAction<string>) => {
      state.selectedAgentId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(fetchAgents.fulfilled, (state, action) => {
      if (Array.isArray(action.payload) && action.payload.length > 0) {
        state.agents = action.payload;
      }
    });
  },
});

export const { selectAgent } = agentSlice.actions;
export default agentSlice.reducer;
