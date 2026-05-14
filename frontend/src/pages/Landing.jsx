import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function Landing() {
  const navigate = useNavigate();
  const { setIsLoginModalOpen } = useAuth();

  const handleGetStarted = () => {
    setIsLoginModalOpen(true);
  };

  const handleSignIn = () => {
    setIsLoginModalOpen(true);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0A0A',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1.5rem',
      }}
    >
      {/* Logo */}
      <div
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          backgroundColor: '#1E1E1E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '2rem',
          border: '1px solid #2A2A2A',
        }}
      >
        <Zap style={{ width: 36, height: 36, color: '#C8A96E', fill: '#C8A96E' }} />
      </div>

      {/* App Name */}
      <h1
        style={{
          fontSize: 36,
          fontWeight: 900,
          color: '#FFFFFF',
          textAlign: 'center',
          marginBottom: '0.75rem',
          letterSpacing: '-0.5px',
        }}
      >
        Try-ON Daily
      </h1>

      {/* Tagline */}
      <p
        style={{
          fontSize: 16,
          color: '#888888',
          textAlign: 'center',
          marginBottom: '3rem',
          lineHeight: 1.5,
          maxWidth: 280,
        }}
      >
        See how clothes look on you with AI-powered try-on technology
      </p>

      {/* Buttons */}
      <div style={{ width: '100%', maxWidth: 340, display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Get Started — Gold */}
        <button
          id="landing-get-started"
          onClick={handleGetStarted}
          style={{
            backgroundColor: '#C8A96E',
            color: '#0A0A0A',
            fontWeight: 700,
            fontSize: 16,
            padding: '16px',
            borderRadius: 14,
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            transition: 'opacity 0.2s',
          }}
          onMouseDown={e => (e.currentTarget.style.opacity = '0.85')}
          onMouseUp={e => (e.currentTarget.style.opacity = '1')}
          onTouchStart={e => (e.currentTarget.style.opacity = '0.85')}
          onTouchEnd={e => (e.currentTarget.style.opacity = '1')}
        >
          Get Started
        </button>

        {/* Sign In — Outline */}
        <button
          id="landing-sign-in"
          onClick={handleSignIn}
          style={{
            backgroundColor: 'transparent',
            color: '#FFFFFF',
            fontWeight: 600,
            fontSize: 16,
            padding: '15px',
            borderRadius: 14,
            border: '1.5px solid #2A2A2A',
            cursor: 'pointer',
            width: '100%',
            transition: 'border-color 0.2s',
          }}
          onMouseDown={e => (e.currentTarget.style.borderColor = '#C8A96E')}
          onMouseUp={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
          onTouchStart={e => (e.currentTarget.style.borderColor = '#C8A96E')}
          onTouchEnd={e => (e.currentTarget.style.borderColor = '#2A2A2A')}
        >
          Sign In
        </button>
      </div>

      {/* Disclaimer */}
      <p
        style={{
          marginTop: '1.5rem',
          fontSize: 12,
          color: '#555555',
          textAlign: 'center',
        }}
      >
        No credit card required • 5 free try-ons
      </p>
    </div>
  );
}

export default Landing;
