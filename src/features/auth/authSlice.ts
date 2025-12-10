// features/auth/authSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Define proper types
interface User {
  id: string;
  email: string;
  name: string;
  firstName: string;
  lastName: string;
  role?: string;
  userType?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: string;
}

// Keys for localStorage
const TOKEN_KEY = 'budget_tracker_token';
const USER_KEY = 'budget_tracker_user';

// Load initial state
const storedToken = localStorage.getItem(TOKEN_KEY);
const storedUser = localStorage.getItem(USER_KEY);

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  token: storedToken,
  isLoading: false,
  error: null,
};

// ✅ FIXED: Added /api prefix to URL
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {
      console.log('📝 Registering user:', userData.email);
      
      // Prepare the data to send to backend
      const requestData = {
        email: userData.email,
        password: userData.password,
        firstName: userData.firstName,
        lastName: userData.lastName,
        userType: userData.userType || 'personal'
      };
      
      console.log('📤 Sending to backend:', requestData);
      
      // ✅ FIXED: Added /api prefix
      const response = await fetch('http://localhost:8000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      console.log('📊 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Backend error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return rejectWithValue(errorData.message || 'Registration failed');
        } catch {
          return rejectWithValue(errorText || 'Registration failed');
        }
      }

      const data = await response.json();
      console.log('✅ Backend response:', data);
      
      // Store session if token is provided
      if (data.access_token || data.token) {
        const token = data.access_token || data.token;
        localStorage.setItem(TOKEN_KEY, token);
        
        const userToStore: User = data.user || {
          id: data.userId || `user_${Date.now()}`,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.userType || 'personal',
          userType: userData.userType || 'personal'
        };
        
        localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
      }
      
      return {
        access_token: data.access_token || data.token || null,
        user: data.user || {
          id: data.userId || `user_${Date.now()}`,
          email: userData.email,
          name: `${userData.firstName} ${userData.lastName}`,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.userType || 'personal',
          userType: userData.userType || 'personal'
        }
      };
      
    } catch (error: any) {
      console.error('❌ Registration error:', error);
      
      if (error.message && error.message.includes('Failed to fetch')) {
        return rejectWithValue('Cannot connect to backend server. Please make sure it\'s running on http://localhost:8000');
      }
      
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

// ✅ FIXED: Added /api prefix to URL
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      console.log('🔐 Logging in:', credentials.email);
      
      // ✅ FIXED: Added /api prefix
      const response = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Login error:', errorText);
        
        try {
          const errorData = JSON.parse(errorText);
          return rejectWithValue(errorData.message || 'Invalid email or password');
        } catch {
          return rejectWithValue(errorText || 'Invalid email or password');
        }
      }

      const data = await response.json();
      console.log('✅ Login response:', data);
      
      // Store session
      if (data.access_token || data.token) {
        const token = data.access_token || data.token;
        localStorage.setItem(TOKEN_KEY, token);
        
        const userToStore: User = data.user || {
          id: data.userId || `user_${Date.now()}`,
          email: credentials.email,
          name: data.name || 'User',
          firstName: data.firstName || 'User',
          lastName: data.lastName || 'Account',
          role: data.role || 'personal',
          userType: data.userType || data.role || 'personal'
        };
        
        localStorage.setItem(USER_KEY, JSON.stringify(userToStore));
      }
      
      return {
        access_token: data.access_token || data.token || null,
        user: data.user || {
          id: data.userId || `user_${Date.now()}`,
          email: credentials.email,
          name: data.name || 'User',
          firstName: data.firstName || 'User',
          lastName: data.lastName || 'Account',
          role: data.role || 'personal',
          userType: data.userType || data.role || 'personal'
        }
      };
      
    } catch (error: any) {
      console.error('❌ Login API error:', error);
      
      if (error.message && error.message.includes('Failed to fetch')) {
        return rejectWithValue('Cannot connect to backend server. Please make sure it\'s running on http://localhost:8000');
      }
      
      return rejectWithValue(error.message || 'Network error');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.error = null;
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    },
    clearError: (state) => {
      state.error = null;
    },
    restoreUser: (state) => {
      const token = localStorage.getItem(TOKEN_KEY);
      const user = localStorage.getItem(USER_KEY);
      
      if (token && user) {
        try {
          state.token = token;
          state.user = JSON.parse(user);
        } catch (error) {
          console.error('Failed to restore user:', error);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.access_token;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { logout, clearError, restoreUser } = authSlice.actions;
export default authSlice.reducer;

