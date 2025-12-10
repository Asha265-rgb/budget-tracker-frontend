// Updated groupsApi.ts with correct endpoints based on your backend
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Types - ALL EXPORTED
export interface Group {
  id: string;
  name: string;
  description?: string;
  currency?: string;
  status?: string;
  totalBalance?: number;
  memberCount?: number;
  createdByUserId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invitation {
  id: string;
  groupId: string;
  groupName: string;
  inviteeEmail: string;
  inviteeName?: string;
  invitedByName?: string;
  role: 'admin' | 'member';
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'sent' | 'accepted' | 'expired';
  message?: string;
  createdAt: string;
  updatedAt?: string;
  expiresAt?: string;
  token?: string;
}

export interface GroupMember {
  userId: string;
  userName: string;
  userEmail: string;
  role: 'admin' | 'member';
  balance: number;
  totalPaid: number;
  totalOwed: number;
  accountBalance: number;
  joinedAt?: string;
}

export const groupsApi = createApi({
  reducerPath: 'groupsApi',
  baseQuery: fetchBaseQuery({
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('authToken') || localStorage.getItem('token');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: ['Group', 'GroupMember', 'GroupTransaction', 'GroupBalance', 'GroupNotification', 'GroupActivity', 'Invitation'],
  endpoints: (builder) => ({
    // Get all groups for user
    getGroups: builder.query<Group[], void>({
      query: () => '/groups',
      providesTags: ['Group'],
    }),

    // Get group by ID
    getGroupById: builder.query<Group, string>({
      query: (groupId) => `/groups/${groupId}`,
      providesTags: ['Group'],
    }),

    // Get group members
    getGroupMembers: builder.query<GroupMember[], string>({
      query: (groupId) => `/groups/${groupId}/members`,
      providesTags: ['GroupMember'],
    }),

    // Get group transactions/expenses
    getGroupTransactions: builder.query<any[], string>({
      query: (groupId) => `/groups/${groupId}/expenses`,
      providesTags: ['GroupTransaction'],
    }),

    // Get group balance
    getGroupBalance: builder.query<any, string>({
      query: (groupId) => `/groups/${groupId}/balance`,
      providesTags: ['GroupBalance'],
    }),

    // Get group notifications
    getGroupNotifications: builder.query<any[], string>({
      query: (groupId) => `/groups/${groupId}/notifications`,
      providesTags: ['GroupNotification'],
    }),

    // Get group activities
    getGroupActivities: builder.query<any[], string>({
      query: (groupId) => `/groups/${groupId}/activities`,
      providesTags: ['GroupActivity'],
    }),

    // Get group accounts
    getGroupAccounts: builder.query<any[], string>({
      query: (groupId) => `/groups/${groupId}/accounts`,
      providesTags: ['GroupTransaction'],
    }),

    // ✅ CORRECTED: Get pending invitations for group
    getGroupInvitations: builder.query<Invitation[], string>({
      query: (groupId) => `/invitations/group/${groupId}/pending`,
      providesTags: ['Invitation'],
    }),

    // ✅ CORRECTED: Get sent invitations
    getSentInvitations: builder.query<Invitation[], void>({
      query: () => '/invitations/sent',
      providesTags: ['Invitation'],
    }),

    // ✅ CORRECTED: Get received invitations
    getReceivedInvitations: builder.query<Invitation[], void>({
      query: () => '/invitations/received',
      providesTags: ['Invitation'],
    }),

    // Create group
    createGroup: builder.mutation<Group, { name: string; description?: string; currency?: string }>({
      query: (groupData) => ({
        url: '/groups',
        method: 'POST',
        body: groupData,
      }),
      invalidatesTags: ['Group'],
    }),

    // ✅ CORRECTED: Invite member - should use /invitations endpoint
    inviteMember: builder.mutation<Invitation, { 
      groupId: string; 
      email: string; 
      role?: 'admin' | 'member'; 
      message?: string;
      name?: string;
    }>({
      query: ({ groupId, email, role = 'member', message, name }) => ({
        url: '/invitations',
        method: 'POST',
        body: { 
          groupId, 
          email, 
          role, 
          message,
          name,
          inviteeName: name
        },
      }),
      invalidatesTags: ['Invitation'],
    }),

    // ✅ CORRECTED: Accept invitation via token
    acceptInvitation: builder.mutation<Invitation, { token: string; userId?: string }>({
      query: ({ token, userId }) => ({
        url: `/invitations/accept/${token}`,
        method: 'POST',
        body: userId ? { userId } : undefined,
      }),
      invalidatesTags: ['Invitation', 'Group', 'GroupMember'],
    }),

    // ✅ CORRECTED: Decline invitation via token
    declineInvitation: builder.mutation<Invitation, { token: string }>({
      query: ({ token }) => ({
        url: `/invitations/decline/${token}`,
        method: 'POST',
      }),
      invalidatesTags: ['Invitation'],
    }),

    // Create expense with split
    createExpenseWithSplit: builder.mutation<any, { groupId: string; expense: any }>({
      query: ({ groupId, expense }) => ({
        url: `/groups/${groupId}/expenses`,
        method: 'POST',
        body: expense,
      }),
      invalidatesTags: ['GroupTransaction', 'GroupBalance'],
    }),

    // Add account deposit
    addGroupAccount: builder.mutation<any, { groupId: string; accountData: any }>({
      query: ({ groupId, accountData }) => ({
        url: `/groups/${groupId}/accounts/deposit`,
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags: ['GroupTransaction', 'GroupBalance', 'GroupMember'],
    }),

    // Settle debt
    settleDebt: builder.mutation<any, { groupId: string; settlement: any }>({
      query: ({ groupId, settlement }) => ({
        url: `/groups/${groupId}/settle`,
        method: 'POST',
        body: settlement,
      }),
      invalidatesTags: ['GroupBalance', 'GroupTransaction'],
    }),

    // Create notification
    createGroupNotification: builder.mutation<any, { groupId: string; notification: any }>({
      query: ({ groupId, notification }) => ({
        url: `/groups/${groupId}/notifications`,
        method: 'POST',
        body: notification,
      }),
      invalidatesTags: ['GroupNotification'],
    }),

    // Mark notification as read
    markNotificationAsRead: builder.mutation<any, { notificationId: string }>({
      query: ({ notificationId }) => ({
        url: `/notifications/${notificationId}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['GroupNotification'],
    }),

    // Mark all notifications as read
    markAllNotificationsAsRead: builder.mutation<any, string>({
      query: (groupId) => ({
        url: `/groups/${groupId}/notifications/read-all`,
        method: 'PATCH',
      }),
      invalidatesTags: ['GroupNotification'],
    }),

    // ✅ CORRECTED: Approve invitation
    approveInvitation: builder.mutation<Invitation, { invitationId: string; notes?: string }>({
      query: ({ invitationId, notes }) => ({
        url: `/invitations/${invitationId}/approve`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['Invitation', 'GroupMember'],
    }),

    // ✅ CORRECTED: Reject invitation
    rejectInvitation: builder.mutation<Invitation, { invitationId: string; notes?: string }>({
      query: ({ invitationId, notes }) => ({
        url: `/invitations/${invitationId}/reject`,
        method: 'POST',
        body: { notes },
      }),
      invalidatesTags: ['Invitation'],
    }),

    // ✅ CORRECTED: Cancel invitation
    cancelInvitation: builder.mutation<Invitation, string>({
      query: (invitationId) => ({
        url: `/invitations/${invitationId}/cancel`,
        method: 'POST',
      }),
      invalidatesTags: ['Invitation'],
    }),

    // ✅ CORRECTED: Get all invitations
    getAllInvitations: builder.query<Invitation[], void>({
      query: () => '/invitations',
      providesTags: ['Invitation'],
    }),

    // Get invitation by ID
    getInvitationById: builder.query<Invitation, string>({
      query: (invitationId) => `/invitations/${invitationId}`,
      providesTags: ['Invitation'],
    }),

    // Resend invitation
    resendInvitation: builder.mutation<Invitation, string>({
      query: (invitationId) => ({
        url: `/invitations/${invitationId}/resend`,
        method: 'POST',
      }),
      invalidatesTags: ['Invitation'],
    }),

    // ✅ NEW: Alternative invite endpoint via groups
    inviteMemberViaGroup: builder.mutation<Invitation, { 
      groupId: string; 
      email: string; 
      role?: 'admin' | 'member'; 
      message?: string;
    }>({
      query: ({ groupId, email, role = 'member', message }) => ({
        url: `/groups/${groupId}/invite`,
        method: 'POST',
        body: { email, role, message },
      }),
      invalidatesTags: ['Invitation'],
    }),
  }),
});

// Export hooks
export const {
  useGetGroupsQuery,
  useGetGroupByIdQuery,
  useGetGroupMembersQuery,
  useGetGroupTransactionsQuery,
  useGetGroupBalanceQuery,
  useGetGroupNotificationsQuery,
  useGetGroupActivitiesQuery,
  useGetGroupAccountsQuery,
  useGetGroupInvitationsQuery,
  useGetSentInvitationsQuery,
  useGetReceivedInvitationsQuery,
  useGetAllInvitationsQuery,
  useGetInvitationByIdQuery,
  useCreateGroupMutation,
  useInviteMemberMutation,
  useInviteMemberViaGroupMutation,
  useAcceptInvitationMutation,
  useDeclineInvitationMutation,
  useCreateExpenseWithSplitMutation,
  useAddGroupAccountMutation,
  useSettleDebtMutation,
  useCreateGroupNotificationMutation,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  useApproveInvitationMutation,
  useRejectInvitationMutation,
  useCancelInvitationMutation,
  useResendInvitationMutation,
} = groupsApi;


// export type { Group, GroupMember, GroupTransaction, GroupStats, GroupBalance, CreateGroupDto, InviteMemberDto, CreateGroupTransactionDto };