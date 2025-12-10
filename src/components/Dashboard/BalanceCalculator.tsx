import React, { useState, useEffect } from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../Common/Card';
import { 
  useGetTotalIncomeQuery, 
  useGetTotalExpensesQuery,
  useGetTransactionStatsQuery 
} from '../../features/transactions/transactionsApi';
import { useCreateNotificationMutation } from '../../features/notifications/notificationsApi';

interface BalanceCalculatorProps {
  userId: string;
  onBalanceChange?: (balance: number) => void;
}

const BalanceCalculator: React.FC<BalanceCalculatorProps> = ({ 
  userId, 
  onBalanceChange 
}) => {
  // Fetch real data from API
  const { 
    data: totalIncome = 0, 
    isLoading: isLoadingIncome,
    refetch: refetchIncome 
  } = useGetTotalIncomeQuery(userId, {
    skip: !userId,
  });

  const { 
    data: totalExpenses = 0, 
    isLoading: isLoadingExpenses,
    refetch: refetchExpenses 
  } = useGetTotalExpensesQuery(userId, {
    skip: !userId,
  });

  const {
    isLoading: isLoadingStats // FIXED: removed unused data: transactionStats
  } = useGetTransactionStatsQuery(userId, {
    skip: !userId,
  });

  // Notification mutation
  const [createNotification] = useCreateNotificationMutation();

  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [notificationsSent, setNotificationsSent] = useState<string[]>([]);

  const balance = (totalIncome as number) - (totalExpenses as number);
  const spendingPercentage = totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0;

  // Notify parent about balance change
  useEffect(() => {
    if (onBalanceChange) {
      onBalanceChange(balance);
    }
  }, [balance, onBalanceChange]);

  // Check for notifications when balance changes
  useEffect(() => {
    if (!userId || isLoadingIncome || isLoadingExpenses) return;

    const checkAndSendNotifications = async () => {
      const newNotifications: string[] = [];

      // 1. Low balance notification (less than 10% of income left)
      if (balance < totalIncome * 0.1 && balance > 0) {
        const notificationId = `low-balance-${Date.now()}`;
        if (!notificationsSent.includes(notificationId)) {
          await createNotification({
            title: 'Low Balance Alert',
            message: `Your balance is getting low ($${balance.toFixed(2)}). Consider reducing expenses.`,
            type: 'low_balance',
            userId: userId,
            metadata: { balance, totalIncome, totalExpenses },
            isActionRequired: false,
          });
          newNotifications.push(notificationId);
        }
      }

      // 2. Over budget notification (negative balance)
      if (balance < 0) {
        const notificationId = `over-budget-${Date.now()}`;
        if (!notificationsSent.includes(notificationId)) {
          await createNotification({
            title: 'Over Budget Alert',
            message: `You're over budget by $${Math.abs(balance).toFixed(2)}!`,
            type: 'overspending',
            userId: userId,
            metadata: { balance, totalIncome, totalExpenses },
            isActionRequired: true,
          });
          newNotifications.push(notificationId);
        }
      }

      // 3. High spending notification (>80% of income spent)
      if (spendingPercentage > 80 && balance >= 0) {
        const notificationId = `high-spending-${Date.now()}`;
        if (!notificationsSent.includes(notificationId)) {
          await createNotification({
            title: 'High Spending Alert',
            message: `You've spent ${spendingPercentage.toFixed(1)}% of your income this month.`,
            type: 'overspending',
            userId: userId,
            metadata: { spendingPercentage, totalIncome, totalExpenses },
            isActionRequired: false,
          });
          newNotifications.push(notificationId);
        }
      }

      if (newNotifications.length > 0) {
        setNotificationsSent(prev => [...prev, ...newNotifications]);
      }
    };

    checkAndSendNotifications();
  }, [balance, totalIncome, totalExpenses, spendingPercentage, userId, createNotification, notificationsSent, isLoadingIncome, isLoadingExpenses]);

  // Determine balance status
  const getBalanceStatus = () => {
    if (balance < 0) {
      return { status: 'negative', text: 'Over Budget', color: colors.status.error };
    } else if (balance < (totalIncome as number) * 0.1) {
      return { status: 'warning', text: 'Low Balance', color: colors.status.warning };
    } else {
      return { status: 'positive', text: 'Healthy', color: colors.status.success };
    }
  };

  const balanceStatus = getBalanceStatus();
  const isLoading = isLoadingIncome || isLoadingExpenses || isLoadingStats;
  
  // Use existing colors
  const textSecondaryColor = colors.text.secondary;
  const borderLightColor = colors.border.light || '#E5E7EB';

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Refresh data
  const handleRefresh = () => {
    refetchIncome();
    refetchExpenses();
    setLastUpdated(new Date());
  };

  return (
    <Card style={{ padding: spacing[6] }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'flex-start',
        marginBottom: spacing[4] 
      }}>
        <div>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: textSecondaryColor,
            marginBottom: spacing[1],
          }}>
            Current Balance
          </div>
          <div style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: balance >= 0 ? colors.status.success : colors.status.error,
            marginBottom: spacing[2],
          }}>
            {isLoading ? 'Loading...' : formatCurrency(balance)}
            {balance < 0 && (
              <span style={{ 
                fontSize: typography.fontSize.lg, 
                marginLeft: spacing[2],
                color: colors.status.error 
              }}>
                (Overdraft)
              </span>
            )}
          </div>
          
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: `${spacing[1]} ${spacing[3]}`,
            backgroundColor: `${balanceStatus.color}20`,
            color: balanceStatus.color,
            borderRadius: '20px',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              backgroundColor: balanceStatus.color,
              borderRadius: '50%',
            }} />
            {balanceStatus.text}
          </div>
        </div>
        
        <div style={{
          fontSize: typography.fontSize.xs,
          color: textSecondaryColor,
          textAlign: 'right',
          opacity: 0.7,
        }}>
          <button
            onClick={handleRefresh}
            style={{
              background: 'none',
              border: 'none',
              color: colors.primary[500],
              cursor: 'pointer',
              fontSize: typography.fontSize.xs,
              marginBottom: spacing[1],
              textDecoration: 'underline',
            }}
          >
            Refresh
          </button>
          <div>
            Updated<br/>
            {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>

      {/* Income vs Expenses Breakdown */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(2, 1fr)', 
        gap: spacing[4],
        marginBottom: spacing[6]
      }}>
        <div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: textSecondaryColor,
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Total Income
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: spacing[1],
          }}>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.status.success,
            }}>
              {isLoading ? '...' : formatCurrency(totalIncome as number)}
            </div>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: textSecondaryColor,
            }}>
              this month
            </div>
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.status.success,
            marginTop: spacing[1],
          }}>
            💰 Money In
          </div>
        </div>

        <div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: textSecondaryColor,
            marginBottom: spacing[1],
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
          }}>
            Total Expenses
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            gap: spacing[1],
          }}>
            <div style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.status.error,
            }}>
              {isLoading ? '...' : formatCurrency(totalExpenses as number)}
            </div>
            <div style={{
              fontSize: typography.fontSize.sm,
              color: textSecondaryColor,
            }}>
              this month
            </div>
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: colors.status.error,
            marginTop: spacing[1],
          }}>
            💸 Money Out
          </div>
        </div>
      </div>

      {/* Spending Progress Bar */}
      <div style={{ marginBottom: spacing[4] }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: spacing[2],
        }}>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.primary,
            fontWeight: typography.fontWeight.medium,
          }}>
            Spending Progress
          </div>
          <div style={{
            fontSize: typography.fontSize.sm,
            color: spendingPercentage > 80 ? colors.status.error : textSecondaryColor,
            fontWeight: spendingPercentage > 80 ? typography.fontWeight.bold : typography.fontWeight.normal,
          }}>
            {isLoading ? '...' : `${spendingPercentage.toFixed(1)}% of income spent`}
          </div>
        </div>
        
        <div style={{
          height: '8px',
          backgroundColor: borderLightColor,
          borderRadius: '4px',
          overflow: 'hidden',
        }}>
          <div 
            style={{
              height: '100%',
              width: `${Math.min(spendingPercentage, 100)}%`,
              backgroundColor: spendingPercentage > 80 ? colors.status.error : 
                               spendingPercentage > 60 ? colors.status.warning : colors.status.success,
              borderRadius: '4px',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: spacing[2],
        }}>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: textSecondaryColor,
          }}>
            0%
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: textSecondaryColor,
          }}>
            100%
          </div>
        </div>
      </div>

      {/* Balance Alert Messages */}
      {balance < 0 && !isLoading && (
        <div style={{
          padding: spacing[3],
          backgroundColor: `${colors.status.error}15`,
          borderLeft: `4px solid ${colors.status.error}`,
          borderRadius: '8px',
          marginBottom: spacing[3],
        }}>
          <div style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.status.error,
            marginBottom: spacing[1],
          }}>
            ⚠️ Over Budget Alert
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: textSecondaryColor,
          }}>
            You've spent {formatCurrency(Math.abs(balance))} more than your income this month.
          </div>
        </div>
      )}

      {spendingPercentage > 80 && balance >= 0 && !isLoading && (
        <div style={{
          padding: spacing[3],
          backgroundColor: `${colors.status.warning}15`,
          borderLeft: `4px solid ${colors.status.warning}`,
          borderRadius: '8px',
        }}>
          <div style={{
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
            color: colors.status.warning,
            marginBottom: spacing[1],
          }}>
            ⚠️ High Spending Alert
          </div>
          <div style={{
            fontSize: typography.fontSize.xs,
            color: textSecondaryColor,
          }}>
            You've spent {spendingPercentage.toFixed(1)}% of your income. Consider reducing expenses.
          </div>
        </div>
      )}

      {/* Data Source Info */}
      <div style={{ 
        marginTop: spacing[4],
        paddingTop: spacing[4],
        borderTop: `1px solid ${borderLightColor}`,
        fontSize: typography.fontSize.xs,
        color: textSecondaryColor,
        textAlign: 'center',
      }}>
        {isLoading ? 'Fetching real-time data...' : 'Real-time data from your transactions'}
      </div>
    </Card>
  );
};

export default BalanceCalculator;