// src/services/api.ts
import axios from 'axios';
import type { AxiosResponse, AxiosError } from 'axios';

// ============ RE-EXPORT BASE API ============
export { baseApi } from './baseApi';

// ============ YOUR EXISTING TYPES (UNTOUCHED) ============
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  userType: 'personal' | 'business' | 'group_member';
  isActive: boolean;
}

export interface PersonalUser extends User {
  userType: 'personal';
  totalExpenses: number;
  monthlyBudget: number;
  savings: number;
  recentTransactions: any[];
}

export interface BusinessUser extends User {
  userType: 'business';
  businessName: string;
  businessType: string;
  taxNumber?: string;
  totalRevenue: number;
  activeProjects: number;
  clients: number;
}

// ============ YOUR EXISTING OTHER TYPES ============
export interface GroupExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  category: string;
  paidById: string;
  splitMethod: string;
  participants: string[];
  amounts?: Record<string, number>;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface PendingInvitation {
  id: string;
  groupId: string;
  email: string;
  name: string;
  role: string;
  phone?: string;
  status: 'pending' | 'accepted' | 'declined';
  token: string;
  expiresAt: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  groupId: string;
  userId: string;
  userName: string;
  action: string;
  details: any;
  createdAt: string;
}

export interface RecurringTransaction {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  isActive: boolean;
  nextOccurrence: string;
  createdAt: string;
  updatedAt: string;
}

export interface Report {
  id: string;
  userId: string;
  name: string;
  type: 'spending_by_category' | 'income_vs_expense' | 'cash_flow' | 'net_worth';
  filters: any;
  data?: any;
  exportFormat: 'pdf' | 'excel' | 'csv';
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  createdBy: string;
  totalMembers: number;
  totalExpenses: number;
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  joinedAt: string;
  totalContributed: number;
  totalOwed: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalTransaction {
  id: string;
  goalId: string;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: string;
}

// ============ AXIOS API CONFIGURATION ============
const API = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken') || 
                  sessionStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const userType = localStorage.getItem('userType');
    if (userType && config.headers) {
      config.headers['X-User-Type'] = userType;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
API.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============ YOUR EXISTING RTK QUERY EXTENSIONS ============
// You'll move these to their respective feature files
// Keep them here temporarily for compatibility

// ============ AXIOS-BASED APIs (YOUR EXISTING) ============
export const authAPI = {
  login: (email: string, password: string): Promise<AxiosResponse<{
    token: string;
    user: User;
    userType: 'personal' | 'business';
  }>> => API.post('/auth/login', { email, password }),

  register: (data: {
    email: string;
    password: string;
    name: string;
    userType: 'personal' | 'business';
    phone?: string;
  }): Promise<AxiosResponse> => API.post('/auth/register', data),

  logout: (): Promise<AxiosResponse> => API.post('/auth/logout'),

  refreshToken: (): Promise<AxiosResponse> => API.post('/auth/refresh'),
  
  forgotPassword: (email: string): Promise<AxiosResponse> => 
    API.post('/auth/forgot-password', { email }),
    
  resetPassword: (token: string, password: string): Promise<AxiosResponse> => 
    API.post('/auth/reset-password', { token, password }),
    
  verifyEmail: (token: string): Promise<AxiosResponse> => 
    API.post('/auth/verify-email', { token }),
};

export const personalAPI = {
  getPersonalDashboard: (): Promise<AxiosResponse<{
    user: PersonalUser;
    monthlyExpenses: number;
    monthlyIncome: number;
    savings: number;
    recentTransactions: any[];
    budgets: any[];
  }>> => API.get('/personal/dashboard'),

  getPersonalExpenses: (params?: {
    month?: string;
    category?: string;
    limit?: number;
  }): Promise<AxiosResponse<any[]>> => 
    API.get('/personal/expenses', { params }),

  getBudgets: (): Promise<AxiosResponse> => 
    API.get('/personal/budgets'),

  updateProfile: (data: Partial<PersonalUser>): Promise<AxiosResponse> => 
    API.put('/personal/profile', data),
    
  getPersonalStats: (): Promise<AxiosResponse> => 
    API.get('/personal/stats'),
    
  getPersonalGoals: (): Promise<AxiosResponse> => 
    API.get('/personal/goals'),
    
  createExpense: (data: any): Promise<AxiosResponse> => 
    API.post('/personal/expenses', data),
    
  updateExpense: (expenseId: string, data: any): Promise<AxiosResponse> => 
    API.put(`/personal/expenses/${expenseId}`, data),
    
  deleteExpense: (expenseId: string): Promise<AxiosResponse> => 
    API.delete(`/personal/expenses/${expenseId}`),
};

export const businessAPI = {
  getBusinessDashboard: (): Promise<AxiosResponse<{
    user: BusinessUser;
    monthlyRevenue: number;
    monthlyExpenses: number;
    profit: number;
    activeProjects: any[];
    recentClients: any[];
  }>> => API.get('/business/dashboard'),

  getProjects: (): Promise<AxiosResponse> => 
    API.get('/business/projects'),

  getClients: (): Promise<AxiosResponse> => 
    API.get('/business/clients'),

  getInvoices: (): Promise<AxiosResponse> => 
    API.get('/business/invoices'),

  getBusinessAnalytics: (period: 'daily' | 'weekly' | 'monthly'): Promise<AxiosResponse> => 
    API.get('/business/analytics', { params: { period } }),
    
  createInvoice: (data: any): Promise<AxiosResponse> => 
    API.post('/business/invoices', data),
    
  updateInvoice: (invoiceId: string, data: any): Promise<AxiosResponse> => 
    API.put(`/business/invoices/${invoiceId}`, data),
    
  deleteInvoice: (invoiceId: string): Promise<AxiosResponse> => 
    API.delete(`/business/invoices/${invoiceId}`),
    
  getBusinessSettings: (): Promise<AxiosResponse> => 
    API.get('/business/settings'),
    
  updateBusinessSettings: (data: any): Promise<AxiosResponse> => 
    API.put('/business/settings', data),
};

export const groupAPI = {
  getUserGroups: (): Promise<AxiosResponse<any[]>> => 
    API.get('/groups'),

  getGroup: (groupId: string): Promise<AxiosResponse<any>> => 
    API.get(`/groups/${groupId}`),

  createGroup: (data: { name: string; description?: string }): Promise<AxiosResponse<any>> => 
    API.post('/groups', data),

  updateGroup: (groupId: string, data: Partial<any>): Promise<AxiosResponse<any>> => 
    API.put(`/groups/${groupId}`, data),

  deleteGroup: (groupId: string): Promise<AxiosResponse> => 
    API.delete(`/groups/${groupId}`),

  getGroupDashboardStats: (groupId: string): Promise<AxiosResponse<any>> => 
    API.get(`/groups/${groupId}/stats`),

  getGroupSettings: (groupId: string): Promise<AxiosResponse<any>> => 
    API.get(`/groups/${groupId}/settings`),

  updateGroupSettings: (groupId: string, settings: Partial<any>): Promise<AxiosResponse> => 
    API.put(`/groups/${groupId}/settings`, settings),
};

export const memberAPI = {
  getGroupMembers: (groupId: string): Promise<AxiosResponse<{ members: any[] }>> => 
    API.get(`/groups/${groupId}/members`),

  addMember: (groupId: string, data: {
    email: string;
    name: string;
    role: string;
    phone?: string;
  }): Promise<AxiosResponse<any>> => 
    API.post(`/groups/${groupId}/members`, data),

  updateMemberRole: (groupId: string, memberId: string, role: string): Promise<AxiosResponse> => 
    API.put(`/groups/${groupId}/members/${memberId}`, { role }),

  removeMember: (groupId: string, memberId: string): Promise<AxiosResponse> => 
    API.delete(`/groups/${groupId}/members/${memberId}`),

  leaveGroup: (groupId: string): Promise<AxiosResponse> => 
    API.delete(`/groups/${groupId}/leave`),

  getMemberStats: (groupId: string): Promise<AxiosResponse> => 
    API.get(`/groups/${groupId}/members/stats`),
};

export const expenseAPI = {
  getGroupExpenses: (groupId: string, params?: {
    month?: string;
    category?: string;
    status?: string;
    limit?: number;
  }): Promise<AxiosResponse<{ expenses: GroupExpense[] }>> => 
    API.get(`/groups/${groupId}/expenses`, { params }),

  createExpense: (groupId: string, data: {
    description: string;
    amount: number;
    category: string;
    paidById: string;
    splitMethod: string;
    participants: string[];
    amounts?: Record<string, number>;
  }): Promise<AxiosResponse<GroupExpense>> => 
    API.post(`/groups/${groupId}/expenses`, data),

  updateExpense: (groupId: string, expenseId: string, data: Partial<GroupExpense>): Promise<AxiosResponse> => 
    API.put(`/groups/${groupId}/expenses/${expenseId}`, data),

  deleteExpense: (groupId: string, expenseId: string): Promise<AxiosResponse> => 
    API.delete(`/groups/${groupId}/expenses/${expenseId}`),

  settleExpense: (groupId: string, expenseId: string): Promise<AxiosResponse> => 
    API.post(`/groups/${groupId}/expenses/${expenseId}/settle`),

  getExpenseSummary: (groupId: string): Promise<AxiosResponse> => 
    API.get(`/groups/${groupId}/expenses/summary`),
};

export const invitationAPI = {
  sendInvitation: (groupId: string, data: {
    email: string;
    name: string;
    role: string;
    phone?: string;
  }): Promise<AxiosResponse<PendingInvitation>> => 
    API.post(`/groups/${groupId}/invitations`, data),

  getPendingInvitations: (groupId: string): Promise<AxiosResponse<{ invitations: PendingInvitation[] }>> => 
    API.get(`/groups/${groupId}/invitations`),

  resendInvitation: (groupId: string, invitationId: string): Promise<AxiosResponse> => 
    API.post(`/groups/${groupId}/invitations/${invitationId}/resend`),

  cancelInvitation: (groupId: string, invitationId: string): Promise<AxiosResponse> => 
    API.delete(`/groups/${groupId}/invitations/${invitationId}`),

  acceptInvitation: (token: string): Promise<AxiosResponse> => 
    API.post('/invitations/accept', { token }),

  declineInvitation: (token: string): Promise<AxiosResponse> => 
    API.post('/invitations/decline', { token }),
};

export const activityAPI = {
  getGroupActivities: (groupId: string, params?: {
    limit?: number;
    offset?: number;
  }): Promise<AxiosResponse<{ activities: ActivityLog[]; total: number }>> => 
    API.get(`/groups/${groupId}/activities`, { params }),

  logActivity: (groupId: string, data: {
    action: string;
    details: any;
  }): Promise<AxiosResponse> => 
    API.post(`/groups/${groupId}/activities`, data),
};

export const reportAPI = {
  getGroupReport: (groupId: string, period: 'week' | 'month' | 'year'): Promise<AxiosResponse> => 
    API.get(`/groups/${groupId}/reports`, { params: { period } }),

  exportReport: (groupId: string, format: 'pdf' | 'csv' | 'excel', period: string): Promise<AxiosResponse> => 
    API.get(`/groups/${groupId}/reports/export`, { 
      params: { format, period },
      responseType: 'blob'
    }),

  getCategoryReport: (groupId: string): Promise<AxiosResponse> => 
    API.get(`/groups/${groupId}/reports/categories`),

  getMemberReport: (groupId: string): Promise<AxiosResponse> => 
    API.get(`/groups/${groupId}/reports/members`),
};

// ============ UTILITY FUNCTIONS ============
export const apiUtils = {
  handleError: (error: any): string => {
    if (axios.isAxiosError(error)) {
      return error.response?.data?.message || 
             error.response?.data?.error || 
             error.message || 
             'An error occurred';
    }
    return 'An unexpected error occurred';
  },

  isAdmin: (userRole: string): boolean => 
    ['admin', 'owner', 'creator'].includes(userRole?.toLowerCase() || ''),

  formatCurrency: (amount: number, currency: string = 'KES'): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  formatDate: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  },

  formatDateTime: (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  timeAgo: (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  },
  
  validateEmail: (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },
  
  validatePhone: (phone: string): boolean => {
    const re = /^[+]?[\d\s\-\(\)]+$/;
    return re.test(phone);
  },
};

export default API;

// REMOVE ALL FEATURE API HOOK EXPORTS FROM HERE!
// They will be imported directly in components