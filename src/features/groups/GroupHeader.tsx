import React from 'react';
import { Users, Calendar, Crown, Settings, Bell } from 'lucide-react';

interface GroupHeaderProps {
  group: any;
  isAdmin: boolean;
  userName: string;
  onAddMember: () => void;
}

const GroupHeader: React.FC<GroupHeaderProps> = ({
  group,
  isAdmin,
  userName,
  onAddMember,
}) => {
  return (
    <div className="bg-gradient-to-r from-pink-500 via-rose-500 to-pink-600 text-white p-6 rounded-2xl shadow-lg">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{group?.name || 'Group Dashboard'}</h1>
              <div className="flex items-center gap-4 mt-2">
                <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  <Calendar className="h-3 w-3 mr-1" />
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'short', 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
                <span className="inline-flex items-center px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm">
                  {isAdmin ? (
                    <>
                      <Crown className="h-3 w-3 mr-1" />
                      Group Admin
                    </>
                  ) : (
                    <>
                      <Users className="h-3 w-3 mr-1" />
                      Group Member
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
          
          {group?.description && (
            <p className="mt-3 text-pink-100 max-w-2xl">{group.description}</p>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
            <Bell className="h-5 w-5" />
          </button>
          
          {isAdmin && (
            <>
              <button className="p-2 hover:bg-white/20 rounded-lg transition-colors">
                <Settings className="h-5 w-5" />
              </button>
              <button
                onClick={onAddMember}
                className="px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-gray-900 font-semibold rounded-lg hover:shadow-lg transition-all duration-300 flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Invite Member
              </button>
            </>
          )}
        </div>
      </div>
      
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <p className="text-sm text-pink-200">Welcome</p>
          <p className="text-lg font-semibold">{userName}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <p className="text-sm text-pink-200">Group Status</p>
          <p className="text-lg font-semibold">Active</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <p className="text-sm text-pink-200">Currency</p>
          <p className="text-lg font-semibold">{group?.currency || 'KES'}</p>
        </div>
        <div className="bg-white/10 backdrop-blur-sm p-4 rounded-xl">
          <p className="text-sm text-pink-200">Created</p>
          <p className="text-lg font-semibold">
            {group?.createdAt ? new Date(group.createdAt).toLocaleDateString() : 'Recently'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GroupHeader;