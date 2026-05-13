import { useState, useRef, useEffect } from 'react';
import { 
  Upload, 
  Camera, 
  Sparkles, 
  ChevronLeft, 
  Download, 
  History,
  Shirt,
  Scissors,
  Watch,
  Grid,
  Zap,
  Glasses,
  User,
  Footprints,
  Loader2
} from 'lucide-react';
import { Camera as CapCamera, CameraResultType } from '@capacitor/camera';
import { Preferences } from '@capacitor/preferences';
import { BACKEND_URL } from '../Constants';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';

const TryOn = () => {
  const { credits } = useAuth();
  const { t } = useLanguage();
  
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
    { id: 'dresses', label: 'Dresses', icon: User },
    { id: 'hair', label: 'Hair', icon: Sparkles },
    { id: 'glasses', label: 'Glasses', icon: Glasses },
    { id: 'watches', label: 'Watches', icon: Watch },
    { id: 'shoes', label: 'Shoes', icon: Footprints },
    { id: 'others', label: 'Others', icon: Grid },
  ];

  useEffect(() => {
    loadHistory();
    checkPendingJob();
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    };
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
        setHistory(data.map(j => `${BACKEND_URL}${j.result_url}`));
      }
    } catch (e) {}
  };

  const checkPendingJob = async () => {
    const savedJobId = await Preferences.get({ key: 'pending_job_id' }).then(res => res.value);
    if (savedJobId) {
      setIsLoading(true);
      const token = await Preferences.get({ key: 'jwt_token' }).then(res => res.value) || localStorage.getItem('jwt_token');
      pollJobStatus(savedJobId, token);
    }
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

      if (type === 'user') {
        setUserImage(image.webPath);
        setUserFile(file);
      } else {
        setClothImage(image.webPath);
        setClothFile(file);
      }
    } catch (e) {
      // User cancelled or camera error - fallback to hidden file input
      if (type === 'user') userFileInput.current.click();
      else clothFileInput.current.click();
    }
  };

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'user') {
          setUserImage(reader.result);
          setUserFile(file);
        } else {
          setClothImage(reader.result);
          setClothFile(file);
        }
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
            await Preferences.remove({ key: 'pending_job_id' });
            setResultImage(`${BACKEND_URL}${data.result_url}`);
            setHistory(prev => [`${BACKEND_URL}${data.result_url}`, ...prev]);
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
      await Preferences.set({ key: 'pending_job_id', value: data.job_id });
      pollJobStatus(data.job_id, token);
    } catch (e) {
      setError("AI Servers are busy. Retrying in 10s...");
      setTimeout(handleTryOn, 10000);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
         <div className="w-24 h-24 border-4 border-primary border-t-transparent rounded-full animate-spin mb-8"></div>
         <h2 className="text-3xl font-black text-white mb-4">AI MAGIC IN PROGRESS</h2>
         <p className="text-gray-400 text-lg mb-8">We are tailoring the dress for you. This takes 1-2 minutes.</p>
         <div className="bg-white/10 px-8 py-4 rounded-3xl border border-white/20">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Queue Status</p>
            <p className="text-2xl font-black text-primary">{queuePosition > 0 ? `Position #${queuePosition + 1}` : 'Up Next!'}</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="px-6 py-4 flex items-center justify-between border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <button onClick={() => window.history.back()}><ChevronLeft className="w-6 h-6"/></button>
        <h1 className="text-lg font-black uppercase">Studio</h1>
        <div className="bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs font-black">{credits}</span>
        </div>
      </div>

      <div className="px-6 pt-8">
        {!resultImage ? (
          <div className="space-y-8">
            {/* User Photo */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-text-muted">1. Your Photo</h3>
              <div 
                onClick={() => handleCamera('user')}
                className="relative aspect-[3/4] bg-card rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden"
              >
                {userImage ? (
                  <img src={userImage} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Camera className="w-10 h-10 text-primary mb-2" />
                    <span className="text-sm font-bold text-text-muted">Click to take photo</span>
                  </>
                )}
              </div>
              <input ref={userFileInput} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'user')} />
            </div>

            {/* Cloth Photo */}
            <div className="space-y-4">
              <h3 className="text-sm font-black uppercase text-text-muted">2. What to try?</h3>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {categories.map(cat => (
                  <button 
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-2xl min-w-[70px] transition-all ${selectedCategory === cat.id ? 'bg-primary text-white' : 'bg-card text-text-muted'}`}
                  >
                    <cat.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold">{cat.label}</span>
                  </button>
                ))}
              </div>
              <div 
                onClick={() => handleCamera('cloth')}
                className="relative aspect-square bg-card rounded-[32px] border-2 border-dashed border-border flex flex-col items-center justify-center overflow-hidden"
              >
                {clothImage ? (
                  <img src={clothImage} className="w-full h-full object-cover" />
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-primary mb-2" />
                    <span className="text-sm font-bold text-text-muted">Upload garment photo</span>
                  </>
                )}
              </div>
              <input ref={clothFileInput} type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'cloth')} />
            </div>

            {error && <div className="p-4 bg-red-50 text-red-500 rounded-2xl font-bold text-sm border border-red-100">{error}</div>}

            <button 
              onClick={handleTryOn}
              disabled={!userFile || !clothFile}
              className="btn-minimal w-full py-6 text-xl disabled:opacity-30"
            >
              GENERATE LOOK ✨
            </button>
          </div>
        ) : (
          <div className="animate-slide-up">
            <div className="flex justify-between items-center mb-6">
               <button onClick={() => setResultImage(null)} className="font-bold text-primary flex items-center gap-1"><ChevronLeft/> Try New</button>
               <button className="p-3 bg-card rounded-full"><Download/></button>
            </div>
            <div className="rounded-[40px] overflow-hidden shadow-2xl border-4 border-white">
               <ReactCompareSlider
                  itemOne={<ReactCompareSliderImage src={userImage} />}
                  itemTwo={<ReactCompareSliderImage src={resultImage} />}
                  className="w-full aspect-[3/4]"
               />
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="mt-16">
            <h3 className="text-lg font-black mb-6 flex items-center gap-2"><History className="text-primary"/> Recent Designs</h3>
            <div className="grid grid-cols-3 gap-3">
              {history.map((url, i) => (
                <div key={i} className="aspect-[3/4] rounded-xl overflow-hidden border border-border shadow-sm" onClick={() => {setResultImage(url); setUserImage(null);}}>
                   <img src={url} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TryOn;
