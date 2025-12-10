// src/pages/GroupsListPage.tsx - FIXED
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, DollarSign, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useGetGroupsQuery } from '../features/groups/groupsApi';

const GroupsListPage: React.FC = () => {
  const navigate = useNavigate();
  const { data: groups = [], isLoading, error, refetch } = useGetGroupsQuery();
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Handle authentication errors
  useEffect(() => {
    if (error) {
      // Type-safe error handling
      const errorData = error as any;
      if (errorData?.status === 401 || errorData?.status === 403) {
        toast.error('Please login to view groups');
        navigate('/login');
      } else {
        toast.error('Failed to load groups');
      }
    }
  }, [error, navigate]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setIsRefreshing(false);
    toast.success('Groups refreshed');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Groups</h1>
          <p className="text-gray-600 mt-1">Manage your expense-sharing groups</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50"
            title="Refresh"
          >
            <ChevronRight className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => navigate('/groups/create')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            Create Group
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Groups</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{groups.length}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Balance</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                KES {groups.reduce((sum: number, group: any) => sum + (group.totalBalance || 0), 0).toLocaleString()}
              </p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                {groups.reduce((sum: number, group: any) => sum + (group.memberCount || 0), 0)}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Groups List */}
      <div className="bg-white rounded-xl border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">All Groups</h2>
          <p className="text-gray-600 mt-1">Click on any group to view details</p>
        </div>

        <div className="divide-y">
          {groups.map((group: any) => (
            <div
              key={group.id}
              className="p-6 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => navigate(`/groups/${group.id}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{group.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{group.description || 'No description'}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-sm text-gray-500">
                        <Users className="h-4 w-4 inline mr-1" />
                        {group.memberCount || 0} members
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">
                        <DollarSign className="h-4 w-4 inline mr-1" />
                        KES {(group.totalBalance || 0).toLocaleString()}
                      </span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className={`text-sm px-2 py-1 rounded-full ${
                        group.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : group.status === 'inactive'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {group.status || 'unknown'}
                      </span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="p-12 text-center">
            <Users className="h-16 w-16 text-gray-300 mx-auto" />
            <p className="text-gray-500 mt-4">No groups yet. Create your first group to get started!</p>
            <button
              onClick={() => navigate('/groups/create')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Create Your First Group
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default GroupsListPage;