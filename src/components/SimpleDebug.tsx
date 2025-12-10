import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useGetProfileQuery } from '../features/user/userApi';
import { useGetAccountsQuery } from '../features/accounts/accountsApi';
import type { RootState } from '../app/store';

const SimpleDebug: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useGetProfileQuery();
  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts } = useGetAccountsQuery(user?.id || '');
  const [showDebug, setShowDebug] = useState(false);

  // Check what's in localStorage
  const checkStorage = () => {
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token);
    alert(`Token in storage: ${token ? 'YES' : 'NO'}`);
  };

  const fetchAllData = () => {
    refetchUser();
    if (user?.id) {
      refetchAccounts();
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', backgroundColor: '#f5f5f5' }}>
      <h3>🔧 Debug Tools</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => setShowDebug(!showDebug)} style={{ marginRight: '10px' }}>
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
        <button onClick={checkStorage} style={{ marginRight: '10px' }}>
          Check Storage
        </button>
        {showDebug && (
          <button onClick={fetchAllData}>
            Load My Data
          </button>
        )}
      </div>

      {showDebug && (
        <>
          {(userLoading || accountsLoading) && <p>Loading...</p>}

          {/* User Information */}
          {userData && (
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', backgroundColor: 'white' }}>
              <h4>👤 User Information</h4>
              <p><strong>User ID:</strong> <span style={{ backgroundColor: '#e8f4fd', padding: '2px 6px', borderRadius: '3px' }}>{userData.id}</span></p>
              <p><strong>Email:</strong> {userData.email}</p>
              <p><strong>Name:</strong> {userData.firstName} {userData.lastName}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(userData.id);
                  alert('User ID copied!');
                }}
                style={{ marginTop: '5px', padding: '2px 8px', fontSize: '12px' }}
              >
                Copy User ID
              </button>
            </div>
          )}

          {/* Accounts Information */}
          {accounts.length > 0 && (
            <div style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: 'white' }}>
              <h4>💰 Accounts ({accounts.length})</h4>
              {accounts.map(account => (
                <div key={account.id} style={{ 
                  margin: '10px 0', 
                  padding: '10px', 
                  border: '1px solid #eee',
                  backgroundColor: account.type === 'bank' ? '#f0f8ff' : '#fff0f5'
                }}>
                  <p><strong>Account Name:</strong> {account.name}</p>
                  <p><strong>Account ID:</strong> <span style={{ backgroundColor: '#e8f4fd', padding: '2px 6px', borderRadius: '3px' }}>{account.id}</span></p>
                  <p><strong>Type:</strong> {account.type}</p>
                  <p><strong>Balance:</strong> ${account.balance}</p>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(account.id);
                      alert('Account ID copied!');
                    }}
                    style={{ marginTop: '5px', padding: '2px 8px', fontSize: '12px' }}
                  >
                    Copy Account ID
                  </button>
                </div>
              ))}
            </div>
          )}

          {!userData && !userLoading && !accountsLoading && (
            <div style={{ color: '#666', padding: '10px' }}>
              <p>Click "Load My Data" to fetch your user information and accounts.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SimpleDebug;
