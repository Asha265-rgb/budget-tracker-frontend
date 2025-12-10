import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../app/store';
// Remove unused import: addTransaction
import { fetchAccounts } from '../../features/accounts/accountsSlice';
import { 
  FaTimes, 
  FaMoneyBillWave, 
  FaPlus,
  FaTrash,
  FaUtensils,
  FaHome,
  FaHeartbeat,
  FaGraduationCap,
  FaTag,
  FaFilm,
  FaCoffee,
  FaPlane,
  FaGift,
  FaMobileAlt,
  FaBus,
  FaTshirt,
  FaWifi,
  FaWater,
  FaGasPump
} from 'react-icons/fa';

interface AddExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSubmit: (expenseData: any) => Promise<void> | void;
  isLoading: boolean;
  onExpensesAdded?: (totalAmount: number) => void; // Optional for backward compatibility
}

interface ExpenseItem {
  id: string;
  description: string;
  amount: string;
  category: string;
  accountId: string;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly';
  notes: string;
}

// Define Account interface locally
interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  userId: string;
  isDeleted?: boolean;
  status?: string;
}

const AddExpensesModal: React.FC<AddExpensesModalProps> = ({ 
  isOpen, 
  onClose, 
  userId, 
  onSubmit,
  isLoading,
  onExpensesAdded 
}) => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Get accounts from Redux store
  const accounts = useSelector((state: any) => state.accounts?.accounts || []) as Account[];
  const isLoadingAccounts = useSelector((state: any) => state.accounts?.isLoading || false);
  
  // Multiple expenses state
  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: '1',
      description: '',
      amount: '',
      category: 'Food & Dining',
      accountId: '',
      frequency: 'one-time',
      notes: '',
    }
  ]);

  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [totalAmount, setTotalAmount] = useState(0);

  // Fetch accounts when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      dispatch(fetchAccounts(userId));
    }
  }, [dispatch, isOpen, userId]);

  // Calculate total amount whenever expenses change
  useEffect(() => {
    const total = expenses.reduce((sum, expense) => {
      const amount = parseFloat(expense.amount) || 0;
      return sum + amount;
    }, 0);
    setTotalAmount(total);
  }, [expenses]);

  // Expense categories with icons
  const expenseCategories = [
    { value: 'Food & Dining', label: 'Food & Dining', icon: <FaUtensils />, color: '#FF4D94' },
    { value: 'Rent/Mortgage', label: 'Rent/Mortgage', icon: <FaHome />, color: '#8B5CF6' },
    { value: 'Transportation', label: 'Transportation', icon: <FaBus />, color: '#FFD700' },
    { value: 'Bills & Utilities', label: 'Bills & Utilities', icon: <FaWifi />, color: '#EF4444' },
    { value: 'Healthcare', label: 'Healthcare', icon: <FaHeartbeat />, color: '#3B82F6' },
    { value: 'Shopping', label: 'Shopping', icon: <FaTshirt />, color: '#8B5CF6' },
    { value: 'Entertainment', label: 'Entertainment', icon: <FaFilm />, color: '#10B981' },
    { value: 'Education', label: 'Education', icon: <FaGraduationCap />, color: '#F59E0B' },
    { value: 'Coffee', label: 'Coffee', icon: <FaCoffee />, color: '#8B4513' },
    { value: 'Travel', label: 'Travel', icon: <FaPlane />, color: '#4169E1' },
    { value: 'Gifts & Donations', label: 'Gifts', icon: <FaGift />, color: '#FF69B4' },
    { value: 'Technology', label: 'Technology', icon: <FaMobileAlt />, color: '#00CED1' },
    { value: 'Fuel', label: 'Fuel', icon: <FaGasPump />, color: '#FFA500' },
    { value: 'Water', label: 'Water', icon: <FaWater />, color: '#3B82F6' },
    { value: 'Other', label: 'Other', icon: <FaTag />, color: '#ADB5BD' },
  ];

  // Frequency options
  const frequencyOptions = [
    { value: 'one-time', label: 'One Time', icon: '📅' },
    { value: 'daily', label: 'Daily', icon: '🌅' },
    { value: 'weekly', label: 'Weekly', icon: '📅' },
    { value: 'monthly', label: 'Monthly', icon: '📆' },
  ];

  // Add a new expense row
  const addExpense = () => {
    const newExpense: ExpenseItem = {
      id: Date.now().toString(),
      description: '',
      amount: '',
      category: 'Food & Dining',
      accountId: '',
      frequency: 'one-time',
      notes: '',
    };
    setExpenses([...expenses, newExpense]);
  };

  // Remove an expense row
  const removeExpense = (id: string) => {
    if (expenses.length > 1) {
      setExpenses(expenses.filter(expense => expense.id !== id));
    }
  };

  // Update a specific expense field
  const updateExpense = (id: string, field: keyof ExpenseItem, value: string) => {
    setExpenses(expenses.map(expense => 
      expense.id === id ? { ...expense, [field]: value } : expense
    ));
    
    // Clear errors for this field
    if (formErrors[id]) {
      setFormErrors({
        ...formErrors,
        [id]: formErrors[id].filter(error => !error.includes(field))
      });
    }
  };

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    expenses.forEach((expense) => {
      const expenseErrors: string[] = [];

      if (!expense.description.trim()) {
        expenseErrors.push('description: Description is required');
      }

      const amount = parseFloat(expense.amount);
      if (!expense.amount || isNaN(amount) || amount <= 0) {
        expenseErrors.push('amount: Please enter a valid amount greater than 0');
      }

      if (!expense.accountId) {
        expenseErrors.push('account: Please select an account');
      }

      // Check if account has sufficient balance
      if (expense.accountId && amount > 0) {
        const account = accounts.find(acc => acc.id === expense.accountId);
        if (account && amount > account.balance) {
          expenseErrors.push(`amount: Insufficient balance. Available: $${account.balance.toFixed(2)}`);
        }
      }

      if (expenseErrors.length > 0) {
        errors[expense.id] = expenseErrors;
        isValid = false;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      let totalExpenseAmount = 0;
      const expensesData = expenses.map((expense) => {
        const amount = parseFloat(expense.amount);
        totalExpenseAmount += amount;

        return {
          description: expense.description.trim(),
          amount: amount,
          type: 'expense' as const,
          category: expense.category,
          date: new Date().toISOString(),
          accountId: expense.accountId,
          userId: userId,
          notes: expense.notes.trim() || undefined,
          frequency: expense.frequency,
          isRecurring: expense.frequency !== 'one-time',
          isSplit: false,
        };
      });

      // Call the onSubmit prop with the expenses data
      await onSubmit(expensesData);
      
      // Also call onExpensesAdded if provided (for backward compatibility)
      if (onExpensesAdded) {
        onExpensesAdded(totalExpenseAmount);
      }

      // Reset form
      setExpenses([{
        id: '1',
        description: '',
        amount: '',
        category: 'Food & Dining',
        accountId: '',
        frequency: 'one-time',
        notes: '',
      }]);
      setFormErrors({});
      
      // Don't close modal here - let the parent component handle it
      
    } catch (error: any) {
      console.error('Failed to add expenses:', error);
      alert(error.message || 'Failed to add expenses. Please try again.');
    }
  };

  // Filter out deleted/inactive accounts
  const activeAccounts = accounts.filter(account => 
    !account.isDeleted && account.status === 'active'
  );

  if (!isOpen) return null;

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
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid #E5E7EB',
          background: 'linear-gradient(90deg, #EF4444, #FF4D94)',
          color: 'white'
        }}>
          <div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: 600,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <FaMoneyBillWave />
              Add Expenses
            </h2>
            <p style={{ margin: '4px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              Add multiple expenses at once (Food, Rent, Transport, etc.)
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontSize: '20px',
              padding: '4px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: isLoading ? 0.5 : 1,
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Total Amount Summary */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#FEF2F2',
          borderBottom: '1px solid #FEE2E2',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '14px', color: '#991B1B', fontWeight: 500 }}>
                Total Expenses
              </div>
              <div style={{ fontSize: '24px', color: '#DC2626', fontWeight: 700 }}>
                ${totalAmount.toFixed(2)}
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#991B1B' }}>
              {expenses.length} expense{expenses.length !== 1 ? 's' : ''}
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Expense List */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '16px' 
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#374151', margin: 0 }}>
                Expense Items
              </h3>
              <button
                type="button"
                onClick={addExpense}
                disabled={isLoading}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  opacity: isLoading ? 0.5 : 1,
                  transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#2563EB')}
                onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#3B82F6')}
              >
                <FaPlus /> Add Another Expense
              </button>
            </div>

            {expenses.map((expense, index) => (
              <div 
                key={expense.id}
                style={{
                  padding: '20px',
                  backgroundColor: index % 2 === 0 ? '#F9FAFB' : 'white',
                  borderRadius: '12px',
                  marginBottom: '16px',
                  border: '1px solid #E5E7EB',
                  position: 'relative',
                  opacity: isLoading ? 0.6 : 1,
                }}
              >
                {/* Expense Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      backgroundColor: '#EF4444',
                      color: 'white',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}>
                      {index + 1}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                      Expense #{index + 1}
                    </span>
                  </div>
                  
                  {expenses.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExpense(expense.id)}
                      disabled={isLoading}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        cursor: isLoading ? 'not-allowed' : 'pointer',
                        padding: '8px',
                        borderRadius: '4px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: '12px',
                        opacity: isLoading ? 0.5 : 1,
                        transition: 'background-color 0.2s',
                      }}
                      onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#FEE2E2')}
                      onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = 'transparent')}
                    >
                      <FaTrash /> Remove
                    </button>
                  )}
                </div>

                {/* Expense Form Row */}
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(2, 1fr)', 
                  gap: '16px',
                  marginBottom: '16px'
                }}>
                  {/* Description */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '4px',
                    }}>
                      Description *
                    </label>
                    <input
                      type="text"
                      value={expense.description}
                      onChange={(e) => updateExpense(expense.id, 'description', e.target.value)}
                      placeholder="What is this expense for?"
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: `1px solid ${formErrors[expense.id]?.some(e => e.includes('description')) ? '#EF4444' : '#D1D5DB'}`,
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#1F2937',
                        outline: 'none',
                        backgroundColor: isLoading ? '#F9FAFB' : 'white',
                        cursor: isLoading ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '4px',
                    }}>
                      Amount *
                    </label>
                    <div style={{ position: 'relative' }}>
                      <span style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#6B7280',
                        fontSize: '14px',
                      }}>
                        $
                      </span>
                      <input
                        type="number"
                        value={expense.amount}
                        onChange={(e) => updateExpense(expense.id, 'amount', e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '10px 12px 10px 32px',
                          border: `1px solid ${formErrors[expense.id]?.some(e => e.includes('amount')) ? '#EF4444' : '#D1D5DB'}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#1F2937',
                          outline: 'none',
                          backgroundColor: isLoading ? '#F9FAFB' : 'white',
                          cursor: isLoading ? 'not-allowed' : 'text',
                        }}
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '4px',
                    }}>
                      Category *
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {expenseCategories.slice(0, 5).map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => updateExpense(expense.id, 'category', category.value)}
                          disabled={isLoading}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '6px',
                            border: `1px solid ${expense.category === category.value ? category.color : '#E5E7EB'}`,
                            backgroundColor: expense.category === category.value ? `${category.color}20` : 'white',
                            color: expense.category === category.value ? category.color : '#6B7280',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            opacity: isLoading ? 0.5 : 1,
                          }}
                        >
                          <span style={{ fontSize: '12px' }}>{category.icon}</span>
                          {category.label.split(' ')[0]}
                        </button>
                      ))}
                      <select
                        value={expense.category}
                        onChange={(e) => updateExpense(expense.id, 'category', e.target.value)}
                        disabled={isLoading}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '6px',
                          border: '1px solid #D1D5DB',
                          backgroundColor: isLoading ? '#F9FAFB' : 'white',
                          color: '#1F2937',
                          fontSize: '11px',
                          fontWeight: 500,
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          flex: 1,
                          opacity: isLoading ? 0.5 : 1,
                        }}
                      >
                        {expenseCategories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '4px',
                    }}>
                      Frequency
                    </label>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {frequencyOptions.map((freq) => (
                        <button
                          key={freq.value}
                          type="button"
                          onClick={() => updateExpense(expense.id, 'frequency', freq.value)}
                          disabled={isLoading}
                          style={{
                            flex: 1,
                            padding: '8px 6px',
                            borderRadius: '6px',
                            border: `1px solid ${expense.frequency === freq.value ? '#EF4444' : '#E5E7EB'}`,
                            backgroundColor: expense.frequency === freq.value ? '#FEE2E2' : 'white',
                            color: expense.frequency === freq.value ? '#EF4444' : '#6B7280',
                            fontSize: '11px',
                            fontWeight: 500,
                            cursor: isLoading ? 'not-allowed' : 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '2px',
                            opacity: isLoading ? 0.5 : 1,
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{freq.icon}</span>
                          {freq.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Account */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '4px',
                    }}>
                      Account *
                    </label>
                    {isLoadingAccounts ? (
                      <div style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#6B7280',
                        border: '1px dashed #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}>
                        Loading accounts...
                      </div>
                    ) : activeAccounts.length === 0 ? (
                      <div style={{
                        padding: '10px',
                        textAlign: 'center',
                        color: '#EF4444',
                        border: '1px dashed #EF4444',
                        borderRadius: '6px',
                        backgroundColor: '#FEE2E2',
                        fontSize: '12px',
                      }}>
                        No active accounts found
                      </div>
                    ) : (
                      <select
                        value={expense.accountId}
                        onChange={(e) => updateExpense(expense.id, 'accountId', e.target.value)}
                        disabled={isLoading}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          border: `1px solid ${formErrors[expense.id]?.some(e => e.includes('account')) ? '#EF4444' : '#D1D5DB'}`,
                          borderRadius: '6px',
                          fontSize: '14px',
                          color: '#1F2937',
                          backgroundColor: isLoading ? '#F9FAFB' : 'white',
                          outline: 'none',
                          cursor: isLoading ? 'not-allowed' : 'pointer',
                          opacity: isLoading ? 0.5 : 1,
                        }}
                      >
                        <option value="">Select account</option>
                        {activeAccounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} - ${account.balance.toFixed(2)}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#374151',
                      marginBottom: '4px',
                    }}>
                      Notes (Optional)
                    </label>
                    <input
                      type="text"
                      value={expense.notes}
                      onChange={(e) => updateExpense(expense.id, 'notes', e.target.value)}
                      placeholder="Add notes..."
                      disabled={isLoading}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '14px',
                        color: '#1F2937',
                        outline: 'none',
                        backgroundColor: isLoading ? '#F9FAFB' : 'white',
                        cursor: isLoading ? 'not-allowed' : 'text',
                      }}
                    />
                  </div>
                </div>

                {/* Error Messages */}
                {formErrors[expense.id] && formErrors[expense.id].length > 0 && (
                  <div style={{
                    padding: '8px',
                    backgroundColor: '#FEE2E2',
                    borderRadius: '6px',
                    marginTop: '8px',
                  }}>
                    {formErrors[expense.id].map((error, errorIndex) => (
                      <div key={errorIndex} style={{ 
                        color: '#DC2626', 
                        fontSize: '11px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        • {error.split(': ')[1]}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Info Box */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#FEF2F2',
            borderRadius: '8px',
            borderLeft: '4px solid #EF4444'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FaMoneyBillWave style={{ color: '#EF4444' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#991B1B', margin: 0 }}>
                Expense Information
              </h3>
            </div>
            <div style={{ fontSize: '12px', color: '#991B1B' }}>
              • Expenses will decrease your account balance immediately<br/>
              • Monthly expenses will repeat automatically<br/>
              • Balance updates in real-time after saving<br/>
              • You'll receive notifications for large expenses
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: 'white',
                color: '#374151',
                border: '2px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: '#EF4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Adding {expenses.length} Expense{expenses.length !== 1 ? 's' : ''}...
                </div>
              ) : `Add ${expenses.length} Expense${expenses.length !== 1 ? 's' : ''} ($${totalAmount.toFixed(2)})`}
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AddExpensesModal;