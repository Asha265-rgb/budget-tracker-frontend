import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Define transaction type based on your backend
export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountId: string;
  accountName?: string;
  userId: string;
  isRecurring: boolean;
  recurringId?: string;
  notes?: string;
  tags?: string[];
  receiptUrl?: string;
  isSplit: boolean;
  createdAt: string;
  updatedAt: string;
  // Optional fields for UI enhancement
  budgetId?: string;
  goalId?: string;
}

interface TransactionsState {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  isLoading: boolean;
  isAdding: boolean; // NEW: Separate loading state for adding
  isUpdating: boolean; // NEW: Separate loading state for updating
  error: string | null;
  filters: {
    startDate: string | null;
    endDate: string | null;
    type: 'all' | 'income' | 'expense';
    category: string | null;
    accountId: string | null;
    searchQuery: string;
    tag: string | null; // NEW: Filter by tag
  };
  categories: string[];
  tags: string[]; // NEW: Store all unique tags
  stats: { // NEW: Transaction statistics
    totalIncome: number;
    totalExpense: number;
    netBalance: number;
    monthlyStats: Array<{ month: string; income: number; expense: number }>;
  };
}

const initialState: TransactionsState = {
  transactions: [],
  filteredTransactions: [],
  isLoading: false,
  isAdding: false,
  isUpdating: false,
  error: null,
  filters: {
    startDate: null,
    endDate: null,
    type: 'all',
    category: null,
    accountId: null,
    searchQuery: '',
    tag: null,
  },
  categories: [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 
    'Bills & Utilities', 'Healthcare', 'Education', 'Salary', 
    'Coffee', 'Travel', 'Gifts & Donations', 'Technology', 
    'Investments', 'Other'
  ],
  tags: [], // Will be populated from transactions
  stats: {
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
    monthlyStats: [],
  },
};

// Helper function to apply filters
const applyFilters = (state: TransactionsState) => {
  const { startDate, endDate, type, category, accountId, searchQuery, tag } = state.filters;
  
  let filtered = [...state.transactions];
  
  // Filter by date range
  if (startDate) {
    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date);
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      return transactionDate >= start;
    });
  }
  if (endDate) {
    filtered = filtered.filter(t => {
      const transactionDate = new Date(t.date);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return transactionDate <= end;
    });
  }
  
  // Filter by type
  if (type !== 'all') {
    filtered = filtered.filter(t => t.type === type);
  }
  
  // Filter by category
  if (category) {
    filtered = filtered.filter(t => t.category === category);
  }
  
  // Filter by account
  if (accountId) {
    filtered = filtered.filter(t => t.accountId === accountId);
  }
  
  // Filter by tag
  if (tag) {
    filtered = filtered.filter(t => t.tags?.includes(tag));
  }
  
  // Filter by search query
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter(t => 
      t.description.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      (t.notes && t.notes.toLowerCase().includes(query)) ||
      (t.tags && t.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  state.filteredTransactions = filtered;
  updateStats(state);
};

// Helper function to update statistics
const updateStats = (state: TransactionsState) => {
  const transactions = state.filteredTransactions;
  
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const netBalance = totalIncome - totalExpense;
  
  // Calculate monthly statistics
  const monthlyStatsMap = new Map<string, { income: number; expense: number }>();
  
  transactions.forEach(t => {
    const date = new Date(t.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!monthlyStatsMap.has(monthYear)) {
      monthlyStatsMap.set(monthYear, { income: 0, expense: 0 });
    }
    
    const stats = monthlyStatsMap.get(monthYear)!;
    if (t.type === 'income') {
      stats.income += t.amount;
    } else {
      stats.expense += t.amount;
    }
  });
  
  const monthlyStats = Array.from(monthlyStatsMap.entries())
    .map(([month, stats]) => ({ month, ...stats }))
    .sort((a, b) => b.month.localeCompare(a.month)); // Sort by most recent month first
  
  state.stats = {
    totalIncome,
    totalExpense,
    netBalance,
    monthlyStats,
  };
};

// Helper function to extract unique tags from transactions
const extractTags = (transactions: Transaction[]): string[] => {
  const tagSet = new Set<string>();
  transactions.forEach(t => {
    if (t.tags) {
      t.tags.forEach(tag => tagSet.add(tag));
    }
  });
  return Array.from(tagSet).sort();
};

// Async thunks
export const fetchTransactions = createAsyncThunk(
  'transactions/fetchTransactions',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`http://localhost:8000/transactions/user/${userId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch transactions'
      );
    }
  }
);

export const addTransaction = createAsyncThunk(
  'transactions/addTransaction',
  async (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      // Clean up the data before sending
      const cleanData = {
        ...transactionData,
        description: transactionData.description.trim(),
        notes: transactionData.notes?.trim() || undefined,
        tags: transactionData.tags?.filter(tag => tag.trim()) || undefined,
      };
      
      const response = await axios.post('http://localhost:8000/transactions', cleanData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to add transaction'
      );
    }
  }
);

export const updateTransaction = createAsyncThunk(
  'transactions/updateTransaction',
  async ({ id, ...updateData }: Partial<Transaction> & { id: string }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`http://localhost:8000/transactions/${id}`, updateData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to update transaction'
      );
    }
  }
);

export const deleteTransaction = createAsyncThunk(
  'transactions/deleteTransaction',
  async (id: string, { rejectWithValue }) => {
    try {
      await axios.delete(`http://localhost:8000/transactions/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.response?.data?.error || 
        error.message || 
        'Failed to delete transaction'
      );
    }
  }
);

// NEW: Fetch transactions by date range
export const fetchTransactionsByDateRange = createAsyncThunk(
  'transactions/fetchTransactionsByDateRange',
  async ({ userId, startDate, endDate }: { 
    userId: string; 
    startDate: string; 
    endDate: string; 
  }, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/transactions/user/${userId}/range`,
        { params: { startDate, endDate } }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 
        error.message || 
        'Failed to fetch transactions by date range'
      );
    }
  }
);

const transactionsSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<Partial<TransactionsState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
      applyFilters(state);
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredTransactions = [...state.transactions];
      applyFilters(state);
    },
    searchTransactions: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
      applyFilters(state);
    },
    setDateRange: (state, action: PayloadAction<{ startDate: string | null; endDate: string | null }>) => {
      state.filters.startDate = action.payload.startDate;
      state.filters.endDate = action.payload.endDate;
      applyFilters(state);
    },
    resetTransactions: (_state) => { // Changed state to _state
      return { ...initialState };
    },
    // NEW: For updating account name in transactions when account is renamed
    updateAccountNameInTransactions: (state, action: PayloadAction<{ accountId: string; newName: string }>) => {
      state.transactions.forEach(transaction => {
        if (transaction.accountId === action.payload.accountId) {
          transaction.accountName = action.payload.newName;
        }
      });
      applyFilters(state);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch transactions
      .addCase(fetchTransactions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.filteredTransactions = action.payload;
        state.tags = extractTags(action.payload);
        applyFilters(state);
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Add transaction
      .addCase(addTransaction.pending, (state) => {
        state.isAdding = true;
        state.error = null;
      })
      .addCase(addTransaction.fulfilled, (state, action) => {
        state.isAdding = false;
        state.transactions.unshift(action.payload);
        state.tags = extractTags(state.transactions);
        applyFilters(state);
      })
      .addCase(addTransaction.rejected, (state, action) => {
        state.isAdding = false;
        state.error = action.payload as string;
      })
      
      // Update transaction
      .addCase(updateTransaction.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.transactions.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.transactions[index] = action.payload;
          state.tags = extractTags(state.transactions);
          applyFilters(state);
        }
      })
      .addCase(updateTransaction.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      })
      
      // Delete transaction
      .addCase(deleteTransaction.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = state.transactions.filter(t => t.id !== action.payload);
        state.tags = extractTags(state.transactions);
        applyFilters(state);
      })
      .addCase(deleteTransaction.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch transactions by date range
      .addCase(fetchTransactionsByDateRange.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTransactionsByDateRange.fulfilled, (state, action) => {
        state.isLoading = false;
        state.transactions = action.payload;
        state.filteredTransactions = action.payload;
        state.tags = extractTags(action.payload);
        applyFilters(state);
      })
      .addCase(fetchTransactionsByDateRange.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const { 
  setFilters, 
  clearFilters, 
  searchTransactions, 
  setDateRange,
  resetTransactions,
  updateAccountNameInTransactions 
} = transactionsSlice.actions;

// Export selectors
export const selectAllTransactions = (state: { transactions: TransactionsState }) => 
  state.transactions.transactions;
  
export const selectFilteredTransactions = (state: { transactions: TransactionsState }) => 
  state.transactions.filteredTransactions;
  
export const selectTransactionStats = (state: { transactions: TransactionsState }) => 
  state.transactions.stats;
  
export const selectIsLoading = (state: { transactions: TransactionsState }) => 
  state.transactions.isLoading;
  
export const selectIsAdding = (state: { transactions: TransactionsState }) => 
  state.transactions.isAdding;
  
export const selectIsUpdating = (state: { transactions: TransactionsState }) => 
  state.transactions.isUpdating;
  
export const selectError = (state: { transactions: TransactionsState }) => 
  state.transactions.error;
  
export const selectCategories = (state: { transactions: TransactionsState }) => 
  state.transactions.categories;
  
export const selectTags = (state: { transactions: TransactionsState }) => 
  state.transactions.tags;
  
export const selectFilters = (state: { transactions: TransactionsState }) => 
  state.transactions.filters;

// Export reducer
export default transactionsSlice.reducer;
