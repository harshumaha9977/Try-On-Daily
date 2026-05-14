import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Share2, ChevronRight, Zap, MoreHorizontal, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BACKEND_URL } from '../Constants';
import { Preferences } from '@capacitor/preferences';

function Studio() {
  const navigate = useNavigate();
  const { currentUser, credits, isLoggedIn, setIsLoginModalOpen } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [activeTab, setActiveTab] = useState('All Styles');
  const [checkinDone, setCheckinDone] = useState(false);

  const tabs = ['All Styles', 'Tops', 'Bottoms', 'Dresses'];

  useEffect(() => {
    if (isLoggedIn) loadHistory();
  }, [isLoggedIn]);

  const loadHistory = async () => {
    const token = await Preferences.get({ key: 'jwt_token' })
      .then(r => r.value) || localStorage.getItem('jwt_token');
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/jobs/history`, {
        headers: { Authorization: `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (e) {}
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

  const fullName = currentUser?.name || 'Harshmal M.';

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', paddingBottom: 100 }}>
      
      {/* ─── Top Bar ─── */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#1E1E1E' }}></div>
          <div>
            <p style={{ color: '#888', fontSize: 11, marginBottom: 1, textTransform: 'capitalize' }}>Welcome back</p>
            <h2 style={{ color: '#fff', fontSize: 16, fontWeight: 800, margin: 0 }}>{fullName}</h2>
          </div>
        </div>
        <div className="badge-credit">
          <Zap style={{ width: 14, height: 14, fill: '#C8A96E', color: '#C8A96E' }} />
          <span>{credits}</span>
        </div>
      </div>

      {/* ─── Daily Credits Banner ─── */}
      <div style={{ padding: '8px 16px' }}>
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
              width: 44,
              height: 44,
              borderRadius: 12,
              backgroundColor: '#1E1E1E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 22,
            }}>🎁</div>
            <div>
              <p style={{ color: '#fff', fontSize: 14, fontWeight: 700, margin: 0 }}>Daily Credits Available</p>
              <p style={{ color: '#888', fontSize: 12, margin: 0 }}>
                Claim your 2 free credits today
              </p>
            </div>
          </div>
          <button
            id="studio-claim-btn"
            onClick={handleClaim}
            disabled={checkinDone}
            style={{
              backgroundColor: checkinDone ? '#2A2A2A' : '#C8A96E',
              color: checkinDone ? '#666' : '#0A0A0A',
              fontWeight: 700,
              fontSize: 13,
              padding: '8px 16px',
              borderRadius: 10,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            {checkinDone ? 'Claimed' : 'Claim'}
          </button>
        </div>
      </div>

      {/* ─── Filter Tabs ─── */}
      <div style={{ padding: '16px 0', overflowX: 'auto', display: 'flex', gap: 8, paddingLeft: 16 }} className="no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab}
            id={`studio-tab-${tab.toLowerCase().replace(' ', '-')}`}
            onClick={() => setActiveTab(tab)}
            style={{
              backgroundColor: activeTab === tab ? '#C8A96E' : '#141414',
              color: activeTab === tab ? '#0A0A0A' : '#fff',
              fontSize: 13,
              fontWeight: 600,
              padding: '10px 18px',
              borderRadius: 999,
              border: activeTab === tab ? 'none' : '1px solid #2A2A2A',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ─── Feed: Generated Looks ─── */}
      <div style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
        {jobs.length > 0 ? (
          jobs.map((job, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#141414',
                border: '1px solid #2A2A2A',
                borderRadius: 24,
                overflow: 'hidden',
              }}
            >
              {/* Card Header */}
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Generated Look
                  </span>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#555' }} />
                  <span style={{ color: '#555', fontSize: 10, fontWeight: 600 }}>2h ago</span>
                </div>
                <MoreHorizontal style={{ width: 18, height: 18, color: '#555' }} />
              </div>

              {/* Card Image */}
              <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#0D0D0D', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {job.result_url ? (
                  <img
                    src={`${BACKEND_URL}${job.result_url}`}
                    alt="Generated Look"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <ImageIcon style={{ width: 40, height: 40, color: '#1E1E1E' }} />
                )}
              </div>

              {/* Card Actions */}
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff' }}>
                    <Heart style={{ width: 22, height: 22, strokeWidth: 1.5 }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>24</span>
                  </div>
                  <Share2 style={{ width: 22, height: 22, color: '#fff', strokeWidth: 1.5 }} />
                </div>
                <button
                  id={`studio-view-details-${i}`}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C8A96E',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                    cursor: 'pointer',
                  }}
                >
                  View Details <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          ))
        ) : (
          // Placeholder cards if no jobs
          [1, 2, 3].map((_, i) => (
            <div
              key={i}
              style={{
                backgroundColor: '#141414',
                border: '1px solid #2A2A2A',
                borderRadius: 24,
                overflow: 'hidden',
              }}
            >
              <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#fff', fontSize: 10, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                    Generated Look
                  </span>
                  <div style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#555' }} />
                  <span style={{ color: '#555', fontSize: 10, fontWeight: 600 }}>2h ago</span>
                </div>
                <MoreHorizontal style={{ width: 18, height: 18, color: '#555' }} />
              </div>
              <div style={{ width: '100%', aspectRatio: '1', backgroundColor: '#0D0D0D' }} />
              <div style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fff' }}>
                    <Heart style={{ width: 22, height: 22, strokeWidth: 1.5 }} />
                    <span style={{ fontSize: 14, fontWeight: 600 }}>24</span>
                  </div>
                  <Share2 style={{ width: 22, height: 22, color: '#fff', strokeWidth: 1.5 }} />
                </div>
                <button
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#C8A96E',
                    fontSize: 14,
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  View Details <ChevronRight style={{ width: 16, height: 16 }} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

    </div>
  );
}

export default Studio;
