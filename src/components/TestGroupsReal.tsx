import React, { useState, useEffect } from 'react';
import { groupsAPI } from '../services/api';

interface Group {
  id: string;
  name: string;
  description?: string;
  status: string;
  currency: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupExpense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  splitType: string;
  receiptUrl?: string;
  notes?: string;
  status: string;
  paidBy: string | {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

const TestGroupsComprehensive: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [expenses, setExpenses] = useState<GroupExpense[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const [expenseData, setExpenseData] = useState({
    description: '',
    amount: '',
    category: 'food',
    splitType: 'equal'
  });

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // 1. TEST: Get user's groups
  const testGetUserGroups = async () => {
    setLoading(true);
    setError('');
    setDebugInfo('');
    try {
      setDebugInfo(`Calling: GET /groups/user/${USER_ID}`);
      const response = await groupsAPI.getUserGroups(USER_ID);
      
      setGroups(response.data);
      setDebugInfo(`Response: ${JSON.stringify(response.data, null, 2)}`);
      
      if (response.data.length === 0) {
        setError('No groups found for this user. Try creating a group first.');
      } else {
        setSuccess(`Found ${response.data.length} groups!`);
        // Auto-select the first group
        if (response.data.length > 0 && !selectedGroupId) {
          setSelectedGroupId(response.data[0].id);
        }
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      setError(`GET /groups/user/:userId failed (Status: ${status}): ${errorMsg}`);
      setDebugInfo(`Full error: ${JSON.stringify(err.response?.data || err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // 2. TEST: Create group
  const testCreateGroup = async () => {
    setLoading(true);
    setError('');
    setDebugInfo('');
    try {
      const groupData = {
        name: `Test Group ${new Date().toLocaleTimeString()}`,
        description: 'Automated test group creation',
        currency: 'USD',
        userId: USER_ID
      };
      
      setDebugInfo(`Calling: POST /groups with data: ${JSON.stringify(groupData, null, 2)}`);
      const response = await groupsAPI.createGroup(groupData);
      
      setDebugInfo(`Create response: ${JSON.stringify(response.data, null, 2)}`);
      setSuccess(`Group "${response.data.name}" created successfully with ID: ${response.data.id}`);
      
      // Refresh the groups list
      await testGetUserGroups();
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      setError(`POST /groups failed (Status: ${status}): ${errorMsg}`);
      setDebugInfo(`Full error: ${JSON.stringify(err.response?.data || err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // 3. TEST: Get single group details
  const testGetGroupDetails = async (groupId: string) => {
    if (!groupId) return;
    
    setLoading(true);
    setError('');
    setDebugInfo('');
    try {
      setDebugInfo(`Calling: GET /groups/${groupId}`);
      const response = await groupsAPI.getGroup(groupId);
      
      setSelectedGroup(response.data);
      setDebugInfo(`Group details: ${JSON.stringify(response.data, null, 2)}`);
      setSuccess(`Loaded group: ${response.data.name}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      setError(`GET /groups/:id failed (Status: ${status}): ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  // 4. TEST: Add member to group
  const testAddMember = async () => {
    if (!selectedGroupId) {
      setError('Please select a group first');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo('');
    try {
      const memberData = { userId: USER_ID, role: 'member' };
      setDebugInfo(`Calling: POST /groups/${selectedGroupId}/members with data: ${JSON.stringify(memberData)}`);
      
      const response = await groupsAPI.addMember(selectedGroupId, USER_ID, 'member');
      
      setDebugInfo(`Add member response: ${JSON.stringify(response.data, null, 2)}`);
      setSuccess(`Successfully added user as member to group!`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      setError(`POST /groups/:id/members failed (Status: ${status}): ${errorMsg}`);
      setDebugInfo(`Full error: ${JSON.stringify(err.response?.data || err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // 5. TEST: Get group balance
  const testGetBalance = async () => {
    if (!selectedGroupId) {
      setError('Please select a group first');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo('');
    try {
      setDebugInfo(`Calling: GET /groups/${selectedGroupId}/balance`);
      const response = await groupsAPI.getGroupBalance(selectedGroupId);
      
      setDebugInfo(`Balance response: ${JSON.stringify(response.data, null, 2)}`);
      setSuccess(`Group balance loaded: ${JSON.stringify(response.data)}`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      setError(`GET /groups/:id/balance failed (Status: ${status}): ${errorMsg}`);
      setDebugInfo(`Full error: ${JSON.stringify(err.response?.data || err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // 6. TEST: Create Group Expense
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
    setError('');
    setDebugInfo('');
    try {
      const expensePayload = {
        description: expenseData.description,
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        date: new Date().toISOString(),
        splitType: expenseData.splitType,
        paidBy: USER_ID,
        notes: `Test expense created at ${new Date().toLocaleTimeString()}`
      };
      
      setDebugInfo(`Calling: POST /groups/${selectedGroupId}/expenses with data: ${JSON.stringify(expensePayload, null, 2)}`);
      const response = await groupsAPI.createGroupExpense(selectedGroupId, expensePayload);
      
      setDebugInfo(`Expense response: ${JSON.stringify(response.data, null, 2)}`);
      setSuccess(`Expense "${response.data.description}" created successfully!`);
      
      // Clear form and refresh expenses
      setExpenseData({ description: '', amount: '', category: 'food', splitType: 'equal' });
      await testGetGroupExpenses(selectedGroupId);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      setError(`POST /groups/:id/expenses failed (Status: ${status}): ${errorMsg}`);
      setDebugInfo(`Full error: ${JSON.stringify(err.response?.data || err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  // 7. TEST: Get Group Expenses
  const testGetGroupExpenses = async (groupId: string) => {
    if (!groupId) return;
    
    setLoading(true);
    setError('');
    setDebugInfo('');
    try {
      setDebugInfo(`Calling: GET /groups/${groupId}/expenses`);
      const response = await groupsAPI.getGroupExpenses(groupId);
      
      setExpenses(response.data);
      setDebugInfo(`Expenses response: ${JSON.stringify(response.data, null, 2)}`);
      setSuccess(`Loaded ${response.data.length} expenses for group`);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message;
      const status = err.response?.status;
      setError(`GET /groups/:id/expenses failed (Status: ${status}): ${errorMsg}`);
      setDebugInfo(`Full error: ${JSON.stringify(err.response?.data || err, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testGetUserGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      testGetGroupDetails(selectedGroupId);
      testGetGroupExpenses(selectedGroupId);
    }
  }, [selectedGroupId]);

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  // Helper function to get paid by display name
  const getPaidByDisplay = (paidBy: string | any): string => {
    if (typeof paidBy === 'object' && paidBy !== null) {
      return `${paidBy.firstName} ${paidBy.lastName}`;
    }
    return paidBy || 'Unknown';
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #7C3AED', margin: '10px', borderRadius: '8px', backgroundColor: '#faf5ff' }}>
      <h3>🔧 GROUPS - Comprehensive Testing</h3>
      <p style={{ color: '#666', fontStyle: 'italic' }}>
        Step-by-step testing with detailed debug information
      </p>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button onClick={testGetUserGroups} disabled={loading} style={{ backgroundColor: '#3B82F6', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}>
          1. 🔄 Get My Groups
        </button>
        <button onClick={testCreateGroup} disabled={loading} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '10px', border: 'none', borderRadius: '4px' }}>
          2. 🏠 Create Test Group
        </button>
      </div>

      {loading && (
        <div style={{ padding: '10px', backgroundColor: '#EFF6FF', borderRadius: '4px', marginBottom: '15px' }}>
          ⏳ Loading... Please wait
        </div>
      )}
      
      {error && (
        <div style={{ color: '#DC2626', padding: '10px', backgroundColor: '#FEF2F2', borderRadius: '4px', marginBottom: '15px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}
      
      {success && (
        <div style={{ color: '#059669', padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '4px', marginBottom: '15px' }}>
          <strong>✅ Success:</strong> {success}
        </div>
      )}

      {/* Groups List */}
      <div style={{ marginBottom: '20px' }}>
        <h4>📋 My Groups ({groups.length})</h4>
        {groups.length === 0 ? (
          <div style={{ padding: '15px', backgroundColor: '#FFFBEB', borderRadius: '8px', border: '1px solid #F59E0B' }}>
            <p>No groups found. Click "Create Test Group" to create your first group.</p>
            <button onClick={testCreateGroup} disabled={loading} style={{ backgroundColor: '#F59E0B', color: 'white', padding: '8px 15px', border: 'none', borderRadius: '4px' }}>
              🏠 Create Your First Group
            </button>
          </div>
        ) : (
          <div>
            <select 
              value={selectedGroupId} 
              onChange={(e) => setSelectedGroupId(e.target.value)}
              style={{ padding: '8px', width: '100%', marginBottom: '15px', border: '2px solid #7C3AED', borderRadius: '4px' }}
            >
              <option value="">Select a group to test operations...</option>
              {groups.map(group => (
                <option key={group.id} value={group.id}>
                  {group.name} (Status: {group.status})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* GROUP OPERATIONS - ALWAYS SHOW WHEN GROUP SELECTED */}
        {selectedGroupId && (
          <div style={{ padding: '15px', backgroundColor: '#E0E7FF', borderRadius: '8px', border: '1px solid #7C3AED' }}>
            <h4>🎯 Group Operations</h4>
            <p style={{ fontSize: '14px', color: '#666', marginBottom: '15px' }}>
              Testing operations on selected group
            </p>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '15px' }}>
              <button onClick={testAddMember} disabled={loading} style={{ backgroundColor: '#10B981', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px' }}>
                3. 👥 Add Me as Member
              </button>
              <button onClick={testGetBalance} disabled={loading} style={{ backgroundColor: '#8B5CF6', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '4px' }}>
                4. 💰 Get Group Balance
              </button>
            </div>

            {/* CREATE EXPENSE FORM */}
            <div style={{ padding: '15px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #ddd', marginBottom: '15px' }}>
              <h5>5. 💸 Create Group Expense</h5>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Description"
                  value={expenseData.description}
                  onChange={(e) => setExpenseData({...expenseData, description: e.target.value})}
                  style={{ padding: '8px', width: '200px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <input
                  type="number"
                  placeholder="Amount"
                  value={expenseData.amount}
                  onChange={(e) => setExpenseData({...expenseData, amount: e.target.value})}
                  style={{ padding: '8px', width: '120px', border: '1px solid #ddd', borderRadius: '4px' }}
                />
                <select
                  value={expenseData.category}
                  onChange={(e) => setExpenseData({...expenseData, category: e.target.value})}
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
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
                  style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                >
                  <option value="equal">Equal Split</option>
                  <option value="percentage">Percentage</option>
                  <option value="custom">Custom</option>
                </select>
                <button onClick={testCreateExpense} disabled={loading || !expenseData.description || !expenseData.amount} 
                  style={{ 
                    backgroundColor: loading || !expenseData.description || !expenseData.amount ? '#ccc' : '#EF4444', 
                    color: 'white', 
                    padding: '8px 15px', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: loading || !expenseData.description || !expenseData.amount ? 'not-allowed' : 'pointer'
                  }}>
                  {loading ? 'Creating...' : 'Create Expense'}
                </button>
              </div>
              <button onClick={() => testGetGroupExpenses(selectedGroupId)} disabled={loading} 
                style={{ 
                  backgroundColor: '#F59E0B', 
                  color: 'white', 
                  padding: '8px 15px', 
                  border: 'none', 
                  borderRadius: '4px',
                  fontSize: '12px'
                }}>
                6. 📋 Refresh Expenses
              </button>
            </div>

            {/* EXPENSES LIST */}
            <div>
              <h5>Group Expenses ({expenses.length})</h5>
              {expenses.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>No expenses found. Create an expense to see it here.</p>
              ) : (
                expenses.map(expense => (
                  <div key={expense.id} style={{ 
                    border: '1px solid #ddd', 
                    padding: '10px', 
                    margin: '5px 0',
                    borderRadius: '4px',
                    backgroundColor: '#ffffff'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <strong>{expense.description}</strong>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          Amount: {formatCurrency(expense.amount)} | Category: {expense.category} | Split: {expense.splitType}
                        </div>
                        <div style={{ fontSize: '11px', color: '#888' }}>
                          Date: {formatDate(expense.date)} | Status: {expense.status} | 
                          Paid by: {getPaidByDisplay(expense.paidBy)}
                        </div>
                      </div>
                      <span style={{ 
                        padding: '2px 8px',
                        backgroundColor: expense.status === 'pending' ? '#F59E0B' : '#10B981',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '10px'
                      }}>
                        {expense.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedGroup && (
              <div style={{ marginTop: '15px', padding: '10px', backgroundColor: '#ffffff', borderRadius: '4px' }}>
                <h5>Selected Group Details:</h5>
                <pre style={{ fontSize: '12px', overflow: 'auto', margin: 0 }}>
                  {JSON.stringify(selectedGroup, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Information */}
      {debugInfo && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#1F2937', color: '#E5E7EB', borderRadius: '8px', fontSize: '12px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#9CA3AF' }}>🐛 Debug Information:</h4>
          <pre style={{ margin: 0, overflow: 'auto', whiteSpace: 'pre-wrap' }}>
            {debugInfo}
          </pre>
        </div>
      )}

      {/* Testing Instructions */}
      <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#DBEAFE', borderRadius: '8px', fontSize: '14px' }}>
        <h4>🎯 Testing Instructions:</h4>
        <ol style={{ margin: 0, paddingLeft: '20px' }}>
          <li><strong>Step 1:</strong> Click "Get My Groups" to see current groups</li>
          <li><strong>Step 2:</strong> Click "Create Test Group" if no groups exist</li>
          <li><strong>Step 3:</strong> Select a group from dropdown</li>
          <li><strong>Step 4:</strong> Test member addition and balance operations</li>
          <li><strong>Step 5:</strong> Create group expenses and view the list</li>
        </ol>
      </div>
    </div>
  );
};

export default TestGroupsComprehensive;