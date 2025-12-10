import React, { useState } from 'react';
import { 
  useGetTransactionsQuery,
  useCreateTransactionMutation,
  type Transaction
} from '../features/transactions/transactionsApi'; // Changed import location

const TestTransactions: React.FC = () => {
  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";
  const ACCOUNT_ID = "149C488C-B3CA-F011-B991-14F6D814225F";
  
  // RTK Query hooks
  const { data: transactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = 
    useGetTransactionsQuery(USER_ID);
  const [createTransaction, { isLoading: creatingTransaction }] = useCreateTransactionMutation();
  
  const [error, setError] = useState<string>('');

  const testIncome = {
    description: "Salary Deposit",
    amount: 2500.00,
    type: "income" as 'income',
    category: "salary",
    date: new Date().toISOString(),
    accountId: ACCOUNT_ID,
    userId: USER_ID
  };

  const testExpense = {
    description: "Grocery Shopping",
    amount: 85.50,
    type: "expense" as 'expense',
    category: "food",
    date: new Date().toISOString(),
    accountId: ACCOUNT_ID,
    userId: USER_ID
  };

  // Test: Create income transaction
  const testCreateIncome = async () => {
    setError('');
    try {
      await createTransaction(testIncome).unwrap();
      alert('Income transaction created successfully!');
      refetchTransactions();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating income: ${errorMessage}`);
      console.error('Error creating income:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create expense transaction  
  const testCreateExpense = async () => {
    setError('');
    try {
      await createTransaction(testExpense).unwrap();
      alert('Expense transaction created successfully!');
      refetchTransactions();
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      setError(`Error creating expense: ${errorMessage}`);
      console.error('Error creating expense:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Transactions API Test (RTK Query)</h3>
      
      {/* Show current IDs for debugging */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Current IDs being used:</strong></p>
        <p>User ID: {USER_ID}</p>
        <p>Account ID: {ACCOUNT_ID}</p>
        <p><small>✅ Using RTK Query hooks for transactions</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testCreateIncome} 
          disabled={creatingTransaction}
          style={{ marginRight: '10px' }}
        >
          Create Income Transaction
        </button>
        <button 
          onClick={testCreateExpense} 
          disabled={creatingTransaction}
          style={{ marginRight: '10px' }}
        >
          Create Expense Transaction  
        </button>
        <button 
          onClick={refetchTransactions}
          disabled={transactionsLoading}
        >
          Refresh Transactions
        </button>
      </div>

      {(transactionsLoading || creatingTransaction) && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <h4>Transactions List ({transactions.length})</h4>
        {transactions.length === 0 && !transactionsLoading && (
          <p style={{ color: '#666' }}>No transactions found. Create some transactions to see them here.</p>
        )}
        {(transactions as Transaction[]).map(transaction => (
          <div key={transaction.id} style={{ 
            border: '1px solid #eee', 
            margin: '5px', 
            padding: '10px',
            backgroundColor: transaction.type === 'income' ? '#e8f5e8' : '#ffe8e8'
          }}>
            <p><strong>{transaction.description}</strong></p>
            <p>Amount: ${transaction.amount.toFixed(2)} ({transaction.type})</p>
            <p>Category: {transaction.category}</p>
            <p>Date: {new Date(transaction.date).toLocaleDateString()}</p>
            <p>Account ID: {transaction.accountId}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestTransactions;