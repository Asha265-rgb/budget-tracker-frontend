import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../hooks/redux';
import { fetchAccounts, createAccount } from '../features/accounts/accountsSlice';

const TestAccounts: React.FC = () => {
  const dispatch = useAppDispatch();
  const { accounts, isLoading, error } = useAppSelector((state) => state.accounts);
  const { user } = useAppSelector((state) => state.auth);
  const [lastAction, setLastAction] = React.useState<string>(''); // ← New state

  console.log('Current state:', { isLoading, error, accountsCount: accounts.length });

  useEffect(() => {
    console.log('useEffect running', { user });
    if (user) {
      console.log('Dispatching fetchAccounts with userId:', user.id);
      dispatch(fetchAccounts(user.id));
    }
  }, [dispatch, user]);

  const handleCreateAccount = () => {
    setLastAction('Creating account...'); // ← Set action message
    console.log('Create button clicked', { user });
    if (user) {
      console.log('Dispatching createAccount with userId:', user.id);
      dispatch(createAccount({
        name: `Test Account ${Date.now()}`, // ← Unique name
        type: 'savings',
        balance: 1000.00,
        currency: 'USD',
        userId: user.id
      })).then(() => {
        setLastAction('Account created!'); // ← Success message
      });
    }
  };

  const handleRefreshAccounts = () => {
    setLastAction('Refreshing accounts...'); // ← Set action message
    console.log('Refresh button clicked', { user });
    if (user) {
      console.log('Dispatching fetchAccounts with userId:', user.id);
      dispatch(fetchAccounts(user.id)).then(() => {
        setLastAction('Accounts refreshed!'); // ← Success message
      });
    }
  };

  const handleReset = () => {
    // Force reload the page to reset state
    window.location.reload();
  };

  if (!user) return <div>Please login first</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>Accounts API Test</h2>
      
      {/* Debug info */}
      <div style={{ background: '#ffeaa7', padding: '10px', marginBottom: '10px', border: '1px solid #fdcb6e' }}>
        <p><strong>Debug Info:</strong></p>
        <p>isLoading = <strong>{isLoading.toString()}</strong></p>
        <p>error = <strong>{error || 'null'}</strong></p>
        <p>accounts count = <strong>{accounts.length}</strong></p>
        <p>user id = <strong>{user.id}</strong></p>
      </div>
      
      <button onClick={handleCreateAccount} disabled={isLoading}>
        {isLoading ? 'Creating...' : 'Create Test Account'}
      </button>
      
      <button onClick={handleRefreshAccounts} disabled={isLoading}>
        {isLoading ? 'Loading...' : 'Refresh Accounts'}
      </button>

      <button onClick={handleReset} style={{ marginLeft: '10px', backgroundColor: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>
        Reset Page
      </button>

      {/* Action feedback */}
      {lastAction && (
        <div style={{ color: 'green', marginTop: '10px', fontWeight: 'bold' }}>
          Last action: {lastAction}
        </div>
      )}

      {error && <div style={{ color: 'red', marginTop: '10px' }}>Error: {error}</div>}

      <h3>Your Accounts: ({accounts.length} total)</h3>
      
      {/* Show only first 5 accounts to avoid long list */}
      {accounts.slice(0, 5).map(account => (
        <div key={account.id} style={{ border: '1px solid #ccc', padding: '10px', margin: '5px' }}>
          <p><strong>{account.name}</strong></p>
          <p>Type: {account.type}</p>
          <p>Balance: ${account.balance} {account.currency}</p>
        </div>
      ))}
      
      {accounts.length > 5 && (
        <p style={{ color: '#666', fontStyle: 'italic' }}>
          ... and {accounts.length - 5} more accounts (scroll in Network tab to see API calls)
        </p>
      )}
      
      {accounts.length === 0 && <p>No accounts found</p>}
    </div>
  );
};

export default TestAccounts;