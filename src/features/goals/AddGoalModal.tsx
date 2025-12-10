import React, { useState } from 'react';
import { FaTimes, FaCalendarAlt, FaPalette, FaTag, FaStickyNote, FaChartLine } from 'react-icons/fa';
// Removed unused import: useCreateGoalMutation
import { useGetTotalIncomeQuery } from '../../features/transactions/transactionsApi';
import { useCreateNotificationMutation } from '../../features/notifications/notificationsApi';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (goalData: any) => Promise<void> | void;
  isLoading: boolean;
  userId?: string;
}

interface FormData {
  name: string;
  targetAmount: string;
  targetDate: string;
  category: string;
  color: string;
  notes: string;
}

// Currency formatting function - moved to top
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Realistic goal checking function - moved to top
const checkIfGoalIsRealistic = (
  targetAmount: number, 
  targetDate: string, 
  monthlyIncome: number
): { isRealistic: boolean; monthlySavingsNeeded: number; message: string } => {
  const today = new Date();
  const target = new Date(targetDate);
  
  const months = Math.max(1, Math.ceil(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.44)
  ));
  
  const monthlySavingsNeeded = targetAmount / months;
  const incomePercentage = (monthlySavingsNeeded / monthlyIncome) * 100;
  
  let isRealistic = true;
  let message = '';
  
  if (monthlyIncome === 0) {
    isRealistic = false;
    message = 'Please add your income first to check if this goal is realistic.';
  } else if (incomePercentage > 30) {
    isRealistic = false;
    message = `This goal requires saving ${incomePercentage.toFixed(1)}% of your monthly income, which may be unrealistic.`;
  } else if (months < 1) {
    isRealistic = false;
    message = 'Target date should be at least 1 month from now.';
  } else if (months > 60) {
    isRealistic = false;
    message = 'Target date is more than 5 years away. Consider setting a shorter-term goal.';
  } else if (monthlySavingsNeeded > monthlyIncome * 0.5) {
    isRealistic = false;
    message = `You would need to save $${monthlySavingsNeeded.toFixed(2)}/month, which is more than 50% of your income.`;
  } else if (monthlySavingsNeeded > monthlyIncome) {
    isRealistic = false;
    message = `You would need to save $${monthlySavingsNeeded.toFixed(2)}/month, which is more than your total monthly income.`;
  } else {
    message = `You need to save $${monthlySavingsNeeded.toFixed(2)}/month to reach this goal.`;
  }
  
  return { isRealistic, monthlySavingsNeeded, message };
};

const AddGoalModal: React.FC<AddGoalModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  isLoading,
  userId 
}) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    targetAmount: '',
    targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
    category: 'vacation',
    color: '#FF4D94',
    notes: '',
  });

  const [createNotification] = useCreateNotificationMutation();
  
  const { data: monthlyIncome = 0 } = useGetTotalIncomeQuery(userId || '', {
    skip: !userId,
  });

  const categories = [
    { value: 'vacation', label: 'Vacation', color: '#FF4D94' },
    { value: 'car', label: 'Car', color: '#3B82F6' },
    { value: 'home', label: 'Home', color: '#10B981' },
    { value: 'education', label: 'Education', color: '#8B5CF6' },
    { value: 'emergency', label: 'Emergency Fund', color: '#F59E0B' },
    { value: 'wedding', label: 'Wedding', color: '#EC4899' },
    { value: 'retirement', label: 'Retirement', color: '#6366F1' },
    { value: 'other', label: 'Other', color: '#6B7280' },
  ];

  const colors = [
    '#FF4D94', '#3B82F6', '#10B981', '#8B5CF6',
    '#F59E0B', '#EC4899', '#6366F1', '#6B7280',
    '#EF4444', '#84CC16', '#06B6D4', '#F97316',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId || userId.trim() === '') {
      console.error('Invalid userId:', userId);
      alert('User ID is missing. Please log in again.');
      return;
    }
    
    if (!formData.name.trim() || !formData.targetAmount || !formData.targetDate) {
      alert('Please fill in all required fields');
      return;
    }

    const targetAmount = parseFloat(formData.targetAmount);
    if (isNaN(targetAmount) || targetAmount <= 0) {
      alert('Please enter a valid target amount greater than 0');
      return;
    }

    const today = new Date();
    const targetDate = new Date(formData.targetDate);
    if (targetDate <= today) {
      alert('Target date must be in the future');
      return;
    }

    const realisticCheck = checkIfGoalIsRealistic(targetAmount, formData.targetDate, monthlyIncome);
    
    if (!realisticCheck.isRealistic) {
      const proceed = window.confirm(
        `⚠️ Goal Feasibility Warning:\n\n${realisticCheck.message}\n\n` +
        `You would need to save ${formatCurrency(realisticCheck.monthlySavingsNeeded)} per month.\n\n` +
        `Do you still want to create this goal?`
      );
      
      if (!proceed) {
        return;
      }
    }

    try {
      const goalData = {
        name: formData.name.trim(),
        targetAmount: targetAmount,
        targetDate: formData.targetDate,
        startDate: new Date().toISOString().split('T')[0],
        category: formData.category,
        color: formData.color,
        notes: formData.notes.trim() || undefined,
        userId: userId.trim(),
        isUnrealistic: !realisticCheck.isRealistic,
      };
      
      // Call the onSubmit prop with the goal data
      await onSubmit(goalData);
      
      // Create notification after successful submission
      try {
        await createNotification({
          title: realisticCheck.isRealistic ? '🎯 New Goal Created' : '⚠️ Unrealistic Goal Created',
          message: realisticCheck.isRealistic 
            ? `You've created a new goal: "${formData.name.trim()}". You need to save ${formatCurrency(realisticCheck.monthlySavingsNeeded)}/month to reach it.`
            : `You've created a goal that may be unrealistic: "${formData.name.trim()}". You need to save ${formatCurrency(realisticCheck.monthlySavingsNeeded)}/month (${((realisticCheck.monthlySavingsNeeded/monthlyIncome)*100).toFixed(1)}% of your income).`,
          type: realisticCheck.isRealistic ? 'goal_milestone' : 'unrealistic_goal',
          userId: userId,
          metadata: {
            goalId: 'new-goal',
            targetAmount: targetAmount,
            monthlySavingsNeeded: realisticCheck.monthlySavingsNeeded,
            isRealistic: realisticCheck.isRealistic,
            goalName: formData.name.trim()
          },
          relatedEntityId: 'new-goal',
          relatedEntityType: 'goal',
          isActionRequired: !realisticCheck.isRealistic,
        }).unwrap();
      } catch (notificationError) {
        console.error('Failed to create notification:', notificationError);
        // Don't fail the whole submission if notification fails
      }
      
      // Reset form and close modal
      setFormData({
        name: '',
        targetAmount: '',
        targetDate: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().split('T')[0],
        category: 'vacation',
        color: '#FF4D94',
        notes: '',
      });
      
      onClose();
      
    } catch (error: any) {
      console.error('❌ Failed to create goal:', error);
      
      let errorMessage = 'Failed to create goal. ';
      
      if (error.data?.message) {
        errorMessage += `Server: ${error.data.message}`;
      } else if (error.message) {
        errorMessage += `Error: ${error.message}`;
      } else {
        errorMessage += 'Unknown error. Check console.';
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
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
      }}>
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            color: '#6B7280',
          }}
          disabled={isLoading}
        >
          <FaTimes />
        </button>

        <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937', marginBottom: '24px' }}>
          Add New Goal
        </h2>

        <form onSubmit={handleSubmit}>
          {/* Goal Name */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              Goal Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Hawaii Vacation, New Car, Emergency Fund"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              required
              disabled={isLoading}
            />
          </div>

          {/* Target Amount */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              Target Amount *
            </label>
            <input
              type="number"
              value={formData.targetAmount}
              onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
              placeholder="0.00"
              min="0"
              step="0.01"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
              }}
              required
              disabled={isLoading}
            />
          </div>

          {/* Target Date */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              Target Date *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="date"
                value={formData.targetDate}
                onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  paddingLeft: '40px',
                }}
                required
                disabled={isLoading}
              />
              <FaCalendarAlt style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#9CA3AF',
              }} />
            </div>
          </div>

          {/* Goal Feasibility Check */}
          {formData.targetAmount && formData.targetDate && parseFloat(formData.targetAmount) > 0 && monthlyIncome > 0 && (
            <div style={{
              marginBottom: '24px',
              padding: '16px',
              backgroundColor: '#F3F4F6',
              borderRadius: '8px',
              borderLeft: '4px solid #3B82F6'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <FaChartLine style={{ color: '#3B82F6' }} />
                <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937', margin: 0 }}>
                  Goal Feasibility Check
                </h3>
              </div>
              
              {(() => {
                const targetAmount = parseFloat(formData.targetAmount);
                const realisticCheck = checkIfGoalIsRealistic(targetAmount, formData.targetDate, monthlyIncome);
                const targetDate = new Date(formData.targetDate);
                const today = new Date();
                const months = Math.max(1, Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30)));
                
                return (
                  <>
                    <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '8px' }}>
                      Based on your income and target date
                    </div>
                    
                    <div style={{ fontSize: '20px', fontWeight: 700, color: '#1F2937', marginBottom: '8px' }}>
                      {formatCurrency(realisticCheck.monthlySavingsNeeded)}
                      <span style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>/month</span>
                    </div>
                    
                    <div style={{ 
                      fontSize: '12px', 
                      color: realisticCheck.isRealistic ? '#10B981' : '#EF4444',
                      fontWeight: realisticCheck.isRealistic ? 400 : 600,
                      backgroundColor: realisticCheck.isRealistic ? '#D1FAE5' : '#FEE2E2',
                      padding: '8px',
                      borderRadius: '4px',
                      marginTop: '8px',
                      borderLeft: `3px solid ${realisticCheck.isRealistic ? '#10B981' : '#EF4444'}`
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                        {realisticCheck.isRealistic ? '✅' : '⚠️'}
                        <span style={{ fontWeight: 600 }}>
                          {realisticCheck.isRealistic ? 'Goal seems realistic' : 'Goal may be unrealistic'}
                        </span>
                      </div>
                      <div>{realisticCheck.message}</div>
                      <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '4px' }}>
                        {months} month{months !== 1 ? 's' : ''} to save {formatCurrency(targetAmount)}
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          )}

          {/* Category */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              <FaTag style={{ marginRight: '8px', color: '#9CA3AF' }} />
              Category
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat.value, color: cat.color })}
                  style={{
                    padding: '12px',
                    backgroundColor: formData.category === cat.value ? cat.color : '#F3F4F6',
                    color: formData.category === cat.value ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                  disabled={isLoading}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              <FaPalette style={{ marginRight: '8px', color: '#9CA3AF' }} />
              Color
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {colors.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setFormData({ ...formData, color })}
                  style={{
                    width: '40px',
                    height: '40px',
                    backgroundColor: color,
                    border: formData.color === color ? '3px solid #1F2937' : '2px solid #E5E7EB',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                  title={color}
                  disabled={isLoading}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: 500, color: '#374151' }}>
              <FaStickyNote style={{ marginRight: '8px', color: '#9CA3AF' }} />
              Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Add any additional details about your goal..."
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '14px',
                minHeight: '100px',
                resize: 'vertical',
              }}
              disabled={isLoading}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#FF4D94',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#E63D84'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#FF4D94'}
            disabled={isLoading}
          >
            {isLoading ? 'Creating Goal...' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddGoalModal;