// src/Dashsboards/group/TestGroupExpenses.tsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { 
  useGetGroupsQuery,
  useGetGroupMembersQuery,
  type Group,
} from '../../features/groups/groupsApi';

// Since useGetGroupExpensesQuery and useCreateGroupExpenseMutation don't exist yet,
// we'll use the axios API directly
import { expenseAPI } from '../../services/api';

// Define the GroupExpense type locally since it's not exported from groupsApi
interface GroupExpense {
  id: string;
  groupId: string;
  description: string;
  amount: number;
  category: string;
  paidById: string;
  splitMethod: string;
  participants: string[];
  amounts?: Record<string, number>;
  date: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const TestGroupExpenses: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: 'food',
    splitType: 'equal' as 'equal' | 'unequal' | 'percentage' | 'custom'
  });

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // RTK Query hooks
  const { data: groups = [], isLoading: groupsLoading, refetch: refetchGroups } = useGetGroupsQuery();

  const { data: groupMembers = [], isLoading: membersLoading } = useGetGroupMembersQuery(selectedGroupId, {
    skip: !selectedGroupId
  });

  const [creatingExpense, setCreatingExpense] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Fetch expenses using axios API
  const fetchExpenses = async () => {
    if (!selectedGroupId) return;
    
    setLoadingExpenses(true);
    try {
      const response = await expenseAPI.getGroupExpenses(selectedGroupId);
      setExpenses(response.data.expenses || []);
    } catch (err: any) {
      console.error('Failed to fetch expenses:', err);
      setExpenses([]);
    } finally {
      setLoadingExpenses(false);
    }
  };

  // Create test expense using axios API
  const testCreateExpense = async () => {
    if (!selectedGroupId) {
      setError('Please select a group first');
      return;
    }

    if (!expenseData.description || !expenseData.amount) {
      setError('Please fill in description and amount');
      return;
    }

    setError('');
    setSuccess('');
    setCreatingExpense(true);
    
    try {
      const expense = {
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        splitMethod: expenseData.splitType,
        paidById: USER_ID,
        participants: groupMembers.map((m: any) => m.userId || m.id),
      };

      await expenseAPI.createExpense(selectedGroupId, expense);
      setSuccess(`Expense "${expense.description}" created successfully!`);
      setExpenseData({ description: '', amount: '', category: 'food', splitType: 'equal' });
      fetchExpenses(); // Refresh expenses
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Unknown error';
      setError(`Failed to create expense: ${errorMessage}`);
    } finally {
      setCreatingExpense(false);
    }
  };

  // Auto-select first group on load
  useEffect(() => {
    if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, selectedGroupId]);

  // Fetch expenses when group changes
  useEffect(() => {
    if (selectedGroupId) {
      fetchExpenses();
    }
  }, [selectedGroupId]);

  const loading = groupsLoading || membersLoading || loadingExpenses || creatingExpense;

  return (
    <div style={{ padding: '20px', border: '2px solid #10B981', margin: '10px', borderRadius: '8px' }}>
      <h3>💸 Group Expenses API Test (RTK Query + Axios)</h3>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => refetchGroups()} 
          disabled={groupsLoading} 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#10B981', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: groupsLoading ? 'not-allowed' : 'pointer',
            marginRight: '10px'
          }}
        >
          🔄 Refresh Groups
        </button>
        <button 
          onClick={fetchExpenses} 
          disabled={!selectedGroupId || loadingExpenses} 
          style={{ 
            padding: '10px 15px', 
            backgroundColor: '#3B82F6', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: !selectedGroupId || loadingExpenses ? 'not-allowed' : 'pointer'
          }}
        >
          🔄 Refresh Expenses
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6', borderRadius: '4px' }}>Error: {error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e6ffe6', borderRadius: '4px' }}>Success: {success}</div>}

      {/* Group Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Select Group ({groups.length} available)</h4>
        <select 
          value={selectedGroupId} 
          onChange={(e) => setSelectedGroupId(e.target.value)} 
          style={{ 
            padding: '8px', 
            width: '300px', 
            border: '1px solid #ddd', 
            borderRadius: '4px' 
          }}
        >
          <option value="">Select a group...</option>
          {groups.map((group: Group) => (
            <option key={group.id} value={group.id}>{group.name}</option>
          ))}
        </select>
      </div>

      {/* Create Expense Form */}
      {selectedGroupId && (
        <div style={{ marginBottom: '20px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
          <h4>Create New Expense</h4>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Description" 
              value={expenseData.description} 
              onChange={(e) => setExpenseData({...expenseData, description: e.target.value})} 
              style={{ 
                padding: '8px', 
                width: '200px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }} 
            />
            <input 
              type="number" 
              placeholder="Amount" 
              value={expenseData.amount} 
              onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})} 
              style={{ 
                padding: '8px', 
                width: '120px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }} 
              min="0" 
              step="0.01" 
            />
            <select 
              value={expenseData.category} 
              onChange={(e) => setExpenseData({...expenseData, category: e.target.value})} 
              style={{ 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="food">Food</option>
              <option value="transport">Transport</option>
              <option value="entertainment">Entertainment</option>
              <option value="utilities">Utilities</option>
              <option value="other">Other</option>
            </select>
            <select 
              value={expenseData.splitType} 
              onChange={(e) => setExpenseData({...expenseData, splitType: e.target.value as 'equal' | 'unequal' | 'percentage' | 'custom'})} 
              style={{ 
                padding: '8px', 
                border: '1px solid #ddd', 
                borderRadius: '4px' 
              }}
            >
              <option value="equal">Equal Split</option>
              <option value="percentage">Percentage</option>
              <option value="custom">Custom</option>
            </select>
            <button 
              onClick={testCreateExpense} 
              disabled={loading || !expenseData.description || !expenseData.amount} 
              style={{ 
                padding: '8px 15px', 
                backgroundColor: !expenseData.description || !expenseData.amount ? '#ccc' : '#10B981', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px', 
                cursor: !expenseData.description || !expenseData.amount ? 'not-allowed' : 'pointer' 
              }}
            >
              {creatingExpense ? 'Creating...' : '💰 Create Expense'}
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
          {expenses.length === 0 && !loadingExpenses ? (
            <p style={{ color: '#666', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              No expenses found. Create an expense to see it here.
            </p>
          ) : (
            expenses.map((expense: GroupExpense) => (
              <div 
                key={expense.id} 
                style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  margin: '10px 0', 
                  borderRadius: '8px', 
                  backgroundColor: '#ffffff', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h5 style={{ margin: 0, marginBottom: '5px' }}>{expense.description}</h5>
                    <p style={{ margin: '5px 0' }}>
                      Amount: <strong>${expense.amount.toFixed(2)}</strong> | 
                      Category: <strong>{expense.category}</strong> | 
                      Split: <strong>{expense.splitMethod || 'N/A'}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                      Date: {new Date(expense.date || expense.createdAt).toLocaleDateString()} | 
                      Status: {expense.status || 'N/A'} | 
                      Paid by: {expense.paidById || 'N/A'}
                    </p>
                  </div>
                  <span 
                    style={{ 
                      padding: '4px 8px', 
                      backgroundColor: expense.status === 'pending' ? '#F59E0B' : '#10B981', 
                      color: 'white', 
                      borderRadius: '4px', 
                      fontSize: '12px', 
                      fontWeight: 'bold' 
                    }}
                  >
                    {expense.status || 'N/A'}
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
