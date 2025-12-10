import React from 'react';
import { useGetTransactionsQuery } from '../features/transactions/transactionsApi'; // FIXED: Changed import

interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
  userId: string;
}

const TestBudgets: React.FC = () => {
  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";

  // Use RTK Query for transactions
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = 
    useGetTransactionsQuery(USER_ID);

  // Check if transactions affect budget spending using RTK Query data
  const testBudgetSpending = () => {
    const foodTransactions = (transactions as Transaction[]).filter(
      (t: Transaction) => t.category === 'food' && t.type === 'expense'
    );
    
    const totalFoodSpent = foodTransactions.reduce(
      (sum: number, t: Transaction) => sum + t.amount, 
      0
    );
    
    alert(`Total food expenses: $${totalFoodSpent}\nFood transactions: ${foodTransactions.length}`);
    
    console.log('Food transactions:', foodTransactions);
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>💰 Budgets API Test</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><small>Using RTK Query for transactions data</small></p>
        <p><small>Total Transactions: {transactions.length}</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testBudgetSpending} style={{ marginRight: '10px' }}>
          Check Spending from RTK Query
        </button>
        <button onClick={() => refetchTransactions()}>
          🔄 Refresh Transactions
        </button>
      </div>

      {transactionsLoading && <p>Loading transactions from RTK Query...</p>}
      
      {/* Display some transaction data from RTK Query */}
      <div>
        <h4>Recent Transactions from RTK Query ({transactions.length})</h4>
        {transactions.length === 0 && !transactionsLoading && (
          <p style={{ color: '#666' }}>No transactions found from RTK Query.</p>
        )}
        {(transactions as Transaction[]).slice(0, 3).map(transaction => (
          <div key={transaction.id} style={{ 
            border: '1px solid #eee', 
            margin: '5px', 
            padding: '10px',
            backgroundColor: transaction.type === 'income' ? '#e8f5e8' : '#ffe8e8'
          }}>
            <p><strong>{transaction.description}</strong></p>
            <p>Amount: ${transaction.amount} ({transaction.type})</p>
            <p>Category: {transaction.category}</p>
          </div>
        ))}
        {transactions.length > 3 && (
          <p style={{ color: '#666', fontSize: '12px' }}>
            ... and {transactions.length - 3} more transactions
          </p>
        )}
      </div>
    </div>
  );
}; 

export default TestBudgets;