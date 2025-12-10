import React from 'react';
import { X, Users, Plus, ChevronRight, Crown, Users as UsersIcon } from 'lucide-react';

interface GroupSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  groups: Array<{
    id: string;
    name: string;
    description?: string;
    createdBy: string;
    members?: number;
  }>;
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: () => void;
}

const GroupSelectorModal: React.FC<GroupSelectorModalProps> = ({
  isOpen,
  onClose,
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose}></div>

        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-6 pt-6 pb-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center">
                  <UsersIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Your Groups</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Create New Group Button */}
              <button
                onClick={() => {
                  onClose();
                  onCreateGroup();
                }}
                className="w-full p-4 border-2 border-dashed border-pink-300 rounded-xl hover:border-pink-400 hover:bg-pink-50 transition-all duration-200 group"
              >
                <div className="flex items-center justify-center gap-3">
                  <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Plus className="h-5 w-5 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-800">Create New Group</p>
                    <p className="text-sm text-gray-600">Start tracking expenses with friends or family</p>
                  </div>
                </div>
              </button>

              {/* Group List */}
              <div className="max-h-96 overflow-y-auto pr-2">
                {groups.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-20 w-20 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Groups Yet</h3>
                    <p className="text-gray-600 mb-6">Create your first group to get started</p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => onSelectGroup(group.id)}
                      className={`w-full p-4 rounded-xl transition-all duration-200 text-left mb-3 last:mb-0 ${
                        selectedGroupId === group.id
                          ? 'bg-gradient-to-r from-pink-50 to-rose-50 border-2 border-pink-500 shadow-md'
                          : 'border border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            selectedGroupId === group.id
                              ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                              : 'bg-pink-100'
                          }`}>
                            <Users className={`h-6 w-6 ${
                              selectedGroupId === group.id ? 'text-white' : 'text-pink-600'
                            }`} />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-bold text-gray-800">{group.name}</p>
                              {group.createdBy === group.createdBy && (
                                <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full flex items-center gap-1">
                                  <Crown className="h-3 w-3" />
                                  Admin
                                </span>
                              )}
                            </div>
                            {group.description && (
                              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2">
                              <span className="text-xs text-gray-500">
                                {group.members || 1} member{group.members !== 1 ? 's' : ''}
                              </span>
                              <span className="text-xs text-gray-500">
                                Created by you
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {selectedGroupId === group.id && (
                            <span className="px-2 py-1 text-xs font-medium bg-pink-100 text-pink-700 rounded-full">
                              Active
                            </span>
                          )}
                          <ChevronRight className={`h-5 w-5 ${
                            selectedGroupId === group.id ? 'text-pink-500' : 'text-gray-400'
                          }`} />
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              {/* Footer Stats */}
              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{groups.length}</span> group{groups.length !== 1 ? 's' : ''} total
                  </div>
                  <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-medium rounded-lg hover:shadow-lg transition-all duration-300"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupSelectorModal;