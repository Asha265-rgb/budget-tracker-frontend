import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer style={{ 
      padding: '2rem', 
      backgroundColor: '#f7fafc', 
      borderTop: '1px solid #e2e8f0', 
      marginTop: 'auto',
      textAlign: 'center',
      color: '#718096'
    }}>
      <p>&copy; 2024 BudgetTracker. All rights reserved.</p>
    </footer>
  );
};

export default Footer;