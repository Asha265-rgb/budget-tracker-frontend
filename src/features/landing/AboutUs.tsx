import React from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

const AboutUs: React.FC = () => {
  const teamMembers = [
    {
      name: 'Sarah Chen',
      role: 'Founder & CEO',
      description: 'Former financial analyst with 10+ years in fintech',
      avatar: '👩‍💼'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'CTO',
      description: 'Full-stack developer specializing in financial systems',
      avatar: '👨‍💻'
    },
    {
      name: 'Emily Watson',
      role: 'Product Designer',
      description: 'UX expert focused on creating intuitive financial tools',
      avatar: '👩‍🎨'
    },
    {
      name: 'David Kim',
      role: 'Head of Finance',
      description: 'CPA with expertise in personal and business finance',
      avatar: '👨‍💼'
    }
  ];

  const milestones = [
    { year: '2020', event: 'Company Founded', description: 'Started with a vision to simplify personal finance' },
    { year: '2021', event: 'First 10,000 Users', description: 'Reached our first major user milestone' },
    { year: '2022', event: 'Mobile App Launch', description: 'Expanded to iOS and Android platforms' },
    { year: '2023', event: 'Business Accounts', description: 'Launched enterprise features for small businesses' },
    { year: '2024', event: '1M+ Users', description: 'Helped over a million people manage their finances' }
  ];

  const values = [
    {
      icon: '🔒',
      title: 'Security First',
      description: 'Your financial data is protected with bank-level encryption and security protocols.'
    },
    {
      icon: '💡',
      title: 'Simplicity',
      description: 'Complex financial management made simple and accessible for everyone.'
    },
    {
      icon: '🚀',
      title: 'Innovation',
      description: 'Constantly evolving with new features to meet your financial needs.'
    },
    {
      icon: '🤝',
      title: 'Trust',
      description: 'Built on transparency and reliability you can count on.'
    }
  ];

  const primaryColor = colors.primary[500];
  // const borderColor = colors.gray[200];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
    }}>
      {/* Hero Section */}
      <section style={{
        padding: `${spacing[12]} ${spacing[6]} ${spacing[8]}`,
        textAlign: 'center',
        background: 'linear-gradient(135deg, #fff0f6 0%, #fff5f7 50%, #ffffff 100%)'
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{
            fontSize: typography.fontSize['4xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            marginBottom: spacing[4],
            lineHeight: 1.2
          }}>
            About <span style={{ color: primaryColor }}>BudgetTracker</span>
          </h1>
          <p style={{
            fontSize: typography.fontSize.xl,
            color: colors.text.secondary,
            lineHeight: 1.6,
            marginBottom: spacing[6]
          }}>
            We're on a mission to empower everyone to achieve financial freedom through 
            intuitive tools and personalized insights.
          </p>
        </div>
      </section>

      {/* Our Story Section */}
      <section style={{
        padding: `${spacing[8]} ${spacing[6]}`,
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: spacing[8],
            alignItems: 'center'
          }}>
            <div>
              <h2 style={{
                fontSize: typography.fontSize['3xl'],
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing[4]
              }}>
                Our Story
              </h2>
              <p style={{
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                lineHeight: 1.7,
                marginBottom: spacing[4]
              }}>
                BudgetTracker was born from a simple observation: managing finances shouldn't be complicated. 
                Our founder, Sarah Chen, struggled to find a budgeting tool that was both powerful and easy to use.
              </p>
              <p style={{
                fontSize: typography.fontSize.lg,
                color: colors.text.secondary,
                lineHeight: 1.7
              }}>
                Today, we serve over a million users worldwide, helping individuals, families, and businesses 
                take control of their financial future with confidence.
              </p>
            </div>
            <div style={{
              backgroundColor: colors.primary[50],
              padding: spacing[6],
              borderRadius: '16px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '48px', marginBottom: spacing[3] }}>💰</div>
              <h3 style={{
                fontSize: typography.fontSize.xl,
                fontWeight: typography.fontWeight.bold,
                color: colors.text.primary,
                marginBottom: spacing[2]
              }}>
                1M+ Users
              </h3>
              <p style={{
                fontSize: typography.fontSize.base,
                color: colors.text.secondary
              }}>
                Trust us with their finances
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section style={{
        padding: `${spacing[8]} ${spacing[6]}`,
        backgroundColor: colors.background.secondary
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[8]
          }}>
            Our Values
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing[6]
          }}>
            {values.map((value, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: spacing[6],
                  borderRadius: '12px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '36px', marginBottom: spacing[3] }}>
                  {value.icon}
                </div>
                <h3 style={{
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing[2]
                }}>
                  {value.title}
                </h3>
                <p style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  lineHeight: 1.6
                }}>
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section style={{
        padding: `${spacing[8]} ${spacing[6]}`,
        backgroundColor: 'white'
      }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[8]
          }}>
            Meet Our Team
          </h2>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: spacing[6]
          }}>
            {teamMembers.map((member, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: spacing[4],
                  padding: spacing[4],
                  backgroundColor: colors.background.secondary,
                  borderRadius: '12px'
                }}
              >
                <div style={{
                  fontSize: '40px',
                  minWidth: '60px'
                }}>
                  {member.avatar}
                </div>
                <div>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing[1]
                  }}>
                    {member.name}
                  </h3>
                  <p style={{
                    fontSize: typography.fontSize.base,
                    color: primaryColor,
                    fontWeight: typography.fontWeight.medium,
                    marginBottom: spacing[2]
                  }}>
                    {member.role}
                  </p>
                  <p style={{
                    fontSize: typography.fontSize.sm,
                    color: colors.text.secondary,
                    lineHeight: 1.5
                  }}>
                    {member.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section style={{
        padding: `${spacing[8]} ${spacing[6]}`,
        backgroundColor: colors.background.secondary
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['3xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[8]
          }}>
            Our Journey
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[6]
          }}>
            {milestones.map((milestone, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: spacing[4],
                  padding: spacing[4],
                  backgroundColor: 'white',
                  borderRadius: '12px',
                  borderLeft: `4px solid ${primaryColor}`
                }}
              >
                <div style={{
                  backgroundColor: primaryColor,
                  color: 'white',
                  padding: `${spacing[2]} ${spacing[3]}`,
                  borderRadius: '20px',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.bold,
                  minWidth: '60px',
                  textAlign: 'center'
                }}>
                  {milestone.year}
                </div>
                <div>
                  <h3 style={{
                    fontSize: typography.fontSize.lg,
                    fontWeight: typography.fontWeight.semibold,
                    color: colors.text.primary,
                    marginBottom: spacing[1]
                  }}>
                    {milestone.event}
                  </h3>
                  <p style={{
                    fontSize: typography.fontSize.base,
                    color: colors.text.secondary
                  }}>
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUs;
