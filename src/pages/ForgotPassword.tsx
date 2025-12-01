import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../styles/colors';
import { spacing } from '../styles/spacing';
import { typography } from '../styles/typography';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const borderColor = colors.gray[200];
  const primaryColor = colors.primary[500];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1500);
  };

  const handleReset = () => {
    setEmail('');
    setIsSubmitted(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
      padding: spacing[6]
    }}>
      <div style={{
        width: '100%',
        maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: spacing[10] }}>
          <Link 
            to="/" 
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: spacing[2],
              textDecoration: 'none',
              marginBottom: spacing[6]
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              backgroundColor: primaryColor,
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: 'white',
              fontWeight: 'bold'
            }}>
              💰
            </div>
            <span style={{
              fontSize: typography.fontSize.xl,
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary
            }}>
              BudgetTracker
            </span>
          </Link>
          
          <h1 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing[3]
          }}>
            {isSubmitted ? 'Check Your Email' : 'Reset Password'}
          </h1>
          <p style={{
            fontSize: typography.fontSize.base,
            color: colors.text.secondary,
            lineHeight: 1.5
          }}>
            {isSubmitted 
              ? `We've sent password reset instructions to ${email}`
              : 'Enter your email address and we\'ll send you reset instructions'
            }
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: spacing[8],
          borderRadius: '16px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.05)',
          border: `1px solid ${borderColor}`
        }}>
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[5]
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[2]
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    fontSize: typography.fontSize.base,
                    backgroundColor: colors.background.primary
                  }}
                />
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
                  marginTop: spacing[2]
                }}
              >
                {isLoading ? 'Sending...' : 'Send Reset Instructions'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: '#dcfce7',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                color: '#16a34a',
                margin: '0 auto ' + spacing[6]
              }}>
                ✓
              </div>
              
              <h3 style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.semibold,
                color: colors.text.primary,
                marginBottom: spacing[3]
              }}>
                Email Sent!
              </h3>
              
              <p style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary,
                lineHeight: 1.6,
                marginBottom: spacing[6]
              }}>
                We've sent password reset instructions to <strong>{email}</strong>. 
                Please check your inbox and follow the link to reset your password.
              </p>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: spacing[3]
              }}>
                <button
                  onClick={handleReset}
                  style={{
                    backgroundColor: primaryColor,
                    color: 'white',
                    padding: spacing[3],
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    cursor: 'pointer'
                  }}
                >
                  Resend Email
                </button>
                
                <Link 
                  to="/login"
                  style={{
                    backgroundColor: 'transparent',
                    color: primaryColor,
                    padding: spacing[3],
                    border: `2px solid ${primaryColor}`,
                    borderRadius: '8px',
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    textDecoration: 'none',
                    display: 'block',
                    textAlign: 'center'
                  }}
                >
                  Back to Sign In
                </Link>
              </div>
            </div>
          )}

          {!isSubmitted && (
            <div style={{ 
              textAlign: 'center', 
              marginTop: spacing[6],
              paddingTop: spacing[6],
              borderTop: `1px solid ${borderColor}`
            }}>
              <p style={{
                fontSize: typography.fontSize.sm,
                color: colors.text.secondary
              }}>
                Remember your password?{' '}
                <Link 
                  to="/login"
                  style={{
                    color: primaryColor,
                    fontWeight: typography.fontWeight.semibold,
                    textDecoration: 'none'
                  }}
                >
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>

        <div style={{
          textAlign: 'center',
          marginTop: spacing[6],
          padding: spacing[4],
          backgroundColor: colors.background.secondary,
          borderRadius: '8px'
        }}>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary,
            margin: 0,
            lineHeight: 1.5
          }}>
            <strong>Need help?</strong> Contact our support team at{' '}
            <a 
              href="mailto:support@budgettracker.com"
              style={{
                color: primaryColor,
                textDecoration: 'none',
                fontWeight: typography.fontWeight.medium
              }}
            >
              support@budgettracker.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;