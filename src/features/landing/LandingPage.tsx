import React from 'react';
import { Link } from 'react-router-dom';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

// Updated import path - removed "images/" folder and fixed extension
import heroImage from '../../assets/landing-hero.png';

const LandingPage: React.FC = () => {
  const features = [
    {
      icon: '📊',
      title: 'Smart Budgeting',
      description: 'Create and track budgets with intelligent categorization'
    },
    {
      icon: '🎯',
      title: 'Goal Setting',
      description: 'Set financial goals and track your progress'
    },
    {
      icon: '👥',
      title: 'Group Expenses',
      description: 'Split bills and track shared expenses with friends'
    },
    {
      icon: '📈',
      title: 'Advanced Reports',
      description: 'Visualize your spending patterns with detailed analytics'
    },
    {
      icon: '🔔',
      title: 'Smart Alerts',
      description: 'Get notified about unusual spending and bill due dates'
    },
    {
      icon: '💼',
      title: 'Business Tools',
      description: 'Manage business finances with team collaboration features'
    }
  ];

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Freelancer',
      content: 'BudgetTracker helped me save 30% more each month. The insights are incredible!',
      avatar: '👨‍💻'
    },
    {
      name: 'Sarah Miller',
      role: 'Small Business Owner',
      content: 'Finally, a budgeting app that understands business needs. Game changer!',
      avatar: '👩‍💼'
    },
    {
      name: 'Mike Chen',
      role: 'College Student',
      content: 'Perfect for managing student expenses and splitting costs with roommates.',
      avatar: '👨‍🎓'
    }
  ];

  const primaryColor = colors.primary[500];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
    }}>
      {/* Hero Section */}
      <section style={{
        padding: `${spacing[16]} ${spacing[6]}`,
        background: 'linear-gradient(135deg, #fff0f6 0%, #fff5f7 50%, #ffffff 100%)'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing[12],
          alignItems: 'center'
        }}>
          {/* Left Column - Text Content */}
          <div>
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: primaryColor,
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
              color: 'white',
              marginBottom: spacing[6],
              fontWeight: 'bold'
            }}>
              💰
            </div>
            <h1 style={{
              fontSize: typography.fontSize['4xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[4],
              lineHeight: 1.2
            }}>
              Take Control of Your <span style={{ color: primaryColor }}>Financial Future</span>
            </h1>
            <p style={{
              fontSize: typography.fontSize.xl,
              color: colors.text.secondary,
              lineHeight: 1.6,
              marginBottom: spacing[8]
            }}>
              BudgetTracker helps you manage your money, achieve your goals, and build wealth 
              with powerful yet simple financial tools.
            </p>
            <div style={{
              display: 'flex',
              gap: spacing[4],
              flexWrap: 'wrap'
            }}>
              <Link 
                to="/register"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white',
                  padding: `${spacing[4]} ${spacing[8]}`,
                  borderRadius: '8px',
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Get Started Free
              </Link>
              <Link 
                to="/login"
                style={{
                  backgroundColor: 'transparent',
                  color: primaryColor,
                  padding: `${spacing[4]} ${spacing[8]}`,
                  border: `2px solid ${primaryColor}`,
                  borderRadius: '8px',
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  textDecoration: 'none',
                  display: 'inline-block'
                }}
              >
                Sign In
              </Link>
            </div>
          </div>

          {/* Right Column - Enhanced Hero Image */}
          <div style={{
            textAlign: 'center'
          }}>
            <img 
              src={heroImage} 
              alt="Budget Tracker App" 
              style={{
                maxWidth: '100%',
                height: 'auto',
                borderRadius: '16px',
                boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
                border: '8px solid white'
              }}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{
        padding: `${spacing[12]} ${spacing[6]}`,
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[4]
          }}>
            Everything You Need to Master Your Finances
          </h2>
          <p style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: spacing[12],
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto'
          }}>
            Powerful features designed to simplify your financial life and help you achieve your money goals.
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing[6]
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: colors.background.secondary,
                  padding: spacing[6],
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: spacing[4] }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing[2]
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  lineHeight: 1.6
                }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section style={{
        padding: `${spacing[12]} ${spacing[6]}`,
        backgroundColor: colors.background.secondary
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[4]
          }}>
            Trusted by Thousands
          </h2>
          <p style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.secondary,
            textAlign: 'center',
            marginBottom: spacing[12]
          }}>
            See what our users are saying about their experience with BudgetTracker
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: spacing[6]
          }}>
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: spacing[6],
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: spacing[3] }}>
                  {testimonial.avatar}
                </div>
                <p style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  lineHeight: 1.6,
                  marginBottom: spacing[4],
                  fontStyle: 'italic'
                }}>
                  "{testimonial.content}"
                </p>
                <div>
                  <h4 style={{
                    fontSize: typography.fontSize.base,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing[1]
                  }}>
                    {testimonial.name}
                  </h4>
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: primaryColor
                  }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: `${spacing[12]} ${spacing[6]}`,
        backgroundColor: primaryColor,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: 'white',
            marginBottom: spacing[4]
          }}>
            Ready to Transform Your Finances?
          </h2>
          <p style={{
            fontSize: typography.fontSize.lg,
            color: 'rgba(255, 255, 255, 0.9)',
            marginBottom: spacing[6],
            lineHeight: 1.6
          }}>
            Join thousands of users who have taken control of their financial future. 
            Start your journey to financial freedom today.
          </p>
          <Link 
            to="/register"
            style={{
              backgroundColor: 'white',
              color: primaryColor,
              padding: `${spacing[4]} ${spacing[8]}`,
              borderRadius: '8px',
              fontSize: typography.fontSize.lg,
              fontWeight: typography.fontWeight.semibold,
              textDecoration: 'none',
              display: 'inline-block'
            }}
          >
            Start Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: `${spacing[8]} ${spacing[6]}`,
        backgroundColor: colors.background.secondary,
        textAlign: 'center'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: spacing[6],
            marginBottom: spacing[4],
            flexWrap: 'wrap'
          }}>
            <Link to="/about" style={{ color: colors.text.secondary, textDecoration: 'none' }}>
              About
            </Link>
            <Link to="/contact" style={{ color: colors.text.secondary, textDecoration: 'none' }}>
              Contact
            </Link>
            <Link to="/login" style={{ color: colors.text.secondary, textDecoration: 'none' }}>
              Sign In
            </Link>
            <Link to="/register" style={{ color: colors.text.secondary, textDecoration: 'none' }}>
              Sign Up
            </Link>
          </div>
          <p style={{
            fontSize: typography.fontSize.sm,
            color: colors.text.secondary
          }}>
            © 2024 BudgetTracker. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
