// src/features/accounts/AccountsPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { spacing } from '../../styles/spacing';
import { 
  FaPlus, 
  FaCreditCard, 
  FaPiggyBank, 
  FaChartLine, 
  FaMoneyBillWave,
  FaWallet,
  FaEllipsisH,
  FaArrowUp,
  FaArrowDown,
  FaSearch,
  FaFilter
} from 'react-icons/fa';

// Your color palette
const colors = {
  // Primary: Baby Pink
  primary: {
    50: '#FFF0F6',
    100: '#FFD6E7',
    200: '#FFB3D1',
    300: '#FF8FBA',
    400: '#FF66A3',
    500: '#FF4D94', // Main baby pink
    600: '#E63D84',
    700: '#CC2D74',
    800: '#B31D64',
    900: '#990D54'
  },
  
  // Success: Gold
  success: {
    50: '#FFFDF0',
    100: '#FFF9D6',
    200: '#FFF4B3',
    300: '#FFEF8F',
    400: '#FFE966',
    500: '#FFD700', // Main gold
    600: '#E6C200',
    700: '#CCAD00',
    800: '#B39700',
    900: '#998200'
  },
  
  // Warning: Orange
  warning: {
    50: '#FFF8F0',
    100: '#FFEED6',
    200: '#FFE0B3',
    300: '#FFD28F',
    400: '#FFC166',
    500: '#FFA500', // Main orange
    600: '#E69500',
    700: '#CC8500',
    800: '#B37500',
    900: '#996500'
  },
  
  // Error: Red
  error: {
    50: '#FFF0F0',
    100: '#FFD6D6',
    200: '#FFB3B3',
    300: '#FF8F8F',
    400: '#FF6666',
    500: '#FF0000', // Main red
    600: '#E60000',
    700: '#CC0000',
    800: '#B30000',
    900: '#990000'
  },
  
  // Neutrals
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
  
  // Text colors
  text: {
    primary: '#212529',
    secondary: '#6C757D',
    tertiary: '#ADB5BD'
  },
  
  // Background colors
  background: {
    primary: '#FFFFFF',
    secondary: '#F8F9FA',
    tertiary: '#F1F3F5'
  },
  
  // Border colors
  border: '#E9ECEF',
  borderLight: '#F1F3F5'
};

interface Account {
  id: string;
  name: string;
  bank: string;
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Investment' | 'Cash';
  balance: number;
  lastFour: string;
  color: string;
  icon: React.ReactNode;
}

const AccountsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  
  const accounts: Account[] = [
    { 
      id: '1', 
      name: 'Primary Checking', 
      bank: 'Chase Bank',
      type: 'Checking', 
      balance: 5423.87, 
      lastFour: '3245',
      color: colors.primary[500], // Baby pink
      icon: <FaMoneyBillWave />
    },
    { 
      id: '2', 
      name: 'Emergency Fund', 
      bank: 'Ally Bank',
      type: 'Savings', 
      balance: 15200.50, 
      lastFour: '7890',
      color: colors.success[500], // Gold
      icon: <FaPiggyBank />
    },
    { 
      id: '3', 
      name: 'Visa Platinum', 
      bank: 'Chase',
      type: 'Credit Card', 
      balance: -1250.75, 
      lastFour: '5678',
      color: colors.warning[500], // Orange
      icon: <FaCreditCard />
    },
    { 
      id: '4', 
      name: 'Brokerage Account', 
      bank: 'Fidelity',
      type: 'Investment', 
      balance: 45000.00, 
      lastFour: '9012',
      color: '#7209B7', // Purple for investment
      icon: <FaChartLine />
    },
    { 
      id: '5', 
      name: 'Cash Wallet', 
      bank: 'Physical',
      type: 'Cash', 
      balance: 350.00, 
      lastFour: '0000',
      color: '#4895EF', // Light blue for cash
      icon: <FaWallet />
    },
  ];

  const accountTypes = [
    { label: 'All Accounts', value: 'all', count: accounts.length },
    { label: 'Checking', value: 'Checking', count: accounts.filter(a => a.type === 'Checking').length },
    { label: 'Savings', value: 'Savings', count: accounts.filter(a => a.type === 'Savings').length },
    { label: 'Credit Cards', value: 'Credit Card', count: accounts.filter(a => a.type === 'Credit Card').length },
    { label: 'Investments', value: 'Investment', count: accounts.filter(a => a.type === 'Investment').length },
    { label: 'Cash', value: 'Cash', count: accounts.filter(a => a.type === 'Cash').length },
  ];

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.bank.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || account.type === selectedType;
    return matchesSearch && matchesType;
  });

  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const totalAssets = accounts.filter(a => a.balance > 0).reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = Math.abs(accounts.filter(a => a.balance < 0).reduce((sum, a) => sum + a.balance, 0));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getTypeColor = (type: Account['type']) => {
    switch(type) {
      case 'Checking': return colors.primary[500];
      case 'Savings': return colors.success[500];
      case 'Credit Card': return colors.warning[500];
      case 'Investment': return '#7209B7';
      case 'Cash': return '#4895EF';
      default: return colors.gray[600];
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      backgroundColor: colors.background.primary,
      padding: spacing[8]
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing[8]
      }}>
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 700,
            color: colors.text.primary,
            marginBottom: spacing[2],
            fontFamily: "'Inter', sans-serif"
          }}>
            Accounts
          </h1>
          <p style={{
            fontSize: '16px',
            color: colors.text.secondary,
            fontFamily: "'Inter', sans-serif"
          }}>
            Manage all your financial accounts in one place
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            backgroundColor: colors.primary[500],
            color: 'white',
            border: 'none',
            padding: `${spacing[3]} ${spacing[6]}`,
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            cursor: 'pointer',
            fontFamily: "'Inter', sans-serif",
            boxShadow: `0 2px 8px ${colors.primary[500]}40`,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[600];
            e.currentTarget.style.boxShadow = `0 4px 12px ${colors.primary[500]}60`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = colors.primary[500];
            e.currentTarget.style.boxShadow = `0 2px 8px ${colors.primary[500]}40`;
          }}
        >
          <FaPlus size={14} />
          Add Account
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        backgroundColor: colors.background.secondary,
        borderRadius: '12px',
        padding: spacing[6],
        marginBottom: spacing[8],
        display: 'flex',
        alignItems: 'center',
        gap: spacing[4],
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
            color: colors.text.tertiary,
            fontSize: '16px'
          }} />
          <input
            type="text"
            placeholder="Search accounts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: `${spacing[3]} ${spacing[3]} ${spacing[3]} 44px`,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              color: colors.text.primary,
              backgroundColor: colors.background.primary,
              fontFamily: "'Inter', sans-serif",
              outline: 'none',
              transition: 'border-color 0.2s ease'
            }}
            onFocus={(e) => e.target.style.borderColor = colors.primary[500]}
            onBlur={(e) => e.target.style.borderColor = colors.border}
          />
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2]
        }}>
          <FaFilter style={{ color: colors.text.secondary, fontSize: '14px' }} />
          <span style={{
            fontSize: '14px',
            color: colors.text.secondary,
            fontFamily: "'Inter', sans-serif",
            fontWeight: 500
          }}>
            Filter by:
          </span>
          <div style={{
            display: 'flex',
            gap: spacing[2],
            flexWrap: 'wrap'
          }}>
            {accountTypes.map((type) => (
              <button
                key={type.value}
                onClick={() => setSelectedType(type.value)}
                style={{
                  backgroundColor: selectedType === type.value ? colors.primary[500] : 'transparent',
                  color: selectedType === type.value ? 'white' : colors.text.secondary,
                  border: `1px solid ${selectedType === type.value ? colors.primary[500] : colors.border}`,
                  padding: `${spacing[2]} ${spacing[4]}`,
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Inter', sans-serif",
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  transition: 'all 0.2s ease',
                  minHeight: '32px'
                }}
                onMouseEnter={(e) => {
                  if (selectedType !== type.value) {
                    e.currentTarget.style.backgroundColor = colors.background.tertiary;
                    e.currentTarget.style.borderColor = colors.gray[400];
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedType !== type.value) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = colors.border;
                  }
                }}
              >
                {type.label}
                <span style={{
                  backgroundColor: selectedType === type.value ? 'rgba(255,255,255,0.2)' : colors.gray[200],
                  color: selectedType === type.value ? 'white' : colors.text.secondary,
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
        gap: spacing[6],
        marginBottom: spacing[8]
      }}>
        {/* Total Balance Card */}
        <div style={{
          backgroundColor: colors.background.primary,
          padding: spacing[6],
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `4px solid ${colors.primary[500]}`,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[4]
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.text.secondary,
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
              backgroundColor: `${colors.primary[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaMoneyBillWave style={{ color: colors.primary[500], fontSize: '18px' }} />
            </div>
          </div>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: colors.text.primary,
            fontFamily: "'Inter', sans-serif",
            marginBottom: spacing[2]
          }}>
            {formatCurrency(totalBalance)}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: colors.success[500],
              fontSize: '12px',
              fontWeight: 600
            }}>
              <FaArrowUp size={10} />
              <span>+12.5%</span>
            </div>
            <span style={{
              fontSize: '12px',
              color: colors.text.secondary
            }}>
              from last month
            </span>
          </div>
        </div>

        {/* Total Assets Card */}
        <div style={{
          backgroundColor: colors.background.primary,
          padding: spacing[6],
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `4px solid ${colors.success[500]}`,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[4]
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.text.secondary,
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
              backgroundColor: `${colors.success[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaChartLine style={{ color: colors.success[500], fontSize: '18px' }} />
            </div>
          </div>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: colors.text.primary,
            fontFamily: "'Inter', sans-serif",
            marginBottom: spacing[2]
          }}>
            {formatCurrency(totalAssets)}
          </p>
          <span style={{
            fontSize: '12px',
            color: colors.text.secondary
          }}>
            Across {accounts.filter(a => a.balance > 0).length} accounts
          </span>
        </div>

        {/* Total Liabilities Card */}
        <div style={{
          backgroundColor: colors.background.primary,
          padding: spacing[6],
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          borderLeft: `4px solid ${colors.warning[500]}`,
          transition: 'transform 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: spacing[4]
          }}>
            <h3 style={{
              fontSize: '14px',
              fontWeight: 600,
              color: colors.text.secondary,
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
              backgroundColor: `${colors.warning[500]}20`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FaCreditCard style={{ color: colors.warning[500], fontSize: '18px' }} />
            </div>
          </div>
          <p style={{
            fontSize: '28px',
            fontWeight: 700,
            color: colors.error[500],
            fontFamily: "'Inter', sans-serif",
            marginBottom: spacing[2]
          }}>
            {formatCurrency(totalLiabilities)}
          </p>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2]
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: colors.success[500],
              fontSize: '12px',
              fontWeight: 600
            }}>
              <FaArrowDown size={10} />
              <span>-5.2%</span>
            </div>
            <span style={{
              fontSize: '12px',
              color: colors.text.secondary
            }}>
              from last month
            </span>
          </div>
        </div>
      </div>

      {/* Accounts Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: spacing[6]
      }}>
        {filteredAccounts.map((account) => (
          <div
            key={account.id}
            style={{
              backgroundColor: colors.background.primary,
              borderRadius: '12px',
              padding: spacing[6],
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              border: `1px solid ${colors.border}`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.1)';
              e.currentTarget.style.borderColor = account.color;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
              e.currentTarget.style.borderColor = colors.border;
            }}
          >
            {/* Account Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginBottom: spacing[4]
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: spacing[3]
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
                    color: colors.text.primary,
                    fontFamily: "'Inter', sans-serif",
                    marginBottom: '2px'
                  }}>
                    {account.name}
                  </h3>
                  <p style={{
                    fontSize: '12px',
                    color: colors.text.secondary,
                    fontFamily: "'Inter', sans-serif"
                  }}>
                    {account.bank} •••• {account.lastFour}
                  </p>
                </div>
              </div>
              
              <button style={{
                background: 'none',
                border: 'none',
                color: colors.text.tertiary,
                cursor: 'pointer',
                fontSize: '16px',
                padding: spacing[1],
                borderRadius: '4px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.color = colors.text.secondary}
              onMouseLeave={(e) => e.currentTarget.style.color = colors.text.tertiary}
              >
                <FaEllipsisH />
              </button>
            </div>

            {/* Account Type Badge */}
            <div style={{
              display: 'inline-block',
              backgroundColor: `${getTypeColor(account.type)}10`,
              color: getTypeColor(account.type),
              padding: `${spacing[1]} ${spacing[3]}`,
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: 600,
              fontFamily: "'Inter', sans-serif",
              marginBottom: spacing[4]
            }}>
              {account.type}
            </div>

            {/* Balance */}
            <div style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: spacing[2],
              marginBottom: spacing[4]
            }}>
              <p style={{
                fontSize: '24px',
                fontWeight: 700,
                color: account.balance >= 0 ? colors.text.primary : colors.error[500],
                fontFamily: "'Inter', sans-serif"
              }}>
                {formatCurrency(account.balance)}
              </p>
              {account.balance >= 0 ? (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '2px',
                  color: colors.success[500],
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
                  color: colors.error[500],
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
              gap: spacing[3],
              borderTop: `1px solid ${colors.borderLight}`,
              paddingTop: spacing[4]
            }}>
              <button style={{
                flex: 1,
                backgroundColor: `${colors.primary[500]}10`,
                color: colors.primary[500],
                border: `1px solid ${colors.primary[500]}30`,
                padding: `${spacing[2]} ${spacing[4]}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[500];
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = `${colors.primary[500]}10`;
                e.currentTarget.style.color = colors.primary[500];
              }}
              >
                View Details
              </button>
              <button style={{
                flex: 1,
                backgroundColor: colors.primary[500],
                color: 'white',
                border: 'none',
                padding: `${spacing[2]} ${spacing[4]}`,
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: "'Inter', sans-serif",
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.primary[600]}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = colors.primary[500]}
              >
                Add Transaction
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredAccounts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: spacing[12],
          backgroundColor: colors.background.secondary,
          borderRadius: '12px',
          marginTop: spacing[6]
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: `${colors.primary[500]}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto',
            marginBottom: spacing[4]
          }}>
            <FaCreditCard style={{ color: colors.primary[500], fontSize: '32px' }} />
          </div>
          <h3 style={{
            fontSize: '18px',
            fontWeight: 600,
            color: colors.text.primary,
            marginBottom: spacing[2],
            fontFamily: "'Inter', sans-serif"
          }}>
            No accounts found
          </h3>
          <p style={{
            fontSize: '14px',
            color: colors.text.secondary,
            marginBottom: spacing[6],
            fontFamily: "'Inter', sans-serif",
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {searchTerm ? `No accounts match "${searchTerm}". Try a different search term.` : 
             selectedType !== 'all' ? `You don't have any ${selectedType.toLowerCase()} accounts yet.` :
             'You haven\'t added any accounts yet.'}
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: colors.primary[500],
              color: 'white',
              border: 'none',
              padding: `${spacing[3]} ${spacing[8]}`,
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
      )}
    </div>
  );
};

export default AccountsPage;