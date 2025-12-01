import React, { useState } from 'react';
import { usersAPI, accountsAPI } from '../services/api';

const SimpleDebug: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Get user profile and accounts only when manually triggered
  const fetchUserData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found - please login first');
        return;
      }

      // Get user profile
      const userResponse = await usersAPI.getProfile();
      const user = userResponse.data;
      setUserInfo(user);
      
      // Get user's accounts
      const accountsResponse = await accountsAPI.getAccounts(user.id);
      setAccounts(accountsResponse.data);
      
      console.log('User Info:', user);
      console.log('Accounts:', accountsResponse.data);
    } catch (error: any) {
      console.error('Error fetching user data:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  // Check what's in localStorage
  const checkStorage = () => {
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token);
    alert(`Token in storage: ${token ? 'YES' : 'NO'}`);
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
          <button onClick={fetchUserData}>
            Load My Data
          </button>
        )}
      </div>

      {showDebug && (
        <>
          {loading && <p>Loading...</p>}

          {/* User Information */}
          {userInfo && (
            <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', backgroundColor: 'white' }}>
              <h4>👤 User Information</h4>
              <p><strong>User ID:</strong> <span style={{ backgroundColor: '#e8f4fd', padding: '2px 6px', borderRadius: '3px' }}>{userInfo.id}</span></p>
              <p><strong>Email:</strong> {userInfo.email}</p>
              <p><strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}</p>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(userInfo.id);
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

          {!userInfo && !loading && (
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
