// src/features/transactions/transactionsApi.ts
import { baseApi } from '../../services/baseApi';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountId: string;
  userId: string;
  isRecurring: boolean;
  recurringId?: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isSplit: boolean;
  createdAt: string;
  updatedAt: string;
  budgetId?: string;
  goalId?: string;
}

export interface CreateTransactionDto {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountId: string;
  userId: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isRecurring?: boolean;
  isSplit?: boolean;
  budgetId?: string;
  goalId?: string;
  frequency?: 'one-time' | 'daily' | 'weekly' | 'monthly';
  source?: string;
}

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  nextProcessingDate?: string;
  accountId?: string;
  userId: string;
  status?: 'active' | 'paused' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionDto {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  accountId?: string;
  userId: string;
}

export interface TransactionStats {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  spendingByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recentTransactions: Transaction[];
  monthlyTrends: Array<{
    month: string;
    income: number;
    expenses: number;
    balance: number;
  }>;
}

export const transactionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Regular Transactions
    getTransactions: builder.query<Transaction[], string>({
      query: (userId: string) => `/transactions/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction' as const, id: 'LIST' },
            ]
          : [{ type: 'Transaction' as const, id: 'LIST' }],
    }),
    
    getTransactionById: builder.query<Transaction, string>({
      query: (id: string) => `/transactions/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'Transaction' as const, id }], // FIXED: Added _ prefix
    }),
    
    createTransaction: builder.mutation<Transaction, CreateTransactionDto>({
      query: (newTransaction: CreateTransactionDto) => ({
        url: '/transactions',
        method: 'POST',
        body: newTransaction,
      }),
      invalidatesTags: [
        { type: 'Transaction' as const, id: 'LIST' },
        { type: 'Account' as const, id: 'LIST' },
      ],
    }),
    
    updateTransaction: builder.mutation<Transaction, { id: string; updates: Partial<CreateTransactionDto> }>({
      query: ({ id, updates }) => ({
        url: `/transactions/${id}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: (_result, _error, { id }) => [ // FIXED: Added _ prefix
        { type: 'Transaction' as const, id },
        { type: 'Account' as const, id: 'LIST' },
      ],
    }),
    
    deleteTransaction: builder.mutation<void, string>({
      query: (id: string) => ({
        url: `/transactions/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, id) => [ // FIXED: Added _ prefix
        { type: 'Transaction' as const, id },
        { type: 'Account' as const, id: 'LIST' },
      ],
    }),
    
    // Transaction Statistics
    getTransactionStats: builder.query<TransactionStats, string>({
      query: (userId: string) => `/transactions/user/${userId}/stats`,
      providesTags: ['Transaction' as const],
    }),
    
    getTotalIncome: builder.query<number, string>({
      query: (userId: string) => `/transactions/user/${userId}/income/total`,
      transformResponse: (response: any) => {
        if (typeof response === 'number') return response;
        if (response?.totalIncome !== undefined) return response.totalIncome;
        if (Array.isArray(response)) {
          return response
            .filter((t: Transaction) => t.type === 'income')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        }
        return 0;
      },
      providesTags: ['Transaction' as const],
    }),
    
    getTotalExpenses: builder.query<number, string>({
      query: (userId: string) => `/transactions/user/${userId}/expenses/total`,
      transformResponse: (response: any) => {
        if (typeof response === 'number') return response;
        if (response?.totalExpenses !== undefined) return response.totalExpenses;
        if (Array.isArray(response)) {
          return response
            .filter((t: Transaction) => t.type === 'expense')
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
        }
        return 0;
      },
      providesTags: ['Transaction' as const],
    }),
    
    getSpendingByCategory: builder.query<
      Array<{ category: string; amount: number; percentage: number }>, 
      string
    >({
      query: (userId: string) => `/transactions/user/${userId}/spending-by-category`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) return response;
        if (response?.categories) return response.categories;
        return [];
      },
      providesTags: ['Transaction' as const],
    }),
    
    getTransactionsByDateRange: builder.query<
      Transaction[], 
      { userId: string; startDate: string; endDate: string }
    >({
      query: ({ userId, startDate, endDate }) => 
        `/transactions/user/${userId}/range?startDate=${startDate}&endDate=${endDate}`,
      providesTags: ['Transaction' as const],
    }),
    
    getTransactionsByCategory: builder.query<
      Transaction[], 
      { userId: string; category: string }
    >({
      query: ({ userId, category }) => 
        `/transactions/user/${userId}/category/${category}`,
      providesTags: ['Transaction' as const],
    }),
    
    getTransactionsByType: builder.query<
      Transaction[], 
      { userId: string; type: 'income' | 'expense' }
    >({
      query: ({ userId, type }) => 
        `/transactions/user/${userId}/type/${type}`,
      providesTags: ['Transaction' as const],
    }),
    
    getRecentTransactions: builder.query<Transaction[], string>({
      query: (userId: string) => `/transactions/user/${userId}/recent`,
      transformResponse: (response: any) => {
        if (Array.isArray(response)) {
          return response
            .sort((a: Transaction, b: Transaction) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            .slice(0, 10);
        }
        return response;
      },
      providesTags: ['Transaction' as const],
    }),
    
    // Recurring Transactions
    getRecurringTransactions: builder.query<RecurringTransaction[], void>({
      query: () => '/transactions/recurring',
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Transaction' as const, id })),
              { type: 'Transaction' as const, id: 'RECURRING_LIST' },
            ]
          : [{ type: 'Transaction' as const, id: 'RECURRING_LIST' }],
    }),
    
    createRecurringTransaction: builder.mutation<RecurringTransaction, CreateRecurringTransactionDto>({
      query: (newRecurringTransaction: CreateRecurringTransactionDto) => ({
        url: '/transactions/recurring',
        method: 'POST',
        body: newRecurringTransaction,
      }),
      invalidatesTags: [{ type: 'Transaction' as const, id: 'RECURRING_LIST' }],
    }),
    
    getUpcomingRecurringTransactions: builder.query<RecurringTransaction[], void>({
      query: () => '/transactions/recurring/upcoming',
      providesTags: ['Transaction' as const],
    }),
  }),
});

export const {
  // Regular Transactions
  useGetTransactionsQuery,
  useGetTransactionByIdQuery,
  useCreateTransactionMutation,
  useUpdateTransactionMutation,
  useDeleteTransactionMutation,
  useGetTransactionStatsQuery,
  useGetTotalIncomeQuery,
  useGetTotalExpensesQuery,
  useGetSpendingByCategoryQuery,
  useGetTransactionsByDateRangeQuery,
  useGetTransactionsByCategoryQuery,
  useGetTransactionsByTypeQuery,
  useGetRecentTransactionsQuery,
  
  // Recurring Transactions
  useGetRecurringTransactionsQuery,
  useCreateRecurringTransactionMutation,
  useGetUpcomingRecurringTransactionsQuery,
} = transactionsApi;