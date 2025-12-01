import React, { useState, useEffect } from 'react';
import { transactionsAPI } from '../services/api';

// Define TypeScript interfaces - UPDATED to match backend
interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  date: string;
  accountId: string;
  userId: string;
}

const TestTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F"; // Your user ID
  const ACCOUNT_ID = "149C488C-B3CA-F011-B991-14F6D814225F"; // Your account ID

  // UPDATED WITH YOUR REAL IDs
  const testIncome = {
    description: "Salary Deposit",
    amount: 2500.00,
    type: "income" as 'income',
    category: "salary",
    date: new Date().toISOString(),
    accountId: ACCOUNT_ID, // Your account ID
    userId: USER_ID // Your user ID
  };

  const testExpense = {
    description: "Grocery Shopping",
    amount: 85.50,
    type: "expense" as 'expense',
    category: "food",
    date: new Date().toISOString(),
    accountId: ACCOUNT_ID, // Your account ID
    userId: USER_ID // Your user ID
  };

  // FIXED: Now uses getUserTransactions with your user ID
  const testGetTransactions = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await transactionsAPI.getUserTransactions(USER_ID); // ← CHANGED to getUserTransactions
      setTransactions(response.data);
      console.log('Transactions:', response.data);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error fetching transactions: ${errorMessage}`);
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test: Create income transaction
  const testCreateIncome = async () => {
    setError('');
    try {
      console.log('Creating income transaction with data:', testIncome);
      const response = await transactionsAPI.createTransaction(testIncome);
      console.log('Income transaction created:', response.data);
      alert('Income transaction created successfully!');
      testGetTransactions(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating income: ${errorMessage}`);
      console.error('Error creating income:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create expense transaction  
  const testCreateExpense = async () => {
    setError('');
    try {
      console.log('Creating expense transaction with data:', testExpense);
      const response = await transactionsAPI.createTransaction(testExpense);
      console.log('Expense transaction created:', response.data);
      alert('Expense transaction created successfully!');
      testGetTransactions(); // Refresh the list
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      setError(`Error creating expense: ${errorMessage}`);
      console.error('Error creating expense:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  useEffect(() => {
    testGetTransactions();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Transactions API Test</h3>
      
      {/* Show current IDs for debugging */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>Current IDs being used:</strong></p>
        <p>User ID: {USER_ID}</p>
        <p>Account ID: {ACCOUNT_ID}</p>
        <p><small>✅ Using getUserTransactions with your User ID</small></p>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={testCreateIncome} style={{ marginRight: '10px' }}>
          Create Income Transaction
        </button>
        <button onClick={testCreateExpense} style={{ marginRight: '10px' }}>
          Create Expense Transaction  
        </button>
        <button onClick={testGetTransactions}>
          Refresh Transactions
        </button>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error:</strong> {error}
        </div>
      )}
      
      <div>
        <h4>Transactions List ({transactions.length})</h4>
        {transactions.length === 0 && !loading && (
          <p style={{ color: '#666' }}>No transactions found. Create some transactions to see them here.</p>
        )}
        {transactions.map(transaction => (
          <div key={transaction.id} style={{ 
            border: '1px solid #eee', 
            margin: '5px', 
            padding: '10px',
            backgroundColor: transaction.type === 'income' ? '#e8f5e8' : '#ffe8e8'
          }}>
            <p><strong>{transaction.description}</strong></p>
            <p>Amount: ${transaction.amount} ({transaction.type})</p>
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