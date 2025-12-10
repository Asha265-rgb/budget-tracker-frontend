// src/components/Layout/DashboardLayout.tsx - FIXED VERSION
import React, { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../../features/auth/authSlice';
import { 
  FaHome, 
  FaCreditCard, 
  FaExchangeAlt, 
  FaChartPie,
  FaBullseye,
  FaUsers,
  FaChartBar,
  FaBell,
  FaCog,
  FaUser,
  FaBuilding,
  FaUserFriends,
  FaSignOutAlt
} from 'react-icons/fa';

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user, token } = useSelector((state: any) => state.auth);
  
  useEffect(() => {
    if (!token) {
      console.log('🔒 No token found, redirecting to login');
      navigate('/login');
    }
  }, [token, navigate]);

  if (!token) {
    return null;
  }

  const userName = user?.name || 'User';
  const userEmail = user?.email || '';
  const userRole = user?.role || 'personal';

  const getNavItems = () => {
    const baseItems = [
      { path: '/dashboard', label: 'Overview', icon: <FaHome /> },
      { path: '/dashboard/accounts', label: 'Accounts', icon: <FaCreditCard /> },
      { path: '/dashboard/transactions', label: 'Transactions', icon: <FaExchangeAlt /> },
      { path: '/dashboard/budgets', label: 'Budgets', icon: <FaChartPie /> },
      { path: '/dashboard/goals', label: 'Goals', icon: <FaBullseye /> },
      { path: '/dashboard/reports', label: 'Reports', icon: <FaChartBar /> },
      { path: '/dashboard/notifications', label: 'Notifications', icon: <FaBell /> },
    ];

    if (userRole === 'group') {
      baseItems.splice(3, 0, { path: '/dashboard/groups', label: 'Groups', icon: <FaUsers /> });
    }

    return baseItems;
  };

  const navItems = getNavItems();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  const getUserIcon = () => {
    switch(userRole) {
      case 'business': return <FaBuilding />;
      case 'group': return <FaUserFriends />;
      default: return <FaUser />;
    }
  };

  const getUserRoleLabel = () => {
    switch(userRole) {
      case 'business': return 'Business User';
      case 'group': return 'Group User';
      default: return 'Personal User';
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', position: 'relative' }}>
      {/* Sidebar */}
      <div style={{
        width: '260px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '2px 0 8px rgba(0, 0, 0, 0.05)',
        position: 'relative',
        zIndex: 10,
      }}>
        {/* Logo */}
        <div style={{ 
          padding: '28px 24px',
          borderBottom: '1px solid #F1F3F5'
        }}>
          <h2 style={{ 
            fontSize: '22px', 
            fontWeight: 700, 
            color: '#FF4D94',
            marginBottom: '4px',
            fontFamily: "'Inter', sans-serif"
          }}>
            💰 BudgetTracker
          </h2>
          <p style={{ 
            fontSize: '12px', 
            color: '#6C757D',
            fontFamily: "'Inter', sans-serif"
          }}>
            Financial Freedom
          </p>
        </div>

        {/* User Info */}
        <div style={{ 
          padding: '24px',
          borderBottom: '1px solid #F1F3F5'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#FF4D94',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '18px',
              fontWeight: 600
            }}>
              {getUserIcon()}
            </div>
            <div>
              <p style={{ 
                fontSize: '14px', 
                fontWeight: 600,
                color: '#212529',
                marginBottom: '2px'
              }}>
                {userName}
              </p>
              <p style={{ 
                fontSize: '12px', 
                color: '#6C757D',
                marginBottom: '2px'
              }}>
                {userEmail}
              </p>
              <p style={{ 
                fontSize: '11px', 
                color: '#6C757D',
                backgroundColor: '#F1F3F5',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-block'
              }}>
                {getUserRoleLabel()}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav style={{ 
          flex: 1,
          padding: '20px 0'
        }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || 
                           (location.pathname.startsWith(item.path) && item.path !== '/dashboard');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 24px',
                  color: isActive ? '#FFFFFF' : '#495057',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "'Inter', sans-serif",
                  background: isActive ? 'linear-gradient(135deg, #FFD700, #FFA500)' : 'transparent',
                  borderLeft: '4px solid transparent',
                  transition: 'all 0.2s ease',
                  margin: '4px 0',
                  borderRadius: isActive ? '0 8px 8px 0' : '0',
                  pointerEvents: 'auto', // ✅ Ensured clicks work
                  cursor: 'pointer',
                  position: 'relative',
                  zIndex: 20,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = '#FFF0F6';
                    e.currentTarget.style.color = '#FF4D94';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#495057';
                  }
                }}
              >
                <span style={{ 
                  fontSize: '16px',
                  opacity: isActive ? 1 : 0.7,
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Settings & Logout */}
        <div style={{ 
          padding: '20px 24px',
          borderTop: '1px solid #F1F3F5'
        }}>
          <Link
            to="/dashboard/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              color: '#495057',
              textDecoration: 'none',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              borderRadius: '6px',
              transition: 'all 0.2s ease',
              marginBottom: '12px',
              pointerEvents: 'auto',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8F9FA';
              e.currentTarget.style.color = '#FF4D94';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#495057';
            }}
          >
            <FaCog />
            Settings
          </Link>
          
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 16px',
              color: '#495057',
              backgroundColor: 'transparent',
              border: '1px solid #E9ECEF',
              borderRadius: '6px',
              fontSize: '14px',
              fontFamily: "'Inter', sans-serif",
              cursor: 'pointer',
              width: '100%',
              transition: 'all 0.2s ease',
              pointerEvents: 'auto',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#FFF0F6';
              e.currentTarget.style.color = '#FF4D94';
              e.currentTarget.style.borderColor = '#FF4D94';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#495057';
              e.currentTarget.style.borderColor = '#E9ECEF';
            }}
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ 
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#F8F9FA',
        position: 'relative',
        zIndex: 1,
      }}>
        <div style={{
          flex: 1,
          padding: '32px',
          overflowY: 'auto',
        }}>
          <Outlet />
        </div>
      </div>

      {/* REMOVED: Modal Container that was blocking clicks */}
      {/* If you need modals, they should be rendered conditionally and with proper z-index */}
    </div>
  );
};

export default DashboardLayout;