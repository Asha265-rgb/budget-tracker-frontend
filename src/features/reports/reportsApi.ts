// src/features/reports/reportsApi.ts
import { baseApi } from '../../services/baseApi';

interface ExpenseByCategoryResult {
  name: string;
  amount: number;
  percent: number;
}

interface IncomeVsExpenseResult {
  month: string;
  income: number;
  expense: number;
}

interface MonthlyTrendResult {
  month: string;
  totalSpent: number;
  budget: number;
}

export interface Report {
  id: string;
  name: string;
  type: string;
  filters: any;
  exportFormat: string;
  data: any;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateReportDto {
  userId: string;
  reportData: {
    name: string;
    type: string;
    filters: any;
    exportFormat: string;
  };
}

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get analytics data by processing transactions
    getExpenseByCategory: builder.query<ExpenseByCategoryResult[], { userId: string; startDate: string; endDate: string }>({
      query: ({ userId, startDate, endDate }: { userId: string; startDate: string; endDate: string }) => ({
        url: `/transactions/user/${userId}`,
        params: { startDate, endDate },
      }),
      providesTags: ['Report' as const, 'Transaction' as const],
      transformResponse: (response: any) => {
        // Process transactions to get expense by category
        const transactions = response?.data || [];
        
        // Filter expenses only
        const expenses = transactions.filter((t: any) => t.type === 'expense');
        
        // Group by category
        const categoryMap = new Map<string, number>();
        expenses.forEach((expense: any) => {
          const current = categoryMap.get(expense.category) || 0;
          categoryMap.set(expense.category, current + expense.amount);
        });
        
        // Calculate total
        const totalExpense = Array.from(categoryMap.values()).reduce((sum: number, amount: number) => sum + amount, 0);
        
        // Convert to array with percentages
        const result = Array.from(categoryMap.entries()).map(([name, amount]) => ({
          name,
          amount,
          percent: totalExpense > 0 ? amount / totalExpense : 0
        }));
        
        return result;
      },
    }),
    
    getIncomeVsExpense: builder.query<IncomeVsExpenseResult[], { userId: string; startDate: string; endDate: string }>({
      query: ({ userId, startDate, endDate }: { userId: string; startDate: string; endDate: string }) => ({
        url: `/transactions/user/${userId}`,
        params: { startDate, endDate },
      }),
      providesTags: ['Report' as const, 'Transaction' as const],
      transformResponse: (response: any) => {
        const transactions = response?.data || [];
        
        // Group by month and type
        const monthMap = new Map<string, { month: string; income: number; expense: number }>();
        
        transactions.forEach((transaction: any) => {
          const date = new Date(transaction.date);
          const month = date.toLocaleString('default', { month: 'short' });
          
          if (!monthMap.has(month)) {
            monthMap.set(month, { month, income: 0, expense: 0 });
          }
          
          const monthData = monthMap.get(month);
          if (monthData) {
            if (transaction.type === 'income') {
              monthData.income += transaction.amount;
            } else {
              monthData.expense += transaction.amount;
            }
          }
        });
        
        // Sort by month
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const result = Array.from(monthMap.values())
          .sort((a, b) => months.indexOf(a.month) - months.indexOf(b.month));
        
        return result;
      },
    }),
    
    getMonthlyTrends: builder.query<MonthlyTrendResult[], { userId: string; months?: number }>({
      query: ({ userId, months: _months = 6 }: { userId: string; months?: number }) => ({
        url: `/transactions/user/${userId}`,
      }),
      providesTags: ['Report' as const, 'Transaction' as const],
      transformResponse: (response: any, _meta: any, arg: { userId: string; months?: number }) => {
        const transactions = response?.data || [];
        const { months = 6 } = arg;
        
        // Get last X months
        const result: MonthlyTrendResult[] = [];
        const now = new Date();
        
        for (let i = months - 1; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const month = date.toLocaleString('default', { month: 'short' });
          
          // Filter transactions for this month
          const monthTransactions = transactions.filter((t: any) => {
            const tDate = new Date(t.date);
            return tDate.getMonth() === date.getMonth() && 
                   tDate.getFullYear() === date.getFullYear();
          });
          
          const totalSpent = monthTransactions
            .filter((t: any) => t.type === 'expense')
            .reduce((sum: number, t: any) => sum + t.amount, 0);
          
          result.push({
            month,
            totalSpent,
            budget: totalSpent * 1.2, // Placeholder - you should get actual budgets
          });
        }
        
        return result;
      },
    }),
    
    // Create a new report
    createReport: builder.mutation<Report, { userId: string; reportData: any }>({
      query: ({ userId, reportData }: { userId: string; reportData: any }) => ({
        url: `/reports/user/${userId}`,
        method: 'POST',
        body: reportData,
      }),
      invalidatesTags: ['Report' as const],
    }),
    
    // Get user's reports
    getUserReports: builder.query<Report[], string>({
      query: (userId: string) => `/reports/user/${userId}`,
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Report' as const, id })),
              { type: 'Report' as const, id: 'LIST' },
            ]
          : [{ type: 'Report' as const, id: 'LIST' }],
    }),
  }),
});

export const {
  useGetExpenseByCategoryQuery,
  useGetIncomeVsExpenseQuery,
  useGetMonthlyTrendsQuery,
  useCreateReportMutation,
  useGetUserReportsQuery,
} = reportsApi;