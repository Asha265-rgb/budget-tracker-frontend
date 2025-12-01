import React, { useState, useEffect } from 'react';
import { groupsAPI, groupMembersAPI } from '../../services/api';

interface Group {
  id: string;
  name: string;
  description?: string;
  status: string;
  currency: string;
  createdBy: string;
}

interface GroupMember {
  id: string;
  role: string;
  status: string;
  totalOwed: number;
  totalOwes: number;
  userId: string;
  groupId: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

const TestGroupMembers: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // Fetch user's groups
  const fetchUserGroups = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await groupsAPI.getUserGroups(USER_ID);
      setGroups(response.data);
      console.log('User groups:', response.data);
    } catch (err: any) {
      setError(`Failed to fetch groups: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch group members
  const fetchGroupMembers = async (groupId: string) => {
    if (!groupId) return;
    
    setLoading(true);
    try {
      const response = await groupMembersAPI.getGroupMembers(groupId);
      setGroupMembers(response.data);
      console.log('Group members:', response.data);
    } catch (err: any) {
      setError(`Failed to fetch group members: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add member to group
  const testAddMember = async () => {
    if (!selectedGroupId) {
      setError('Please select a group first');
      return;
    }

    // For testing, we'll use the same user ID (you'd normally add other users)
    // const newMemberUserId = "ANOTHER_USER_ID"; // This should be a different user ID
    
    setLoading(true);
    try {
      const response = await groupsAPI.addMember(selectedGroupId, USER_ID, 'member');
      setSuccess(`Member added successfully!`);
      console.log('Member added:', response.data);
      await fetchGroupMembers(selectedGroupId);
    } catch (err: any) {
      setError(`Failed to add member: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Create test group
  const testCreateGroup = async () => {
    setLoading(true);
    try {
      const groupData = {
        name: `Test Group ${Date.now()}`,
        description: 'Automated test group',
        currency: 'USD',
        userId: USER_ID
      };
      
      const response = await groupsAPI.createGroup(groupData);
      setSuccess(`Group "${response.data.name}" created successfully!`);
      console.log('Group created:', response.data);
      await fetchUserGroups();
    } catch (err: any) {
      setError(`Failed to create group: ${err.response?.data?.message || err.message}`);
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
    }
  }, [selectedGroupId]);

  return (
    <div style={{ padding: '20px', border: '2px solid #8B5CF6', margin: '10px', borderRadius: '8px' }}>
      <h3>👥 Group Members API Test</h3>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchUserGroups} disabled={loading} style={{ marginRight: '10px' }}>
          🔄 Refresh Groups
        </button>
        <button onClick={testCreateGroup} disabled={loading} style={{ marginRight: '10px', backgroundColor: '#F59E0B' }}>
          🏠 Create Test Group
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && <div style={{ color: 'red', marginBottom: '15px' }}>Error: {error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '15px' }}>Success: {success}</div>}

      {/* Group Selection */}
      <div style={{ marginBottom: '20px' }}>
        <h4>Select Group ({groups.length} available)</h4>
        <select 
          value={selectedGroupId} 
          onChange={(e) => setSelectedGroupId(e.target.value)}
          style={{ padding: '8px', width: '300px', marginRight: '10px' }}
        >
          <option value="">Select a group...</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name} - {group.status}
            </option>
          ))}
        </select>
        
        {selectedGroupId && (
          <button onClick={testAddMember} disabled={loading}>
            ➕ Add Current User as Member
          </button>
        )}
      </div>

      {/* Group Members List */}
      {selectedGroupId && (
        <div>
          <h4>Group Members ({groupMembers.length})</h4>
          {groupMembers.length === 0 ? (
            <p>No members found. Add members to this group.</p>
          ) : (
            groupMembers.map(member => (
              <div key={member.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                margin: '10px 0',
                borderRadius: '8px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h5 style={{ margin: 0 }}>
                      User: {member.userId} 
                      <span style={{ 
                        marginLeft: '10px',
                        padding: '2px 8px',
                        backgroundColor: member.role === 'owner' ? '#EF4444' : '#3B82F6',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {member.role}
                      </span>
                    </h5>
                    <p style={{ margin: '5px 0' }}>
                      Status: <strong>{member.status}</strong> | 
                      Owed: <strong>${member.totalOwed}</strong> | 
                      Owes: <strong>${member.totalOwes}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                      Net Balance: <strong>${member.totalOwes - member.totalOwed}</strong>
                    </p>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '4px 8px',
                      backgroundColor: member.status === 'active' ? '#10B981' : '#6B7280',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {member.status}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default TestGroupMembers;
