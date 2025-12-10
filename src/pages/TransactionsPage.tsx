import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../app/store';
import { 
  fetchTransactions, 
  setFilters,
  clearFilters,
  deleteTransaction,
  type Transaction
} from '../features/transactions/transactionsSlice';
import { 
  FaPlus, 
  FaSearch, 
  FaFilter, 
  FaMoneyBillWave, 
  FaReceipt, 
  FaEdit, 
  FaTrash, 
  FaArrowUp, 
  FaArrowDown 
} from 'react-icons/fa';
import { format } from 'date-fns';
import AddTransactionModal from '../features/transactions/AddTransactionModal'; // UPDATED IMPORT PATH

// Your baby pink and gold theme
const theme = {
  primary: {
    50: '#FFF0F6',
    100: '#FFD6E7', 
    200: '#FFB3D1',
    300: '#FF8FBA',
    400: '#FF66A3',
    500: '#FF4D94',
    600: '#E63D84',
    700: '#CC2D74',
    800: '#B31D64',
    900: '#990D54'
  },
  gold: {
    50: '#FFFDF0',
    100: '#FFF9D6',
    200: '#FFF4B3',
    300: '#FFEF8F',
    400: '#FFE966',
    500: '#FFD700',
    600: '#E6C200',
    700: '#CCAD00',
    800: '#B39700',
    900: '#998200'
  },
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529'
  },
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',
  background: '#FFFFFF'
};

const initialFilters = {
  startDate: null,
  endDate: null,
  type: 'all' as 'all' | 'income' | 'expense',
  category: null as string | null,
  accountId: null as string | null,
  searchQuery: ''
};

const TransactionsPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const transactions = useSelector((state: any) => state.transactions?.filteredTransactions || []);
  const isLoading = useSelector((state: any) => state.transactions?.isLoading || false);
  const error = useSelector((state: any) => state.transactions?.error || null);
  const filters = useSelector((state: any) => state.transactions?.filters || initialFilters);
  
  // Get user from auth state
  const user = useSelector((state: any) => state.auth?.user);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchTransactions(user.id));
    }
  }, [dispatch, user]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      dispatch(setFilters({ searchQuery: searchTerm }));
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, [searchTerm, dispatch]);

  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    dispatch(setFilters({ [key]: value }));
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      await dispatch(deleteTransaction(id));
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const getCategoryColor = (category: string) => {
    const colors = [
      theme.primary[500],
      theme.gold[500],
      '#8B5CF6',
      '#10B981',
      '#EF4444',
      '#3B82F6',
      '#F59E0B',
      '#06B6D4',
      theme.gray[500]
    ];
    
    const categories = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Salary', 'Other'];
    const index = categories.indexOf(category);
    return colors[index] || theme.gray[500];
  };

  const totalIncome = transactions
    .filter((t: Transaction) => t.type === 'income')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t: Transaction) => t.type === 'expense')
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  if (isLoading && transactions.length === 0) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: theme.background
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${theme.primary[100]}`,
            borderTopColor: theme.primary[500],
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: theme.gray[600], fontSize: '16px' }}>Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: theme.background
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: `${theme.error}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <FaMoneyBillWave style={{ color: theme.error, fontSize: '32px' }} />
        </div>
        <h3 style={{ color: theme.gray[900], marginBottom: '10px' }}>Error Loading Transactions</h3>
        <p style={{ color: theme.gray[600], marginBottom: '20px' }}>{error}</p>
        {user?.id && (
          <button
            onClick={() => dispatch(fetchTransactions(user.id))}
            style={{
              backgroundColor: theme.primary[500],
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Add Transaction Modal */}
      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userId={user?.id || ''}
      />

      <div style={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        padding: '24px'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: theme.gray[900],
              marginBottom: '4px'
            }}>
              Transactions
            </h1>
            <p style={{
              fontSize: '14px',
              color: theme.gray[600]
            }}>
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} found
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                backgroundColor: showFilters ? theme.gold[500] : 'white',
                color: showFilters ? 'white' : theme.gray[700],
                border: `1px solid ${showFilters ? theme.gold[500] : theme.gray[300]}`,
                padding: '10px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'all 0.2s'
              }}
            >
              <FaFilter />
              Filters
            </button>
            
            <button
              onClick={() => setIsModalOpen(true)}
              style={{
                backgroundColor: theme.primary[500],
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary[600]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary[500]}
            >
              <FaPlus />
              Add Transaction
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Total Income Card */}
          <div style={{
            backgroundColor: theme.background,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            borderLeft: `4px solid ${theme.success}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Total Income</h3>
              <FaArrowUp style={{ color: theme.success, fontSize: '20px' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>{formatCurrency(totalIncome)}</p>
          </div>

          {/* Total Expenses Card */}
          <div style={{
            backgroundColor: theme.background,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            borderLeft: `4px solid ${theme.error}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Total Expenses</h3>
              <FaArrowDown style={{ color: theme.error, fontSize: '20px' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>{formatCurrency(totalExpense)}</p>
          </div>

          {/* Net Balance Card */}
          <div style={{
            backgroundColor: theme.background,
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            borderLeft: `4px solid ${netBalance >= 0 ? theme.success : theme.error}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Net Balance</h3>
              {netBalance >= 0 ? (
                <FaArrowUp style={{ color: theme.success, fontSize: '20px' }} />
              ) : (
                <FaArrowDown style={{ color: theme.error, fontSize: '20px' }} />
              )}
            </div>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              color: netBalance >= 0 ? theme.success : theme.error 
            }}>
              {netBalance >= 0 ? '+' : '-'}{formatCurrency(Math.abs(netBalance))}
            </p>
          </div>
        </div>

        {/* Search Bar */}
        <div style={{
          backgroundColor: theme.gray[50],
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ flex: 1, minWidth: '300px', position: 'relative' }}>
            <FaSearch style={{
              position: 'absolute',
              left: '14px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: theme.gray[500],
              fontSize: '16px'
            }} />
            <input
              type="text"
              placeholder="Search transactions by description, category, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 40px',
                border: `1px solid ${theme.gray[300]}`,
                borderRadius: '8px',
                fontSize: '14px',
                backgroundColor: theme.background,
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = theme.primary[500]}
              onBlur={(e) => e.target.style.borderColor = theme.gray[300]}
            />
          </div>
          
          <button
            onClick={() => {
              dispatch(clearFilters());
              setSearchTerm('');
            }}
            style={{
              backgroundColor: 'transparent',
              color: theme.gray[600],
              border: `1px solid ${theme.gray[300]}`,
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.gray[200];
              e.currentTarget.style.borderColor = theme.gray[400];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.borderColor = theme.gray[300];
            }}
          >
            Clear Filters
          </button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div style={{
            backgroundColor: theme.gray[50],
            padding: '24px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            animation: 'fadeIn 0.3s ease-out'
          }}>
            {/* Transaction Type Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.gray[700], fontWeight: 500 }}>
                Transaction Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.gray[300]}`,
                  borderRadius: '8px',
                  backgroundColor: theme.background,
                  color: theme.gray[900],
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="all">All Types</option>
                <option value="income">Income</option>
                <option value="expense">Expense</option>
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.gray[700], fontWeight: 500 }}>
                Category
              </label>
              <select
                value={filters.category || ''}
                onChange={(e) => handleFilterChange('category', e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.gray[300]}`,
                  borderRadius: '8px',
                  backgroundColor: theme.background,
                  color: theme.gray[900],
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                <option value="">All Categories</option>
                <option value="Food">Food</option>
                <option value="Transportation">Transportation</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
                <option value="Bills">Bills</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Education">Education</option>
                <option value="Salary">Salary</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Start Date Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.gray[700], fontWeight: 500 }}>
                Start Date
              </label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.gray[300]}`,
                  borderRadius: '8px',
                  backgroundColor: theme.background,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>

            {/* End Date Filter */}
            <div>
              <label style={{ display: 'block', marginBottom: '8px', color: theme.gray[700], fontWeight: 500 }}>
                End Date
              </label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || null)}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: `1px solid ${theme.gray[300]}`,
                  borderRadius: '8px',
                  backgroundColor: theme.background,
                  outline: 'none',
                  cursor: 'pointer'
                }}
              />
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div style={{
          backgroundColor: theme.background,
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.5fr',
            padding: '16px 24px',
            backgroundColor: theme.gray[50],
            borderBottom: `1px solid ${theme.gray[200]}`,
            fontWeight: 600,
            color: theme.gray[700],
            fontSize: '14px'
          }}>
            <div>Description</div>
            <div>Amount</div>
            <div>Category</div>
            <div>Date</div>
            <div>Type</div>
            <div>Actions</div>
          </div>

          {/* Transactions List */}
          {transactions.length === 0 ? (
            <div style={{ 
              padding: '48px 24px', 
              textAlign: 'center',
              color: theme.gray[500]
            }}>
              <FaReceipt style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
              <h3 style={{ marginBottom: '8px', color: theme.gray[700] }}>No transactions found</h3>
              <p>Try changing your filters or add a new transaction</p>
              <button
                onClick={() => setIsModalOpen(true)}
                style={{
                  marginTop: '16px',
                  backgroundColor: theme.primary[500],
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Add Your First Transaction
              </button>
            </div>
          ) : (
            transactions.map((transaction: Transaction) => (
              <div
                key={transaction.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 0.5fr',
                  padding: '16px 24px',
                  borderBottom: `1px solid ${theme.gray[100]}`,
                  alignItems: 'center',
                  transition: 'background-color 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.gray[50];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = theme.background;
                }}
              >
                {/* Description */}
                <div>
                  <div style={{ fontWeight: 500, color: theme.gray[900], marginBottom: '4px' }}>
                    {transaction.description}
                  </div>
                  {transaction.notes && (
                    <div style={{ fontSize: '12px', color: theme.gray[500] }}>
                      {transaction.notes}
                    </div>
                  )}
                </div>

                {/* Amount */}
                <div style={{
                  fontWeight: 600,
                  color: transaction.type === 'income' ? theme.success : theme.error
                }}>
                  {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>

                {/* Category */}
                <div>
                  <span style={{
                    backgroundColor: `${getCategoryColor(transaction.category)}20`,
                    color: getCategoryColor(transaction.category),
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {transaction.category}
                  </span>
                </div>

                {/* Date */}
                <div style={{ color: theme.gray[700] }}>
                  {formatDate(transaction.date)}
                </div>

                {/* Type */}
                <div>
                  <span style={{
                    backgroundColor: transaction.type === 'income' ? `${theme.success}20` : `${theme.error}20`,
                    color: transaction.type === 'income' ? theme.success : theme.error,
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500
                  }}>
                    {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                  </span>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => {/* TODO: Implement edit transaction */}}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.gray[500],
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.primary[500]}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.gray[500]}
                    title="Edit"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: theme.gray[500],
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'color 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.color = theme.error}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.gray[500]}
                    title="Delete"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Stats */}
        {transactions.length > 0 && (
          <div style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: theme.gray[50],
            borderRadius: '8px',
            fontSize: '14px',
            color: theme.gray[600],
            textAlign: 'center'
          }}>
            Showing {transactions.length} of {transactions.length} transactions • 
            Last updated: {format(new Date(), 'MMM dd, yyyy HH:mm')}
          </div>
        )}

        {/* Add CSS for animations */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(-10px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}
        </style>
      </div>
    </>
  );
};

export default TransactionsPage;
