import React, { useState, useEffect } from 'react';
import { notificationsAPI } from '../services/api';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  metadata?: any;
  relatedEntityId?: string;
  relatedEntityType?: string;
  isActionRequired: boolean;
  actionUrl?: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

const TestNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // Test data for creating notifications
  const testBudgetAlert = {
    title: "Budget Overspending Alert",
    message: "You've spent 95% of your Food budget this month",
    type: "overspending",
    userId: USER_ID,
    metadata: { budgetId: "test-budget-123", spent: 285, limit: 300 },
    relatedEntityId: "test-budget-123",
    relatedEntityType: "budget",
    isActionRequired: true,
    actionUrl: "/budgets"
  };

  const testGoalMilestone = {
    title: "Goal Milestone Reached!",
    message: "You've reached 50% of your Vacation savings goal!",
    type: "goal_milestone",
    userId: USER_ID,
    metadata: { goalId: "test-goal-456", progress: 50 },
    relatedEntityId: "test-goal-456",
    relatedEntityType: "goal",
    isActionRequired: false
  };

  const testBillReminder = {
    title: "Bill Payment Reminder",
    message: "Your Netflix subscription payment is due in 3 days",
    type: "bill_reminder",
    userId: USER_ID,
    metadata: { dueDate: new Date().toISOString(), amount: 15.99 },
    relatedEntityId: "test-recurring-789",
    relatedEntityType: "recurring_transaction",
    isActionRequired: true,
    actionUrl: "/transactions"
  };

  const testLowBalance = {
    title: "Low Account Balance",
    message: "Your checking account balance is below $50",
    type: "low_balance",
    userId: USER_ID,
    metadata: { accountId: "test-account-111", balance: 45.50 },
    relatedEntityId: "test-account-111",
    relatedEntityType: "account",
    isActionRequired: true,
    actionUrl: "/accounts"
  };

  // Test: Get all notifications for user
  const testGetNotifications = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await notificationsAPI.getUserNotifications(USER_ID);
      setNotifications(response.data);
      console.log('Notifications:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching notifications: ${errorMessage}`);
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Create budget alert
  const testCreateBudgetAlert = async () => {
    setError('');
    try {
      const response = await notificationsAPI.createNotification(USER_ID, testBudgetAlert);
      console.log('Budget alert created:', response.data);
      alert('Budget alert created successfully!');
      testGetNotifications();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating budget alert: ${errorMessage}`);
      console.error('Error creating budget alert:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create goal milestone
  const testCreateGoalMilestone = async () => {
    setError('');
    try {
      const response = await notificationsAPI.createNotification(USER_ID, testGoalMilestone);
      console.log('Goal milestone created:', response.data);
      alert('Goal milestone created successfully!');
      testGetNotifications();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating goal milestone: ${errorMessage}`);
      console.error('Error creating goal milestone:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create bill reminder
  const testCreateBillReminder = async () => {
    setError('');
    try {
      const response = await notificationsAPI.createNotification(USER_ID, testBillReminder);
      console.log('Bill reminder created:', response.data);
      alert('Bill reminder created successfully!');
      testGetNotifications();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating bill reminder: ${errorMessage}`);
      console.error('Error creating bill reminder:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create low balance alert
  const testCreateLowBalance = async () => {
    setError('');
    try {
      const response = await notificationsAPI.createNotification(USER_ID, testLowBalance);
      console.log('Low balance alert created:', response.data);
      alert('Low balance alert created successfully!');
      testGetNotifications();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating low balance alert: ${errorMessage}`);
      console.error('Error creating low balance alert:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Mark notification as read
  const testMarkAsRead = async (notificationId: string) => {
    try {
      await notificationsAPI.markAsRead(notificationId);
      alert('Notification marked as read!');
      testGetNotifications();
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      alert('Error marking notification as read');
    }
  };

  // Test: Mark all as read
  const testMarkAllAsRead = async () => {
    try {
      await notificationsAPI.markAllAsRead(USER_ID);
      alert('All notifications marked as read!');
      testGetNotifications();
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      alert('Error marking all notifications as read');
    }
  };

  useEffect(() => {
    testGetNotifications();
  }, []);

  // Helper functions
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'overspending': return '#F44336';
      case 'goal_milestone': return '#4CAF50';
      case 'bill_reminder': return '#FF9800';
      case 'low_balance': return '#2196F3';
      case 'recurring_transaction': return '#9C27B0';
      default: return '#607D8B';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'unread': return '#FF5722';
      case 'read': return '#4CAF50';
      case 'dismissed': return '#9E9E9E';
      default: return '#607D8B';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'overspending': return '💰';
      case 'goal_milestone': return '🎯';
      case 'bill_reminder': return '📅';
      case 'low_balance': return '⚠️';
      case 'recurring_transaction': return '🔄';
      default: return '🔔';
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🔔 Notifications API Test</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><small>Notifications provide alerts and reminders for important financial events</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testCreateBudgetAlert} style={{ marginRight: '10px', marginBottom: '10px' }}>
          💰 Create Budget Alert
        </button>
        <button onClick={testCreateGoalMilestone} style={{ marginRight: '10px', marginBottom: '10px' }}>
          🎯 Create Goal Milestone
        </button>
        <button onClick={testCreateBillReminder} style={{ marginRight: '10px', marginBottom: '10px' }}>
          📅 Create Bill Reminder
        </button>
        <button onClick={testCreateLowBalance} style={{ marginRight: '10px', marginBottom: '10px' }}>
          ⚠️ Create Low Balance
        </button>
        <button onClick={testMarkAllAsRead} style={{ marginRight: '10px', marginBottom: '10px' }}>
          ✅ Mark All Read
        </button>
        <button onClick={testGetNotifications}>
          🔄 Refresh
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <h4>Notifications ({notifications.length})</h4>
        {notifications.length === 0 && !loading && (
          <p style={{ color: '#666' }}>No notifications found. Create some notifications to see them here.</p>
        )}
        {notifications.map(notification => {
          const typeColor = getTypeColor(notification.type);
          const statusColor = getStatusColor(notification.status);
          const typeIcon = getTypeIcon(notification.type);
          
          return (
            <div key={notification.id} style={{ 
              border: '1px solid #eee', 
              margin: '10px 0', 
              padding: '15px',
              backgroundColor: notification.status === 'unread' ? '#f8f9fa' : '#ffffff',
              borderRadius: '8px',
              borderLeft: `4px solid ${typeColor}`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{typeIcon}</span>
                  <div>
                    <h4 style={{ margin: 0, marginBottom: '5px' }}>{notification.title}</h4>
                    <p style={{ margin: 0, color: '#666' }}>{notification.message}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: typeColor,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {notification.type}
                  </span>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: statusColor,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {notification.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {new Date(notification.createdAt).toLocaleString()}
                  {notification.isActionRequired && (
                    <span style={{ color: '#FF5722', marginLeft: '10px', fontWeight: 'bold' }}>
                      ⚡ Action Required
                    </span>
                  )}
                </div>
                <div>
                  {notification.status === 'unread' && (
                    <button 
                      onClick={() => testMarkAsRead(notification.id)}
                      style={{ 
                        padding: '2px 8px', 
                        fontSize: '11px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestNotifications;