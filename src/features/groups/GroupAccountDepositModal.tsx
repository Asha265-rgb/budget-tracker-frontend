// src/features/groups/GroupAccountDepositModal.tsx - FIXED
import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Calculator, X, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface GroupAccountDepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    description: string;
    paidByUserId: string;
    participants: string[];
    individualAmounts?: Record<string, number>;
  }) => Promise<void>;
  members: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    balance: number;
  }>;
  currentUserId: string;
  isLoading?: boolean;
}

const GroupAccountDepositModal: React.FC<GroupAccountDepositModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  currentUserId,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    depositType: 'equal' as 'equal' | 'individual',
    paidByUserId: '',
    participants: [] as string[],
    individualAmounts: {} as Record<string, string>,
  });

  // Initialize paidByUserId with current user
  useEffect(() => {
    if (currentUserId && !formData.paidByUserId) {
      setFormData(prev => ({
        ...prev,
        paidByUserId: currentUserId,
        participants: [currentUserId]
      }));
    }
  }, [currentUserId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (formData.participants.length === 0) {
      toast.error('Please select at least one participant');
      return;
    }

    if (!formData.paidByUserId) {
      toast.error('Please select who made the deposit');
      return;
    }

    // For individual deposits, validate amounts
    if (formData.depositType === 'individual') {
      const totalIndividualAmount = Object.values(formData.individualAmounts)
        .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
      
      if (Math.abs(totalIndividualAmount - amount) > 0.01) {
        toast.error(`Individual amounts (KES ${totalIndividualAmount.toFixed(2)}) must sum to total amount (KES ${amount.toFixed(2)})`);
        return;
      }
    }

    const depositData = {
      description: formData.description,
      amount: amount,
      paidByUserId: formData.paidByUserId,
      participants: formData.participants,
      ...(formData.depositType === 'individual' && {
        individualAmounts: Object.keys(formData.individualAmounts).reduce((acc, userId) => ({
          ...acc,
          [userId]: parseFloat(formData.individualAmounts[userId]) || 0
        }), {})
      })
    };

    try {
      await onSubmit(depositData);
    } catch (error) {
      // Error handled by parent
    }
  };

  if (!isOpen) return null;
  
  const paidByUser = members.find(m => m.userId === formData.paidByUserId);
  const totalIndividualAmount = Object.values(formData.individualAmounts)
    .reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
  const totalAmount = parseFloat(formData.amount) || 0;
  const equalShare = formData.participants.length > 0 ? totalAmount / formData.participants.length : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Add Group Account Deposit</h2>
                <p className="text-gray-600">Record initial deposits for group expenses</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Description */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <input
                type="text"
                required
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="e.g., Initial group fund, Shopping deposit, etc."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>

            {/* Amount */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Deposit Amount (KES)
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="0.00"
              />
            </div>

            {/* Who Paid */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Who made this deposit?
              </label>
              <select
                value={formData.paidByUserId}
                onChange={(e) => setFormData({...formData, paidByUserId: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                required
              >
                <option value="">Select member</option>
                {members.map(member => (
                  <option key={member.userId} value={member.userId}>
                    {member.userName} ({member.userEmail})
                  </option>
                ))}
              </select>
              {paidByUser && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4" />
                  {paidByUser.userName} will be credited with this deposit
                </p>
              )}
            </div>

            {/* Deposit Type */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deposit Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, depositType: 'equal'})}
                  className={`px-4 py-3 rounded-lg border flex items-center justify-center gap-2 ${
                    formData.depositType === 'equal'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Calculator className="h-5 w-5" />
                  <span>Equal Split</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, depositType: 'individual'})}
                  className={`px-4 py-3 rounded-lg border flex items-center justify-center gap-2 ${
                    formData.depositType === 'individual'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span>Individual Amounts</span>
                </button>
              </div>
            </div>

            {/* Participants */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Participants (who contributed to this deposit)
                </label>
                <span className="text-sm text-gray-500">
                  {formData.participants.length} selected
                </span>
              </div>
              <div className="space-y-3 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {members.map(member => (
                  <div 
                    key={member.userId} 
                    className={`flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 ${
                      formData.participants.includes(member.userId)
                        ? 'border-green-200 bg-green-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={formData.participants.includes(member.userId)}
                        onChange={(e) => {
                          const newParticipants = e.target.checked
                            ? [...formData.participants, member.userId]
                            : formData.participants.filter(id => id !== member.userId);
                          
                          // If unchecking, remove individual amount
                          const newIndividualAmounts = { ...formData.individualAmounts };
                          if (!e.target.checked && newIndividualAmounts[member.userId]) {
                            delete newIndividualAmounts[member.userId];
                          }
                          
                          setFormData({
                            ...formData, 
                            participants: newParticipants,
                            individualAmounts: newIndividualAmounts
                          });
                        }}
                        className="h-5 w-5 text-green-600 rounded focus:ring-green-500"
                      />
                      <div>
                        <p className="font-medium">{member.userName}</p>
                        <p className="text-sm text-gray-500">{member.userEmail}</p>
                      </div>
                    </div>
                    
                    {/* Individual Amount Input */}
                    {formData.depositType === 'individual' && formData.participants.includes(member.userId) && (
                      <div className="w-32">
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="Amount"
                          value={formData.individualAmounts[member.userId] || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            individualAmounts: {
                              ...formData.individualAmounts,
                              [member.userId]: e.target.value
                            }
                          })}
                          className="w-full px-3 py-2 border border-gray-300 rounded text-right focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                          {formData.individualAmounts[member.userId] ? 'KES' : ''}
                        </p>
                      </div>
                    )}
                    
                    {/* Equal Share Display */}
                    {formData.depositType === 'equal' && formData.participants.includes(member.userId) && totalAmount > 0 && (
                      <div className="text-right">
                        <p className="font-medium text-green-700">
                          KES {equalShare.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">Equal share</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            {formData.amount && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-green-900 mb-3 flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Deposit Summary
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Amount</p>
                    <p className="text-lg font-bold text-green-700">KES {totalAmount.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Paid By</p>
                    <p className="font-semibold">{paidByUser?.userName || 'Not selected'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Participants</p>
                    <p className="font-semibold">{formData.participants.length} members</p>
                  </div>
                  {formData.depositType === 'equal' && formData.participants.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600">Each Share</p>
                      <p className="font-semibold text-green-700">
                        KES {equalShare.toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>
                
                {formData.depositType === 'individual' && (
                  <div className="mt-3 pt-3 border-t border-green-200">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Individual Amounts Total</p>
                      <p className={`font-semibold ${
                        Math.abs(totalIndividualAmount - totalAmount) > 0.01 
                          ? 'text-red-600' 
                          : 'text-green-600'
                      }`}>
                        KES {totalIndividualAmount.toFixed(2)}
                      </p>
                    </div>
                    {Math.abs(totalIndividualAmount - totalAmount) > 0.01 && (
                      <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        Amounts don't match total! Difference: KES {(totalAmount - totalIndividualAmount).toFixed(2)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-6 border-t">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
              >
                {isLoading ? (
                  <>
                    <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Recording Deposit...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-5 w-5" />
                    Record Deposit
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default GroupAccountDepositModal;