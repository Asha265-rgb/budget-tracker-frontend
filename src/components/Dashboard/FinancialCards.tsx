import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../Common/Card';

interface FinancialCardsProps {
  userType?: 'personal' | 'business' | 'group';
}

const FinancialCards: React.FC<FinancialCardsProps> = ({ userType = 'personal' }) => {
  // Different data based on user type
  const getFinancialData = () => {
    switch (userType) {
      case 'business':
        return [
          { title: 'Total Revenue', amount: '$12,450', trend: '+12%', color: colors.status.success, icon: '💰' },
          { title: 'Operating Costs', amount: '$8,230', trend: '+5%', color: colors.status.error, icon: '💸' },
          { title: 'Net Profit', amount: '$4,220', trend: '+18%', color: colors.status.success, icon: '📈' },
          { title: 'Cash Flow', amount: '$2,150', trend: '+8%', color: colors.status.info, icon: '🔄' },
        ];
      case 'group':
        return [
          { title: 'Group Balance', amount: '$240', trend: 'Settled', color: colors.status.info, icon: '👥' },
          { title: 'You Owe', amount: '$75', trend: 'Pending', color: colors.status.error, icon: '📤' },
          { title: 'You Are Owed', amount: '$120', trend: 'Pending', color: colors.status.success, icon: '📥' },
          { title: 'Total Expenses', amount: '$450', trend: 'This month', color: colors.primary[500], icon: '💳' }, // FIXED: Using primary color
        ];
      case 'personal':
      default:
        return [
          { title: 'Total Balance', amount: '$8,450', trend: '+5%', color: colors.primary[500], icon: '💰' }, // FIXED: Using primary color
          { title: 'Income', amount: '$4,200', trend: '+12%', color: colors.status.success, icon: '📥' },
          { title: 'Expenses', amount: '$2,850', trend: '+8%', color: colors.status.error, icon: '📤' },
          { title: 'Savings', amount: '$1,400', trend: '+15%', color: colors.status.warning, icon: '🏦' },
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
              <div
                style={{
                  fontSize: typography.fontSize.sm,
                  color: card.color,
                }}
              >
                {card.trend}
              </div>
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