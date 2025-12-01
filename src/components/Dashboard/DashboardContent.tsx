import React from 'react';
import PersonalDashboard from './PersonalDashboard';
import BusinessDashboard from './BusinessDashboard';
import GroupDashboard from './GroupDashboard';

const DashboardContent: React.FC = () => {
  // Get user role from localStorage (set during login)
  const role = localStorage.getItem('userRole') || 'personal';
  const userName = localStorage.getItem('userName') || 'User';

  console.log('Current user role:', role); // Debug log

  const renderDashboard = () => {
    switch (role) {
      case 'business':
        return <BusinessDashboard userName={userName} />;
      case 'group':
        return <GroupDashboard userName={userName} />;
      case 'personal':
      default:
        return <PersonalDashboard userName={userName} />;
    }
  };

  return (
    <div>
      {renderDashboard()}
    </div>
  );
};

export default DashboardContent;
