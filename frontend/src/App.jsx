import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Studio from './pages/Studio';
import TryOn from './pages/TryOn';
import About from './pages/About';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AIChat from './components/AIChat';
import { MessageSquare, AlertCircle } from 'lucide-react';
import { useAuth } from './context/AuthContext';
import { APP_VERSION } from './AppVersion';
import { SplashScreen } from '@capacitor/splash-screen';

import Settings from './pages/Settings';
import LoginModal from './components/LoginModal';
import PricingModal from './components/PricingModal';
import CheckoutModal from './components/CheckoutModal';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

function ProtectedRoute({ children }) {
  const { isLoggedIn, setIsLoginModalOpen, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Show login modal instead of silently redirecting
    setTimeout(() => setIsLoginModalOpen(true), 100);
    return <Navigate to="/" replace />;
  }
  return children;
}

// Bottom Navigation for Mobile (to match the premium app)
import { Home as HomeIcon, Sparkles as SparklesIcon, Settings as SettingsIcon, Image as ImageIcon } from 'lucide-react';
function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  
  const navItems = [
    { path: '/', icon: HomeIcon, label: t('home') },
    { path: '/try-on', icon: SparklesIcon, label: t('edit') },
    { path: '/studio', icon: ImageIcon, label: t('images') },
    { path: '/settings', icon: SettingsIcon, label: t('settings') },
  ];

  return (
    <div 
      className="md:hidden fixed bottom-0 left-0 right-0 glass border-t border-white/20 flex items-center justify-around px-2 z-40"
      style={{
        paddingTop: '0.8rem',
        paddingBottom: 'max(env(safe-area-inset-bottom), 0.8rem)'
      }}
    >
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-primary' : 'text-gray-400'}`}
          >
            <item.icon className={`w-6 h-6 ${isActive ? 'fill-primary/10' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// Handle Android back button
function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    let backButtonListener = null;

    const setupBackButton = async () => {
      try {
        const { App } = await import('@capacitor/app');
        backButtonListener = await App.addListener('backButton', ({ canGoBack }) => {
          // If we are logged in and on a protected page (like Studio or Try-on), 
          // and trying to go back to Home, ask for confirmation.
          if (isLoggedIn && location.pathname !== '/' && !canGoBack) {
            if (window.confirm("Do you want to exit the Studio and go back to Home?")) {
              navigate('/');
            }
            return;
          }

          // Standard navigation
          if (canGoBack && location.pathname !== '/') {
            navigate(-1);
          } else {
            // On home page — minimize app instead of exiting
            App.minimizeApp();
          }
        });
      } catch (e) {
        // Not running in Capacitor, ignore
      }
    };

    setupBackButton();

    return () => {
      if (backButtonListener) {
        backButtonListener.remove();
      }
    };
  }, [navigate, location.pathname, isLoggedIn]);

  return null;
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { isLoginModalOpen, setIsLoginModalOpen, isPricingModalOpen, setIsPricingModalOpen } = useAuth();

  useEffect(() => {
    // Hide splash screen
    const hideSplash = async () => {
      try {
        await SplashScreen.hide();
      } catch (e) {
        console.log("Not running in capacitor or splash screen not available");
      }
    };
    hideSplash();
  }, []);

  return (
    <ThemeProvider>
      <LanguageProvider>
        <Router>
        <BackButtonHandler />
        <div className="min-h-screen bg-background text-foreground font-sans flex flex-col">
          <Navbar />
          
          {/* Main Content Area */}
          <main className="flex-1 flex flex-col w-full pb-16 md:pb-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/studio" element={
                <ProtectedRoute>
                  <Studio />
                </ProtectedRoute>
              } />
              <Route path="/try-on" element={<TryOn />} />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              } />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/privacy-policy" element={<PrivacyPolicy />} />
              <Route path="/terms-of-service" element={<TermsOfService />} />
            </Routes>
          </main>

          {/* Bottom Nav for Mobile */}
          <BottomNav />

          {/* Global Floating Chat Button */}
          <button 
            onClick={() => setIsChatOpen(true)}
            className="fixed bottom-24 right-6 w-14 h-14 bg-black rounded-full flex items-center justify-center text-white shadow-2xl hover:scale-105 transition-transform z-40 border border-gray-800 md:bottom-6"
          >
            <MessageSquare className="w-6 h-6" />
          </button>

          {/* Global AIChat Modal */}
          <AIChat 
            isOpen={isChatOpen} 
            onClose={() => setIsChatOpen(false)} 
          />

          {/* Authentication & Payment Modals */}
          <LoginModal 
            isOpen={isLoginModalOpen} 
            onClose={() => setIsLoginModalOpen(false)} 
          />
          <PricingModal 
            isOpen={isPricingModalOpen} 
            onClose={() => setIsPricingModalOpen(false)} 
          />
          <CheckoutModal />
      </div>
      </Router>
    </LanguageProvider>
  </ThemeProvider>
  );
}

export default App;
