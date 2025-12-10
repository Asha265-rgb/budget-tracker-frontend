import React, { useState, useEffect } from 'react';
import { 
  useGetGroupsQuery,
  useGetGroupMembersQuery,
  useCreateGroupMutation,
  type Group,
  type GroupMember,
} from '../../features/groups/groupsApi'; // FIXED: Changed import source

const TestGroupMembers: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // RTK Query hooks
  const { data: groupsData = [], refetch: refetchGroups } = useGetGroupsQuery();
  const { data: membersData = [] } = useGetGroupMembersQuery(selectedGroupId, {
    skip: !selectedGroupId
  });
  const [createGroup] = useCreateGroupMutation();

  // Fetch user's groups
  const fetchUserGroups = async () => {
    setLoading(true);
    setError('');
    try {
      setGroups(groupsData);
      console.log('User groups:', groupsData);
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
      setGroupMembers(membersData || []);
      console.log('Group members:', membersData);
    } catch (err: any) {
      setError(`Failed to fetch group members: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Add member to group - useAddGroupMemberMutation doesn't exist, so we'll skip this for now
  const testAddMember = async () => {
    setError('Add member functionality not yet implemented in API');
    console.warn('useAddGroupMemberMutation is not implemented yet');
  };

  // Create test group
  const testCreateGroup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const groupData = {
        name: `Test Group ${Date.now()}`,
        description: 'Automated test group',
        currency: 'USD',
      };
      
      const response = await createGroup(groupData).unwrap();
      setSuccess(`Group "${response.name}" created successfully!`);
      console.log('Group created:', response);
      await refetchGroups();
    } catch (err: any) {
      setError(`Failed to create group: ${err.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupsData]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchGroupMembers(selectedGroupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedGroupId, membersData]);

  return (
    <div style={{ padding: '20px', border: '2px solid #8B5CF6', margin: '10px', borderRadius: '8px' }}>
      <h3>👥 Group Members API Test</h3>

      {/* Control Buttons */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={fetchUserGroups} 
          disabled={loading}
          style={{ 
            marginRight: '10px',
            padding: '10px 15px',
            backgroundColor: '#8B5CF6',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🔄 Refresh Groups
        </button>
        <button 
          onClick={testCreateGroup} 
          disabled={loading}
          style={{ 
            marginRight: '10px',
            padding: '10px 15px',
            backgroundColor: '#F59E0B',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          🏠 Create Test Group
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
            marginRight: '10px',
            border: '1px solid #ddd',
            borderRadius: '4px'
          }}
        >
          <option value="">Select a group...</option>
          {groups.map(group => (
            <option key={group.id} value={group.id}>
              {group.name}
            </option>
          ))}
        </select>
        
        {selectedGroupId && (
          <button 
            onClick={testAddMember} 
            disabled={loading}
            style={{
              padding: '8px 15px',
              backgroundColor: '#ccc',
              color: '#666',
              border: 'none',
              borderRadius: '4px',
              cursor: 'not-allowed'
            }}
          >
            ➕ Add Member (Not Implemented)
          </button>
        )}
      </div>

      {/* Group Members List */}
      {selectedGroupId && (
        <div>
          <h4>Group Members ({groupMembers.length})</h4>
          {groupMembers.length === 0 ? (
            <p style={{ color: '#666', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
              No members found. Add members to this group.
            </p>
          ) : (
            groupMembers.map((member: any) => (
              <div key={member.id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                margin: '10px 0',
                borderRadius: '8px',
                backgroundColor: '#ffffff',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <h5 style={{ margin: 0 }}>
                      User: {member.userId} 
                      <span style={{ 
                        marginLeft: '10px',
                        padding: '2px 8px',
                        backgroundColor: member.role === 'owner' || member.role === 'admin' ? '#EF4444' : '#3B82F6',
                        color: 'white',
                        borderRadius: '12px',
                        fontSize: '12px'
                      }}>
                        {member.role}
                      </span>
                    </h5>
                    {member.user && (
                      <p style={{ margin: '5px 0', fontSize: '14px', color: '#555' }}>
                        {member.user.firstName} {member.user.lastName} ({member.user.email})
                      </p>
                    )}
                    <p style={{ margin: '5px 0' }}>
                      Owed: <strong>${member.totalOwed || 0}</strong> | 
                      Owes: <strong>${member.totalOwes || 0}</strong>
                    </p>
                    <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                      Net Balance: <strong>${(member.totalOwes || 0) - (member.totalOwed || 0)}</strong>
                    </p>
                  </div>
                  <div>
                    <span style={{ 
                      padding: '4px 8px',
                      backgroundColor: (member.status || 'active') === 'active' ? '#10B981' : '#6B7280',
                      color: 'white',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {member.status || 'active'}
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


