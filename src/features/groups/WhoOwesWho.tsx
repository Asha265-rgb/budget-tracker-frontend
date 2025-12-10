import React, { useState } from 'react';
import { ArrowRight, DollarSign, CheckCircle, AlertCircle, Filter } from 'lucide-react';

interface Settlement {
  fromUserId: string;
  fromUserName: string;
  toUserId: string;
  toUserName: string;
  amount: number;
}

interface WhoOwesWhoProps {
  settlements: Settlement[];
  currentUserId?: string;
  onSettleUp: (settlement: Settlement) => void;
}

const WhoOwesWho: React.FC<WhoOwesWhoProps> = ({
  settlements,
  currentUserId,
  onSettleUp,
}) => {
  const [filter, setFilter] = useState<'all' | 'you-owe' | 'owes-you'>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const filteredSettlements = settlements.filter(settlement => {
    if (filter === 'you-owe') return settlement.fromUserId === currentUserId;
    if (filter === 'owes-you') return settlement.toUserId === currentUserId;
    return true;
  });

  const totalYouOwe = settlements
    .filter(s => s.fromUserId === currentUserId)
    .reduce((sum, s) => sum + s.amount, 0);

  const totalOwesYou = settlements
    .filter(s => s.toUserId === currentUserId)
    .reduce((sum, s) => sum + s.amount, 0);

  if (settlements.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-emerald-200 p-8 text-center">
        <div className="h-20 w-20 bg-gradient-to-br from-emerald-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-10 w-10 text-emerald-600" />
        </div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">All Clear! 🎉</h3>
        <p className="text-gray-600 mb-6">No pending settlements in the group</p>
        <div className="inline-flex items-center px-4 py-2 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
          <CheckCircle className="h-4 w-4 mr-2" />
          All balances are settled
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Who Owes Who</h2>
              <p className="text-sm text-gray-600">Pending settlements in the group</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
              {settlements.length} pending
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-6 bg-gradient-to-br from-amber-50 to-yellow-50 border-b border-amber-200">
        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total You Owe</p>
          <p className={`text-2xl font-bold mt-2 ${totalYouOwe > 0 ? 'text-amber-600' : 'text-gray-800'}`}>
            {formatCurrency(totalYouOwe)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            To {settlements.filter(s => s.fromUserId === currentUserId).length} member(s)
          </p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Owes You</p>
          <p className={`text-2xl font-bold mt-2 ${totalOwesYou > 0 ? 'text-green-600' : 'text-gray-800'}`}>
            {formatCurrency(totalOwesYou)}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            From {settlements.filter(s => s.toUserId === currentUserId).length} member(s)
          </p>
        </div>
        
        <div className="text-center p-4 bg-white rounded-xl shadow-sm">
          <p className="text-sm text-gray-600">Total Group</p>
          <p className="text-2xl font-bold text-gray-800 mt-2">
            {formatCurrency(settlements.reduce((sum, s) => sum + s.amount, 0))}
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Across all members
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="px-6 pt-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
              filter === 'all'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            All Settlements ({settlements.length})
          </button>
          <button
            onClick={() => setFilter('you-owe')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
              filter === 'you-owe'
                ? 'border-amber-500 text-amber-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            You Owe ({settlements.filter(s => s.fromUserId === currentUserId).length})
          </button>
          <button
            onClick={() => setFilter('owes-you')}
            className={`px-4 py-2 font-medium text-sm border-b-2 transition-all ${
              filter === 'owes-you'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            Owes You ({settlements.filter(s => s.toUserId === currentUserId).length})
          </button>
        </div>
      </div>

      {/* Settlements List */}
      <div className="p-6">
        <div className="space-y-4">
          {filteredSettlements.map((settlement, index) => {
            const youOwe = settlement.fromUserId === currentUserId;
            const owesYou = settlement.toUserId === currentUserId;
            
            return (
              <div
                key={index}
                className="p-6 bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl border border-pink-200 hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center justify-between">
                  {/* Left side: From user */}
                  <div className="flex items-center gap-4">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                      youOwe ? 'bg-amber-100' : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                    }`}>
                      <span className={`text-lg font-bold ${
                        youOwe ? 'text-amber-800' : 'text-white'
                      }`}>
                        {settlement.fromUserName.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-bold text-gray-800">{settlement.fromUserName}</p>
                      <p className="text-sm text-gray-600">
                        {youOwe ? 'You' : settlement.fromUserName} owes
                      </p>
                    </div>
                  </div>

                  {/* Middle: Arrow and amount */}
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-2">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        youOwe ? 'bg-amber-100' : owesYou ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        <ArrowRight className={`h-4 w-4 ${
                          youOwe ? 'text-amber-600' : owesYou ? 'text-green-600' : 'text-gray-600'
                        }`} />
                      </div>
                      <div className="text-center">
                        <p className={`text-2xl font-bold ${
                          youOwe ? 'text-amber-600' : owesYou ? 'text-green-600' : 'text-gray-800'
                        }`}>
                          {formatCurrency(settlement.amount)}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {youOwe ? 'You need to pay' : owesYou ? 'You will receive' : 'To be transferred'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right side: To user */}
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="font-bold text-gray-800 text-right">{settlement.toUserName}</p>
                      <p className="text-sm text-gray-600 text-right">
                        to {owesYou ? 'you' : settlement.toUserName}
                      </p>
                    </div>
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                      owesYou ? 'bg-green-100' : 'bg-gradient-to-br from-emerald-500 to-green-500'
                    }`}>
                      <span className={`text-lg font-bold ${
                        owesYou ? 'text-green-800' : 'text-white'
                      }`}>
                        {settlement.toUserName.charAt(0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6 pt-4 border-t border-pink-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-sm text-gray-600">
                        {youOwe ? 'You need to settle this amount' : owesYou ? 'Waiting for payment' : 'Pending settlement'}
                      </span>
                    </div>
                    
                    {(youOwe || owesYou) && (
                      <button
                        onClick={() => onSettleUp(settlement)}
                        className={`px-6 py-2 font-medium rounded-lg hover:shadow-md transition-shadow ${
                          youOwe
                            ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-white'
                            : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                        }`}
                      >
                        {youOwe ? 'Pay Now' : 'Request Payment'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty state for filtered view */}
        {filteredSettlements.length === 0 && (
          <div className="text-center py-12">
            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">No settlements found</h3>
            <p className="text-gray-600">
              {filter === 'you-owe' 
                ? "You don't owe anyone money! 👍"
                : filter === 'owes-you'
                ? "No one owes you money right now"
                : "No settlements match your filter"}
            </p>
          </div>
        )}

        {/* Settlement Instructions */}
        <div className="mt-8 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200">
          <h4 className="font-bold text-gray-800 mb-3">💡 How Settlements Work</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-xl">
              <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                1
              </div>
              <p className="font-medium text-gray-800">Track Expenses</p>
              <p className="text-sm text-gray-600 mt-1">All shared expenses are automatically tracked</p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                2
              </div>
              <p className="font-medium text-gray-800">Calculate Balances</p>
              <p className="text-sm text-gray-600 mt-1">System calculates who owes who automatically</p>
            </div>
            <div className="p-4 bg-white rounded-xl">
              <div className="h-8 w-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                3
              </div>
              <p className="font-medium text-gray-800">Settle Up</p>
              <p className="text-sm text-gray-600 mt-1">Mark payments as settled when made</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhoOwesWho;