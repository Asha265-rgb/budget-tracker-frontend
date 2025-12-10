// src/Dashsboards/group/GroupDashboard.tsx - COMPLETE FIXED CODE
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Users, AlertCircle, DollarSign, TrendingUp, 
  Plus, CheckCircle, Bell, Settings, FileText,
  Activity, UserPlus, PieChart,
  CreditCard, Filter, Wallet, Banknote,
  Download, Trash2, Home,
  ChevronLeft, Receipt,
  Mail, LogOut, Target
} from 'lucide-react';
import { toast } from 'sonner';

// Import only if available, otherwise use dynamic import
let html2pdf: any;
let XLSX: any;

// Dynamically import modules to avoid build errors
if (typeof window !== 'undefined') {
  import('html2pdf.js').then(module => {
    html2pdf = module.default;
  }).catch(() => {
    console.warn('html2pdf.js not available');
  });
  
  import('xlsx').then(module => {
    XLSX = module;
  }).catch(() => {
    console.warn('xlsx not available');
  });
}

// Import RTK Query hooks
import { 
  useGetGroupByIdQuery,
  useGetGroupMembersQuery,
  useGetGroupTransactionsQuery,
  useGetGroupBalanceQuery,
  useCreateExpenseWithSplitMutation,
  useGetGroupInvitationsQuery,
  useGetSentInvitationsQuery,
  useApproveInvitationMutation,
  useRejectInvitationMutation,
  useAddGroupAccountMutation,
  useSettleDebtMutation,
  useGetGroupNotificationsQuery,
  useMarkNotificationAsReadMutation,
  useCreateGroupNotificationMutation,
  useMarkAllNotificationsAsReadMutation,
  useGetGroupActivitiesQuery,
  useGetGroupAccountsQuery,
  type GroupMember as GroupMemberType,
} from '../../features/groups/groupsApi';

// Import components
import SettleUpModal from '../../features/groups/SettleUpModal';
import MemberInviteModal from '../../features/groups/MemberInviteModal';
import GroupAccountDepositModal from '../../features/groups/GroupAccountDepositModal';

// Create a simple AddExpenseModal component
const AddExpenseModal = ({ isOpen, onClose, onSubmit, members, currentUserId }: any) => {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food & Dining');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      description,
      amount: parseFloat(amount),
      category,
      paidByUserId: currentUserId,
      date: new Date().toISOString(),
      splitType: 'equal',
      participantIds: members.map((m: any) => m.userId)
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="Food & Dining">Food & Dining</option>
                <option value="Transportation">Transportation</option>
                <option value="Shopping">Shopping</option>
                <option value="Entertainment">Entertainment</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Types
type GroupMember = GroupMemberType;

// UPDATED: Added new tabs for personal dashboard screens
type DashboardTab = 'overview' | 'accounts' | 'transactions' | 'goals' | 'group_expenses' | 'members' | 'activity' | 'group_notifications' | 'invitations' | 'reports' | 'settings';

// Member List Component
interface MemberItem {
  userId: string;
  userName: string;
  userEmail: string;
  balance: number;
  totalPaid: number;
  totalOwed: number;
  role: 'admin' | 'member';
  accountBalance: number;
  joinedAt: string;
}

interface MemberListProps {
  members: MemberItem[];
  formatCurrency: (amount: number, currency?: string) => string;
  onSettleClick?: (memberId: string) => void;
}

const MemberList: React.FC<MemberListProps> = ({ members, formatCurrency, onSettleClick }) => {
  return (
    <div className="space-y-3">
      {members.length === 0 ? (
        <div className="text-center py-8">
          <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No members yet</p>
          <p className="text-sm text-gray-400 mt-2">Invite members to get started</p>
        </div>
      ) : (
        members.map((member) => (
          <div key={member.userId} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border hover:bg-white transition-all duration-200 hover:shadow-sm">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold">
                    {member.userName?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                {member.role === 'admin' && (
                  <div className="absolute -top-1 -right-1 h-4 w-4 bg-purple-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">A</span>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium text-gray-900">{member.userName || 'Unknown'}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    member.role === 'admin' 
                      ? 'bg-purple-100 text-purple-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {member.role}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{member.userEmail || ''}</p>
                
                {/* Account Balance */}
                <div className="flex items-center gap-4 mt-2">
                  <div className="text-xs">
                    <span className="text-gray-500">Account: </span>
                    <span className="font-medium text-blue-600">
                      {formatCurrency(member.accountBalance || 0)}
                    </span>
                  </div>
                  <div className="text-xs">
                    <span className="text-gray-500">Net: </span>
                    <span className={`font-medium ${
                      member.balance > 0 ? 'text-green-600' :
                      member.balance < 0 ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      {formatCurrency(Math.abs(member.balance))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="text-right">
                <div className={`text-lg font-bold ${
                  member.balance > 0 ? 'text-green-600' : 
                  member.balance < 0 ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {formatCurrency(Math.abs(member.balance))}
                </div>
                <div className="text-xs text-gray-500 space-x-2">
                  <span>Paid: {formatCurrency(member.totalPaid)}</span>
                  <span>•</span>
                  <span>Owed: {formatCurrency(member.totalOwed)}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {member.balance !== 0 && onSettleClick && (
                  <button
                    onClick={() => onSettleClick(member.userId)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-1"
                  >
                    <CheckCircle className="h-3 w-3" />
                    Settle
                  </button>
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

// Activity Tab Component
interface ActivityItem {
  id: string;
  action: string;
  description: string;
  userId: string;
  createdAt: string;
  amount?: number;
}

interface ActivityTabProps {
  activities: ActivityItem[];
  members: GroupMember[];
}

const ActivityTab: React.FC<ActivityTabProps> = ({ activities, members }) => {
  const getActivityIcon = (action: string) => {
    const icons = {
      'expense_added': <DollarSign className="h-5 w-5 text-green-600" />,
      'member_joined': <UserPlus className="h-5 w-5 text-blue-600" />,
      'payment_settled': <CheckCircle className="h-5 w-5 text-purple-600" />,
      'deposit_added': <Banknote className="h-5 w-5 text-green-600" />,
      'invitation_sent': <Mail className="h-5 w-5 text-indigo-600" />,
      'invitation_accepted': <CheckCircle className="h-5 w-5 text-green-600" />,
      'invitation_rejected': <LogOut className="h-5 w-5 text-red-600" />,
      'group_created': <Home className="h-5 w-5 text-blue-600" />,
      'default': <Activity className="h-5 w-5 text-gray-600" />
    };
    return icons[action as keyof typeof icons] || icons.default;
  };

  const timeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    const intervals = [
      { label: 'year', seconds: 31536000 },
      { label: 'month', seconds: 2592000 },
      { label: 'day', seconds: 86400 },
      { label: 'hour', seconds: 3600 },
      { label: 'minute', seconds: 60 },
      { label: 'second', seconds: 1 }
    ];
    
    for (const interval of intervals) {
      const count = Math.floor(seconds / interval.seconds);
      if (count >= 1) {
        return `${count} ${interval.label}${count !== 1 ? 's' : ''} ago`;
      }
    }
    
    return 'just now';
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">Group Activity</h3>
          <p className="text-gray-600">Recent activities and events in your group</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          <Filter className="h-4 w-4" />
          <span className="text-sm">Filter</span>
        </button>
      </div>

      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl border">
            <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No activities yet</p>
            <p className="text-sm text-gray-400 mt-2">Activities will appear here as they happen</p>
          </div>
        ) : (
          activities.map((activity) => {
            const member = members.find(m => m.userId === activity.userId);
            return (
              <div key={activity.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-white border">
                    {getActivityIcon(activity.action)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-gray-900">{activity.description}</p>
                      <span className="text-sm text-gray-500">
                        {timeAgo(activity.createdAt)}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-sm text-gray-600">
                        By {member?.userName || 'Unknown'} • {new Date(activity.createdAt).toLocaleDateString()}
                      </p>
                      {activity.amount && (
                        <p className="text-sm font-medium text-gray-900">
                          Amount: <span className="text-green-600">KES {activity.amount.toFixed(2)}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

// Notifications Component
interface NotificationItem {
  id: string;
  type: 'expense' | 'payment' | 'invitation' | 'deposit';
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationsComponentProps {
  notifications: NotificationItem[];
  unreadCount: number;
  onViewAll: () => void;
  onMarkAsRead: (notificationId: string) => void;
}

const NotificationsComponent: React.FC<NotificationsComponentProps> = ({ 
  notifications, 
  unreadCount, 
  onViewAll, 
  onMarkAsRead 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="relative">
      <button 
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>
      
      {showDropdown && (
        <>
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50">
            <div className="p-4 border-b">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={onViewAll}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                )}
              </div>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No notifications</p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.slice(0, 5).map((notification) => (
                    <div 
                      key={notification.id}
                      className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                        !notification.read ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          onMarkAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'expense' ? 'bg-green-100' :
                          notification.type === 'payment' ? 'bg-purple-100' :
                          notification.type === 'invitation' ? 'bg-blue-100' :
                          notification.type === 'deposit' ? 'bg-teal-100' :
                          'bg-gray-100'
                        }`}>
                          {notification.type === 'expense' && <DollarSign className="h-4 w-4 text-green-600" />}
                          {notification.type === 'payment' && <CheckCircle className="h-4 w-4 text-purple-600" />}
                          {notification.type === 'invitation' && <UserPlus className="h-4 w-4 text-blue-600" />}
                          {notification.type === 'deposit' && <Banknote className="h-4 w-4 text-teal-600" />}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(notification.createdAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {notifications.length > 0 && (
              <div className="p-3 border-t">
                <button 
                  onClick={onViewAll}
                  className="w-full py-2 text-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  View all notifications
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

// Expense History Component
interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  category: string;
  paidByUserId: string;
  date: string;
  isSettled: boolean;
  splitType: string;
  participantIds?: string[];
  splitDetails?: Record<string, number>;
}

interface ExpenseHistoryProps {
  expenses: ExpenseItem[];
  members: GroupMember[];
  formatCurrency: (amount: number, currency?: string) => string;
}

const ExpenseHistory: React.FC<ExpenseHistoryProps> = ({ expenses, members, formatCurrency }) => {
  return (
    <div className="space-y-3">
      {expenses.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-xl border">
          <Receipt className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No expenses yet</p>
          <p className="text-sm text-gray-400 mt-2">Add your first expense to get started</p>
        </div>
      ) : (
        expenses.map((expense) => {
          const paidBy = members.find(m => m.userId === expense.paidByUserId);
          return (
            <div key={expense.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    expense.category === 'Food & Dining' ? 'bg-green-100' :
                    expense.category === 'Transportation' ? 'bg-blue-100' :
                    expense.category === 'Shopping' ? 'bg-purple-100' :
                    expense.category === 'Entertainment' ? 'bg-yellow-100' :
                    'bg-gray-100'
                  }`}>
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{expense.description}</h4>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <span>Paid by {paidBy?.userName || 'Unknown'}</span>
                      <span>•</span>
                      <span>{new Date(expense.date).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                  <p className="text-sm text-gray-600">{expense.category}</p>
                </div>
              </div>
              
              {/* Split Details */}
              <div className="pt-3 border-t">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-600">
                    Split as <span className="font-medium">{expense.splitType}</span> among {expense.participantIds?.length || 0} people
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    expense.isSettled 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.isSettled ? 'Settled' : 'Pending'}
                  </span>
                </div>
                
                {/* Participants List */}
                {expense.splitDetails && (
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(expense.splitDetails).map(([userId, amount]) => {
                      const member = members.find(m => m.userId === userId);
                      return (
                        <span 
                          key={userId}
                          className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                        >
                          <span className="font-medium">{member?.userName || 'Unknown'}</span>
                          <span>:</span>
                          <span>{formatCurrency(Number(amount))}</span>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

// ================= NEW COMPONENTS FOR DASHBOARD SCREENS =================

// Accounts Screen Component
const AccountsScreen: React.FC<{ formatCurrency: (amount: number) => string }> = ({ formatCurrency }) => {
  // Mock data for accounts (you should replace with real data)
  const accounts = [
    { id: 1, name: 'Main Checking', type: 'Bank', balance: 12500.50, color: 'blue' },
    { id: 2, name: 'Savings Account', type: 'Bank', balance: 35000.00, color: 'green' },
    { id: 3, name: 'Cash Wallet', type: 'Cash', balance: 2500.75, color: 'purple' },
    { id: 4, name: 'Mobile Money', type: 'Mobile', balance: 1500.25, color: 'orange' },
  ];

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">My Accounts</h3>
          <p className="text-gray-600">Manage your personal accounts and balances</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Account
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`h-12 w-12 rounded-lg bg-${account.color}-100 flex items-center justify-center`}>
                <Wallet className={`h-6 w-6 text-${account.color}-600`} />
              </div>
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                {account.type}
              </span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{account.name}</h4>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(account.balance)}</p>
            <div className="mt-4 pt-4 border-t">
              <button className="text-sm text-blue-600 hover:text-blue-700">
                View Transactions →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-xl p-6 border">
        <h4 className="font-semibold text-gray-900 mb-4">Total Balance</h4>
        <div className="text-center py-8">
          <p className="text-4xl font-bold text-gray-900">
            {formatCurrency(accounts.reduce((sum, acc) => sum + acc.balance, 0))}
          </p>
          <p className="text-gray-600 mt-2">Across all accounts</p>
        </div>
      </div>
    </div>
  );
};

// Transactions Screen Component
const TransactionsScreen: React.FC<{ formatCurrency: (amount: number) => string }> = ({ formatCurrency }) => {
  // Mock transactions data
  const transactions = [
    { id: 1, description: 'Grocery Shopping', amount: -125.50, category: 'Food', date: '2024-01-15', type: 'expense' },
    { id: 2, description: 'Salary Deposit', amount: 2500.00, category: 'Income', date: '2024-01-14', type: 'income' },
    { id: 3, description: 'Netflix Subscription', amount: -15.99, category: 'Entertainment', date: '2024-01-13', type: 'expense' },
    { id: 4, description: 'Electricity Bill', amount: -85.25, category: 'Utilities', date: '2024-01-12', type: 'expense' },
    { id: 5, description: 'Freelance Payment', amount: 500.00, category: 'Income', date: '2024-01-11', type: 'income' },
  ];

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'food': return <DollarSign className="h-5 w-5 text-green-600" />;
      case 'income': return <TrendingUp className="h-5 w-5 text-blue-600" />;
      case 'entertainment': return <Home className="h-5 w-5 text-purple-600" />;
      case 'utilities': return <Home className="h-5 w-5 text-orange-600" />;
      default: return <DollarSign className="h-5 w-5 text-gray-600" />;
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">My Transactions</h3>
          <p className="text-gray-600">View and manage your personal transactions</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Add Transaction
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="border rounded-lg p-4 hover:shadow-sm transition-shadow">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-full bg-gray-100">
                  {getCategoryIcon(transaction.category)}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{transaction.description}</h4>
                  <p className="text-sm text-gray-600">{transaction.category} • {transaction.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-lg font-bold ${transaction.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {transaction.amount > 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                </p>
                <p className="text-sm text-gray-600 capitalize">{transaction.type}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-blue-50 rounded-xl p-6">
          <h4 className="font-semibold text-blue-900 mb-2">Total Income</h4>
          <p className="text-2xl font-bold text-blue-900">
            {formatCurrency(transactions.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0))}
          </p>
        </div>
        <div className="bg-red-50 rounded-xl p-6">
          <h4 className="font-semibold text-red-900 mb-2">Total Expenses</h4>
          <p className="text-2xl font-bold text-red-900">
            {formatCurrency(Math.abs(transactions.filter(t => t.amount < 0).reduce((sum, t) => sum + t.amount, 0)))}
          </p>
        </div>
        <div className="bg-green-50 rounded-xl p-6">
          <h4 className="font-semibold text-green-900 mb-2">Net Balance</h4>
          <p className="text-2xl font-bold text-green-900">
            {formatCurrency(transactions.reduce((sum, t) => sum + t.amount, 0))}
          </p>
        </div>
      </div>
    </div>
  );
};

// Goals Screen Component
const GoalsScreen: React.FC<{ formatCurrency: (amount: number) => string }> = ({ formatCurrency }) => {
  // Mock goals data
  const goals = [
    { id: 1, name: 'New Car', target: 500000, saved: 125000, deadline: '2024-12-31', color: 'blue' },
    { id: 2, name: 'Vacation', target: 150000, saved: 45000, deadline: '2024-06-30', color: 'green' },
    { id: 3, name: 'Emergency Fund', target: 100000, saved: 75000, deadline: '2024-09-30', color: 'purple' },
    { id: 4, name: 'Gadget Upgrade', target: 80000, saved: 25000, deadline: '2024-08-15', color: 'orange' },
  ];

  const calculateProgress = (saved: number, target: number) => {
    return Math.min(100, (saved / target) * 100);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">My Goals</h3>
          <p className="text-gray-600">Track your savings goals and progress</p>
        </div>
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Goal
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {goals.map((goal) => {
          const progress = calculateProgress(goal.saved, goal.target);
          return (
            <div key={goal.id} className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`h-12 w-12 rounded-lg bg-${goal.color}-100 flex items-center justify-center`}>
                  <Target className={`h-6 w-6 text-${goal.color}-600`} />
                </div>
                <span className="text-sm font-medium text-gray-600">
                  Due: {new Date(goal.deadline).toLocaleDateString()}
                </span>
              </div>
              
              <h4 className="font-semibold text-gray-900 mb-2">{goal.name}</h4>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">Progress</span>
                  <span className="font-medium">{progress.toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-${goal.color}-500 rounded-full transition-all duration-300`}
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Saved</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(goal.saved)}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Target</p>
                  <p className="text-lg font-bold text-gray-900">{formatCurrency(goal.target)}</p>
                </div>
              </div>
              
              <button className="w-full mt-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                Add Savings
              </button>
            </div>
          );
        })}
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xl font-bold mb-2">Total Goals Progress</h4>
            <p className="text-blue-100">Keep going! You're doing great</p>
          </div>
          <Target className="h-12 w-12 opacity-80" />
        </div>
        <div className="mt-6">
          <div className="flex justify-between mb-2">
            <span>Total Saved</span>
            <span className="font-bold">
              {formatCurrency(goals.reduce((sum, goal) => sum + goal.saved, 0))}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Total Target</span>
            <span className="font-bold">
              {formatCurrency(goals.reduce((sum, goal) => sum + goal.target, 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

// ================= END OF NEW COMPONENTS =================

// Main GroupDashboard Component
const GroupDashboard: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const navigate = useNavigate();
  const userId = localStorage.getItem('userId') || '';
  
  // State
  // UPDATED: Set default tab to 'overview' (which will show personal dashboard overview)
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSettleModalOpen, setIsSettleModalOpen] = useState(false);
  const [isAccountDepositModalOpen, setIsAccountDepositModalOpen] = useState(false);
  const [invitationFilter, setInvitationFilter] = useState<'pending' | 'sent' | 'all'>('pending');
  
  // RTK Query hooks
  const { 
    data: group, 
    isLoading: isLoadingGroup,
    error: groupError,
  } = useGetGroupByIdQuery(groupId || '', {
    skip: !groupId,
  });

  const { 
    data: membersData = [],
    isLoading: isLoadingMembers,
  } = useGetGroupMembersQuery(groupId || '', {
    skip: !groupId,
  });

  const { 
    data: transactionsData = [],
  } = useGetGroupTransactionsQuery(groupId || '', {
    skip: !groupId,
  });

  const { 
    data: balanceData,
  } = useGetGroupBalanceQuery(groupId || '', {
    skip: !groupId,
  });

  const { 
    data: notificationsData = [],
  } = useGetGroupNotificationsQuery(groupId || '', {
    skip: !groupId,
  });

  const { 
    data: activitiesData = [],
  } = useGetGroupActivitiesQuery(groupId || '', {
    skip: !groupId,
  });

  // Remove unused variable - just call the hook without destructuring
  useGetGroupAccountsQuery(groupId || '', {
    skip: !groupId,
  });

  // Mutation hooks
  const [createExpense] = useCreateExpenseWithSplitMutation();
  const [addAccount] = useAddGroupAccountMutation();
  const [settleDebt] = useSettleDebtMutation();
  const [createNotification] = useCreateGroupNotificationMutation();
  const [markNotificationAsRead] = useMarkNotificationAsReadMutation();
  const [markAllNotificationsAsRead] = useMarkAllNotificationsAsReadMutation();

  // Invitation hooks
  const { 
    data: groupInvitationsData = [],
  } = useGetGroupInvitationsQuery(groupId || '', {
    skip: !groupId,
  });

  const { 
    data: sentInvitationsData = [],
  } = useGetSentInvitationsQuery(undefined, {
    skip: !groupId,
  });

  const [approveInvitation] = useApproveInvitationMutation();
  const [rejectInvitation] = useRejectInvitationMutation();

  // Filter invitations - Fixed: Use the invitation status from your data
  const pendingInvitations = groupInvitationsData.filter(inv => 
    (inv as any).status === 'pending' || (inv as any).status === 'sent'
  );
  const sentInvitations = sentInvitationsData.filter(inv => (inv as any).groupId === groupId);
  const filteredInvitations = invitationFilter === 'pending' 
    ? pendingInvitations 
    : invitationFilter === 'sent' 
    ? sentInvitations 
    : [...pendingInvitations, ...sentInvitations];

  // Prepare data
  const members = membersData || [];
  const groupExpenses = transactionsData || [];
  const groupBalance = balanceData || { debts: [], summary: [] };
  const notifications = notificationsData || [];
  const activities = activitiesData || [];
  const unreadNotifications = notifications.filter((n: any) => !(n as any).read);
  
  // Calculate who owes who
  const whoOwesWho = (groupBalance as any).debts || [];
  
  // Get current user's summary
  const currentUserSummary = (groupBalance as any).summary?.find(
    (s: any) => s.userId === userId
  ) || { balance: 0, totalPaid: 0, totalOwed: 0 };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'KES'): string => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Handle expense creation
  const handleCreateExpense = async (expenseData: any) => {
    try {
      if (!groupId || !userId) return;

      const result = await createExpense({
        groupId,
        expense: expenseData
      });

      if ('data' in result) {
        toast.success(`Expense "${expenseData.description}" added successfully!`);
        
        // Create notification
        await createNotification({
          groupId,
          notification: {
            type: 'expense',
            message: `New expense "${expenseData.description}" added by ${members.find(m => m.userId === userId)?.userName}`,
            senderId: userId,
            senderName: members.find(m => m.userId === userId)?.userName,
            data: expenseData
          }
        });
        
        setIsExpenseModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add expense');
    }
  };

  // Handle account deposit
  const handleAccountDeposit = async (depositData: any) => {
    try {
      if (!groupId || !userId) {
        toast.error('Group or user not found');
        return;
      }

      const result = await addAccount({
        groupId,
        accountData: depositData
      });

      if ('data' in result) {
        toast.success(`Deposit "${depositData.description}" recorded successfully!`);
        
        // Create notification
        await createNotification({
          groupId,
          notification: {
            type: 'deposit',
            message: `${members.find(m => m.userId === userId)?.userName} deposited Ksh ${depositData.amount}`,
            senderId: userId,
            senderName: members.find(m => m.userId === userId)?.userName,
            data: depositData
          }
        });
        
        setIsAccountDepositModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to record deposit');
    }
  };

  // Handle settling a debt
  const handleSettleDebt = async (settlementData: {
    fromUserId: string;
    toUserId: string;
    amount: number;
    method: string;
  }) => {
    try {
      if (!groupId) return;

      const result = await settleDebt({
        groupId,
        settlement: settlementData
      });

      if ('data' in result) {
        toast.success(`Successfully settled Ksh ${settlementData.amount}!`);
        
        // Create notification
        const fromMember = members.find(m => m.userId === settlementData.fromUserId);
        const toMember = members.find(m => m.userId === settlementData.toUserId);
        
        await createNotification({
          groupId,
          notification: {
            type: 'payment',
            message: `${fromMember?.userName} settled Ksh ${settlementData.amount} with ${toMember?.userName}`,
            senderId: settlementData.fromUserId,
            senderName: fromMember?.userName,
            data: settlementData
          }
        });
        
        setIsSettleModalOpen(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to settle debt');
    }
  };

  // Handle member settlement click - FIXED: Added underscore to indicate intentional non-use
  const handleMemberSettleClick = (_memberId: string) => {
    setIsSettleModalOpen(true);
  };

  // Handle notification actions
  const handleMarkNotificationAsRead = async (notificationId: string) => {
    try {
      await markNotificationAsRead({ notificationId });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllNotificationsAsRead = async () => {
    try {
      if (groupId) {
        await markAllNotificationsAsRead(groupId);
        toast.success('All notifications marked as read');
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle view all notifications
  const handleViewAllNotifications = () => {
    setActiveTab('group_notifications');
  };

  // Generate report
  const generateReport = async (type: 'pdf' | 'excel') => {
    try {
      if (type === 'pdf') {
        if (!html2pdf) {
          toast.error('PDF generation not available');
          return;
        }
        
        const element = document.getElementById('group-report-content');
        if (element) {
          const opt = {
            margin: 1,
            filename: `${group?.name}_report_${new Date().toISOString().split('T')[0]}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2 },
            jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
          };
          
          html2pdf().set(opt).from(element).save();
          toast.success('PDF report generated successfully!');
        }
      } else {
        // Excel report
        if (!XLSX) {
          toast.error('Excel generation not available');
          return;
        }
        
        const data = [
          ['Group Expense Report', group?.name, new Date().toLocaleDateString()],
          [],
          ['Description', 'Amount', 'Category', 'Paid By', 'Date', 'Status']
        ];
        
        groupExpenses.forEach((expense: any) => {
          data.push([
            expense.description,
            expense.amount.toString(),
            expense.category,
            members.find(m => m.userId === expense.paidByUserId)?.userName || 'Unknown',
            new Date(expense.date).toLocaleDateString(),
            expense.isSettled ? 'Settled' : 'Pending'
          ]);
        });
        
        const ws = XLSX.utils.aoa_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Expense Report');
        XLSX.writeFile(wb, `${group?.name}_expense_report.xlsx`);
        
        toast.success('Excel report generated successfully!');
      }
    } catch (error) {
      toast.error('Failed to generate report');
    }
  };

  const isLoading = isLoadingGroup || isLoadingMembers;

  // Loading state
  if (isLoading && activeTab === 'overview') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading group dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (groupError || !group) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold mt-4">Group Not Found</h2>
          <p className="text-gray-600 mt-2">The group you're looking for doesn't exist or you don't have access.</p>
          <button
            onClick={() => navigate('/groups')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Groups
          </button>
        </div>
      </div>
    );
  }

  // UPDATED: Tab navigation with BOTH personal dashboard screens AND group management features
  const tabItems = [
    // PERSONAL DASHBOARD SCREENS
    { id: 'overview' as DashboardTab, label: 'My Dashboard', icon: <Home className="h-5 w-5" /> },
    { id: 'accounts' as DashboardTab, label: 'My Accounts', icon: <Wallet className="h-5 w-5" /> },
    { id: 'transactions' as DashboardTab, label: 'My Transactions', icon: <CreditCard className="h-5 w-5" /> },
    { id: 'goals' as DashboardTab, label: 'My Goals', icon: <Target className="h-5 w-5" /> },
    
    // GROUP MANAGEMENT FEATURES
    { id: 'group_expenses' as DashboardTab, label: 'Group Expenses', icon: <DollarSign className="h-5 w-5" /> },
    { id: 'members' as DashboardTab, label: 'Group Members', icon: <Users className="h-5 w-5" /> },
    { id: 'activity' as DashboardTab, label: 'Group Activity', icon: <Activity className="h-5 w-5" /> },
    { id: 'group_notifications' as DashboardTab, label: 'Group Notifications', icon: <Bell className="h-5 w-5" /> },
    { id: 'invitations' as DashboardTab, label: 'Invitations', icon: <UserPlus className="h-5 w-5" /> },
    { id: 'reports' as DashboardTab, label: 'Reports', icon: <FileText className="h-5 w-5" /> },
    { id: 'settings' as DashboardTab, label: 'Group Settings', icon: <Settings className="h-5 w-5" /> },
  ];

  // Prepare member list items - FIXED: match the MemberItem interface
  const memberListItems = members.map(member => ({
    userId: member.userId,
    userName: member.userName || 'Unknown',
    userEmail: member.userEmail || '',
    balance: member.balance || 0,
    totalPaid: member.totalPaid || 0,
    totalOwed: member.totalOwed || 0,
    role: member.role as 'admin' | 'member',
    accountBalance: member.accountBalance || 0,
    joinedAt: member.joinedAt || ''
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/groups')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Back to Groups"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{group.name}</h1>
                    <p className="text-gray-600 mt-1">{group.description || 'No description'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-500">
                    <Users className="inline h-4 w-4 mr-1" />
                    {members.length} members
                  </span>
                  <span className="text-gray-500">
                    <DollarSign className="inline h-4 w-4 mr-1" />
                    Total: {formatCurrency(groupExpenses.reduce((sum: number, exp: any) => sum + (exp.amount || 0), 0))}
                  </span>
                  <span className="text-gray-500">
                    <Receipt className="inline h-4 w-4 mr-1" />
                    {groupExpenses.length} expenses
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-4">
              <NotificationsComponent
                notifications={notifications as NotificationItem[]}
                unreadCount={unreadNotifications.length}
                onViewAll={handleViewAllNotifications}
                onMarkAsRead={handleMarkNotificationAsRead}
              />
              
              <div className="flex items-center gap-3">
                {/* Add Account Button */}
                <button
                  onClick={() => setIsAccountDepositModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                  title="Add account deposit"
                >
                  <Wallet className="h-5 w-5" />
                  Add Account
                </button>
                
                <button
                  onClick={() => setIsSettleModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 flex items-center gap-2 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentUserSummary.balance === 0}
                  title="Settle debts"
                >
                  <CheckCircle className="h-5 w-5" />
                  Settle Up
                </button>
                
                <button
                  onClick={() => setIsExpenseModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                  title="Add expense"
                >
                  <Plus className="h-5 w-5" />
                  Add Expense
                </button>
                
                <button
                  onClick={() => setIsInviteModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg hover:from-indigo-600 hover:to-indigo-700 flex items-center gap-2 transition-all duration-200 shadow-sm"
                  title="Invite members"
                >
                  <UserPlus className="h-5 w-5" />
                  Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 border-b mb-6 overflow-x-auto bg-white p-1 rounded-xl">
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 font-medium whitespace-nowrap transition-all duration-200 rounded-lg ${
                activeTab === tab.id
                  ? 'text-white bg-gradient-to-r from-blue-500 to-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {tab.icon}
              {tab.label}
              {tab.id === 'group_notifications' && unreadNotifications.length > 0 && (
                <span className="h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl border shadow-sm min-h-[600px] overflow-hidden">
          {/* ========== PERSONAL DASHBOARD SCREENS ========== */}
          
          {activeTab === 'overview' && (
            <div className="p-6">
              {/* Welcome Section */}
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900">Welcome back!</h2>
                <p className="text-gray-600">Here's your personal financial overview</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-700 font-medium">Total Balance</p>
                      <p className="text-3xl font-bold text-blue-900 mt-2">KES 0</p>
                      <p className="text-xs text-blue-600 mt-1">Across all accounts</p>
                    </div>
                    <Wallet className="h-12 w-12 text-blue-600 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-700 font-medium">Monthly Income</p>
                      <p className="text-3xl font-bold text-green-900 mt-2">KES 0</p>
                      <p className="text-xs text-green-600 mt-1">This month</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-green-600 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-700 font-medium">Monthly Expenses</p>
                      <p className="text-3xl font-bold text-purple-900 mt-2">KES 0</p>
                      <p className="text-xs text-purple-600 mt-1">This month</p>
                    </div>
                    <TrendingUp className="h-12 w-12 text-purple-600 opacity-80" />
                  </div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-700 font-medium">Savings Goals</p>
                      <p className="text-3xl font-bold text-orange-900 mt-2">KES 0</p>
                      <p className="text-xs text-orange-600 mt-1">0% achieved</p>
                    </div>
                    <Target className="h-12 w-12 text-orange-600 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Group Info Section */}
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">You're viewing: {group.name}</h3>
                    <p className="text-blue-100">{group.description || 'Group dashboard'}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <span className="text-sm">
                        <Users className="inline h-4 w-4 mr-1" />
                        {members.length} members
                      </span>
                      <span className="text-sm">
                        <DollarSign className="inline h-4 w-4 mr-1" />
                        {groupExpenses.length} expenses
                      </span>
                      <button
                        onClick={() => setActiveTab('group_expenses')}
                        className="text-sm bg-white text-blue-600 px-3 py-1 rounded-lg hover:bg-blue-50"
                      >
                        View Group →
                      </button>
                    </div>
                  </div>
                  <Users className="h-16 w-16 opacity-80" />
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  onClick={() => setActiveTab('accounts')}
                  className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow text-left"
                >
                  <Wallet className="h-10 w-10 text-blue-600 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">My Accounts</h4>
                  <p className="text-gray-600 text-sm">View and manage your personal accounts</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('transactions')}
                  className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow text-left"
                >
                  <CreditCard className="h-10 w-10 text-green-600 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">My Transactions</h4>
                  <p className="text-gray-600 text-sm">Track your income and expenses</p>
                </button>
                
                <button
                  onClick={() => setActiveTab('goals')}
                  className="bg-white border rounded-xl p-6 hover:shadow-lg transition-shadow text-left"
                >
                  <Target className="h-10 w-10 text-purple-600 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">My Goals</h4>
                  <p className="text-gray-600 text-sm">Set and track savings goals</p>
                </button>
              </div>
            </div>
          )}
          
          {activeTab === 'accounts' && (
            <AccountsScreen formatCurrency={(amount) => formatCurrency(amount)} />
          )}
          
          {activeTab === 'transactions' && (
            <TransactionsScreen formatCurrency={(amount) => formatCurrency(amount)} />
          )}
          
          {activeTab === 'goals' && (
            <GoalsScreen formatCurrency={(amount) => formatCurrency(amount)} />
          )}
          
          {/* ========== GROUP MANAGEMENT FEATURES ========== */}
          
          {activeTab === 'group_expenses' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Expenses</h3>
                  <p className="text-gray-600">
                    Total: {formatCurrency(groupExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0))}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => generateReport('pdf')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
                  >
                    <Download className="h-5 w-5" />
                    Export PDF
                  </button>
                  <button
                    onClick={() => setIsExpenseModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 transition-colors"
                  >
                    <Plus className="h-5 w-5" />
                    Add Expense
                  </button>
                </div>
              </div>
              
              <ExpenseHistory
                expenses={groupExpenses as ExpenseItem[]}
                members={members}
                formatCurrency={formatCurrency}
              />
            </div>
          )}
          
          {activeTab === 'members' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Members</h3>
                <p className="text-gray-600">Manage members and view balances</p>
              </div>
              <MemberList 
                members={memberListItems}
                formatCurrency={formatCurrency}
                onSettleClick={handleMemberSettleClick}
              />
            </div>
          )}
          
          {activeTab === 'activity' && (
            <ActivityTab 
              activities={activities as ActivityItem[]}
              members={members}
            />
          )}
          
          {activeTab === 'group_notifications' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Notifications</h3>
                  <p className="text-gray-600">Stay updated with group activities</p>
                </div>
                {unreadNotifications.length > 0 && (
                  <button
                    onClick={handleMarkAllNotificationsAsRead}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Mark All as Read
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {notifications.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border">
                    <Bell className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No notifications yet</p>
                    <p className="text-sm text-gray-400 mt-2">Notifications will appear here as they happen</p>
                  </div>
                ) : (
                  notifications.map((notification: any) => (
                    <div 
                      key={notification.id}
                      className={`border rounded-lg p-4 hover:shadow-sm transition-shadow cursor-pointer ${
                        !notification.read ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          handleMarkNotificationAsRead(notification.id);
                        }
                      }}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-2 rounded-full ${
                          notification.type === 'expense' ? 'bg-green-100' :
                          notification.type === 'payment' ? 'bg-purple-100' :
                          notification.type === 'invitation' ? 'bg-blue-100' :
                          notification.type === 'deposit' ? 'bg-teal-100' :
                          'bg-gray-100'
                        }`}>
                          {notification.type === 'expense' && <DollarSign className="h-5 w-5 text-green-600" />}
                          {notification.type === 'payment' && <CheckCircle className="h-5 w-5 text-purple-600" />}
                          {notification.type === 'invitation' && <UserPlus className="h-5 w-5 text-blue-600" />}
                          {notification.type === 'deposit' && <Banknote className="h-5 w-5 text-teal-600" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900">{notification.message}</p>
                            <span className="text-sm text-gray-500">
                              {new Date(notification.createdAt).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(notification.createdAt).toLocaleDateString()}
                          </p>
                          {!notification.read && (
                            <span className="inline-block mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'invitations' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Invitations</h3>
                <p className="text-gray-600">Manage pending invitations and view invitation history</p>
              </div>
              
              {/* Tabs for different invitation statuses */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setInvitationFilter('pending')}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                    invitationFilter === 'pending' 
                      ? 'text-white bg-blue-600' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Pending ({pendingInvitations.length})
                </button>
                <button
                  onClick={() => setInvitationFilter('sent')}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                    invitationFilter === 'sent' 
                      ? 'text-white bg-blue-600' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Sent ({sentInvitations.length})
                </button>
                <button
                  onClick={() => setInvitationFilter('all')}
                  className={`px-4 py-2 font-medium rounded-lg transition-colors ${
                    invitationFilter === 'all' 
                      ? 'text-white bg-blue-600' 
                      : 'text-gray-600 bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  All ({pendingInvitations.length + sentInvitations.length})
                </button>
              </div>
              
              {/* Invitations List */}
              <div className="space-y-4">
                {filteredInvitations.length === 0 ? (
                  <div className="text-center py-12 bg-gray-50 rounded-xl border">
                    <Mail className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      {invitationFilter === 'pending' 
                        ? 'No pending invitations'
                        : invitationFilter === 'sent'
                        ? 'No sent invitations'
                        : 'No invitations found'}
                    </p>
                    <button
                      onClick={() => setIsInviteModalOpen(true)}
                      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Send First Invitation
                    </button>
                  </div>
                ) : (
                  filteredInvitations.map((invitation: any) => (
                    <div key={invitation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                              <Mail className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {invitation.inviteeEmail}
                              </h4>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                                <span>Role: {invitation.role}</span>
                                <span>•</span>
                                <span>Status: {invitation.status}</span>
                                <span>•</span>
                                <span>Sent: {new Date(invitation.createdAt).toLocaleDateString()}</span>
                              </div>
                              {invitation.message && (
                                <p className="text-sm text-gray-600 mt-2">
                                  Message: {invitation.message}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          {(invitation.status === 'pending' || invitation.status === 'sent') && (
                            <>
                              <button
                                onClick={async () => {
                                  try {
                                    await approveInvitation({
                                      invitationId: invitation.id,
                                      notes: 'Approved by admin'
                                    });
                                    toast.success('Invitation approved');
                                  } catch (error) {
                                    toast.error('Failed to approve invitation');
                                  }
                                }}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700"
                              >
                                Approve
                              </button>
                              <button
                                onClick={async () => {
                                  try {
                                    await rejectInvitation({
                                      invitationId: invitation.id,
                                      notes: 'Rejected by admin'
                                    });
                                    toast.success('Invitation rejected');
                                  } catch (error) {
                                    toast.error('Failed to reject invitation');
                                  }
                                }}
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
          
          {activeTab === 'reports' && (
            <div className="p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Group Reports</h3>
                <p className="text-gray-600">Generate and download detailed group reports</p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <FileText className="h-10 w-10 text-blue-600 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Expense Summary</h4>
                  <p className="text-gray-600 text-sm mb-4">Monthly breakdown of all expenses by category</p>
                  <button 
                    onClick={() => generateReport('pdf')}
                    className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate PDF
                  </button>
                </div>
                
                <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <Users className="h-10 w-10 text-green-600 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Member Balances</h4>
                  <p className="text-gray-600 text-sm mb-4">Detailed report of who owes who and net balances</p>
                  <button 
                    onClick={() => generateReport('excel')}
                    className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Generate Excel
                  </button>
                </div>
                
                <div className="border rounded-xl p-6 hover:shadow-lg transition-shadow">
                  <PieChart className="h-10 w-10 text-purple-600 mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">Category Analysis</h4>
                  <p className="text-gray-600 text-sm mb-4">Visual breakdown of spending by category</p>
                  <button 
                    onClick={() => {
                      // Open chart modal
                      toast.info('Chart view coming soon!');
                    }}
                    className="w-full py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    View Charts
                  </button>
                </div>
              </div>
              
              {/* Quick Stats */}
              <div className="border rounded-xl p-6 mb-6">
                <h4 className="font-semibold text-gray-900 mb-4">Quick Statistics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-900">
                      {formatCurrency(groupExpenses.reduce((sum: number, exp: any) => sum + exp.amount, 0))}
                    </p>
                    <p className="text-sm text-blue-700">Total Spent</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-900">{groupExpenses.length}</p>
                    <p className="text-sm text-green-700">Total Expenses</p>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-900">{members.length}</p>
                    <p className="text-sm text-purple-700">Total Members</p>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <p className="text-2xl font-bold text-orange-900">
                      {formatCurrency(whoOwesWho.reduce((sum: number, debt: any) => sum + debt.amount, 0))}
                    </p>
                    <p className="text-sm text-orange-700">Total Outstanding</p>
                  </div>
                </div>
              </div>
              
              {/* Hidden report content for PDF generation */}
              <div id="group-report-content" className="hidden">
                <div className="p-8">
                  <h1 className="text-2xl font-bold mb-2">{group.name} - Expense Report</h1>
                  <p className="text-gray-600 mb-6">Generated on {new Date().toLocaleDateString()}</p>
                  
                  <div className="mb-8">
                    <h2 className="text-xl font-semibold mb-4">Summary</h2>
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border p-2 text-left">Description</th>
                          <th className="border p-2 text-left">Amount</th>
                          <th className="border p-2 text-left">Category</th>
                          <th className="border p-2 text-left">Paid By</th>
                          <th className="border p-2 text-left">Date</th>
                          <th className="border p-2 text-left">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupExpenses.map((expense: any) => (
                          <tr key={expense.id}>
                            <td className="border p-2">{expense.description}</td>
                            <td className="border p-2">KES {expense.amount.toFixed(2)}</td>
                            <td className="border p-2">{expense.category}</td>
                            <td className="border p-2">
                              {members.find(m => m.userId === expense.paidByUserId)?.userName || 'Unknown'}
                            </td>
                            <td className="border p-2">{new Date(expense.date).toLocaleDateString()}</td>
                            <td className="border p-2">{expense.isSettled ? 'Settled' : 'Pending'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Group Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Group Information</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Name</label>
                      <input
                        type="text"
                        value={group.name}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        value={group.description || ''}
                        readOnly
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                      <select
                        value={group.currency || 'KES'}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                        disabled
                      >
                        <option value="KES">Kenyan Shilling (KES)</option>
                        <option value="USD">US Dollar (USD)</option>
                        <option value="EUR">Euro (EUR)</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Danger Zone</h4>
                  <div className="space-y-4">
                    <button 
                      onClick={() => {
                        if (window.confirm('Are you sure you want to leave this group?')) {
                          toast.info('Leave group functionality coming soon');
                        }
                      }}
                      className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                    >
                      <LogOut className="h-5 w-5" />
                      Leave Group
                    </button>
                    {group.createdByUserId === userId && (
                      <button 
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                            toast.info('Delete group functionality coming soon');
                          }
                        }}
                        className="w-full py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <Trash2 className="h-5 w-5" />
                        Delete Group
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <GroupAccountDepositModal
        isOpen={isAccountDepositModalOpen}
        onClose={() => setIsAccountDepositModalOpen(false)}
        onSubmit={handleAccountDeposit}
        members={members.map(m => ({
          userId: m.userId,
          userName: m.userName || 'Unknown',
          userEmail: m.userEmail || '',
          balance: m.balance || 0
        }))}
        currentUserId={userId}
      />

      <MemberInviteModal
        isOpen={isInviteModalOpen}
        onClose={() => setIsInviteModalOpen(false)}
        groupId={groupId || ''}
        groupName={group?.name || ''}
      />

      <AddExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleCreateExpense}
        members={members}
        currentUserId={userId}
      />

      <SettleUpModal
        isOpen={isSettleModalOpen}
        onClose={() => {
          setIsSettleModalOpen(false);
        }}
        onSubmit={handleSettleDebt}
        members={members
          .filter(m => m.userId !== userId)
          .map(m => ({
            userId: m.userId,
            name: m.userName || 'Unknown',
            balance: m.balance || 0
          }))}
        isLoading={false}
      />
    </div>
  );
};

export default GroupDashboard;

