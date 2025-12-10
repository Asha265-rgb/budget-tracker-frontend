import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast, Toaster } from 'sonner';
import type { RootState } from '../../app/store';

// Import APIs
import { 
  useGetTransactionsQuery, 
  useCreateTransactionMutation 
} from '../../features/transactions/transactionsApi';
import { 
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation 
} from '../../features/accounts/accountsApi';
import { 
  useGetGoalsQuery,
  useCreateGoalMutation 
} from '../../features/goals/goalsApi';

// Types
interface BusinessAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  userId: string;
  isBusinessAccount?: boolean;
  businessType?: string;
  taxId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface BusinessTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountId: string;
  userId: string;
  notes?: string;
  isBusinessTransaction?: boolean;
  period?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt?: string;
}

interface BusinessGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  category: string;
  userId: string;
  notes?: string;
  isBusinessGoal?: boolean;
  businessCategory?: 'expand' | 'machine' | 'branch' | 'stock' | 'investors' | 'other';
  durationMonths: number;
  monthlyTarget: number;
  progressPercentage: number;
  isUnrealistic?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Props are optional
interface BusinessDashboardProps {
  userName?: string;
  userId?: string;
}

// Icons - Using emojis
const Icons = {
  Building: () => <span className="text-2xl">🏢</span>,
  TrendingUp: () => <span className="text-2xl">📈</span>,
  TrendingDown: () => <span className="text-2xl">📉</span>,
  Target: () => <span className="text-2xl">🎯</span>,
  BarChart3: () => <span className="text-2xl">📊</span>,
  ShoppingCart: () => <span className="text-2xl">🛒</span>,
  Users: () => <span className="text-2xl">👥</span>,
  Wallet: () => <span className="text-2xl">💰</span>,
  AlertTriangle: () => <span className="text-2xl">⚠️</span>,
  CheckCircle: () => <span className="text-2xl">✅</span>,
  XCircle: () => <span className="text-2xl">❌</span>,
  Calendar: () => <span className="text-2xl">📅</span>,
  DollarSign: () => <span className="text-2xl">💲</span>,
  FileText: () => <span className="text-2xl">📄</span>,
  Settings: () => <span className="text-2xl">⚙️</span>,
  Bell: () => <span className="text-2xl">🔔</span>,
  CreditCard: () => <span className="text-2xl">💳</span>,
  Package: () => <span className="text-2xl">📦</span>,
  Megaphone: () => <span className="text-2xl">📢</span>,
  Wrench: () => <span className="text-2xl">🔧</span>,
  Store: () => <span className="text-2xl">🏬</span>,
  Handshake: () => <span className="text-2xl">🤝</span>,
  Plus: () => <span className="text-2xl">➕</span>
};

// Business Categories
const BUSINESS_EXPENSE_CATEGORIES = [
  { value: 'stock', label: 'Stock/Inventory', icon: <Icons.Package />, color: 'bg-pink-500' },
  { value: 'marketing', label: 'Marketing/Ads', icon: <Icons.Megaphone />, color: 'bg-purple-500' },
  { value: 'payroll', label: 'Payroll/Salaries', icon: <Icons.Users />, color: 'bg-blue-500' },
  { value: 'utilities', label: 'Utilities', icon: <Icons.Wrench />, color: 'bg-yellow-500' },
  { value: 'taxes', label: 'Taxes', icon: <Icons.FileText />, color: 'bg-red-500' },
  { value: 'rent', label: 'Rent', icon: <Icons.Building />, color: 'bg-indigo-500' },
  { value: 'other', label: 'Other Expenses', icon: <Icons.CreditCard />, color: 'bg-gray-500' }
];

const BUSINESS_INCOME_CATEGORIES = [
  { value: 'sales', label: 'Product Sales', icon: <Icons.ShoppingCart />, color: 'bg-green-500' },
  { value: 'services', label: 'Services', icon: <Icons.Wrench />, color: 'bg-blue-500' },
  { value: 'investments', label: 'Investments', icon: <Icons.TrendingUp />, color: 'bg-purple-500' },
  { value: 'other', label: 'Other Income', icon: <Icons.DollarSign />, color: 'bg-teal-500' }
];

const BUSINESS_GOAL_CATEGORIES = [
  { value: 'expand', label: 'Expand Business', icon: <Icons.Store />, description: 'Grow your business operations' },
  { value: 'machine', label: 'Buy New Machine', icon: <Icons.Wrench />, description: 'Purchase equipment/machinery' },
  { value: 'branch', label: 'Open New Branch', icon: <Icons.Building />, description: 'Open additional locations' },
  { value: 'stock', label: 'Increase Stock', icon: <Icons.Package />, description: 'Add more inventory' },
  { value: 'investors', label: 'Attract Investors', icon: <Icons.Handshake />, description: 'Raise capital from investors' },
  { value: 'other', label: 'Other Business Goal', icon: <Icons.Target />, description: 'Custom business goal' }
];

const PROFIT_PERIODS = [
  { value: 'daily', label: 'Daily', icon: <Icons.Calendar /> },
  { value: 'weekly', label: 'Weekly', icon: <Icons.Calendar /> },
  { value: 'monthly', label: 'Monthly', icon: <Icons.Calendar /> },
  { value: 'yearly', label: 'Yearly', icon: <Icons.Calendar /> }
];

// Modals Components
const AddAccountModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'bank',
    balance: '',
    currency: 'USD',
    businessType: '',
    taxId: '',
    isBusinessAccount: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast.error('Please enter an account name');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        type: formData.type,
        balance: parseFloat(formData.balance) || 0,
        currency: formData.currency,
        businessType: formData.businessType,
        taxId: formData.taxId,
        isBusinessAccount: true,
        status: 'active'
      });
      toast.success('Business account created successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to create account. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Icons.Building />
              <span className="ml-2">Add Business Account</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <Icons.XCircle />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Business Checking Account"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="bank">Business Bank Account</option>
                <option value="cash">Business Cash</option>
                <option value="investment">Business Investment</option>
                <option value="credit_card">Business Credit Card</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Initial Balance ($)
              </label>
              <input
                type="number"
                value={formData.balance}
                onChange={(e) => setFormData({ ...formData, balance: e.target.value })}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name}
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Account'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddExpenseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accounts: BusinessAccount[];
}> = ({ isOpen, onClose, onSubmit, accounts }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'stock',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !formData.accountId) {
      const businessAccount = accounts[0]; // Use first account
      if (businessAccount) {
        setFormData(prev => ({ ...prev, accountId: businessAccount.id }));
      }
    }
  }, [accounts, formData.accountId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        description: formData.description || `${formData.category} expense`,
        amount: parseFloat(formData.amount),
        type: 'expense',
        category: formData.category,
        date: formData.date,
        accountId: formData.accountId,
        notes: formData.notes,
        isBusinessTransaction: true
      });
      
      toast.success('Business expense added successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to add expense. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Icons.TrendingDown />
              <span className="ml-2">Add Business Expense</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <Icons.XCircle />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 500"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                {BUSINESS_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account to Deduct From *
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting || accounts.length === 0}
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - ${account.balance?.toFixed(2)} {account.currency}
                  </option>
                ))}
              </select>
              {accounts.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  No business accounts found. Please create an account first.
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="What was this expense for?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                disabled={isSubmitting}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || accounts.length === 0}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddProfitModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  accounts: BusinessAccount[];
}> = ({ isOpen, onClose, onSubmit, accounts }) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'sales',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    notes: '',
    period: 'monthly'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (accounts.length > 0 && !formData.accountId) {
      const businessAccount = accounts[0]; // Use first account
      if (businessAccount) {
        setFormData(prev => ({ ...prev, accountId: businessAccount.id }));
      }
    }
  }, [accounts, formData.accountId]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    if (!formData.accountId) {
      toast.error('Please select an account');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        description: formData.description || `${formData.category} ${formData.period} profit`,
        amount: parseFloat(formData.amount),
        type: 'income',
        category: formData.category,
        date: formData.date,
        accountId: formData.accountId,
        notes: formData.notes,
        isBusinessTransaction: true,
        period: formData.period
      });
      
      toast.success('Business profit added successfully!');
      onClose();
    } catch (error) {
      toast.error('Failed to add profit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Icons.TrendingUp />
              <span className="ml-2">Add Business Profit</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <Icons.XCircle />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount ($) *
              </label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="e.g., 5000"
                step="0.01"
                min="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period *
              </label>
              <select
                value={formData.period}
                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                {PROFIT_PERIODS.map((period) => (
                  <option key={period.value} value={period.value}>
                    {period.label} Profit
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                {BUSINESS_INCOME_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Account to Deposit Into *
              </label>
              <select
                value={formData.accountId}
                onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting || accounts.length === 0}
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} - ${account.balance?.toFixed(2)} {account.currency}
                  </option>
                ))}
              </select>
              {accounts.length === 0 && (
                <p className="text-sm text-red-500 mt-1">
                  No business accounts found. Please create an account first.
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || accounts.length === 0}
                className="flex-1 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding...' : 'Add Profit'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const BusinessGoalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  businessData: any;
}> = ({ isOpen, onClose, onSubmit, businessData }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    currentAmount: '',
    category: 'expand',
    durationMonths: 12,
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 12)).toISOString().split('T')[0],
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUnrealistic, setIsUnrealistic] = useState(false);

  useEffect(() => {
    if (formData.targetAmount && businessData) {
      const targetAmount = parseFloat(formData.targetAmount);
      const monthlyProfit = businessData.netProfit || 0;
      const durationMonths = formData.durationMonths;
      
      const requiredMonthly = targetAmount / durationMonths;
      setIsUnrealistic(monthlyProfit > 0 && requiredMonthly > monthlyProfit * 0.5);
    }
  }, [formData.targetAmount, formData.durationMonths, businessData]);

  useEffect(() => {
    const newDate = new Date();
    newDate.setMonth(newDate.getMonth() + formData.durationMonths);
    setFormData(prev => ({ ...prev, targetDate: newDate.toISOString().split('T')[0] }));
  }, [formData.durationMonths]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.targetAmount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    const currentAmount = parseFloat(formData.currentAmount) || 0;
    
    if (currentAmount > targetAmount) {
      toast.error('Current amount cannot exceed target amount');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: formData.name,
        targetAmount,
        currentAmount,
        targetDate: formData.targetDate,
        category: formData.category,
        notes: formData.notes,
        isBusinessGoal: true,
        businessCategory: formData.category,
        durationMonths: formData.durationMonths,
        monthlyTarget: targetAmount / formData.durationMonths,
        progressPercentage: (currentAmount / targetAmount) * 100,
        isUnrealistic: isUnrealistic
      });
      
      toast.success('Business goal created successfully!');
      
      if (isUnrealistic) {
        setTimeout(() => {
          toast.warning('Goal Feasibility Warning', {
            description: 'This goal may be challenging based on your current profits.',
            duration: 6000,
          });
        }, 1000);
      }
      
      onClose();
    } catch (error) {
      toast.error('Failed to create goal. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateMonthlyTarget = () => {
    if (!formData.targetAmount || !formData.durationMonths) return 0;
    return parseFloat(formData.targetAmount) / formData.durationMonths;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <Icons.Target />
              <span className="ml-2">Set Business Goal</span>
            </h2>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <Icons.XCircle />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Open New Branch Downtown"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Goal Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                {BUSINESS_GOAL_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Target Amount ($) *
              </label>
              <input
                type="number"
                value={formData.targetAmount}
                onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                placeholder="e.g., 50000"
                step="0.01"
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (Months) *
              </label>
              <select
                value={formData.durationMonths}
                onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                required
                disabled={isSubmitting}
              >
                <option value="1">1 month</option>
                <option value="3">3 months</option>
                <option value="6">6 months</option>
                <option value="12">12 months</option>
                <option value="24">24 months</option>
              </select>
            </div>

            {formData.targetAmount && formData.durationMonths && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center text-blue-700 font-medium">
                  <Icons.BarChart3 />
                  <span className="ml-2">Monthly Target</span>
                </div>
                <div className="text-2xl font-bold text-blue-800 mt-1">
                  ${calculateMonthlyTarget().toFixed(2)}
                </div>
                <div className="text-sm text-blue-600">
                  You need to save this amount monthly to reach your goal
                </div>
              </div>
            )}

            {isUnrealistic && businessData && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center text-red-700 font-medium">
                  <Icons.AlertTriangle />
                  <span className="ml-2">Goal May Be Unrealistic</span>
                </div>
                <div className="text-sm text-red-600 mt-1">
                  Your monthly target (${calculateMonthlyTarget().toFixed(2)}) exceeds 50% of your current monthly profit.
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !formData.name || !formData.targetAmount}
                className="flex-1 px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Creating...' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Business Dashboard Component
const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ 
  userName: propUserName, 
  userId: propUserId 
}) => {
  // Get user from Redux store
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Use props if provided, otherwise use Redux user data
  const userName = propUserName || user?.firstName || user?.name || 'Business Owner';
  const userId = propUserId || user?.id || 'default-business-id';

  // State for modals
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showProfitModal, setShowProfitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
  // API Calls
  const { 
    data: transactionsResponse, 
    refetch: refetchTransactions,
  } = useGetTransactionsQuery(userId, { skip: !userId });
  
  const { 
    data: accountsResponse, 
    refetch: refetchAccounts,
  } = useGetAccountsQuery(userId, { skip: !userId });
  
  const { 
    data: goalsResponse, 
    refetch: refetchGoals,
  } = useGetGoalsQuery(userId, { skip: !userId });
  
  const [createTransaction] = useCreateTransactionMutation();
  const [updateAccount] = useUpdateAccountMutation();
  const [createAccount] = useCreateAccountMutation();
  const [createGoal] = useCreateGoalMutation();

  // Extract data from API responses with better handling
  const extractData = (response: any): any[] => {
    if (!response) return [];
    console.log('API Response:', response);
    
    // Try different response structures
    if (Array.isArray(response)) return response;
    if (response.data && Array.isArray(response.data)) return response.data;
    if (response.data?.items && Array.isArray(response.data.items)) return response.data.items;
    if (response.results && Array.isArray(response.results)) return response.results;
    
    // For RTK Query structure
    if (response.data && typeof response.data === 'object') {
      const data = response.data;
      if (Array.isArray(data)) return data;
      if (data.data && Array.isArray(data.data)) return data.data;
      if (data.items && Array.isArray(data.items)) return data.items;
    }
    
    return [];
  };

  const transactions: BusinessTransaction[] = extractData(transactionsResponse) || [];
  const accounts: BusinessAccount[] = extractData(accountsResponse) || [];
  const goals: BusinessGoal[] = extractData(goalsResponse) || [];

  console.log('Business Data:', {
    transactionsCount: transactions.length,
    accountsCount: accounts.length,
    goalsCount: goals.length,
    accounts: accounts
  });

  // Filter business data - accept ALL accounts for business use
  const businessAccounts = accounts.filter(() => {
    // Accept all accounts for business dashboard
    return true;
  });

  const businessGoals = goals.filter(goal => 
    (goal as any).businessCategory || (goal as any).isBusinessGoal || goal.category?.includes('business')
  );

  // Calculate business financial data
  const calculateBusinessFinancialData = () => {
    let totalRevenue = 0;
    let totalExpenses = 0;
    const expenseByCategory: Record<string, number> = {};
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculate monthly totals
    transactions.forEach((transaction) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
        if (transaction.type === 'income') {
          totalRevenue += transaction.amount;
        } else if (transaction.type === 'expense') {
          totalExpenses += transaction.amount;
          expenseByCategory[transaction.category] = (expenseByCategory[transaction.category] || 0) + transaction.amount;
        }
      }
    });

    // Check for overspending
    Object.entries(expenseByCategory).forEach(([category, amount]) => {
      if (totalRevenue > 0 && amount > totalRevenue * 0.3) { // More than 30% of revenue
        toast.warning(`Overspending Alert`, {
          description: `You're spending $${amount.toFixed(2)} on ${category} (more than 30% of revenue)`,
          duration: 8000,
        });
      }
    });

    // Calculate total business account balance
    const totalBusinessBalance = businessAccounts.reduce((sum, account) => {
      return sum + (account.balance || 0);
    }, 0);

    // Calculate profit margin
    const netProfit = totalRevenue - totalExpenses;
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    return {
      totalBusinessBalance,
      monthlyRevenue: totalRevenue,
      monthlyExpenses: totalExpenses,
      netProfit,
      profitMargin,
      isProfitable: netProfit > 0,
      expenseByCategory
    };
  };

  const businessFinancialData = calculateBusinessFinancialData();

  // Check for goal notifications
  useEffect(() => {
    if (businessGoals.length > 0) {
      businessGoals.forEach(goal => {
        const targetDate = new Date(goal.targetDate);
        const today = new Date();
        const daysUntilTarget = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
        
        // Notification for goals almost achieved
        if (progressPercentage >= 80 && progressPercentage < 100) {
          toast.info(`Goal Progress`, {
            description: `"${goal.name}" is ${progressPercentage.toFixed(1)}% complete!`,
            duration: 5000,
          });
        }
        
        // Notification for upcoming deadline
        if (daysUntilTarget > 0 && daysUntilTarget <= 30) {
          toast.warning(`Goal Deadline`, {
            description: `"${goal.name}" deadline in ${daysUntilTarget} days!`,
            duration: 5000,
          });
        }
        
        // Notification for achieved goals
        if (progressPercentage >= 100) {
          toast.success(`Goal Achieved!`, {
            description: `"${goal.name}" has been completed!`,
            duration: 5000,
          });
        }

        // Notification for unrealistic goals
        if (goal.isUnrealistic) {
          toast.warning(`Goal Warning`, {
            description: `"${goal.name}" may be unrealistic based on current profits`,
            duration: 6000,
          });
        }
      });
    }
  }, [businessGoals]);

  // Handle adding business account
  const handleAddAccount = async (accountData: any): Promise<void> => {
    try {
      const accountPayload = {
        ...accountData,
        userId
      };
      
      console.log('Creating account:', accountPayload);
      await createAccount(accountPayload as any).unwrap();
      
      refetchAccounts();
      
      toast.success('Business account created!', {
        description: `${accountData.name} with $${accountData.balance || '0.00'}`,
        duration: 4000,
      });
      
    } catch (error: any) {
      console.error('Account creation error:', error);
      toast.error('Failed to create account', {
        description: error.data?.message || 'Please try again.',
        duration: 5000,
      });
    }
  };

  // Handle adding business expense
  const handleAddExpense = async (expenseData: any): Promise<void> => {
    try {
      console.log('Adding expense:', expenseData);
      
      // Create transaction
      await createTransaction({
        ...expenseData,
        userId
      } as any).unwrap();
      
      // Update account balance (decrease by expense amount)
      const selectedAccount = businessAccounts.find((acc) => acc.id === expenseData.accountId);
      if (selectedAccount) {
        const newBalance = (selectedAccount.balance || 0) - expenseData.amount;
        await updateAccount({
          id: expenseData.accountId,
          balance: newBalance
        } as any).unwrap();
      }

      // Refresh data
      refetchTransactions();
      refetchAccounts();
      
      toast.success('Expense added!', {
        description: `$${expenseData.amount.toFixed(2)} deducted from account`,
        duration: 4000,
      });
      
    } catch (error: any) {
      console.error('Expense error:', error);
      toast.error('Failed to add expense', {
        description: error.data?.message || 'Please try again.',
        duration: 5000,
      });
    }
  };

  // Handle adding business profit
  const handleAddProfit = async (profitData: any): Promise<void> => {
    try {
      console.log('Adding profit:', profitData);
      
      await createTransaction({
        ...profitData,
        userId
      } as any).unwrap();
      
      // Update account balance (increase by profit amount)
      const selectedAccount = businessAccounts.find((acc) => acc.id === profitData.accountId);
      if (selectedAccount) {
        const newBalance = (selectedAccount.balance || 0) + profitData.amount;
        await updateAccount({
          id: profitData.accountId,
          balance: newBalance
        } as any).unwrap();
      }

      refetchTransactions();
      refetchAccounts();
      
      toast.success('Profit added!', {
        description: `$${profitData.amount.toFixed(2)} added to account`,
        duration: 4000,
      });
      
    } catch (error: any) {
      console.error('Profit error:', error);
      toast.error('Failed to add profit', {
        description: error.data?.message || 'Please try again.',
        duration: 5000,
      });
    }
  };

  // Handle adding business goal
  const handleAddGoal = async (goalData: any): Promise<void> => {
    try {
      console.log('Adding goal:', goalData);
      
      await createGoal({
        ...goalData,
        userId
      } as any).unwrap();
      
      refetchGoals();
      
      toast.success('Goal created!', {
        description: `"${goalData.name}" - Target: $${goalData.targetAmount.toFixed(2)}`,
        duration: 4000,
      });
      
    } catch (error: any) {
      console.error('Goal error:', error);
      toast.error('Failed to create goal', {
        description: error.data?.message || 'Please try again.',
        duration: 5000,
      });
    }
  };

  // Calculate profit by period
  const calculateProfitByPeriod = () => {
    const profitByPeriod: Record<string, number> = { daily: 0, weekly: 0, monthly: 0, yearly: 0 };
    
    transactions.forEach(transaction => {
      if (transaction.type === 'income') {
        // Check period from transaction data or default to monthly
        const period = (transaction as any).period || 'monthly';
        if (profitByPeriod.hasOwnProperty(period)) {
          profitByPeriod[period] += transaction.amount;
        }
      }
    });
    
    return profitByPeriod;
  };

  const profitByPeriod = calculateProfitByPeriod();

  // Business Quick Actions
  const businessQuickActions = [
    { 
      id: 'add-account', 
      label: 'Add Account', 
      icon: <Icons.Building />,
      color: 'bg-gradient-to-r from-pink-500 to-rose-500',
      onClick: () => setShowAccountModal(true)
    },
    { 
      id: 'add-expense', 
      label: 'Add Expense', 
      icon: <Icons.TrendingDown />,
      color: 'bg-gradient-to-r from-red-500 to-pink-500',
      onClick: () => {
        if (businessAccounts.length === 0) {
          toast.error('Please create a business account first');
          setShowAccountModal(true);
        } else {
          setShowExpenseModal(true);
        }
      }
    },
    { 
      id: 'add-profit', 
      label: 'Add Profit', 
      icon: <Icons.TrendingUp />,
      color: 'bg-gradient-to-r from-green-500 to-emerald-500',
      onClick: () => {
        if (businessAccounts.length === 0) {
          toast.error('Please create a business account first');
          setShowAccountModal(true);
        } else {
          setShowProfitModal(true);
        }
      }
    },
    { 
      id: 'set-goal', 
      label: 'Set Goal', 
      icon: <Icons.Target />,
      color: 'bg-gradient-to-r from-yellow-500 to-orange-500',
      onClick: () => setShowGoalModal(true)
    },
    { 
      id: 'view-reports', 
      label: 'View Reports', 
      icon: <Icons.BarChart3 />,
      color: 'bg-gradient-to-r from-purple-500 to-indigo-500',
      onClick: () => {
        const reportMessage = `📊 **Business Report Summary**:
• Total Balance: $${businessFinancialData.totalBusinessBalance.toFixed(2)}
• Monthly Revenue: $${businessFinancialData.monthlyRevenue.toFixed(2)}
• Monthly Expenses: $${businessFinancialData.monthlyExpenses.toFixed(2)}
• Net Profit: $${businessFinancialData.netProfit.toFixed(2)}
• Profit Margin: ${businessFinancialData.profitMargin.toFixed(1)}%
• Active Goals: ${businessGoals.length}`;
        
        toast.success('Business Report', {
          description: reportMessage,
          duration: 8000,
        });
      }
    },
    { 
      id: 'taxes', 
      label: 'Tax Planning', 
      icon: <Icons.FileText />,
      color: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      onClick: () => {
        const totalTaxes = transactions
          .filter(t => t.category === 'taxes' && t.type === 'expense')
          .reduce((sum, t) => sum + t.amount, 0);
        
        toast.info('Tax Summary', {
          description: `Total taxes: $${totalTaxes.toFixed(2)}`,
          duration: 5000,
        });
      }
    },
  ];

  return (
    <>
      <Toaster 
        position="top-right"
        expand={false}
        richColors
        closeButton
      />

      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white">
        {/* Navbar - Gold */}
        <nav className="bg-gradient-to-r from-yellow-400 to-yellow-500 shadow-lg">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Icons.Building />
                <div>
                  <h1 className="text-xl font-bold text-white">Business Dashboard</h1>
                  <p className="text-yellow-100 text-sm">Welcome, {userName}!</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Icons.Bell />
                </button>
                <button className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors">
                  <Icons.Settings />
                </button>
              </div>
            </div>
          </div>
        </nav>

        <div className="container mx-auto px-4 py-8">
          {/* Financial Summary */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-pink-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Total Balance</h3>
                <Icons.Wallet />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                ${businessFinancialData.totalBusinessBalance.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                Across {businessAccounts.length} business account{businessAccounts.length !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Monthly Revenue</h3>
                <Icons.TrendingUp />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                ${businessFinancialData.monthlyRevenue.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                This month's total income
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-500">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-700">Monthly Expenses</h3>
                <Icons.TrendingDown />
              </div>
              <div className="text-3xl font-bold text-gray-800">
                ${businessFinancialData.monthlyExpenses.toFixed(2)}
              </div>
              <div className="text-sm text-gray-500 mt-2">
                This month's total spending
              </div>
            </div>
          </div>

          {/* Profit Status - Dynamic Message */}
          <div className={`mb-8 p-6 rounded-xl shadow-lg ${
            businessFinancialData.isProfitable 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200' 
              : 'bg-gradient-to-r from-red-50 to-rose-50 border border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {businessFinancialData.isProfitable ? (
                  <>
                    <Icons.CheckCircle />
                    <div>
                      <h3 className="text-xl font-bold text-green-700">
                        {businessFinancialData.netProfit > 1000 
                          ? 'Business is Highly Profitable!' 
                          : 'Business is Profitable!'}
                      </h3>
                      <p className="text-green-600">
                        After all business expenses • Margin: {businessFinancialData.profitMargin.toFixed(1)}%
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <Icons.AlertTriangle />
                    <div>
                      <h3 className="text-xl font-bold text-red-700">
                        {Math.abs(businessFinancialData.netProfit) > 1000 
                          ? 'Significant Business Loss!' 
                          : 'Operating at a Loss'}
                      </h3>
                      <p className="text-red-600">
                        Expenses exceed revenue by ${Math.abs(businessFinancialData.netProfit).toFixed(2)}
                      </p>
                    </div>
                  </>
                )}
              </div>
              <div className="text-right">
                <div className={`text-4xl font-bold ${
                  businessFinancialData.isProfitable ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${Math.abs(businessFinancialData.netProfit).toFixed(2)}
                </div>
                <div className={`text-sm ${
                  businessFinancialData.isProfitable ? 'text-green-600' : 'text-red-600'
                }`}>
                  {businessFinancialData.isProfitable ? 'Net Profit' : 'Net Loss'}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions - Pink */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Operations</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {businessQuickActions.map((action) => (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`${action.color} text-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center justify-center space-y-3`}
                >
                  <div className="p-3 bg-white/20 rounded-lg text-2xl">
                    {action.icon}
                  </div>
                  <span className="font-semibold text-center">{action.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Business Accounts */}
          {businessAccounts.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Business Accounts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessAccounts.map((account) => (
                  <div key={account.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-800">{account.name}</h3>
                        <p className="text-sm text-gray-500">{account.type} • {account.currency}</p>
                      </div>
                      <Icons.Wallet />
                    </div>
                    <div className={`text-3xl font-bold ${
                      account.balance >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      ${account.balance?.toFixed(2)}
                    </div>
                    {account.businessType && (
                      <p className="text-sm text-gray-600 mt-2">Type: {account.businessType}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-8 p-6 bg-white rounded-xl shadow-lg text-center">
              <Icons.Wallet />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No Business Accounts Yet</h3>
              <p className="text-gray-500 mb-4">Create your first business account to start tracking finances</p>
              <button
                onClick={() => setShowAccountModal(true)}
                className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity"
              >
                Create First Account
              </button>
            </div>
          )}

          {/* Business Goals */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Business Goals</h2>
              <button
                onClick={() => setShowGoalModal(true)}
                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity flex items-center space-x-2"
              >
                <Icons.Plus />
                <span>New Goal</span>
              </button>
            </div>

            {businessGoals.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {businessGoals.map((goal) => {
                  const progressPercentage = (goal.currentAmount / goal.targetAmount) * 100;
                  const categoryInfo = BUSINESS_GOAL_CATEGORIES.find(cat => cat.value === goal.businessCategory);
                  const targetDate = new Date(goal.targetDate);
                  const daysRemaining = Math.ceil((targetDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={goal.id} className={`bg-white rounded-xl shadow-lg p-6 ${
                      goal.isUnrealistic ? 'border-2 border-red-300' : ''
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-pink-100 rounded-lg">
                            {categoryInfo?.icon || <Icons.Target />}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800">{goal.name}</h3>
                            <p className="text-sm text-gray-500">{categoryInfo?.label || 'Business Goal'}</p>
                          </div>
                        </div>
                        {goal.isUnrealistic && (
                          <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
                            ⚠️ Challenging
                          </span>
                        )}
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Progress</span>
                          <span>{progressPercentage.toFixed(1)}%</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              progressPercentage >= 100 
                                ? 'bg-green-500' 
                                : 'bg-gradient-to-r from-pink-500 to-rose-500'
                            }`}
                            style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-sm text-gray-500 mt-1">
                          <span>${goal.currentAmount.toFixed(2)} saved</span>
                          <span>Target: ${goal.targetAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Icons.Calendar />
                          <span>{daysRemaining > 0 ? `${daysRemaining} days left` : 'Deadline passed'}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">Monthly: ${(goal.targetAmount / goal.durationMonths).toFixed(2)}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Icons.Target />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Business Goals Yet</h3>
                <p className="text-gray-500 mb-6">Set your first business goal to track growth and expansion</p>
                <button
                  onClick={() => setShowGoalModal(true)}
                  className="bg-gradient-to-r from-pink-500 to-rose-500 text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity inline-flex items-center space-x-2"
                >
                  <Icons.Plus />
                  <span>Set Your First Goal</span>
                </button>
              </div>
            )}
          </div>

          {/* Expense Breakdown */}
          {Object.keys(businessFinancialData.expenseByCategory || {}).length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Expense Breakdown</h2>
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(businessFinancialData.expenseByCategory).map(([category, amount]) => {
                    const categoryInfo = BUSINESS_EXPENSE_CATEGORIES.find(cat => cat.value === category);
                    const percentage = businessFinancialData.monthlyRevenue > 0 
                      ? (amount / businessFinancialData.monthlyRevenue) * 100 
                      : 0;
                    const isOverspending = percentage > 30;
                    
                    return (
                      <div key={category} className={`p-4 rounded-lg border ${
                        isOverspending ? 'border-red-300 bg-red-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center space-x-3 mb-2">
                          <div className={`p-2 rounded-lg ${categoryInfo?.color || 'bg-gray-500'}`}>
                            {categoryInfo?.icon}
                          </div>
                          <div>
                            <div className="font-medium text-gray-800">{categoryInfo?.label || category}</div>
                            <div className={`text-2xl font-bold ${
                              isOverspending ? 'text-red-600' : 'text-gray-800'
                            }`}>
                              ${amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">
                          {percentage.toFixed(1)}% of revenue
                          {isOverspending && (
                            <span className="text-red-600 font-medium ml-2">⚠️ Overspending</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Profit by Period */}
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Profit by Period</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PROFIT_PERIODS.map(period => (
                <div key={period.value} className="bg-white rounded-xl shadow-lg p-6 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg mb-4">
                    {period.icon}
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-2">{period.label}</h3>
                  <div className="text-2xl font-bold text-green-600">
                    ${profitByPeriod[period.value]?.toFixed(2) || '0.00'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modals */}
        <AddAccountModal
          isOpen={showAccountModal}
          onClose={() => setShowAccountModal(false)}
          onSubmit={handleAddAccount}
        />

        <AddExpenseModal
          isOpen={showExpenseModal}
          onClose={() => setShowExpenseModal(false)}
          onSubmit={handleAddExpense}
          accounts={businessAccounts}
        />

        <AddProfitModal
          isOpen={showProfitModal}
          onClose={() => setShowProfitModal(false)}
          onSubmit={handleAddProfit}
          accounts={businessAccounts}
        />

        <BusinessGoalModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onSubmit={handleAddGoal}
          businessData={businessFinancialData}
        />
      </div>
    </>
  );
};

export default BusinessDashboard;