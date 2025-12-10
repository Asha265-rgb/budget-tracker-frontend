import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetBudgetsQuery } from '../features/budgets/budgetsApi';
import { FaPlus, FaFilter, FaChartLine, FaMoneyBillWave, FaPercent, FaExclamationTriangle } from 'react-icons/fa';
import type { RootState } from '../app/store';
import AddBudgetModal from '../features/budgets/AddBudgetModal';
import BudgetCard from '../features/budgets/BudgetCard';
import type { Budget } from '../features/budgets/budgetsApi';

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

const BudgetsPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth?.user);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [userId, setUserId] = useState<string>('');
  
  // Extract user ID on component mount
  useEffect(() => {
    console.log('=== BUDGETS PAGE LOADED ===');
    
    // Try multiple sources for user ID
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
              localStorage.setItem('userId', userIdFromToken); // Store for future
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

  // Fetch budgets using RTK Query - Removed unused 'error' variable
  const { data: budgets = [], isLoading } = useGetBudgetsQuery(userId, {
    skip: !userId,
  });

  // Theme colors
  const theme = {
    primary: '#FF4D94',
    gold: '#FFD700',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const calculateBudgetStats = () => {
    if (!budgets.length) return null;
    
    const activeBudgets = budgets.filter(b => b.status === 'active');
    const totalBudgetAmount = activeBudgets.reduce((sum, b) => sum + b.amount, 0);
    const totalSpent = activeBudgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudgetAmount - totalSpent;
    const overallProgress = totalBudgetAmount > 0 ? (totalSpent / totalBudgetAmount) * 100 : 0;
    const overspentBudgets = activeBudgets.filter(b => b.spent > b.amount).length;
    
    return {
      totalBudgetAmount,
      totalSpent,
      totalRemaining,
      overallProgress,
      activeCount: activeBudgets.length,
      overspentCount: overspentBudgets,
    };
  };

  const statsData = calculateBudgetStats();

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
          <FaChartLine style={{ color: '#FF4D94', fontSize: '32px' }} />
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
          <p style={{ color: theme.gray[600], fontSize: '16px' }}>Loading budgets...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AddBudgetModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        userId={userId}
      />

      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'white',
        padding: '24px'
      }}>
        {/* HEADER WITH CREATE BUDGET BUTTON */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px'
        }}>
          <div>
            <h1 style={{
              fontSize: '28px',
              fontWeight: 700,
              color: theme.gray[900],
              marginBottom: '4px'
            }}>
              Budgets
            </h1>
            <p style={{
              fontSize: '14px',
              color: theme.gray[600]
            }}>
              {budgets.length} budget{budgets.length !== 1 ? 's' : ''} • {statsData?.activeCount || 0} active
            </p>
          </div>
          
          {/* THIS IS THE CRITICAL PART - CREATE BUDGET BUTTON */}
          <div style={{ 
            display: 'flex', 
            gap: '12px',
            backgroundColor: '#F8F9FA',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #E9ECEF'
          }}>
            <button
              onClick={() => setShowFilters(!showFilters)}
              style={{
                backgroundColor: showFilters ? theme.gold : 'white',
                color: showFilters ? 'white' : theme.gray[700],
                border: `2px solid ${showFilters ? theme.gold : theme.gray[300]}`,
                padding: '10px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                transition: 'all 0.2s',
                minWidth: '120px'
              }}
              onMouseEnter={(e) => {
                if (!showFilters) {
                  e.currentTarget.style.borderColor = theme.gold;
                  e.currentTarget.style.color = theme.gold;
                }
              }}
              onMouseLeave={(e) => {
                if (!showFilters) {
                  e.currentTarget.style.borderColor = theme.gray[300];
                  e.currentTarget.style.color = theme.gray[700];
                }
              }}
            >
              <FaFilter />
              Filters
            </button>
            
            {/* THIS IS THE CREATE BUDGET BUTTON */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '16px',
                transition: 'all 0.2s',
                minWidth: '180px',
                boxShadow: '0 4px 12px rgba(255, 77, 148, 0.3)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E63D84';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(255, 77, 148, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary;
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 148, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FaPlus style={{ fontSize: '18px' }} />
              <span style={{ whiteSpace: 'nowrap' }}>Create Budget</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        {statsData && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              borderLeft: `4px solid ${theme.primary}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Total Budget</h3>
                <FaMoneyBillWave style={{ color: theme.primary, fontSize: '20px' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>{formatCurrency(statsData.totalBudgetAmount)}</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              borderLeft: `4px solid ${theme.info}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Total Spent</h3>
                <FaChartLine style={{ color: theme.info, fontSize: '20px' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>{formatCurrency(statsData.totalSpent)}</p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              borderLeft: `4px solid ${statsData.overallProgress <= 100 ? theme.success : theme.error}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Overall Progress</h3>
                <FaPercent style={{ 
                  color: statsData.overallProgress <= 100 ? theme.success : theme.error, 
                  fontSize: '20px' 
                }} />
              </div>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: statsData.overallProgress <= 100 ? theme.success : theme.error 
              }}>
                {statsData.overallProgress.toFixed(1)}%
              </p>
            </div>

            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              borderLeft: `4px solid ${statsData.overspentCount > 0 ? theme.error : theme.success}`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Overspent</h3>
                <FaExclamationTriangle style={{ 
                  color: statsData.overspentCount > 0 ? theme.error : theme.success, 
                  fontSize: '20px' 
                }} />
              </div>
              <p style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: statsData.overspentCount > 0 ? theme.error : theme.success 
              }}>
                {statsData.overspentCount} budget{statsData.overspentCount !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )}

        {/* Budgets List */}
        {budgets.length === 0 ? (
          <div style={{ 
            padding: '60px 24px', 
            textAlign: 'center',
            backgroundColor: theme.gray[50],
            borderRadius: '16px',
            marginTop: '20px'
          }}>
            <FaChartLine style={{ 
              fontSize: '64px', 
              color: theme.gray[400],
              marginBottom: '20px' 
            }} />
            <h3 style={{ 
              marginBottom: '12px', 
              color: theme.gray[700],
              fontSize: '24px',
              fontWeight: 600
            }}>
              No budgets yet
            </h3>
            <p style={{ 
              color: theme.gray[600], 
              marginBottom: '24px',
              fontSize: '16px',
              maxWidth: '400px',
              margin: '0 auto 24px'
            }}>
              Create your first budget to start tracking your spending habits
            </p>
            {/* THIS IS ANOTHER CREATE BUDGET BUTTON */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                padding: '14px 32px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                margin: '0 auto',
                boxShadow: '0 4px 16px rgba(255, 77, 148, 0.3)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E63D84';
                e.currentTarget.style.boxShadow = '0 6px 24px rgba(255, 77, 148, 0.4)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = theme.primary;
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(255, 77, 148, 0.3)';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <FaPlus style={{ fontSize: '18px' }} />
              Create Your First Budget
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '20px',
            marginTop: '20px'
          }}>
            {budgets.map((budget: Budget) => (
              <BudgetCard key={budget.id} budget={budget} />
            ))}
          </div>
        )}

        {/* CSS for animations */}
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    </>
  );
};
 
export default BudgetsPage;