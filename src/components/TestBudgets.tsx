import React, { useState, useEffect } from 'react';
import { budgetsAPI, transactionsAPI } from '../services/api';

interface Budget {
  id: string;
  name: string;
  amount: number;
  spent: number;
  period: string;
  category: string;
  startDate: string;
  endDate: string;
  status: string;
  userId: string;
}

const TestBudgets: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F"; // Your user ID

  // Test data for creating budgets
  const testFoodBudget = {
    name: "Monthly Food Budget",
    amount: 300.00,
    spent: 0,
    period: "monthly",
    category: "food",
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    userId: USER_ID
  };

  const testEntertainmentBudget = {
    name: "Entertainment Budget", 
    amount: 100.00,
    spent: 0,
    period: "monthly",
    category: "entertainment",
    startDate: new Date().toISOString(),
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString(),
    userId: USER_ID
  };

  // Test: Get all budgets for user
  const testGetBudgets = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await budgetsAPI.getUserBudgets(USER_ID);
      setBudgets(response.data);
      console.log('Budgets:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching budgets: ${errorMessage}`);
      console.error('Error fetching budgets:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Create food budget
  const testCreateFoodBudget = async () => {
    setError('');
    try {
      console.log('Creating food budget with data:', testFoodBudget);
      const response = await budgetsAPI.createBudget(testFoodBudget);
      console.log('Food budget created:', response.data);
      alert('Food budget created successfully!');
      testGetBudgets(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating food budget: ${errorMessage}`);
      console.error('Error creating food budget:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create entertainment budget
  const testCreateEntertainmentBudget = async () => {
    setError('');
    try {
      console.log('Creating entertainment budget with data:', testEntertainmentBudget);
      const response = await budgetsAPI.createBudget(testEntertainmentBudget);
      console.log('Entertainment budget created:', response.data);
      alert('Entertainment budget created successfully!');
      testGetBudgets(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating entertainment budget: ${errorMessage}`);
      console.error('Error creating entertainment budget:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Check if transactions affect budget spending
  const testBudgetSpending = async () => {
    try {
      // First, let's see what transactions exist
      const transactionsResponse = await transactionsAPI.getUserTransactions(USER_ID);
      const foodTransactions = transactionsResponse.data.filter(
        t => t.category === 'food' && t.type === 'expense'
      );
      
      const totalFoodSpent = foodTransactions.reduce((sum, t) => sum + t.amount, 0);
      alert(`Total food expenses: $${totalFoodSpent}\nFood transactions: ${foodTransactions.length}`);
      
      console.log('Food transactions:', foodTransactions);
    } catch (error: any) {
      console.error('Error checking budget spending:', error);
    }
  };

  useEffect(() => {
    testGetBudgets();
  }, []);

  // Helper function to calculate budget progress
  const getProgressPercentage = (budget: Budget) => {
    if (budget.amount === 0) return 0;
    return (budget.spent / budget.amount) * 100;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage < 70) return '#4CAF50'; // Green
    if (percentage < 90) return '#FF9800'; // Orange
    return '#F44336'; // Red
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>💰 Budgets API Test</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><small>Budgets will track spending in specific categories</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testCreateFoodBudget} style={{ marginRight: '10px' }}>
          Create Food Budget ($300)
        </button>
        <button onClick={testCreateEntertainmentBudget} style={{ marginRight: '10px' }}>
          Create Entertainment Budget ($100)
        </button>
        <button onClick={testBudgetSpending} style={{ marginRight: '10px' }}>
          Check Spending
        </button>
        <button onClick={testGetBudgets}>
          Refresh Budgets
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <h4>Budgets List ({budgets.length})</h4>
        {budgets.length === 0 && !loading && (
          <p style={{ color: '#666' }}>No budgets found. Create some budgets to see them here.</p>
        )}
        {budgets.map(budget => {
          const progress = getProgressPercentage(budget);
          const progressColor = getProgressColor(progress);
          
          return (
            <div key={budget.id} style={{ 
              border: '1px solid #eee', 
              margin: '10px 0', 
              padding: '15px',
              backgroundColor: '#f9f9f9'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h4 style={{ margin: 0 }}>{budget.name}</h4>
                <span style={{ 
                  padding: '4px 8px', 
                  backgroundColor: budget.status === 'active' ? '#e8f5e8' : '#ffe8e8',
                  color: budget.status === 'active' ? '#2e7d32' : '#c62828',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}>
                  {budget.status}
                </span>
              </div>
              
              <div style={{ marginBottom: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span>Spent: ${budget.spent} / ${budget.amount}</span>
                  <span>{progress.toFixed(1)}%</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '10px',
                  backgroundColor: '#e0e0e0',
                  borderRadius: '5px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${Math.min(progress, 100)}%`,
                    height: '100%',
                    backgroundColor: progressColor,
                    transition: 'width 0.3s ease'
                  }} />
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                <div>
                  <strong>Category:</strong> {budget.category}
                </div>
                <div>
                  <strong>Period:</strong> {budget.period}
                </div>
                <div>
                  <strong>Remaining:</strong> ${(budget.amount - budget.spent).toFixed(2)}
                </div>
                <div>
                  <strong>Dates:</strong> {new Date(budget.startDate).toLocaleDateString()} - {new Date(budget.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestBudgets;