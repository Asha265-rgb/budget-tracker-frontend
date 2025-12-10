// src/features/auth/authApi.ts
import { baseApi } from '../../services/baseApi';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'personal' | 'business' | 'group' | 'admin';
  preferredCurrency: string;
  isVerified: boolean;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'personal' | 'business';
  preferredCurrency?: string;
  phoneNumber?: string;
}

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCurrentUser: builder.query<User, void>({
      query: () => '/users/profile/me',
      providesTags: ['User' as const], // FIXED: Changed 'as never' to 'as const'
    }),
    login: builder.mutation<LoginResponse, LoginCredentials>({
      query: (credentials: LoginCredentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation<User, RegisterData>({
      query: (userData: RegisterData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),
  }),
});

export const { 
  useGetCurrentUserQuery, 
  useLoginMutation, 
  useRegisterMutation 
} = authApi;