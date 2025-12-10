import React from 'react';
import { Receipt, User, Calendar, Tag, CheckCircle, XCircle } from 'lucide-react';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  paidBy: string;
  paidByName: string;
  splitType: 'equal' | 'percentage' | 'custom';
  splits: Array<{
    memberId: string;
    memberName: string;
    amount: number;
    settled: boolean;
  }>;
  receiptUrl?: string;
  notes?: string;
}

interface ExpenseHistoryProps {
  expenses: Expense[];
  members: any[];
  onSettleSplit: (splitId: string) => void;
  currentUserId?: string;
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({
  expenses,
  onSettleSplit,
  currentUserId,
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food': 'bg-green-100 text-green-800',
      'Transport': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Utilities': 'bg-yellow-100 text-yellow-800',
      'Rent': 'bg-red-100 text-red-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Other': 'bg-gray-100 text-gray-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getSplitTypeIcon = (splitType: string) => {
    switch (splitType) {
      case 'equal': return '⚖️';
      case 'percentage': return '📊';
      case 'custom': return '✏️';
      default: return '📝';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Expense History</h2>
        <div className="flex items-center gap-4">
          <div className="px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">
            {expenses.length} expenses
          </div>
          <div className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            Total: {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
          </div>
        </div>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
          <Receipt className="h-20 w-20 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No Expenses Yet</h3>
          <p className="text-gray-600">Add your first group expense to start tracking</p>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-2xl shadow-lg border border-pink-100 overflow-hidden"
            >
              {/* Expense Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                        <Receipt className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{expense.description}</h3>
                        <div className="flex items-center gap-4 mt-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(expense.category)}`}>
                            <Tag className="h-3 w-3 inline mr-1" />
                            {expense.category}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <Calendar className="h-4 w-4" />
                            {new Date(expense.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1 text-sm text-gray-600">
                            <User className="h-4 w-4" />
                            Paid by: <span className={`font-medium ${expense.paidBy === currentUserId ? 'text-green-600' : 'text-blue-600'}`}>
                              {expense.paidByName || (expense.paidBy === currentUserId ? 'You' : 'Member')}
                            </span>
                          </span>
                          <span className="text-sm text-gray-600">
                            {getSplitTypeIcon(expense.splitType)} {expense.splitType.charAt(0).toUpperCase() + expense.splitType.slice(1)} Split
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {expense.notes && (
                      <div className="mt-4 p-4 bg-pink-50 rounded-xl">
                        <p className="text-gray-700">{expense.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="text-right pl-4">
                    <div className="text-3xl font-bold text-gray-800">
                      {formatCurrency(expense.amount)}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">
                      {expense.splits.length} splits
                    </p>
                  </div>
                </div>
              </div>

              {/* Split Details */}
              <div className="p-6">
                <h4 className="font-semibold text-gray-800 mb-4">Split Details</h4>
                <div className="space-y-3">
                  {expense.splits.map((split, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                          split.memberId === currentUserId
                            ? 'bg-gradient-to-br from-pink-500 to-rose-500'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-500'
                        }`}>
                          <span className="text-white font-bold text-sm">
                            {split.memberName.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">{split.memberName}</p>
                          <p className="text-sm text-gray-600">
                            {split.memberId === currentUserId ? 'You' : 'Member'} •{' '}
                            {expense.splitType === 'equal' ? 'Equal share' : 'Custom amount'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-bold text-gray-800">{formatCurrency(split.amount)}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {split.settled ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Settled
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-medium rounded-full flex items-center gap-1">
                                <XCircle className="h-3 w-3" />
                                Pending
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {!split.settled && split.memberId === currentUserId && (
                          <button
                            onClick={() => onSettleSplit(split.memberId)}
                            className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-sm font-medium rounded-lg hover:shadow-md transition-shadow"
                          >
                            Mark Paid
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Receipt if available */}
              {expense.receiptUrl && (
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-200">
                    <Receipt className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-800">Receipt attached</p>
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        View receipt →
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Expense Stats */}
      {expenses.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl border border-pink-200">
          <h3 className="font-bold text-gray-800 mb-4">Expense Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-sm text-gray-600">Total Expenses</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0))}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-sm text-gray-600">Average per Expense</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {formatCurrency(expenses.reduce((sum, exp) => sum + exp.amount, 0) / expenses.length)}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-sm text-gray-600">Settled Splits</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {expenses.flatMap(exp => exp.splits).filter(split => split.settled).length}
              </p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl">
              <p className="text-sm text-gray-600">Pending Splits</p>
              <p className="text-2xl font-bold text-gray-800 mt-2">
                {expenses.flatMap(exp => exp.splits).filter(split => !split.settled).length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpenseHistory;