import React, { useState, useEffect } from 'react';
import { 
  User, 
  ChevronRight, 
  CreditCard, 
  Shield, 
  LogOut,
  Sparkles,
  Zap,
  LayoutGrid,
  ChevronLeft,
  Moon,
  Languages,
  Loader2
} from 'lucide-react';
import { AdMob } from '@capacitor-community/admob';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

function Settings() {
  const { currentUser, credits, logout, setIsPricingModalOpen, rewardCredit } = useAuth();
  const { lang, setLang, t } = useLanguage();
  const { isDarkMode, toggleTheme } = useTheme();
  const [adLoading, setAdLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    AdMob.initialize();
    const failedListener = AdMob.addListener('onAdFailedToLoad', () => setAdLoading(false));
    const dismissedListener = AdMob.addListener('onAdDismissed', () => setAdLoading(false));
    const rewardListener = AdMob.addListener('onRewardedVideoAdReward', async () => {
      await rewardCredit();
      setAdLoading(false);
    });

    return () => {
      dismissedListener.remove();
      failedListener.remove();
      rewardListener.remove();
    };
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

  return (
    <div className="min-h-screen bg-background pb-32">
       {/* Simple Header */}
       <div className="px-6 py-6 border-b border-border bg-background sticky top-0 z-40">
        <div className="max-w-xl mx-auto flex items-center justify-between">
           <button onClick={() => navigate(-1)} className="p-2 bg-card rounded-xl text-foreground"><ChevronLeft/></button>
           <h1 className="text-xl font-extrabold text-foreground">Account Settings</h1>
           <div className="w-10"></div>
        </div>
      </div>

      <div className="max-w-xl mx-auto px-6 pt-8 space-y-6">
        {/* Profile Card - Clear Contrast */}
        <div className="bg-card p-8 rounded-[32px] border border-border shadow-sm">
           <div className="flex flex-col items-center text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center text-white text-3xl font-black mb-4">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <h2 className="text-2xl font-black text-foreground mb-1">{currentUser?.name || 'User'}</h2>
              <p className="text-text-muted mb-6">{currentUser?.email}</p>
              
              <div className="bg-background w-full rounded-2xl p-4 border border-border flex items-center justify-between">
                 <span className="text-sm font-bold text-text-muted uppercase">Credits</span>
                 <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <span className="text-2xl font-black text-foreground">{credits}</span>
                 </div>
              </div>
           </div>
        </div>

        {/* Ads & Premium */}
        <div className="grid grid-cols-1 gap-4">
           <button 
             onClick={showRewardedAd}
             disabled={adLoading}
             className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 active:scale-95 transition-all"
           >
             {adLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
             Get Free Credit
           </button>

           <button 
             onClick={() => setIsPricingModalOpen(true)}
             className="w-full py-4 bg-white dark:bg-gray-800 border-2 border-primary text-primary font-bold rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
           >
             <CreditCard className="w-5 h-5" /> Buy Credits
           </button>
        </div>

        {/* Options */}
        <div className="bg-card rounded-[32px] overflow-hidden border border-border">
           <div className="divide-y divide-border">
              <div className="flex items-center justify-between p-5 cursor-pointer" onClick={toggleTheme}>
                 <div className="flex items-center gap-4">
                    <Moon className="w-5 h-5 text-text-muted" />
                    <span className="font-bold text-foreground">Dark Mode</span>
                 </div>
                 <div className={`w-12 h-6 rounded-full flex items-center px-1 transition-all ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}>
                    <div className={`w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'translate-x-6' : ''}`} />
                 </div>
              </div>

              <div className="flex items-center justify-between p-5">
                 <div className="flex items-center gap-4">
                    <Languages className="w-5 h-5 text-text-muted" />
                    <span className="font-bold text-foreground">Language</span>
                 </div>
                 <div className="flex gap-1 bg-background p-1 rounded-xl border border-border">
                    <button onClick={() => setLang('en')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${lang === 'en' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'}`}>EN</button>
                    <button onClick={() => setLang('hi')} className={`px-3 py-1.5 rounded-lg text-xs font-bold ${lang === 'hi' ? 'bg-primary text-white shadow-sm' : 'text-text-muted'}`}>HI</button>
                 </div>
              </div>

              <button onClick={logout} className="w-full flex items-center gap-4 p-5 text-red-500 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                 <LogOut className="w-5 h-5" />
                 <span>Logout</span>
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
