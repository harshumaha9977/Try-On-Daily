import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Studio from './pages/Studio';
import TryOn from './pages/TryOn';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Landing from './pages/Landing';
import Settings from './pages/Settings';
import AIChat from './components/AIChat';
import LoginModal from './components/LoginModal';
import PricingModal from './components/PricingModal';
import CheckoutModal from './components/CheckoutModal';
import { useAuth } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { SplashScreen } from '@capacitor/splash-screen';
import { Home as HomeIcon, Sparkles, Image, Settings as SettingsIcon, MessageSquare } from 'lucide-react';

// Protected route — redirect to Landing if not logged in
function ProtectedRoute({ children }) {
  const { isLoggedIn, setIsLoginModalOpen, loading } = useAuth();
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 32, height: 32, border: '3px solid #C8A96E', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    );
  }
  if (!isLoggedIn) {
    setTimeout(() => setIsLoginModalOpen(true), 100);
    return <Navigate to="/" replace />;
  }
  return children;
}

// Root redirect — if logged in go to /home, else show Landing
function RootRoute() {
  const { isLoggedIn, loading } = useAuth();
  if (loading) return null;
  if (isLoggedIn) return <Navigate to="/home" replace />;
  return <Landing />;
}

// Bottom Navigation Bar
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/home', icon: HomeIcon, label: 'Home' },
    { path: '/try-on', icon: Sparkles, label: 'Try-On' },
    { path: '/studio', icon: Image, label: 'Studio' },
    { path: '/settings', icon: SettingsIcon, label: 'Settings' },
  ];

  // Hide bottom nav on landing page
  if (location.pathname === '/') return null;

  return (
    <div className="bottom-nav">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            id={`nav-${item.label.toLowerCase()}`}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon
              style={{
                width: 22,
                height: 22,
                strokeWidth: isActive ? 2.5 : 1.8,
              }}
            />
            <span>{item.label}</span>
            {isActive && (
              <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C8A96E', marginTop: 1 }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

// Android back button handler
function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    let listener = null;
    const setup = async () => {
      try {
        const { App } = await import('@capacitor/app');
        listener = await App.addListener('backButton', ({ canGoBack }) => {
          if (location.pathname === '/' || location.pathname === '/home') {
            App.minimizeApp();
          } else if (canGoBack) {
            navigate(-1);
          } else {
            navigate('/home');
          }
        });
      } catch (e) {}
    };
    setup();
    return () => { if (listener) listener.remove(); };
  }, [navigate, location.pathname, isLoggedIn]);

  return null;
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isLoginModalOpen, setIsLoginModalOpen, isPricingModalOpen, setIsPricingModalOpen, isLoggedIn } = useAuth();

  useEffect(() => {
    const hideSplash = async () => {
      try { await SplashScreen.hide(); } catch (e) {}
    };
    hideSplash();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
          <BackButtonHandler />
          <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
            <Routes>
              {/* Root: Landing if not logged in, Home if logged in */}
              <Route path="/" element={<RootRoute />} />

              {/* Public */}
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
              <Route path="/try-on" element={<TryOn />} />

              {/* Protected */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/studio" element={<ProtectedRoute><Studio /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            </Routes>

            {/* Bottom Nav (visible on all pages except landing) */}
            <BottomNav />

            {/* Floating Chat Button — only when logged in */}
            {isLoggedIn && (
              <button
                id="chat-fab-button"
                onClick={() => setIsChatOpen(true)}
                style={{
                  position: 'fixed',
                  bottom: 80,
                  right: 20,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  backgroundColor: '#1E1E1E',
                  border: '1px solid #2A2A2A',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  zIndex: 40,
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
                }}
              >
                <MessageSquare style={{ width: 22, height: 22, color: '#C8A96E' }} />
              </button>
            )}

            {/* Modals */}
            <AIChat isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
            <LoginModal isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />
            <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} />
            <CheckoutModal />
          </div>
        </Router>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
