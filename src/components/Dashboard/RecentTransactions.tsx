import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../Common/Card';
import { 
  useGetRecentTransactionsQuery,
  type Transaction as ApiTransaction 
} from '../../features/transactions/transactionsApi';

interface RecentTransactionsProps {
  userType?: 'personal' | 'business' | 'group';
  userId?: string;
}

interface DisplayTransaction {
  id: number;
  description: string;
  amount: number;
  type: string;
  date: string;
  category: string;
  paidBy?: string;
}

const RecentTransactions: React.FC<RecentTransactionsProps> = ({ 
  userType = 'personal',
  userId 
}) => {
  const { 
    data: apiTransactions = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useGetRecentTransactionsQuery(userId || '', {
    skip: !userId,
  });

  const transformApiData = (apiData: ApiTransaction[]): DisplayTransaction[] => {
    return apiData.map((item: ApiTransaction, index: number) => ({
      id: index + 1,
      description: item.description,
      amount: item.amount,
      type: item.type,
      date: item.date,
      category: item.category,
      ...(userType === 'group' && { paidBy: 'You' })
    }));
  };

  const transactions = transformApiData(apiTransactions);
  const loading = isLoading;
  const errorMessage = isError ? (error as any)?.data?.message || 'Failed to load transactions' : null;

  const fetchTransactions = () => {
    if (userId) {
      refetch();
    }
  };

  const hasPaidBy = (transaction: DisplayTransaction): boolean => {
    return 'paidBy' in transaction;
  };

  if (!userId) {
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
          <div style={{ textAlign: 'center', padding: spacing[8] }}>
            <div style={{ color: colors.text.secondary }}>Loading user information...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (loading) {
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
          <div style={{ textAlign: 'center', padding: spacing[8] }}>
            <div style={{ color: colors.text.secondary }}>Loading transactions...</div>
          </div>
        </Card>
      </div>
    );
  }

  if (errorMessage) {
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
          <div style={{ textAlign: 'center', padding: spacing[8] }}>
            <div style={{ color: colors.status.error, marginBottom: spacing[2] }}>{errorMessage}</div>
            <button
              onClick={fetchTransactions}
              style={{
                padding: `${spacing[2]} ${spacing[4]}`,
                backgroundColor: colors.primary[500],
                color: colors.text.white,
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </Card>
      </div>
    );
  }

  if (transactions.length === 0) {
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
          <div style={{ textAlign: 'center', padding: spacing[8] }}>
            <div style={{ color: colors.text.secondary }}>No transactions found</div>
          </div>
        </Card>
      </div>
    );
  }

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
                    {userType === 'group' && hasPaidBy(transaction) && transaction.paidBy && ` • Paid by ${transaction.paidBy}`}
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
                {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default RecentTransactions;