import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Shield, ChevronRight, Play, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

function Landing() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const features = [
    { icon: Zap, title: "Instant Magic", desc: "See yourself in any outfit in seconds." },
    { icon: Shield, title: "Privacy First", desc: "Your photos are processed securely." },
    { icon: Sparkles, title: "AI Precision", desc: "Highly realistic fabric and texture simulation." }
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Circles */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

      {/* Hero Section */}
      <section className="relative px-6 pt-20 pb-32 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-6 animate-slide-up">
            <Star className="w-4 h-4 fill-primary" /> Rated #1 AI Virtual Try-On
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8 animate-slide-up">
            Dress Up Without <br/>
            <span className="text-gradient">Changing.</span>
          </h1>
          
          <p className="text-xl text-text-light max-w-xl mb-12 leading-relaxed animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Experience the future of fashion. Upload your photo and instantly try on thousands of styles with our world-class AI engine.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <button 
              onClick={() => navigate('/login')}
              className="btn-premium px-12 py-5 text-xl w-full sm:w-auto"
            >
              Start Dressing <ChevronRight className="w-6 h-6 inline-block" />
            </button>
            <button className="px-8 py-5 text-text font-black hover:text-primary transition-colors flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-primary">
                <Play className="w-4 h-4 fill-primary" />
              </div>
              How it works
            </button>
          </div>

          <div className="mt-12 flex items-center gap-4 text-sm text-text-light justify-center lg:justify-start">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-200"></div>
              ))}
            </div>
            <span>Join 10,000+ fashion enthusiasts</span>
          </div>
        </div>

        <div className="flex-1 relative animate-float">
          <div className="relative z-10 rounded-[48px] overflow-hidden shadow-2xl border-8 border-white/50">
            <img 
              src="/Users/harshalmahajan/.gemini/antigravity/brain/e50288d6-36d4-49b1-abdf-56ec9b459de8/premium_vton_landing_bg_1778513324168.png" 
              alt="AI Fashion" 
              className="w-full aspect-[4/5] object-cover"
            />
          </div>
          {/* Floating UI Elements */}
          <div className="absolute -top-10 -right-10 glass p-6 rounded-3xl shadow-lg animate-float" style={{ animationDelay: '1s' }}>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase">Status</p>
                <p className="font-black">99.9% Realistic</p>
              </div>
            </div>
          </div>
          
          <div className="absolute -bottom-10 -left-10 glass p-6 rounded-3xl shadow-lg animate-float" style={{ animationDelay: '2s' }}>
             <p className="text-xs font-bold text-gray-500 uppercase mb-2">Processing Time</p>
             <p className="text-2xl font-black text-primary">0.5 Seconds</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-6 py-24 bg-card">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((f, i) => (
              <div key={i} className="bg-background p-10 rounded-[40px] shadow-sm border border-border hover:shadow-xl transition-all duration-500 group">
                <div className="w-16 h-16 bg-primary/5 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                  <f.icon className="w-8 h-8 text-primary group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-black mb-4">{f.title}</h3>
                <p className="text-text-light leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer-like Branding */}
      <div className="py-12 text-center text-text-light text-xs font-bold uppercase tracking-[0.2em]">
        Powered by Next-Gen Diffusion Models
      </div>
    </div>
  );
}

export default Landing;
