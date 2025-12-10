import React, { useState, useMemo, useEffect } from 'react';
import { 
  FaPlus, 
  FaCreditCard, 
  FaPiggyBank, 
  FaChartLine, 
  FaMoneyBillWave,
  FaWallet,
  FaSearch,
  FaFilter,
  FaEllipsisH,
  FaArrowUp,
  FaArrowDown,
  FaEye,
  FaEdit,
  FaBuilding,
  FaUsers,
  FaUser
} from 'react-icons/fa';
import { useSelector } from 'react-redux';
import type { RootState } from '../../app/store';
import AddAccountModal from '../../features/accounts/AddAccountModal';
import { useGetAccountsQuery } from '../../features/accounts/accountsApi';
import type { Account as ApiAccount } from '../../features/accounts/accountsApi';

// Your Figma color theme
const theme = {
  primary: {
    50: '#FFF0F6',
    100: '#FFD6E7', 
    200: '#FFB3D1',
    300: '#FF8FBA',
    400: '#FF66A3',
    500: '#FF4D94',
    600: '#E63D84',
    700: '#CC2D74',
    800: '#B31D64',
    900: '#990D54'
  },
  
  success: {
    50: '#FFFDF0',
    100: '#FFF9D6',
    200: '#FFF4B3',
    300: '#FFEF8F',
    400: '#FFE966',
    500: '#FFD700',
    600: '#E6C200',
    700: '#CCAD00',
    800: '#B39700',
    900: '#998200'
  },
  
  warning: {
    50: '#FFF8F0',
    100: '#FFEED6',
    200: '#FFE0B3',
    300: '#FFD28F',
    400: '#FFC166',
    500: '#FFA500',
    600: '#E69500',
    700: '#CC8500',
    800: '#B37500',
    900: '#996500'
  },
  
  error: {
    50: '#FFF0F0',
    100: '#FFD6D6',
    200: '#FFB3B3',
    300: '#FF8F8F',
    400: '#FF6666',
    500: '#FF0000',
    600: '#E60000',
    700: '#CC0000',
    800: '#B30000',
    900: '#990000'
  },
  
  gray: {
    50: '#F8F9FA',
    100: '#F1F3F5',
    200: '#E9ECEF',
    300: '#DEE2E6',
    400: '#CED4DA',
    500: '#ADB5BD',
    600: '#6C757D',
    700: '#495057',
    800: '#343A40',
    900: '#212529'
  },
  
  background: '#FFFFFF'
};

interface AccountsDashboardProps {
  title?: string;
  subtitle?: string;
  userType?: 'personal' | 'business' | 'group';
}

// Type for UI account display
interface UIAccount {
  id: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Investment' | 'Cash';
  balance: number;
  bank: string;
  lastFour: string;
  color: string;
  icon: React.ReactNode;
  originalAccount?: FrontendAccount;
}

// Type for transformed frontend account
interface FrontendAccount {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  userId: string;
  accountNumber?: string;
  bankName?: string;
  color?: string;
  status?: string;
  isDeleted?: boolean;
}

// Helper function to transform frontend account data to backend format
export const transformAccountForBackend = (accountData: Partial<FrontendAccount>, userId: string) => {
  const transformed: Record<string, any> = {
    name: accountData.name,
    type: accountData.type,
    balance: accountData.balance,
    currency: accountData.currency,
    userId: userId,
  };

  // Only include optional fields if they exist and are not empty
  if (accountData.accountNumber) {
    transformed.accountNumber = accountData.accountNumber;
  }
  if (accountData.bankName) {
    transformed.bankName = accountData.bankName;
  }
  if (accountData.color) {
    transformed.color = accountData.color;
  }
  if (accountData.status) {
    transformed.status = accountData.status;
  }

  return transformed;
};

// Helper function to transform backend account data to frontend format
export const transformAccountForFrontend = (account: ApiAccount): FrontendAccount => {
  return {
    id: account.id,
    name: account.name,
    type: account.type,
    balance: account.balance,
    currency: account.currency || 'USD',
    userId: account.userId,
    accountNumber: account.accountNumber || '',
    bankName: account.bankName || '',
    color: account.color || theme.primary[500],
    status: account.status || 'active',
    isDeleted: account.isDeleted || false,
  };
};

const AccountsDashboard: React.FC<AccountsDashboardProps> = ({ 
  title,
  subtitle,
  userType: propUserType
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddAccountModal, setShowAddAccountModal] = useState(false);
  
  const { user } = useSelector((state: RootState) => state.auth);
  const userId = user?.id || '';
  
  const { data: apiAccounts = [], isLoading, refetch } = useGetAccountsQuery(userId, {
    skip: !userId,
  });

  // Get userType
  const userType = propUserType || 
                  (localStorage.getItem('userRole') as 'personal' | 'business' | 'group' | null) || 
                  'personal';
  
  // Transform API accounts to frontend format
  const transformedAccounts: FrontendAccount[] = useMemo(() => 
    apiAccounts.map(transformAccountForFrontend),
    [apiAccounts]
  );
  
  // Map transformed accounts to UI accounts
  const mapApiAccountToUiAccount = (account: FrontendAccount): UIAccount => {
    const getTypeDisplay = (type: string): UIAccount['type'] => {
      switch(type.toLowerCase()) {
        case 'bank':
        case 'checking':
          return 'Checking';
        case 'savings':
          return 'Savings';
        case 'credit_card':
        case 'credit card':
          return 'Credit Card';
        case 'investment':
          return 'Investment';
        case 'cash':
          return 'Cash';
        default:
          return 'Checking';
      }
    };

    const getIcon = (type: string): React.ReactNode => {
      switch(type.toLowerCase()) {
        case 'bank':
        case 'checking':
          return <FaMoneyBillWave />;
        case 'savings':
          return <FaPiggyBank />;
        case 'credit_card':
        case 'credit card':
          return <FaCreditCard />;
        case 'investment':
          return <FaChartLine />;
        case 'cash':
          return <FaWallet />;
        default:
          return <FaMoneyBillWave />;
      }
    };

    const getBankName = (bankName?: string, type?: string): string => {
      if (bankName) return bankName;
      switch(type?.toLowerCase()) {
        case 'cash': return 'Cash';
        case 'credit_card': 
        case 'credit card': 
          return 'Credit Card';
        default: return 'Bank Account';
      }
    };

    return {
      id: account.id,
      name: account.name,
      type: getTypeDisplay(account.type),
      balance: account.balance,
      bank: getBankName(account.bankName, account.type),
      lastFour: account.accountNumber ? account.accountNumber.slice(-4) : '0000',
      color: account.color || theme.primary[500],
      icon: getIcon(account.type),
      originalAccount: account
    };
  };

  const accounts: UIAccount[] = useMemo(() => 
    transformedAccounts.map(mapApiAccountToUiAccount),
    [transformedAccounts]
  );

  const getUserSpecificData = () => {
    switch(userType) {
      case 'business':
        return {
          title: title || 'Business Accounts',
          subtitle: subtitle || 'Manage your business financial accounts',
          icon: <FaBuilding />,
        };
      case 'group':
        return {
          title: title || 'Group Accounts',
          subtitle: subtitle || 'Manage shared group accounts',
          icon: <FaUsers />,
        };
      case 'personal':
      default:
        return {
          title: title || 'Personal Accounts',
          subtitle: subtitle || 'Manage all your personal financial accounts',
          icon: <FaUser />,
        };
    }
  };

  const userData = getUserSpecificData();
  
  interface AccountType {
    label: string;
    value: string;
    count: number;
  }

  // FIXED: Calculate counts properly
  const accountTypes: AccountType[] = useMemo(() => {
    const allCount = accounts.length;
    const checkingCount = accounts.filter(a => a.type === 'Checking').length;
    const savingsCount = accounts.filter(a => a.type === 'Savings').length;
    const creditCardCount = accounts.filter(a => a.type === 'Credit Card').length;
    const investmentCount = accounts.filter(a => a.type === 'Investment').length;
    const cashCount = accounts.filter(a => a.type === 'Cash').length;

    return [
      { label: 'All Accounts', value: 'all', count: allCount },
      { label: 'Checking', value: 'Checking', count: checkingCount },
      { label: 'Savings', value: 'Savings', count: savingsCount },
      { label: 'Credit Cards', value: 'Credit Card', count: creditCardCount },
      { label: 'Investments', value: 'Investment', count: investmentCount },
      { label: 'Cash', value: 'Cash', count: cashCount },
    ];
  }, [accounts]);

  // FIXED: Filter accounts with proper type comparison
  const filteredAccounts = useMemo(() => 
    accounts.filter(account => {
      const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           account.bank.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Handle type filtering correctly
      const matchesType = selectedType === 'all' || 
                         account.type.toLowerCase() === selectedType.toLowerCase();
      
      return matchesSearch && matchesType;
    }),
    [accounts, searchTerm, selectedType]
  );

  // FIXED: Calculate totals
  const { totalBalance, totalAssets, totalLiabilities } = useMemo(() => {
    const balance = accounts.reduce((sum, account) => sum + account.balance, 0);
    const assets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
    const liabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0));
    
    return { totalBalance: balance, totalAssets: assets, totalLiabilities: liabilities };
  }, [accounts]);

  // Add debug logging to check counts
  useEffect(() => {
    console.log('Account counts:', {
      total: accounts.length,
      byType: accountTypes.reduce((acc, type) => {
        acc[type.value] = type.count;
        return acc;
      }, {} as Record<string, number>),
      filtered: filteredAccounts.length,
      searchTerm,
      selectedType
    });
  }, [accounts, accountTypes, filteredAccounts, searchTerm, selectedType]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getTypeColor = (type: UIAccount['type']): string => {
    switch(type) {
      case 'Checking': return theme.primary[500];
      case 'Savings': return theme.success[500];
      case 'Credit Card': return theme.warning[500];
      case 'Investment': return '#7209B7';
      case 'Cash': return '#4895EF';
      default: return theme.gray[600];
    }
  };

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh',
        backgroundColor: theme.background,
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          fontSize: '16px',
          color: theme.gray[600],
          fontFamily: "'Inter', sans-serif"
        }}>
          Loading accounts...
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: theme.background,
      padding: '32px'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '32px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: `${theme.primary[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: theme.primary[500],
              fontSize: '18px'
            }}>
              {userData.icon}
            </div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: 700,
              color: theme.gray[900],
              fontFamily: "'Inter', sans-serif"
            }}>
              {userData.title}
            </h1>
          </div>
          <p style={{
            fontSize: '16px',
            color: theme.gray[600],
            fontFamily: "'Inter', sans-serif"
          }}>
            {userData.subtitle}
          </p>
        </div>
        <button
          onClick={() => setShowAddAccountModal(true)}
          style={{
            backgroundColor: theme.primary[500],
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            boxShadow: `0 2px 8px ${theme.primary[500]}40`,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = theme.primary[600];
            e.currentTarget.style.boxShadow = `0 4px 12px ${theme.primary[500]}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = theme.primary[500];
            e.currentTarget.style.boxShadow = `0 2px 8px ${theme.primary[500]}40`;
          }}
        >
          <FaPlus size={14} />
          Add Account
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        backgroundColor: theme.gray[50],
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
          minWidth: '300px'
        }}>
          <FaSearch style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: theme.gray[500],
            fontSize: '16px'
          }} />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 12px 12px 44px',
              border: `1px solid ${theme.gray[300]}`,
              borderRadius: '8px',
              fontSize: '14px',
              color: theme.gray[900],
              backgroundColor: theme.background,
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = theme.primary[500]}
            onBlur={(e) => e.target.style.borderColor = theme.gray[300]}
          />
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FaFilter style={{ color: theme.gray[600], fontSize: '14px' }} />
          <span style={{
            fontSize: '14px',
            color: theme.gray[600],
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500
          }}>
            Filter by:
          </span>
          <div style={{
            display: 'flex',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            {accountTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                style={{
                  backgroundColor: selectedType === type.value ? theme.primary[500] : 'transparent',
                  color: selectedType === type.value ? 'white' : theme.gray[600],
                  border: `1px solid ${selectedType === type.value ? theme.primary[500] : theme.gray[300]}`,
                  padding: '8px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s ease',
                  minHeight: '32px'
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== type.value) {
                    e.currentTarget.style.backgroundColor = theme.gray[100];
                    e.currentTarget.style.borderColor = theme.gray[400];
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== type.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = theme.gray[300];
                  }
                }}
              >
                {type.label}
                <span style={{
                  backgroundColor: selectedType === type.value ? 'rgba(255,255,255,0.2)' : theme.gray[200],
                  color: selectedType === type.value ? 'white' : theme.gray[600],
                  padding: '1px 6px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  minWidth: '20px',
                  textAlign: 'center'
                }}>
                  {type.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}>
        {/* Total Balance Card */}
        <div style={{
          backgroundColor: theme.background,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `4px solid ${theme.primary[500]}`,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: theme.gray[600],
              fontFamily: "'Inter', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total Balance
            </h3>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: `${theme.primary[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaMoneyBillWave style={{ color: theme.primary[500], fontSize: '18px' }} />
            </div>
          </div>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: theme.gray[900],
            fontFamily: "'Inter', sans-serif",
            marginBottom: '8px'
          }}>
            {formatCurrency(totalBalance)}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: theme.success[500],
              fontSize: '12px',
              fontWeight: 600
            }}>
              <FaArrowUp size={10} />
              <span>+12.5%</span>
            </div>
            <span style={{
              fontSize: '12px',
              color: theme.gray[600]
            }}>
              from last month
            </span>
          </div>
        </div>

        {/* Total Assets Card */}
        <div style={{
          backgroundColor: theme.background,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `4px solid ${theme.success[500]}`,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: theme.gray[600],
              fontFamily: "'Inter', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total Assets
            </h3>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: `${theme.success[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaChartLine style={{ color: theme.success[500], fontSize: '18px' }} />
            </div>
          </div>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: theme.gray[900],
            fontFamily: "'Inter', sans-serif",
            marginBottom: '8px'
          }}>
            {formatCurrency(totalAssets)}
          </p>
          <span style={{
            fontSize: '12px',
            color: theme.gray[600]
          }}>
            Across {accounts.filter(a => a.balance > 0).length} accounts
          </span>
        </div>

        {/* Total Liabilities Card */}
        <div style={{
          backgroundColor: theme.background,
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `4px solid ${theme.warning[500]}`,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: theme.gray[600],
              fontFamily: "'Inter', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              Total Liabilities
            </h3>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: `${theme.warning[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaCreditCard style={{ color: theme.warning[500], fontSize: '18px' }} />
            </div>
          </div>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: theme.error[500],
            fontFamily: "'Inter', sans-serif",
            marginBottom: '8px'
          }}>
            {formatCurrency(totalLiabilities)}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: theme.success[500],
              fontSize: '12px',
              fontWeight: 600
            }}>
              <FaArrowDown size={10} />
              <span>-5.2%</span>
            </div>
            <span style={{
              fontSize: '12px',
              color: theme.gray[600]
            }}>
              from last month
            </span>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      {accounts.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          backgroundColor: theme.gray[50],
          borderRadius: '12px',
          marginTop: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${theme.primary[500]}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: '16px'
          }}>
            <FaCreditCard style={{ color: theme.primary[500], fontSize: '32px' }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: theme.gray[900],
            marginBottom: '8px',
            fontFamily: "'Inter', sans-serif"
          }}>
            No accounts found
          </h3>
          <p style={{
            fontSize: '14px',
            color: theme.gray[600],
            marginBottom: '24px',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {searchTerm ? `No accounts match "${searchTerm}". Try a different search term.` : 
             selectedType !== 'all' ? `You don't have any ${selectedType.toLowerCase()} accounts yet.` :
             'You haven\'t added any accounts yet.'}
          </p>
          <button
            onClick={() => setShowAddAccountModal(true)}
            style={{
              backgroundColor: theme.primary[500],
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Add Your First Account
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredAccounts.map((account) => (
            <div
              key={account.id}
              style={{
                backgroundColor: theme.background,
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                border: `1px solid ${theme.gray[200]}`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
                e.currentTarget.style.borderColor = account.color;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                e.currentTarget.style.borderColor = theme.gray[200];
              }}
            >
              {/* Account Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px'
                }}>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: `${account.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: account.color
                  }}>
                    {account.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: '16px',
                      fontWeight: 600,
                      color: theme.gray[900],
                      fontFamily: "'Inter', sans-serif",
                      marginBottom: '2px'
                    }}>
                      {account.name}
                    </h3>
                    <p style={{
                      fontSize: '12px',
                      color: theme.gray[600],
                      fontFamily: "'Inter', sans-serif"
                    }}>
                      {account.bank} •••• {account.lastFour}
                    </p>
                  </div>
                </div>
                
                <button style={{
                  background: 'none',
                  border: 'none',
                  color: theme.gray[500],
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '4px',
                  borderRadius: '4px',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = theme.gray[700]}
                onMouseLeave={(e) => e.currentTarget.style.color = theme.gray[500]}
                >
                  <FaEllipsisH />
                </button>
              </div>

              {/* Account Type Badge */}
              <div style={{
                display: 'inline-block',
                backgroundColor: `${getTypeColor(account.type)}10`,
                color: getTypeColor(account.type),
                padding: '4px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                fontFamily: "'Inter', sans-serif",
                marginBottom: '16px'
              }}>
                {account.type}
              </div>

              {/* Balance */}
              <div style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '8px',
                marginBottom: '16px'
              }}>
                <p style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: account.balance >= 0 ? theme.gray[900] : theme.error[500],
                  fontFamily: "'Inter', sans-serif"
                }}>
                  {formatCurrency(account.balance)}
                </p>
                {account.balance >= 0 ? (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: theme.success[500],
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    <FaArrowUp size={10} />
                    <span>+2.4%</span>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2px',
                    color: theme.error[500],
                    fontSize: '12px',
                    fontWeight: 600
                  }}>
                    <FaArrowUp size={10} />
                    <span>+1.8%</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                gap: '12px',
                borderTop: `1px solid ${theme.gray[100]}`,
                paddingTop: '16px'
              }}>
                <button style={{
                  flex: 1,
                  backgroundColor: `${theme.primary[500]}10`,
                  color: theme.primary[500],
                  border: `1px solid ${theme.primary[500]}30`,
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = theme.primary[500];
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${theme.primary[500]}10`;
                  e.currentTarget.style.color = theme.primary[500];
                }}
                >
                  <FaEye style={{ marginRight: '6px' }} />
                  View Details
                </button>
                <button style={{
                  flex: 1,
                  backgroundColor: theme.primary[500],
                  color: 'white',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.primary[600]}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = theme.primary[500]}
                >
                  <FaEdit style={{ marginRight: '6px' }} />
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State for filtered results */}
      {accounts.length > 0 && filteredAccounts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '48px',
          backgroundColor: theme.gray[50],
          borderRadius: '12px',
          marginTop: '24px'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${theme.primary[500]}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: '16px'
          }}>
            <FaSearch style={{ color: theme.primary[500], fontSize: '32px' }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: theme.gray[900],
            marginBottom: '8px',
            fontFamily: "'Inter', sans-serif"
          }}>
            No accounts match your search
          </h3>
          <p style={{
            fontSize: '14px',
            color: theme.gray[600],
            marginBottom: '24px',
            fontFamily: "'Inter', sans-serif",
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {`Try adjusting your filters or search term to find what you're looking for.`}
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
            }}
            style={{
              backgroundColor: theme.primary[500],
              color: 'white',
              border: 'none',
              padding: '12px 32px',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: "'Inter', sans-serif"
            }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Add Account Modal */}
      {showAddAccountModal && (
        <AddAccountModal
          isOpen={showAddAccountModal}
          onClose={() => setShowAddAccountModal(false)}
          onSuccess={() => {
            refetch();
            setShowAddAccountModal(false);
          }}
          userId={userId}
        />
      )}
    </div>
  );
};

export default AccountsDashboard;