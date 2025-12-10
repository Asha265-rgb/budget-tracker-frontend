import React from 'react';
// Remove unused import: DollarSign
import { TrendingUp, TrendingDown, PieChart, ArrowUpDown } from 'lucide-react';

interface MemberBalance {
  userId: string;
  name: string;
  balance: number;
  role: 'admin' | 'member';
}

interface BalanceSummaryProps {
  members: MemberBalance[];
  totalBalance: number;
}

const BalanceSummary: React.FC<BalanceSummaryProps> = ({ members, totalBalance }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate summary stats
  const totalOwed = members.filter(m => m.balance > 0).reduce((sum, m) => sum + m.balance, 0);
  const totalOwes = Math.abs(members.filter(m => m.balance < 0).reduce((sum, m) => sum + m.balance, 0));
  const settledMembers = members.filter(m => Math.abs(m.balance) < 0.01).length;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-pink-100 p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <PieChart className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Balance Summary</h2>
            <p className="text-sm text-gray-600">Overall group financial position</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-sm text-gray-600">Total Group Balance</p>
          <p className={`text-2xl font-bold ${
            Math.abs(totalBalance) < 0.01 ? 'text-gray-800' : 'text-amber-600'
          }`}>
            {Math.abs(totalBalance) < 0.01 ? 'Perfectly Balanced ✓' : formatCurrency(totalBalance)}
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Owed</p>
              <p className="text-2xl font-bold text-green-600 mt-2">{formatCurrency(totalOwed)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Money that group members are owed
          </p>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Owes</p>
              <p className="text-2xl font-bold text-amber-600 mt-2">{formatCurrency(totalOwes)}</p>
            </div>
            <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center">
              <TrendingDown className="h-6 w-6 text-amber-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Money that group members owe
          </p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Settled Members</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">{settledMembers}/{members.length}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <ArrowUpDown className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">
            Members with zero balance
          </p>
        </div>
      </div>

      {/* Member Balances */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-800 mb-4">Individual Balances</h3>
        {members.map((member) => (
          <div
            key={member.userId}
            className="flex items-center justify-between p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                member.role === 'admin' 
                  ? 'bg-gradient-to-br from-amber-500 to-yellow-500' 
                  : 'bg-gradient-to-br from-blue-500 to-indigo-500'
              }`}>
                <span className="text-white font-bold text-sm">
                  {member.name.charAt(0)}
                </span>
              </div>
              <div>
                <p className="font-medium text-gray-800">{member.name}</p>
                <p className="text-sm text-gray-600 capitalize">{member.role}</p>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-lg font-bold ${
                member.balance === 0
                  ? 'text-gray-800'
                  : member.balance > 0
                  ? 'text-green-600'
                  : 'text-amber-600'
              }`}>
                {member.balance === 0
                  ? 'Settled'
                  : member.balance > 0
                  ? `+${formatCurrency(member.balance)}`
                  : formatCurrency(member.balance)}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {member.balance === 0
                  ? 'No pending balance'
                  : member.balance > 0
                  ? 'Is owed money'
                  : 'Owes money'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Positive (Owed money)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-amber-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Negative (Owes money)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 bg-gray-400 rounded-full"></div>
            <span className="text-sm text-gray-600">Settled (Zero balance)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BalanceSummary;