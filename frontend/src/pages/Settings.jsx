import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Bell, 
  Moon, 
  Languages, 
  Shield, 
  FileText, 
  Mail, 
  Star, 
  Info, 
  LogOut, 
  Trash2,
  Zap,
  Loader2
} from 'lucide-react';
import { AdMob } from '@capacitor-community/admob';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

function Settings() {
  const navigate = useNavigate();
  const { currentUser, credits, logout, setIsPricingModalOpen, rewardCredit } = useAuth();
  const { lang, setLang } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [adLoading, setAdLoading] = useState(false);

  // Settings states
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    try {
      AdMob.initialize();
      const rewardListener = AdMob.addListener('onRewardedVideoAdReward', async () => {
        await rewardCredit();
        setAdLoading(false);
      });
      return () => { rewardListener.remove(); };
    } catch (e) {}
  }, []);

  const showRewardedAd = async () => {
    try {
      setAdLoading(true);
      await AdMob.prepareRewardVideoAd({ adId: 'ca-app-pub-6927522133949566/6216287111' });
      await AdMob.showRewardVideoAd();
    } catch (e) {
      setAdLoading(false);
    }
  };

  const fullName = currentUser?.name || 'Harshmal Mahajan';
  const email = currentUser?.email || 'harshmal@gmail.com';

  const SectionTitle = ({ children }) => (
    <h3 style={{ color: '#555', fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', padding: '24px 20px 8px' }}>
      {children}
    </h3>
  );

  const Row = ({ icon: Icon, label, value, onClick, color = '#fff', toggle, toggleOn }) => (
    <div onClick={onClick} className="settings-row">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Icon style={{ width: 20, height: 20, color: color === '#fff' ? '#888' : color }} />
        <span style={{ color: color, fontSize: 15, fontWeight: 600 }}>{label}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {value && <span style={{ color: '#555', fontSize: 14, fontWeight: 600 }}>{value}</span>}
        {toggle ? (
          <div className={`toggle-track ${toggleOn ? 'on' : 'off'}`}>
            <div className={`toggle-thumb ${toggleOn ? 'on' : 'off'}`} />
          </div>
        ) : (
          <ChevronRight style={{ width: 18, height: 18, color: '#333' }} />
        )}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', paddingBottom: 100 }}>
      
      {/* ─── Header ─── */}
      <div style={{ padding: '20px 20px 12px', textAlign: 'center', position: 'relative' }}>
        <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0 }}>Settings</h1>
      </div>

      {/* ─── Profile Card ─── */}
      <div style={{ padding: '16px' }}>
        <div style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 24, padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {/* Avatar with gold ring */}
            <div style={{ width: 64, height: 64, borderRadius: '50%', border: '2px solid #C8A96E', padding: 3 }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: '#fff', fontSize: 22, fontWeight: 800 }}>{fullName.charAt(0)}</span>
              </div>
            </div>
            <div>
              <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 800, margin: '0 0 2px 0' }}>{fullName}</h2>
              <p style={{ color: '#555', fontSize: 13, margin: '0 0 4px 0' }}>{email}</p>
              <p style={{ color: '#C8A96E', fontSize: 12, fontWeight: 700, margin: 0 }}>{credits} Credits remaining</p>
            </div>
          </div>
          <button style={{ background: 'none', border: 'none', color: '#C8A96E', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>Edit</button>
        </div>
      </div>

      {/* ─── Account Section ─── */}
      <SectionTitle>Account</SectionTitle>
      <div style={{ backgroundColor: '#141414', borderTop: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
        <Row icon={Bell} label="Notifications" toggle toggleOn={notifications} onClick={() => setNotifications(!notifications)} />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        <Row icon={Moon} label="Dark Mode" toggle toggleOn={isDarkMode} onClick={toggleTheme} />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        <Row icon={Languages} label="Language" value={lang === 'en' ? 'English' : 'Hindi'} />
      </div>

      {/* ─── Credits Section ─── */}
      <SectionTitle>Credits & Billing</SectionTitle>
      <div style={{ backgroundColor: '#141414', borderTop: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
        <Row icon={Zap} label="My Credits" value={`${credits} left`} />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        
        {/* Daily Check-in Row with gold pill */}
        <div className="settings-row" onClick={adLoading ? null : showRewardedAd}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Star style={{ width: 20, height: 20, color: '#888' }} />
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Daily Check-in</span>
          </div>
          <div style={{ backgroundColor: '#1E1A0E', border: '1px solid #C8A96E', borderRadius: 999, padding: '4px 12px' }}>
            <span style={{ color: '#C8A96E', fontSize: 11, fontWeight: 700 }}>Claim 2 Credits</span>
          </div>
        </div>

        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        
        {/* Upgrade Pro Banner Row */}
        <div className="settings-row" onClick={() => setIsPricingModalOpen(true)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Shield style={{ width: 20, height: 20, color: '#888' }} />
            <span style={{ color: '#fff', fontSize: 15, fontWeight: 600 }}>Upgrade to Pro</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: '#555', fontSize: 13, fontWeight: 600 }}>Unlock unlimited</span>
            <ChevronRight style={{ width: 18, height: 18, color: '#333' }} />
          </div>
        </div>
      </div>

      {/* ─── App Info Section ─── */}
      <SectionTitle>App Info</SectionTitle>
      <div style={{ backgroundColor: '#141414', borderTop: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
        <Row icon={Shield} label="Privacy Policy" onClick={() => navigate('/privacy-policy')} />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        <Row icon={FileText} label="Terms of Service" onClick={() => navigate('/terms-of-service')} />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        <Row icon={Mail} label="Contact Us" onClick={() => navigate('/contact')} />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        <Row icon={Star} label="Rate Try-ON Daily" />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        <Row icon={Info} label="Version 1.1.0" value="Up to date" />
      </div>

      {/* ─── Danger Zone Section ─── */}
      <SectionTitle>Danger Zone</SectionTitle>
      <div style={{ backgroundColor: '#141414', borderTop: '1px solid #2A2A2A', borderBottom: '1px solid #2A2A2A' }}>
        <Row icon={LogOut} label="Logout" color="#F87171" onClick={logout} />
        <div style={{ marginLeft: 50, borderBottom: '1px solid #2A2A2A' }} />
        <div className="settings-row">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Trash2 style={{ width: 20, height: 20, color: '#F87171' }} />
            <span style={{ color: '#F87171', fontSize: 15, fontWeight: 600 }}>Delete Account</span>
          </div>
          <div style={{ backgroundColor: '#1A1111', borderRadius: 4, padding: '4px 8px' }}>
            <span style={{ color: '#555', fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }}>Permanent</span>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Settings;
