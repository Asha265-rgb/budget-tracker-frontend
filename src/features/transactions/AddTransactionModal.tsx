import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../app/store';
import { addTransaction } from '../../features/transactions/transactionsSlice';
import { fetchAccounts } from '../../features/accounts/accountsSlice';
import { 
  FaTimes, 
  FaMoneyBillWave, 
  FaShoppingCart,
  FaCar,
  FaFilm,
  FaHome,
  FaHeartbeat,
  FaGraduationCap,
  FaDollarSign,
  FaTag,
  FaCalendar,
  FaStickyNote,
  FaExchangeAlt,
  FaCoffee,
  FaPlane,
  FaGift,
  FaMobileAlt
} from 'react-icons/fa';

interface AddTransactionModalProps {
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

const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, userId }) => {
  const dispatch = useDispatch<AppDispatch>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Get accounts from Redux store
  const accounts = useSelector((state: any) => state.accounts?.accounts || []) as Account[];
  const isLoadingAccounts = useSelector((state: any) => state.accounts?.isLoading || false);
  
  // Form state
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    type: 'expense' as 'income' | 'expense',
    category: 'Other',
    date: new Date().toISOString().split('T')[0],
    accountId: '',
    notes: '',
    tags: [] as string[],
    isRecurring: false,
    isSplit: false,
  });

  const [tagInput, setTagInput] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Fetch accounts when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      dispatch(fetchAccounts(userId));
    }
  }, [dispatch, isOpen, userId]);

  // Category options with icons - Enhanced list
  const categories = [
    { value: 'Food & Dining', label: 'Food & Dining', icon: <FaShoppingCart />, color: '#FF4D94' },
    { value: 'Transportation', label: 'Transportation', icon: <FaCar />, color: '#FFD700' },
    { value: 'Shopping', label: 'Shopping', icon: <FaShoppingCart />, color: '#8B5CF6' },
    { value: 'Entertainment', label: 'Entertainment', icon: <FaFilm />, color: '#10B981' },
    { value: 'Bills & Utilities', label: 'Bills & Utilities', icon: <FaHome />, color: '#EF4444' },
    { value: 'Healthcare', label: 'Healthcare', icon: <FaHeartbeat />, color: '#3B82F6' },
    { value: 'Education', label: 'Education', icon: <FaGraduationCap />, color: '#F59E0B' },
    { value: 'Salary', label: 'Salary', icon: <FaDollarSign />, color: '#06B6D4' },
    { value: 'Coffee', label: 'Coffee', icon: <FaCoffee />, color: '#8B4513' },
    { value: 'Travel', label: 'Travel', icon: <FaPlane />, color: '#4169E1' },
    { value: 'Gifts & Donations', label: 'Gifts', icon: <FaGift />, color: '#FF69B4' },
    { value: 'Technology', label: 'Technology', icon: <FaMobileAlt />, color: '#00CED1' },
    { value: 'Investments', label: 'Investments', icon: <FaExchangeAlt />, color: '#32CD32' },
    { value: 'Other', label: 'Other', icon: <FaTag />, color: '#ADB5BD' },
  ];

  // Common tags for quick selection
  const commonTags = ['groceries', 'urgent', 'tax-deductible', 'business', 'personal', 'subscription'];

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
    
    if (!formData.accountId) {
      errors.accountId = 'Please select an account';
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
      
      // Create transaction object matching backend entity
      const transactionData = {
        description: formData.description.trim(),
        amount: amount,
        type: formData.type,
        category: formData.category,
        date: new Date(formData.date + 'T00:00:00').toISOString(), // Include time for backend
        accountId: formData.accountId,
        userId: userId,
        notes: formData.notes.trim() || undefined,
        tags: formData.tags.length > 0 ? formData.tags : undefined,
        isRecurring: formData.isRecurring,
        isSplit: formData.isSplit,
      };

      const result = await dispatch(addTransaction(transactionData)).unwrap();
      console.log('Transaction added successfully:', result);
      
      // Reset form
      setFormData({
        description: '',
        amount: '',
        type: 'expense',
        category: 'Other',
        date: new Date().toISOString().split('T')[0],
        accountId: '',
        notes: '',
        tags: [],
        isRecurring: false,
        isSplit: false,
      });
      setFormErrors({});
      
      onClose(); // Close modal
    } catch (error: any) {
      console.error('Failed to add transaction:', error);
      alert(error.message || 'Failed to add transaction. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData({ 
      ...formData, 
      tags: formData.tags.filter(tag => tag !== tagToRemove) 
    });
  };

  const handleQuickTag = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData({ ...formData, tags: [...formData.tags, tag] });
    }
  };

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = e.target.value;
    setFormData({ ...formData, accountId });
    
    // Clear account error if user selects something
    if (accountId && formErrors.accountId) {
      setFormErrors({ ...formErrors, accountId: '' });
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
      animation: 'fadeIn 0.3s ease-out'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        animation: 'slideUp 0.3s ease-out'
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
            <FaMoneyBillWave />
            Add New Transaction
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
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          >
            <FaTimes />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
          {/* Type Selection */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Transaction Type *
            </label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'expense' })}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.type === 'expense' ? '#EF4444' : '#E5E7EB'}`,
                  backgroundColor: formData.type === 'expense' ? '#FEE2E2' : 'white',
                  color: formData.type === 'expense' ? '#EF4444' : '#6B7280',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <FaMoneyBillWave />
                Expense
              </button>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, type: 'income' })}
                style={{
                  flex: 1,
                  padding: '16px',
                  borderRadius: '8px',
                  border: `2px solid ${formData.type === 'income' ? '#10B981' : '#E5E7EB'}`,
                  backgroundColor: formData.type === 'income' ? '#D1FAE5' : 'white',
                  color: formData.type === 'income' ? '#10B981' : '#6B7280',
                  fontSize: '16px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                }}
              >
                <FaDollarSign />
                Income
              </button>
            </div>
          </div>

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
              placeholder="What was this transaction for?"
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
              onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
              onBlur={(e) => e.target.style.borderColor = formErrors.description ? '#EF4444' : '#D1D5DB'}
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
              <span style={{
                position: 'absolute',
                left: '16px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#6B7280',
                fontSize: '16px',
              }}>
                $
              </span>
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
                onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                onBlur={(e) => e.target.style.borderColor = formErrors.amount ? '#EF4444' : '#D1D5DB'}
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
              gap: '8px',
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '4px'
            }}>
              {categories.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.value })}
                  style={{
                    padding: '12px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${formData.category === category.value ? category.color : '#E5E7EB'}`,
                    backgroundColor: formData.category === category.value ? `${category.color}20` : 'white',
                    color: formData.category === category.value ? category.color : '#6B7280',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '16px' }}>{category.icon}</span>
                  <span style={{ 
                    maxWidth: '100%', 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap' 
                  }}>
                    {category.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Account */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px',
            }}>
              Account *
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
            ) : accounts.length === 0 ? (
              <div style={{
                padding: '12px',
                textAlign: 'center',
                color: '#EF4444',
                border: '1px dashed #EF4444',
                borderRadius: '8px',
                backgroundColor: '#FEE2E2'
              }}>
                No accounts found. Please create an account first.
              </div>
            ) : (
              <select
                value={formData.accountId}
                onChange={handleAccountChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${formErrors.accountId ? '#EF4444' : '#D1D5DB'}`,
                  borderRadius: '8px',
                  fontSize: '16px',
                  color: '#1F2937',
                  backgroundColor: 'white',
                  outline: 'none',
                  cursor: 'pointer',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                onBlur={(e) => e.target.style.borderColor = formErrors.accountId ? '#EF4444' : '#D1D5DB'}
                required
              >
                <option value="">Select an account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.type}) - ${account.balance.toFixed(2)}
                  </option>
                ))}
              </select>
            )}
            {formErrors.accountId && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {formErrors.accountId}
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
              Date *
            </label>
            <div style={{ position: 'relative' }}>
              <FaCalendar style={{
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
                max={new Date().toISOString().split('T')[0]} // Don't allow future dates
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
                onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                onBlur={(e) => e.target.style.borderColor = formErrors.date ? '#EF4444' : '#D1D5DB'}
                required
              />
            </div>
            {formErrors.date && (
              <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                {formErrors.date}
              </p>
            )}
          </div>

          {/* Tags */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{
                fontSize: '14px',
                fontWeight: 500,
                color: '#374151',
              }}>
                Tags
              </label>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                {formData.tags.length} tag{formData.tags.length !== 1 ? 's' : ''} added
              </span>
            </div>
            
            {/* Quick Tags */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
              {commonTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleQuickTag(tag)}
                  disabled={formData.tags.includes(tag)}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: formData.tags.includes(tag) ? '#FF4D94' : '#F3F4F6',
                    color: formData.tags.includes(tag) ? 'white' : '#374151',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 500,
                    cursor: formData.tags.includes(tag) ? 'default' : 'pointer',
                    opacity: formData.tags.includes(tag) ? 0.7 : 1,
                    transition: 'all 0.2s'
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
            
            {/* Tag Input */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a custom tag (press Enter)"
                style={{
                  flex: 1,
                  padding: '12px 16px',
                  border: '1px solid #D1D5DB',
                  borderRadius: '8px',
                  fontSize: '14px',
                  color: '#1F2937',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
              <button
                type="button"
                onClick={handleAddTag}
                disabled={!tagInput.trim()}
                style={{
                  padding: '12px 20px',
                  backgroundColor: tagInput.trim() ? '#FF4D94' : '#E5E7EB',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: tagInput.trim() ? 'pointer' : 'not-allowed',
                  transition: 'background-color 0.2s',
                }}
              >
                Add
              </button>
            </div>
            
            {/* Selected Tags */}
            {formData.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {formData.tags.map((tag) => (
                  <div
                    key={tag}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#FF4D94',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'white',
                        fontSize: '10px',
                        cursor: 'pointer',
                        padding: '2px',
                        opacity: 0.8,
                        transition: 'opacity 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                      onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
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
              Notes
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
                placeholder="Add any additional notes (optional)..."
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
                  transition: 'border-color 0.2s',
                  fontFamily: 'inherit',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF4D94'}
                onBlur={(e) => e.target.style.borderColor = '#D1D5DB'}
              />
            </div>
          </div>

          {/* Recurring & Split Options */}
          <div style={{ 
            marginBottom: '24px',
            display: 'flex',
            gap: '20px',
            padding: '16px',
            backgroundColor: '#F9FAFB',
            borderRadius: '8px'
          }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              flex: 1,
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: `2px solid ${formData.isRecurring ? '#FF4D94' : '#D1D5DB'}`,
                borderRadius: '4px',
                backgroundColor: formData.isRecurring ? '#FF4D94' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                {formData.isRecurring && (
                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                )}
              </div>
              <input
                type="checkbox"
                checked={formData.isRecurring}
                onChange={(e) => setFormData({ ...formData, isRecurring: e.target.checked })}
                style={{ display: 'none' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Recurring</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Automatically repeat this transaction</div>
              </div>
            </label>
            
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              cursor: 'pointer',
              flex: 1,
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                border: `2px solid ${formData.isSplit ? '#FF4D94' : '#D1D5DB'}`,
                borderRadius: '4px',
                backgroundColor: formData.isSplit ? '#FF4D94' : 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}>
                {formData.isSplit && (
                  <span style={{ color: 'white', fontSize: '12px' }}>✓</span>
                )}
              </div>
              <input
                type="checkbox"
                checked={formData.isSplit}
                onChange={(e) => setFormData({ ...formData, isSplit: e.target.checked })}
                style={{ display: 'none' }}
              />
              <div>
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>Split</div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>Split with others</div>
              </div>
            </label>
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
                border: '1px solid #D1D5DB',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#9CA3AF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }
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
                backgroundColor: '#FF4D94',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: 500,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.7 : 1,
                transition: 'background-color 0.2s',
              }}
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#E63D84';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#FF4D94';
                }
              }}
            >
              {isSubmitting ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: 'white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Adding...
                </div>
              ) : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>

      {/* CSS Animations */}
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slideUp {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default AddTransactionModal;