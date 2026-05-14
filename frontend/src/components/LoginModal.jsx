import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function LoginModal({ isOpen, onClose }) {
  const { loginWithGoogle, loginWithEmail, signUpWithEmail, loginAsGuest } = useAuth();
  const navigate = useNavigate();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Detect if running inside Capacitor native app
  const isNativeApp = window.Capacitor?.isNativePlatform?.() || false;

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginWithGoogle();
      onClose();
      navigate('/studio');
    } catch (err) {
      console.error("Google Auth Error:", err);
      // Catch both unauthorized-domain AND disallowed_useragent (native WebView)
      if (err.code === 'auth/unauthorized-domain' || 
          err.message?.includes('disallowed_useragent') ||
          err.code === 'auth/operation-not-supported-in-this-environment') {
        console.warn("Google Auth blocked. Using fallback session.");
        loginAsGuest();
        onClose();
        navigate('/studio');
      } else {
        setError('Failed to log in with Google. Try email instead.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }
    if (isSignUp && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setError('');
      setLoading(true);
      if (isSignUp) {
        await signUpWithEmail(name.trim(), email, password);
      } else {
        await loginWithEmail(email, password);
      }
      onClose();
      navigate('/studio');
    } catch (err) {
      console.error(err);
      const msg = err.message || '';
      if (msg.includes('already registered') || msg.includes('already-in-use')) {
        setError('Email is already registered. Please sign in.');
      } else if (msg.includes('Invalid email or password') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        setError('Invalid email or password.');
      } else if (msg.includes('weak-password') || msg.includes('at least')) {
        setError('Password must be at least 6 characters.');
      } else {
        setError(msg || 'Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#141414] text-white rounded-[32px] shadow-2xl overflow-y-auto flex flex-col md:flex-row max-h-[95vh] md:max-h-[85vh] border border-[#2A2A2A]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 text-gray-500 hover:text-white bg-[#1E1E1E] hover:bg-[#2A2A2A] rounded-full transition-colors shadow-md border border-[#2A2A2A]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Side: Form */}
        <div className="w-full md:w-1/2 p-10 lg:p-12 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="text-3xl font-black text-white leading-tight">
              {isSignUp ? 'Create an account' : 'Welcome back'}
            </h2>
            <p className="text-gray-500 mt-2 text-[15px] font-medium">
              {isSignUp ? 'Sign up to try clothes on automatically.' : 'Sign in to continue your virtual try-ons.'}
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg flex items-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2" />
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Google Button — only show on web browser, not in native app */}
            {!isNativeApp && (
              <>
                <button 
                  onClick={handleGoogleLogin} 
                  disabled={loading}
                  className="w-full flex items-center justify-center px-4 py-3.5 border border-[#2A2A2A] rounded-2xl hover:bg-[#1E1E1E] transition-colors font-bold text-[15px] text-white shadow-sm disabled:opacity-50"
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-sm font-bold">
                    <span className="px-4 bg-[#141414] text-gray-500 uppercase tracking-widest text-[10px]">OR</span>
                  </div>
                </div>
              </>
            )}

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg">👤</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Full name"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0D0D0D] text-white border border-[#2A2A2A] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent transition-all shadow-sm text-[15px]"
                    required
                  />
                </div>
              )}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0D0D0D] text-white border border-[#2A2A2A] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent transition-all shadow-sm text-[15px]"
                  required
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-12 pr-4 py-3.5 bg-[#0D0D0D] text-white border border-[#2A2A2A] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent transition-all shadow-sm text-[15px]"
                  required
                />
              </div>
              
              {isSignUp && (
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#0D0D0D] text-white border border-[#2A2A2A] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#C8A96E] focus:border-transparent transition-all shadow-sm text-[15px]"
                    required
                  />
                </div>
              )}

              {!isSignUp && (
                <div className="flex items-center space-x-2 px-1">
                  <input 
                    type="checkbox" 
                    id="rememberMe"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#C8A96E] border-[#2A2A2A] rounded focus:ring-[#C8A96E] bg-[#0D0D0D]"
                  />
                  <label htmlFor="rememberMe" className="text-sm text-gray-500 font-medium cursor-pointer">
                    Save Information
                  </label>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full py-3.5 px-4 bg-[#C8A96E] text-[#0A0A0A] font-bold rounded-xl hover:bg-[#B8995E] transition-colors shadow-sm text-[15px] disabled:opacity-50"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="text-center mt-4">
              <p className="text-sm text-muted-foreground">
                {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                <button 
                  onClick={() => setIsSignUp(!isSignUp)}
                  className="text-[#C8A96E] hover:underline font-black"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>
          </div>

            <p className="text-xs text-gray-600 text-center leading-relaxed">
              By continuing, you agree to our <Link to="/terms-of-service" onClick={onClose} className="text-[#C8A96E] hover:underline">Terms of Service</Link> and <Link to="/privacy-policy" onClick={onClose} className="text-[#C8A96E] hover:underline">Privacy Policy</Link>.
            </p>
        </div>

        {/* Right Side: Graphic (Infographic) */}
        <div className="hidden md:block md:w-1/2 relative bg-[#0a0515] flex items-center justify-center p-4">
          <img loading="lazy" 
            src="/mockups/infographic.jpg" 
            alt="How Try-On Daily Works" 
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>
      </div>
    </div>
  );
}

export default LoginModal;
