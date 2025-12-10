// src/Dashboards/personal_user/PersonalDashboard.tsx - COMPLETE FIXED
import React, { useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Toaster, toast } from 'sonner';
import type { RootState } from '../../app/store';

// FIXED: Import directly from feature APIs instead of from services/api
import { useGetAccountsQuery, useUpdateAccountMutation, type Account } from '../../features/accounts/accountsApi';
import { useGetTransactionsQuery, useCreateTransactionMutation, type Transaction } from '../../features/transactions/transactionsApi';
import { useGetGoalsQuery, useCreateGoalMutation, type Goal } from '../../features/goals/goalsApi';
import { useGetNotificationsQuery, useCreateNotificationMutation } from '../../features/notifications/notificationsApi';

// ========== ADDED IMPORTS ==========
import { useGetReceivedInvitationsQuery, useAcceptInvitationMutation, useDeclineInvitationMutation } from '../../features/groups/groupsApi';
import ReceivedInvitations from '../../features/groups/ReceivedInvitations'; // FIXED: Updated import path
import { Users, RefreshCw } from 'lucide-react';
// ========== END ADDED IMPORTS ==========

// ========== MODAL COMPONENTS ==========
const IncomeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  userId: string;
  onCreateIncome: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, accounts, userId, onCreateIncome }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'salary',
    accountId: accounts.length > 0 ? accounts[0].id : '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      await onCreateIncome({
        description: formData.description || 'Income',
        amount: parseFloat(formData.amount),
        type: 'income',
        category: formData.category,
        date: formData.date,
        accountId: formData.accountId,
        userId: userId,
      });
      
      setFormData({
        amount: '',
        description: '',
        category: 'salary',
        accountId: accounts.length > 0 ? accounts[0].id : '',
        date: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to add income');
    } finally {
      setIsSubmitting(false);
    }
  };

  const incomeCategories = [
    { value: 'salary', label: '💼 Salary' },
    { value: 'freelance', label: '💻 Freelance' },
    { value: 'investment', label: '📈 Investment' },
    { value: 'gift', label: '🎁 Gift' },
    { value: 'other', label: '📝 Other' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'auto',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
          💰 Add Income
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Amount ($) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., 3000"
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Monthly Salary"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={isSubmitting}
            >
              {incomeCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Account to Deposit Into *
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
              disabled={isSubmitting || accounts.length === 0}
            >
              <option value="">Select an account</option>
              {accounts.map((account: Account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - ${account.balance?.toFixed(2)}
                </option>
              ))}
            </select>
            {accounts.length === 0 && (
              <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                No accounts found. Please create an account first.
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || accounts.length === 0}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: isSubmitting || accounts.length === 0 ? '#9CA3AF' : '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: isSubmitting || accounts.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ExpenseModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  accounts: Account[];
  userId: string;
  onCreateExpense: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, accounts, userId, onCreateExpense }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: 'Food & Dining',
    accountId: accounts.length > 0 ? accounts[0].id : '',
    date: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    const selectedAccount = accounts.find(acc => acc.id === formData.accountId);
    if (selectedAccount && parseFloat(formData.amount) > selectedAccount.balance) {
      toast.error(`Insufficient balance. Available: $${selectedAccount.balance.toFixed(2)}`);
      return;
    }

    setIsSubmitting(true);
    try {
      await onCreateExpense({
        description: formData.description || 'Expense',
        amount: parseFloat(formData.amount),
        type: 'expense',
        category: formData.category,
        date: formData.date,
        accountId: formData.accountId,
        userId: userId,
      });
      
      setFormData({
        amount: '',
        description: '',
        category: 'Food & Dining',
        accountId: accounts.length > 0 ? accounts[0].id : '',
        date: new Date().toISOString().split('T')[0],
      });
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to add expense');
    } finally {
      setIsSubmitting(false);
    }
  };

  const expenseCategories = [
    { value: 'Food & Dining', label: '🍔 Food & Dining' },
    { value: 'Rent/Mortgage', label: '🏠 Rent/Mortgage' },
    { value: 'Transportation', label: '🚗 Transportation' },
    { value: 'Utilities', label: '⚡ Utilities' },
    { value: 'Shopping', label: '🛍️ Shopping' },
    { value: 'Entertainment', label: '🎬 Entertainment' },
    { value: 'Healthcare', label: '🏥 Healthcare' },
    { value: 'Education', label: '📚 Education' },
    { value: 'Other', label: '📝 Other' }
  ];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'auto',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
          💸 Add Expense
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Amount ($) *
            </label>
            <input
              type="number"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              placeholder="e.g., 50"
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Description
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g., Groceries"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={isSubmitting}
            >
              {expenseCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Account to Withdraw From *
            </label>
            <select
              value={formData.accountId}
              onChange={(e) => setFormData({ ...formData, accountId: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
              disabled={isSubmitting || accounts.length === 0}
            >
              <option value="">Select an account</option>
              {accounts.map((account: Account) => (
                <option key={account.id} value={account.id}>
                  {account.name} - ${account.balance?.toFixed(2)}
                </option>
              ))}
            </select>
            {accounts.length === 0 && (
              <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '4px' }}>
                No accounts found. Please create an account first.
              </div>
            )}
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || accounts.length === 0}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: isSubmitting || accounts.length === 0 ? '#9CA3AF' : '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: isSubmitting || accounts.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const GoalModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  monthlyIncome: number;
  onCreateGoal: (data: any) => Promise<void>;
}> = ({ isOpen, onClose, userId, monthlyIncome, onCreateGoal }) => {
  const [formData, setFormData] = useState({
    name: '',
    targetAmount: '',
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    category: 'vacation',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const calculateMonthlySavingsNeeded = () => {
    if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) return 0;
    
    const targetAmount = parseFloat(formData.targetAmount);
    const targetDate = new Date(formData.targetDate);
    const today = new Date();
    
    const months = Math.max(1, Math.ceil(
      (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
    ));
    
    return targetAmount / months;
  };

  const isGoalRealistic = () => {
    const monthlySavingsNeeded = calculateMonthlySavingsNeeded();
    if (monthlyIncome === 0) return false;
    
    const incomePercentage = (monthlySavingsNeeded / monthlyIncome) * 100;
    return incomePercentage <= 30;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
      toast.error('Please fill in all required fields');
      return;
    }

    const monthlySavingsNeeded = calculateMonthlySavingsNeeded();
    const isRealistic = isGoalRealistic();

    if (!isRealistic) {
      const proceed = window.confirm(
        `⚠️ Goal may be unrealistic!\n\n` +
        `You need to save $${monthlySavingsNeeded.toFixed(2)}/month\n` +
        `This is ${((monthlySavingsNeeded/monthlyIncome)*100).toFixed(1)}% of your monthly income.\n\n` +
        `Do you still want to create this goal?`
      );
      if (!proceed) return;
    }

    setIsSubmitting(true);
    try {
      await onCreateGoal({
        name: formData.name.trim(),
        targetAmount: parseFloat(formData.targetAmount),
        targetDate: formData.targetDate,
        startDate: new Date().toISOString().split('T')[0],
        category: formData.category,
        userId: userId,
        isUnrealistic: !isRealistic,
        monthlySavingsNeeded: monthlySavingsNeeded,
      });
      
      setFormData({
        name: '',
        targetAmount: '',
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        category: 'vacation',
      });
      onClose();
    } catch (error: any) {
      toast.error(error.data?.message || 'Failed to create goal');
    } finally {
      setIsSubmitting(false);
    }
  };

  const goalCategories = [
    { value: 'vacation', label: '🏖️ Vacation' },
    { value: 'car', label: '🚗 Car' },
    { value: 'home', label: '🏠 Home' },
    { value: 'emergency', label: '🆘 Emergency Fund' },
    { value: 'retirement', label: '👵 Retirement' },
    { value: 'education', label: '🎓 Education' },
    { value: 'other', label: '📝 Other' }
  ];

  const monthlySavingsNeeded = calculateMonthlySavingsNeeded();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'auto',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
          🎯 Set Goal
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Goal Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hawaii Vacation, New Car"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Target Amount ($) *
            </label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="e.g., 5000"
              step="0.01"
              min="0.01"
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Target Date *
            </label>
            <input
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              required
              disabled={isSubmitting}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px' }}>
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '16px',
              }}
              disabled={isSubmitting}
            >
              {goalCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {formData.targetAmount && parseFloat(formData.targetAmount) > 0 && monthlyIncome > 0 && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: isGoalRealistic() ? '#ECFDF5' : '#FEF2F2',
              borderRadius: '8px',
              borderLeft: `4px solid ${isGoalRealistic() ? '#10B981' : '#EF4444'}`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <span style={{ fontSize: '20px' }}>
                  {isGoalRealistic() ? '✅' : '⚠️'}
                </span>
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                  {isGoalRealistic() ? 'Goal seems realistic' : 'Goal may be unrealistic'}
                </h3>
              </div>
              
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
                ${monthlySavingsNeeded.toFixed(2)}
                <span style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>/month</span>
              </div>
              
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                {monthlyIncome > 0 ? (
                  <>
                    You need to save {((monthlySavingsNeeded/monthlyIncome)*100).toFixed(1)}% of your monthly income
                  </>
                ) : 'Add your income first to check feasibility'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#F3F4F6',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: isSubmitting ? '#9CA3AF' : '#8B5CF6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '16px',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Creating...' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const ReportModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  financialData: any;
  categorySpending: Record<string, number>;
}> = ({ isOpen, onClose, financialData, categorySpending }) => {
  if (!isOpen) return null;

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food & Dining': '#FF4D94',
      'Rent/Mortgage': '#8B5CF6',
      'Transportation': '#3B82F6',
      'Utilities': '#10B981',
      'Shopping': '#F59E0B',
      'Entertainment': '#EC4899',
      'Healthcare': '#EF4444',
      'Education': '#6366F1',
      'Other': '#6B7280',
      'salary': '#10B981',
      'freelance': '#3B82F6',
      'investment': '#8B5CF6',
      'gift': '#EC4899',
    };
    return colors[category] || '#6B7280';
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '700px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
        pointerEvents: 'auto',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '20px' }}>
          📊 Financial Report
        </h2>
        
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
            Monthly Summary
          </h3>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#F0F9FF', 
              borderRadius: '8px',
              borderLeft: '4px solid #3B82F6'
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Total Income</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                ${financialData.monthlyIncome.toFixed(2)}
              </div>
            </div>
            <div style={{ 
              padding: '16px', 
              backgroundColor: '#FEF2F2', 
              borderRadius: '8px',
              borderLeft: '4px solid #EF4444'
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Total Expenses</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                ${financialData.monthlyExpenses.toFixed(2)}
              </div>
            </div>
          </div>
          
          <div style={{ 
            padding: '16px', 
            backgroundColor: '#ECFDF5', 
            borderRadius: '8px',
            borderLeft: '4px solid #10B981',
            marginBottom: '20px'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Remaining Balance</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
              ${financialData.remainingBalance.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              {financialData.remainingBalance >= 0 ? '✅ Positive cash flow' : '⚠️ Negative cash flow'}
            </div>
          </div>

          <div style={{ 
            padding: '16px', 
            backgroundColor: '#FFFBEB', 
            borderRadius: '8px',
            borderLeft: '4px solid #F59E0B'
          }}>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '4px' }}>Savings Capacity</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
              ${financialData.monthlySavingsCapacity.toFixed(2)}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '4px' }}>
              Amount you could save each month
            </div>
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '12px', color: '#111827' }}>
            Category Breakdown
          </h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {Object.entries(categorySpending).map(([category, amount]: [string, any]) => (
              <div key={category} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px',
                marginBottom: '8px',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                borderLeft: `4px solid ${getCategoryColor(category)}`
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: getCategoryColor(category),
                    borderRadius: '50%'
                  }} />
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151', textTransform: 'capitalize' }}>
                    {category}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#111827' }}>
                    ${amount.toFixed(2)}
                  </span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>
                    {financialData.monthlyExpenses > 0 ? 
                      `${((amount / financialData.monthlyExpenses) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
              </div>
            ))}
            {Object.keys(categorySpending).length === 0 && (
              <div style={{ 
                padding: '20px', 
                textAlign: 'center',
                color: '#6B7280',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px'
              }}>
                No spending data available
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
          <button
            onClick={() => {
              toast.success('Report exported successfully!');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Export as PDF
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN PERSONAL DASHBOARD COMPONENT ==========
const PersonalDashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Modal states
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // Local state for real-time updates
  const [localAccounts, setLocalAccounts] = useState<Account[]>([]);
  const [localTransactions, setLocalTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // API Calls - FIXED: Imported directly from feature APIs
  const { 
    data: transactionsData = [], 
    isLoading: transactionsLoading, 
    refetch: refetchTransactions,
  } = useGetTransactionsQuery(user?.id || '', {
    skip: !user?.id,
    pollingInterval: 30000,
  });

  const { 
    data: accountsData = [], 
    isLoading: accountsLoading, 
    refetch: refetchAccounts,
  } = useGetAccountsQuery(user?.id || '', {
    skip: !user?.id,
    pollingInterval: 30000,
  });

  const { 
    data: goalsData = [], 
    isLoading: goalsLoading, 
    refetch: refetchGoals,
  } = useGetGoalsQuery(user?.id || '', {
    skip: !user?.id,
  });

  const { 
    data: notificationsData = [], 
    isLoading: notificationsLoading,
    refetch: refetchNotifications,
  } = useGetNotificationsQuery(user?.id || '', {
    skip: !user?.id,
  });

  // ========== ADDED HOOKS ==========
  const { 
    data: receivedInvitations = [],
    isLoading: _isLoadingInvitations, // FIXED: Added underscore
    refetch: refetchInvitations 
  } = useGetReceivedInvitationsQuery();

  const [_acceptInvitation] = useAcceptInvitationMutation(); // FIXED: Added underscore
  const [_declineInvitation] = useDeclineInvitationMutation(); // FIXED: Added underscore
  // ========== END ADDED HOOKS ==========

  // API Mutations - FIXED: Imported directly from feature APIs
  const [createTransaction] = useCreateTransactionMutation();
  const [updateAccount] = useUpdateAccountMutation();
  const [createGoal] = useCreateGoalMutation();
  const [createNotification] = useCreateNotificationMutation();

  // Sync local state with API data
  useEffect(() => {
    if (accountsData && Array.isArray(accountsData)) {
      setLocalAccounts(accountsData);
    }
  }, [accountsData]);

  useEffect(() => {
    if (transactionsData && Array.isArray(transactionsData)) {
      setLocalTransactions(transactionsData);
    }
  }, [transactionsData]);

  // Calculate financial data using local state
  const calculateFinancialData = useCallback(() => {
    let totalIncome = 0;
    let totalExpenses = 0;
    const categorySpending: Record<string, number> = {};
    
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    localTransactions.forEach((transaction: Transaction) => {
      const transactionDate = new Date(transaction.date);
      if (transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear) {
        if (transaction.type === 'income') {
          totalIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
          totalExpenses += transaction.amount;
          categorySpending[transaction.category] = (categorySpending[transaction.category] || 0) + transaction.amount;
        }
      }
    });

    const totalBalance = localAccounts.reduce((sum: number, account: Account) => sum + (account.balance || 0), 0);
    const remainingBalance = totalIncome - totalExpenses;
    const monthlySavingsCapacity = Math.max(0, remainingBalance * 0.7);

    const overspendingAlerts: Array<{ category: string; amount: number; percentage: string }> = [];
    if (totalIncome > 0) {
      Object.entries(categorySpending).forEach(([category, amount]) => {
        const percentage = (amount / totalIncome) * 100;
        if (percentage > 50) {
          overspendingAlerts.push({
            category,
            amount,
            percentage: percentage.toFixed(1)
          });
        }
      });
    }

    return {
      totalBalance,
      monthlyIncome: totalIncome,
      monthlyExpenses: totalExpenses,
      remainingBalance,
      categorySpending,
      monthlySavingsCapacity,
      overspendingAlerts
    };
  }, [localTransactions, localAccounts]);

  const financialData = calculateFinancialData();

  const handleAddIncome = async (incomeData: any): Promise<void> => {
    setIsProcessing(true);
    try {
      await createTransaction({
        description: incomeData.description || 'Income',
        amount: parseFloat(incomeData.amount),
        type: 'income',
        category: incomeData.category,
        date: incomeData.date,
        accountId: incomeData.accountId,
        userId: user?.id || '',
        notes: `Income: ${incomeData.description || 'No description'}`,
      }).unwrap();

      const selectedAccount = localAccounts.find((acc: Account) => acc.id === incomeData.accountId);
      if (selectedAccount) {
        const newBalance = (selectedAccount.balance || 0) + parseFloat(incomeData.amount);
        
        // FIXED: Now UpdateAccountDto includes balance property
        await updateAccount({
          id: incomeData.accountId,
          data: { balance: newBalance }
        }).unwrap();
        
        setLocalAccounts(prev => prev.map(acc => 
          acc.id === incomeData.accountId 
            ? { ...acc, balance: newBalance }
            : acc
        ));
      }

      await createNotification({
        title: '💰 Income Added',
        message: `Income of $${parseFloat(incomeData.amount).toFixed(2)} added to account`,
        type: 'overspending',
        userId: user?.id || '',
        metadata: {
          amount: parseFloat(incomeData.amount),
          accountId: incomeData.accountId,
          category: incomeData.category
        }
      }).unwrap();

      toast.success(`💰 Income of $${parseFloat(incomeData.amount).toFixed(2)} added! Account balance updated.`);

      refetchTransactions();
      refetchAccounts();
      refetchNotifications();

      setShowIncomeModal(false);

    } catch (error: any) {
      console.error('Income error:', error);
      toast.error(error.data?.message || 'Failed to add income. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAddExpense = async (expenseData: any): Promise<void> => {
    setIsProcessing(true);
    try {
      const selectedAccount = localAccounts.find((acc: Account) => acc.id === expenseData.accountId);
      if (selectedAccount && parseFloat(expenseData.amount) > selectedAccount.balance) {
        toast.error(`Insufficient balance. Available: $${selectedAccount.balance.toFixed(2)}`);
        setIsProcessing(false);
        return;
      }

      await createTransaction({
        description: expenseData.description || 'Expense',
        amount: parseFloat(expenseData.amount),
        type: 'expense',
        category: expenseData.category,
        date: expenseData.date,
        accountId: expenseData.accountId,
        userId: user?.id || '',
        notes: `Expense: ${expenseData.description || 'No description'}`,
      }).unwrap();

      if (selectedAccount) {
        const newBalance = (selectedAccount.balance || 0) - parseFloat(expenseData.amount);
        
        // FIXED: Now UpdateAccountDto includes balance property
        await updateAccount({
          id: expenseData.accountId,
          data: { balance: newBalance }
        }).unwrap();
        
        setLocalAccounts(prev => prev.map(acc => 
          acc.id === expenseData.accountId 
            ? { ...acc, balance: newBalance }
            : acc
        ));
      }

      const categoryTotal = financialData.categorySpending[expenseData.category] || 0;
      const newCategoryTotal = categoryTotal + parseFloat(expenseData.amount);
      const categoryPercentage = (newCategoryTotal / (financialData.monthlyIncome + parseFloat(expenseData.amount))) * 100;

      if (categoryPercentage > 50) {
        await createNotification({
          title: '⚠️ Overspending Alert',
          message: `You're spending ${categoryPercentage.toFixed(1)}% of your income on ${expenseData.category}`,
          type: 'overspending',
          userId: user?.id || '',
          metadata: {
            category: expenseData.category,
            percentage: categoryPercentage,
            amount: parseFloat(expenseData.amount)
          }
        }).unwrap();
        
        toast.warning(`⚠️ Overspending on ${expenseData.category}: ${categoryPercentage.toFixed(1)}% of income`);
      }

      await createNotification({
        title: '💸 Expense Added',
        message: `Expense of $${parseFloat(expenseData.amount).toFixed(2)} deducted from account`,
        type: 'overspending',
        userId: user?.id || '',
        metadata: {
          amount: parseFloat(expenseData.amount),
          accountId: expenseData.accountId,
          category: expenseData.category
        }
      }).unwrap();

      toast.success(`💸 Expense of $${parseFloat(expenseData.amount).toFixed(2)} added! Account balance updated.`);

      refetchTransactions();
      refetchAccounts();
      refetchNotifications();

      setShowExpenseModal(false);

    } catch (error: any) {
      console.error('Expense error:', error);
      toast.error(error.data?.message || 'Failed to add expense. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCreateGoal = async (goalData: any): Promise<void> => {
    setIsProcessing(true);
    try {
      // FIXED: Removed status from goal creation
      await createGoal({
        name: goalData.name.trim(),
        targetAmount: parseFloat(goalData.targetAmount),
        targetDate: goalData.targetDate,
        startDate: goalData.startDate || new Date().toISOString().split('T')[0],
        category: goalData.category,
        isUnrealistic: goalData.isUnrealistic || false,
        userId: user?.id || '',
      } as any).unwrap();

      await createNotification({
        title: goalData.isUnrealistic ? '⚠️ Goal Created' : '🎯 Goal Created',
        message: goalData.isUnrealistic ? 
          `Goal "${goalData.name}" created. You need to save $${goalData.monthlySavingsNeeded.toFixed(2)}/month.` :
          `Goal "${goalData.name}" created! Save $${goalData.monthlySavingsNeeded.toFixed(2)}/month to reach it.`,
        type: 'goal_milestone',
        userId: user?.id || '',
        metadata: {
          goalName: goalData.name,
          monthlySavingsNeeded: goalData.monthlySavingsNeeded,
          targetAmount: goalData.targetAmount,
          isUnrealistic: goalData.isUnrealistic
        }
      }).unwrap();

      toast.success(
        goalData.isUnrealistic ? 
          `⚠️ Goal "${goalData.name}" created! Save $${goalData.monthlySavingsNeeded.toFixed(2)}/month.` :
          `🎯 Goal "${goalData.name}" created! Save $${goalData.monthlySavingsNeeded.toFixed(2)}/month to reach your target.`
      );

      refetchGoals();
      refetchNotifications();

      setShowGoalModal(false);

    } catch (error: any) {
      console.error('Goal error:', error);
      toast.error(error.data?.message || 'Failed to create goal. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      toast.success('All notifications marked as read');
      refetchNotifications();
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  if (!user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>Please login to access your dashboard</h1>
        <p style={{ color: '#6B7280' }}>You need to be logged in to view your personal finance dashboard.</p>
      </div>
    );
  }

  const isLoading = transactionsLoading || accountsLoading || goalsLoading || notificationsLoading || isProcessing;

  return (
    <div style={{ padding: '24px', backgroundColor: '#F9FAFB', minHeight: '100vh' }}>
      <Toaster position="top-right" richColors expand={true} />
      
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '30px',
          fontWeight: 700,
          color: '#111827',
          marginBottom: '8px',
        }}>
          Welcome back, {user.firstName || user.email}! 👤
        </h1>
        <p style={{
          fontSize: '16px',
          color: '#6B7280',
          margin: 0,
        }}>
          {currentDate} • Personal Finance Dashboard
        </p>
      </div>

      {/* ========== ADDED GROUP INVITATIONS CARD ========== */}
      <div className="bg-white rounded-xl border shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Group Invitations</h3>
              <p className="text-sm text-gray-600">
                {receivedInvitations.filter(inv => inv.status === 'approved').length} pending • {receivedInvitations.length} total
              </p>
            </div>
          </div>
          <button
            onClick={() => refetchInvitations()}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <RefreshCw className="h-5 w-5 text-gray-600" />
          </button>
        </div>
        
        <ReceivedInvitations
          invitations={receivedInvitations}
          refetch={refetchInvitations}
        />
      </div>
      {/* ========== END ADDED GROUP INVITATIONS CARD ========== */}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#3B82F6',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              💰
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Total Balance</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                ${financialData.totalBalance.toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            Across {localAccounts.length} account{localAccounts.length !== 1 ? 's' : ''}
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#10B981',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              📈
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Monthly Income</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                ${financialData.monthlyIncome.toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            This month's earnings
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: '#EF4444',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              📉
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Monthly Expenses</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827' }}>
                ${financialData.monthlyExpenses.toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            This month's spending
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: financialData.remainingBalance >= 0 ? '#10B981' : '#EF4444',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '20px'
            }}>
              {financialData.remainingBalance >= 0 ? '✅' : '⚠️'}
            </div>
            <div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>Remaining Balance</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: financialData.remainingBalance >= 0 ? '#10B981' : '#EF4444' }}>
                ${financialData.remainingBalance.toFixed(2)}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#6B7280' }}>
            {financialData.remainingBalance >= 0 ? 'Positive cash flow' : 'Negative cash flow'}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#111827',
          marginBottom: '20px',
        }}>
          Quick Actions
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
        }}>
          <button
            onClick={() => setShowIncomeModal(true)}
            disabled={isProcessing || localAccounts.length === 0}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              background: 'linear-gradient(135deg, #10B981, #059669)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: localAccounts.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: localAccounts.length === 0 || isProcessing ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>💰</span>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Add Income</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {localAccounts.length === 0 ? 'Create account first' : 'Record your earnings'}
            </div>
          </button>

          <button
            onClick={() => setShowExpenseModal(true)}
            disabled={isProcessing || localAccounts.length === 0}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              background: 'linear-gradient(135deg, #EF4444, #DC2626)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: localAccounts.length === 0 || isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: localAccounts.length === 0 || isProcessing ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>💸</span>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Add Expense</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {localAccounts.length === 0 ? 'Create account first' : 'Track your spending'}
            </div>
          </button>

          <button
            onClick={() => setShowGoalModal(true)}
            disabled={isProcessing}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              background: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>🎯</span>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>Set Goal</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>Plan your savings</div>
          </button>

          <button
            onClick={() => setShowReportModal(true)}
            disabled={isProcessing || localTransactions.length === 0}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px 16px',
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: isProcessing || localTransactions.length === 0 ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
              opacity: isProcessing || localTransactions.length === 0 ? 0.7 : 1,
            }}
          >
            <span style={{ fontSize: '32px', marginBottom: '12px' }}>📊</span>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>View Report</div>
            <div style={{ fontSize: '12px', opacity: 0.9 }}>
              {localTransactions.length === 0 ? 'Add transactions first' : 'Analyze your finances'}
            </div>
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
            Recent Transactions ({localTransactions.length})
          </h2>
          <button
            onClick={() => refetchTransactions()}
            disabled={isProcessing}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              opacity: isProcessing ? 0.7 : 1,
            }}
          >
            {isProcessing ? 'Loading...' : 'Refresh'}
          </button>
        </div>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {localTransactions.slice(0, 10).map((transaction: Transaction) => (
              <div key={transaction.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '16px 20px',
                borderBottom: '1px solid #F3F4F6',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: transaction.type === 'income' ? '#D1FAE5' : '#FEE2E2',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: transaction.type === 'income' ? '#10B981' : '#EF4444',
                    fontSize: '18px'
                  }}>
                    {transaction.type === 'income' ? '💰' : '💸'}
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
                      {transaction.description}
                    </div>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                      {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: 600,
                    color: transaction.type === 'income' ? '#10B981' : '#EF4444'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
                    {localAccounts.find(acc => acc.id === transaction.accountId)?.name || 'Unknown Account'}
                  </div>
                </div>
              </div>
            ))}
            {localTransactions.length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#6B7280' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                  No transactions yet
                </div>
                <div style={{ fontSize: '14px', color: '#6B7280' }}>
                  Add income or expenses to get started!
                </div>
                <button
                  onClick={() => setShowIncomeModal(true)}
                  style={{
                    marginTop: '16px',
                    padding: '10px 20px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Add Your First Income
                </button>
              </div>
            )}
          </div>
          {localTransactions.length > 10 && (
            <div style={{
              padding: '12px 20px',
              textAlign: 'center',
              backgroundColor: '#F9FAFB',
              borderTop: '1px solid #E5E7EB',
            }}>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                Showing 10 of {localTransactions.length} transactions
              </div>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', marginBottom: '20px' }}>
          🎯 Active Goals ({goalsData?.length || 0})
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '16px',
        }}>
          {(goalsData || []).slice(0, 3).map((goal: Goal) => {
            const targetDate = new Date(goal.targetDate);
            const today = new Date();
            const monthsLeft = Math.max(0, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)));
            const monthlySavingsNeeded = goal.targetAmount / Math.max(1, monthsLeft);
            
            return (
              <div key={goal.id} style={{
                backgroundColor: 'white',
                padding: '20px',
                borderRadius: '12px',
                border: `1px solid ${goal.isUnrealistic ? '#FEF2F2' : '#E5E7EB'}`,
                borderLeft: `4px solid ${goal.isUnrealistic ? '#EF4444' : '#8B5CF6'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
                    {goal.name}
                  </h3>
                  {goal.isUnrealistic && (
                    <span style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: '#EF4444',
                      backgroundColor: '#FEE2E2',
                      padding: '4px 8px',
                      borderRadius: '4px',
                    }}>
                      ⚠️ Unrealistic
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Target Amount</div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: '#111827' }}>
                    ${goal.targetAmount.toFixed(2)}
                  </div>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <div style={{ fontSize: '12px', color: '#6B7280' }}>Monthly Savings Needed</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: goal.isUnrealistic ? '#EF4444' : '#111827' }}>
                    ${monthlySavingsNeeded.toFixed(2)}/month
                  </div>
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280' }}>
                  Target: {new Date(goal.targetDate).toLocaleDateString()} • {monthsLeft} months left
                </div>
              </div>
            );
          })}
          {(goalsData || []).length === 0 && (
            <div style={{
              backgroundColor: 'white',
              padding: '40px',
              borderRadius: '12px',
              border: '1px solid #E5E7EB',
              textAlign: 'center',
              gridColumn: '1 / -1'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎯</div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: '#111827', marginBottom: '8px' }}>
                No active goals
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '16px' }}>
                Set a goal to track your savings progress
              </div>
              <button
                onClick={() => setShowGoalModal(true)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#8B5CF6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827' }}>
            🔔 Recent Notifications ({notificationsData?.length || 0})
          </h2>
          <button
            onClick={handleMarkAllAsRead}
            disabled={isProcessing || !notificationsData || notificationsData.length === 0}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3B82F6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              opacity: isProcessing || !notificationsData || notificationsData.length === 0 ? 0.7 : 1,
            }}
          >
            Mark All as Read
          </button>
        </div>
        
        {(notificationsData || []).slice(0, 5).map((notification: any) => (
          <div key={notification.id} style={{ 
            backgroundColor: notification.status === 'unread' ? '#F0F9FF' : '#FFFFFF',
            padding: '16px', 
            borderRadius: '8px',
            borderLeft: `4px solid ${notification.type === 'overspending' ? '#EF4444' : 
                         notification.type === 'goal_milestone' ? '#8B5CF6' : '#3B82F6'}`,
            marginBottom: '10px',
            border: '1px solid #E5E7EB'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
              {notification.title}
            </div>
            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
              {notification.message}
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '8px'
            }}>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {new Date(notification.createdAt).toLocaleDateString()}
              </div>
              {notification.status === 'unread' && (
                <span style={{
                  fontSize: '10px',
                  fontWeight: 600,
                  color: '#3B82F6',
                  backgroundColor: '#DBEAFE',
                  padding: '2px 6px',
                  borderRadius: '4px',
                }}>
                  NEW
                </span>
              )}
            </div>
          </div>
        ))}

        {(notificationsData || []).length === 0 && (
          <div style={{ 
            backgroundColor: '#f0f9ff', 
            padding: '16px', 
            borderRadius: '8px',
            borderLeft: '4px solid #3B82F6',
            marginBottom: '10px'
          }}>
            <div style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
              Welcome to Personal Finance Dashboard
            </div>
            <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
              Start by adding your income, then track expenses and set savings goals.
            </div>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
              Just now
            </div>
          </div>
        )}

        {financialData.overspendingAlerts.length > 0 && (
          <div style={{ marginTop: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
              ⚠️ Spending Alerts
            </h3>
            {financialData.overspendingAlerts.map((alert, index) => (
              <div key={index} style={{ 
                backgroundColor: '#FEF2F2', 
                padding: '16px', 
                borderRadius: '8px',
                borderLeft: '4px solid #EF4444',
                marginBottom: '10px'
              }}>
                <div style={{ fontSize: '16px', fontWeight: 500, color: '#111827' }}>
                  ⚠️ Overspending Alert
                </div>
                <div style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
                  You're spending {alert.percentage}% of your income on {alert.category} (${alert.amount.toFixed(2)})
                </div>
                <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '8px' }}>
                  This month
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <IncomeModal
        isOpen={showIncomeModal}
        onClose={() => setShowIncomeModal(false)}
        accounts={localAccounts}
        userId={user.id}
        onCreateIncome={handleAddIncome}
      />
      
      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        accounts={localAccounts}
        userId={user.id}
        onCreateExpense={handleAddExpense}
      />
      
      <GoalModal
        isOpen={showGoalModal}
        onClose={() => setShowGoalModal(false)}
        userId={user.id}
        monthlyIncome={financialData.monthlyIncome}
        onCreateGoal={handleCreateGoal}
      />
      
      <ReportModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        financialData={financialData}
        categorySpending={financialData.categorySpending}
      />

      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid #E5E7EB',
              borderTopColor: '#3B82F6',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 16px'
            }} />
            <div style={{ fontSize: '16px', color: '#111827' }}>Loading your dashboard...</div>
          </div>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default PersonalDashboard;
