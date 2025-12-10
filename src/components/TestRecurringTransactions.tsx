import React, { useState } from 'react';
import { 
  useGetRecurringTransactionsQuery,
  useCreateRecurringTransactionMutation,
  useGetUpcomingRecurringTransactionsQuery,
  type RecurringTransaction
} from '../features/transactions/transactionsApi'; // Changed import location

// Add this constant at the top
const API_BASE_URL = '/api';

const TestRecurringTransactions: React.FC = () => {
  const USER_ID = "437CCFD5-06CA-F011-B991-14F6D814225F";
  const ACCOUNT_ID = "149C488C-B3CA-F011-B991-14F6D814225F";
  
  // RTK Query hooks
  const { data: recurringTransactions = [], isLoading: transactionsLoading, refetch: refetchTransactions } = 
    useGetRecurringTransactionsQuery(); // No parameter needed
  const [createRecurringTransaction, { isLoading: creatingTransaction }] = useCreateRecurringTransactionMutation();
  const { data: upcomingTransactions = [], isLoading: upcomingLoading } = 
    useGetUpcomingRecurringTransactionsQuery(); // No parameter needed
  
  const [error, setError] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  const testNetflixSubscription = {
    description: "Netflix Subscription",
    amount: 15.99,
    type: "expense" as const,
    category: "entertainment",
    frequency: "monthly" as const,
    startDate: new Date().toISOString(),
    accountId: ACCOUNT_ID,
    userId: USER_ID
  };

  const testSalary = {
    description: "Monthly Salary",
    amount: 3000.00,
    type: "income" as const,
    category: "salary",
    frequency: "monthly" as const,
    startDate: new Date().toISOString(),
    accountId: ACCOUNT_ID,
    userId: USER_ID
  };

  const testWeeklyCoffee = {
    description: "Weekly Coffee Budget",
    amount: 25.00,
    type: "expense" as const,
    category: "food",
    frequency: "weekly" as const,
    startDate: new Date().toISOString(),
    accountId: ACCOUNT_ID,
    userId: USER_ID
  };

  // Test: Create Netflix subscription
  const testCreateNetflixSubscription = async () => {
    setError('');
    setDebugInfo('Creating Netflix subscription...');
    try {
      await createRecurringTransaction(testNetflixSubscription).unwrap();
      setDebugInfo('Netflix subscription created successfully!');
      alert('Netflix subscription created successfully!');
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      const fullError = `POST Error: ${errorMessage}`;
      setError(fullError);
      setDebugInfo(`Failed to create: ${errorMessage}`);
      console.error('Error creating Netflix subscription:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create monthly salary
  const testCreateSalary = async () => {
    setError('');
    setDebugInfo('Creating monthly salary...');
    try {
      await createRecurringTransaction(testSalary).unwrap();
      setDebugInfo('Monthly salary created successfully!');
      alert('Monthly salary created successfully!');
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      const fullError = `POST Error: ${errorMessage}`;
      setError(fullError);
      setDebugInfo(`Failed to create: ${errorMessage}`);
      console.error('Error creating monthly salary:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Create weekly coffee budget
  const testCreateWeeklyCoffee = async () => {
    setError('');
    setDebugInfo('Creating weekly coffee budget...');
    try {
      await createRecurringTransaction(testWeeklyCoffee).unwrap();
      setDebugInfo('Weekly coffee budget created successfully!');
      alert('Weekly coffee budget created successfully!');
    } catch (error: any) {
      const errorMessage = error.data?.message || error.message || 'Unknown error';
      const fullError = `POST Error: ${errorMessage}`;
      setError(fullError);
      setDebugInfo(`Failed to create: ${errorMessage}`);
      console.error('Error creating weekly coffee budget:', error);
      alert(`Error: ${errorMessage}`);
    }
  };

  // Test: Get upcoming recurring transactions
  const testGetUpcomingTransactions = () => {
    const count = upcomingTransactions.length || 0;
    setDebugInfo(`Found ${count} upcoming transactions in next 30 days`);
    alert(`Found ${count} upcoming recurring transactions in the next 30 days!`);
    console.log('Upcoming Transactions:', upcomingTransactions);
  };

  // Test if endpoints exist
  const testEndpoints = async () => {
    setDebugInfo('Testing endpoints...');
    const endpoints = [
      `/transactions/recurring`,
      `/transactions/recurring/upcoming`,
      '/transactions/recurring'
    ];
    
    let results = 'Endpoint Test Results:\n\n';
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        results += `📍 ${endpoint}: ${response.status} ${response.statusText}\n`;
      } catch (err: any) {
        results += `📍 ${endpoint}: ❌ ERROR - ${err.message}\n`;
      }
    }
    
    setDebugInfo(results);
  };

  // Helper functions
  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'daily': return '#FF6B6B';
      case 'weekly': return '#4ECDC4';
      case 'monthly': return '#45B7D1';
      case 'yearly': return '#96CEB4';
      default: return '#FFEAA7';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'paused': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const getNextProcessingText = (transaction: RecurringTransaction) => {
    const nextDateStr = transaction.nextProcessingDate || transaction.startDate;
    const nextDate = new Date(nextDateStr);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `In ${diffDays} days`;
    if (diffDays < 30) return `In ${Math.ceil(diffDays / 7)} weeks`;
    return `On ${nextDate.toLocaleDateString()}`;
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>🔄 Recurring Transactions API Test (RTK Query)</h3>
      
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f0f0f0' }}>
        <p><strong>User ID:</strong> {USER_ID}</p>
        <p><strong>Account ID:</strong> {ACCOUNT_ID}</p>
        <p><small>Using RTK Query hooks for recurring transactions</small></p>
      </div>

      {/* Debug Info Section */}
      <div style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
        <h4>🔧 Debug Information</h4>
        <button onClick={testEndpoints} style={{ marginBottom: '10px', marginRight: '10px' }}>
          🔍 Test Endpoints
        </button>
        <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px', backgroundColor: 'white', padding: '10px', borderRadius: '4px' }}>
          {debugInfo || 'Click "Test Endpoints" to check if backend routes exist...'}
        </pre>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testCreateNetflixSubscription} 
          disabled={creatingTransaction}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        >
          📺 Create Netflix Monthly ($15.99)
        </button>
        <button 
          onClick={testCreateSalary} 
          disabled={creatingTransaction}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        >
          💰 Create Monthly Salary ($3,000)
        </button>
        <button 
          onClick={testCreateWeeklyCoffee} 
          disabled={creatingTransaction}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        >
          ☕ Create Weekly Coffee ($25)
        </button>
        <button 
          onClick={testGetUpcomingTransactions} 
          disabled={upcomingLoading}
          style={{ marginRight: '10px', marginBottom: '10px' }}
        >
          📅 Get Upcoming (30 days)
        </button>
        <button 
          onClick={refetchTransactions} 
          disabled={transactionsLoading}
        >
          🔄 Refresh List
        </button>
      </div>

      {(transactionsLoading || creatingTransaction || upcomingLoading) && <p>Loading...</p>}
      {error && (
        <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe6e6' }}>
          <strong>Error Details:</strong> 
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>{error}</pre>
        </div>
      )}
      
      <div>
        <h4>Recurring Transactions ({recurringTransactions.length})</h4>
        {recurringTransactions.length === 0 && !transactionsLoading && (
          <div style={{ color: '#666', padding: '20px', textAlign: 'center', backgroundColor: '#f8f9fa' }}>
            <p>No recurring transactions found.</p>
            <p>Click "Create" buttons above to add some!</p>
          </div>
        )}
        {recurringTransactions.map((transaction: RecurringTransaction) => {
          const frequencyColor = getFrequencyColor(transaction.frequency);
          const status = transaction.status || 'active';
          const statusColor = getStatusColor(status);
          
          return (
            <div key={transaction.id} style={{ 
              border: '1px solid #eee', 
              margin: '15px 0', 
              padding: '20px',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div>
                  <h4 style={{ margin: 0, marginBottom: '5px' }}>{transaction.description}</h4>
                  <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                    {transaction.type === 'income' ? 'Income' : 'Expense'} • {transaction.category}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    fontSize: '18px', 
                    fontWeight: 'bold',
                    color: transaction.type === 'income' ? '#4CAF50' : '#F44336'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              </div>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '15px', 
                fontSize: '14px',
                backgroundColor: 'white',
                padding: '15px',
                borderRadius: '6px',
                border: '1px solid #eee'
              }}>
                <div>
                  <strong>Frequency:</strong>
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: frequencyColor,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {transaction.frequency}
                  </span>
                </div>
                <div>
                  <strong>Status:</strong>
                  <span style={{ 
                    marginLeft: '8px',
                    padding: '2px 8px',
                    backgroundColor: statusColor,
                    color: 'white',
                    borderRadius: '12px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {status}
                  </span>
                </div>
                <div>
                  <strong>Next:</strong> {getNextProcessingText(transaction)}
                </div>
                <div>
                  <strong>Started:</strong> {new Date(transaction.startDate).toLocaleDateString()}
                </div>
                <div>
                  <strong>Account:</strong> {transaction.accountId ? transaction.accountId.slice(0, 8) + '...' : 'N/A'}
                </div>
                <div>
                  <strong>Type:</strong> 
                  <span style={{ 
                    color: transaction.type === 'income' ? '#4CAF50' : '#F44336',
                    fontWeight: 'bold',
                    marginLeft: '5px'
                  }}>
                    {transaction.type}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TestRecurringTransactions;