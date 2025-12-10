import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Group {
  id: string;
  name: string;
  description?: string;
  status: string;
  currency: string;
  color?: string;
  icon?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface GroupMember {
  id: string;
  role: string;
  status: string;
  totalOwed: number;
  totalOwes: number;
  userId: string;
  groupId: string;
  joinedAt: string;
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
  paidBy: string;
  groupId: string;
  createdAt: string;
  updatedAt: string;
}

interface ExpenseSplit {
  id: string;
  amount: number;
  percentage?: number;
  status: string;
  settledAt?: string;
  memberId: string;
  expenseId: string;
  createdAt: string;
  updatedAt: string;
}

// FIXED: Add proper API response types
interface ApiResponse<T> {
  data: T;
  status?: number;
  statusText?: string;
}

// Create axios instance
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token interceptor
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Create API objects
const groupsAPI = {
  getUserGroups: (userId: string) => axiosInstance.get(`/groups/user/${userId}`),
  createGroup: (groupData: any) => axiosInstance.post('/groups', groupData),
  getGroupBalance: (groupId: string) => axiosInstance.get(`/groups/${groupId}/balance`),
  addMember: (groupId: string, userId: string, role: string) => 
    axiosInstance.post(`/groups/${groupId}/members`, { userId, role }),
  acceptInvite: (groupId: string, userId: string) => 
    axiosInstance.post(`/groups/${groupId}/accept`, { userId }),
  deleteGroup: (groupId: string) => axiosInstance.delete(`/groups/${groupId}`)
};

const groupMembersAPI = {
  getGroupMembers: (groupId: string) => axiosInstance.get(`/groups/${groupId}/members`)
};

const groupExpensesAPI = {
  getGroupExpenses: (groupId: string) => axiosInstance.get(`/groups/${groupId}/expenses`),
  createExpense: (expenseData: any) => 
    axiosInstance.post(`/groups/${expenseData.groupId}/expenses`, expenseData)
};

const TestGroups: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [groupExpenses, setGroupExpenses] = useState<GroupExpense[]>([]);
  const [expenseSplits] = useState<ExpenseSplit[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'groups' | 'members' | 'expenses' | 'splits'>('groups');
  const [newGroupName, setNewGroupName] = useState<string>('');

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";
  const TEST_MEMBER_USER_ID = "test-user-456";

  // Test data for creating groups
  const testVacationGroup = {
    name: "Summer Vacation 2024",
    description: "Trip to Hawaii with friends",
    currency: "USD",
    color: "#FF6B6B",
    icon: "🏝️",
    userId: USER_ID
  };

  const testRoommatesGroup = {
    name: "Apartment Expenses",
    description: "Shared household costs",
    currency: "USD",
    color: "#4ECDC4",
    icon: "🏠",
    userId: USER_ID
  };

  const testProjectGroup = {
    name: "Project Team Lunch",
    description: "Team building activities",
    currency: "USD",
    color: "#45B7D1",
    icon: "👥",
    userId: USER_ID
  };

  // Test data for group expenses
  const testExpenseData = {
    description: "Dinner at Restaurant",
    amount: 120.50,
    category: "food",
    date: new Date().toISOString(),
    splitType: "equal",
    paidBy: USER_ID,
    groupId: "",
    notes: "Team dinner celebration"
  };

  // FIXED: Properly typed API calls
  const testGetGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response: ApiResponse<Group[]> = await groupsAPI.getUserGroups(USER_ID);
      setGroups(response.data);
      console.log('User groups:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching groups: ${errorMessage}`);
      console.error('Error fetching groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const testGetGroupMembers = async (groupId: string) => {
    try {
      const response: ApiResponse<GroupMember[]> = await groupMembersAPI.getGroupMembers(groupId);
      setGroupMembers(response.data);
      console.log('Group members:', response.data);
    } catch (error: any) {
      console.error('Error fetching group members:', error);
    }
  };

  const testGetGroupExpenses = async (groupId: string) => {
    try {
      const response: ApiResponse<GroupExpense[]> = await groupExpensesAPI.getGroupExpenses(groupId);
      setGroupExpenses(response.data);
      console.log('Group expenses:', response.data);
    } catch (error: any) {
      console.error('Error fetching group expenses:', error);
    }
  };

  const testGetGroupBalance = async (groupId: string) => {
    try {
      const response = await groupsAPI.getGroupBalance(groupId);
      console.log('Group balance:', response.data);
      alert(`Group balance calculated: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error('Error fetching group balance:', error);
      alert('Error fetching group balance');
    }
  };

  const testCreateVacationGroup = async () => {
    setError('');
    try {
      const response: ApiResponse<Group> = await groupsAPI.createGroup(testVacationGroup);
      console.log('Vacation group created:', response.data);
      alert('Vacation group created successfully!');
      testGetGroups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating vacation group: ${errorMessage}`);
      console.error('Error creating vacation group:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  const testCreateRoommatesGroup = async () => {
    setError('');
    try {
      const response: ApiResponse<Group> = await groupsAPI.createGroup(testRoommatesGroup);
      console.log('Roommates group created:', response.data);
      alert('Roommates group created successfully!');
      testGetGroups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating roommates group: ${errorMessage}`);
      console.error('Error creating roommates group:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  const testCreateProjectGroup = async () => {
    setError('');
    try {
      const response: ApiResponse<Group> = await groupsAPI.createGroup(testProjectGroup);
      console.log('Project group created:', response.data);
      alert('Project group created successfully!');
      testGetGroups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating project group: ${errorMessage}`);
      console.error('Error creating project group:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  const testCreateCustomGroup = async () => {
    if (!newGroupName.trim()) {
      alert('Please enter a group name');
      return;
    }

    setError('');
    try {
      const customGroup = {
        name: newGroupName,
        description: "Custom group for testing",
        currency: "USD",
        color: "#95E1D3",
        icon: "🎯",
        userId: USER_ID
      };

      const response: ApiResponse<Group> = await groupsAPI.createGroup(customGroup);
      console.log('Custom group created:', response.data);
      alert('Custom group created successfully!');
      setNewGroupName('');
      testGetGroups();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating custom group: ${errorMessage}`);
      console.error('Error creating custom group:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  const testAddMemberToGroup = async (groupId: string) => {
    try {
      const response: ApiResponse<GroupMember> = await groupsAPI.addMember(groupId, TEST_MEMBER_USER_ID, 'member');
      console.log('Member added:', response.data);
      alert('Member added successfully!');
      testGetGroupMembers(groupId);
    } catch (error: any) {
      console.error('Error adding member:', error);
      alert('Error adding member to group');
    }
  };

  const testAcceptInvite = async (groupId: string) => {
    try {
      const response: ApiResponse<GroupMember> = await groupsAPI.acceptInvite(groupId, TEST_MEMBER_USER_ID);
      console.log('Invite accepted:', response.data);
      alert('Group invite accepted successfully!');
      testGetGroupMembers(groupId);
    } catch (error: any) {
      console.error('Error accepting invite:', error);
      alert('Error accepting group invite');
    }
  };

  const testCreateGroupExpense = async (groupId: string) => {
    try {
      const expenseData = { ...testExpenseData, groupId };
      const response: ApiResponse<GroupExpense> = await groupExpensesAPI.createExpense(expenseData);
      console.log('Group expense created:', response.data);
      alert('Group expense created successfully!');
      testGetGroupExpenses(groupId);
    } catch (error: any) {
      console.error('Error creating group expense:', error);
      alert('Error creating group expense');
    }
  };

  const testDeleteGroup = async (groupId: string) => {
    try {
      await groupsAPI.deleteGroup(groupId);
      alert('Group deleted successfully!');
      testGetGroups();
    } catch (error: any) {
      console.error('Error deleting group:', error);
      alert('Error deleting group');
    }
  };

  const testViewGroupDetails = async (groupId: string) => {
    try {
      await testGetGroupMembers(groupId);
      await testGetGroupExpenses(groupId);
      setActiveTab('members');
      alert(`Viewing details for group: ${groupId}`);
    } catch (error: any) {
      console.error('Error viewing group details:', error);
    }
  };

  const testDebugEndpoint = async () => {
    console.log('=== DEBUGGING getUserGroups ENDPOINT ===');
    
    try {
      const response: ApiResponse<Group[]> = await groupsAPI.getUserGroups(USER_ID);
      console.log('getUserGroups response:', response);
      console.log('Response data:', response.data);
      
      alert(`getUserGroups returned: ${response.data.length} groups (check console for details)`);
      
    } catch (error: any) {
      console.error('Debug error details:', error);
      console.error('Error response:', error.response);
      alert('Error calling getUserGroups - check console');
    }
  };

  useEffect(() => {
    testGetGroups();
  }, []);

  // Helper functions
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'frozen': return '#FF9800';
      case 'archived': return '#9E9E9E';
      default: return '#607D8B';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return '#F44336';
      case 'admin': return '#2196F3';
      case 'member': return '#4CAF50';
      default: return '#607D8B';
    }
  };

  const getExpenseStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'settled': return '#4CAF50';
      case 'cancelled': return '#F44336';
      default: return '#607D8B';
    }
  };

  const getSplitStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#FF9800';
      case 'settled': return '#4CAF50';
      default: return '#607D8B';
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>👥 Groups API Test</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><strong>Test Member ID:</strong> {TEST_MEMBER_USER_ID}</p>
        <p><small>Manage shared expenses and group financial activities</small></p>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setActiveTab('groups')} 
          style={{ 
            marginRight: '10px', 
            backgroundColor: activeTab === 'groups' ? '#007bff' : '#ccc' 
          }}
        >
          🏠 Groups
        </button>
        <button 
          onClick={() => setActiveTab('members')} 
          style={{ 
            marginRight: '10px', 
            backgroundColor: activeTab === 'members' ? '#007bff' : '#ccc' 
          }}
        >
          👤 Members
        </button>
        <button 
          onClick={() => setActiveTab('expenses')} 
          style={{ 
            marginRight: '10px', 
            backgroundColor: activeTab === 'expenses' ? '#007bff' : '#ccc' 
          }}
        >
          💰 Expenses
        </button>
        <button 
          onClick={() => setActiveTab('splits')} 
          style={{ 
            backgroundColor: activeTab === 'splits' ? '#007bff' : '#ccc' 
          }}
        >
          📋 Splits
        </button>
      </div>
      
      {/* Groups Tab */}
      {activeTab === 'groups' && (
        <div>
          <div style={{ marginBottom: '20px' }}>
            <h4>Quick Group Templates</h4>
            <button onClick={testCreateVacationGroup} style={{ marginRight: '10px', marginBottom: '10px' }}>
              🏝️ Vacation Group
            </button>
            <button onClick={testCreateRoommatesGroup} style={{ marginRight: '10px', marginBottom: '10px' }}>
              🏠 Roommates Group
            </button>
            <button onClick={testCreateProjectGroup} style={{ marginRight: '10px', marginBottom: '10px' }}>
              👥 Project Group
            </button>
            <button onClick={testDebugEndpoint} style={{ marginRight: '10px', marginBottom: '10px', backgroundColor: '#FF9800' }}>
              🔍 Debug Endpoint
            </button>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <h4>Custom Group</h4>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="text"
                placeholder="Enter group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                style={{ padding: '8px', width: '200px' }}
              />
              <button onClick={testCreateCustomGroup}>
                🎯 Create Custom Group
              </button>
            </div>
          </div>

          <div style={{ marginBottom: '20px' }}>
            <button onClick={testGetGroups}>
              🔄 Refresh Groups
            </button>
          </div>
        </div>
      )}

      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Groups List */}
      {activeTab === 'groups' && (
        <div>
          <h4>Your Groups ({groups.length})</h4>
          {groups.length === 0 && !loading && (
            <p style={{ color: '#666' }}>No groups found. Create some groups to see them here.</p>
          )}
          {groups.map(group => (
            <div key={group.id} style={{ 
              border: '1px solid #eee', 
              margin: '10px 0', 
              padding: '15px',
              backgroundColor: '#ffffff',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '24px' }}>{group.icon}</span>
                  <div>
                    <h4 style={{ margin: 0, marginBottom: '5px' }}>{group.name}</h4>
                    <p style={{ margin: 0, color: '#666' }}>{group.description}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: group.color || '#607D8B',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {group.currency}
                  </span>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: getStatusColor(group.status),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {group.status}
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: '12px', color: '#888' }}>
                  Created: {new Date(group.createdAt).toLocaleString()}
                </div>
                <div style={{ display: 'flex', gap: '5px' }}>
                  <button 
                    onClick={() => testViewGroupDetails(group.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#2196F3',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    View Details
                  </button>
                  <button 
                    onClick={() => testGetGroupBalance(group.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#9C27B0',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Get Balance
                  </button>
                  <button 
                    onClick={() => testAddMemberToGroup(group.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Member
                  </button>
                  <button 
                    onClick={() => testAcceptInvite(group.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Accept Invite
                  </button>
                  <button 
                    onClick={() => testCreateGroupExpense(group.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#FF9800',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add Expense
                  </button>
                  <button 
                    onClick={() => testDeleteGroup(group.id)}
                    style={{ 
                      padding: '2px 8px', 
                      fontSize: '11px',
                      backgroundColor: '#F44336',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Members Tab */}
      {activeTab === 'members' && (
        <div>
          <h4>Group Members ({groupMembers.length})</h4>
          {groupMembers.length === 0 && (
            <p style={{ color: '#666' }}>No members found. Select a group and add members to see them here.</p>
          )}
          {groupMembers.map(member => (
            <div key={member.id} style={{ 
              border: '1px solid #eee', 
              margin: '10px 0', 
              padding: '15px',
              backgroundColor: '#ffffff',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>User ID:</strong> {member.userId}
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Joined: {new Date(member.joinedAt).toLocaleString()}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: getRoleColor(member.role),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {member.role}
                  </span>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: getStatusColor(member.status),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {member.status}
                  </span>
                </div>
              </div>
              <div style={{ marginTop: '10px', fontSize: '12px' }}>
                <span style={{ color: '#4CAF50' }}>Owed: ${member.totalOwed}</span> | 
                <span style={{ color: '#F44336', marginLeft: '10px' }}>Owes: ${member.totalOwes}</span> |
                <span style={{ color: '#2196F3', marginLeft: '10px' }}>
                  Net: ${(member.totalOwes - member.totalOwed).toFixed(2)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div>
          <h4>Group Expenses ({groupExpenses.length})</h4>
          {groupExpenses.length === 0 && (
            <p style={{ color: '#666' }}>No expenses found. Select a group and add expenses to see them here.</p>
          )}
          {groupExpenses.map(expense => (
            <div key={expense.id} style={{ 
              border: '1px solid #eee', 
              margin: '10px 0', 
              padding: '15px',
              backgroundColor: '#ffffff',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '5px' }}>{expense.description}</h4>
                  <p style={{ margin: 0, color: '#666' }}>
                    <strong>Amount:</strong> ${expense.amount} | 
                    <strong> Category:</strong> {expense.category} |
                    <strong> Paid by:</strong> {expense.paidBy}
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: getExpenseStatusColor(expense.status),
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {expense.status}
                  </span>
                  <span style={{ 
                    padding: '2px 8px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold'
                  }}>
                    {expense.splitType}
                  </span>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: '#888' }}>
                Date: {new Date(expense.date).toLocaleString()} | 
                Created: {new Date(expense.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Splits Tab */}
      {activeTab === 'splits' && (
        <div>
          <h4>Expense Splits ({expenseSplits.length})</h4>
          {expenseSplits.length === 0 && (
            <p style={{ color: '#666' }}>No expense splits found. Expenses need to be created first.</p>
          )}
          {expenseSplits.map(split => (
            <div key={split.id} style={{ 
              border: '1px solid #eee', 
              margin: '10px 0', 
              padding: '15px',
              backgroundColor: '#ffffff',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Amount:</strong> ${split.amount}
                  {split.percentage && <span> ({split.percentage}%)</span>}
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Member: {split.memberId} | Expense: {split.expenseId}
                  </div>
                </div>
                <span style={{ 
                  padding: '2px 8px',
                  backgroundColor: getSplitStatusColor(split.status),
                  color: 'white',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 'bold'
                }}>
                  {split.status}
                </span>
              </div>
              {split.settledAt && (
                <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '5px' }}>
                  Settled: {new Date(split.settledAt).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestGroups;
