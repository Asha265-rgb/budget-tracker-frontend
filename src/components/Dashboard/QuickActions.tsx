import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import AddIncomeModal from '../../features/transactions/AddIncomeModal';
import AddExpensesModal from '../../features/transactions/AddExpensesModal';
import AddBudgetModal from '../../features/budgets/AddBudgetModal';
import TransferModal from '../../features/transactions/TransferModal';

// KEEP AS DEFAULT IMPORT - your file has export default AddGoalModal
import AddGoalModal from '../../features/goals/AddGoalModal';

interface QuickActionsProps {
  userId: string;
  onIncomeAdded?: (amount: number) => void;
  onExpensesAdded?: (amount: number) => void;
}

const QuickActions: React.FC<QuickActionsProps> = ({ 
  userId, 
  onIncomeAdded,
  onExpensesAdded 
}) => {
  // State for modals
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpensesModal, setShowExpensesModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  
  // Add loading states
  const [isGoalLoading, setIsGoalLoading] = useState(false);
  const [isExpensesLoading, setIsExpensesLoading] = useState(false);

  // Quick actions configuration
  const quickActions = [
    {
      id: 'add-income',
      label: 'Add Income',
      icon: '💰',
      color: colors.status.success,
      onClick: () => setShowIncomeModal(true),
      description: 'Add salary, bonuses, gifts'
    },
    {
      id: 'add-expenses',
      label: 'Add Expenses',
      icon: '💸',
      color: colors.status.error,
      onClick: () => setShowExpensesModal(true),
      description: 'Add food, rent, bills, etc.'
    },
    {
      id: 'transfer',
      label: 'Transfer',
      icon: '🔄',
      color: colors.status.info,
      onClick: () => setShowTransferModal(true),
      description: 'Transfer between accounts'
    },
    {
      id: 'budget',
      label: 'Budget',
      icon: '📊',
      color: colors.status.warning,
      onClick: () => setShowBudgetModal(true),
      description: 'Create spending limits'
    },
    {
      id: 'goal',
      label: 'Goal',
      icon: '🎯',
      color: colors.primary[500],
      onClick: () => setShowGoalModal(true),
      description: 'Set savings targets'
    },
    {
      id: 'report',
      label: 'Report',
      icon: '📈',
      color: colors.primary[600],
      onClick: () => {
        window.location.href = '/reports';
      },
      description: 'View financial reports'
    },
  ];

  // Handle income added
  const handleIncomeAdded = (amount: number) => {
    console.log(`Income added: $${amount}`);
    if (onIncomeAdded) {
      onIncomeAdded(amount);
    }
    // Show success notification
    alert(`💰 Income of $${amount.toFixed(2)} added! Balance updated.`);
  };

  // Handle expenses added
  const handleExpensesAdded = (expenseData: any) => {
    setIsExpensesLoading(true);
    try {
      // Calculate total amount
      let totalAmount = 0;
      if (Array.isArray(expenseData)) {
        totalAmount = expenseData.reduce((sum, expense) => sum + (expense.amount || 0), 0);
      } else {
        totalAmount = expenseData.amount || 0;
      }
      
      console.log(`Expenses added: $${totalAmount}`);
      if (onExpensesAdded) {
        onExpensesAdded(totalAmount);
      }
      // Show success notification
      alert(`💸 Expenses totaling $${totalAmount.toFixed(2)} added! Balance updated.`);
      setShowExpensesModal(false);
    } catch (error) {
      console.error('Failed to add expenses:', error);
      alert('Failed to add expenses. Please try again.');
    } finally {
      setIsExpensesLoading(false);
    }
  };

  // Handle goal submission
  const handleGoalSubmit = async (goalData: any) => {
    setIsGoalLoading(true);
    try {
      // Here you would typically make an API call to create the goal
      console.log('Creating goal:', goalData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert(`🎯 Goal "${goalData.name}" created successfully!`);
      setShowGoalModal(false);
    } catch (error) {
      console.error('Failed to create goal:', error);
      alert('Failed to create goal. Please try again.');
    } finally {
      setIsGoalLoading(false);
    }
  };

  // Add hover styles with CSS
  const cardStyles = `
    .quick-action-card {
      text-align: center;
      padding: ${spacing[4]}px;
      cursor: pointer;
      transition: all 0.2s ease;
      border: 2px solid transparent;
      border-radius: 12px;
    }
    
    .quick-action-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
    }
    
    .quick-action-icon {
      font-size: 32px;
      margin-bottom: ${spacing[2]}px;
      transition: transform 0.2s ease;
    }
    
    .quick-action-card:hover .quick-action-icon {
      transform: scale(1.1);
    }
  `;

  return (
    <>
      {/* Add CSS styles */}
      <style>{cardStyles}</style>
      
      {/* Quick Actions Grid */}
      <div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[4]} 0`,
          }}
        >
          Quick Actions
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: spacing[4],
          }}
        >
          {quickActions.map((action) => (
            <div 
              key={action.id}
              className="quick-action-card"
              style={{ 
                backgroundColor: `${action.color}10`,
                borderColor: action.color,
              }}
              onClick={action.onClick}
            >
              <div className="quick-action-icon">
                {action.icon}
              </div>
              <div style={{ 
                fontSize: typography.fontSize.base, 
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing[1]
              }}>
                {action.label}
              </div>
              <div style={{ 
                fontSize: typography.fontSize.sm, 
                color: colors.text.secondary,
                lineHeight: 1.4
              }}>
                {action.description}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      {showIncomeModal && (
        <AddIncomeModal
          isOpen={showIncomeModal}
          onClose={() => setShowIncomeModal(false)}
          userId={userId}
          onIncomeAdded={handleIncomeAdded}
        />
      )}

      {showExpensesModal && (
        <AddExpensesModal
          isOpen={showExpensesModal}
          onClose={() => setShowExpensesModal(false)}
          onSubmit={handleExpensesAdded}
          isLoading={isExpensesLoading}
          userId={userId}
        />
      )}

      {showBudgetModal && (
        <AddBudgetModal
          isOpen={showBudgetModal}
          onClose={() => setShowBudgetModal(false)}
          userId={userId}
        />
      )}

      {showGoalModal && (
        <AddGoalModal
          isOpen={showGoalModal}
          onClose={() => setShowGoalModal(false)}
          onSubmit={handleGoalSubmit}
          isLoading={isGoalLoading}
          userId={userId}
        />
      )}

      {showTransferModal && (
        <TransferModal
          isOpen={showTransferModal}
          onClose={() => setShowTransferModal(false)}
          userId={userId}
        />
      )}
    </>
  );
};

export default QuickActions;