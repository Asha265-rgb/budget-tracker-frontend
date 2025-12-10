import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useGetProfileQuery } from '../features/user/userApi';
import { useGetAccountsQuery } from '../features/accounts/accountsApi';
import type { RootState } from '../app/store';

const DebugInfo: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { data: userData, isLoading: userLoading, refetch: refetchUser } = useGetProfileQuery();
  const { data: accounts = [], isLoading: accountsLoading, refetch: refetchAccounts } = useGetAccountsQuery(user?.id || '');
  const [userInfo, setUserInfo] = useState<any>(null);
  const [accountList, setAccountList] = useState<any[]>([]);

  // Check localStorage for token
  const checkAuth = () => {
    const token = localStorage.getItem('token');
    console.log('Token in localStorage:', token);
    return token;
  };

  useEffect(() => {
    if (userData) {
      setUserInfo(userData);
    }
  }, [userData]);

  useEffect(() => {
    if (accounts) {
      setAccountList(accounts);
    }
  }, [accounts]);

  const fetchAllData = () => {
    refetchUser();
    if (user?.id) {
      refetchAccounts();
    }
  };

  if (userLoading || accountsLoading) {
    return <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px' }}>
      <h3>Loading debug info...</h3>
    </div>;
  }

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '10px', backgroundColor: '#f5f5f5' }}>
      <h3>🔧 Debug Information</h3>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={fetchAllData} style={{ marginRight: '10px' }}>
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
      {accountList.length > 0 && (
        <div style={{ padding: '10px', border: '1px solid #ddd', backgroundColor: 'white' }}>
          <h4>💰 Accounts ({accountList.length})</h4>
          {accountList.map(account => (
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