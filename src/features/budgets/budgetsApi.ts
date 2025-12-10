// src/features/budgets/budgetsApi.ts
import { baseApi } from '../../services/baseApi';

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: string; // 'monthly', 'yearly', 'weekly', 'custom'
  category: string;
  startDate: string;
  endDate: string;
  rolloverEnabled: boolean;
  rolloverAmount: number;
  status: string; // 'active', 'completed', 'cancelled'
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBudgetDto {
  name: string;
  amount: number;
  period: string;
  category: string;
  startDate: string;
  endDate: string;
  rolloverEnabled?: boolean;
  color?: string;
  userId: string;
}

export interface UpdateBudgetDto {
  name?: string;
  amount?: number;
  period?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  rolloverEnabled?: boolean;
  color?: string;
  status?: string;
}

interface BudgetStats {
  totalBudgetAmount: number;
  totalSpent: number;
  totalRemaining: number;
  overallProgress: number;
  activeCount: number;
  overspentCount: number;
  categoryBreakdown: Array<{
    category: string;
    budgeted: number;
    spent: number;
    remaining: number;
    progress: number;
  }>;
}

export const budgetsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all budgets for a user
    getBudgets: builder.query<Budget[], string>({
      query: (userId: string) => {
        console.log(`Fetching budgets for user ID: ${userId}`);
        return `/budgets/user/${userId}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Budget' as const, id })),
              { type: 'Budget' as const, id: 'LIST' },
            ]
          : [{ type: 'Budget' as const, id: 'LIST' }],
      transformErrorResponse: (response: any) => {
        console.error('Error fetching budgets:', response);
        return response;
      },
    }),
    
    // Get a single budget by ID
    getBudgetById: builder.query<Budget, string>({
      query: (id: string) => {
        console.log(`Fetching budget with ID: ${id}`);
        return `/budgets/${id}`;
      },
      providesTags: (_result, _error, id) => [{ type: 'Budget' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Create a new budget
    createBudget: builder.mutation<Budget, CreateBudgetDto>({
      query: (newBudget: CreateBudgetDto) => {
        console.log('Creating budget with data:', newBudget);
        return {
          url: '/budgets',
          method: 'POST',
          body: newBudget,
        };
      },
      transformErrorResponse: (response: any) => {
        console.error('Budget creation error response:', response);
        return response;
      },
      invalidatesTags: [{ type: 'Budget' as const, id: 'LIST' }],
    }),
    
    // Update a budget
    updateBudget: builder.mutation<Budget, { id: string; updates: UpdateBudgetDto }>({
      query: ({ id, updates }) => {
        console.log(`Updating budget ${id} with:`, updates);
        return {
          url: `/budgets/${id}`,
          method: 'PUT',
          body: updates,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Budget' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Delete a budget
    deleteBudget: builder.mutation<void, string>({
      query: (id: string) => {
        console.log(`Deleting budget ${id}`);
        return {
          url: `/budgets/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_result, _error, id) => [ // FIXED: Added _ prefix
        { type: 'Budget' as const, id },
        { type: 'Budget' as const, id: 'LIST' },
      ],
    }),
    
    // Get budget statistics
    getBudgetStats: builder.query<BudgetStats, string>({
      query: (userId: string) => {
        console.log(`Fetching budget stats for user: ${userId}`);
        return `/budgets/user/${userId}/stats`;
      },
      transformErrorResponse: (response: any) => {
        console.error('Error fetching budget stats:', response);
        return response;
      },
      providesTags: ['Budget' as const],
    }),
    
    // Get budgets by period (monthly, yearly, etc.)
    getBudgetsByPeriod: builder.query<Budget[], { userId: string; period: string }>({
      query: ({ userId, period }) => {
        console.log(`Fetching ${period} budgets for user: ${userId}`);
        return `/budgets/user/${userId}/period/${period}`;
      },
      providesTags: ['Budget' as const],
    }),
    
    // Get budgets by category
    getBudgetsByCategory: builder.query<Budget[], { userId: string; category: string }>({
      query: ({ userId, category }) => {
        console.log(`Fetching ${category} budgets for user: ${userId}`);
        return `/budgets/user/${userId}/category/${category}`;
      },
      providesTags: ['Budget' as const],
    }),
  }),
});

export const {
  useGetBudgetsQuery,
  useGetBudgetByIdQuery,
  useCreateBudgetMutation,
  useUpdateBudgetMutation,
  useDeleteBudgetMutation,
  useGetBudgetStatsQuery,
  useGetBudgetsByPeriodQuery,
  useGetBudgetsByCategoryQuery,
} = budgetsApi;