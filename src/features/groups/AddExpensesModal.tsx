import React, { useState, useEffect } from 'react';
import { X, DollarSign, Users, Calendar, FileText, Tag, Percent, Calculator, UserCheck, Share2, CheckCircle } from 'lucide-react';

interface Member {
  userId: string;
  name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'member';
}

interface AddExpensesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (expenseData: any) => void;
  isLoading: boolean;
  userId: string;
  members?: Member[];
}

const AddExpensesModal: React.FC<AddExpensesModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  userId,
  members = [],
}) => {
  const [step, setStep] = useState(1); // 1: Basic info, 2: Split details
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    paidBy: userId,
    splitType: 'equal' as 'equal' | 'unequal',
  });

  // State for who paid and who didn't pay
  const [whoPaid, setWhoPaid] = useState<string>(userId);
  const [whoDidNotPay, setWhoDidNotPay] = useState<string[]>([]);
  
  // For unequal splits: who owes how much
  const [unequalSplits, setUnequalSplits] = useState<Record<string, number>>({});

  const categories = ['Food', 'Transport', 'Entertainment', 'Utilities', 'Rent', 'Shopping', 'Healthcare', 'Other'];

  // Initialize: current user should not be in "who didn't pay" if they paid
  useEffect(() => {
    if (members.length > 0) {
      // Default: all other members didn't pay
      const otherMembers = members
        .filter(m => m.userId !== whoPaid)
        .map(m => m.userId);
      setWhoDidNotPay(otherMembers);
      
      // Initialize equal splits
      const totalAmount = parseFloat(formData.amount) || 0;
      const totalMembers = members.length;
      if (totalMembers > 0) {
        const share = totalAmount / totalMembers; // Including payer
        
        const initialSplits: Record<string, number> = {};
        members.forEach(member => {
          if (member.userId === whoPaid) {
            // Payer gets positive (they're owed money)
            initialSplits[member.userId] = -share * (totalMembers - 1);
          } else {
            // Others owe money
            initialSplits[member.userId] = share;
          }
        });
        setUnequalSplits(initialSplits);
      }
    }
  }, [members, whoPaid, formData.amount]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Recalculate splits when amount changes
    if (name === 'amount') {
      const totalAmount = parseFloat(value) || 0;
      const totalMembers = members.length;
      
      if (formData.splitType === 'equal' && totalMembers > 0) {
        const share = totalAmount / totalMembers;
        const newSplits: Record<string, number> = {};
        
        members.forEach(member => {
          if (member.userId === whoPaid) {
            // Payer is owed money by others
            newSplits[member.userId] = -share * (totalMembers - 1);
          } else {
            // Others owe money to payer
            newSplits[member.userId] = share;
          }
        });
        setUnequalSplits(newSplits);
      }
    }
  };

  const handleSplitTypeChange = (type: 'equal' | 'unequal') => {
    setFormData(prev => ({ ...prev, splitType: type }));
    
    if (type === 'equal') {
      // Recalculate equal splits
      const totalAmount = parseFloat(formData.amount) || 0;
      const totalMembers = members.length;
      
      if (totalMembers > 0) {
        const share = totalAmount / totalMembers;
        const newSplits: Record<string, number> = {};
        
        members.forEach(member => {
          if (member.userId === whoPaid) {
            newSplits[member.userId] = -share * (totalMembers - 1);
          } else {
            newSplits[member.userId] = share;
          }
        });
        setUnequalSplits(newSplits);
      }
    }
  };

  const handleUnequalSplitChange = (memberId: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setUnequalSplits(prev => ({
      ...prev,
      [memberId]: numValue,
    }));
  };

  const toggleWhoDidNotPay = (memberId: string) => {
    if (memberId === whoPaid) return; // Can't toggle payer
    
    setWhoDidNotPay(prev => {
      if (prev.includes(memberId)) {
        return prev.filter(id => id !== memberId);
      } else {
        return [...prev, memberId];
      }
    });
  };

  const getTotalOwed = () => {
    const total = Object.entries(unequalSplits)
      .filter(([memberId, amount]) => amount > 0 && whoDidNotPay.includes(memberId))
      .reduce((sum, [_, amount]) => sum + amount, 0);
    return total;
  };

  const getPayerAmount = () => {
    const total = Object.entries(unequalSplits)
      .filter(([memberId, amount]) => amount < 0 && memberId === whoPaid)
      .reduce((sum, [_, amount]) => sum + Math.abs(amount), 0);
    return total;
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      alert('Please enter a description');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      alert('Please enter a valid amount');
      return false;
    }
    if (!whoPaid) {
      alert('Please select who paid');
      return false;
    }
    if (whoDidNotPay.length === 0) {
      alert('Please select members who should share the expense');
      return false;
    }
    
    // For unequal splits, check totals
    if (formData.splitType === 'unequal') {
      const totalAmount = parseFloat(formData.amount);
      const totalOwed = getTotalOwed();
      const payerAmount = getPayerAmount();
      
      if (Math.abs(totalOwed - payerAmount) > 0.01) {
        alert(`Split amounts don't balance! Total owed: ${totalOwed.toFixed(2)}, Payer amount: ${payerAmount.toFixed(2)}`);
        return false;
      }
      
      if (Math.abs(totalAmount - totalOwed) > 0.01) {
        alert(`Split total (${totalOwed.toFixed(2)}) doesn't match expense amount (${totalAmount.toFixed(2)})`);
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Prepare split details
    const splitDetails: Record<string, number> = {};
    members.forEach(member => {
      if (member.userId === whoPaid) {
        // Payer is owed money (negative amount)
        splitDetails[member.userId] = -getTotalOwed();
      } else if (whoDidNotPay.includes(member.userId)) {
        // Others owe money (positive amount)
        splitDetails[member.userId] = unequalSplits[member.userId] || 0;
      } else {
        // Not involved in this expense
        splitDetails[member.userId] = 0;
      }
    });

    const expenseData = {
      description: formData.description,
      amount: parseFloat(formData.amount),
      category: formData.category,
      date: formData.date,
      notes: formData.notes,
      paidBy: whoPaid,
      groupId: '', // Will be filled by parent component
      splitType: formData.splitType,
      splitDetails: splitDetails,
    };

    onSubmit(expenseData);
  };

  if (!isOpen) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
    }).format(amount);
  };

  const payer = members.find(m => m.userId === whoPaid);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Add Group Expense</h3>
                  <p className="text-sm text-gray-600">Track shared spending with members</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className={`flex items-center ${step >= 1 ? 'text-pink-600' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-pink-100' : 'bg-gray-100'}`}>
                  {step > 1 ? <CheckCircle className="h-4 w-4" /> : <span>1</span>}
                </div>
                <span className="ml-2 font-medium">Basic Info</span>
              </div>
              <div className="h-1 w-16 bg-gray-200 mx-4"></div>
              <div className={`flex items-center ${step >= 2 ? 'text-pink-600' : 'text-gray-400'}`}>
                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-pink-100' : 'bg-gray-100'}`}>
                  <span>2</span>
                </div>
                <span className="ml-2 font-medium">Split Details</span>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              {step === 1 ? (
                <div className="space-y-6">
                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <FileText className="inline h-4 w-4 mr-1" />
                      What was this expense for?
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="e.g., Groceries, Dinner, Movie tickets..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Amount */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline h-4 w-4 mr-1" />
                      Total Amount (KES)
                    </label>
                    <input
                      type="number"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Tag className="inline h-4 w-4 mr-1" />
                      Category
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="inline h-4 w-4 mr-1" />
                      Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes (Optional)
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Any additional details about this expense..."
                      rows={2}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>

                  {/* Next Button */}
                  <div className="flex justify-end pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      disabled={!formData.description || !formData.amount}
                      className="px-6 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                    >
                      Continue to Split Details
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step 2: Split Details */}
                  <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                    <h4 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <Calculator className="h-5 w-5" />
                      Split Calculation Summary
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="text-2xl font-bold text-gray-800">
                          {formatCurrency(parseFloat(formData.amount) || 0)}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-600">Split Type</p>
                        <p className="text-2xl font-bold text-pink-600 capitalize">{formData.splitType}</p>
                      </div>
                    </div>
                  </div>

                  {/* Who Paid */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <UserCheck className="h-5 w-5" />
                      Who Paid for this?
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {members.map(member => (
                        <button
                          key={member.userId}
                          type="button"
                          onClick={() => setWhoPaid(member.userId)}
                          className={`p-4 border rounded-xl transition-all duration-200 text-left ${
                            whoPaid === member.userId
                              ? 'border-pink-500 bg-gradient-to-r from-pink-50 to-rose-50 ring-2 ring-pink-500 ring-opacity-50'
                              : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                              whoPaid === member.userId ? 'bg-pink-100' : 'bg-gray-100'
                            }`}>
                              <span className={`font-medium ${
                                whoPaid === member.userId ? 'text-pink-600' : 'text-gray-600'
                              }`}>
                                {member.name.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{member.name}</p>
                              <p className="text-xs text-gray-600 truncate">{member.email}</p>
                            </div>
                          </div>
                          {whoPaid === member.userId && (
                            <div className="mt-3 p-2 bg-pink-100 rounded-lg">
                              <p className="text-xs text-pink-700 font-medium">
                                ⚡ Pays: {formatCurrency(getPayerAmount())}
                              </p>
                              <p className="text-xs text-pink-600">
                                Will be owed: {formatCurrency(getTotalOwed())}
                              </p>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Who Should Share (Didn't Pay) */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Users className="h-5 w-5" />
                      Who Should Share This Expense?
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {members
                        .filter(m => m.userId !== whoPaid)
                        .map(member => (
                          <button
                            key={member.userId}
                            type="button"
                            onClick={() => toggleWhoDidNotPay(member.userId)}
                            className={`p-4 border rounded-xl transition-all duration-200 text-left ${
                              whoDidNotPay.includes(member.userId)
                                ? 'border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 ring-2 ring-blue-500 ring-opacity-50'
                                : 'border-gray-300 hover:border-blue-300 hover:bg-blue-50'
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                whoDidNotPay.includes(member.userId) ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                                <span className={`font-medium ${
                                  whoDidNotPay.includes(member.userId) ? 'text-blue-600' : 'text-gray-600'
                                }`}>
                                  {member.name.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-800">{member.name}</p>
                                <p className="text-xs text-gray-600 truncate">{member.email}</p>
                              </div>
                            </div>
                            {whoDidNotPay.includes(member.userId) && (
                              <div className="mt-3">
                                <p className="text-xs text-blue-700 font-medium">
                                  Owes: {formatCurrency(unequalSplits[member.userId] || 0)}
                                </p>
                              </div>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>

                  {/* Split Type */}
                  <div>
                    <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Share2 className="h-5 w-5" />
                      How Should We Split?
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleSplitTypeChange('equal')}
                        className={`p-6 border rounded-xl transition-all duration-200 text-center ${
                          formData.splitType === 'equal'
                            ? 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 ring-2 ring-green-500 ring-opacity-50'
                            : 'border-gray-300 hover:border-green-300 hover:bg-green-50'
                        }`}
                      >
                        <div className="text-3xl mb-3">⚖️</div>
                        <p className="font-bold text-gray-800">Equal Split</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Divide equally among {whoDidNotPay.length + 1} people
                        </p>
                        {formData.splitType === 'equal' && (
                          <p className="text-sm text-green-600 font-medium mt-3">
                            Each owes: {formatCurrency((parseFloat(formData.amount) || 0) / (whoDidNotPay.length + 1))}
                          </p>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSplitTypeChange('unequal')}
                        className={`p-6 border rounded-xl transition-all duration-200 text-center ${
                          formData.splitType === 'unequal'
                            ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 ring-2 ring-purple-500 ring-opacity-50'
                            : 'border-gray-300 hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="text-3xl mb-3">📊</div>
                        <p className="font-bold text-gray-800">Unequal Split</p>
                        <p className="text-sm text-gray-600 mt-2">
                          Set custom amounts for each person
                        </p>
                        {formData.splitType === 'unequal' && (
                          <p className="text-sm text-purple-600 font-medium mt-3">
                            Custom amounts enabled
                          </p>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Unequal Split Details (Only shown for unequal) */}
                  {formData.splitType === 'unequal' && (
                    <div className="border border-gray-200 rounded-xl p-4">
                      <h5 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Custom Split Amounts
                      </h5>
                      <div className="space-y-3">
                        {members.map(member => {
                          if (member.userId === whoPaid) return null; // Payer doesn't owe
                          if (!whoDidNotPay.includes(member.userId)) return null; // Not sharing
                          
                          return (
                            <div key={member.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-blue-600 font-medium">{member.name.charAt(0)}</span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800">{member.name}</p>
                                  <p className="text-xs text-gray-600">{member.email}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-3">
                                <input
                                  type="number"
                                  value={unequalSplits[member.userId] || 0}
                                  onChange={(e) => handleUnequalSplitChange(member.userId, e.target.value)}
                                  min="0"
                                  step="0.01"
                                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                  placeholder="Amount"
                                />
                                <span className="text-gray-700 font-medium">KES</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                        <div className="flex justify-between">
                          <span className="font-medium text-gray-800">Total Owed:</span>
                          <span className="font-bold text-green-600">{formatCurrency(getTotalOwed())}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="font-medium text-gray-800">Payer Amount:</span>
                          <span className="font-bold text-pink-600">{formatCurrency(getPayerAmount())}</span>
                        </div>
                        <div className="flex justify-between mt-2">
                          <span className="font-medium text-gray-800">Balance:</span>
                          <span className={`font-bold ${Math.abs(getTotalOwed() - getPayerAmount()) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(getTotalOwed() - getPayerAmount())}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Summary */}
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 rounded-xl p-4">
                    <h5 className="font-bold text-gray-800 mb-3">📋 Expense Summary</h5>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Description:</span>
                        <span className="font-medium">{formData.description}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Amount:</span>
                        <span className="font-bold">{formatCurrency(parseFloat(formData.amount) || 0)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Paid by:</span>
                        <span className="font-medium">{payer?.name || 'You'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shared with:</span>
                        <span className="font-medium">{whoDidNotPay.length} member(s)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Split type:</span>
                        <span className="font-medium capitalize">{formData.splitType}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      ← Back
                    </button>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
                        disabled={isLoading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading || whoDidNotPay.length === 0}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium rounded-xl hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                      >
                        {isLoading ? (
                          <>
                            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Save Expense
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddExpensesModal;