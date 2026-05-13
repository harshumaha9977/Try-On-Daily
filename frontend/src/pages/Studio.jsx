import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Play, ArrowRight, MessageSquare, Watch, Gem, Footprints, Camera } from 'lucide-react';
import PricingModal from '../components/PricingModal';
import { useAuth } from '../context/AuthContext';

function Studio() {
  const { isPricingModalOpen, setIsPricingModalOpen, useCredit, currentUser } = useAuth();
  const navigate = useNavigate();

  const handleStartTryOn = (category = "tops") => {
    if (useCredit()) {
      navigate('/try-on', { state: { category } });
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-background text-foreground font-sans pb-20 transition-colors duration-300">

      {/* Dashboard Header */}
      <div className="bg-card border-b border-border py-10 px-6 sm:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-extrabold text-foreground mb-2">
              Welcome to the Studio{currentUser ? `, ${currentUser.name || currentUser.email?.split('@')[0]}` : ''}
            </h1>
            <p className="text-foreground/60 text-lg max-w-xl">
              Select what you'd like to try on today. Our AI handles the prompt engineering automatically in the background.
            </p>
          </div>
          <button
            onClick={() => setIsPricingModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-purple-500/25 w-fit"
          >
            <Sparkles className="w-5 h-5 text-yellow-300" /> Upgrade to PRO
          </button>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 space-y-10">

        {/* Main Clothes & Video Row */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Main Clothes Card (Spans 3 cols) */}
          <div className="lg:col-span-3 relative bg-card rounded-3xl overflow-hidden border border-border shadow-sm group flex flex-col sm:flex-row">
            <div className="p-8 sm:w-1/2 flex flex-col justify-center">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-3">Apparel Try-On</h2>
              <p className="text-foreground/70 mb-8 leading-relaxed">
                Instantly visualize shirts, dresses, suits, and jackets on any body type. Essential for fashion eCommerce to reduce returns and boost conversions.
              </p>
              <button onClick={() => handleStartTryOn('tops')} className="bg-black text-white hover:bg-gray-800 font-semibold px-6 py-3 rounded-xl transition-all flex items-center gap-2 w-fit">
                Open Apparel Editor <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <div className="sm:w-1/2 relative min-h-[300px]">
              <img loading="lazy" src="/mockups/landing_hero.png" alt="Apparel" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </div>

          {/* AI Video Card (Spans 2 cols) */}
          <div className="lg:col-span-2 relative bg-gray-800 rounded-3xl overflow-hidden shadow-lg group cursor-pointer" onClick={() => handleStartTryOn('video')}>
            {/* CSS Animated 'Video' using Project Image */}
            <div className="absolute inset-0 w-full h-full">
              <img loading="lazy"
                src="/mockups/landing_hero.png"
                alt="AI Video Generator"
                className="absolute inset-0 w-full h-full object-cover opacity-60 animate-kenburns"
              />
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>

            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-white/30 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)]">
                <Play className="w-6 h-6 text-white ml-1" />
              </div>
            </div>

            <div className="absolute bottom-0 left-0 p-8 w-full pointer-events-none">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase rounded tracking-wider animate-pulse">New</span>
                <span className="text-white/80 text-sm font-medium">Video Engine</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">AI Video Lookbook</h2>
              <p className="text-gray-400 text-sm">Turn static apparel try-ons into 5-second runway walking videos automatically.</p>
            </div>
          </div>

        </div>

        {/* Accessories Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Watches & Belts */}
          <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm flex flex-col">
            <div className="h-48 relative">
              <img loading="lazy" src="/mockups/male_accessories.png" alt="Watches" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
            </div>
            <div className="p-8 pt-0 flex-1 flex flex-col">
              <div className="w-10 h-10 bg-gray-100 text-gray-700 rounded-lg flex items-center justify-center mb-4 relative -top-5 border border-card shadow-sm">
                <Watch className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Watches & Belts</h3>
              <p className="text-foreground/70 text-sm mb-6 flex-1">
                Perfectly wrap leather belts and luxury mechanical watches around wrists and waists with accurate scaling and shadows.
              </p>
              <button onClick={() => handleStartTryOn('watches')} className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-semibold px-4 py-3 rounded-xl transition-all">
                Try Accessories
              </button>
            </div>
          </div>

          {/* Jewelry */}
          <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm flex flex-col">
            <div className="h-48 relative">
              <img loading="lazy" src="/mockups/female_accessories.png" alt="Jewelry" className="absolute inset-0 w-full h-full object-cover object-top" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
            </div>
            <div className="p-8 pt-0 flex-1 flex flex-col">
              <div className="w-10 h-10 bg-yellow-100 text-yellow-600 rounded-lg flex items-center justify-center mb-4 relative -top-5 border border-card shadow-sm">
                <Gem className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Jewelry & Necklaces</h3>
              <p className="text-foreground/70 text-sm mb-6 flex-1">
                Delicate chains, statement earrings, and layered necklaces applied with high-fidelity metal reflections.
              </p>
              <button onClick={() => handleStartTryOn('jewelry')} className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-semibold px-4 py-3 rounded-xl transition-all">
                Try Jewelry
              </button>
            </div>
          </div>

          {/* Footwear */}
          <div className="bg-card rounded-3xl overflow-hidden border border-border shadow-sm flex flex-col">
            <div className="h-48 relative">
              <img loading="lazy" src="/mockups/shoes.png" alt="Shoes" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent"></div>
            </div>
            <div className="p-8 pt-0 flex-1 flex flex-col">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4 relative -top-5 border border-card shadow-sm">
                <Footprints className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Shoes & Sneakers</h3>
              <p className="text-foreground/70 text-sm mb-6 flex-1">
                Replace footwear seamlessly. Our AI understands ground contact points and preserves floor shadows.
              </p>
              <button onClick={() => handleStartTryOn('shoes')} className="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-semibold px-4 py-3 rounded-xl transition-all">
                Try Footwear
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* Pricing Modal */}
      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />

    </div>
  );
}

export default Studio;
