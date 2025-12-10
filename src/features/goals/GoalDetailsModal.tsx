import React, { useState } from 'react';
import {
  FaTimes,
  FaCalendarAlt,
  FaTag,
  FaBullseye,
  FaEdit,
  FaTrash,
  FaArrowLeft,
  FaInfoCircle,
} from 'react-icons/fa';
// FIXED: Use type-only import for Goal and proper imports
import type { Goal } from './goalsApi';
import { useUpdateGoalMutation, useDeleteGoalMutation } from './goalsApi';

interface GoalDetailsModalProps {
  goal: Goal;
  isOpen: boolean;
  onClose: () => void;
  onGoalUpdated: () => void;
  onGoalDeleted: () => void;
}

const GoalDetailsModal: React.FC<GoalDetailsModalProps> = ({
  goal,
  isOpen,
  onClose,
  onGoalUpdated,
  onGoalDeleted,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: goal.name,
    targetAmount: goal.targetAmount.toString(),
    targetDate: goal.targetDate.split('T')[0],
    category: goal.category,
    color: goal.color,
    notes: goal.notes || '',
  });

  const [updateGoal] = useUpdateGoalMutation();
  const [deleteGoal] = useDeleteGoalMutation();

  const calculateProgress = () => {
    // FIXED: Use currentAmount instead of savedAmount
    const currentAmount = goal.currentAmount || 0;
    const percentage = (currentAmount / goal.targetAmount) * 100;
    return Math.min(100, Math.max(0, percentage));
  };

  const calculateDaysRemaining = () => {
    const targetDate = new Date(goal.targetDate);
    const today = new Date();
    const timeDiff = targetDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysRemaining);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleUpdate = async () => {
    try {
      // FIXED: Update to match API expectation
      const updates = {
        name: editData.name.trim(),
        targetAmount: parseFloat(editData.targetAmount),
        targetDate: editData.targetDate,
        category: editData.category,
        color: editData.color,
        notes: editData.notes.trim(),
      };

      await updateGoal({ id: goal.id, updates }).unwrap();
      setIsEditing(false);
      onGoalUpdated();
    } catch (error) {
      console.error('Failed to update goal:', error);
      alert('Failed to update goal');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete the goal "${goal.name}"?`)) {
      try {
        await deleteGoal(goal.id).unwrap();
        onGoalDeleted();
        onClose();
      } catch (error) {
        console.error('Failed to delete goal:', error);
        alert('Failed to delete goal');
      }
    }
  };

  if (!isOpen) return null;

  const progress = calculateProgress();
  const daysRemaining = calculateDaysRemaining();
  const currentAmount = goal.currentAmount || 0;

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '16px',
          width: '90%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px',
            borderBottom: '1px solid #E5E7EB',
            backgroundColor: goal.color || '#FF4D94',
            color: 'white',
            borderTopLeftRadius: '16px',
            borderTopRightRadius: '16px',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
            }}
          >
            <FaTimes />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
              }}
            >
              <FaBullseye />
            </div>
            <div>
              <h2
                style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  margin: 0,
                  color: 'white',
                }}
              >
                {isEditing ? (
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '24px',
                      fontWeight: 700,
                      width: '100%',
                    }}
                    placeholder="Goal Name"
                  />
                ) : (
                  goal.name
                )}
              </h2>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  opacity: 0.9,
                  marginTop: '4px',
                }}
              >
                <FaTag size={12} />
                <span style={{ textTransform: 'capitalize' }}>{goal.category}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div style={{ padding: '24px' }}>
          {/* Progress Section */}
          <div style={{ marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', margin: 0 }}>Progress</h3>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#1F2937' }}>
                {formatCurrency(currentAmount)} / {formatCurrency(goal.targetAmount)}
              </div>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                height: '12px',
                backgroundColor: '#E5E7EB',
                borderRadius: '6px',
                overflow: 'hidden',
                marginBottom: '8px',
              }}
            >
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  backgroundColor: goal.color || '#FF4D94',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6B7280' }}>
              <span>{progress.toFixed(1)}% Complete</span>
              <span>{daysRemaining} days remaining</span>
            </div>
          </div>

          {/* Realistic Goal Warning */}
          {goal.isUnrealistic && (
            <div
              style={{
                padding: '16px',
                backgroundColor: '#FEF2F2',
                borderRadius: '8px',
                marginBottom: '24px',
                borderLeft: '4px solid #EF4444',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    backgroundColor: '#EF4444',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  ⚠️
                </div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#991B1B', margin: 0 }}>
                  Unrealistic Goal Warning
                </h4>
              </div>
              <div style={{ fontSize: '13px', color: '#991B1B', lineHeight: 1.4 }}>
                This goal has been flagged as potentially unrealistic based on your income and timeline.
                Consider adjusting your target amount or date.
              </div>
              <div
                style={{
                  fontSize: '12px',
                  color: '#DC2626',
                  marginTop: '8px',
                  padding: '8px',
                  backgroundColor: '#FEE2E2',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: '4px' }}>💡 Suggestions:</div>
                <div>• Increase your monthly income</div>
                <div>• Extend your target date</div>
                <div>• Reduce your target amount</div>
                <div>• Save a larger percentage of your income</div>
              </div>
            </div>
          )}

          {/* Goal Details */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
              Goal Details
            </h3>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
              }}
            >
              {/* Target Amount */}
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Target Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937' }}>
                  {isEditing ? (
                    <input
                      type="number"
                      value={editData.targetAmount}
                      onChange={(e) => setEditData({ ...editData, targetAmount: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '16px',
                      }}
                      min="0"
                      step="0.01"
                    />
                  ) : (
                    formatCurrency(goal.targetAmount)
                  )}
                </div>
              </div>

              {/* Target Date */}
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Target Date</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarAlt style={{ color: '#9CA3AF' }} />
                  {isEditing ? (
                    <input
                      type="date"
                      value={editData.targetDate}
                      onChange={(e) => setEditData({ ...editData, targetDate: e.target.value })}
                      style={{
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '6px',
                        fontSize: '16px',
                        flex: 1,
                      }}
                    />
                  ) : (
                    formatDate(goal.targetDate)
                  )}
                </div>
              </div>

              {/* Current Amount Saved */}
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Current Amount</div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#10B981' }}>
                  {formatCurrency(currentAmount)}
                </div>
              </div>

              {/* Created Date */}
              <div>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Created On</div>
                <div style={{ fontSize: '16px', color: '#1F2937', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FaCalendarAlt style={{ color: '#9CA3AF', fontSize: '14px' }} />
                  {formatDate(goal.createdAt)}
                </div>
              </div>
            </div>

            {/* Notes */}
            {(!isEditing && goal.notes) || isEditing ? (
              <div style={{ marginTop: '16px' }}>
                <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaInfoCircle size={12} />
                  Notes
                </div>
                {isEditing ? (
                  <textarea
                    value={editData.notes}
                    onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '1px solid #D1D5DB',
                      borderRadius: '8px',
                      fontSize: '14px',
                      minHeight: '80px',
                      resize: 'vertical',
                    }}
                    placeholder="Add notes about your goal..."
                  />
                ) : (
                  <div style={{
                    padding: '12px',
                    backgroundColor: '#F3F4F6',
                    borderRadius: '8px',
                    fontSize: '14px',
                    color: '#1F2937',
                    lineHeight: 1.5,
                  }}>
                    {goal.notes}
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            {isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#F3F4F6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaArrowLeft />
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#10B981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaEdit />
                  Save Changes
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleDelete}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    border: '1px solid #FECACA',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaTrash />
                  Delete Goal
                </button>
                <button
                  onClick={() => setIsEditing(true)}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#FF4D94',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 500,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <FaEdit />
                  Edit Goal
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalDetailsModal;