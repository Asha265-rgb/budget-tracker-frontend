import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { registerUser } from '../features/auth/authSlice';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';
import Header from '../components/Layout/Header';
import Footer from '../components/Layout/Footer';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    userType: 'personal'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const borderColor = colors.gray[200];
  const primaryColor = colors.primary[500];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.clear();
    console.log('🧪 === REGISTRATION START ===');
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const userData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        userType: formData.userType
      };

      console.log('📤 Sending registration data:', userData);
      
      // Test backend connection first
      try {
        console.log('🌐 Testing backend connection...');
        const testResponse = await fetch('http://localhost:8000', {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });
        console.log('✅ Backend reachable, status:', testResponse.status);
      } catch (testError: any) {
        console.error('❌ Backend not reachable:', testError);
        setError('Cannot connect to backend server. Please make sure it\'s running on http://localhost:8000');
        setIsLoading(false);
        return;
      }

      // Try to register using Redux
      console.log('🔄 Dispatching registerUser action...');
      const result = await dispatch(registerUser(userData) as any);
      
      console.log('📥 Dispatch result:', result);
      
      if (result.error) {
        console.error('❌ Registration failed:', result.error);
        setError(result.error.message || 'Registration failed. Please try again.');
      } else {
        console.log('✅ Registration successful!');
        
        // Show success message
        alert(`✅ Registration successful!\n\nEmail: ${formData.email}\n\nPlease login with your credentials.`);
        
        // Clear form
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          userType: 'personal'
        });
        
        // Redirect to login page
        navigate('/login');
      }
      
    } catch (err: any) {
      console.error('❌ Unexpected error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
      console.log('🏁 Registration process complete');
    }
  };

  const testBackendConnection = async () => {
    console.clear();
    console.log('🔍 Testing backend connection...');
    
    try {
      // Test multiple endpoints
      const endpoints = [
        'http://localhost:8000/auth/register',
        'http://localhost:8000/auth/login'
      ];
      
      const results = [];
      
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint, { method: 'GET' });
          results.push(`${endpoint}: ${response.status} ${response.statusText}`);
          console.log(`${endpoint}: ${response.status}`);
        } catch (error: any) {
          results.push(`${endpoint}: ERROR - ${error.message}`);
          console.error(`${endpoint}:`, error.message);
        }
      }
      
      alert(`Backend Test Results:\n\n${results.join('\n')}`);
      
    } catch (error: any) {
      alert(`❌ Test failed: ${error.message}`);
      console.error('Test failed:', error);
    }
  };

  const userTypes = [
    { value: 'personal', label: 'Personal Finance', description: 'Manage your personal budget and expenses', icon: '👤' },
    { value: 'business', label: 'Business Account', description: 'Track business finances and team expenses', icon: '🏢' },
    { value: 'group', label: 'Group Expenses', description: 'Share expenses with friends or family', icon: '👥' }
  ];

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
          maxWidth: '480px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: spacing[8] }}>
            <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: spacing[2], textDecoration: 'none', marginBottom: spacing[6] }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: primaryColor, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: 'white', fontWeight: 'bold' }}>
                💰
              </div>
              <span style={{ fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: colors.text.primary }}>
                BudgetTracker
              </span>
            </Link>
            
            <h1 style={{ fontSize: typography.fontSize['3xl'], fontWeight: typography.fontWeight.bold, color: colors.text.primary, marginBottom: spacing[3] }}>
              Create Account
            </h1>
            <p style={{ fontSize: typography.fontSize.base, color: colors.text.secondary, lineHeight: 1.5 }}>
              Join thousands of users managing their finances smarter
            </p>
          </div>

          <div style={{ backgroundColor: 'white', padding: spacing[8], borderRadius: '16px', boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)', border: `1px solid ${borderColor}` }}>
            {error && (
              <div style={{ 
                backgroundColor: colors.primary[50], 
                border: `1px solid ${colors.primary[200]}`,
                color: colors.primary[700],
                padding: spacing[3],
                borderRadius: '8px',
                marginBottom: spacing[4],
                fontSize: typography.fontSize.sm
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Error</div>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: spacing[5] }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    placeholder="First name"
                    style={{ width: '100%', padding: spacing[3], border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: typography.fontSize.base, backgroundColor: colors.background.primary }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    placeholder="Last name"
                    style={{ width: '100%', padding: spacing[3], border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: typography.fontSize.base, backgroundColor: colors.background.primary }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>
                  Email Address *
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
                <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[3] }}>
                  Account Type
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[3] }}>
                  {userTypes.map((type) => (
                    <label
                      key={type.value}
                      style={{ display: 'flex', alignItems: 'flex-start', gap: spacing[3], padding: spacing[4], border: `2px solid ${formData.userType === type.value ? primaryColor : borderColor}`, borderRadius: '8px', backgroundColor: formData.userType === type.value ? colors.primary[50] : colors.background.primary, cursor: 'pointer' }}
                    >
                      <input
                        type="radio"
                        name="userType"
                        value={type.value}
                        checked={formData.userType === type.value}
                        onChange={handleChange}
                        style={{ marginTop: '2px' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] }}>
                          <span style={{ fontSize: '18px' }}>{type.icon}</span>
                          <span style={{ fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.text.primary }}>
                            {type.label}
                          </span>
                        </div>
                        <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary, lineHeight: 1.4, margin: 0 }}>
                          {type.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: spacing[4] }}>
                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Create password (min 6 characters)"
                    style={{ width: '100%', padding: spacing[3], border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: typography.fontSize.base, backgroundColor: colors.background.primary }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: colors.text.primary, marginBottom: spacing[2] }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    placeholder="Confirm password"
                    style={{ width: '100%', padding: spacing[3], border: `1px solid ${borderColor}`, borderRadius: '8px', fontSize: typography.fontSize.base, backgroundColor: colors.background.primary }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                style={{ 
                  backgroundColor: isLoading ? colors.primary[300] : primaryColor, 
                  color: 'white', 
                  padding: spacing[3], 
                  border: 'none', 
                  borderRadius: '8px', 
                  fontSize: typography.fontSize.lg, 
                  fontWeight: typography.fontWeight.semibold, 
                  cursor: isLoading ? 'not-allowed' : 'pointer', 
                  marginTop: spacing[2],
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Test Backend Button */}
            <div style={{ marginTop: spacing[4], textAlign: 'center' }}>
              <button
                type="button"
                onClick={testBackendConnection}
                style={{
                  backgroundColor: colors.gray[100],
                  color: colors.gray[700],
                  padding: `${spacing[2]} ${spacing[3]}`,
                  border: `1px solid ${colors.gray[300]}`,
                  borderRadius: '8px',
                  fontSize: typography.fontSize.sm,
                  cursor: 'pointer'
                }}
              >
                🔍 Test Backend Connection
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: spacing[6], paddingTop: spacing[6], borderTop: `1px solid ${borderColor}` }}>
              <p style={{ fontSize: typography.fontSize.sm, color: colors.text.secondary }}>
                Already have an account?{' '}
                <Link to="/login" style={{ color: primaryColor, fontWeight: typography.fontWeight.semibold, textDecoration: 'none' }}>
                  Sign in
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

export default RegisterPage;