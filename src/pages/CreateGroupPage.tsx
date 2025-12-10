// src/pages/CreateGroupPage.tsx - UPDATED
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Users } from 'lucide-react';
import { toast } from 'sonner';
import { useCreateGroupMutation } from '../features/groups/groupsApi';

const CreateGroupPage = () => {
  const navigate = useNavigate();
  const [createGroup, { isLoading }] = useCreateGroupMutation();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'KES',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }

    try {
      // Get userId from localStorage just to check if user is logged in
      const userId = localStorage.getItem('userId');
      
      if (!userId) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      console.log('📝 Creating group with data:', formData);

      // ✅ FIXED: Remove userId from request - backend gets it from auth token
      const result = await createGroup({
        name: formData.name,
        description: formData.description,
        currency: formData.currency,
        // ❌ REMOVED: userId: userId, - Backend gets user from JWT token
      });

      if ('data' in result) {
        toast.success(`Group "${formData.name}" created successfully!`);
        navigate('/groups');
      } else if ('error' in result) {
        console.error('Create group error:', result.error);
        toast.error('Failed to create group');
      }
    } catch (error: any) {
      console.error('Invitation error:', error);
      toast.error(error.message || 'Failed to create group');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/groups')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Groups
          </button>
          
          <h1 className="text-3xl font-bold text-gray-800">Create New Group</h1>
          <p className="text-gray-600 mt-2">Create a group to track shared expenses</p>
        </div>

        {/* Form */}
        <div className="bg-white border rounded-2xl p-6 shadow-sm">
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Group Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="e.g., Roommates 2024, Family Expenses"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the purpose of this group..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Currency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="KES">Kenyan Shilling (KES)</option>
                  <option value="USD">US Dollar (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                  <option value="GBP">British Pound (GBP)</option>
                </select>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">How groups work</p>
                    <ul className="text-sm text-blue-700 mt-2 space-y-1">
                      <li>• You'll become the group admin automatically</li>
                      <li>• You can invite members after creating the group</li>
                      <li>• Track shared expenses and balances</li>
                      <li>• Settle up with members easily</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate('/groups')}
                  className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !formData.name.trim()}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl hover:shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5" />
                      Create Group
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupPage;