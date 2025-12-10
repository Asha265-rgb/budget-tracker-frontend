import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Toaster } from 'sonner';
import { Link } from 'react-router-dom';
import type { RootState } from '../../app/store';

import PersonalDashboard from '../../Dashsboards/personal_user/PersonalDashboard';
import BusinessDashboard from '../../Dashsboards/business/BusinessDashboard';
import GroupsListPage from '../../pages/GroupsListPage';

// Import Lucide icons for groups display
import { Users, Plus, ArrowRight, RefreshCw } from 'lucide-react'; // Removed TrendingUp, DollarSign
import { useGetGroupsQuery } from '../../features/groups/groupsApi'; // Fixed import path

// Loading spinner component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f9fafb',
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '50px', 
        height: '50px', 
        border: '4px solid #e5e7eb',
        borderTop: '4px solid #3b82f6',
        borderRadius: '50%',
        margin: '0 auto 20px',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
      <p style={{ 
        color: '#6b7280',
        fontSize: '16px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        Loading your dashboard...
      </p>
    </div>
  </div>
);

// Groups Preview Component (NEW)
const GroupsPreview: React.FC = () => {
  const { data: groupsData, isLoading, refetch } = useGetGroupsQuery();
  const groups = groupsData || [];
  
  const handleRefresh = () => {
    refetch();
  };
  
  if (isLoading) {
    return (
      <div className="p-4 bg-white border rounded-xl">
        <div className="text-center py-4">
          <div className="h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading groups...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white border rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Groups</h3>
          <p className="text-sm text-gray-600">
            {groups.length} group{groups.length !== 1 ? 's' : ''} •{' '}
            <Link to="/groups" className="text-blue-600 hover:text-blue-700">
              View all
            </Link>
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            title="Refresh groups"
          >
            <RefreshCw size={18} />
          </button>
          <Link
            to="/groups/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            New Group
          </Link>
        </div>
      </div>
      
      {groups.length > 0 ? (
        <div className="space-y-3">
          {groups.slice(0, 3).map((group: any) => (
            <Link
              key={group.id}
              to={`/groups/${group.id}`}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">{group.name}</p>
                  <p className="text-xs text-gray-600">
                    {group.memberCount || 0} member{group.memberCount !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
          
          {groups.length > 3 && (
            <div className="text-center pt-2 border-t">
              <Link 
                to="/groups" 
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                View {groups.length - 3} more groups →
              </Link>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-6">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-3">You don't have any groups yet</p>
          <Link
            to="/groups/create"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center gap-2 text-sm"
          >
            <Plus size={16} />
            Create Your First Group
          </Link>
        </div>
      )}
    </div>
  );
};

const DashboardOverview: React.FC = () => {
  const { user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  
  const [detectedUserType, setDetectedUserType] = useState<string>('personal');
  const [detectedUserName, setDetectedUserName] = useState<string>('User');
  const [isDetecting, setIsDetecting] = useState(true);
  
  const { data: groupsData } = useGetGroupsQuery();
  const groups = groupsData || [];

  useEffect(() => {
    console.log('🔍 DashboardOverview: Starting user detection...');
    console.log('📊 Redux Auth State:', { user, authLoading });

    const detectUserType = () => {
      // METHOD 1: Use Redux user data (most reliable)
      if (user) {
        console.log('✅ Using Redux user data:', user);
        setDetectedUserType(user.userType?.toLowerCase() || 'personal');
        setDetectedUserName(
          user.firstName || 
          user.name || 
          user.email?.split('@')[0] || 
          'User'
        );
        setIsDetecting(false);
        return;
      }

      // METHOD 2: Check localStorage as fallback
      console.log('🔄 Redux user not available, checking localStorage...');
      
      // Check multiple localStorage keys
      const userTypeFromStorage = 
        localStorage.getItem('userType') ||
        localStorage.getItem('user_type') ||
        localStorage.getItem('role');
      
      const userNameFromStorage = 
        localStorage.getItem('userName') ||
        localStorage.getItem('user_name') ||
        localStorage.getItem('firstName') ||
        localStorage.getItem('email')?.split('@')[0] ||
        'User';

      if (userTypeFromStorage) {
        console.log('✅ Found user type in localStorage:', userTypeFromStorage);
        setDetectedUserType(userTypeFromStorage.toLowerCase());
        setDetectedUserName(userNameFromStorage);
        setIsDetecting(false);
        return;
      }

      // METHOD 3: Check budget_tracker_user object
      const storedUser = localStorage.getItem('budget_tracker_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.userType) {
            console.log('✅ Found user in budget_tracker_user:', parsedUser);
            setDetectedUserType(parsedUser.userType.toLowerCase());
            setDetectedUserName(
              parsedUser.firstName || 
              parsedUser.name || 
              parsedUser.email?.split('@')[0] || 
              'User'
            );
            setIsDetecting(false);
            return;
          }
        } catch (error) {
          console.error('❌ Error parsing budget_tracker_user:', error);
        }
      }

      // METHOD 4: Check email pattern as last resort
      const userEmail = 
        localStorage.getItem('userEmail') || 
        localStorage.getItem('email') || 
        '';
      
      console.log('📧 Checking email pattern:', userEmail);
      
      if (userEmail.includes('business') || userEmail.includes('biz') || userEmail.includes('company')) {
        console.log('🏢 Email indicates BUSINESS user');
        setDetectedUserType('business');
      } else if (userEmail.includes('group') || userEmail.includes('team') || userEmail.includes('org')) {
        console.log('👥 Email indicates GROUP user');
        setDetectedUserType('group');
      } else {
        console.log('👤 Defaulting to PERSONAL user');
        setDetectedUserType('personal');
      }
      
      setDetectedUserName(userEmail.split('@')[0] || 'User');
      setIsDetecting(false);
    };

    // Start detection with a small delay
    const timer = setTimeout(detectUserType, 100);
    return () => clearTimeout(timer);
  }, [user, authLoading]);

  // Show loading state
  if (authLoading || isDetecting) {
    return <LoadingSpinner />;
  }

  // If no user is detected at all
  if (!user && !localStorage.getItem('token') && !localStorage.getItem('budget_tracker_user')) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f9fafb',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
            Please Sign In
          </h1>
          <p style={{ color: '#64748b', marginBottom: '24px' }}>
            You need to be logged in to access your dashboard.
          </p>
          <button
            onClick={() => window.location.href = '/login'}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  // Determine final user type and name
  const finalUserType = user?.userType?.toLowerCase() || detectedUserType;
  const finalUserName = 
    user?.firstName || 
    user?.name || 
    detectedUserName || 
    'User';

  console.log(`🎯 DashboardOverview: User type = ${finalUserType}`);
  console.log(`📋 User Details:`, { 
    userType: finalUserType, 
    userName: finalUserName,
    hasReduxUser: !!user,
    hasLocalStorageToken: !!localStorage.getItem('token'),
    groupsCount: groups.length
  });

  // ========== ENHANCED RENDER LOGIC ==========
  const renderDashboard = () => {
    switch (finalUserType) {
      case 'group':
      case 'group_member':
        console.log('👥 Rendering GroupsListPage for group user');
        return <GroupsListPage />;
      
      case 'business':
        console.log('🏢 Loading BusinessDashboard');
        return (
          <>
            <BusinessDashboard />
            {/* Show groups preview for business users too */}
            {groups.length > 0 && (
              <div className="max-w-6xl mx-auto px-4">
                <GroupsPreview />
              </div>
            )}
          </>
        );
      
      case 'personal':
      default:
        console.log('👤 Loading PersonalDashboard');
        return (
          <>
            <PersonalDashboard />
            {/* Show groups preview for personal users */}
            <div className="max-w-6xl mx-auto px-4 mt-8">
              <GroupsPreview />
            </div>
          </>
        );
    }
  };

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-gray-50">
        {/* Welcome Header (only for personal/business users) */}
        {finalUserType !== 'group' && (
          <div className="bg-white border-b">
            <div className="max-w-6xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    Welcome back, {finalUserName}!
                  </h1>
                  <p className="text-gray-600 mt-1">
                    {finalUserType === 'business' ? 'Business Dashboard' : 'Personal Dashboard'}
                    {groups.length > 0 && ` • ${groups.length} group${groups.length !== 1 ? 's' : ''}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    finalUserType === 'business' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {finalUserType.charAt(0).toUpperCase() + finalUserType.slice(1)} User
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Main Dashboard Content */}
        {renderDashboard()}
      </div>
    </>
  );
};

export default DashboardOverview;