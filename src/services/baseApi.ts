// src/services/baseApi.ts - UPDATED (AUTH ENDPOINTS REMOVED)
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Base URL with /api prefix
const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

// Define TypeScript interfaces
export interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  accountId: string;
}

export interface Budget {
  id: string;
  name: string;
  category: string;
  amount: number;
  spent: number;
  period: string;
}

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Invitation {
  id: string;
  groupId: string;
  inviteeEmail: string;
  status: string;
  createdAt: string;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  type?: 'income' | 'expense';
  category?: string;
  accountId?: string;
}

export interface ReportFilters {
  startDate?: string;
  endDate?: string;
  type?: string;
}

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ 
    baseUrl: baseUrl,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),
  tagTypes: [
    'Account',
    'Group',
    'Transaction',
    'Budget',
    'Goal',
    'Notification',
    'User',
    'GroupMember',
    'GroupTransaction',
    'GroupStats',
    'GroupBalance',
    'GroupNotification',
    'GroupActivity',
    'GoalTransaction',
    'Report',
    'Invitation',
  ],
  endpoints: (builder) => ({
    // ========== NO AUTH ENDPOINTS HERE ==========
    // Auth endpoints are defined in authApi.ts via injectEndpoints()

    // ========== ACCOUNT ENDPOINTS ==========
    getAccounts: builder.query<Account[], void>({
      query: () => '/accounts',
      providesTags: ['Account'],
    }),

    createAccount: builder.mutation<Account, Partial<Account>>({
      query: (accountData) => ({
        url: '/accounts',
        method: 'POST',
        body: accountData,
      }),
      invalidatesTags: ['Account'],
    }),

    updateAccount: builder.mutation<Account, { id: string; data: Partial<Account> }>({
      query: ({ id, data }) => ({
        url: `/accounts/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Account'],
    }),

    deleteAccount: builder.mutation<void, string>({
      query: (id) => ({
        url: `/accounts/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Account'],
    }),

    // ========== TRANSACTION ENDPOINTS ==========
    getTransactions: builder.query<Transaction[], TransactionFilters>({
      query: (filters = {}) => ({
        url: '/transactions',
        params: {
          page: filters.page || 1,
          limit: filters.limit || 20,
          startDate: filters.startDate,
          endDate: filters.endDate,
          type: filters.type,
          category: filters.category,
          accountId: filters.accountId,
        },
      }),
      providesTags: ['Transaction'],
    }),

    createTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (transactionData) => ({
        url: '/transactions',
        method: 'POST',
        body: transactionData,
      }),
      invalidatesTags: ['Transaction', 'Account', 'Budget'],
    }),

    updateTransaction: builder.mutation<Transaction, { id: string; data: Partial<Transaction> }>({
      query: ({ id, data }) => ({
        url: `/transactions/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Transaction', 'Account', 'Budget'],
    }),

    deleteTransaction: builder.mutation<void, string>({
      query: (id) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Transaction', 'Account', 'Budget'],
    }),

    // ========== BUDGET ENDPOINTS ==========
    getBudgets: builder.query<Budget[], void>({
      query: () => '/budgets',
      providesTags: ['Budget'],
    }),

    createBudget: builder.mutation<Budget, Partial<Budget>>({
      query: (budgetData) => ({
        url: '/budgets',
        method: 'POST',
        body: budgetData,
      }),
      invalidatesTags: ['Budget'],
    }),

    updateBudget: builder.mutation<Budget, { id: string; data: Partial<Budget> }>({
      query: ({ id, data }) => ({
        url: `/budgets/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Budget'],
    }),

    deleteBudget: builder.mutation<void, string>({
      query: (id) => ({
        url: `/budgets/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Budget'],
    }),

    // ========== GOAL ENDPOINTS ==========
    getGoals: builder.query<Goal[], void>({
      query: () => '/goals',
      providesTags: ['Goal'],
    }),

    createGoal: builder.mutation<Goal, Partial<Goal>>({
      query: (goalData) => ({
        url: '/goals',
        method: 'POST',
        body: goalData,
      }),
      invalidatesTags: ['Goal'],
    }),

    updateGoal: builder.mutation<Goal, { id: string; data: Partial<Goal> }>({
      query: ({ id, data }) => ({
        url: `/goals/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: ['Goal'],
    }),

    deleteGoal: builder.mutation<void, string>({
      query: (id) => ({
        url: `/goals/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Goal'],
    }),

    // ========== NOTIFICATION ENDPOINTS ==========
    getNotifications: builder.query<Notification[], void>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),

    markNotificationAsRead: builder.mutation<Notification, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    markAllNotificationsAsRead: builder.mutation<void, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),

    // ========== REPORT ENDPOINTS ==========
    getReports: builder.query<any, ReportFilters>({
      query: (filters = {}) => ({
        url: '/reports',
        params: {
          startDate: filters.startDate,
          endDate: filters.endDate,
          type: filters.type,
        },
      }),
      providesTags: ['Report'],
    }),

    // ========== RECURRING TRANSACTIONS ==========
    getRecurringTransactions: builder.query<Transaction[], void>({
      query: () => '/recurring-transactions',
      providesTags: ['Transaction'],
    }),

    createRecurringTransaction: builder.mutation<Transaction, Partial<Transaction>>({
      query: (data) => ({
        url: '/recurring-transactions',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Transaction'],
    }),

    // ========== INVITATION ENDPOINTS ==========
    getInvitations: builder.query<Invitation[], void>({
      query: () => '/invitations',
      providesTags: ['Invitation'],
    }),

    respondToInvitation: builder.mutation<Invitation, { id: string; action: string }>({
      query: ({ id, action }) => ({
        url: `/invitations/${id}/${action}`,
        method: 'POST',
      }),
      invalidatesTags: ['Invitation', 'Group'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Accounts
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
  
  // Transactions
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  
  // Budgets
  useGetBudgetsQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  
  // Goals
  useGetGoalsQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  
  // Notifications
  useGetNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useMarkAllNotificationsAsReadMutation,
  
  // Reports
  useGetReportsQuery,
  
  // Recurring Transactions
  useGetRecurringTransactionsQuery,
  useCreateRecurringTransactionMutation,
  
  // Invitations
  useGetInvitationsQuery,
  useRespondToInvitationMutation,
} = baseApi;

// Note: Auth hooks are exported from authApi.ts