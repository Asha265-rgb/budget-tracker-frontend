import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header style={{ 
      padding: '1rem 2rem', 
      backgroundColor: 'white', 
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ textDecoration: 'none', color: '#3182ce', fontWeight: 'bold', fontSize: '1.25rem' }}>
        BudgetTracker
      </Link>
      <nav>
        <Link to="/login" style={{ marginLeft: '1rem', textDecoration: 'none', color: '#4a5568' }}>Login</Link>
        <Link to="/register" style={{ marginLeft: '1rem', textDecoration: 'none', color: '#4a5568' }}>Sign Up</Link>
      </nav>
    </header>
  );
};

export default Header;