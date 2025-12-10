// src/features/groups/InvitationRequest.tsx - CORRECTED VERSION
import React from 'react';
import { Mail, User, Clock, CheckCircle, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useApproveInvitationMutation, useRejectInvitationMutation, useCancelInvitationMutation } from './groupsApi';

interface Invitation {
  id: string;
  status: 'sent' | 'pending_approval' | 'approved' | 'rejected' | 'accepted' | 'declined' | 'expired' | 'cancelled';
  email?: string;
  inviteeEmail?: string;
  inviteeName?: string;
  userName?: string;
  userEmail?: string;
  groupName?: string;
  groupId?: string;
  invitedByName?: string;
  invitedByEmail?: string;
  role?: string;
  createdAt: string;
  expiresAt?: string;
  message?: string;
  approvalNotes?: string;
}

interface InvitationRequestProps {
  invitation?: Invitation;
  invitations?: Invitation[];
  groupId?: string;
  refetch?: () => void;
  showActions?: boolean;
  onUpdate?: () => void;
  currentUserId?: string;
}

const InvitationRequest: React.FC<InvitationRequestProps> = ({ 
  invitation,
  invitations: propsInvitations,
  groupId: _groupId,
  refetch,
  showActions = true,
  onUpdate,
  currentUserId: _currentUserId
}) => {
  // Handle both singular and plural props
  const invitations = invitation ? [invitation] : (propsInvitations || []);
  
  const [approveInvitation, { isLoading: isApproving }] = useApproveInvitationMutation();
  const [rejectInvitation, { isLoading: isRejecting }] = useRejectInvitationMutation();
  const [cancelInvitation, { isLoading: isCancelling }] = useCancelInvitationMutation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      case 'declined': return 'bg-gray-100 text-gray-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'pending_approval': return <Clock className="h-4 w-4" />;
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <XCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'sent': return 'Sent (Waiting Approval)';
      case 'pending_approval': return 'Pending Approval';
      case 'approved': return 'Approved (Waiting Acceptance)';
      case 'rejected': return 'Rejected';
      case 'accepted': return 'Accepted (Joined Group)';
      case 'declined': return 'Declined';
      case 'expired': return 'Expired';
      case 'cancelled': return 'Cancelled';
      default: return status.replace('_', ' ');
    }
  };

  const handleApprove = async (invitationId: string) => {
    try {
      // Based on the error, the correct signature is: { invitationId: string; notes?: string }
      await approveInvitation({ 
        invitationId, 
        notes: 'Welcome to the group!' 
      }).unwrap();
      toast.success('Invitation approved');
      refetch?.();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to approve invitation');
    }
  };

  const handleReject = async (invitationId: string) => {
    try {
      // Based on the error, the correct signature is: { invitationId: string; notes?: string }
      await rejectInvitation({ 
        invitationId, 
        notes: 'Group is full' 
      }).unwrap();
      toast.success('Invitation rejected');
      refetch?.();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to reject invitation');
    }
  };

  const handleCancel = async (invitationId: string) => {
    try {
      await cancelInvitation(invitationId).unwrap();
      toast.success('Invitation cancelled');
      refetch?.();
      onUpdate?.();
    } catch (error) {
      toast.error('Failed to cancel invitation');
    }
  };

  if (invitations.length === 0) {
    return (
      <div className="text-center py-12">
        <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Invitations Found</h3>
        <p className="text-gray-600">
          {showActions 
            ? 'All invitations have been processed' 
            : 'You have no pending invitations'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {invitations.map((inv) => (
        <div key={inv.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                inv.status === 'approved' ? 'bg-green-50' :
                inv.status === 'rejected' ? 'bg-red-50' :
                inv.status === 'accepted' ? 'bg-purple-50' :
                'bg-blue-50'
              }`}>
                <User className={`h-6 w-6 ${
                  inv.status === 'approved' ? 'text-green-600' :
                  inv.status === 'rejected' ? 'text-red-600' :
                  inv.status === 'accepted' ? 'text-purple-600' :
                  'text-blue-600'
                }`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-semibold text-gray-900">
                    {inv.inviteeName || inv.userName || inv.inviteeEmail || inv.email || 'Unknown User'}
                  </h4>
                  <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(inv.status)}`}>
                    {getStatusIcon(inv.status)}
                    {getStatusText(inv.status)}
                  </span>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><span className="font-medium">Email:</span> {inv.inviteeEmail || inv.userEmail || inv.email || 'No email'}</p>
                  {inv.groupName && <p><span className="font-medium">Group:</span> {inv.groupName}</p>}
                  {inv.invitedByName && (
                    <p><span className="font-medium">Invited by:</span> {inv.invitedByName} {inv.invitedByEmail && `(${inv.invitedByEmail})`}</p>
                  )}
                  {inv.role && (
                    <p><span className="font-medium">Role:</span> <span className="font-medium capitalize">{inv.role}</span></p>
                  )}
                  <p><span className="font-medium">Sent:</span> {formatDate(inv.createdAt)}</p>
                  {inv.expiresAt && (
                    <p className={`${inv.status === 'expired' ? 'text-red-600' : 'text-orange-600'}`}>
                      <span className="font-medium">Expires:</span> {formatDate(inv.expiresAt)}
                    </p>
                  )}
                  {inv.message && (
                    <p className="mt-2 italic border-l-4 border-gray-300 pl-3 py-1">"{inv.message}"</p>
                  )}
                  {inv.approvalNotes && (
                    <p className="mt-2 text-blue-600 border-l-4 border-blue-300 pl-3 py-1">
                      <span className="font-medium">Admin Note:</span> {inv.approvalNotes}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col gap-2">
              {/* Admin Actions (Group Dashboard) */}
              {showActions && (inv.status === 'sent' || inv.status === 'pending_approval') && (
                <>
                  <button
                    onClick={() => handleApprove(inv.id)}
                    disabled={isApproving}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(inv.id)}
                    disabled={isRejecting}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleCancel(inv.id)}
                    disabled={isCancelling}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Cancel
                  </button>
                </>
              )}
              
              {/* Admin Actions for approved invitations */}
              {showActions && inv.status === 'approved' && (
                <button
                  onClick={() => handleCancel(inv.id)}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
              )}
              
              {/* User Actions (Personal/Business Dashboard) - Accept/Decline buttons */}
              {!showActions && inv.status === 'approved' && (
                <>
                  <button
                    onClick={() => {
                      toast.info('Accept functionality will be implemented in ReceivedInvitations component');
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                  >
                    Accept Invitation
                  </button>
                  <button
                    onClick={() => {
                      toast.info('Decline functionality will be implemented in ReceivedInvitations component');
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium"
                  >
                    Decline
                  </button>
                </>
              )}
              
              {/* View Group Link for accepted invitations */}
              {inv.status === 'accepted' && inv.groupId && (
                <a
                  href={`/groups/${inv.groupId}`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  View Group
                </a>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default InvitationRequest;