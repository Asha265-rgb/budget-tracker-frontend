import React, { useState, useEffect } from 'react';
import { FaTimes, FaWallet, FaCreditCard, FaPiggyBank, FaUniversity, FaChartLine } from 'react-icons/fa';
import { useCreateAccountMutation } from './accountsApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  userId?: string; // Add this as optional prop
}

const accountTypes = [
  { value: 'cash', label: 'Cash', icon: FaWallet, color: 'text-green-500' },
  { value: 'bank', label: 'Bank Account', icon: FaUniversity, color: 'text-blue-500' },
  { value: 'credit_card', label: 'Credit Card', icon: FaCreditCard, color: 'text-red-500' },
  { value: 'savings', label: 'Savings', icon: FaPiggyBank, color: 'text-yellow-500' },
  { value: 'investment', label: 'Investment', icon: FaChartLine, color: 'text-purple-500' },
  { value: 'other', label: 'Other', icon: FaWallet, color: 'text-gray-500' },
];

const currencyOptions = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'NGN'];

const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose, onSuccess, userId: propUserId }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: 'cash' as const,
    balance: 0,
    currency: 'USD',
    accountNumber: '',
    bankName: '',
    color: '#3B82F6',
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const { user, token } = useSelector((state: RootState) => state.auth);
  const [createAccount] = useCreateAccountMutation();

  useEffect(() => {
    if (isOpen) {
      setSubmitError(null);
      setSubmitSuccess(false);
      setIsCreating(false);
    }
  }, [isOpen]);

  const getUserId = (): string | null => {
    console.log('🔍 Getting user ID for account creation...');
    
    // Priority 1: Use prop userId if provided
    if (propUserId) {
      console.log('✅ Using userId from props:', propUserId);
      return propUserId;
    }
    
    // Priority 2: Check Redux store
    if (user?.id) {
      console.log('✅ Using userId from Redux store:', user.id);
      return user.id;
    }
    
    // Priority 3: Check localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        if (parsedUser.id) {
          console.log('✅ Using userId from localStorage:', parsedUser.id);
          return parsedUser.id;
        }
      } catch (err) {
        console.warn('Could not parse user from localStorage');
      }
    }
    
    // Priority 4: Check token in localStorage for user ID
    const storedToken = localStorage.getItem('token');
    if (storedToken) {
      try {
        // Try to extract user ID from token (if it's JWT)
        const payload = JSON.parse(atob(storedToken.split('.')[1]));
        if (payload.userId || payload.sub) {
          const userIdFromToken = payload.userId || payload.sub;
          console.log('✅ Using userId from JWT token:', userIdFromToken);
          return userIdFromToken;
        }
      } catch (err) {
        console.warn('Could not extract user ID from token');
      }
    }
    
    console.error('❌ Could not find user ID anywhere!');
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.clear();
    console.log('=== ADD ACCOUNT SUBMIT ===');
    
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsCreating(true);
    
    try {
      const tokenFromStorage = localStorage.getItem('token');
      const currentToken = token || tokenFromStorage;
      
      console.log('Auth check:', { 
        hasToken: !!currentToken,
        token: currentToken?.substring(0, 20) + '...'
      });
      
      if (!currentToken) {
        throw new Error('Please login first to add an account');
      }
      
      // Get the user ID (prefers prop, falls back to other methods)
      const userId = getUserId();
      
      if (!userId) {
        throw new Error('Could not find user ID. Please login again.');
      }
      
      console.log('✅ Using user ID:', userId);
      console.log('User ID source:', propUserId ? 'from props' : 'from auth system');
      
      // Validate required fields
      if (!formData.name.trim()) {
        throw new Error('Account name is required');
      }
      
      // Prepare account data - ONLY what backend expects
      const accountData = {
        name: formData.name.trim(),
        type: formData.type,
        balance: Number(formData.balance) || 0,
        currency: formData.currency || 'USD',
        userId: userId, // ← Use the obtained user ID
      };
      
      // Add optional fields only if they have values
      if (formData.accountNumber.trim()) {
        Object.assign(accountData, { accountNumber: formData.accountNumber.trim() });
      }
      
      if (formData.bankName.trim()) {
        Object.assign(accountData, { bankName: formData.bankName.trim() });
      }
      
      if (formData.color && formData.color !== '#3B82F6') {
        Object.assign(accountData, { color: formData.color });
      }
      
      console.log('📤 Sending account data to backend:', accountData);
      console.log('Data structure:', JSON.stringify(accountData, null, 2));
      
      // Create account - API will transform data for backend
      const result = await createAccount(accountData).unwrap();
      
      console.log('✅ Account created successfully:', result);
      
      setSubmitSuccess(true);
      
      // Reset form
      setFormData({
        name: '',
        type: 'cash',
        balance: 0,
        currency: 'USD',
        accountNumber: '',
        bankName: '',
        color: '#3B82F6',
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('❌ Failed to create account:', err);
      
      if (err.status === 500) {
        console.error('Server 500 Error details:', err.data);
        setSubmitError(`Server error: ${err.data?.message || 'Check backend logs for details'}`);
      } 
      else if (err.status === 400) {
        console.error('Validation error:', err.data);
        setSubmitError(`Validation error: ${err.data?.message || JSON.stringify(err.data, null, 2)}`);
      }
      else if (err.message) {
        setSubmitError(err.message);
      } else if (err.data?.message) {
        setSubmitError(err.data.message);
      } else {
        setSubmitError('Failed to create account. Please try again.');
      }
      
    } finally {
      setIsCreating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleTypeChange = (type: string) => {
    setFormData(prev => ({
      ...prev,
      type: type as any,
    }));
  };

  // Test function to show current user ID
  const showUserInfo = () => {
    const userId = getUserId();
    const userFromStore = user;
    const userFromStorage = localStorage.getItem('user');
    
    console.log('👤 User Info:', {
      fromRedux: userFromStore,
      fromLocalStorage: userFromStorage ? JSON.parse(userFromStorage) : null,
      fromProps: propUserId,
      finalUserId: userId
    });
    
    alert(`User Info:\n\nFrom Props: ${propUserId || 'Not provided'}\nFrom Redux: ${userFromStore?.id || 'Not found'}\nFrom Storage: ${userFromStorage ? JSON.parse(userFromStorage).id : 'Not found'}\nFinal User ID: ${userId || 'Not found'}`);
  };

  if (!isOpen) return null;

  const selectedType = accountTypes.find(type => type.value === formData.type);
  const isFormValid = formData.name.trim() !== '';
  const isButtonDisabled = isCreating || !isFormValid;
  const currentUserId = getUserId();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isCreating) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            {selectedType && (
              <selectedType.icon className={`text-2xl ${selectedType.color}`} />
            )}
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Add New Account</h2>
              <div className="text-xs text-gray-500 mt-1">
                {submitSuccess 
                  ? '✅ Account created!' 
                  : token 
                    ? `Logged in as ${user?.name || 'User'} (ID: ${currentUserId?.substring(0, 8)}...)`
                    : 'Please login to add account'
                }
                {propUserId && <div className="text-green-600">✓ Using provided user ID</div>}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={isCreating}
          >
            <FaTimes size={24} />
          </button>
        </div>

        {submitSuccess && (
          <div className="m-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            ✅ Account created successfully! Closing...
          </div>
        )}
        
        {submitError && (
          <div className="m-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ❌ Error: {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                formData.name.trim() ? 'border-gray-300 focus:ring-blue-500' : 'border-red-300 focus:ring-red-500'
              }`}
              placeholder="e.g., Main Checking Account"
              required
              disabled={isCreating}
            />
            {!formData.name.trim() && (
              <p className="text-red-500 text-xs mt-1">Account name is required</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {accountTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => !isCreating && handleTypeChange(type.value)}
                    className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    } ${isCreating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    disabled={isCreating}
                  >
                    <Icon className={`text-2xl mb-2 ${type.color}`} />
                    <span className="text-sm font-medium text-gray-700">{type.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Initial Balance
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                $
              </span>
              <input
                type="number"
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                disabled={isCreating}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Currency *
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              disabled={isCreating}
            >
              {currencyOptions.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bank Name (Optional)
            </label>
            <input
              type="text"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Chase Bank"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Number (Optional)
            </label>
            <input
              type="text"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Last 4 digits"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Color (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-10 h-10 cursor-pointer"
                disabled={isCreating}
              />
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="#3B82F6"
                disabled={isCreating}
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isButtonDisabled}
              className={`flex-1 px-6 py-3 font-medium rounded-lg transition-all ${
                isButtonDisabled
                  ? 'bg-gray-400 text-gray-700 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
              }`}
            >
              {isCreating ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </div>

          {/* Debug info */}
          <div className="text-xs text-gray-500 pt-4 border-t border-gray-100">
            <button 
              type="button" 
              onClick={showUserInfo}
              className="mb-2 text-blue-600 hover:underline"
            >
              Show User Info
            </button>
            <div>User ID: {currentUserId ? `✅ ${currentUserId.substring(0, 20)}...` : '❌ Not found'}</div>
            <div>User ID Source: {propUserId ? 'From props' : 'From auth system'}</div>
            <div>Logged in: {token ? '✅ Yes' : '❌ No'}</div>
            <div>Form: {isFormValid ? '✅ Valid' : '❌ Needs name'}</div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccountModal;