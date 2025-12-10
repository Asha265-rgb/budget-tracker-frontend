import React, { useState } from 'react';
import { Mail, Users, CheckCircle, XCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { useAcceptInvitationMutation, useDeclineInvitationMutation } from '../../features/groups/groupsApi';
import type { Invitation } from '../../features/groups/groupsApi';

interface ReceivedInvitationsProps {
  invitations: Invitation[];
  refetch: () => void;
}

const ReceivedInvitations: React.FC<ReceivedInvitationsProps> = ({ invitations, refetch }) => {
  const [acceptInvitation, { isLoading: isAccepting }] = useAcceptInvitationMutation();
  const [declineInvitation, { isLoading: isDeclining }] = useDeclineInvitationMutation();
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-KE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      case 'declined': return 'bg-gray-100 text-gray-800';
      case 'accepted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4" />;
      case 'sent': return <Mail className="h-4 w-4" />;
      case 'expired': return <AlertCircle className="h-4 w-4" />;
      case 'declined': return <XCircle className="h-4 w-4" />;
      case 'accepted': return <CheckCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const handleAccept = async (token: string) => {
    try {
      // CORRECTED: acceptInvitation expects { token: string; userId?: string }
      await acceptInvitation({ 
        token: token
        // If you need to pass userId, add it here:
        // userId: 'some-user-id'
      }).unwrap();
      
      toast.success('Invitation accepted! You have been added to the group.');
      refetch();
    } catch (error: any) {
      console.error('Accept error:', error);
      toast.error(error.message || 'Failed to accept invitation');
    }
  };

  const handleDecline = async (token: string) => {
    try {
      // CORRECTED: declineInvitation expects { token: string }
      await declineInvitation({ 
        token: token
      }).unwrap();
      
      toast.success('Invitation declined');
      refetch();
    } catch (error: any) {
      console.error('Decline error:', error);
      toast.error(error.message || 'Failed to decline invitation');
    }
  };

  // Filter invitations
  const pendingInvitations = invitations.filter(inv => 
    inv.status === 'approved' || inv.status === 'sent'
  );

  const displayedInvitations = filter === 'pending' ? pendingInvitations : invitations;

  if (invitations.length === 0) {
    return (
      <div className="text-center py-8">
        <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Invitations</h3>
        <p className="text-gray-600">You haven't received any group invitations yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === 'pending' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          Pending ({pendingInvitations.length})
        </button>
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 font-medium border-b-2 ${
            filter === 'all' 
              ? 'text-blue-600 border-blue-600' 
              : 'text-gray-600 border-transparent hover:text-gray-900'
          }`}
        >
          All ({invitations.length})
        </button>
      </div>

      {/* Invitations List */}
      {displayedInvitations.length === 0 ? (
        <div className="text-center py-8">
          <CheckCircle className="h-12 w-12 text-green-300 mx-auto mb-4" />
          <p className="text-gray-600">No pending invitations</p>
        </div>
      ) : (
        <div className="space-y-4">
          {displayedInvitations.map((invitation) => (
            <div key={invitation.id} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${
                    invitation.status === 'approved' ? 'bg-green-50' :
                    invitation.status === 'accepted' ? 'bg-purple-50' :
                    'bg-blue-50'
                  }`}>
                    <Users className={`h-6 w-6 ${
                      invitation.status === 'approved' ? 'text-green-600' :
                      invitation.status === 'accepted' ? 'text-purple-600' :
                      'text-blue-600'
                    }`} />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-semibold text-gray-900">{invitation.groupName}</h4>
                      <span className={`px-3 py-1 rounded-full text-xs flex items-center gap-1 ${getStatusColor(invitation.status)}`}>
                        {getStatusIcon(invitation.status)}
                        {invitation.status === 'approved' ? 'Ready to Join' : 
                         invitation.status === 'accepted' ? 'Joined' : 
                         invitation.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Invited by: <span className="font-medium">{invitation.invitedByName}</span></p>
                      <p>Role: <span className="font-medium capitalize">{invitation.role}</span></p>
                      <p>Invited: {formatDate(invitation.createdAt)}</p>
                      {invitation.expiresAt && (
                        <p className={`${
                          invitation.status === 'expired' ? 'text-red-600' : 'text-orange-600'
                        }`}>
                          Expires: {formatDate(invitation.expiresAt)}
                        </p>
                      )}
                      {invitation.message && (
                        <p className="mt-2 italic">"{invitation.message}"</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col gap-2">
                  {invitation.status === 'approved' && invitation.token && (
                    <>
                      <button
                        onClick={() => handleAccept(invitation.token!)}
                        disabled={isAccepting}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        <CheckCircle className="h-4 w-4" />
                        {isAccepting ? 'Joining...' : 'Join Group'}
                      </button>
                      <button
                        onClick={() => handleDecline(invitation.token!)}
                        disabled={isDeclining}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                      >
                        <XCircle className="h-4 w-4" />
                        Decline
                      </button>
                    </>
                  )}
                  
                  {invitation.status === 'accepted' && (
                    <a
                      href={`/groups/${invitation.groupId}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Go to Group
                    </a>
                  )}
                  
                  {invitation.status === 'expired' && (
                    <button
                      disabled
                      className="px-4 py-2 bg-gray-400 text-white rounded-lg text-sm font-medium cursor-not-allowed"
                    >
                      Expired
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ReceivedInvitations;