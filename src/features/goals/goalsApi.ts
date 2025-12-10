import { baseApi } from '../../services/baseApi';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  startDate: string;
  status: 'active' | 'completed' | 'cancelled';
  category?: string;
  color?: string;
  icon?: string;
  notes?: string;
  isUnrealistic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoalTransaction {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  type: 'savings' | 'withdrawal';
  goalId: string;
  linkedTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGoalDto {
  name: string;
  targetAmount: number;
  targetDate: string;
  startDate?: string;
  category?: string;
  color?: string;
  icon?: string;
  notes?: string;
  isUnrealistic?: boolean;
  userId: string;
}

export interface UpdateGoalDto {
  name?: string;
  targetAmount?: number;
  targetDate?: string;
  status?: string;
  category?: string;
  color?: string;
  icon?: string;
  notes?: string;
  isUnrealistic?: boolean;
}

export interface AddSavingsDto {
  amount: number;
  notes?: string;
}

interface GoalStats {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  totalTargetAmount: number;
  totalCurrentAmount: number;
  totalProgress: number;
  upcomingGoals: Goal[];
  unrealisticGoals: Goal[];
}

export const goalsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all goals for a user
    getGoals: builder.query<Goal[], string>({
      query: (userId: string) => {
        console.log(`Fetching goals for user ID: ${userId}`);
        return `/goals/user/${userId}`;
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Goal' as const, id })),
              { type: 'Goal' as const, id: 'LIST' },
            ]
          : [{ type: 'Goal' as const, id: 'LIST' }],
      transformErrorResponse: (response: any) => {
        console.error('Error fetching goals:', response);
        return response;
      },
    }),
    
    // Get a single goal by ID
    getGoalById: builder.query<Goal, string>({
      query: (id: string) => {
        console.log(`Fetching goal with ID: ${id}`);
        return `/goals/${id}`;
      },
      providesTags: (_result, _error, id) => [{ type: 'Goal' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Create a new goal
    createGoal: builder.mutation<Goal, CreateGoalDto>({
      query: (newGoal: CreateGoalDto) => {
        console.log('Creating goal with data:', newGoal);
        return {
          url: '/goals',
          method: 'POST',
          body: newGoal,
        };
      },
      transformErrorResponse: (response: any) => {
        console.error('Goal creation error response:', response);
        return response;
      },
      invalidatesTags: [{ type: 'Goal' as const, id: 'LIST' }],
    }),
    
    // Update a goal
    updateGoal: builder.mutation<Goal, { id: string; updates: UpdateGoalDto }>({
      query: ({ id, updates }) => {
        console.log(`Updating goal ${id} with:`, updates);
        return {
          url: `/goals/${id}`,
          method: 'PUT',
          body: updates,
        };
      },
      invalidatesTags: (_result, _error, { id }) => [{ type: 'Goal' as const, id }], // FIXED: Added _ prefix
    }),
    
    // Delete a goal
    deleteGoal: builder.mutation<void, string>({
      query: (id: string) => {
        console.log(`Deleting goal ${id}`);
        return {
          url: `/goals/${id}`,
          method: 'DELETE',
        };
      },
      invalidatesTags: (_result, _error, id) => [ // FIXED: Added _ prefix
        { type: 'Goal' as const, id },
        { type: 'Goal' as const, id: 'LIST' },
      ],
    }),
    
    // Get goal statistics
    getGoalStats: builder.query<GoalStats, string>({
      query: (userId: string) => {
        console.log(`Fetching goal stats for user: ${userId}`);
        return `/goals/user/${userId}/stats`;
      },
      transformErrorResponse: (response: any) => {
        console.error('Error fetching goal stats:', response);
        return response;
      },
      providesTags: ['Goal' as const], // FIXED: Added as const
    }),
    
    // Get goal progress
    getGoalProgress: builder.query<any, string>({
      query: (userId: string) => {
        console.log(`Fetching goal progress for user: ${userId}`);
        return `/goals/progress/user/${userId}`;
      },
      providesTags: ['Goal' as const], // FIXED: Added as const
    }),
    
    // Get goal transactions
    getGoalTransactions: builder.query<GoalTransaction[], string>({
      query: (goalId: string) => {
        console.log(`Fetching transactions for goal: ${goalId}`);
        return `/goals/${goalId}/transactions`;
      },
      providesTags: (result, _error, goalId) => // FIXED: Added _ prefix
        result
          ? [
              ...result.map(({ id }) => ({ type: 'GoalTransaction' as const, id })),
              { type: 'GoalTransaction' as const, id: `GOAL-${goalId}` },
            ]
          : [{ type: 'GoalTransaction' as const, id: `GOAL-${goalId}` }],
    }),
    
    // Add savings to goal
    addSavings: builder.mutation<GoalTransaction, { goalId: string; savings: AddSavingsDto }>({
      query: ({ goalId, savings }) => {
        console.log(`Adding savings to goal ${goalId}:`, savings);
        return {
          url: `/goals/${goalId}/savings`,
          method: 'POST',
          body: savings,
        };
      },
      invalidatesTags: (_result, _error, { goalId }) => [ // FIXED: Added _ prefix
        { type: 'Goal' as const, id: goalId },
        { type: 'GoalTransaction' as const, id: `GOAL-${goalId}` },
      ],
    }),
    
    // Get goals by category
    getGoalsByCategory: builder.query<Goal[], { userId: string; category: string }>({
      query: ({ userId, category }) => {
        console.log(`Fetching ${category} goals for user: ${userId}`);
        return `/goals/user/${userId}/category/${category}`;
      },
      providesTags: ['Goal' as const], // FIXED: Added as const
    }),
    
    // Get unrealistic goals (for warnings)
    getUnrealisticGoals: builder.query<Goal[], string>({
      query: (userId: string) => {
        console.log(`Fetching unrealistic goals for user: ${userId}`);
        return `/goals/user/${userId}/unrealistic`;
      },
      providesTags: ['Goal' as const], // FIXED: Added as const
    }),
  }),
});

export const {
  useGetGoalsQuery,
  useGetGoalByIdQuery,
  useCreateGoalMutation,
  useUpdateGoalMutation,
  useDeleteGoalMutation,
  useGetGoalStatsQuery,
  useGetGoalProgressQuery,
  useGetGoalTransactionsQuery,
  useAddSavingsMutation,
  useGetGoalsByCategoryQuery,
  useGetUnrealisticGoalsQuery,
} = goalsApi;