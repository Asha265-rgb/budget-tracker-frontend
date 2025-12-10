import React from 'react';
import { User, Crown, TrendingUp, TrendingDown, Mail, Phone } from 'lucide-react';

interface Member {
  userId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  balance: number;
  totalOwed: number;
  totalOwes: number;
  phoneNumber?: string;
}

interface MemberListProps {
  members: Member[];
  isAdmin: boolean;
  currentUserId?: string;
}

const MemberList: React.FC<MemberListProps> = ({
  members,
  isAdmin,
  currentUserId,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Group Members</h2>
          <span className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
            {members.length} members
          </span>
        </div>
      </div>
      
      <div className="divide-y divide-gray-100">
        {members.map((member) => (
          <div
            key={member.userId}
            className={`p-6 hover:bg-pink-50 transition-colors ${
              member.userId === currentUserId ? 'bg-gradient-to-r from-pink-50 to-rose-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                  member.role === 'admin' 
                    ? 'bg-gradient-to-br from-amber-500 to-yellow-500' 
                    : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                }`}>
                  {member.role === 'admin' ? (
                    <Crown className="h-6 w-6 text-white" />
                  ) : (
                    <User className="h-6 w-6 text-white" />
                  )}
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-800">{member.name}</h3>
                    {member.role === 'admin' && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full flex items-center gap-1">
                        <Crown className="h-3 w-3" />
                        Admin
                      </span>
                    )}
                    {member.userId === currentUserId && (
                      <span className="px-2 py-0.5 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                        You
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-2">
                    {member.email && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Mail className="h-4 w-4" />
                        <span>{member.email}</span>
                      </div>
                    )}
                    {member.phoneNumber && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{member.phoneNumber}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6 mt-4">
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total Owed</p>
                      <p className="font-bold text-green-600">{formatCurrency(member.totalOwed)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-gray-500">Total Owes</p>
                      <p className="font-bold text-amber-600">{formatCurrency(member.totalOwes)}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${
                  member.balance === 0
                    ? 'bg-gray-100 text-gray-800'
                    : member.balance > 0
                    ? 'bg-green-100 text-green-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {member.balance !== 0 && (
                    member.balance > 0 ? (
                      <TrendingUp className="h-4 w-4 mr-2" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-2" />
                    )
                  )}
                  <span className="font-bold">
                    {member.balance === 0
                      ? 'Settled'
                      : member.balance > 0
                      ? `+${formatCurrency(member.balance)}`
                      : `${formatCurrency(member.balance)}`}
                  </span>
                </div>
                
                <div className="mt-3">
                  <p className="text-sm text-gray-600">
                    {member.balance === 0
                      ? 'No pending balance'
                      : member.balance > 0
                      ? 'You are owed money'
                      : 'You owe money'}
                  </p>
                </div>
                
                {isAdmin && member.userId !== currentUserId && (
                  <button className="mt-4 px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                    Manage
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {isAdmin && (
        <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-pink-50 to-rose-50">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">Group Balance Summary</p>
              <p className="text-sm text-gray-600">
                Total group balance should always be zero when all debts are settled
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-800">
                {formatCurrency(members.reduce((sum, member) => sum + member.balance, 0))}
              </p>
              <p className="text-sm text-gray-600">
                {members.reduce((sum, member) => sum + member.balance, 0) === 0
                  ? 'Perfectly balanced!'
                  : 'Needs settlement'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberList;