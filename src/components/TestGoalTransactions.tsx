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
  notes?: string;
  isUnrealistic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

interface GoalTransaction {
  id: string;
  amount: number;
  date: string;
  notes?: string;
  type: 'savings' | 'withdrawal';
  goalId: string;
  linkedTransactionId?: string;
  createdAt: string;
  updatedAt: string;
}

const TestGoalTransactions: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalTransactions, setGoalTransactions] = useState<GoalTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [selectedGoalId, setSelectedGoalId] = useState<string>('');
  const [savingsAmount, setSavingsAmount] = useState<string>('');
  const [savingsNotes, setSavingsNotes] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  // Use a test user ID or get from auth context
  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // Test: Get all goals for user
  const testGetGoals = async () => {
    setLoading(true);
    setError('');
    try {
      console.log('Fetching goals for user:', USER_ID);
      const response = await goalsAPI.getUserGoals(USER_ID);
      setGoals(response.data);
      console.log('Goals fetched successfully:', response.data);
      
      // Auto-select first goal if available
      if (response.data.length > 0 && !selectedGoalId) {
        setSelectedGoalId(response.data[0].id);
        // Auto-load transactions for the first goal
        testGetGoalTransactions(response.data[0].id);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching goals: ${errorMessage}`);
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Get transactions for a specific goal
  const testGetGoalTransactions = async (goalId: string) => {
    if (!goalId) {
      setError('Please select a goal first');
      return;
    }

    setLoading(true);
    try {
      console.log('Fetching transactions for goal:', goalId);
      const response = await goalsAPI.getGoalTransactions(goalId);
      setGoalTransactions(response.data);
      console.log(`Transactions for goal ${goalId}:`, response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching goal transactions: ${errorMessage}`);
      console.error('Error fetching goal transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Add savings to a goal
  const testAddSavings = async () => {
    if (!selectedGoalId) {
      setError('Please select a goal first');
      return;
    }

    if (!savingsAmount || isNaN(parseFloat(savingsAmount)) || parseFloat(savingsAmount) <= 0) {
      setError('Please enter a valid positive amount');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const amount = parseFloat(savingsAmount);
      console.log('Adding savings to goal:', selectedGoalId, 'Amount:', amount);
      
      const response = await goalsAPI.addSavings(selectedGoalId, { 
        amount, 
        notes: savingsNotes || `Savings contribution on ${new Date().toLocaleDateString()}` 
      });
      
      console.log('Savings added successfully:', response.data);
      setSuccessMessage(`Successfully added $${amount} to goal!`);
      
      // Refresh data
      setSavingsAmount('');
      setSavingsNotes('');
      await testGetGoals();
      await testGetGoalTransactions(selectedGoalId);
      
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error adding savings: ${errorMessage}`);
      console.error('Error adding savings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Get goal progress
  const testGetGoalProgress = async () => {
    setLoading(true);
    try {
      console.log('Fetching goal progress for user:', USER_ID);
      const response = await goalsAPI.getGoalProgress(USER_ID);
      console.log('Goal progress:', response.data);
      setSuccessMessage(`Goal progress calculated! Check console for details.`);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching goal progress: ${errorMessage}`);
      console.error('Error fetching goal progress:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Create a test goal first if none exist
  const testCreateSampleGoal = async () => {
    setLoading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const sampleGoal = {
        name: "New Car Fund",
        targetAmount: 25000,
        currentAmount: 5000,
        targetDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
        startDate: new Date().toISOString(),
        category: "vehicle",
        color: "#3B82F6",
        icon: "🚗",
        // Remove userId - let backend handle from auth context
      };

      console.log('Creating sample goal:', sampleGoal);
      const response = await goalsAPI.createGoal(sampleGoal);
      console.log('Sample goal created:', response.data);
      setSuccessMessage('Sample goal created successfully!');
      
      // Refresh goals list
      await testGetGoals();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating sample goal: ${errorMessage}`);
      console.error('Error creating sample goal:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions
  const getGoalProgress = (goal: Goal): number => {
    if (goal.targetAmount === 0) return 0;
    return (goal.currentAmount / goal.targetAmount) * 100;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#607D8B';
    }
  };

  const getTransactionTypeColor = (type: string) => {
    switch (type) {
      case 'savings': return '#4CAF50';
      case 'withdrawal': return '#F44336';
      default: return '#607D8B';
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // Load goals on component mount
  useEffect(() => {
    testGetGoals();
  }, []);

  // Auto-load transactions when goal is selected
  useEffect(() => {
    if (selectedGoalId) {
      testGetGoalTransactions(selectedGoalId);
    }
  }, [selectedGoalId]);

  return (
    <div style={{ padding: '20px', border: '2px solid #3B82F6', margin: '10px', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
      <h3 style={{ color: '#3B82F6', marginBottom: '15px' }}>🎯 Goal Transactions API Test</h3>
      
      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><small>Track savings contributions and withdrawals for your financial goals</small></p>
      </div>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button 
          onClick={testGetGoals} 
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#3B82F6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🔄 Refresh Goals
        </button>
        <button 
          onClick={testGetGoalProgress} 
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#8B5CF6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          📊 Get Progress
        </button>
        <button 
          onClick={testCreateSampleGoal} 
          disabled={loading}
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#F59E0B', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🚗 Create Sample Goal
        </button>
      </div>

      {loading && (
        <div style={{ padding: '10px', textAlign: 'center', color: '#3B82F6' }}>
          Loading...
        </div>
      )}
      
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {successMessage && (
        <div style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>
          <strong>Success:</strong> {successMessage}
        </div>
      )}

      {/* Goals Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Select Goal ({goals.length} available)</h4>
        {goals.length === 0 && !loading && (
          <div style={{ color: '#666', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px' }}>
            <p>No goals found. Create a sample goal to get started.</p>
          </div>
        )}
        
        {goals.length > 0 && (
          <div style={{ marginBottom: '15px' }}>
            <select 
              value={selectedGoalId} 
              onChange={(e) => setSelectedGoalId(e.target.value)}
              style={{ 
                padding: '8px', 
                width: '300px', 
                marginRight: '10px',
                border: '1px solid #ddd',
                borderRadius: '4px'
              }}
            >
              <option value="">Select a goal...</option>
              {goals.map(goal => (
                <option key={goal.id} value={goal.id}>
                  {goal.name} - {getGoalProgress(goal).toFixed(1)}% complete
                </option>
              ))}
            </select>
            <button 
              onClick={() => testGetGoalTransactions(selectedGoalId)}
              disabled={!selectedGoalId || loading}
              style={{ 
                padding: '8px 15px',
                backgroundColor: '#10B981',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: !selectedGoalId || loading ? 'not-allowed' : 'pointer'
              }}
            >
              📋 Get Transactions
            </button>
          </div>
        )}

        {/* Selected Goal Info */}
        {selectedGoalId && goals.find(g => g.id === selectedGoalId) && (
          <div style={{ 
            border: '1px solid #ddd', 
            padding: '15px', 
            borderRadius: '8px',
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            {(() => {
              const goal = goals.find(g => g.id === selectedGoalId)!;
              const progress = getGoalProgress(goal);
              return (
                <div>
                  <h4 style={{ margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{goal.icon}</span>
                    <span>{goal.name}</span>
                    <span style={{ 
                      fontSize: '12px', 
                      padding: '2px 8px', 
                      backgroundColor: getStatusColor(goal.status),
                      color: 'white',
                      borderRadius: '12px'
                    }}>
                      {goal.status}
                    </span>
                  </h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '5px 0' }}>
                        <strong>Progress:</strong> {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)} 
                        ({progress.toFixed(1)}%)
                      </p>
                      <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                        Target: {formatDate(goal.targetDate)} | Started: {formatDate(goal.startDate)}
                      </p>
                      {goal.category && (
                        <p style={{ margin: '5px 0', fontSize: '12px', color: '#666' }}>
                          Category: {goal.category}
                        </p>
                      )}
                    </div>
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      borderRadius: '50%', 
                      background: `conic-gradient(#4CAF50 ${progress}%, #e0e0e0 0%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      border: '3px solid white',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {progress.toFixed(0)}%
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Add Savings Form */}
      <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#ffffff' }}>
        <h4>Add Savings Contribution</h4>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <input
            type="number"
            placeholder="Amount"
            value={savingsAmount}
            onChange={(e) => setSavingsAmount(e.target.value)}
            style={{ padding: '8px', width: '120px', border: '1px solid #ddd', borderRadius: '4px' }}
            min="0"
            step="0.01"
          />
          <input
            type="text"
            placeholder="Notes (optional)"
            value={savingsNotes}
            onChange={(e) => setSavingsNotes(e.target.value)}
            style={{ padding: '8px', width: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
          />
          <button 
            onClick={testAddSavings}
            disabled={!selectedGoalId || !savingsAmount || loading}
            style={{ 
              padding: '8px 15px',
              backgroundColor: !selectedGoalId || !savingsAmount || loading ? '#ccc' : '#4CAF50', 
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: !selectedGoalId || !savingsAmount || loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Adding...' : '💰 Add Savings'}
          </button>
        </div>
      </div>

      {/* Goal Transactions List */}
      <div>
        <h4>Goal Transactions ({goalTransactions.length})</h4>
        {goalTransactions.length === 0 && selectedGoalId && !loading && (
          <div style={{ color: '#666', padding: '15px', textAlign: 'center', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
            No transactions found for this goal. Add some savings to see them here.
          </div>
        )}
        {goalTransactions.map(transaction => (
          <div key={transaction.id} style={{ 
            border: '1px solid #eee', 
            margin: '10px 0', 
            padding: '15px',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
              <div>
                <h4 style={{ margin: 0, marginBottom: '5px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {transaction.type === 'savings' ? '💰 Savings' : '💸 Withdrawal'}
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: getTransactionTypeColor(transaction.type),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {transaction.type}
                  </span>
                </h4>
                <p style={{ margin: 0, color: '#666' }}>
                  <strong>Amount:</strong> {formatCurrency(transaction.amount)}
                  {transaction.notes && <span> | <strong>Notes:</strong> {transaction.notes}</span>}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: getTransactionTypeColor(transaction.type) }}>
                  {transaction.type === 'savings' ? '+' : '-'}{formatCurrency(transaction.amount)}
                </div>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  {formatDate(transaction.date)}
                </div>
              </div>
            </div>
            <div style={{ fontSize: '12px', color: '#888', borderTop: '1px solid #f0f0f0', paddingTop: '8px' }}>
              Transaction ID: {transaction.id} | 
              Created: {formatDate(transaction.createdAt)}
              {transaction.linkedTransactionId && (
                <span> | Linked to transaction: {transaction.linkedTransactionId}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestGoalTransactions;