import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  Bell, 
  ChevronRight, 
  Zap, 
  Shirt, 
  Scissors, 
  Grid, 
  Image as ImageIcon,
  User,
  Plus
} from 'lucide-react';
import { Camera as CapCamera, CameraResultType } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { BACKEND_URL } from '../Constants';
import { useAuth } from '../context/AuthContext';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

const TryOn = () => {
  const { credits, useCredit } = useAuth();
  
  const [userImage, setUserImage] = useState(null);
  const [userFile, setUserFile] = useState(null);
  const [clothImage, setClothImage] = useState(null);
  const [clothFile, setClothFile] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('tops');
  const [resultImage, setResultImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [queuePosition, setQueuePosition] = useState(0);
  const [history, setHistory] = useState([]);
  
  const pollIntervalRef = useRef(null);
  const userFileInput = useRef(null);
  const clothFileInput = useRef(null);

  const categories = [
    { id: 'tops', label: 'Tops', icon: Shirt },
    { id: 'bottoms', label: 'Bottoms', icon: Scissors },
    { id: 'dresses', label: 'Dresses', icon: Sparkles },
    { id: 'more', label: 'More', icon: Grid },
  ];

  useEffect(() => {
    loadHistory();
    return () => { if (pollIntervalRef.current) clearInterval(pollIntervalRef.current); };
  }, []);

  const loadHistory = async () => {
    const token = await Preferences.get({ key: 'jwt_token' }).then(res => res.value) || localStorage.getItem('jwt_token');
    if (!token) return;
    try {
      const res = await fetch(`${BACKEND_URL}/jobs/history`, {
        headers: { 'Authorization': `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' }
      });
      if (res.ok) {
        const data = await res.json();
        setHistory(data.slice(0, 10));
      }
    } catch (e) {}
  };

  const handleCamera = async (type) => {
    try {
      const image = await CapCamera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri
      });
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const file = new File([blob], "camera_photo.jpg", { type: "image/jpeg" });
      if (type === 'user') { setUserImage(image.webPath); setUserFile(file); }
      else { setClothImage(image.webPath); setClothFile(file); }
    } catch (e) {
      if (type === 'user') userFileInput.current.click();
      else clothFileInput.current.click();
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'user') { setUserImage(reader.result); setUserFile(file); }
        else { setClothImage(reader.result); setClothFile(file); }
      };
      reader.readAsDataURL(file);
    }
  };

  const pollJobStatus = async (jobId, token) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    pollIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/job/${jobId}`, {
          headers: { 'Authorization': `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' }
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'completed') {
            clearInterval(pollIntervalRef.current);
            setResultImage(`${BACKEND_URL}${data.result_url}`);
            loadHistory();
            setIsLoading(false);
          } else if (data.status === 'failed') {
            clearInterval(pollIntervalRef.current);
            setError(data.error_msg || "Server is busy. Try again.");
            setIsLoading(false);
          } else {
            setQueuePosition(data.position || 0);
          }
        }
      } catch (e) {}
    }, 4000);
  };

  const handleTryOn = async () => {
    if (!userFile || !clothFile) return;
    const canProceed = await useCredit();
    if (!canProceed) return;
    
    setError(null);
    setIsLoading(true);
    const formData = new FormData();
    formData.append("user_image", userFile);
    formData.append("cloth_image", clothFile);
    formData.append("category", selectedCategory);

    try {
      const token = await Preferences.get({ key: 'jwt_token' }).then(res => res.value) || localStorage.getItem('jwt_token');
      const res = await fetch(`${BACKEND_URL}/tryon`, {
        method: "POST",
        headers: { 'Authorization': `Bearer ${token}`, 'bypass-tunnel-reminder': 'true' },
        body: formData
      });
      if (!res.ok) throw new Error("Busy");
      const data = await res.json();
      pollJobStatus(data.job_id, token);
    } catch (e) {
      setError("AI Servers are busy. Retrying...");
      setTimeout(handleTryOn, 10000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
         <div className="w-20 h-20 border-4 border-[#C8A96E] border-t-transparent rounded-full animate-spin mb-8"></div>
         <h2 className="text-2xl font-black text-white mb-2">GENERATING MAGIC</h2>
         <p className="text-gray-500 text-sm mb-8">Tailoring the outfit... 1-2 mins remaining.</p>
         <div className="bg-[#141414] px-6 py-4 rounded-2xl border border-[#2A2A2A]">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Queue Position</p>
            <p className="text-xl font-black text-[#C8A96E]">{queuePosition > 0 ? `#${queuePosition + 1}` : 'Processing Now'}</p>
         </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0A0A0A', paddingBottom: 100 }}>
      
      {/* ─── Header ─── */}
      <div style={{ padding: '20px 20px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ color: '#fff', fontSize: 24, fontWeight: 900, margin: 0, letterSpacing: '-0.5px' }}>Try-ON</h1>
          <p style={{ color: '#C8A96E', fontSize: 10, fontWeight: 800, margin: 0, letterSpacing: '0.1em', textTransform: 'uppercase' }}>Daily Studio</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#141414', border: '1px solid #2A2A2A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Bell style={{ width: 20, height: 20, color: '#fff' }} />
          </div>
          <div className="badge-credit">
            <Zap style={{ width: 14, height: 14, fill: '#C8A96E', color: '#C8A96E' }} />
            <span>{credits}</span>
          </div>
        </div>
      </div>

      <div style={{ padding: '16px' }}>
        {resultImage ? (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-6">
               <button onClick={() => setResultImage(null)} style={{ background: 'none', border: 'none', color: '#C8A96E', fontWeight: 700, cursor: 'pointer' }}>← Create New</button>
               <h3 style={{ color: '#fff', fontSize: 16, fontWeight: 800 }}>Magic Result</h3>
               <div style={{ width: 60 }}></div>
            </div>
            <div style={{ borderRadius: 32, overflow: 'hidden', border: '1px solid #2A2A2A', backgroundColor: '#141414' }}>
               <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={userImage} />}
                  itemTwo={<ReactCompareSliderImage src={resultImage} />}
                  style={{ width: '100%', aspectRatio: '3/4' }}
               />
            </div>
          </div>
        ) : (
          <>
            {/* ─── Create New Look Card ─── */}
            <div style={{ backgroundColor: '#141414', border: '1px solid #2A2A2A', borderRadius: 32, padding: '24px' }}>
              <h3 style={{ color: '#fff', fontSize: 20, fontWeight: 800, margin: '0 0 4px 0' }}>Create New Look</h3>
              <p style={{ color: '#888', fontSize: 14, margin: '0 0 24px 0' }}>Upload your photo to get started</p>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                {/* User Photo Upload */}
                <div 
                  onClick={() => handleCamera('user')}
                  className="upload-card" 
                  style={{ flex: 1, height: 140 }}
                >
                  {userImage ? (
                    <img src={userImage} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  ) : (
                    <>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                        <User style={{ width: 20, height: 20, color: '#888' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#888' }}>Your Photo</span>
                    </>
                  )}
                </div>

                <div style={{ fontSize: 18, color: '#C8A96E', fontWeight: 800 }}>+</div>

                {/* Garment Upload */}
                <div 
                  onClick={() => handleCamera('cloth')}
                  className="upload-card" 
                  style={{ flex: 1, height: 140 }}
                >
                  {clothImage ? (
                    <img src={clothImage} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 12 }} />
                  ) : (
                    <>
                      <div style={{ width: 44, height: 44, borderRadius: '50%', backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
                        <Shirt style={{ width: 20, height: 20, color: '#888' }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: '#888' }}>Garment</span>
                    </>
                  )}
                </div>
              </div>

              <button 
                id="tryon-generate-btn"
                onClick={handleTryOn}
                disabled={!userFile || !clothFile}
                style={{
                  backgroundColor: '#C8A96E',
                  color: '#0A0A0A',
                  fontWeight: 800,
                  fontSize: 16,
                  padding: '16px',
                  borderRadius: 14,
                  border: 'none',
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  opacity: (!userFile || !clothFile) ? 0.4 : 1,
                  cursor: 'pointer'
                }}
              >
                <Scissors style={{ width: 18, height: 18 }} />
                Generate Try-On
              </button>
            </div>

            <input ref={userFileInput} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'user')} />
            <input ref={clothFileInput} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cloth')} />

            {/* ─── Explore Categories ─── */}
            <div style={{ marginTop: 32 }}>
              <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, marginBottom: 16 }}>Explore Categories</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {categories.map(cat => (
                  <button
                    key={cat.id}
                    id={`tryon-cat-${cat.id}`}
                    onClick={() => setSelectedCategory(cat.id)}
                    style={{
                      backgroundColor: selectedCategory === cat.id ? '#1E1A0E' : '#141414',
                      border: `1px solid ${selectedCategory === cat.id ? '#C8A96E' : '#2A2A2A'}`,
                      borderRadius: 16,
                      padding: '12px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <cat.icon style={{ width: 18, height: 18, color: selectedCategory === cat.id ? '#C8A96E' : '#666' }} />
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 600, color: selectedCategory === cat.id ? '#C8A96E' : '#666' }}>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* ─── Your Gallery Preview ─── */}
            <div style={{ marginTop: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <h3 style={{ color: '#fff', fontSize: 17, fontWeight: 700, margin: 0 }}>Your Gallery</h3>
                <button 
                  onClick={() => navigate('/studio')}
                  style={{ background: 'none', border: 'none', color: '#C8A96E', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  See all
                </button>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                {history.length > 0 ? (
                  history.slice(0, 2).map((job, i) => (
                    <div key={i} style={{ aspectRatio: '3/4', borderRadius: 16, backgroundColor: '#141414', border: '1px solid #2A2A2A', overflow: 'hidden' }}>
                      <img src={`${BACKEND_URL}${job.result_url}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))
                ) : (
                  <>
                    <div style={{ aspectRatio: '3/4', borderRadius: 16, backgroundColor: '#141414', border: '1px solid #2A2A2A' }} />
                    <div style={{ aspectRatio: '3/4', borderRadius: 16, backgroundColor: '#141414', border: '1px solid #2A2A2A', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                       <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#1E1E1E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <ImageIcon style={{ width: 20, height: 20, color: '#444' }} />
                       </div>
                       <span style={{ color: '#444', fontSize: 11, fontWeight: 700 }}>View 12 more</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TryOn;
