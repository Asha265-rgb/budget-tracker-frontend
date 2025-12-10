import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetGoalsQuery, useGetGoalStatsQuery, useCreateGoalMutation } from '../features/goals/goalsApi';
import { 
  FaPlus, FaFilter, FaBullseye, FaMoneyBillWave, FaCalendarAlt, 
  FaChartLine, FaPiggyBank, FaExclamationTriangle,
  FaRunning, FaHome, FaCar, FaGraduationCap, FaPlane, FaGift
} from 'react-icons/fa';
import type { RootState } from '../app/store';
import type { Goal } from '../features/goals/goalsApi';
import AddGoalModal from '../features/goals/AddGoalModal';
import GoalDetailsModal from '../features/goals/GoalDetailsModal';

// Function to decode JWT token (same as BudgetsPage)
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

const GoalsPage: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth?.user);
  const [showFilters, setShowFilters] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null); // Changed from selectedGoalId
  const [userId, setUserId] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Add create goal mutation
  const [createGoal, { isLoading: isCreatingGoal }] = useCreateGoalMutation();
  
  // Extract user ID on component mount
  useEffect(() => {
    console.log('=== GOALS PAGE LOADED ===');
    
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

  // Fetch goals and stats using RTK Query
  const { data: goals = [], isLoading, error, refetch } = useGetGoalsQuery(userId, {
    skip: !userId,
  });

  const { data: goalStats } = useGetGoalStatsQuery(userId, {
    skip: !userId,
  });

  // Handle goal submission
  const handleGoalSubmit = async (goalData: any) => {
    try {
      await createGoal(goalData).unwrap();
      refetch(); // Refresh goals list
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to create goal:', error);
      return Promise.reject(error);
    }
  };

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

  // Goal categories with icons
  const goalCategories = [
    { value: 'all', label: 'All Goals', icon: <FaBullseye />, color: theme.primary },
    { value: 'vacation', label: 'Vacation', icon: <FaPlane />, color: '#3B82F6' },
    { value: 'car', label: 'Car', icon: <FaCar />, color: '#EF4444' },
    { value: 'home', label: 'Home', icon: <FaHome />, color: '#8B5CF6' },
    { value: 'education', label: 'Education', icon: <FaGraduationCap />, color: '#10B981' },
    { value: 'emergency', label: 'Emergency Fund', icon: <FaExclamationTriangle />, color: '#F59E0B' },
    { value: 'retirement', label: 'Retirement', icon: <FaRunning />, color: '#6B7280' },
    { value: 'wedding', label: 'Wedding', icon: '💍', color: '#EC4899' },
    { value: 'other', label: 'Other', icon: <FaGift />, color: '#FF4D94' },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date();
    const target = new Date(targetDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const getProgressPercentage = (goal: Goal) => {
    if (goal.targetAmount === 0) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getMonthlySavingsNeeded = (goal: Goal) => {
    const daysRemaining = getDaysRemaining(goal.targetDate);
    const monthsRemaining = Math.max(1, daysRemaining / 30);
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    if (remainingAmount <= 0) return 0;
    return remainingAmount / monthsRemaining;
  };

  // Filter goals by category
  const filteredGoals = selectedCategory === 'all' 
    ? goals 
    : goals.filter(goal => goal.category === selectedCategory);

  // Handle goal click
  const handleGoalClick = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  // Handle adding savings from card
  const handleAddSavingsClick = (goal: Goal, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    setSelectedGoal(goal);
    setIsDetailsModalOpen(true);
  };

  // Callbacks for GoalDetailsModal
  const handleGoalUpdated = () => {
    refetch(); // Refresh goals list
    setIsDetailsModalOpen(false);
  };

  const handleGoalDeleted = () => {
    refetch(); // Refresh goals list
    setIsDetailsModalOpen(false);
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
          <FaBullseye style={{ color: '#FF4D94', fontSize: '32px' }} />
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
          <p style={{ color: theme.gray[600], fontSize: '16px' }}>Loading your goals...</p>
        </div>
      </div>
    );
  }

  if (error) {
    const errorMessage = (error as any)?.data?.message || (error as any)?.message || 'Failed to load goals';
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
          <FaBullseye style={{ color: theme.error, fontSize: '32px' }} />
        </div>
        <h3 style={{ color: theme.gray[900], marginBottom: '10px' }}>Error Loading Goals</h3>
        <p style={{ color: theme.gray[600], marginBottom: '20px' }}>
          {errorMessage}
        </p>
        <button
          onClick={() => refetch()}
          style={{
            backgroundColor: theme.primary,
            color: 'white',
            border: 'none',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Modals */}
      <AddGoalModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleGoalSubmit}
        isLoading={isCreatingGoal}
        userId={userId}
      />

      {selectedGoal && (
        <GoalDetailsModal
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          goal={selectedGoal} // FIXED: Pass goal object, not goalId
          onGoalUpdated={handleGoalUpdated}
          onGoalDeleted={handleGoalDeleted}
        />
      )}

      <div style={{ 
        minHeight: '100vh',
        backgroundColor: 'white',
        padding: '24px'
      }}>
        {/* Header */}
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
              Goals
            </h1>
            <p style={{
              fontSize: '14px',
              color: theme.gray[600]
            }}>
              {goals.length} goal{goals.length !== 1 ? 's' : ''} • {goalStats?.activeGoals || 0} active
            </p>
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
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
              onClick={() => setIsAddModalOpen(true)}
              style={{
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                transition: 'background-color 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E63D84'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
            >
              <FaPlus />
              Create Goal
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        {goalStats && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '16px',
            marginBottom: '32px'
          }}>
            {/* Total Goals */}
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
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Total Goals</h3>
                <FaBullseye style={{ color: theme.primary, fontSize: '20px' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>{goalStats.totalGoals}</p>
            </div>

            {/* Total Saved */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              borderLeft: `4px solid ${theme.success}`,
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Total Saved</h3>
                <FaPiggyBank style={{ color: theme.success, fontSize: '20px' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>{formatCurrency(goalStats.totalCurrentAmount)}</p>
            </div>

            {/* Overall Progress */}
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
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Overall Progress</h3>
                <FaChartLine style={{ color: theme.info, fontSize: '20px' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: theme.info }}>
                {goalStats.totalProgress.toFixed(1)}%
              </p>
            </div>

            {/* Active Goals */}
            <div style={{
              backgroundColor: 'white',
              padding: '20px',
              borderRadius: '12px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
              borderLeft: `4px solid ${theme.warning}`,
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h3 style={{ fontSize: '14px', color: theme.gray[600], fontWeight: 600, marginBottom: '8px' }}>Active Goals</h3>
                <FaRunning style={{ color: theme.warning, fontSize: '20px' }} />
              </div>
              <p style={{ fontSize: '24px', fontWeight: 700, color: theme.gray[900] }}>
                {goalStats.activeGoals}
              </p>
            </div>
          </div>
        )}

        {/* Category Filter Tabs */}
        <div style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '24px',
          overflowX: 'auto',
          paddingBottom: '8px'
        }}>
          {goalCategories.map((category) => (
            <button
              key={category.value}
              onClick={() => setSelectedCategory(category.value)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 16px',
                backgroundColor: selectedCategory === category.value ? category.color : 'white',
                color: selectedCategory === category.value ? 'white' : theme.gray[700],
                border: `1px solid ${selectedCategory === category.value ? category.color : theme.gray[300]}`,
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500,
                fontSize: '14px',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                if (selectedCategory !== category.value) {
                  e.currentTarget.style.borderColor = category.color;
                  e.currentTarget.style.color = category.color;
                }
              }}
              onMouseLeave={(e) => {
                if (selectedCategory !== category.value) {
                  e.currentTarget.style.borderColor = theme.gray[300];
                  e.currentTarget.style.color = theme.gray[700];
                }
              }}
            >
              <span style={{ fontSize: '16px' }}>{category.icon}</span>
              {category.label}
            </button>
          ))}
        </div>

        {/* Goals Grid */}
        {filteredGoals.length === 0 ? (
          <div style={{ 
            padding: '48px 24px', 
            textAlign: 'center',
            color: theme.gray[500]
          }}>
            <FaBullseye style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }} />
            <h3 style={{ marginBottom: '8px', color: theme.gray[700] }}>No goals yet</h3>
            <p>Create your first goal to start saving for the future</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              style={{
                marginTop: '16px',
                backgroundColor: theme.primary,
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 500
              }}
            >
              Create Your First Goal
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
            gap: '20px'
          }}>
            {filteredGoals.map((goal: Goal) => {
              const progress = getProgressPercentage(goal);
              const daysRemaining = getDaysRemaining(goal.targetDate);
              const monthlySavings = getMonthlySavingsNeeded(goal);
              const isCompleted = goal.status === 'completed';
              const isOverdue = daysRemaining === 0 && !isCompleted;
              
              // Get category color
              const categoryInfo = goalCategories.find(cat => cat.value === goal.category) || goalCategories[goalCategories.length - 1];
              
              return (
                <div
                  key={goal.id}
                  onClick={() => handleGoalClick(goal)}
                  style={{
                    backgroundColor: 'white',
                    padding: '24px',
                    borderRadius: '16px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
                    border: `1px solid ${theme.gray[200]}`,
                    transition: 'all 0.3s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.08)';
                  }}
                >
                  {/* Status badge */}
                  <div style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    backgroundColor: isCompleted ? theme.success : isOverdue ? theme.error : categoryInfo.color,
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    {isCompleted ? 'Completed' : isOverdue ? 'Overdue' : 'Active'}
                  </div>

                  {/* Goal header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      backgroundColor: `${categoryInfo.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: categoryInfo.color,
                      fontSize: '20px'
                    }}>
                      {categoryInfo.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontSize: '18px',
                        fontWeight: 600,
                        color: theme.gray[900],
                        marginBottom: '4px'
                      }}>
                        {goal.name}
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: theme.gray[600]
                      }}>
                        {categoryInfo.label}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div style={{ marginBottom: '20px' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '8px'
                    }}>
                      <span style={{ fontSize: '14px', color: theme.gray[600] }}>Progress</span>
                      <span style={{ fontSize: '16px', fontWeight: 600, color: theme.gray[900] }}>
                        {progress.toFixed(1)}%
                      </span>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: theme.gray[200],
                      borderRadius: '4px',
                      overflow: 'hidden'
                    }}>
                      <div style={{
                        width: `${Math.min(progress, 100)}%`,
                        height: '100%',
                        backgroundColor: isCompleted ? theme.success : categoryInfo.color,
                        borderRadius: '4px',
                        transition: 'width 0.3s ease'
                      }} />
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                      fontSize: '12px',
                      color: theme.gray[500]
                    }}>
                      <span>{formatCurrency(goal.currentAmount)} saved</span>
                      <span>{formatCurrency(goal.targetAmount)} target</span>
                    </div>
                  </div>

                  {/* Goal details */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '20px'
                  }}>
                    <div style={{
                      backgroundColor: theme.gray[50],
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <FaCalendarAlt style={{ color: theme.gray[600], marginBottom: '4px' }} />
                      <div style={{ fontSize: '12px', color: theme.gray[600]}}>Target Date</div>
                      <div style={{ fontSize: '14px', fontWeight: 600, color: theme.gray[900] }}>
                        {formatDate(goal.targetDate)}
                      </div>
                    </div>
                    <div style={{
                      backgroundColor: theme.gray[50],
                      padding: '12px',
                      borderRadius: '8px',
                      textAlign: 'center'
                    }}>
                      <FaMoneyBillWave style={{ color: theme.gray[600], marginBottom: '4px' }} />
                      <div style={{ fontSize: '12px', color: theme.gray[600] }}>
                        {daysRemaining > 0 ? 'Days Left' : 'Days Overdue'}
                      </div>
                      <div style={{ 
                        fontSize: '14px', 
                        fontWeight: 600, 
                        color: daysRemaining > 0 ? theme.success : theme.error 
                      }}>
                        {Math.abs(daysRemaining)}
                      </div>
                    </div>
                  </div>

                  {/* Monthly savings needed */}
                  {!isCompleted && monthlySavings > 0 && (
                    <div style={{
                      backgroundColor: theme.gray[50],
                      padding: '12px',
                      borderRadius: '8px',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <FaChartLine style={{ color: theme.info }} />
                      <div>
                        <div style={{ fontSize: '12px', color: theme.gray[600] }}>Monthly savings needed</div>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: theme.gray[900] }}>
                          {formatCurrency(monthlySavings)}/month
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action buttons */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={(e) => handleAddSavingsClick(goal, e)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        backgroundColor: theme.primary,
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E63D84'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary}
                    >
                      Add Savings
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGoalClick(goal);
                      }}
                      style={{
                        padding: '10px 16px',
                        backgroundColor: 'white',
                        color: theme.gray[700],
                        border: `1px solid ${theme.gray[300]}`,
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: '14px',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = theme.gray[100];
                        e.currentTarget.style.borderColor = theme.gray[400];
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'white';
                        e.currentTarget.style.borderColor = theme.gray[300];
                      }}
                    >
                      Details
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
          `}
        </style>
      </div>
    </>
  );
};

export default GoalsPage;