import React, { useState, useEffect } from 'react';
import { X, DollarSign } from 'lucide-react';

interface SettleUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  members: Array<{
    userId: string;
    name: string;
    balance: number;
  }>;
  isLoading: boolean;
}

const SettleUpModal: React.FC<SettleUpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  members,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    toUserId: '',
    amount: '',
    description: '',
  });

  // Commented out unused paymentMethods array - can be used later if needed
  // const paymentMethods = [
  //   { id: 'cash', name: 'Cash', icon: Banknote, color: 'text-green-600', bg: 'bg-green-100' },
  //   { id: 'mpesa', name: 'M-Pesa', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  //   { id: 'bank', name: 'Bank Transfer', icon: CreditCard, color: 'text-blue-600', bg: 'bg-blue-100' },
  //   { id: 'other', name: 'Other', icon: Wallet, color: 'text-gray-600', bg: 'bg-gray-100' },
  // ];

  const selectedMember = members.find(m => m.userId === formData.toUserId);
  const maxAmount = selectedMember ? Math.abs(selectedMember.balance) : 0;

  useEffect(() => {
    if (members.length > 0 && !formData.toUserId) {
      const memberWithLargestBalance = members.reduce((prev, current) => 
        Math.abs(current.balance) > Math.abs(prev.balance) ? current : prev
      );
      if (memberWithLargestBalance.balance !== 0) {
        setFormData(prev => ({ 
          ...prev, 
          toUserId: memberWithLargestBalance.userId,
          amount: Math.abs(memberWithLargestBalance.balance).toFixed(2)
        }));
      }
    }
  }, [members, formData.toUserId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.toUserId || !formData.amount || parseFloat(formData.amount) <= 0) {
      return;
    }
    
    onSubmit({
      toUserId: formData.toUserId,
      amount: parseFloat(formData.amount),
      description: formData.description || `Settlement with ${selectedMember?.name}`,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Settle Up</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Who to Pay */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pay To *
                  </label>
                  <div className="space-y-2">
                    {members.map((member) => (
                      <button
                        key={member.userId}
                        type="button"
                        onClick={() => {
                          setFormData({ 
                            ...formData, 
                            toUserId: member.userId,
                            amount: Math.abs(member.balance).toFixed(2)
                          });
                        }}
                        className={`w-full p-4 border rounded-xl transition-all duration-200 text-left ${
                          formData.toUserId === member.userId
                            ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 ring-2 ring-green-500 ring-opacity-50'
                            : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              formData.toUserId === member.userId ? 'bg-green-100' : 'bg-gray-100'
                            }`}>
                              <span className={`font-bold ${
                                formData.toUserId === member.userId ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{member.name}</p>
                              <p className="text-sm text-gray-600">
                                Balance: {' '}
                                <span className={`font-bold ${member.balance < 0 ? 'text-green-600' : 'text-amber-600'}`}>
                                  KES {Math.abs(member.balance).toFixed(2)}
                                </span>
                              </p>
                            </div>
                          </div>
                          {member.balance < 0 && (
                            <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                              Owes You
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount (KES) *
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <DollarSign className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      min="0"
                      max={maxAmount}
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, amount: maxAmount.toFixed(2) })}
                        className="text-sm font-medium text-green-600 hover:text-green-700"
                      >
                        MAX
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between mt-2">
                    <span className="text-sm text-gray-500">Max: KES {maxAmount.toFixed(2)}</span>
                    {parseFloat(formData.amount) > maxAmount && (
                      <span className="text-sm text-red-600">Amount exceeds balance!</span>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., Settling grocery expenses for March"
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    disabled={isLoading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || !formData.toUserId || !formData.amount || parseFloat(formData.amount) <= 0 || parseFloat(formData.amount) > maxAmount}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <DollarSign className="h-4 w-4" />
                        Confirm Settlement
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

export default SettleUpModal;