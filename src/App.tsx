import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { colors } from './styles/colors';
import { typography } from './styles/typography';

// Import only the pages we've actually built
import LandingPage from './features/landing/LandingPage';
import LoginPage from './features/auth/LoginPage';
import RegisterPage from './features/auth/RegisterPage';
import ForgotPassword from './features/auth/ForgotPassword';
import AboutUs from './features/landing/AboutUs';
import ContactUs from './features/landing/ContactUs';
import DashboardMain from './components/Dashboard/DashboardMain';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <div style={{
          minHeight: '100vh',
          backgroundColor: colors.background.primary,
          color: colors.text.primary,
          fontFamily: typography.fontFamily.primary,
        }}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutUs />} />
            <Route path="/contact" element={<ContactUs />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Dashboard Route */}
            <Route path="/dashboard" element={<DashboardMain />} />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
