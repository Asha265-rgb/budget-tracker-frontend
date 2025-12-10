import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface BudgetsState {
  selectedBudgetId: string | null;
  filters: {
    status: 'all' | 'active' | 'completed' | 'cancelled';
    period: 'all' | 'monthly' | 'yearly' | 'weekly' | 'custom';
    category: string | null;
  };
  sortBy: 'name' | 'amount' | 'spent' | 'remaining' | 'progress' | 'endDate';
  sortOrder: 'asc' | 'desc';
}

const initialState: BudgetsState = {
  selectedBudgetId: null,
  filters: {
    status: 'all',
    period: 'all',
    category: null,
  },
  sortBy: 'endDate',
  sortOrder: 'asc',
};

const budgetsSlice = createSlice({
  name: 'budgets',
  initialState,
  reducers: {
    setSelectedBudget: (state, action: PayloadAction<string | null>) => {
      state.selectedBudgetId = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<BudgetsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setSort: (state, action: PayloadAction<{ sortBy: BudgetsState['sortBy']; sortOrder: BudgetsState['sortOrder'] }>) => {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { setSelectedBudget, setFilters, setSort, clearFilters } = budgetsSlice.actions;
export default budgetsSlice.reducer;