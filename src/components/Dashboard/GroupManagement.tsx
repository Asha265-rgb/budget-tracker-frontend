// src/components/Dashboard/GroupManagement.tsx - FIXED
import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';
import Card from '../Common/Card';
import { useGetGroupsQuery, useCreateGroupMutation, useInviteMemberMutation, useGetGroupMembersQuery } from '../../features/groups/groupsApi';

interface GroupManagementProps {
  userId: string;
}

const GroupManagement: React.FC<GroupManagementProps> = () => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showInviteMember, setShowInviteMember] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [newGroup, setNewGroup] = useState({ name: '', description: '' });
  const [inviteEmail, setInviteEmail] = useState('');

  // Fetch groups
  const { data: groups = [], isLoading: groupsLoading } = useGetGroupsQuery();
  
  // Fetch members for selected group
  const { 
    data: members = [], 
    isLoading: membersLoading,
    error: membersError 
  } = useGetGroupMembersQuery(selectedGroupId || '', {
    skip: !selectedGroupId,
  });

  // Mutations
  const [createGroup] = useCreateGroupMutation();
  const [inviteMember] = useInviteMemberMutation();

  const handleCreateGroup = async () => {
    if (!newGroup.name.trim()) return;
    
    try {
      await createGroup({
        name: newGroup.name,
        description: newGroup.description,
      }).unwrap();
      
      setNewGroup({ name: '', description: '' });
      setShowCreateGroup(false);
    } catch (error) {
      console.error('Failed to create group:', error);
    }
  };

  const handleInviteMember = async () => {
    if (!selectedGroupId || !inviteEmail.trim()) return;
    
    try {
      // Find the selected group to get its name
      const selectedGroup = groups.find((g: any) => g.id === selectedGroupId);
      const groupName = selectedGroup?.name || '';
      
      // ✅ FIXED: Use the correct parameter structure based on groupsApi.ts
      await inviteMember({
        groupId: selectedGroupId,
        email: inviteEmail,
        role: 'member',
        message: `You've been invited to join ${groupName}`,
      }).unwrap();
      
      setInviteEmail('');
      setShowInviteMember(false);
    } catch (error) {
      console.error('Failed to invite member:', error);
    }
  };

  if (groupsLoading) {
    return (
      <Card style={{ padding: spacing[4] }}>
        <div style={{ textAlign: 'center', padding: spacing[8] }}>
          <div style={{ color: colors.text.secondary }}>Loading groups...</div>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[4] }}>
      {/* Group Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{
          fontSize: typography.fontSize.xl,
          fontWeight: typography.fontWeight.semibold,
          color: colors.text.primary,
          margin: 0,
        }}>
          Your Groups
        </h2>
        <button
          onClick={() => setShowCreateGroup(true)}
          style={{
            padding: `${spacing[2]} ${spacing[4]}`,
            backgroundColor: colors.primary[500],
            color: colors.text.white,
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: typography.fontSize.sm,
            fontWeight: typography.fontWeight.medium,
          }}
        >
          + Create Group
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <Card style={{ padding: spacing[4], marginTop: spacing[4] }}>
          <h3 style={{ marginBottom: spacing[3] }}>Create New Group</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <input
              type="text"
              placeholder="Group Name"
              value={newGroup.name}
              onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
              style={{
                padding: spacing[2],
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                fontSize: typography.fontSize.base,
              }}
            />
            <textarea
              placeholder="Description (optional)"
              value={newGroup.description}
              onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
              style={{
                padding: spacing[2],
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                fontSize: typography.fontSize.base,
                minHeight: '80px',
              }}
            />
            <div style={{ display: 'flex', gap: spacing[2], justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowCreateGroup(false)}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateGroup}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.primary[500],
                  color: colors.text.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Create Group
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Groups List */}
      {groups.length === 0 ? (
        <Card style={{ padding: spacing[8], textAlign: 'center' }}>
          <div style={{ color: colors.text.secondary, marginBottom: spacing[2] }}>
            You haven't joined any groups yet
          </div>
          <div style={{ color: colors.text.secondary, fontSize: typography.fontSize.sm, opacity: 0.7 }}>
            Create a group to start sharing expenses with friends or family
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
          {groups.map((group: any) => (
            <Card key={group.id} style={{ padding: spacing[4] }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ 
                    fontSize: typography.fontSize.lg, 
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing[1],
                  }}>
                    {group.name}
                  </div>
                  <div style={{ 
                    fontSize: typography.fontSize.sm, 
                    color: colors.text.secondary,
                    marginBottom: spacing[2],
                  }}>
                    {group.description || 'No description'}
                  </div>
                  <div style={{ 
                    fontSize: typography.fontSize.xs, 
                    color: colors.text.secondary,
                    display: 'flex',
                    alignItems: 'center',
                    gap: spacing[2],
                    opacity: 0.7,
                  }}>
                    <span>👥 {group.memberCount || 0} members</span>
                    <span>•</span>
                    <span>💰 ${(group.totalBalance || 0).toFixed(2)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: spacing[2] }}>
                  <button
                    onClick={() => {
                      setSelectedGroupId(group.id);
                      setShowInviteMember(true);
                    }}
                    style={{
                      padding: `${spacing[1]} ${spacing[3]}`,
                      backgroundColor: colors.primary[100],
                      color: colors.primary[600],
                      border: `1px solid ${colors.primary[200]}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    Invite
                  </button>
                  <button
                    onClick={() => {
                      setSelectedGroupId(group.id === selectedGroupId ? null : group.id);
                    }}
                    style={{
                      padding: `${spacing[1]} ${spacing[3]}`,
                      backgroundColor: colors.background.secondary,
                      color: colors.text.primary,
                      border: `1px solid ${colors.border}`,
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: typography.fontSize.sm,
                    }}
                  >
                    {selectedGroupId === group.id ? 'Hide' : 'View'}
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Invite Member Modal */}
      {showInviteMember && selectedGroupId && (
        <Card style={{ padding: spacing[4], marginTop: spacing[4] }}>
          <h3 style={{ marginBottom: spacing[3] }}>Invite Member to Group</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
            <input
              type="email"
              placeholder="Enter email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              style={{
                padding: spacing[2],
                border: `1px solid ${colors.border}`,
                borderRadius: '4px',
                fontSize: typography.fontSize.base,
              }}
            />
            <div style={{ display: 'flex', gap: spacing[2], justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowInviteMember(false);
                  setInviteEmail('');
                }}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.background.secondary,
                  color: colors.text.primary,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleInviteMember}
                style={{
                  padding: `${spacing[2]} ${spacing[4]}`,
                  backgroundColor: colors.primary[500],
                  color: colors.text.white,
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Send Invite
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Group Members List */}
      {selectedGroupId && (
        <Card style={{ padding: spacing[4], marginTop: spacing[4] }}>
          <h3 style={{ marginBottom: spacing[3] }}>Group Members</h3>
          {membersLoading ? (
            <div style={{ textAlign: 'center', padding: spacing[4] }}>
              <div style={{ color: colors.text.secondary }}>Loading members...</div>
            </div>
          ) : membersError ? (
            <div style={{ textAlign: 'center', padding: spacing[4], color: colors.status.error }}>
              Failed to load members
            </div>
          ) : members.length === 0 ? (
            <div style={{ textAlign: 'center', padding: spacing[4], color: colors.text.secondary }}>
              No members in this group yet
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[2] }}>
              {members.map((member: any) => (
                <div key={member.userId || member.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  padding: spacing[2],
                  backgroundColor: colors.background.secondary,
                  borderRadius: '4px',
                }}>
                  <div>
                    <div style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium }}>
                      {member.userName || member.userEmail || member.email}
                    </div>
                    <div style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                      {member.userEmail || member.email || 'No email'} • {member.role || 'member'}
                    </div>
                  </div>
                  <div style={{ 
                    fontSize: typography.fontSize.base,
                    color: (member.balance || 0) === 0 ? colors.text.primary : 
                           (member.balance || 0) > 0 ? colors.status.success : colors.status.error,
                    fontWeight: typography.fontWeight.semibold,
                  }}>
                    {(member.balance || 0) === 0 ? 'Settled' : 
                     (member.balance || 0) > 0 ? `+$${(member.balance || 0).toFixed(2)}` : 
                     `-$${Math.abs(member.balance || 0).toFixed(2)}`}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default GroupManagement;
