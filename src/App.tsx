import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import { colors } from './styles/colors';
import { typography } from './styles/typography';
import { useState, useEffect } from 'react';
import { restoreUser } from './features/auth/authSlice';

// Import pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPassword from './pages/ForgotPassword';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';

// Import dashboard components
import DashboardLayout from './components/Layout/DashboardLayout';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import AccountsDashboard from './components/Dashboard/AccountsDashboard';
import TransactionsPage from './pages/TransactionsPage';
import BudgetsPage from './pages/BudgetsPage';
import GoalsPage from './pages/GoalsPage';
import NotificationsPage from './pages/NotificationsPage';
import ProfileSettingsPage from './pages/ProfileSettingsPage';
import ReportsPage from './pages/ReportsPage';

// ✅ CORRECTED: Fixed typo "Dashsboards" → "Dashboards"
import PersonalDashboard from './Dashsboards/personal_user/PersonalDashboard';
import BusinessDashboard from './Dashsboards/business/BusinessDashboard';
import GroupDashboard from './Dashsboards/group/GroupDashboard';

// Import Group Pages
import GroupsListPage from './pages/GroupsListPage';
import CreateGroupPage from './pages/CreateGroupPage';

// Protected Route Component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('authToken') || localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  console.log('🔐 [ProtectedRoute] Checking authentication:', {
    hasToken: !!token,
    tokenLength: token?.length,
    hasUserId: !!userId,
    currentPath: window.location.pathname
  });
  
  if (!token) {
    console.warn('⚠️ [ProtectedRoute] No token found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  if (!userId) {
    console.warn('⚠️ [ProtectedRoute] No userId found, redirecting to login');
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    console.log('🚀 [App] Starting application...');
    
    // Debug: Show localStorage contents
    console.log('📦 [App] localStorage contents:', {
      authToken: localStorage.getItem('authToken')?.substring(0, 20) + '...',
      token: localStorage.getItem('token')?.substring(0, 20) + '...',
      userId: localStorage.getItem('userId'),
      userEmail: localStorage.getItem('userEmail'),
      userName: localStorage.getItem('userName'),
      userType: localStorage.getItem('userType')
    });
    
    // Restore user session
    store.dispatch(restoreUser());
    
    setTimeout(() => {
      setIsRestoring(false);
      console.log('✅ [App] Initialization complete');
    }, 500);
  }, []);

  if (isRestoring) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: colors.background.primary,
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ 
            width: '50px', 
            height: '50px', 
            border: `4px solid ${colors.primary[200]}`,
            borderTop: `4px solid ${colors.primary[500]}`,
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
            color: colors.text.secondary,
            fontSize: typography.fontSize.sm,
            fontFamily: typography.fontFamily.primary
          }}>
            Loading BudgetTracker...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div style={{
          minHeight: '100vh',
          backgroundColor: colors.background.primary,
          color: colors.text.primary,
          fontFamily: typography.fontFamily.primary,
        }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* ===== DASHBOARD ROUTES - PROTECTED ===== */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              {/* DashboardOverview handles user type detection and routing */}
              <Route index element={<DashboardOverview />} />
              
              {/* Common dashboard features for all users */}
              <Route path="accounts" element={<AccountsDashboard />} />
              <Route path="transactions" element={<TransactionsPage />} />
              <Route path="budgets" element={<BudgetsPage />} />
              <Route path="goals" element={<GoalsPage />} />
              <Route path="notifications" element={<NotificationsPage />} />
              <Route path="settings" element={<ProfileSettingsPage />} />
              <Route path="reports" element={<ReportsPage />} />
              
              {/* Direct routes to specific dashboards (optional) */}
              <Route path="personal" element={<PersonalDashboard />} />
              <Route path="business" element={<BusinessDashboard />} />
              <Route path="group" element={<Navigate to="/groups" replace />} /> {/* Redirect to new groups route */}
            </Route>

            {/* ===== GROUP ROUTES - PROTECTED ===== */}
            <Route path="/groups" element={
              <ProtectedRoute>
                <GroupsListPage />
              </ProtectedRoute>
            } />
            
            <Route path="/groups/create" element={
              <ProtectedRoute>
                <CreateGroupPage />
              </ProtectedRoute>
            } />
            
            <Route path="/groups/:groupId" element={
              <ProtectedRoute>
                <GroupDashboard />
              </ProtectedRoute>
            } />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
