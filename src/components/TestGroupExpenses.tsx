import React, { useState, useEffect } from 'react';
import { groupsAPI, groupExpensesAPI, groupMembersAPI } from '../services/api';

interface Group {
  id: string;
  name: string;
}

interface GroupMember {
  id: string;
  userId: string;
  user?: {
    firstName: string;
    lastName: string;
  };
}

interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  splitType: string;
  status: string;
  paidBy: string;
  groupId: string;
}

const TestGroupExpenses: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: 'food',
    splitType: 'equal'
  });

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // Fetch user's groups
  const fetchUserGroups = async () => {
    setLoading(true);
    try {
      const response = await groupsAPI.getUserGroups(USER_ID);
      setGroups(response.data);
    } catch (err: any) {
      setError(`Failed to fetch groups: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch group members
  const fetchGroupMembers = async (groupId: string) => {
    if (!groupId) return;
    try {
      const response = await groupMembersAPI.getGroupMembers(groupId);
      setGroupMembers(response.data);
    } catch (err: any) {
      console.error('Error fetching group members:', err);
    }
  };

  // Fetch group expenses
  const fetchGroupExpenses = async (groupId: string) => {
    if (!groupId) return;
    setLoading(true);
    try {
      const response = await groupExpensesAPI.getGroupExpenses(groupId);
      setExpenses(response.data);
    } catch (err: any) {
      setError(`Failed to fetch expenses: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create test expense
  const testCreateExpense = async () => {
    if (!selectedGroupId) {
      setError('Please select a group first');
      return;
    }

    if (!expenseData.description || !expenseData.amount) {
      setError('Please fill in description and amount');
      return;
    }

    setLoading(true);
    try {
      const expense = {
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: new Date().toISOString(),
        splitType: expenseData.splitType,
        paidBy: USER_ID,
        groupId: selectedGroupId
      };

      const response = await groupExpensesAPI.createExpense(expense);
      setSuccess(`Expense "${response.data.description}" created successfully!`);
      setExpenseData({ description: '', amount: '', category: 'food', splitType: 'equal' });
      await fetchGroupExpenses(selectedGroupId);
    } catch (err: any) {
      setError(`Failed to create expense: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupMembers(selectedGroupId);
      fetchGroupExpenses(selectedGroupId);
    }
  }, [selectedGroupId]);

  return (
    <div style={{ padding: '20px', border: '2px solid #10B981', margin: '10px', borderRadius: '8px' }}>
      <h3>💸 Group Expenses API Test</h3>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchUserGroups} disabled={loading}>
          🔄 Refresh Groups
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px' }}>Success: {success}</div>}

      {/* Group Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Select Group</h4>
        <select 
          value={selectedGroupId} 
          onChange={(e) => setSelectedGroupId(e.target.value)}
          style={{ padding: '8px', width: '300px' }}
        >
          <option value="">Select a group...</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      {/* Create Expense Form */}
      {selectedGroupId && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h4>Create New Expense</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              type="text"
              placeholder="Description"
              value={expenseData.description}
              onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
              style={{ padding: '8px', width: '200px' }}
            />
            <input
              type="number"
              placeholder="Amount"
              value={expenseData.amount}
              onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
              style={{ padding: '8px', width: '120px' }}
            />
            <select
              value={expenseData.category}
              onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
              style={{ padding: '8px' }}
            >
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="other">Other</option>
            </select>
            <select
              value={expenseData.splitType}
              onChange={(e) => setExpenseData({...expenseData, splitType: e.target.value})}
              style={{ padding: '8px' }}
            >
              <option value="equal">Equal Split</option>
              <option value="percentage">Percentage</option>
              <option value="custom">Custom</option>
            </select>
            <button onClick={testCreateExpense} disabled={loading}>
              💰 Create Expense
            </button>
          </div>
          <p style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
            Group Members: {groupMembers.length} | This expense will be split {expenseData.splitType}
          </p>
        </div>
      )}

      {/* Expenses List */}
      {selectedGroupId && (
        <div>
          <h4>Group Expenses ({expenses.length})</h4>
          {expenses.length === 0 ? (
            <p>No expenses found. Create an expense to see it here.</p>
          ) : (
            expenses.map(expense => (
              <div key={expense.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                margin: '10px 0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ margin: 0 }}>{expense.description}</h5>
                    <p style={{ margin: '5px 0' }}>
                      Amount: <strong>${expense.amount}</strong> | 
                      Category: <strong>{expense.category}</strong> | 
                      Split: <strong>{expense.splitType}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                      Date: {new Date(expense.date).toLocaleDateString()} | 
                      Status: {expense.status} | 
                      Paid by: {expense.paidBy}
                    </p>
                  </div>
                  <span style={{ 
                    padding: '4px 8px',
                    backgroundColor: expense.status === 'pending' ? '#F59E0B' : '#10B981',
                    color: 'white',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    {expense.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TestGroupExpenses;