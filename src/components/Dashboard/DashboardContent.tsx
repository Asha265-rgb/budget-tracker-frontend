import React from 'react';
import PersonalDashboard from '../../Dashsboards/personal_user/PersonalDashboard';
import BusinessDashboard from '../../Dashsboards/business/BusinessDashboard';
import GroupDashboard from '../../Dashsboards/group/GroupDashboard';

const DashboardContent: React.FC = () => {
  // Initialize with empty strings to handle null values
  let role = localStorage.getItem('userRole') || 'personal';
  let userName = localStorage.getItem('userName') || 'User';
  let userId = localStorage.getItem('userId') || '';

  // Method 2: If not found, try getting from the authSlice stored user
  if (!userId || !userName || role === 'personal') {
    const storedUserStr = localStorage.getItem('budget_tracker_user');
    if (storedUserStr) {
      try {
        const storedUser = JSON.parse(storedUserStr);
        
        // Update values
        if (!userId && storedUser.id) {
          userId = storedUser.id;
          localStorage.setItem('userId', userId);
        }
        
        if ((!userName || userName === 'User') && (storedUser.name || storedUser.firstName)) {
          userName = storedUser.name || storedUser.firstName || 'User';
          localStorage.setItem('userName', userName);
        }
        
        if ((!role || role === 'personal') && storedUser.role) {
          role = storedUser.role;
          localStorage.setItem('userRole', role);
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }

  // Ensure we have non-empty strings
  const safeRole = role || 'personal';
  const safeUserName = userName || 'User';
  const safeUserId = userId || '';

  console.log('Dashboard User Info:', { 
    role: safeRole, 
    userName: safeUserName, 
    userId: safeUserId,
    hasUserId: !!safeUserId 
  });

  // If no userId, show error
  if (!safeUserId) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        backgroundColor: '#fef2f2',
        borderRadius: '8px',
        margin: '2rem'
      }}>
        <h2 style={{ color: '#991b1b' }}>Authentication Error</h2>
        <p style={{ color: '#6b7280' }}>
          User information not found. Please log in again.
        </p>
        <button 
          onClick={() => window.location.href = '/login'}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  const renderDashboard = () => {
    console.log(`Rendering dashboard for: ${safeRole} user`);
    
    switch (safeRole) {
      case 'business':
        // Business users get their own dashboard with props
        return <BusinessDashboard userName={safeUserName} userId={safeUserId} />;
      case 'group':
        // Group users get their own dashboard
        return <GroupDashboard />;
      case 'personal':
      default:
        // Personal users get PersonalDashboard (gets user from Redux)
        return <PersonalDashboard />;
    }
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};

export default DashboardContent;
