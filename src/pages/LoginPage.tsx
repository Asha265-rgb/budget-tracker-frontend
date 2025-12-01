import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const borderColor = colors.gray[200];
  const primaryColor = colors.primary[500];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      const mockUser = {
        role: 'personal',
        name: 'Alex Johnson',
        email: formData.email
      };
      
      localStorage.setItem('userRole', mockUser.role);
      localStorage.setItem('userName', mockUser.name);
      localStorage.setItem('userEmail', mockUser.email);
      localStorage.setItem('authToken', 'mock-jwt-token-12345');

      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const demoAccounts = [
    { role: 'personal', email: 'personal@demo.com', password: 'demo123', description: 'Personal Finance User' },
    { role: 'business', email: 'business@demo.com', password: 'demo123', description: 'Business Account' },
    { role: 'group', email: 'group@demo.com', password: 'demo123', description: 'Group Expense User' }
  ];

  const handleDemoLogin = (email: string, password: string, role: string) => {
    setFormData({ email, password });
    
    setTimeout(() => {
      const mockUser = {
        role: role,
        name: role === 'personal' ? 'Alex Johnson' : role === 'business' ? 'Business Owner' : 'Group Manager',
        email: email
      };
      
      localStorage.setItem('userRole', mockUser.role);
      localStorage.setItem('userName', mockUser.name);
      localStorage.setItem('userEmail', mockUser.email);
      localStorage.setItem('authToken', 'mock-jwt-token-12345');

      navigate('/dashboard');
    }, 500);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
    }}>
      <Header />
      
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: spacing[6]
      }}>
        <div style={{
          width: '100%',
          maxWidth: '440px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: spacing[10] }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: spacing[2], textDecoration: 'none', marginBottom: spacing[6] }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: primaryColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white', fontWeight: 'bold' }}>
                💰
              </div>
              <span style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                BudgetTracker
              </span>
            </Link>
            
            <h1 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing[3] }}>
              Welcome Back
            </h1>
            <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, lineHeight: 1.5 }}>
              Sign in to your account to continue managing your finances
            </p>
          </div>

          <div style={{ backgroundColor: 'white', padding: spacing[8], borderRadius: '16px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', border: `1px solid ${borderColor}` }}>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  style={{ width: '100%', padding: spacing[3], border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: typography.fontSize.base, backgroundColor: colors.background.primary }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing[2] }}>
                  <label style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary }}>
                    Password
                  </label>
                  <Link to="/forgot-password" style={{ fontSize: typography.fontSize.sm, color: primaryColor, textDecoration: 'none', fontWeight: typography.fontWeight.medium }}>
                    Forgot password?
                  </Link>
                </div>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  style={{ width: '100%', padding: spacing[3], border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: typography.fontSize.base, backgroundColor: colors.background.primary }}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{ backgroundColor: isLoading ? colors.primary[300] : primaryColor, color: 'white', padding: spacing[3], border: 'none', borderRadius: '8px', fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.semibold, cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: spacing[2] }}
              >
                {isLoading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>

            <div style={{ marginTop: spacing[6], paddingTop: spacing[6], borderTop: `1px solid ${borderColor}` }}>
              <h3 style={{ fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing[4] }}>
                Try Demo Accounts
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                {demoAccounts.map((account, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleDemoLogin(account.email, account.password, account.role)}
                    style={{ backgroundColor: colors.background.secondary, border: `1px solid ${borderColor}`, padding: spacing[3], borderRadius: '8px', fontSize: typography.fontSize.sm, color: colors.text.primary, cursor: 'pointer', textAlign: 'left' }}
                  >
                    <div style={{ fontWeight: typography.fontWeight.medium }}>
                      {account.description}
                    </div>
                    <div style={{ fontSize: typography.fontSize.xs, color: colors.text.secondary, marginTop: '2px' }}>
                      {account.email} • {account.password}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div style={{ textAlign: 'center', marginTop: spacing[6], paddingTop: spacing[6], borderTop: `1px solid ${borderColor}` }}>
              <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                Don't have an account?{' '}
                <Link to="/register" style={{ color: primaryColor, fontWeight: typography.fontWeight.semibold, textDecoration: 'none' }}>
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;