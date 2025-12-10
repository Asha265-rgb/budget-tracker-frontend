import React, { useState } from 'react';
import { X, Users, Edit2 } from 'lucide-react';
import { toast } from 'sonner';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => void;
  isLoading: boolean;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    currency: 'KES',
    color: '#EC4899', // Pink color
    icon: '👥',
  });

  const [iconOptions] = useState(['👥', '🏠', '👨‍👩‍👧‍👦', '👨‍🎓', '💼', '✈️', '🎉', '💰', '🍕', '🏖️']);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error('Group name is required');
      return;
    }
    console.log('Submitting group data:', formData);
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" 
        onClick={onClose}
      ></div>

      {/* Modal Container */}
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Centering trick */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        {/* Modal Content */}
        <div className="relative inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Create New Group</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                type="button"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                {/* Group Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Group Icon
                  </label>
                  <div className="grid grid-cols-5 gap-3">
                    {iconOptions.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl transition-all duration-200 ${
                          formData.icon === icon
                            ? 'ring-2 ring-pink-500 bg-pink-50 scale-110'
                            : 'bg-gray-100 hover:bg-gray-200 hover:scale-105'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Group Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Roommates 2025, Family Trips, Work Team"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all"
                    required
                    autoFocus
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description (Optional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="e.g., For rent, food & bills shared expenses"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Group Color
                  </label>
                  <div className="flex items-center gap-4">
                    <div
                      className="h-10 w-10 rounded-lg border border-gray-300"
                      style={{ backgroundColor: formData.color }}
                    />
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="h-10 w-20 cursor-pointer"
                    />
                    <span className="text-sm text-gray-600">{formData.color}</span>
                  </div>
                </div>

                {/* Currency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Currency
                  </label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent outline-none transition-all bg-white"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                    <option value="GBP">British Pound (GBP)</option>
                  </select>
                </div>

                {/* Permissions Note */}
                <div className="bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-6 w-6 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Edit2 className="h-3 w-3 text-white" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">You will be the Group Admin</p>
                      <p className="text-sm text-gray-600 mt-1">
                        As the creator, you'll have full control over group settings, member management, and expense approvals.
                      </p>
                    </div>
                  </div>
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
                    disabled={isLoading}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <Users className="h-4 w-4" />
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
    </div>
  );
};

export default CreateGroupModal;