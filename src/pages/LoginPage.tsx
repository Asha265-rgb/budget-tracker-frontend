import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { loginUser } from '../features/auth/authSlice';
// CHANGE THIS IMPORT:
import { useLoginMutation } from '../features/auth/authApi'; // Updated import

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Use RTK Query mutation
  const [loginMutation, { isLoading: isLoginLoading }] = useLoginMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      console.log('🔐 Attempting login with:', { email: formData.email });
      
      // ========== USE RTK QUERY LOGIN ==========
      const result = await loginMutation({
        email: formData.email,
        password: formData.password
      }).unwrap();
      
      console.log('✅ Login API Response:', result);
      
      // Store the access token
      if (result.access_token) {
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('token', result.access_token);
      }
      
      // Get the user data from API response
      const user = result.user;
      console.log('👤 User data from API:', user);
      
      if (!user) {
        throw new Error('No user data in response');
      }
      
      // Extract user type - from your User type definition
      const userType = user.userType || 'personal';
      
      console.log('📋 User type from API:', userType);
      
      // Create full name from firstName and lastName
      const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
      
      // Prepare user object for storage (matching your User type)
      const userToStore = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        preferredCurrency: user.preferredCurrency,
        isVerified: user.isVerified,
        phoneNumber: user.phoneNumber,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      };
      
      // Store user data in localStorage
      localStorage.setItem('budget_tracker_user', JSON.stringify(userToStore));
      localStorage.setItem('userType', userType);
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userName', fullName);
      localStorage.setItem('userEmail', user.email);
      
      console.log('💾 Stored user data:', {
        userType: userType,
        name: fullName,
        email: user.email
      });
      
      // Dispatch to Redux store
      // Use type assertion to bypass TypeScript error temporarily
      await dispatch(loginUser({
        email: formData.email,
        password: formData.password
      }) as any).unwrap();
      
      setIsLoading(false);
      
      // Navigate to dashboard
      console.log('🚀 Navigating to dashboard...');
      navigate('/dashboard');
      
    } catch (err: any) {
      console.error('❌ Login failed:', err);
      
      // Handle RTK Query error structure
      let errorMessage = 'Login failed. Please check your credentials.';
      
      if (err?.data?.message) {
        errorMessage = err.data.message;
      } else if (err?.error) {
        errorMessage = err.error;
      } else if (err?.message) {
        errorMessage = err.message;
      } else if (err?.status) {
        switch (err.status) {
          case 401:
            errorMessage = 'Invalid email or password';
            break;
          case 404:
            errorMessage = 'User not found';
            break;
          case 500:
            errorMessage = 'Server error. Please try again later';
            break;
        }
      }
      
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  // Use RTK Query loading state
  const isSubmitting = isLoading || isLoginLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-pink-50 flex flex-col">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <Link to="/" className="inline-flex items-center gap-3 text-gray-900 hover:text-pink-600 transition-colors mb-6 no-underline">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                💰
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
                BudgetTracker
              </span>
            </Link>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Welcome Back
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed">
              Sign in to your account to continue managing your finances
            </p>
          </div>

          {/* Login Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-pink-100">
            {error && (
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl mb-6">
                <div className="font-bold mb-1">Error</div>
                <div>{error}</div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                />
              </div>

              {/* Password Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-900">
                    Password
                  </label>
                  <Link 
                    to="/forgot-password" 
                    className="text-sm font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                  >
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
                  className="w-full px-4 py-3 bg-pink-50 border border-pink-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-pink-600 to-rose-500 hover:from-pink-700 hover:to-rose-600 text-white font-semibold py-3 px-4 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-pink-600 hover:text-pink-700 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              By signing in, you agree to our{' '}
              <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-pink-600 hover:text-pink-700 font-medium">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;