import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaDollarSign, FaChartLine } from 'react-icons/fa';
import { useCreateBudgetMutation } from './budgetsApi';

interface AddBudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

const AddBudgetModal: React.FC<AddBudgetModalProps> = ({ isOpen, onClose, userId }) => {
  const [createBudget, { isLoading }] = useCreateBudgetMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    period: 'monthly',
    category: 'Other',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
    rolloverEnabled: false,
    color: '#FF4D94',
  });

  const categories = [
    'Food & Dining', 'Transportation', 'Shopping', 'Entertainment',
    'Bills & Utilities', 'Healthcare', 'Education', 'Personal Care',
    'Gifts & Donations', 'Travel', 'Savings', 'Investments', 'Other'
  ];

  const periods = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'yearly', label: 'Yearly' },
    { value: 'custom', label: 'Custom' },
  ];

  const colors = [
    '#FF4D94', '#FFD700', '#10B981', '#3B82F6',
    '#8B5CF6', '#EF4444', '#F59E0B', '#06B6D4'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // ✅ FIXED: More lenient userId validation
    if (!userId || userId.trim() === '') {
      console.error('Invalid userId:', userId);
      alert('User ID is missing. Please log in again.');
      return;
    }
    
    // ✅ FIXED: Remove strict UUID validation - accept any non-empty string
    // Just check if it looks like a valid ID (not empty, reasonable length)
    if (userId.length < 1) {
      console.error('UserId is too short:', userId);
      alert('Invalid user ID. Please log in again.');
      return;
    }
    
    if (!formData.name.trim() || !formData.amount || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid amount greater than 0');
      return;
    }

    try {
      // ✅ FIXED: Use simple date format - backend should handle parsing
      const startDate = formData.startDate; // Keep as YYYY-MM-DD
      const endDate = formData.endDate;     // Keep as YYYY-MM-DD
      
      // ✅ FIXED: Debug logging
      console.log('=== BUDGET CREATION DEBUG ===');
      console.log('1. UserId:', userId);
      console.log('2. UserId length:', userId.length);
      console.log('3. UserId type:', typeof userId);
      
      const budgetData = {
        name: formData.name.trim(),
        amount: amount,
        period: formData.period,
        category: formData.category,
        startDate: startDate, // Simple string
        endDate: endDate,     // Simple string
        rolloverEnabled: formData.rolloverEnabled,
        color: formData.color,
        userId: userId.trim(), // Ensure no whitespace
      };

      console.log('4. Budget data being sent:', budgetData);
      console.log('5. Full API request details:', {
        url: 'http://localhost:8000/budgets',
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: budgetData
      });
      
      // ✅ FIXED: Add more detailed error handling
      const result = await createBudget(budgetData).unwrap();
      console.log('✅ Budget created successfully:', result);
      
      // Reset form
      setFormData({
        name: '',
        amount: '',
        period: 'monthly',
        category: 'Other',
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0],
        rolloverEnabled: false,
        color: '#FF4D94',
      });

      alert('✅ Budget created successfully!');
      onClose();
      
      // Refresh the page to see new budget
      setTimeout(() => {
        window.location.reload();
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Failed to create budget:', error);
      
      // ✅ FIXED: Better error logging
      if (error.data) {
        console.error('Error data:', error.data);
        console.error('Error status:', error.status);
      }
      
      let errorMessage = 'Failed to create budget. ';
      
      if (error.data?.message) {
        errorMessage += `Server: ${error.data.message}`;
      } else if (error.message) {
        errorMessage += `Error: ${error.message}`;
      } else if (error.status) {
        errorMessage += `Status: ${error.status}`;
      } else {
        errorMessage += 'Unknown error. Check console.';
      }
      
      // ✅ FIXED: Show specific backend validation errors
      if (error.data?.errors) {
        const validationErrors = error.data.errors.map((err: any) => 
          `${err.field}: ${err.message}`
        ).join('\n');
        errorMessage += '\n\nValidation Errors:\n' + validationErrors;
      }
      
      alert(errorMessage);
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
          background: 'linear-gradient(90deg, #FF4D94, #FFD700)',
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
            <FaChartLine />
            Create New Budget
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
          {/* ✅ FIXED: Better debug info */}
          <div style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            backgroundColor: userId ? '#D1FAE5' : '#FEE2E2', 
            borderRadius: '8px',
            fontSize: '12px',
            color: userId ? '#065F46' : '#991B1B',
            border: `1px solid ${userId ? '#10B981' : '#EF4444'}`
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <strong>User ID Status:</strong> {userId ? '✓ Found' : '✗ Missing'}
              </div>
              <button
                type="button"
                onClick={() => {
                  console.log('=== DEBUG INFO ===');
                  console.log('userId:', userId);
                  console.log('localStorage userId:', localStorage.getItem('userId'));
                  console.log('localStorage user:', localStorage.getItem('user'));
                  console.log('localStorage token:', localStorage.getItem('token'));
                  alert('Check console for debug info');
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid currentColor',
                  color: 'currentColor',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '10px',
                  cursor: 'pointer'
                }}
              >
                Debug
              </button>
            </div>
            {userId && (
              <div style={{ marginTop: '4px', fontFamily: 'monospace', wordBreak: 'break-all' }}>
                ID: {userId}
              </div>
            )}
          </div>

          {/* Rest of your form fields remain the SAME */}
          {/* Budget Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Budget Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Grocery Budget, Entertainment"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1F2937',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              required
            />
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
              Budget Amount *
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
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                min="0"
                step="0.01"
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1F2937',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                required
              />
            </div>
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
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                color: '#1F2937',
                backgroundColor: 'white',
                outline: 'none',
                cursor: 'pointer',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
              onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              required
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* Period */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Period *
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {periods.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, period: period.value })}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: `2px solid ${formData.period === period.value ? '#FF4D94' : '#E5E7EB'}`,
                    backgroundColor: formData.period === period.value ? '#FF4D94' : 'white',
                    color: formData.period === period.value ? 'white' : '#6B7280',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (formData.period !== period.value) {
                      e.currentTarget.style.borderColor = '#FF4D94';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (formData.period !== period.value) {
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }
                  }}
                >
                  {period.label}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '1fr 1fr', 
            gap: '16px',
            marginBottom: '20px'
          }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px',
              }}>
                Start Date *
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
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#1F2937',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  required
                />
              </div>
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px',
              }}>
                End Date *
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
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                  min={formData.startDate}
                  style={{
                    width: '100%',
                    padding: '12px 16px 12px 44px',
                    border: '1px solid #D1D5DB',
                    borderRadius: '8px',
                    fontSize: '16px',
                    color: '#1F2937',
                    backgroundColor: 'white',
                    outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                  onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
                  required
                />
              </div>
            </div>
          </div>

          {/* Color Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Color
            </label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: color,
                    border: `3px solid ${formData.color === color ? '#374151' : color}`,
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  title={color}
                />
              ))}
            </div>
          </div>

          {/* Rollover Option */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F3F4F6'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
          >
            <input
              type="checkbox"
              id="rollover"
              checked={formData.rolloverEnabled}
              onChange={(e) => setFormData({ ...formData, rolloverEnabled: e.target.checked })}
              style={{ 
                width: '20px', 
                height: '20px', 
                cursor: 'pointer',
                accentColor: '#FF4D94'
              }}
            />
            <label htmlFor="rollover" style={{ cursor: 'pointer', flex: 1 }}>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Enable Rollover</div>
              <div style={{ fontSize: '12px', color: '#6B7280' }}>
                Unused funds will be added to next period's budget
              </div>
            </label>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
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
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F3F4F6';
                e.currentTarget.style.borderColor = '#9CA3AF';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'white';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !userId}
              style={{
                flex: 1,
                padding: '14px 24px',
                backgroundColor: userId ? '#FF4D94' : '#9CA3AF',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: userId && !isLoading ? 'pointer' : 'not-allowed',
                opacity: isLoading ? 0.7 : 1,
                transition: 'all 0.2s',
                boxShadow: userId ? '0 4px 12px rgba(255, 77, 148, 0.3)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (userId && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#E63D84';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(255, 77, 148, 0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (userId && !isLoading) {
                  e.currentTarget.style.backgroundColor = '#FF4D94';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(255, 77, 148, 0.3)';
                }
              }}
            >
              {isLoading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Creating...
                </div>
              ) : 'Create Budget'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Add CSS for spinner animation */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default AddBudgetModal;