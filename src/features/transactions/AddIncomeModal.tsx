import React, { useState } from 'react';
import { FaTimes, FaDollarSign, FaCalendarAlt, FaBuilding, FaMoneyBillWave } from 'react-icons/fa';

interface AddIncomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onIncomeAdded?: (amount: number) => void; // Callback to update balance
}

const AddIncomeModal: React.FC<AddIncomeModalProps> = ({ isOpen, onClose, userId, onIncomeAdded }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    category: 'salary',
    date: new Date().toISOString().split('T')[0],
    source: 'Employer',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Income categories
  const incomeCategories = [
    { value: 'salary', label: 'Salary', icon: '💼', color: '#10B981' },
    { value: 'bonus', label: 'Bonus', icon: '🎁', color: '#8B5CF6' },
    { value: 'freelance', label: 'Freelance', icon: '💻', color: '#3B82F6' },
    { value: 'investment', label: 'Investment', icon: '📈', color: '#F59E0B' },
    { value: 'gift', label: 'Gift', icon: '🎁', color: '#EC4899' },
    { value: 'refund', label: 'Refund', icon: '↩️', color: '#06B6D4' },
    { value: 'other', label: 'Other', icon: '💰', color: '#6B7280' },
  ];

  // Common income sources
  const incomeSources = [
    'Employer', 'Client', 'Bank', 'Government', 'Family', 'Business', 'Other'
  ];

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    }
    
    const amount = parseFloat(formData.amount);
    if (!formData.amount || isNaN(amount) || amount <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.date) {
      errors.date = 'Please select a date';
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
      
      // Create income transaction
      const incomeData = {
        description: formData.description.trim(),
        amount: amount,
        type: 'income', // Always 'income'
        category: formData.category,
        date: new Date(formData.date + 'T00:00:00').toISOString(),
        userId: userId,
        source: formData.source,
        notes: formData.notes.trim() || undefined,
        accountId: null, // No account for income - increases all accounts or default
        isRecurring: false,
        isSplit: false,
      };

      console.log('Income data to send:', incomeData);
      
      // TODO: Replace with actual API call
      // For now, simulate API call
      setTimeout(() => {
        console.log('Income added successfully:', incomeData);
        
        // Notify parent about new income
        if (onIncomeAdded) {
          onIncomeAdded(amount);
        }
        
        alert(`Income of $${amount.toFixed(2)} added successfully! Balance updated.`);
        
        // Reset form
        setFormData({
          description: '',
          amount: '',
          category: 'salary',
          date: new Date().toISOString().split('T')[0],
          source: 'Employer',
          notes: '',
        });
        setFormErrors({});
        
        onClose();
      }, 1000);
      
    } catch (error: any) {
      console.error('Failed to add income:', error);
      alert(error.message || 'Failed to add income. Please try again.');
    } finally {
      setIsSubmitting(false);
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
          background: 'linear-gradient(90deg, #10B981, #3B82F6)',
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
            <FaMoneyBillWave />
            Add Income
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
              placeholder="e.g., Monthly Salary, Freelance Payment, Bonus"
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

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Category *
            </label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(3, 1fr)', 
              gap: '8px'
            }}>
              {incomeCategories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.value })}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: `2px solid ${formData.category === category.value ? category.color : '#E5E7EB'}`,
                    backgroundColor: formData.category === category.value ? `${category.color}20` : 'white',
                    color: formData.category === category.value ? category.color : '#6B7280',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{category.icon}</span>
                  <span>{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Source */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Source *
            </label>
            <div style={{ position: 'relative' }}>
              <FaBuilding style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                fontSize: '16px',
              }} />
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 44px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1F2937',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
              >
                {incomeSources.map((source) => (
                  <option key={source} value={source}>
                    {source}
                  </option>
                ))}
              </select>
            </div>
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
              Date Received *
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
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional notes..."
              rows={3}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#1F2937',
                backgroundColor: 'white',
                outline: 'none',
                resize: 'vertical',
                fontFamily: 'inherit',
              }}
            />
          </div>

          {/* Info Box - Income increases balance */}
          <div style={{
            marginBottom: '24px',
            padding: '16px',
            backgroundColor: '#D1FAE5',
            borderRadius: '8px',
            borderLeft: '4px solid #10B981'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FaMoneyBillWave style={{ color: '#10B981' }} />
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#065F46', margin: 0 }}>
                Income Information
              </h3>
            </div>
            <div style={{ fontSize: '12px', color: '#065F46' }}>
              • This income will increase your total balance immediately<br/>
              • No account selection needed - adds to overall balance<br/>
              • Balance will update in real-time
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
              disabled={isSubmitting}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: '#10B981',
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
                  Adding Income...
                </div>
              ) : 'Add Income'}
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

export default AddIncomeModal;