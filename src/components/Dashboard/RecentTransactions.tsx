import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../Common/Card';

interface TransactionBase {
  id: number;
  description: string;
  amount: number;
  type: string;
  date: string;
  category: string;
}

interface PersonalTransaction extends TransactionBase {
  // No additional properties for personal
}

interface BusinessTransaction extends TransactionBase {
  // No additional properties for business
}

interface GroupTransaction extends TransactionBase {
  paidBy: string;
}

type Transaction = PersonalTransaction | BusinessTransaction | GroupTransaction;

interface RecentTransactionsProps {
  userType?: 'personal' | 'business' | 'group';
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ userType = 'personal' }) => {
  // Different transactions based on user type with proper typing
  const getTransactions = (): Transaction[] => {
    switch (userType) {
      case 'business':
        return [
          { id: 1, description: 'Client Payment - ABC Corp', amount: 5000, type: 'income', date: '2025-11-27', category: 'Revenue' },
          { id: 2, description: 'Office Rent', amount: 1200, type: 'expense', date: '2025-11-26', category: 'Operations' },
          { id: 3, description: 'Employee Salaries', amount: 3500, type: 'expense', date: '2025-11-25', category: 'Payroll' },
          { id: 4, description: 'Marketing Campaign', amount: 800, type: 'expense', date: '2025-11-24', category: 'Marketing' },
        ];
      case 'group':
        return [
          { id: 1, description: 'Dinner - Italian Restaurant', amount: 150, type: 'expense', date: '2025-11-27', category: 'Food', paidBy: 'You' },
          { id: 2, description: 'Movie Tickets', amount: 60, type: 'expense', date: '2025-11-26', category: 'Entertainment', paidBy: 'Alice' },
          { id: 3, description: 'Groceries', amount: 85, type: 'expense', date: '2025-11-25', category: 'Food', paidBy: 'Bob' },
          { id: 4, description: 'Uber Ride', amount: 45, type: 'expense', date: '2025-11-24', category: 'Transport', paidBy: 'You' },
        ];
      case 'personal':
      default:
        return [
          { id: 1, description: 'Salary Deposit', amount: 3200, type: 'income', date: '2025-11-27', category: 'Salary' },
          { id: 2, description: 'Grocery Shopping', amount: 85.50, type: 'expense', date: '2025-11-26', category: 'Food' },
          { id: 3, description: 'Netflix Subscription', amount: 15.99, type: 'expense', date: '2025-11-25', category: 'Entertainment' },
          { id: 4, description: 'Gas Station', amount: 45.00, type: 'expense', date: '2025-11-24', category: 'Transport' },
        ];
    }
  };

  const transactions = getTransactions();

  // Helper function to check if transaction has paidBy property
  const hasPaidBy = (transaction: Transaction): transaction is GroupTransaction => {
    return 'paidBy' in transaction;
  };

  return (
    <div>
      <h2
        style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: `0 0 ${spacing[4]} 0`,
        }}
      >
        {userType === 'business' ? 'Recent Business Transactions' : 
         userType === 'group' ? 'Recent Group Expenses' : 'Recent Transactions'}
      </h2>
      <Card style={{ padding: spacing[4] }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: spacing[3],
                backgroundColor: colors.background.secondary,
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: spacing[3] }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: transaction.type === 'income' ? `${colors.status.success}20` : `${colors.status.error}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: transaction.type === 'income' ? colors.status.success : colors.status.error,
                  }}
                >
                  {transaction.type === 'income' ? '📥' : '📤'}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.medium,
                      color: colors.text.primary,
                    }}
                  >
                    {transaction.description}
                  </div>
                  <div
                    style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                    }}
                  >
                    {transaction.date} • {transaction.category}
                    {userType === 'group' && hasPaidBy(transaction) && ` • Paid by ${transaction.paidBy}`}
                  </div>
                </div>
              </div>
              <div
                style={{
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.bold,
                  color: transaction.type === 'income' ? colors.status.success : colors.status.error,
                }}
              >
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RecentTransactions;