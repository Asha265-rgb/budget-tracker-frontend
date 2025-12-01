import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../../components/Common/Card';

interface BusinessDashboardProps {
  userName: string;
}

const BusinessDashboard: React.FC<BusinessDashboardProps> = ({ userName }) => {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const businessMetrics = [
    { label: 'Monthly Revenue', value: '$12,450', change: '+12%', trend: 'up' },
    { label: 'Operating Costs', value: '$8,230', change: '+5%', trend: 'down' },
    { label: 'Net Profit', value: '$4,220', change: '+18%', trend: 'up' },
    { label: 'Cash Flow', value: '$2,150', change: '+8%', trend: 'up' },
  ];

  const businessQuickActions = [
    { id: 'add-revenue', label: 'Add Revenue', icon: '💼', color: colors.status.success },
    { id: 'add-expense', label: 'Add Expense', icon: '🧾', color: colors.status.error },
    { id: 'payroll', label: 'Payroll', icon: '👥', color: colors.status.info },
    { id: 'inventory', label: 'Inventory', icon: '📦', color: colors.status.warning },
    { id: 'reports', label: 'Reports', icon: '📊', color: colors.primary[500] }, // FIXED: Using primary color
    { id: 'taxes', label: 'Taxes', icon: '🏛️', color: colors.primary[600] }, // FIXED: Using primary color
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
      {/* Welcome Header for Business User */}
      <div>
        <h1
          style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[2]} 0`,
          }}
        >
          Business Dashboard, {userName}! 🏢
        </h1>
        <p
          style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            margin: 0,
          }}
        >
          {currentDate} • Business Financial Overview
        </p>
      </div>

      {/* Business Metrics */}
      <div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[4]} 0`,
          }}
        >
          Business Performance
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing[4],
          }}
        >
          {businessMetrics.map((metric, index) => (
            <Card key={index} style={{ padding: spacing[4] }}>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, marginBottom: spacing[2] }}>
                {metric.label}
              </div>
              <div style={{ fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                {metric.value}
              </div>
              <div style={{ 
                fontSize: typography.fontSize.sm, 
                color: metric.trend === 'up' ? colors.status.success : colors.status.error 
              }}>
                {metric.change} from last month
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Quick Actions */}
      <div>
        <h2
          style={{
            fontSize: typography.fontSize.xl,
            fontWeight: typography.fontWeight.semibold,
            color: colors.text.primary,
            margin: `0 0 ${spacing[4]} 0`,
          }}
        >
          Business Operations
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: spacing[3],
          }}
        >
          {businessQuickActions.map((action) => (
            <Card key={action.id} style={{ textAlign: 'center', padding: spacing[4], cursor: 'pointer' }}>
              <div style={{ fontSize: '24px', marginBottom: spacing[2] }}>{action.icon}</div>
              <div style={{ fontSize: typography.fontSize.sm, color: colors.text.primary }}>
                {action.label}
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Business Insights */}
      <Card style={{ padding: spacing[4] }}>
        <h3 style={{ fontSize: typography.fontSize.lg, marginBottom: spacing[3] }}>Business Insights</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Marketing ROI</span>
            <span style={{ color: colors.status.success, fontWeight: 'bold' }}>+24%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Employee Productivity</span>
            <span style={{ color: colors.status.success, fontWeight: 'bold' }}>+15%</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Customer Acquisition Cost</span>
            <span style={{ color: colors.status.error, fontWeight: 'bold' }}>+8%</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default BusinessDashboard;