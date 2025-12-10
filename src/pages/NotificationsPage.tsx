import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  useGetNotificationsQuery, 
  useGetNotificationStatsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDismissNotificationMutation,
  useDeleteNotificationMutation
} from '../features/notifications/notificationsApi';
import { 
  FaBell, FaCheck, FaTrash, FaExclamationTriangle, FaCalendarAlt, 
  FaMoneyBillWave, FaChartLine, FaPiggyBank, FaUsers, FaBullseye,
  FaFilter, FaEyeSlash, FaEnvelopeOpen, FaEnvelope, FaRedo, FaTimes, FaEye
} from 'react-icons/fa';
import type { RootState } from '../app/store';
import type { Notification } from '../features/notifications/notificationsApi';

// Function to decode JWT token
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

const NotificationsPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth?.user);
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [userId, setUserId] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<number>(30000); // 30 seconds
  
  // Extract user ID on component mount
  useEffect(() => {
    console.log('=== NOTIFICATIONS PAGE LOADED ===');
    
    const getUserId = () => {
      // 1. From Redux store
      if (user?.id) {
        console.log('Found userId in Redux:', user.id);
        return user.id;
      }
      
      // 2. From localStorage
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        console.log('Found userId in localStorage:', storedUserId);
        return storedUserId;
      }
      
      // 3. Decode from JWT token
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const payload = decodeJWT(token);
          console.log('Decoded JWT payload:', payload);
          
          if (payload) {
            const userIdFromToken = payload.sub || payload.userId || payload.id || payload.user_id;
            if (userIdFromToken) {
              console.log('Found userId in JWT:', userIdFromToken);
              localStorage.setItem('userId', userIdFromToken);
              return userIdFromToken;
            }
          }
        } catch (e) {
          console.error('Failed to decode token:', e);
        }
      }
      
      console.error('No userId found anywhere');
      return '';
    };
    
    const extractedUserId = getUserId();
    setUserId(extractedUserId);
  }, [user]);

  // RTK Query hooks with polling
  const { data: notifications = [], isLoading, error, refetch } = useGetNotificationsQuery(userId, {
    skip: !userId,
    pollingInterval: pollingInterval, // Auto-refresh
  });

  const { data: stats } = useGetNotificationStatsQuery(userId, {
    skip: !userId,
  });

  // Mutation hooks
  const [markAsRead] = useMarkAsReadMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();
  const [dismissNotification] = useDismissNotificationMutation();
  const [deleteNotification] = useDeleteNotificationMutation();

  // Theme colors matching your design
  const theme = {
    primary: '#FF4D94', // Pink
    gold: '#FFD700',    // Gold
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',
    gray: {
      50: '#F8F9FA',
      100: '#F1F3F5',
      200: '#E9ECEF',
      300: '#DEE2E6',
      400: '#CED4DA',
      500: '#ADB5BD',
      600: '#6C757D',
      700: '#495057',
      800: '#343A40',
      900: '#212529',
    },
  };

  // Enhanced notification type configurations with emoji icons
  const notificationTypes = [
    { value: 'all', label: 'All Types', icon: '🔔', faIcon: <FaBell />, color: theme.primary },
    { value: 'overspending', label: 'Overspending', icon: '💸', faIcon: <FaExclamationTriangle />, color: theme.error },
    { value: 'bill_reminder', label: 'Bill Reminders', icon: '📅', faIcon: <FaCalendarAlt />, color: theme.warning },
    { value: 'recurring_transaction', label: 'Recurring', icon: '🔄', faIcon: <FaMoneyBillWave />, color: theme.info },
    { value: 'goal_milestone', label: 'Goal Milestones', icon: '🎯', faIcon: <FaBullseye />, color: theme.success },
    { value: 'low_balance', label: 'Low Balance', icon: '💰', faIcon: <FaPiggyBank />, color: theme.error },
    { value: 'group_settlement', label: 'Group Settlements', icon: '👥', faIcon: <FaUsers />, color: '#8B5CF6' },
    { value: 'unrealistic_goal', label: 'Goal Warnings', icon: '⚠️', faIcon: <FaChartLine />, color: theme.warning },
  ];

  // Status filters
  const statusFilters = [
    { value: 'all', label: 'All', icon: <FaBell /> },
    { value: 'unread', label: 'Unread', icon: <FaEnvelope /> },
    { value: 'read', label: 'Read', icon: <FaEnvelopeOpen /> },
    { value: 'dismissed', label: 'Dismissed', icon: <FaEyeSlash /> },
  ];

  // NEW: Get notification icon with emoji support
  const getNotificationIcon = (type: string) => {
    const typeInfo = notificationTypes.find(t => t.value === type);
    return typeInfo?.icon || '🔔';
  };

  // NEW: Get notification color
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'overspending':
      case 'low_balance':
        return theme.error;
      case 'unrealistic_goal':
        return theme.warning;
      case 'goal_milestone':
        return theme.success;
      default:
        return theme.info;
    }
  };

  // NEW: Get notification background color
  const getNotificationBgColor = (type: string, isUnread: boolean) => {
    const color = getNotificationColor(type);
    return isUnread ? `${color}10` : 'transparent';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filterStatus !== 'all' && notification.status !== filterStatus) return false;
    if (filterType !== 'all' && notification.type !== filterType) return false;
    return true;
  });

  // Handle mark as read - enhanced with error handling
  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await markAsRead(id).unwrap();
    } catch (error) {
      console.error('Failed to mark as read:', error);
      alert('Failed to mark notification as read');
    }
  };

  // Handle dismiss notification - enhanced with error handling
  const handleDismiss = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await dismissNotification(id).unwrap();
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
      alert('Failed to dismiss notification');
    }
  };

  // Handle delete notification
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this notification?')) {
      try {
        await deleteNotification(id).unwrap();
      } catch (error) {
        console.error('Failed to delete notification:', error);
        alert('Failed to delete notification');
      }
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead(userId).unwrap();
      alert('All notifications marked as read!');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
      alert('Failed to mark all notifications as read');
    }
  };

  // NEW: Handle manual refresh
  const handleRefresh = async () => {
    try {
      await refetch();
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  };

  // NEW: Toggle polling
  const togglePolling = () => {
    setPollingInterval(prev => prev === 0 ? 30000 : 0);
  };

  // Get notification type info
  const getNotificationTypeInfo = (type: string) => {
    return notificationTypes.find(t => t.value === type) || notificationTypes[0];
  };

  // Show loading while extracting user ID
  if (!userId) {
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: 'white',
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: '#FF4D9420',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <FaBell style={{ color: '#FF4D94', fontSize: '32px' }} />
        </div>
        <h3 style={{ color: '#212529', marginBottom: '10px' }}>Authentication Issue</h3>
        <p style={{ color: '#6C757D', marginBottom: '20px' }}>
          User ID not found. Please login again.
        </p>
        <button
          onClick={() => window.location.href = '/login'}
          style={{
            backgroundColor: '#FF4D94',
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 500
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '50px',
            height: '50px',
            border: `3px solid ${theme.primary}20`,
            borderTopColor: theme.primary,
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 20px'
          }} />
          <p style={{ color: theme.gray[600], fontSize: '16px' }}>Loading notifications...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.data?.message || (error as any)?.message || 'Failed to load notifications';
    return (
      <div style={{ 
        padding: '40px', 
        textAlign: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          backgroundColor: `${theme.error}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px'
        }}>
          <FaBell style={{ color: theme.error, fontSize: '32px' }} />
        </div>
        <h3 style={{ color: theme.gray[900], marginBottom: '10px' }}>Error Loading Notifications</h3>
        <p style={{ color: theme.gray[600], marginBottom: '20px' }}>
          {errorMessage}
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            onClick={() => refetch()}
            style={{
              backgroundColor: theme.primary,
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <FaRedo />
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: theme.gray[200],
              color: theme.gray[700],
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: 'white',
      padding: '24px'
    }}>
      {/* Header - Enhanced with refresh button */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '16px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: theme.gray[900],
              margin: 0
            }}>
              Notifications
            </h1>
            {/* NEW: Auto-refresh indicator */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: pollingInterval > 0 ? `${theme.success}15` : `${theme.gray[200]}`,
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: 500,
              color: pollingInterval > 0 ? theme.success : theme.gray[600]
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: pollingInterval > 0 ? theme.success : theme.gray[400],
                animation: pollingInterval > 0 ? 'pulse 2s infinite' : 'none'
              }} />
              {pollingInterval > 0 ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
            </div>
          </div>
          <p style={{
            fontSize: '14px',
            color: theme.gray[600]
          }}>
            {notifications.length} notification{notifications.length !== 1 ? 's' : ''} • {stats?.unread || 0} unread • {stats?.requiresAction || 0} require action
          </p>
        </div>
        
        <div style={{ display: 'flex', gap: '12px' }}>
          {/* NEW: Refresh button */}
          <button
            onClick={handleRefresh}
            style={{
              backgroundColor: 'white',
              color: theme.primary,
              border: `1px solid ${theme.primary}`,
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = theme.primary + '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
            }}
          >
            <FaRedo />
            Refresh
          </button>
          
          <button
            onClick={() => setShowFilters(!showFilters)}
            style={{
              backgroundColor: showFilters ? theme.gold : 'white',
              color: showFilters ? 'white' : theme.gray[700],
              border: `1px solid ${showFilters ? theme.gold : theme.gray[300]}`,
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
          >
            <FaFilter />
            Filters
          </button>
          
          <button
            onClick={handleMarkAllAsRead}
            disabled={stats?.unread === 0}
            style={{
              backgroundColor: stats?.unread ? theme.primary : theme.gray[300],
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: stats?.unread ? 'pointer' : 'not-allowed',
              fontWeight: 500,
              transition: 'background-color 0.2s',
              opacity: stats?.unread ? 1 : 0.7,
            }}
            onMouseEnter={(e) => {
              if (stats?.unread) {
                e.currentTarget.style.backgroundColor = '#E63D84';
              }
            }}
            onMouseLeave={(e) => {
              if (stats?.unread) {
                e.currentTarget.style.backgroundColor = theme.primary;
              }
            }}
          >
            <FaCheck />
            Mark All as Read
          </button>

          {/* NEW: Toggle polling button */}
          <button
            onClick={togglePolling}
            style={{
              backgroundColor: pollingInterval > 0 ? theme.success : theme.gray[200],
              color: pollingInterval > 0 ? 'white' : theme.gray[700],
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
            title={pollingInterval > 0 ? 'Turn off auto-refresh' : 'Turn on auto-refresh (every 30s)'}
          >
            {pollingInterval > 0 ? <FaTimes /> : <FaEye />}
            {pollingInterval > 0 ? 'Stop Auto' : 'Auto-refresh'}
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {stats && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '32px'
        }}>
          {/* Total Notifications */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            borderLeft: `4px solid ${theme.primary}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Total</h3>
              <FaBell style={{ color: theme.primary, fontSize: '20px' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>{stats.total}</p>
          </div>

          {/* Unread Notifications */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            borderLeft: `4px solid ${stats.unread > 0 ? theme.error : theme.success}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Unread</h3>
              <FaEnvelope style={{ color: stats.unread > 0 ? theme.error : theme.success, fontSize: '20px' }} />
            </div>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              color: stats.unread > 0 ? theme.error : theme.success 
            }}>
              {stats.unread}
            </p>
          </div>

          {/* Requires Action */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            borderLeft: `4px solid ${stats.requiresAction > 0 ? theme.warning : theme.gray[400]}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Requires Action</h3>
              <FaExclamationTriangle style={{ 
                color: stats.requiresAction > 0 ? theme.warning : theme.gray[400], 
                fontSize: '20px' 
              }} />
            </div>
            <p style={{ 
              fontSize: '24px', 
              fontWeight: 700, 
              color: stats.requiresAction > 0 ? theme.warning : theme.gray[400]
            }}>
              {stats.requiresAction}
            </p>
          </div>

          {/* Read Notifications */}
          <div style={{
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
            borderLeft: `4px solid ${theme.info}`,
            transition: 'transform 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Read</h3>
              <FaEnvelopeOpen style={{ color: theme.info, fontSize: '20px' }} />
            </div>
            <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>
              {stats.read}
            </p>
          </div>
        </div>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <div style={{
          backgroundColor: theme.gray[50],
          padding: '24px',
          borderRadius: '12px',
          marginBottom: '24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          {/* Status Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.gray[700], fontWeight: 500 }}>
              Status
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {statusFilters.map((status) => (
                <button
                  key={status.value}
                  onClick={() => setFilterStatus(status.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: filterStatus === status.value ? theme.primary : 'white',
                    color: filterStatus === status.value ? 'white' : theme.gray[700],
                    border: `1px solid ${filterStatus === status.value ? theme.primary : theme.gray[300]}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{status.icon}</span>
                  {status.label}
                </button>
              ))}
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '8px', color: theme.gray[700], fontWeight: 500 }}>
              Type
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notificationTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => setFilterType(type.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    backgroundColor: filterType === type.value ? type.color : 'white',
                    color: filterType === type.value ? 'white' : theme.gray[700],
                    border: `1px solid ${filterType === type.value ? type.color : theme.gray[300]}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    fontSize: '14px',
                    transition: 'all 0.2s'
                  }}
                >
                  <span style={{ fontSize: '16px', display: 'flex', alignItems: 'center' }}>
                    {type.icon}
                  </span>
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
              }}
              style={{
                padding: '10px 20px',
                backgroundColor: theme.gray[200],
                color: theme.gray[700],
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.gray[300]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.gray[200]}
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Notifications List - Enhanced with new features */}
      {filteredNotifications.length === 0 ? (
        <div style={{ 
          padding: '48px 24px', 
          textAlign: 'center',
          backgroundColor: theme.gray[50],
          borderRadius: '16px',
          marginTop: '20px'
        }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔔</div>
          <h3 style={{ 
            marginBottom: '12px', 
            color: theme.gray[700],
            fontSize: '24px',
            fontWeight: 600
          }}>
            No notifications found
          </h3>
          <p style={{ 
            color: theme.gray[600], 
            marginBottom: '24px',
            fontSize: '16px',
            maxWidth: '400px',
            margin: '0 auto 24px'
          }}>
            {notifications.length === 0 
              ? "You're all caught up! No notifications to display."
              : "No notifications match your current filters."
            }
          </p>
          {notifications.length > 0 && (
            <button
              onClick={() => {
                setFilterStatus('all');
                setFilterType('all');
              }}
              style={{
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Clear Filters
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          {filteredNotifications.map((notification: Notification) => {
            const typeInfo = getNotificationTypeInfo(notification.type);
            const isUnread = notification.status === 'unread';
            const isDismissed = notification.status === 'dismissed';
            const notificationColor = getNotificationColor(notification.type);
            const bgColor = getNotificationBgColor(notification.type, isUnread);
            
            return (
              <div
                key={notification.id}
                style={{
                  backgroundColor: bgColor,
                  padding: '20px',
                  borderRadius: '12px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                  border: `1px solid ${isUnread ? notificationColor + '40' : theme.gray[200]}`,
                  borderLeft: `4px solid ${notificationColor}`,
                  transition: 'all 0.3s ease',
                  position: 'relative',
                  opacity: isDismissed ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isDismissed) {
                    e.currentTarget.style.transform = 'translateX(4px)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isDismissed) {
                    e.currentTarget.style.transform = 'translateX(0)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.06)';
                  }
                }}
              >
                {/* Unread indicator */}
                {isUnread && (
                  <div style={{
                    position: 'absolute',
                    top: '20px',
                    right: '20px',
                    width: '10px',
                    height: '10px',
                    backgroundColor: notificationColor,
                    borderRadius: '50%',
                    animation: 'pulse 2s infinite'
                  }} />
                )}

                {/* Notification header - Enhanced with emoji */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: `${notificationColor}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: notificationColor,
                    fontSize: '20px'
                  }}>
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 600,
                        color: theme.gray[900],
                        margin: 0
                      }}>
                        {notification.title}
                      </h3>
                      <div style={{
                        fontSize: '12px',
                        color: theme.gray[500],
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        <FaCalendarAlt style={{ fontSize: '10px' }} />
                        {formatDate(notification.createdAt)}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: notificationColor,
                      fontWeight: 500,
                      textTransform: 'capitalize',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      {typeInfo.label}
                    </div>
                  </div>
                </div>

                {/* Notification message */}
                <p style={{
                  fontSize: '14px',
                  color: theme.gray[700],
                  lineHeight: '1.5',
                  marginBottom: '16px'
                }}>
                  {notification.message}
                </p>

                {/* NEW: Action Required badge */}
                {notification.isActionRequired && (
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '4px 12px',
                    backgroundColor: theme.error,
                    color: 'white',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    marginBottom: '16px',
                    marginTop: '-8px'
                  }}>
                    <FaExclamationTriangle />
                    Action Required
                  </div>
                )}

                {/* Action buttons - Enhanced with better styling */}
                <div style={{ 
                  display: 'flex', 
                  gap: '8px',
                  justifyContent: 'flex-end',
                  flexWrap: 'wrap'
                }}>
                  {isUnread && (
                    <button
                      onClick={(e) => handleMarkAsRead(notification.id, e)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '8px 16px',
                        backgroundColor: `${notificationColor}20`,
                        color: notificationColor,
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '13px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${notificationColor}30`}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${notificationColor}20`}
                    >
                      <FaCheck />
                      Mark as Read
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => handleDismiss(notification.id, e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: isDismissed ? theme.gray[400] : theme.gray[200],
                      color: isDismissed ? 'white' : theme.gray[700],
                      border: `1px solid ${isDismissed ? theme.gray[400] : theme.gray[300]}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      if (!isDismissed) {
                        e.currentTarget.style.backgroundColor = theme.gray[300];
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isDismissed) {
                        e.currentTarget.style.backgroundColor = theme.gray[200];
                      }
                    }}
                  >
                    <FaEyeSlash />
                    {isDismissed ? 'Dismissed' : 'Dismiss'}
                  </button>

                  <button
                    onClick={(e) => handleDelete(notification.id, e)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      backgroundColor: theme.error + '20',
                      color: theme.error,
                      border: `1px solid ${theme.error}40`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontWeight: 500,
                      fontSize: '13px',
                      transition: 'all 0.2s'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = theme.error;
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = theme.error + '20';
                      e.currentTarget.style.color = theme.error;
                    }}
                  >
                    <FaTrash />
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CSS for animations */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}
      </style>
    </div>
  );
};

export default NotificationsPage;