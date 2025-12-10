// src/features/notifications/notificationsApi.ts
import { baseApi } from '../../services/baseApi';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'overspending' | 'bill_reminder' | 'recurring_transaction' | 'group_settlement' | 'goal_milestone' | 'low_balance' | 'unrealistic_goal';
  status: 'unread' | 'read' | 'dismissed';
  metadata?: any;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isActionRequired: boolean;
  actionUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: string;
  userId: string;
  metadata?: any;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isActionRequired?: boolean;
  actionUrl?: string;
}

export interface UpdateNotificationDto {
  status?: 'unread' | 'read' | 'dismissed';
  isActionRequired?: boolean;
}

export interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  dismissed: number;
  byType: {
    type: string;
    count: number;
  }[];
  requiresAction: number;
}

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all notifications for a user
    getNotifications: builder.query<Notification[], string>({
      query: (userId: string) => {
        console.log(`Fetching notifications for user ID: ${userId}`);
        return `/notifications/user/${userId}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Notification' as const, id })),
              { type: 'Notification' as const, id: 'LIST' },
            ]
          : [{ type: 'Notification' as const, id: 'LIST' }],
      transformErrorResponse: (response: any) => {
        console.error('Error fetching notifications:', response);
        if (response.status === 404) {
          console.warn('Notifications endpoint not found (404), returning empty array');
          return [];
        }
        return response;
      },
    }),
    
    // Get notification by ID
    getNotificationById: builder.query<Notification, string>({
      query: (id: string) => {
        console.log(`Fetching notification with ID: ${id}`);
        return `/notifications/${id}`;
      },
      providesTags: (_result, _error, id) => [{ type: 'Notification' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Create a new notification
    createNotification: builder.mutation<Notification, CreateNotificationDto>({
      query: (newNotification: CreateNotificationDto) => {
        console.log('Creating notification with data:', newNotification);
        return {
          url: '/notifications',
          method: 'POST',
          body: newNotification,
        };
      },
      transformErrorResponse: (response: any) => {
        console.error('Notification creation error response:', response);
        return response;
      },
      invalidatesTags: [{ type: 'Notification' as const, id: 'LIST' }],
    }),
    
    // Update a notification (mark as read, etc.)
    updateNotification: builder.mutation<Notification, { id: string; updates: UpdateNotificationDto }>({
      query: ({ id, updates }) => {
        console.log(`Updating notification ${id} with:`, updates);
        return {
          url: `/notifications/${id}`,
          method: 'PUT',
          body: updates,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Notification' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Delete a notification
    deleteNotification: builder.mutation<void, string>({
      query: (id: string) => {
        console.log(`Deleting notification ${id}`);
        return {
          url: `/notifications/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_result, _error, id) => [ // FIXED: Added _ prefix
        { type: 'Notification' as const, id },
        { type: 'Notification' as const, id: 'LIST' },
      ],
    }),
    
    // Get notification statistics
    getNotificationStats: builder.query<NotificationStats, string>({
      query: (userId: string) => {
        console.log(`Fetching notification stats for user: ${userId}`);
        return `/notifications/user/${userId}/stats`;
      },
      transformErrorResponse: (response: any) => {
        console.error('Error fetching notification stats:', response);
        return response;
      },
      providesTags: ['Notification' as const],
    }),
    
    // Mark notification as read
    markAsRead: builder.mutation<Notification, string>({
      query: (id: string) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Notification' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Mark all notifications as read
    markAllAsRead: builder.mutation<{ message: string }, string>({
      query: (userId: string) => ({
        url: `/notifications/mark-all-read/user/${userId}`,
        method: 'POST',
      }),
      invalidatesTags: [{ type: 'Notification' as const, id: 'LIST' }],
    }),
    
    // Dismiss notification
    dismissNotification: builder.mutation<Notification, string>({
      query: (id: string) => ({
        url: `/notifications/${id}/dismiss`,
        method: 'PATCH',
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Notification' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Get notifications by type
    getNotificationsByType: builder.query<Notification[], { userId: string; type: string }>({
      query: ({ userId, type }) => {
        console.log(`Fetching ${type} notifications for user: ${userId}`);
        return `/notifications/user/${userId}/type/${type}`;
      },
      providesTags: ['Notification' as const],
    }),
    
    // Get unread notifications
    getUnreadNotifications: builder.query<Notification[], string>({
      query: (userId: string) => {
        console.log(`Fetching unread notifications for user: ${userId}`);
        return `/notifications/user/${userId}/unread`;
      },
      providesTags: ['Notification' as const],
    }),
    
    // Get notifications requiring action
    getActionRequiredNotifications: builder.query<Notification[], string>({
      query: (userId: string) => {
        console.log(`Fetching action-required notifications for user: ${userId}`);
        return `/notifications/user/${userId}/action-required`;
      },
      providesTags: ['Notification' as const],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetNotificationByIdQuery,
  useCreateNotificationMutation,
  useUpdateNotificationMutation,
  useDeleteNotificationMutation,
  useGetNotificationStatsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDismissNotificationMutation,
  useGetNotificationsByTypeQuery,
  useGetUnreadNotificationsQuery,
  useGetActionRequiredNotificationsQuery,
} = notificationsApi;