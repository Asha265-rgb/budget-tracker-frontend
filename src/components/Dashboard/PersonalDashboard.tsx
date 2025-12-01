import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../Common/Card';
import FinancialCards from './FinancialCards';
import RecentTransactions from './RecentTransactions';

interface PersonalDashboardProps {
  userName: string;
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ userName }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const personalQuickActions = [
    { id: 'add-income', label: 'Add Income', icon: '💰', color: colors.status.success },
    { id: 'add-expense', label: 'Add Expense', icon: '💸', color: colors.status.error },
    { id: 'transfer', label: 'Transfer', icon: '🔄', color: colors.status.info },
    { id: 'budget', label: 'Budget', icon: '📊', color: colors.status.warning },
    { id: 'goal', label: 'Goal', icon: '🎯', color: colors.primary[500] }, // FIXED: Using primary color
    { id: 'report', label: 'Report', icon: '📈', color: colors.primary[600] }, // FIXED: Using primary color
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
      {/* Welcome Header for Personal User */}
      <div>
        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[2]} 0`,
          }}
        >
          Welcome back, {userName}! 👋
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          {currentDate} • Personal Finance Overview
        </p>
      </div>

      {/* Personal Financial Summary */}
      <FinancialCards userType="personal" />

      {/* Personal Quick Actions */}
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
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: spacing[3],
          }}
        >
          {personalQuickActions.map((action) => (
            <Card key={action.id} style={{ textAlign: 'center', padding: spacing[4], cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: spacing[2] }}>{action.icon}</div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {action.label}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Personal Transactions */}
      <RecentTransactions userType="personal" />
    </div>
  );
};

export default PersonalDashboard;