import React, { useState } from 'react';
import { 
  useGetGoalsQuery, 
  useCreateGoalMutation,
  useAddSavingsMutation,
  type Goal
} from '../features/goals/goalsApi'; // Changed import location

const TestGoals: React.FC = () => {
  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";
  
  // RTK Query hooks
  const { data: goals = [], isLoading: goalsLoading, refetch: refetchGoals } = useGetGoalsQuery(USER_ID);
  const [createGoal, { isLoading: creatingGoal }] = useCreateGoalMutation();
  const [addSavings, { isLoading: addingSavings }] = useAddSavingsMutation();
  
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Test data for creating goals - Updated to match your CreateGoalDto interface
  const testVacationGoal = {
    name: "Hawaii Vacation",
    targetAmount: 2000.00,
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    startDate: new Date().toISOString(),
    category: "vacation",
    color: "#4CAF50",
    icon: "🏝️",
    isUnrealistic: false,
    userId: USER_ID
  };

  const testCarGoal = {
    name: "New Car Down Payment", 
    targetAmount: 5000.00,
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
    startDate: new Date().toISOString(),
    category: "car",
    color: "#2196F3",
    icon: "🚗",
    isUnrealistic: false,
    userId: USER_ID
  };

  const testEmergencyFundGoal = {
    name: "Emergency Fund",
    targetAmount: 10000.00,
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString(),
    startDate: new Date().toISOString(),
    category: "savings",
    color: "#FF9800",
    icon: "🛡️",
    isUnrealistic: false,
    userId: USER_ID
  };

  // Test: Create vacation goal
  const testCreateVacationGoal = async () => {
    setError('');
    setSuccess('');
    try {
      await createGoal(testVacationGoal).unwrap();
      setSuccess('Vacation goal created successfully!');
      refetchGoals();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating vacation goal: ${errorMessage}`);
      console.error('Error creating vacation goal:', error);
    }
  };

  // Test: Create car goal
  const testCreateCarGoal = async () => {
    setError('');
    setSuccess('');
    try {
      await createGoal(testCarGoal).unwrap();
      setSuccess('Car goal created successfully!');
      refetchGoals();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating car goal: ${errorMessage}`);
      console.error('Error creating car goal:', error);
    }
  };

  // Test: Create emergency fund goal
  const testCreateEmergencyFundGoal = async () => {
    setError('');
    setSuccess('');
    try {
      await createGoal(testEmergencyFundGoal).unwrap();
      setSuccess('Emergency fund goal created successfully!');
      refetchGoals();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating emergency fund goal: ${errorMessage}`);
      console.error('Error creating emergency fund goal:', error);
    }
  };

  // Test: Add money to first goal - FIXED to match your API signature
  const testAddToGoal = async () => {
    if (goals.length === 0) {
      setError('No goals found. Please create a goal first.');
      return;
    }

    const goal = goals[0]; // Use first goal
    const amount = 500; // Add $500

    setError('');
    setSuccess('');
    try {
      await addSavings({
        goalId: goal.id,
        savings: {
          amount: amount,
          notes: "Test savings"
        }
      }).unwrap();
      
      setSuccess(`Added $${amount} to "${goal.name}"`);
      refetchGoals();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error adding to goal: ${errorMessage}`);
      console.error('Error adding to goal:', error);
    }
  };

  // Helper functions for goal calculations
  const getProgressPercentage = (goal: Goal) => {
    if (goal.targetAmount === 0) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getDaysRemaining = (goal: Goal) => {
    const today = new Date();
    const targetDate = new Date(goal.targetDate);
    const diffTime = targetDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getMonthlySavingsNeeded = (goal: Goal) => {
    const daysRemaining = getDaysRemaining(goal);
    const monthsRemaining = daysRemaining / 30;
    const remainingAmount = goal.targetAmount - goal.currentAmount;
    
    if (monthsRemaining <= 0) return remainingAmount;
    return remainingAmount / monthsRemaining;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #4CAF50', margin: '10px', borderRadius: '8px' }}>
      <h3>🎯 Goals API Test (RTK Query)</h3>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p style={{ fontSize: '12px', margin: '5px 0' }}>Using RTK Query hooks for goals management</p>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testCreateVacationGoal} 
          disabled={creatingGoal}
          style={{ 
            padding: '10px 15px',
            backgroundColor: creatingGoal ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingGoal ? 'not-allowed' : 'pointer'
          }}
        >
          🏝️ Create Vacation Goal ($2,000)
        </button>
        <button 
          onClick={testCreateCarGoal} 
          disabled={creatingGoal}
          style={{ 
            padding: '10px 15px',
            backgroundColor: creatingGoal ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingGoal ? 'not-allowed' : 'pointer'
          }}
        >
          🚗 Create Car Goal ($5,000)
        </button>
        <button 
          onClick={testCreateEmergencyFundGoal} 
          disabled={creatingGoal}
          style={{ 
            padding: '10px 15px',
            backgroundColor: creatingGoal ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: creatingGoal ? 'not-allowed' : 'pointer'
          }}
        >
          🛡️ Create Emergency Fund ($10,000)
        </button>
        <button 
          onClick={testAddToGoal} 
          disabled={addingSavings || goals.length === 0}
          style={{ 
            padding: '10px 15px',
            backgroundColor: addingSavings || goals.length === 0 ? '#ccc' : '#9C27B0',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: addingSavings || goals.length === 0 ? 'not-allowed' : 'pointer'
          }}
        >
          💰 Add $500 to First Goal
        </button>
        <button 
          onClick={refetchGoals} 
          disabled={goalsLoading}
          style={{ 
            padding: '10px 15px',
            backgroundColor: goalsLoading ? '#ccc' : '#607D8B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: goalsLoading ? 'not-allowed' : 'pointer'
          }}
        >
          🔄 Refresh Goals
        </button>
      </div>

      {(goalsLoading || creatingGoal || addingSavings) && (
        <p style={{ color: '#666', textAlign: 'center' }}>Loading...</p>
      )}
      {error && (
        <div style={{ 
          color: '#d32f2f', 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#ffebee',
          borderRadius: '4px',
          border: '1px solid #ef5350'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      {success && (
        <div style={{ 
          color: '#388e3c', 
          marginBottom: '15px', 
          padding: '10px', 
          backgroundColor: '#e8f5e9',
          borderRadius: '4px',
          border: '1px solid #66bb6a'
        }}>
          <strong>Success:</strong> {success}
        </div>
      )}
      
      <div>
        <h4>Goals List ({goals.length})</h4>
        {goals.length === 0 && !goalsLoading && (
          <p style={{ 
            color: '#666', 
            padding: '20px', 
            textAlign: 'center', 
            backgroundColor: '#f8f9fa', 
            borderRadius: '4px' 
          }}>
            No goals found. Create some goals to see them here.
          </p>
        )}
        {(goals as Goal[]).map(goal => {
          const progress = getProgressPercentage(goal);
          const daysRemaining = getDaysRemaining(goal);
          const monthlySavings = getMonthlySavingsNeeded(goal);
          const isCompleted = progress >= 100;
          
          return (
            <div key={goal.id} style={{ 
              border: '1px solid #eee', 
              margin: '15px 0', 
              padding: '20px',
              backgroundColor: '#ffffff',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '32px' }}>{goal.icon || '🎯'}</span>
                  <div>
                    <h4 style={{ margin: 0, color: goal.color || '#333' }}>{goal.name}</h4>
                    <p style={{ margin: '3px 0', color: '#666', fontSize: '14px' }}>{goal.category}</p>
                  </div>
                </div>
                <span style={{ 
                  padding: '6px 14px', 
                  backgroundColor: getStatusColor(goal.status),
                  color: 'white',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: 'bold'
                }}>
                  {goal.status.toUpperCase()}
                </span>
              </div>
              
              {/* Progress Bar */}
              <div style={{ marginBottom: '15px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '16px' }}>
                    ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </span>
                  <span style={{ fontWeight: 'bold', fontSize: '16px', color: isCompleted ? '#4CAF50' : '#333' }}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '14px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '7px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: goal.color || '#4CAF50',
                    transition: 'width 0.3s ease',
                    borderRadius: '7px'
                  }} />
                </div>
              </div>
              
              {/* Goal Details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '15px', 
                fontSize: '14px',
                backgroundColor: '#f8f9fa',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #e0e0e0'
              }}>
                <div>
                  <strong>Remaining:</strong> ${(goal.targetAmount - goal.currentAmount).toFixed(2)}
                </div>
                <div>
                  <strong>Days Left:</strong> {daysRemaining > 0 ? daysRemaining : 'Overdue'}
                </div>
                <div>
                  <strong>Monthly Needed:</strong> ${monthlySavings.toFixed(2)}
                </div>
                <div>
                  <strong>Target Date:</strong> {new Date(goal.targetDate).toLocaleDateString()}
                </div>
              </div>
              
              {isCompleted && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  backgroundColor: '#E8F5E8',
                  border: '2px solid #4CAF50',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  fontSize: '15px',
                  color: '#2E7D32'
                }}>
                  🎉 Goal Completed! Congratulations! 🎉
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestGoals;
