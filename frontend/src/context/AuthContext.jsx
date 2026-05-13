import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Preferences } from '@capacitor/preferences';
import { BACKEND_URL } from '../Constants';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    // Synchronous initial check
    return !!localStorage.getItem('jwt_token');
  });
  const [loading, setLoading] = useState(true);
  const [credits, setCredits] = useState(0);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Secure token management
  const _setToken = async (token, user) => {
    await Preferences.set({ key: 'jwt_token', value: token });
    if (user) await Preferences.set({ key: 'user_data', value: JSON.stringify(user) });
    localStorage.setItem('jwt_token', token);
    document.cookie = `jwt_token=${token}; path=/; max-age=31536000; SameSite=Lax`; // Permanent cookie (1 year)
  };
  const _getToken = async () => {
    const { value } = await Preferences.get({ key: 'jwt_token' });
    if (value) return value;
    
    // Fallback to cookie
    const cookieToken = document.cookie.split('; ').find(row => row.startsWith('jwt_token='))?.split('=')[1];
    return cookieToken || localStorage.getItem('jwt_token');
  };
  const _getUser = async () => {
    const { value } = await Preferences.get({ key: 'user_data' });
    return value ? JSON.parse(value) : null;
  };
  const _removeToken = async () => {
    await Preferences.remove({ key: 'jwt_token' });
    await Preferences.remove({ key: 'user_data' });
    localStorage.removeItem('jwt_token');
    document.cookie = "jwt_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
  };

  const handleDailyCheckin = async (token) => {
    try {
      const res = await fetch(`${BACKEND_URL}/checkin`, {
        method: 'POST',
        headers: { 
          'bypass-tunnel-reminder': 'true', 
          'ngrok-skip-browser-warning': 'true',  
          Authorization: `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.credits_added > 0) {
          setCredits(data.total_credits);
          window.dispatchEvent(new CustomEvent('daily-checkin', { detail: data.credits_added }));
        }
      }
    } catch (e) {
      console.error("Check-in error:", e);
    }
  };

  // On app start, restore session securely
  useEffect(() => {
    const initSession = async () => {
      try {
        const token = await _getToken();
        const cachedUser = await _getUser();
        
        if (cachedUser) {
          setCurrentUser(cachedUser);
          setCredits(cachedUser.credits || 0);
          setIsLoggedIn(true);
        }

        if (token) {
          const response = await fetch(`${BACKEND_URL}/me`, {
            headers: { 
              'bypass-tunnel-reminder': 'true', 
              'ngrok-skip-browser-warning': 'true',  
              Authorization: `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setCurrentUser(data);
            setCredits(data.credits || 0);
            setIsLoggedIn(true);
            // Update cache
            await _setToken(token, data);
            
            // Do check-in
            handleDailyCheckin(token);
          } else if (response.status === 401 || response.status === 403) {
            await _removeToken();
            setIsLoggedIn(false);
            setCurrentUser(null);
          }
        }
      } catch (err) {
        console.error("Session init error:", err);
      } finally {
        setLoading(false);
      }
    };
    initSession();
  }, []);

  // ---- REGISTER ----
  const signUpWithEmail = async (name, email, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/register`, {
        method: 'POST',
        headers: { 
          'bypass-tunnel-reminder': 'true', 
          'ngrok-skip-browser-warning': 'true',  
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({ name, email, password })
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Server returned non-JSON:", text);
        throw new Error(`Server Error (Non-JSON): ${res.status}. Please check backend logs.`);
      }

      if (!res.ok) throw new Error(data.detail || 'Registration failed');
      
      await _setToken(data.access_token, data.user);
      setCurrentUser(data.user);
      setCredits(data.user.credits);
      setIsLoggedIn(true);
      
      handleDailyCheckin(data.access_token);
      
      return data.user;
    } catch (err) {
      console.error("Signup Fetch Error:", err);
      const errorMsg = err.message || 'Unknown network error';
      throw new Error(`Connection Error: ${errorMsg}. URL: ${BACKEND_URL}`);
    }
  };

  // ---- LOGIN ----
  const loginWithEmail = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 
          'bypass-tunnel-reminder': 'true', 
          'ngrok-skip-browser-warning': 'true',  
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      let data;
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
      } else {
        const text = await res.text();
        console.error("Server returned non-JSON:", text);
        throw new Error(`Server Error (Non-JSON): ${res.status}. Please check backend logs.`);
      }

      if (!res.ok) throw new Error(data.detail || 'Login failed');
      
      await _setToken(data.access_token, data.user);
      setCurrentUser(data.user);
      setCredits(data.user.credits);
      setIsLoggedIn(true);
      
      handleDailyCheckin(data.access_token);
      
      return data.user;
    } catch (err) {
      console.error("Login Fetch Error:", err);
      // If it's a network error (failed to fetch), provide more context
      const errorMsg = err.message || 'Unknown network error';
      if (errorMsg.includes('Failed to fetch')) {
        throw new Error(`Connection Error: Server is not responding. Please ensure your backend is running at ${BACKEND_URL}`);
      }
      throw new Error(`Connection Error: ${errorMsg}. URL: ${BACKEND_URL}`);
    }
  };

  // ---- LOGOUT ----
  const logout = async () => {
    await _removeToken();
    setCurrentUser(null);
    setCredits(0);
    setIsLoggedIn(false);
  };

  // Google Login is disabled for now as it requires Native config
  const loginWithGoogle = async () => {
    throw new Error('Google Login is currently disabled.');
  };

  const loginAsGuest = async () => {
    throw new Error('Guest Login is currently disabled.');
  };

  // ---- CREDITS ----
  const useCredit = async () => {
    if (credits <= 0) {
      setIsPricingModalOpen(true);
      return false;
    }
    
    // Optimistic UI update
    setCredits(prev => prev - 1);
    
    try {
      // Update in DB in background
      const token = await _getToken();
      if (token) {
        fetch(`${BACKEND_URL}/use-credit`, {
          method: 'POST',
          headers: { 'bypass-tunnel-reminder': 'true', 'ngrok-skip-browser-warning': 'true',  
            Authorization: `Bearer ${token}`,
            'Bypass-Tunnel-Reminder': 'true'
          }
        }).catch(() => {});
      }
      return true;
    } catch (e) {
      // Revert if totally failed
      setCredits(prev => prev + 1);
      return false;
    }
  };

  const rewardCredit = async () => {
    // Optimistic update
    setCredits(prev => prev + 1);
    
    try {
      const token = await _getToken();
      if (token) {
        await fetch(`${BACKEND_URL}/add-credit`, {
          method: 'POST',
          headers: { 
            'bypass-tunnel-reminder': 'true', 
            'ngrok-skip-browser-warning': 'true',  
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ amount: 1 })
        });
      }
    } catch (e) {
      console.error("Failed to sync reward credit:", e);
    }
  };

  const value = {
    currentUser,
    isLoggedIn,
    loading,
    credits,
    isPricingModalOpen,
    setIsPricingModalOpen,
    isLoginModalOpen,
    setIsLoginModalOpen,
    signUpWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginAsGuest,
    logout,
    useCredit,
    rewardCredit
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
