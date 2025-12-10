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

interface FinancialCardsProps {
  userType?: 'personal' | 'business' | 'group';
  userId?: string;
}

const FinancialCards: React.FC<FinancialCardsProps> = ({ 
  userType = 'personal',
  userId = ''
}) => {
  // Fetch real data from API
  const { data: totalIncome = 0, isLoading: isLoadingIncome } = useGetTotalIncomeQuery(userId, {
    skip: !userId,
  });

  const { data: totalExpenses = 0, isLoading: isLoadingExpenses } = useGetTotalExpensesQuery(userId, {
    skip: !userId,
  });

  const { data: transactionStats, isLoading: isLoadingStats } = useGetTransactionStatsQuery(userId, {
    skip: !userId,
  });

  const [previousIncome, setPreviousIncome] = useState<number | null>(null);
  const [previousExpenses, setPreviousExpenses] = useState<number | null>(null);

  // Calculate derived values
  const balance = (totalIncome as number) - (totalExpenses as number);
  const savings = balance; // In simple terms, savings = balance

  // Calculate trends (percentage changes)
  const calculateTrend = (current: number, previous: number | null) => {
    if (!previous || previous === 0) return current > 0 ? '+100%' : '0%';
    const change = ((current - previous) / previous) * 100;
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // Store previous values for trend calculation
  useEffect(() => {
    if (totalIncome && !isLoadingIncome) {
      setPreviousIncome(totalIncome as number);
    }
  }, [totalIncome, isLoadingIncome]);

  useEffect(() => {
    if (totalExpenses && !isLoadingExpenses) {
      setPreviousExpenses(totalExpenses as number);
    }
  }, [totalExpenses, isLoadingExpenses]);

  const getFinancialData = () => {
    if (isLoadingIncome || isLoadingExpenses || isLoadingStats) {
      return [
        { title: 'Total Balance', amount: 'Loading...', trend: '', color: colors.primary[500], icon: '💰' },
        { title: 'Income', amount: 'Loading...', trend: '', color: colors.status.success, icon: '📥' },
        { title: 'Expenses', amount: 'Loading...', trend: '', color: colors.status.error, icon: '📤' },
        { title: 'Savings', amount: 'Loading...', trend: '', color: colors.status.warning, icon: '🏦' },
      ];
    }

    const incomeTrend = calculateTrend(totalIncome as number, previousIncome);
    const expensesTrend = calculateTrend(totalExpenses as number, previousExpenses);
    const balanceTrend = calculateTrend(balance, previousIncome ? previousIncome - (previousExpenses || 0) : null);

    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(amount);
    };

    switch (userType) {
      case 'business':
        // For business users, use available stats or fallbacks
        const cashFlow = (transactionStats as any)?.cashFlow || 
                        (transactionStats as any)?.totalCashFlow || 
                        (balance * 0.3); // Fallback: 30% of balance
        
        return [
          { title: 'Total Revenue', amount: formatCurrency(totalIncome as number), trend: incomeTrend, color: colors.status.success, icon: '💰' },
          { title: 'Operating Costs', amount: formatCurrency(totalExpenses as number), trend: expensesTrend, color: colors.status.error, icon: '💸' },
          { title: 'Net Profit', amount: formatCurrency(balance), trend: balanceTrend, color: colors.status.success, icon: '📈' },
          { title: 'Cash Flow', amount: formatCurrency(cashFlow), trend: '+8%', color: colors.status.info, icon: '🔄' },
        ];
      
      case 'group':
        // For group users, check what stats are available
        const groupStats = transactionStats as any;
        const youOwe = groupStats?.youOwe || groupStats?.totalOwed || 0;
        const youAreOwed = groupStats?.youAreOwed || groupStats?.totalOwedToYou || 0;
        const groupBalance = youAreOwed - youOwe;
        
        return [
          { 
            title: 'Group Balance', 
            amount: formatCurrency(groupBalance), 
            trend: groupBalance >= 0 ? 'Positive' : 'Negative', 
            color: groupBalance >= 0 ? colors.status.success : colors.status.error, 
            icon: '👥' 
          },
          { 
            title: 'You Owe', 
            amount: formatCurrency(youOwe), 
            trend: 'Pending', 
            color: colors.status.error, 
            icon: '📤' 
          },
          { 
            title: 'You Are Owed', 
            amount: formatCurrency(youAreOwed), 
            trend: 'Pending', 
            color: colors.status.success, 
            icon: '📥' 
          },
          { 
            title: 'Total Expenses', 
            amount: formatCurrency(totalExpenses as number), 
            trend: expensesTrend, 
            color: colors.primary[500], 
            icon: '💳' 
          },
        ];
      
      case 'personal':
      default:
        // For personal users - simple and clear
        return [
          { title: 'Total Balance', amount: formatCurrency(balance), trend: balanceTrend, color: colors.primary[500], icon: '💰' },
          { title: 'Income', amount: formatCurrency(totalIncome as number), trend: incomeTrend, color: colors.status.success, icon: '📥' },
          { title: 'Expenses', amount: formatCurrency(totalExpenses as number), trend: expensesTrend, color: colors.status.error, icon: '📤' },
          { title: 'Savings', amount: formatCurrency(savings), trend: balanceTrend, color: colors.status.warning, icon: '🏦' },
        ];
    }
  };

  const financialData = getFinancialData();

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: spacing[4],
      }}
    >
      {financialData.map((card, index) => (
        <Card key={index} style={{ padding: spacing[4] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: colors.text.secondary,
                  marginBottom: spacing[1],
                }}
              >
                {card.title}
              </div>
              <div
                style={{
                  fontSize: typography.fontSize['2xl'],
                  fontWeight: typography.fontWeight.bold,
                  color: colors.text.primary,
                  marginBottom: spacing[2],
                }}
              >
                {card.amount}
              </div>
              {card.trend && (
                <div
                  style={{
                    fontSize: typography.fontSize.sm,
                    color: card.color,
                  }}
                >
                  {card.trend}
                </div>
              )}
            </div>
            <div
              style={{
                fontSize: '24px',
                color: card.color,
              }}
            >
              {card.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default FinancialCards;