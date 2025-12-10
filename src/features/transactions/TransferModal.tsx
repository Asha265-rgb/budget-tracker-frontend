import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../app/store';
import { fetchAccounts } from '../accounts/accountsSlice';
import { FaTimes, FaExchangeAlt, FaDollarSign, FaCalendarAlt, FaStickyNote } from 'react-icons/fa';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

// Define Account interface locally
interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  userId: string;
  isDeleted?: boolean;
  status?: string;
}

const TransferModal: React.FC<TransferModalProps> = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get accounts from Redux store
  const accounts = useSelector((state: any) => state.accounts?.accounts || []) as Account[];
  const isLoadingAccounts = useSelector((state: any) => state.accounts?.isLoading || false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    fromAccountId: '',
    toAccountId: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch accounts when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      dispatch(fetchAccounts(userId));
    }
  }, [dispatch, isOpen, userId]);

  // Filter out deleted/inactive accounts
  const activeAccounts = accounts.filter(account => 
    !account.isDeleted && account.status === 'active'
  );

  // Validation function
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.fromAccountId) {
      errors.fromAccountId = 'Please select source account';
    }
    
    if (!formData.toAccountId) {
      errors.toAccountId = 'Please select destination account';
    }
    
    if (formData.fromAccountId === formData.toAccountId) {
      errors.toAccountId = 'Source and destination accounts must be different';
    }
    
    if (!formData.date) {
      errors.date = 'Please select a date';
    }

    // Check if source account has sufficient balance
    if (formData.fromAccountId && amount > 0) {
      const fromAccount = activeAccounts.find(acc => acc.id === formData.fromAccountId);
      if (fromAccount && amount > fromAccount.balance) {
        errors.amount = `Insufficient balance. Available: $${fromAccount.balance.toFixed(2)}`;
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const amount = parseFloat(formData.amount);
      
      // Create transfer object - this would create two transactions (withdrawal and deposit)
      const transferData = {
        description: formData.description.trim(),
        amount: amount,
        fromAccountId: formData.fromAccountId,
        toAccountId: formData.toAccountId,
        date: new Date(formData.date + 'T00:00:00').toISOString(),
        userId: userId,
        notes: formData.notes.trim() || undefined,
        type: 'transfer' as const,
      };

      console.log('Transfer data:', transferData);
      
      // TODO: Call your backend API for transfers
      // For now, we'll simulate a successful transfer
      setTimeout(() => {
        console.log('Transfer successful:', transferData);
        alert(`Transfer of $${amount.toFixed(2)} scheduled successfully!`);
        
        // Reset form
        setFormData({
          description: '',
          amount: '',
          fromAccountId: '',
          toAccountId: '',
          date: new Date().toISOString().split('T')[0],
          notes: '',
        });
        setFormErrors({});
        
        onClose(); // Close modal
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to create transfer:', error);
      alert(error.message || 'Failed to create transfer. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccountChange = (field: 'fromAccountId' | 'toAccountId', value: string) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear errors for this field
    if (formErrors[field]) {
      setFormErrors({ ...formErrors, [field]: '' });
    }
    
    // Clear the "same account" error if it exists
    if (formErrors.toAccountId === 'Source and destination accounts must be different') {
      setFormErrors({ ...formErrors, toAccountId: '' });
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
      backdropFilter: 'blur(4px)',
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px',
          borderBottom: '1px solid #E5E7EB',
          background: 'linear-gradient(90deg, #3B82F6, #8B5CF6)',
          color: 'white'
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 600,
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaExchangeAlt />
            Transfer Funds
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              fontSize: '20px',
              padding: '4px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Description *
            </label>
            <input
              type="text"
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (formErrors.description) {
                  setFormErrors({ ...formErrors, description: '' });
                }
              }}
              placeholder="e.g., Transfer to Savings, Rent Payment, etc."
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${formErrors.description ? '#EF4444' : '#D1D5DB'}`,
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1F2937',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              required
            />
            {formErrors.description && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {formErrors.description}
              </p>
            )}
          </div>

          {/* Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Amount *
            </label>
            <div style={{ position: 'relative' }}>
              <FaDollarSign style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                fontSize: '16px',
              }} />
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => {
                  setFormData({ ...formData, amount: e.target.value });
                  if (formErrors.amount) {
                    setFormErrors({ ...formErrors, amount: '' });
                  }
                }}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: `1px solid ${formErrors.amount ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1F2937',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                required
              />
            </div>
            {formErrors.amount && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {formErrors.amount}
              </p>
            )}
          </div>

          {/* From Account */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              From Account *
            </label>
            {isLoadingAccounts ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: '#6B7280',
                border: '1px dashed #D1D5DB',
                borderRadius: '8px'
              }}>
                Loading accounts...
              </div>
            ) : activeAccounts.length === 0 ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: '#EF4444',
                border: '1px dashed #EF4444',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2'
              }}>
                No active accounts found.
              </div>
            ) : (
              <select
                value={formData.fromAccountId}
                onChange={(e) => handleAccountChange('fromAccountId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${formErrors.fromAccountId ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1F2937',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                required
              >
                <option value="">Select source account</option>
                {activeAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type}) - ${account.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            )}
            {formErrors.fromAccountId && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {formErrors.fromAccountId}
              </p>
            )}
          </div>

          {/* To Account */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              To Account *
            </label>
            {isLoadingAccounts ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: '#6B7280',
                border: '1px dashed #D1D5DB',
                borderRadius: '8px'
              }}>
                Loading accounts...
              </div>
            ) : activeAccounts.length === 0 ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: '#EF4444',
                border: '1px dashed #EF4444',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2'
              }}>
                No active accounts found.
              </div>
            ) : (
              <select
                value={formData.toAccountId}
                onChange={(e) => handleAccountChange('toAccountId', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${formErrors.toAccountId ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1F2937',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                }}
                required
              >
                <option value="">Select destination account</option>
                {activeAccounts
                  .filter(account => account.id !== formData.fromAccountId) // Don't show source account
                  .map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type}) - ${account.balance.toFixed(2)}
                    </option>
                  ))}
              </select>
            )}
            {formErrors.toAccountId && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {formErrors.toAccountId}
              </p>
            )}
          </div>

          {/* Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Transfer Date *
            </label>
            <div style={{ position: 'relative' }}>
              <FaCalendarAlt style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                fontSize: '16px',
              }} />
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  setFormData({ ...formData, date: e.target.value });
                  if (formErrors.date) {
                    setFormErrors({ ...formErrors, date: '' });
                  }
                }}
                max={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: `1px solid ${formErrors.date ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1F2937',
                  backgroundColor: 'white',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                required
              />
            </div>
            {formErrors.date && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {formErrors.date}
              </p>
            )}
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Notes (Optional)
            </label>
            <div style={{ position: 'relative' }}>
              <FaStickyNote style={{
                position: 'absolute',
                left: '16px',
                top: '16px',
                color: '#6B7280',
                fontSize: '16px',
              }} />
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Add any additional notes about this transfer..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1F2937',
                  resize: 'vertical',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: 'white',
                color: '#374151',
                border: '2px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !formData.fromAccountId || !formData.toAccountId}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: '#3B82F6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Processing...
                </div>
              ) : 'Transfer Funds'}
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default TransferModal;