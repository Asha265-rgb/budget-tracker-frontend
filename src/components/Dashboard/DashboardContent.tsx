import React from 'react';
import PersonalDashboard from '../../Dashsboards/personal_user/PersonalDashboard';
import BusinessDashboard from '../../Dashsboards/business/BusinessDashboard';
import GroupDashboard from '../../Dashsboards/group/GroupDashboard';

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
