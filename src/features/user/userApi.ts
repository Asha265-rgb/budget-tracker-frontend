// src/features/user/userApi.ts
import { baseApi } from '../../services/baseApi'; // Changed from api to baseApi

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferredCurrency: string;
  userType: 'personal' | 'business' | 'group' | 'admin';
  isVerified: boolean;
  phoneNumber?: string;
  profilePicture?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  preferredCurrency?: string;
  userType?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserStats {
  totalTransactions: number;
  totalAccounts: number;
  totalBudgets: number;
  totalGoals: number;
  totalGroups: number;
  joinedDate: string;
  lastLogin: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  pushNotifications: boolean;
  budgetAlerts: boolean;
  goalReminders: boolean;
  billReminders: boolean;
  lowBalanceAlerts: boolean;
  weeklyReports: boolean;
  monthlyReports: boolean;
}

export const userApi = baseApi.injectEndpoints({ // Changed from api to baseApi
  endpoints: (builder) => ({
    // Get current user profile
    getProfile: builder.query<User, void>({
      query: () => {
        console.log('Fetching user profile');
        return '/users/profile/me';
      },
      providesTags: ['User' as const],
      transformErrorResponse: (response: any) => {
        console.error('Error fetching user profile:', response);
        return response;
      },
    }),
    
    // Update user profile
    updateProfile: builder.mutation<User, UpdateUserDto>({
      query: (updates: UpdateUserDto) => {
        console.log('Updating user profile with:', updates);
        return {
          url: '/users/profile',
          method: 'PUT',
          body: updates,
        };
      },
      transformErrorResponse: (response: any) => {
        console.error('Profile update error:', response);
        return response;
      },
      invalidatesTags: ['User' as const],
    }),
    
    // Change password
    changePassword: builder.mutation<{ message: string }, ChangePasswordDto>({
      query: (passwordData: ChangePasswordDto) => {
        console.log('Changing password');
        return {
          url: '/users/change-password',
          method: 'POST',
          body: passwordData,
        };
      },
      transformErrorResponse: (response: any) => {
        console.error('Password change error:', response);
        return response;
      },
    }),
    
    // Get user statistics
    getUserStats: builder.query<UserStats, string>({
      query: (userId: string) => {
        console.log(`Fetching stats for user: ${userId}`);
        return `/users/${userId}/stats`;
      },
      providesTags: ['User' as const],
    }),
    
    // Delete user account
    deleteAccount: builder.mutation<{ message: string }, string>({
      query: (password: string) => {
        console.log('Deleting user account');
        return {
          url: '/users/delete-account',
          method: 'DELETE',
          body: { password },
        };
      },
    }),
    
    // Get notification preferences
    getNotificationPreferences: builder.query<NotificationPreferences, void>({
      query: () => '/users/notification-preferences',
      providesTags: ['User' as const],
    }),
    
    // Update notification preferences
    updateNotificationPreferences: builder.mutation<User, NotificationPreferences>({
      query: (preferences: NotificationPreferences) => ({
        url: '/users/notification-preferences',
        method: 'PUT',
        body: preferences,
      }),
      invalidatesTags: ['User' as const],
    }),
    
    // Upload profile picture
    uploadProfilePicture: builder.mutation<User, FormData>({
      query: (formData: FormData) => {
        console.log('Uploading profile picture');
        return {
          url: '/users/upload-profile-picture',
          method: 'POST',
          body: formData,
        };
      },
      transformResponse: (response: User) => {
        console.log('Profile picture uploaded successfully:', response);
        return response;
      },
      transformErrorResponse: (response: any) => {
        console.error('Profile picture upload error:', response);
        return response;
      },
      invalidatesTags: ['User' as const],
    }),
    
    // Delete profile picture
    deleteProfilePicture: builder.mutation<User, void>({
      query: () => ({
        url: '/users/profile-picture',
        method: 'DELETE',
      }),
      invalidatesTags: ['User' as const],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useChangePasswordMutation,
  useGetUserStatsQuery,
  useDeleteAccountMutation,
  useGetNotificationPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useUploadProfilePictureMutation,
  useDeleteProfilePictureMutation,
} = userApi;