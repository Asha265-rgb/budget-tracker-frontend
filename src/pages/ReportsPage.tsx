import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { useGetTransactionsQuery } from '../features/transactions/transactionsApi';
import type { RootState } from '../app/store';

// Simple components
const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow p-4 ${className || ''}`}>{children}</div>
);

const Button: React.FC<{ children: React.ReactNode; onClick?: () => void }> = ({ children, onClick }) => (
  <button className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600" onClick={onClick}>
    {children}
  </button>
);

const COLORS = ['#FF6B8B', '#FFD166', '#06D6A0', '#118AB2', '#EF476F', '#8A2BE2', '#FF9A76'];

const ReportsPage: React.FC = () => {
  const currentUser = useSelector((state: RootState) => state.auth.user);
  
  // Get ALL transactions
  const { 
    data: transactionsResponse, 
    isLoading: transactionsLoading
  } = useGetTransactionsQuery(currentUser?.id || '', {
    skip: !currentUser?.id
  });

  // Extract transactions - FIXED TypeScript errors
  const allTransactions = useMemo(() => {
    if (!transactionsResponse) return [];
    
    // Handle array response
    if (Array.isArray(transactionsResponse)) return transactionsResponse;
    
    // Handle object response - use type assertion to fix TypeScript errors
    const response = transactionsResponse as any;
    
    // Check for data property
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
    
    // Check for results property
    if (response.results && Array.isArray(response.results)) {
      return response.results;
    }
    
    // If it's an object but not the expected structure, try to extract array from it
    if (typeof response === 'object') {
      // Check if any property is an array
      const arrayEntries = Object.values(response).filter(val => Array.isArray(val));
      if (arrayEntries.length > 0) {
        return arrayEntries[0] as any[];
      }
      
      // Check if it's an object with transactions nested
      const nestedArrays = Object.values(response).flatMap(val => 
        typeof val === 'object' && val ? Object.values(val).filter(v => Array.isArray(v)) : []
      );
      if (nestedArrays.length > 0) {
        return nestedArrays[0] as any[];
      }
    }
    
    console.log('Transactions response structure:', transactionsResponse);
    return [];
  }, [transactionsResponse]);

  // DEBUG: Log everything
  console.log('=== DEBUG START ===');
  console.log('Current user:', currentUser);
  console.log('Current user ID:', currentUser?.id);
  console.log('Transactions response:', transactionsResponse);
  console.log('All transactions array:', allTransactions);
  console.log('Number of transactions:', allTransactions.length);
  
  if (allTransactions.length > 0) {
    console.log('First transaction:', allTransactions[0]);
    console.log('All transactions:', allTransactions.map((t: any) => ({
      id: t.id,
      description: t.description,
      type: t.type,
      amount: t.amount,
      category: t.category,
      date: t.date
    })));
  }
  console.log('=== DEBUG END ===');

  // SIMPLE CALCULATIONS - Use ALL transactions
  const calculateExpenseByCategory = () => {
    const categoryTotals: Record<string, number> = {};
    
    allTransactions
      .filter((t: any) => t.type === 'expense')
      .forEach((transaction: any) => {
        const category = transaction.category || 'Uncategorized';
        categoryTotals[category] = (categoryTotals[category] || 0) + transaction.amount;
      });
    
    return Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
    }));
  };

  const calculateIncomeVsExpense = () => {
    // Group by month
    const monthlyData: Record<string, { month: string, income: number, expense: number }> = {};
    
    allTransactions.forEach((transaction: any) => {
      if (!transaction.date) return;
      
      const date = new Date(transaction.date);
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { month: monthKey, income: 0, expense: 0 };
      }
      
      if (transaction.type === 'income') {
        monthlyData[monthKey].income += transaction.amount;
      } else if (transaction.type === 'expense') {
        monthlyData[monthKey].expense += transaction.amount;
      }
    });
    
    // Get last 6 months
    const sorted = Object.values(monthlyData).sort((a, b) => {
      return new Date(a.month).getTime() - new Date(b.month).getTime();
    });
    
    return sorted.slice(-6);
  };

  const calculateMonthlyTrends = () => {
    const trends = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthName = date.toLocaleDateString('en-US', { month: 'short' });
      
      // Filter for this month
      const monthTransactions = allTransactions.filter((t: any) => {
        if (!t.date || t.type !== 'expense') return false;
        const tDate = new Date(t.date);
        return tDate.getMonth() === date.getMonth() && tDate.getFullYear() === date.getFullYear();
      });
      
      const totalSpent = monthTransactions.reduce((sum: number, t: any) => sum + t.amount, 0);
      
      trends.push({
        month: monthName,
        totalSpent,
        budget: totalSpent * 1.2,
      });
    }
    
    return trends;
  };

  // Get data
  const categoryData = calculateExpenseByCategory();
  const incomeExpenseData = calculateIncomeVsExpense();
  const monthlyTrendsData = calculateMonthlyTrends();
  
  const totalIncome = allTransactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const totalExpense = allTransactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + t.amount, 0);
    
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
  const largestCategory = categoryData.length > 0 
    ? categoryData.reduce((max: any, item: any) => item.amount > max.amount ? item : max, categoryData[0])
    : { name: 'No data', amount: 0 };

  if (transactionsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600">Loading transactions...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Please login to view reports</h1>
          <Button onClick={() => window.location.href = '/login'}>Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      {/* Header with DEBUG info */}
      <div className="mb-8 p-4 bg-white rounded-lg shadow">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 Financial Reports</h1>
        <p className="text-gray-600 mb-4">User: {currentUser?.email || currentUser?.name || 'Unknown'}</p>
        
        {/* DEBUG PANEL - ALWAYS VISIBLE */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
          <h3 className="font-bold text-yellow-800 mb-2">📋 Debug Information:</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-2 bg-white rounded border">
              <p className="text-sm font-medium">Total Transactions</p>
              <p className="text-2xl font-bold">{allTransactions.length}</p>
            </div>
            <div className="p-2 bg-white rounded border">
              <p className="text-sm font-medium">Total Income</p>
              <p className="text-2xl font-bold text-green-600">${totalIncome.toFixed(2)}</p>
            </div>
            <div className="p-2 bg-white rounded border">
              <p className="text-sm font-medium">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">${totalExpense.toFixed(2)}</p>
            </div>
          </div>
          
          {allTransactions.length === 0 && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-700 font-medium">⚠️ No transactions found!</p>
              <p className="text-red-600 text-sm">This could mean:</p>
              <ul className="text-red-600 text-sm list-disc pl-5 mt-1">
                <li>The user has no transactions</li>
                <li>API endpoint is not returning data</li>
                <li>Check the network tab in DevTools</li>
              </ul>
            </div>
          )}
          
          {allTransactions.length > 0 && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
              <p className="text-green-700 font-medium">✅ {allTransactions.length} transactions found!</p>
              <p className="text-green-600 text-sm">First transaction: {allTransactions[0]?.description || 'N/A'}</p>
            </div>
          )}
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expense by Category */}
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Expenses by Category</h3>
          <div className="h-80">
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(props: any) => `${props.name}: $${props.value?.toFixed(2) || '0.00'}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-center">No expense data found</p>
                <p className="text-sm text-gray-400 mt-1">
                  Add some expense transactions to see the chart
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Income vs Expense */}
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Income vs Expenses</h3>
          <div className="h-80">
            {incomeExpenseData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeExpenseData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                  <Legend />
                  <Bar dataKey="income" fill="#06D6A0" name="Income" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" fill="#EF476F" name="Expense" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                <div className="text-4xl mb-2">📈</div>
                <p className="text-center">No income/expense data</p>
              </div>
            )}
          </div>
        </Card>

        {/* Monthly Trends */}
        <Card className="lg:col-span-2">
          <h3 className="text-xl font-bold text-gray-800 mb-4">6-Month Spending Trends</h3>
          <div className="h-80">
            {monthlyTrendsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrendsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Amount']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="totalSpent"
                    stroke="#FF6B8B"
                    strokeWidth={3}
                    name="Total Spent"
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 p-4">
                <div className="text-4xl mb-2">📅</div>
                <p className="text-center">No spending data for last 6 months</p>
              </div>
            )}
          </div>
        </Card>

        {/* Key Metrics */}
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <h3 className="text-xl font-bold mb-4">Key Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span>Total Income</span>
              <span className="text-2xl font-bold">${totalIncome.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span>Total Expenses</span>
              <span className="text-2xl font-bold">${totalExpense.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span>Savings Rate</span>
              <span className="text-2xl font-bold">
                {savingsRate >= 0 ? '🟢' : '🔴'} {savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/10 rounded-lg">
              <span>Largest Category</span>
              <span className="text-xl font-bold">{largestCategory.name}</span>
            </div>
          </div>
        </Card>

        {/* Transaction List */}
        <Card>
          <h3 className="text-xl font-bold text-gray-800 mb-4">Recent Transactions</h3>
          <div className="max-h-80 overflow-y-auto">
            {allTransactions.length > 0 ? (
              <div className="space-y-2">
                {allTransactions.slice(0, 5).map((transaction: any, index: number) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-gray-500">
                          {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className={`font-bold ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
                {allTransactions.length > 5 && (
                  <p className="text-center text-gray-500 text-sm mt-2">
                    + {allTransactions.length - 5} more transactions
                  </p>
                )}
              </div>
            ) : (
              <div className="h-60 flex flex-col items-center justify-center text-gray-500">
                <div className="text-4xl mb-2">📄</div>
                <p className="text-center">No transactions found</p>
                <p className="text-sm text-gray-400 mt-1">Add transactions to see them here</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsPage;