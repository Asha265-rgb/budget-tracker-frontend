import React, { useState, useEffect } from 'react';
import { usersAPI, accountsAPI } from '../services/api';

const DebugInfo: React.FC = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Get user profile and accounts
  const fetchUserData = async () => {
    setLoading(true);
    try {
      // Get user profile
      const userResponse = await usersAPI.getProfile();
      const user = userResponse.data;
      setUserInfo(user);
      
      // Get user's accounts
      const accountsResponse = await accountsAPI.getAccounts(user.id);
      setAccounts(accountsResponse.data);
      
      console.log('User Info:', user);
      console.log('Accounts:', accountsResponse.data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check localStorage for token
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token);
    return token;
  };

  useEffect(() => {
    checkAuth();
    fetchUserData();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Loading debug info...</h3>
    </div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', backgroundColor: '#f5f5f5' }}>
      <h3>🔧 Debug Information</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchUserData} style={{ marginRight: '10px' }}>
          Refresh Data
        </button>
        <button onClick={checkAuth}>
          Check Token
        </button>
      </div>

      {/* User Information */}
      {userInfo && (
        <div style={{ marginBottom: '20px', padding: '10px', border: '1px solid #ddd', backgroundColor: 'white' }}>
          <h4>👤 User Information</h4>
          <p><strong>User ID:</strong> <span style={{ backgroundColor: '#e8f4fd', padding: '2px 6px', borderRadius: '3px' }}>{userInfo.id}</span></p>
          <p><strong>Email:</strong> {userInfo.email}</p>
          <p><strong>Name:</strong> {userInfo.firstName} {userInfo.lastName}</p>
          <p><strong>User Type:</strong> {userInfo.userType}</p>
          <button 
            onClick={() => navigator.clipboard.writeText(userInfo.id)}
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
              <p><strong>Currency:</strong> {account.currency}</p>
              <button 
                onClick={() => navigator.clipboard.writeText(account.id)}
                style={{ marginTop: '5px', padding: '2px 8px', fontSize: '12px' }}
              >
                Copy Account ID
              </button>
            </div>
          ))}
        </div>
      )}

      {!userInfo && (
        <div style={{ color: 'red', padding: '10px' }}>
          <p>⚠️ No user information found. Make sure you are logged in.</p>
          <p>Check if you have a token in localStorage and try refreshing.</p>
        </div>
      )}
    </div>
  );
};

export default DebugInfo;