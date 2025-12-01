import React, { useState } from 'react';
import { colors } from '../../styles/colors';
import { spacing } from '../../styles/spacing';
import { typography } from '../../styles/typography';

const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We\'ll get back to you soon.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const contactMethods = [
    {
      icon: '📧',
      title: 'Email Us',
      description: 'We\'ll respond within 24 hours',
      contact: 'hello@budgettracker.com'
    },
    {
      icon: '📞',
      title: 'Call Us',
      description: 'Mon-Fri from 9am to 6pm',
      contact: '+1 (555) 123-4567'
    },
    {
      icon: '💬',
      title: 'Live Chat',
      description: 'Instant support during business hours',
      contact: 'Start Chat'
    },
    {
      icon: '🏢',
      title: 'Visit Us',
      description: 'Come say hello at our office',
      contact: '123 Finance St, New York, NY'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with BudgetTracker?',
      answer: 'Simply sign up for a free account, connect your bank accounts, and start tracking your expenses right away!'
    },
    {
      question: 'Is my financial data secure?',
      answer: 'Yes! We use bank-level encryption and never store your banking credentials. Your data is always protected.'
    },
    {
      question: 'Can I use BudgetTracker for my business?',
      answer: 'Absolutely! We offer business accounts with features like team management, expense categories, and business reports.'
    },
    {
      question: 'Do you have a mobile app?',
      answer: 'Yes! BudgetTracker is available on both iOS and Android devices with full feature parity.'
    }
  ];

  const borderColor = colors.gray[200];
  const primaryColor = colors.primary[500];

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)'
    }}>
      <section style={{
        padding: `${spacing[6]} ${spacing[6]} ${spacing[6]}`,
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
            Get in <span style={{ color: primaryColor }}>Touch</span>
          </h1>
          <p style={{
            fontSize: typography.fontSize.lg,
            color: colors.text.secondary,
            marginBottom: spacing[4],
            lineHeight: 1.6
          }}>
            Have questions or need support? We're here to help you achieve your financial goals.
          </p>
        </div>
      </section>

      <section style={{
        padding: `${spacing[8]} ${spacing[6]}`,
        backgroundColor: 'white'
      }}>
        <div style={{ 
          maxWidth: '1200px', 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: spacing[8]
        }}>
          <div>
            <h2 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[6]
            }}>
              Ways to Reach Us
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[4]
            }}>
              {contactMethods.map((method, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: spacing[3],
                    padding: spacing[4],
                    backgroundColor: colors.background.secondary,
                    borderRadius: '12px'
                  }}
                >
                  <div style={{
                    fontSize: '28px',
                    minWidth: '40px'
                  }}>
                    {method.icon}
                  </div>
                  <div>
                    <h3 style={{
                      fontSize: typography.fontSize.base,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.text.primary,
                      marginBottom: spacing[1]
                    }}>
                      {method.title}
                    </h3>
                    <p style={{
                      fontSize: typography.fontSize.sm,
                      color: colors.text.secondary,
                      marginBottom: spacing[1]
                    }}>
                      {method.description}
                    </p>
                    <p style={{
                      fontSize: typography.fontSize.base,
                      color: primaryColor,
                      fontWeight: typography.fontWeight.medium
                    }}>
                      {method.contact}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 style={{
              fontSize: typography.fontSize['2xl'],
              fontWeight: typography.fontWeight.bold,
              color: colors.text.primary,
              marginBottom: spacing[4]
            }}>
              Send us a Message
            </h2>
            <form onSubmit={handleSubmit} style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing[3]
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[1]
                }}>
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[1]
                }}>
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[1]
                }}>
                  Subject
                </label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
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

              <div>
                <label style={{
                  display: 'block',
                  fontSize: typography.fontSize.sm,
                  fontWeight: typography.fontWeight.medium,
                  color: colors.text.primary,
                  marginBottom: spacing[1]
                }}>
                  Message
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  style={{
                    width: '100%',
                    padding: spacing[3],
                    border: `1px solid ${borderColor}`,
                    borderRadius: '8px',
                    fontSize: typography.fontSize.base,
                    backgroundColor: colors.background.primary,
                    resize: 'vertical',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: primaryColor,
                  color: 'white',
                  padding: `${spacing[3]} ${spacing[6]}`,
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: typography.fontSize.lg,
                  fontWeight: typography.fontWeight.semibold,
                  cursor: 'pointer',
                  marginTop: spacing[1]
                }}
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </section>

      <section style={{
        padding: `${spacing[8]} ${spacing[6]}`,
        backgroundColor: colors.background.secondary
      }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h2 style={{
            fontSize: typography.fontSize['2xl'],
            fontWeight: typography.fontWeight.bold,
            color: colors.text.primary,
            textAlign: 'center',
            marginBottom: spacing[6]
          }}>
            Frequently Asked Questions
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: spacing[4]
          }}>
            {faqs.map((faq, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: 'white',
                  padding: spacing[4],
                  borderRadius: '12px',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)'
                }}
              >
                <h3 style={{
                  fontSize: typography.fontSize.base,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.text.primary,
                  marginBottom: spacing[2]
                }}>
                  {faq.question}
                </h3>
                <p style={{
                  fontSize: typography.fontSize.base,
                  color: colors.text.secondary,
                  lineHeight: 1.6
                }}>
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactUs;