import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../Common/Card';

interface GroupDashboardProps {
  userName: string;
}

const GroupDashboard: React.FC<GroupDashboardProps> = ({ userName }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const groupBalance = [
    { member: 'You', amount: 120, status: 'owed' },
    { member: 'Alice', amount: 75, status: 'owes' },
    { member: 'Bob', amount: 45, status: 'owed' },
  ];

  const recentGroupExpenses = [
    { description: 'Dinner at Restaurant', amount: 150, date: '2025-11-27', paidBy: 'You' },
    { description: 'Movie Tickets', amount: 60, date: '2025-11-26', paidBy: 'Alice' },
    { description: 'Groceries', amount: 85, date: '2025-11-25', paidBy: 'Bob' },
  ];

  const groupQuickActions = [
    { id: 'add-expense', label: 'Add Expense', icon: '💸', color: colors.status.error },
    { id: 'settle-up', label: 'Settle Up', icon: '✅', color: colors.status.success },
    { id: 'invite', label: 'Invite Member', icon: '👥', color: colors.status.info },
    { id: 'create-group', label: 'Create Group', icon: '🆕', color: colors.status.warning },
    { id: 'group-report', label: 'Group Report', icon: '📊', color: colors.primary[500] }, // FIXED: Using primary color
    { id: 'settings', label: 'Settings', icon: '⚙️', color: colors.primary[600] }, // FIXED: Using primary color
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
      {/* Welcome Header for Group User */}
      <div>
        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[2]} 0`,
          }}
        >
          Group Finance, {userName}! 👥
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          {currentDate} • Shared Expense Management
        </p>
      </div>

      {/* Group Balance Summary */}
      <div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[4]} 0`,
          }}
        >
          Group Balance
        </h2>
        <Card style={{ padding: spacing[4] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {groupBalance.map((balance, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: typography.fontSize.base }}>{balance.member}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2] }}>
                  <span style={{ 
                    fontSize: typography.fontSize.base,
                    color: balance.status === 'owed' ? colors.status.success : colors.status.error
                  }}>
                    ${balance.amount}
                  </span>
                  <span style={{ 
                    fontSize: typography.fontSize.sm,
                    color: balance.status === 'owed' ? colors.status.success : colors.status.error,
                    padding: `${spacing[1]} ${spacing[2]}`,
                    backgroundColor: balance.status === 'owed' ? `${colors.status.success}20` : `${colors.status.error}20`,
                    borderRadius: '12px'
                  }}>
                    {balance.status === 'owed' ? 'Owes you' : 'You owe'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Group Quick Actions */}
      <div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[4]} 0`,
          }}
        >
          Group Management
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: spacing[3],
          }}
        >
          {groupQuickActions.map((action) => (
            <Card key={action.id} style={{ textAlign: 'center', padding: spacing[4], cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: spacing[2] }}>{action.icon}</div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {action.label}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Group Expenses */}
      <div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[4]} 0`,
          }}
        >
          Recent Group Expenses
        </h2>
        <Card style={{ padding: spacing[4] }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            {recentGroupExpenses.map((expense, index) => (
              <div key={index} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: spacing[3],
                backgroundColor: index % 2 === 0 ? colors.background.secondary : 'transparent',
                borderRadius: '8px'
              }}>
                <div>
                  <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium }}>
                    {expense.description}
                  </div>
                  <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                    Paid by {expense.paidBy} • {expense.date}
                  </div>
                </div>
                <div style={{ 
                  fontSize: typography.fontSize.lg, 
                  fontWeight: typography.fontWeight.bold,
                  color: colors.status.error
                }}>
                  -${expense.amount}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GroupDashboard;