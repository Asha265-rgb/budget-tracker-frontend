import React, { useState, useEffect } from 'react';
import { goalsAPI } from '../services/api';

interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  startDate: string;
  status: string;
  category?: string;
  color?: string;
  icon?: string;
  userId: string;
}

const TestGoals: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F"; // Your user ID

  // Test data for creating goals
  const testVacationGoal = {
    name: "Hawaii Vacation",
    targetAmount: 2000.00,
    currentAmount: 0,
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
    startDate: new Date().toISOString(),
    category: "vacation",
    color: "#4CAF50",
    icon: "🏝️",
    userId: USER_ID
  };

  const testCarGoal = {
    name: "New Car Down Payment", 
    targetAmount: 5000.00,
    currentAmount: 0,
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 2)).toISOString(),
    startDate: new Date().toISOString(),
    category: "car",
    color: "#2196F3",
    icon: "🚗",
    userId: USER_ID
  };

  const testEmergencyFundGoal = {
    name: "Emergency Fund",
    targetAmount: 10000.00,
    currentAmount: 0,
    targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 3)).toISOString(),
    startDate: new Date().toISOString(),
    category: "savings",
    color: "#FF9800",
    icon: "🛡️",
    userId: USER_ID
  };

  // Test: Get all goals for user
  const testGetGoals = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await goalsAPI.getUserGoals(USER_ID);
      setGoals(response.data);
      console.log('Goals:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching goals: ${errorMessage}`);
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Create vacation goal
  const testCreateVacationGoal = async () => {
    setError('');
    try {
      console.log('Creating vacation goal with data:', testVacationGoal);
      const response = await goalsAPI.createGoal(testVacationGoal);
      console.log('Vacation goal created:', response.data);
      alert('Vacation goal created successfully!');
      testGetGoals(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating vacation goal: ${errorMessage}`);
      console.error('Error creating vacation goal:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create car goal
  const testCreateCarGoal = async () => {
    setError('');
    try {
      console.log('Creating car goal with data:', testCarGoal);
      const response = await goalsAPI.createGoal(testCarGoal);
      console.log('Car goal created:', response.data);
      alert('Car goal created successfully!');
      testGetGoals(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating car goal: ${errorMessage}`);
      console.error('Error creating car goal:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create emergency fund goal
  const testCreateEmergencyFundGoal = async () => {
    setError('');
    try {
      console.log('Creating emergency fund goal with data:', testEmergencyFundGoal);
      const response = await goalsAPI.createGoal(testEmergencyFundGoal);
      console.log('Emergency fund goal created:', response.data);
      alert('Emergency fund goal created successfully!');
      testGetGoals(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating emergency fund goal: ${errorMessage}`);
      console.error('Error creating emergency fund goal:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Add money to first goal
  const testAddToGoal = async () => {
    if (goals.length === 0) {
      alert('No goals found. Please create a goal first.');
      return;
    }

    const goal = goals[0]; // Use first goal
    const amount = 500; // Add $500

    try {
      // This would require a PATCH endpoint - for now we'll just show the calculation
      const newAmount = goal.currentAmount + amount;
      const newProgress = (newAmount / goal.targetAmount) * 100;
      
      alert(`Added $${amount} to "${goal.name}"\nNew total: $${newAmount}\nProgress: ${newProgress.toFixed(1)}%`);
      
      console.log(`Would update goal ${goal.id} with +$${amount}`);
      
      // Refresh to see if backend auto-updates
      testGetGoals();
    } catch (error: any) {
      console.error('Error adding to goal:', error);
      alert('Error adding to goal. Check console for details.');
    }
  };

  useEffect(() => {
    testGetGoals();
  }, []);

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
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🎯 Goals API Test</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><small>Goals help you save for specific targets with visual progress tracking</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testCreateVacationGoal} style={{ marginRight: '10px', marginBottom: '10px' }}>
          🏝️ Create Vacation Goal ($2,000)
        </button>
        <button onClick={testCreateCarGoal} style={{ marginRight: '10px', marginBottom: '10px' }}>
          🚗 Create Car Goal ($5,000)
        </button>
        <button onClick={testCreateEmergencyFundGoal} style={{ marginRight: '10px', marginBottom: '10px' }}>
          🛡️ Create Emergency Fund ($10,000)
        </button>
        <button onClick={testAddToGoal} style={{ marginRight: '10px', marginBottom: '10px' }}>
          💰 Add $500 to First Goal
        </button>
        <button onClick={testGetGoals}>
          🔄 Refresh Goals
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <h4>Goals List ({goals.length})</h4>
        {goals.length === 0 && !loading && (
          <p style={{ color: '#666' }}>No goals found. Create some goals to see them here.</p>
        )}
        {goals.map(goal => {
          const progress = getProgressPercentage(goal);
          const daysRemaining = getDaysRemaining(goal);
          const monthlySavings = getMonthlySavingsNeeded(goal);
          const isCompleted = progress >= 100;
          
          return (
            <div key={goal.id} style={{ 
              border: '1px solid #eee', 
              margin: '15px 0', 
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{goal.icon || '🎯'}</span>
                  <div>
                    <h4 style={{ margin: 0, color: goal.color || '#333' }}>{goal.name}</h4>
                    <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>{goal.category}</p>
                  </div>
                </div>
                <span style={{ 
                  padding: '4px 12px', 
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
                  <span style={{ fontWeight: 'bold' }}>
                    ${goal.currentAmount.toFixed(2)} / ${goal.targetAmount.toFixed(2)}
                  </span>
                  <span style={{ fontWeight: 'bold', color: isCompleted ? '#4CAF50' : '#333' }}>
                    {progress.toFixed(1)}%
                  </span>
                </div>
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '6px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: goal.color || '#4CAF50',
                    transition: 'width 0.3s ease',
                    borderRadius: '6px'
                  }} />
                </div>
              </div>
              
              {/* Goal Details */}
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr', 
                gap: '15px', 
                fontSize: '14px',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #eee'
              }}>
                <div>
                  <strong>Remaining:</strong> ${(goal.targetAmount - goal.currentAmount).toFixed(2)}
                </div>
                <div>
                  <strong>Days Left:</strong> {daysRemaining}
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
                  marginTop: '10px',
                  padding: '10px',
                  backgroundColor: '#E8F5E8',
                  border: '1px solid #4CAF50',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontWeight: 'bold',
                  color: '#2E7D32'
                }}>
                  🎉 Goal Completed! Congratulations!
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
