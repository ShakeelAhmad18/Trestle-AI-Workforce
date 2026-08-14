import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Configure global Axios authorization header if token exists
const savedToken = localStorage.getItem('trestle_token');
if (savedToken) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
}

export interface UserProfile {
  email: string;
  full_name?: string;
  is_verified: boolean;
  created_at?: string;
  last_login?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isAuthModalOpen: boolean;
  authModalView: 'login' | 'register' | 'verify';
  pendingEmail: string;
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
  devCodeHint: string | null;
}

const initialState: AuthState = {
  user: null,
  token: savedToken,
  isAuthModalOpen: false,
  authModalView: 'login',
  pendingEmail: '',
  isLoading: false,
  error: null,
  successMessage: null,
  devCodeHint: null,
};

// Async Thunk: Register
export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    { email, password, fullName }: { email: string; password: string; fullName?: string },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post('/api/auth/register', {
        email,
        password,
        full_name: fullName,
      });
      return { email, devCode: res.data.dev_code, message: res.data.message };
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Registration failed.');
    }
  }
);

// Async Thunk: Verify Email Code
export const verifyEmail = createAsyncThunk(
  'auth/verifyEmail',
  async ({ email, code }: { email: string; code: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/verify-email', { email, code });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Verification failed.');
    }
  }
);

// Async Thunk: Login
export const loginUser = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Login failed.');
    }
  }
);

// Async Thunk: Resend Code
export const resendCode = createAsyncThunk(
  'auth/resendCode',
  async (email: string, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/auth/resend-code', { email });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail || 'Failed to resend code.');
    }
  }
);

// Async Thunk: Fetch Current User
export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const res = await axios.get('/api/auth/me');
    return res.data;
  } catch (err: any) {
    return rejectWithValue(err.response?.data?.detail || 'Failed to fetch user.');
  }
});

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    openAuthModal: (state, action: PayloadAction<'login' | 'register' | 'verify'>) => {
      state.isAuthModalOpen = true;
      state.authModalView = action.payload;
      state.error = null;
      state.successMessage = null;
    },
    closeAuthModal: (state) => {
      state.isAuthModalOpen = false;
      state.error = null;
      state.successMessage = null;
    },
    setAuthModalView: (state, action: PayloadAction<'login' | 'register' | 'verify'>) => {
      state.authModalView = action.payload;
      state.error = null;
    },
    setPendingEmail: (state, action: PayloadAction<string>) => {
      state.pendingEmail = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('trestle_token');
      delete axios.defaults.headers.common['Authorization'];
    },
    clearAuthMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.pendingEmail = action.payload.email;
      state.devCodeHint = action.payload.devCode || null;
      state.authModalView = 'verify';
      state.successMessage = action.payload.message;
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Verify Email
    builder.addCase(verifyEmail.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(verifyEmail.fulfilled, (state, action) => {
      state.isLoading = false;
      state.token = action.payload.token;
      state.user = {
        email: action.payload.email,
        is_verified: true,
      };
      if (action.payload.token) {
        localStorage.setItem('trestle_token', action.payload.token);
        axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
      }
      state.isAuthModalOpen = false;
      state.successMessage = 'Email verified successfully! Full access granted.';
    });
    builder.addCase(verifyEmail.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      if (!action.payload.is_verified) {
        state.pendingEmail = action.payload.email;
        state.devCodeHint = action.payload.dev_code || null;
        state.authModalView = 'verify';
        state.error = 'Please verify your email before logging in. A 6-digit code has been dispatched.';
      } else {
        state.token = action.payload.token;
        state.user = {
          email: action.payload.email,
          full_name: action.payload.full_name,
          is_verified: true,
        };
        if (action.payload.token) {
          localStorage.setItem('trestle_token', action.payload.token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${action.payload.token}`;
        }
        state.isAuthModalOpen = false;
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Fetch Me
    builder.addCase(fetchMe.fulfilled, (state, action) => {
      state.user = action.payload;
    });
    builder.addCase(fetchMe.rejected, (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem('trestle_token');
    });
  },
});

export const {
  openAuthModal,
  closeAuthModal,
  setAuthModalView,
  setPendingEmail,
  logout,
  clearAuthMessages,
} = authSlice.actions;

export default authSlice.reducer;
