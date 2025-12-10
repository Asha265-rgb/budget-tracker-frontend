import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { 
  useGetAccountsQuery,
  useCreateAccountMutation 
} from '../features/accounts/accountsApi'; // FIXED: Changed import source

const TestAccounts: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const [lastAction, setLastAction] = React.useState<string>('');
  
  // RTK Query hooks
  const { 
    data: accounts = [], 
    isLoading: accountsLoading, 
    error: accountsError, 
    refetch: refetchAccounts 
  } = useGetAccountsQuery(user?.id || '');
  
  const [createAccount, { 
    isLoading: creatingAccount, 
    error: createError 
  }] = useCreateAccountMutation();

  console.log('Current state:', { 
    accountsLoading, 
    accountsError, 
    accountsCount: accounts.length,
    user 
  });

  // Show loading state from RTK Query
  const isLoading = accountsLoading || creatingAccount;
  
  // Combine errors
  const error = accountsError || createError;

  const handleCreateAccount = async () => {
    setLastAction('Creating account...');
    console.log('Create button clicked', { user });
    
    if (user) {
      try {
        console.log('Creating account with userId:', user.id);
        await createAccount({
          name: `Test Account ${Date.now()}`,
          type: 'savings',
          balance: 1000.00,
          currency: 'USD',
          userId: user.id
        }).unwrap();
        
        setLastAction('Account created successfully!');
      } catch (err: any) {
        console.error('Error creating account:', err);
        setLastAction(`Error: ${err.data?.message || err.message}`);
      }
    }
  };

  const handleRefreshAccounts = async () => {
    setLastAction('Refreshing accounts...');
    console.log('Refresh button clicked', { user });
    
    try {
      await refetchAccounts();
      setLastAction('Accounts refreshed successfully!');
    } catch (err: any) {
      console.error('Error refreshing accounts:', err);
      setLastAction(`Error: ${err.message}`);
    }
  };

  const handleReset = () => {
    // Force reload the page to reset state
    window.location.reload();
  };

  if (!user) return <div>Please login first</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Accounts API Test (RTK Query)</h2>
      
      {/* Debug info */}
      <div style={{ background: '#ffeaa7', padding: '10px', marginBottom: '10px', border: '1px solid #fdcb6e' }}>
        <p><strong>Debug Info:</strong></p>
        <p>isLoading = <strong>{isLoading.toString()}</strong></p>
        <p>error = <strong>{error ? JSON.stringify(error) : 'null'}</strong></p>
        <p>accounts count = <strong>{accounts.length}</strong></p>
        <p>user id = <strong>{user.id}</strong></p>
        <p><small>Using RTK Query hooks</small></p>
      </div>
      
      <button 
        onClick={handleCreateAccount} 
        disabled={isLoading || !user}
        style={{ marginRight: '10px' }}
      >
        {isLoading ? 'Creating...' : 'Create Test Account'}
      </button>
      
      <button 
        onClick={handleRefreshAccounts} 
        disabled={isLoading}
        style={{ marginRight: '10px' }}
      >
        {isLoading ? 'Loading...' : 'Refresh Accounts'}
      </button>

      <button 
        onClick={handleReset} 
        style={{ 
          backgroundColor: '#dc3545', 
          color: 'white', 
          border: 'none', 
          padding: '8px 16px', 
          borderRadius: '4px',
          cursor: 'pointer'
        }}
      >
        Reset Page
      </button>

      {/* Action feedback */}
      {lastAction && (
        <div style={{ 
          color: lastAction.includes('Error') ? 'red' : 'green', 
          marginTop: '10px', 
          fontWeight: 'bold',
          padding: '8px',
          backgroundColor: lastAction.includes('Error') ? '#ffebee' : '#e8f5e8',
          borderRadius: '4px'
        }}>
          Last action: {lastAction}
        </div>
      )}

      {error && (
        <div style={{ 
          color: 'red', 
          marginTop: '10px', 
          padding: '10px',
          backgroundColor: '#ffebee',
          borderRadius: '4px'
        }}>
          Error: {JSON.stringify(error)}
        </div>
      )}

      <h3>Your Accounts: ({accounts.length} total)</h3>
      
      {/* Show only first 5 accounts to avoid long list */}
      {accounts.slice(0, 5).map((account: any) => (
        <div key={account.id} style={{ 
          border: '1px solid #ccc', 
          padding: '10px', 
          margin: '5px',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <p><strong>{account.name}</strong></p>
          <p>Type: {account.type}</p>
          <p>Balance: ${account.balance} {account.currency}</p>
          <p>ID: <small style={{ color: '#666' }}>{account.id}</small></p>
        </div>
      ))}
      
      {accounts.length > 5 && (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          ... and {accounts.length - 5} more accounts
        </p>
      )}
      
      {accounts.length === 0 && !isLoading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#f8f9fa',
          borderRadius: '4px'
        }}>
          <p>No accounts found. Click "Create Test Account" to create one.</p>
        </div>
      )}
      
      {isLoading && (
        <div style={{ 
          padding: '20px', 
          textAlign: 'center',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px'
        }}>
          <p>Loading accounts...</p>
        </div>
      )}
    </div>
  );
};

export default TestAccounts;