import React, { useState } from 'react';
import { X, UserPlus, Mail, Phone, User, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useInviteMemberMutation } from './groupsApi';

interface MemberInviteModalProps {
  isOpen: boolean;
  onClose: () => void;
  groupId: string;
  groupName: string;
  refetchInvitations?: () => void;
}

const MemberInviteModal: React.FC<MemberInviteModalProps> = ({
  isOpen,
  onClose,
  groupId,
  groupName,
  refetchInvitations,
}) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    message: '',
    role: 'member' as 'member' | 'admin',
  });

  const [inviteMember, { isLoading }] = useInviteMemberMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      toast.error('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      console.log('📤 Sending invitation:', { 
        groupId, 
        email: formData.email,
        role: formData.role,
        message: formData.message 
      });
      
      // ✅ FIXED: Remove groupName from the parameters
      const result = await inviteMember({
        groupId,
        email: formData.email,
        role: formData.role,
        message: formData.message || undefined,
      });

      if ('data' in result) {
        toast.success(`Invitation sent to ${formData.email}`);
        
        // Reset form
        setFormData({ 
          email: '', 
          name: '', 
          phone: '', 
          message: '', 
          role: 'member' 
        });
        
        // Close modal
        onClose();
        
        // Refetch invitations if callback provided
        if (refetchInvitations) {
          refetchInvitations();
        }
      } else if ('error' in result) {
        console.error('Invite error:', result.error);
        toast.error('Failed to send invitation');
      }
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast.error(error.message || 'Failed to send invitation');
    }
  };

  const handleClose = () => {
    setFormData({ 
      email: '', 
      name: '', 
      phone: '', 
      message: '', 
      role: 'member' 
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={handleClose}
      ></div>

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Centering trick */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Content */}
        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                  <UserPlus className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Invite Member to Group</h3>
                  <p className="text-sm text-gray-600 mt-1">{groupName}</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                {/* Info Box */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">How Invitations Work</p>
                      <p className="text-xs text-gray-600 mt-1">
                        1. You send invitation → Status: "sent"<br/>
                        2. You approve invitation → Status: "approved"<br/>
                        3. User receives invitation in their dashboard<br/>
                        4. User accepts → Status: "accepted" (added to group)<br/>
                        Works for both registered and non-registered users
                      </p>
                    </div>
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="member@example.com"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                      required
                      autoFocus
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Name Input (Optional now) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John Doe"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Role Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Role in Group
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'member' })}
                      className={`px-4 py-3 rounded-xl border ${
                        formData.role === 'member'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">Member</span>
                      <p className="text-xs mt-1">Can add expenses, settle payments</p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, role: 'admin' })}
                      className={`px-4 py-3 rounded-xl border ${
                        formData.role === 'admin'
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <span className="font-medium">Admin</span>
                      <p className="text-xs mt-1">Can manage group, invite members</p>
                    </button>
                  </div>
                </div>

                {/* Message Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Personal Message (Optional)
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="e.g., Join our group to track shared expenses..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Phone Input (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number (Optional)
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+254 712 345 678"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                {/* Access Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">Invitation Process</p>
                      <ul className="text-xs text-gray-600 mt-2 space-y-1">
                        <li>✅ You send invite → Status: "sent"</li>
                        <li>✅ You approve invite → Status: "approved"</li>
                        <li>✅ User receives invite in their dashboard</li>
                        <li>✅ User accepts → Status: "accepted" (joins group)</li>
                        <li>⏳ 7-day expiry for all invitations</li>
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        Send Invitation
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberInviteModal;
        