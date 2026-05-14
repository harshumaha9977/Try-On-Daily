import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Zap, Shirt, Scissors, Sparkles, Footprints, Gift, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../Constants';
import { Preferences } from '@capacitor/preferences';

function Home() {
  const navigate = useNavigate();
  const { currentUser, credits, isLoggedIn, setIsLoginModalOpen } = useAuth();
  const [recentTryOns, setRecentTryOns] = useState([]);
  const [activeCategory, setActiveCategory] = useState('tops');
  const [checkinDone, setCheckinDone] = useState(false);

  const categories = [
    { id: 'tops',    label: 'Tops',    icon: Shirt },
    { id: 'bottoms', label: 'Bottoms', icon: Scissors },
    { id: 'dresses', label: 'Dresses', icon: Sparkles },
    { id: 'shoes',   label: 'Shoes',   icon: Footprints },
  ];

  useEffect(() => {
    if (isLoggedIn) loadRecentTryOns();
  }, [isLoggedIn]);

  const loadRecentTryOns = async () => {
    const token = await Preferences.get({ key: 'jwt_token' })
      .then(r => r.value) || localStorage.getItem('jwt_token');
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/jobs/history`, {
        headers: { Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setRecentTryOns(data.slice(0, 3));
      }
    } catch (e) {}
  };

  const handleTryOn = (categoryId) => {
    if (!isLoggedIn) { setIsLoginModalOpen(true); return; }
    navigate('/try-on', { state: { category: categoryId } });
  };

  const handleClaim = async () => {
    const token = await Preferences.get({ key: 'jwt_token' })
      .then(r => r.value) || localStorage.getItem('jwt_token');
    if (!token) { setIsLoginModalOpen(true); return; }
    try {
      const res = await fetch(`${BACKEND_URL}/checkin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setCheckinDone(true);
        if (data.credits_added > 0) {
          window.dispatchEvent(new CustomEvent('daily-checkin', { detail: data.credits_added }));
        }
      }
    } catch (e) {}
  };

  const firstName = currentUser?.name?.split(' ')[0] || 'there';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', paddingBottom: 80 }}>

      {/* ─── Top Bar ─── */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 2 }}>{greeting} 👋</p>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 800, margin: 0 }}>{firstName}</h2>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4 }}>
          <button
            id="home-notification-btn"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
          >
            <Bell style={{ width: 22, height: 22, color: '#888' }} />
          </button>
          {isLoggedIn && (
            <div className="badge-credit">
              <Zap style={{ width: 14, height: 14, fill: '#C8A96E', color: '#C8A96E' }} />
              <span>{credits}</span>
            </div>
          )}
        </div>
      </div>

      {/* ─── Hero: Before/After Card ─── */}
      <div style={{ margin: '8px 16px 0' }}>
        <div
          id="home-hero-card"
          onClick={() => handleTryOn(activeCategory)}
          style={{
            backgroundColor: '#141414',
            border: '1px solid #2A2A2A',
            borderRadius: 20,
            overflow: 'hidden',
            cursor: 'pointer',
            position: 'relative',
            height: 190,
          }}
        >
          {/* Before / After split */}
          <div style={{ position: 'absolute', inset: 0, display: 'flex' }}>
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-start', padding: 10 }}>
              <span style={{
                backgroundColor: 'rgba(255,255,255,0.08)',
                color: '#aaa',
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 999,
              }}>Before</span>
            </div>
            {/* Gold divider */}
            <div style={{ width: 1.5, backgroundColor: '#C8A96E', alignSelf: 'stretch' }} />
            <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end', padding: 10 }}>
              <span style={{
                backgroundColor: '#C8A96E',
                color: '#0A0A0A',
                fontSize: 11,
                fontWeight: 700,
                padding: '3px 10px',
                borderRadius: 999,
              }}>After</span>
            </div>
          </div>

          {/* Bottom text */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            padding: '12px 16px',
            background: 'linear-gradient(to top, rgba(10,10,10,0.95), transparent)',
          }}>
            <p style={{ color: '#fff', fontSize: 14, fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
              Try any outfit on yourself
              <ChevronRight style={{ width: 16, height: 16, color: '#C8A96E' }} />
            </p>
          </div>
        </div>
      </div>

      {/* ─── Shop by Category ─── */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Shop by Category</h3>
          <button
            id="home-see-all-btn"
            style={{ background: 'none', border: 'none', color: '#C8A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0 }}
            onClick={() => navigate('/try-on')}
          >
            See all
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                id={`home-cat-${cat.id}`}
                onClick={() => { setActiveCategory(cat.id); handleTryOn(cat.id); }}
                className={`cat-icon-card ${isActive ? 'active' : ''}`}
                style={{ flex: 1, minWidth: 0 }}
              >
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isActive ? 'rgba(200,169,110,0.15)' : '#1E1E1E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <cat.icon style={{
                    width: 18,
                    height: 18,
                    color: isActive ? '#C8A96E' : '#666',
                    strokeWidth: 1.8,
                  }} />
                </div>
                <span style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: isActive ? '#C8A96E' : '#666',
                  marginTop: 2,
                }}>
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Daily Reward Banner ─── */}
      <div style={{ margin: '20px 16px 0' }}>
        <div style={{
          backgroundColor: '#141414',
          border: '1px solid #2A2A2A',
          borderRadius: 16,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              backgroundColor: '#1E1E1E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}>🎁</div>
            <div>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>Daily Reward</p>
              <p style={{ color: '#888', fontSize: 12, margin: 0 }}>
                {checkinDone ? 'See you tomorrow!' : 'Come back tomorrow for more!'}
              </p>
            </div>
          </div>
          <button
            id="home-claim-btn"
            onClick={handleClaim}
            disabled={checkinDone}
            style={{
              backgroundColor: checkinDone ? '#2A2A2A' : '#C8A96E',
              color: checkinDone ? '#666' : '#0A0A0A',
              fontWeight: 700,
              fontSize: 13,
              padding: '8px 14px',
              borderRadius: 999,
              border: 'none',
              cursor: checkinDone ? 'default' : 'pointer',
              whiteSpace: 'nowrap',
              display: 'flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            {checkinDone ? '✓ Done' : (
              <>
                Claim +2
                <Zap style={{ width: 13, height: 13, fill: '#0A0A0A' }} />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─── Recent Try-Ons ─── */}
      <div style={{ padding: '24px 16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Recent Try-Ons</h3>
          <button
            id="home-view-all-btn"
            style={{ background: 'none', border: 'none', color: '#C8A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 2 }}
            onClick={() => navigate('/studio')}
          >
            View all <ChevronRight style={{ width: 14, height: 14 }} />
          </button>
        </div>

        <div style={{ display: 'flex', gap: 10, overflowX: 'auto' }} className="no-scrollbar">
          {recentTryOns.length > 0 ? (
            recentTryOns.map((job, i) => (
              <div
                key={i}
                style={{
                  minWidth: 120,
                  height: 160,
                  borderRadius: 14,
                  backgroundColor: '#141414',
                  border: '1px solid #2A2A2A',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                }}
              >
                {job.result_url && (
                  <img
                    src={`${BACKEND_URL}${job.result_url}`}
                    alt="Try-on"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {/* Category tag */}
                <div style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: 'rgba(10,10,10,0.8)',
                  color: '#fff',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 999,
                }}>
                  Tops
                </div>
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  color: '#888',
                  fontSize: 10,
                }}>Today</div>
              </div>
            ))
          ) : (
            // Empty placeholders (as in Figma)
            ['Tops', 'Dresses', 'Bottoms'].map((label, i) => (
              <div
                key={i}
                id={`home-recent-card-${i}`}
                onClick={() => handleTryOn('tops')}
                style={{
                  minWidth: 120,
                  height: 160,
                  borderRadius: 14,
                  backgroundColor: '#141414',
                  border: '1px solid #2A2A2A',
                  overflow: 'hidden',
                  position: 'relative',
                  flexShrink: 0,
                  cursor: 'pointer',
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  backgroundColor: 'rgba(255,255,255,0.08)',
                  color: '#aaa',
                  fontSize: 10,
                  fontWeight: 600,
                  padding: '3px 8px',
                  borderRadius: 999,
                }}>{label}</div>
                <div style={{
                  position: 'absolute',
                  bottom: 8,
                  left: 8,
                  color: '#555',
                  fontSize: 10,
                }}>Today</div>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  );
}

export default Home;
