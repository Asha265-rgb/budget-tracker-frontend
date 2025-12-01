 import axios from 'axios';

// FIXED: Updated to your actual backend port 8000
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // ADDED: Helps with CORS
  timeout: 10000, // ADDED: Prevent hanging requests
});

// Add token to requests automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Enhanced error handling for development
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log('API Error Details:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // Handle CORS errors specifically
    if (error.message === 'Network Error') {
      console.error('CORS/Network Error - Check backend CORS configuration');
    }
    
    return Promise.reject(error);
  }
);

// ========== TYPE DEFINITIONS ==========

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  userType: 'personal' | 'business' | 'group' | 'admin';
  preferredCurrency: string;
  isVerified: boolean;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'credit_card' | 'investment' | 'savings' | 'other';
  balance: number;
  currency: string;
  accountNumber?: string;
  bankName?: string;
  status: 'active' | 'inactive' | 'archived';
  isDeleted: boolean;
  color?: string;
  icon?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

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
}

export interface CreateTransactionData {
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
}

export interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: 'monthly' | 'yearly' | 'weekly' | 'custom';
  category: string;
  startDate: string;
  endDate: string;
  rolloverEnabled: boolean;
  rolloverAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  color?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

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

// ADD THIS INTERFACE FOR GOAL TRANSACTIONS
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

export interface RecurringTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  customDays?: number;
  startDate: string;
  endDate?: string;
  lastProcessed?: string;
  nextProcessingDate: string;
  status: 'active' | 'paused' | 'cancelled' | 'completed';
  notes?: string;
  accountId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRecurringTransactionData {
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom';
  customDays?: number;
  startDate: string;
  endDate?: string;
  nextProcessingDate: string;
  accountId: string;
  userId: string;
  notes?: string;
}

// ADDED: Notifications Types
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

export interface CreateNotificationData {
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

// ADDED: Reports Types
export interface Report {
  id: string;
  name: string;
  type: string;
  filters: {
    startDate: string;
    endDate: string;
    categories?: string[];
    accounts?: string[];
    type?: string;
  };
  data?: any;
  status: string;
  exportedUrl?: string;
  exportFormat: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportData {
  name: string;
  type: string;
  filters: {
    startDate: string;
    endDate: string;
    categories?: string[];
    accounts?: string[];
    type?: string;
  };
  userId: string;
  exportFormat?: string;
}

// ADDED: Groups Types
export interface Group {
  id: string;
  name: string;
  description?: string;
  status: string;
  currency: string;
  color?: string;
  icon?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

// FIXED: Change createdBy to userId to match backend
export interface CreateGroupData {
  name: string;
  description?: string;
  currency?: string;
  color?: string;
  icon?: string;
  userId: string; // ← CHANGED FROM createdBy TO userId
}

export interface GroupMember {
  id: string;
  role: string;
  status: string;
  totalOwed: number;
  totalOwes: number;
  userId: string;
  groupId: string;
  joinedAt: string;
  updatedAt: string;
}

export interface CreateGroupMemberData {
  userId: string;
  groupId: string;
  role?: string;
}

export interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  splitType: string;
  receiptUrl?: string;
  notes?: string;
  status: string;
  paidBy: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupExpenseData {
  description: string;
  amount: number;
  category: string;
  date: string;
  splitType: string;
  receiptUrl?: string;
  notes?: string;
  paidBy: string;
  groupId: string;
}

export interface ExpenseSplit {
  id: string;
  amount: number;
  percentage?: number;
  status: string;
  settledAt?: string;
  memberId: string;
  expenseId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateExpenseSplitData {
  amount: number;
  percentage?: number;
  memberId: string;
  expenseId: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  userType?: string;
  preferredCurrency?: string;
  phoneNumber?: string;
}

export interface CreateAccountData {
  name: string;
  type: string;
  balance?: number;
  currency?: string;
  accountNumber?: string;
  bankName?: string;
  color?: string;
  icon?: string;
}

// ========== API METHODS ==========

export const authAPI = {
  login: (email: string, password: string): Promise<{ data: AuthResponse }> =>
    api.post('/auth/login', { email, password }),
  
  register: (userData: RegisterData): Promise<{ data: AuthResponse }> =>
    api.post('/auth/register', userData),
};

export const usersAPI = {
  getProfile: (): Promise<{ data: User }> => api.get('/users/profile/me'),
  getAllUsers: (): Promise<{ data: User[] }> => api.get('/users'),
};

export const accountsAPI = {
  getAccounts: (userId: string): Promise<{ data: Account[] }> => 
    api.get(`/accounts/user/${userId}`),
  
  createAccount: (accountData: CreateAccountData): Promise<{ data: Account }> => 
    api.post('/accounts', accountData),
  
  getAccount: (id: string): Promise<{ data: Account }> => 
    api.get(`/accounts/${id}`),
};

export const transactionsAPI = {
  createTransaction: (transactionData: CreateTransactionData): Promise<{ data: Transaction }> => 
    api.post('/transactions', transactionData),
  
  getUserTransactions: (userId: string): Promise<{ data: Transaction[] }> => 
    api.get(`/transactions/user/${userId}`),
  
  getAccountTransactions: (accountId: string): Promise<{ data: Transaction[] }> => 
    api.get(`/transactions/account/${accountId}`),
  
  updateTransaction: (id: string, transactionData: Partial<CreateTransactionData>): Promise<{ data: Transaction }> => 
    api.put(`/transactions/${id}`, transactionData),
  
  deleteTransaction: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/transactions/${id}`),
};

export const budgetsAPI = {
  getBudgets: (): Promise<{ data: Budget[] }> => api.get('/budgets'),
  
  createBudget: (budgetData: any): Promise<{ data: Budget }> => 
    api.post('/budgets', budgetData),
  
  getUserBudgets: (userId: string): Promise<{ data: Budget[] }> => 
    api.get(`/budgets/user/${userId}`),
};

// UPDATED: Goals API - CORRECTED TO MATCH YOUR BACKEND EXACTLY
export const goalsAPI = {
  // Get all goals (no user filter)
  getGoals: (): Promise<{ data: Goal[] }> => api.get('/goals'),
  
  // Create a new goal
  createGoal: (goalData: any): Promise<{ data: Goal }> => 
    api.post('/goals', goalData),
  
  // Get goals for specific user - ✅ MATCHES YOUR BACKEND
  getUserGoals: (userId: string): Promise<{ data: Goal[] }> => 
    api.get(`/goals/user/${userId}`),
  
  // Get goal progress for user - ✅ MATCHES YOUR BACKEND
  getGoalProgress: (userId: string): Promise<{ data: any }> => 
    api.get(`/goals/progress/user/${userId}`),
  
  // Get transactions for specific goal - ✅ MATCHES YOUR BACKEND
  getGoalTransactions: (goalId: string): Promise<{ data: GoalTransaction[] }> => 
    api.get(`/goals/${goalId}/transactions`),
  
  // Add savings to goal - ✅ MATCHES YOUR BACKEND
  addSavings: (goalId: string, transactionData: { amount: number; notes?: string }): Promise<{ data: GoalTransaction }> => 
    api.post(`/goals/${goalId}/savings`, transactionData),
  
  // Get single goal
  getGoal: (id: string): Promise<{ data: Goal }> => 
    api.get(`/goals/${id}`),
  
  // Update goal
  updateGoal: (id: string, goalData: any): Promise<{ data: Goal }> => 
    api.patch(`/goals/${id}`, goalData),
  
  // Delete goal
  deleteGoal: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/goals/${id}`),
};

export const recurringTransactionsAPI = {
  createRecurringTransaction: (transactionData: CreateRecurringTransactionData): Promise<{ data: RecurringTransaction }> => 
    api.post(`/recurring-transactions/user/${transactionData.userId}`, transactionData),
  
  getUserRecurringTransactions: (userId: string): Promise<{ data: RecurringTransaction[] }> => 
    api.get(`/recurring-transactions/user/${userId}`),
  
  getUpcomingRecurringTransactions: (userId: string, days: number = 30): Promise<{ data: RecurringTransaction[] }> => 
    api.get(`/recurring-transactions/upcoming/user/${userId}?days=${days}`),
  
  updateRecurringTransaction: (id: string, transactionData: Partial<CreateRecurringTransactionData>): Promise<{ data: RecurringTransaction }> => 
    api.patch(`/recurring-transactions/${id}`, transactionData),
  
  deleteRecurringTransaction: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/recurring-transactions/${id}`),
};

// UPDATED: Notifications API - CORRECTED VERSION
export const notificationsAPI = {
  // Get all notifications for the authenticated user
  getNotifications: (): Promise<{ data: Notification[] }> => 
    api.get('/notifications'),
  
  // Get notifications for a specific user
  getUserNotifications: (userId: string): Promise<{ data: Notification[] }> => 
    api.get(`/notifications/user/${userId}`),
  
  // FIXED: Now includes userId in URL to match backend
  createNotification: (userId: string, notificationData: CreateNotificationData): Promise<{ data: Notification }> => 
    api.post(`/notifications/user/${userId}`, notificationData),
  
  markAsRead: (id: string): Promise<{ data: Notification }> => 
    api.patch(`/notifications/${id}/read`),
  
  // FIXED: Changed from PATCH to POST to match backend
  markAllAsRead: (userId: string): Promise<{ data: { message: string } }> => 
    api.post(`/notifications/mark-all-read/user/${userId}`),
  
  deleteNotification: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/notifications/${id}`),
};

// UPDATED: Reports API - CORRECTED TO MATCH BACKEND
export const reportsAPI = {
  // Get all reports for a specific user
  getReports: (userId: string): Promise<{ data: Report[] }> => 
    api.get(`/reports/user/${userId}`),
  
  // Create report for specific user
  createReport: (userId: string, reportData: CreateReportData): Promise<{ data: Report }> => 
    api.post(`/reports/user/${userId}`, reportData),
  
  getReport: (id: string): Promise<{ data: Report }> => 
    api.get(`/reports/${id}`),
  
  updateReport: (id: string, reportData: Partial<CreateReportData>): Promise<{ data: Report }> => 
    api.patch(`/reports/${id}`, reportData),
  
  deleteReport: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/reports/${id}`),
  
  // Generate report data
  generateReport: (id: string): Promise<{ data: any }> => 
    api.get(`/reports/${id}/generate`),
  
  // Export report
  exportReport: (id: string, format: string = 'pdf'): Promise<{ data: { url: string } }> => 
    api.get(`/reports/${id}/export?format=${format}`),
};

// UPDATED: Groups API - ADDED EXPENSE METHODS
export const groupsAPI = {
  createGroup: (groupData: CreateGroupData): Promise<{ data: Group }> => 
    api.post('/groups', groupData),
  
  getGroup: (id: string): Promise<{ data: Group }> => 
    api.get(`/groups/${id}`),
  
  updateGroup: (id: string, groupData: Partial<CreateGroupData>): Promise<{ data: Group }> => 
    api.patch(`/groups/${id}`, groupData),
  
  deleteGroup: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/groups/${id}`),
  
  getUserGroups: (userId: string): Promise<{ data: Group[] }> => 
    api.get(`/groups/user/${userId}`),
  
  addMember: (groupId: string, userId: string, role?: string): Promise<{ data: GroupMember }> => 
    api.post(`/groups/${groupId}/members`, { userId, role }),
  
  acceptInvite: (groupId: string, userId: string): Promise<{ data: GroupMember }> => 
    api.post(`/groups/${groupId}/accept-invite`, { userId }),
  
  getGroupBalance: (groupId: string): Promise<{ data: any }> => 
    api.get(`/groups/${groupId}/balance`),

  // ADD THESE NEW EXPENSE METHODS:
  createGroupExpense: (groupId: string, expenseData: any): Promise<{ data: GroupExpense }> => 
    api.post(`/groups/${groupId}/expenses`, expenseData),
  
  getGroupExpenses: (groupId: string): Promise<{ data: GroupExpense[] }> => 
    api.get(`/groups/${groupId}/expenses`),
};

// Group Members API (for other operations)
export const groupMembersAPI = {
  getGroupMembers: (groupId: string): Promise<{ data: GroupMember[] }> => 
    api.get(`/group-members/group/${groupId}`),
  
  getMember: (id: string): Promise<{ data: GroupMember }> => 
    api.get(`/group-members/${id}`),
  
  updateMember: (id: string, memberData: Partial<CreateGroupMemberData>): Promise<{ data: GroupMember }> => 
    api.patch(`/group-members/${id}`, memberData),
  
  removeMember: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/group-members/${id}`),
  
  getUserMemberships: (userId: string): Promise<{ data: GroupMember[] }> => 
    api.get(`/group-members/user/${userId}`),
};

// Group Expenses API
export const groupExpensesAPI = {
  getGroupExpenses: (groupId: string): Promise<{ data: GroupExpense[] }> => 
    api.get(`/group-expenses/group/${groupId}`),
  
  createExpense: (expenseData: CreateGroupExpenseData): Promise<{ data: GroupExpense }> => 
    api.post('/group-expenses', expenseData),
  
  getExpense: (id: string): Promise<{ data: GroupExpense }> => 
    api.get(`/group-expenses/${id}`),
  
  updateExpense: (id: string, expenseData: Partial<CreateGroupExpenseData>): Promise<{ data: GroupExpense }> => 
    api.patch(`/group-expenses/${id}`, expenseData),
  
  deleteExpense: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/group-expenses/${id}`),
  
  getUserExpenses: (userId: string): Promise<{ data: GroupExpense[] }> => 
    api.get(`/group-expenses/user/${userId}`),
};

// Expense Splits API
export const expenseSplitsAPI = {
  getExpenseSplits: (expenseId: string): Promise<{ data: ExpenseSplit[] }> => 
    api.get(`/expense-splits/expense/${expenseId}`),
  
  createSplit: (splitData: CreateExpenseSplitData): Promise<{ data: ExpenseSplit }> => 
    api.post('/expense-splits', splitData),
  
  getSplit: (id: string): Promise<{ data: ExpenseSplit }> => 
    api.get(`/expense-splits/${id}`),
  
  updateSplit: (id: string, splitData: Partial<CreateExpenseSplitData>): Promise<{ data: ExpenseSplit }> => 
    api.patch(`/expense-splits/${id}`, splitData),
  
  deleteSplit: (id: string): Promise<{ data: { message: string } }> => 
    api.delete(`/expense-splits/${id}`),
  
  getUserSplits: (userId: string): Promise<{ data: ExpenseSplit[] }> => 
    api.get(`/expense-splits/user/${userId}`),
  
  markAsSettled: (id: string): Promise<{ data: ExpenseSplit }> => 
    api.patch(`/expense-splits/${id}/settle`),
};

export default api;