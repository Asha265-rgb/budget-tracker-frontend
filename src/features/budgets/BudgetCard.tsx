import React from 'react';
import { FaCalendarAlt, FaEdit, FaTrash, FaExclamationTriangle } from 'react-icons/fa';
import type { Budget } from './budgetsApi';
import { useDeleteBudgetMutation } from './budgetsApi';

interface BudgetCardProps {
  budget: Budget;
}

const BudgetCard: React.FC<BudgetCardProps> = ({ budget }) => {
  const [deleteBudget] = useDeleteBudgetMutation();
  
  const theme = {
    primary: '#FF4D94',
    gold: '#FFD700',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    gray: {
      100: '#F1F3F5',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#6C757D',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getRemaining = () => budget.amount - budget.spent;
  const getProgress = () => (budget.amount > 0 ? (budget.spent / budget.amount) * 100 : 0);
  const isOverspent = budget.spent > budget.amount;
  const progress = getProgress();
  
  const getStatusColor = () => {
    if (budget.status === 'completed') return theme.success;
    if (budget.status === 'cancelled') return theme.gray[500];
    if (isOverspent) return theme.error;
    if (progress > 80) return theme.warning;
    return theme.success;
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete "${budget.name}"?`)) {
      try {
        await deleteBudget(budget.id).unwrap();
      } catch (error) {
        console.error('Failed to delete budget:', error);
        alert('Failed to delete budget. Please try again.');
      }
    }
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
      borderLeft: `4px solid ${budget.color || getStatusColor()}`,
      transition: 'transform 0.2s, box-shadow 0.2s',
      position: 'relative',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
    }}
    >
      {/* Status Badge */}
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        padding: '4px 8px',
        backgroundColor: `${getStatusColor()}20`,
        color: getStatusColor(),
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}>
        {budget.status}
      </div>

      {/* Budget Name */}
      <h3 style={{
        fontSize: '18px',
        fontWeight: 600,
        color: theme.gray[900],
        marginBottom: '8px',
        paddingRight: '60px',
      }}>
        {budget.name}
      </h3>

      {/* Category */}
      <div style={{
        fontSize: '14px',
        color: theme.gray[500],
        marginBottom: '16px',
        textTransform: 'capitalize',
      }}>
        {budget.category}
      </div>

      {/* Amounts */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: theme.gray[500] }}>Budget:</span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: theme.gray[900] }}>
            {formatCurrency(budget.amount)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
          <span style={{ fontSize: '12px', color: theme.gray[500] }}>Spent:</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: isOverspent ? theme.error : theme.gray[900] 
          }}>
            {formatCurrency(budget.spent)}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '12px', color: theme.gray[500] }}>Remaining:</span>
          <span style={{ 
            fontSize: '14px', 
            fontWeight: 600, 
            color: getRemaining() >= 0 ? theme.success : theme.error 
          }}>
            {formatCurrency(getRemaining())}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          marginBottom: '6px' 
        }}>
          <span style={{ fontSize: '12px', color: theme.gray[500] }}>Progress</span>
          <span style={{ 
            fontSize: '12px', 
            fontWeight: 600, 
            color: getStatusColor() 
          }}>
            {progress.toFixed(1)}%
          </span>
        </div>
        <div style={{
          width: '100%',
          height: '6px',
          backgroundColor: theme.gray[200],
          borderRadius: '3px',
          overflow: 'hidden',
        }}>
          <div style={{
            width: `${Math.min(progress, 100)}%`,
            height: '100%',
            backgroundColor: getStatusColor(),
            borderRadius: '3px',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* Overspent Warning */}
      {isOverspent && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px',
          backgroundColor: `${theme.error}10`,
          borderRadius: '6px',
          marginBottom: '16px',
        }}>
          <FaExclamationTriangle style={{ color: theme.error, fontSize: '14px' }} />
          <span style={{ fontSize: '12px', color: theme.error, fontWeight: 500 }}>
            Overspent by {formatCurrency(Math.abs(getRemaining()))}
          </span>
        </div>
      )}

      {/* Period and Dates */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        marginBottom: '16px',
        fontSize: '12px',
        color: theme.gray[500]
      }}>
        <FaCalendarAlt />
        <span style={{ textTransform: 'capitalize' }}>{budget.period}</span>
        <span>•</span>
        <span>Ends: {formatDate(budget.endDate)}</span>
      </div>

      {/* Actions */}
      <div style={{ 
        display: 'flex', 
        gap: '12px',
        borderTop: `1px solid ${theme.gray[200]}`,
        paddingTop: '16px'
      }}>
        <button
          onClick={() => {/* TODO: Implement edit */}}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'white',
            color: theme.gray[700],
            border: `1px solid ${theme.gray[300]}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.gray[100];
            e.currentTarget.style.borderColor = theme.gray[400];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
            e.currentTarget.style.borderColor = theme.gray[300];
          }}
        >
          <FaEdit />
          Edit
        </button>
        <button
          onClick={handleDelete}
          style={{
            flex: 1,
            padding: '8px',
            backgroundColor: 'white',
            color: theme.error,
            border: `1px solid ${theme.error}`,
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            cursor: 'pointer',
            fontSize: '12px',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = `${theme.error}10`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'white';
          }}
        >
          <FaTrash />
          Delete
        </button>
      </div>
    </div>
  );
};

export default BudgetCard;