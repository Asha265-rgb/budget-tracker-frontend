export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'personal' | 'business' | 'admin' | 'group'; // ← ADDED 'group' to match backend
  preferredCurrency: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

// ADD THIS INTERFACE - it matches what your backend returns
export interface AuthResponse {
  access_token: string;
  user: User;
}