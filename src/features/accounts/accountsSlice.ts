import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import type { Account } from './accountsApi';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

interface AccountsState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountsState = {
  accounts: [],
  isLoading: false,
  error: null,
};

export const fetchAccounts = createAsyncThunk(
  'accounts/fetchAccounts',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get(`/accounts/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch accounts');
    }
  }
);

export const createAccount = createAsyncThunk(
  'accounts/createAccount',
  async (accountData: any, { rejectWithValue }) => {
    try {
      console.log('📤 Frontend sending to API:', accountData);
      
      // CRITICAL: Make sure userId is included
      if (!accountData.userId) {
        console.error('❌ Missing userId in account data');
        return rejectWithValue('User ID is required to create an account');
      }
      
      // The API will transform the data, just send it as-is
      const response = await axiosInstance.post('/accounts', accountData);
      console.log('✅ Backend response:', response.data);
      return response.data;
      
    } catch (error: any) {
      console.error('❌ Create account error:', error);
      
      // Log detailed error info
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        return rejectWithValue(error.response.data?.message || `Server error: ${error.response.status}`);
      } else if (error.request) {
        console.error('No response received:', error.request);
        return rejectWithValue('No response from server. Check if backend is running.');
      } else {
        console.error('Request setup error:', error.message);
        return rejectWithValue(error.message || 'Failed to create account');
      }
    }
  }
);

const accountsSlice = createSlice({
  name: 'accounts',
  initialState,
  reducers: {
    // Add a reducer to clear errors if needed
    clearError: (state) => {
      state.error = null;
    },
    // Add a reducer to manually add account (for testing)
    addAccountManually: (state, action) => {
      state.accounts.push(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Accounts
      .addCase(fetchAccounts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAccounts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts = action.payload;
      })
      .addCase(fetchAccounts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create Account
      .addCase(createAccount.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createAccount.fulfilled, (state, action) => {
        state.isLoading = false;
        state.accounts.push(action.payload);
      })
      .addCase(createAccount.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export the new actions
export const { clearError, addAccountManually } = accountsSlice.actions;
export default accountsSlice.reducer;