import { useNavigate } from 'react-router-dom';
import { Sparkles, Zap, Shield, ChevronRight, Shirt, Scissors, Grid, Camera, Watch, Gem } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { isLoggedIn, setIsLoginModalOpen } = useAuth();

  const handleStart = (category = 'tops') => {
    if (isLoggedIn) {
      navigate('/try-on', { state: { category } });
    } else {
      setIsLoginModalOpen(true);
    }
  };

  const categories = [
    { name: 'Clothes', id: 'tops', icon: Shirt, color: 'bg-green-100 text-green-700' },
    { name: 'Watches', id: 'watches', icon: Watch, color: 'bg-blue-100 text-blue-700' },
    { name: 'Jewelry', id: 'jewelry', icon: Gem, color: 'bg-yellow-100 text-yellow-700' },
    { name: 'Others', id: 'others', icon: Grid, color: 'bg-gray-100 text-gray-700' }
  ];

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Hero Section - Extremely Simple */}
      <section className="px-6 pt-12 pb-12 text-center">
        <div className="flex justify-center mb-8">
           <div className="w-20 h-20 bg-primary rounded-3xl flex items-center justify-center text-white shadow-xl">
             <Shirt className="w-10 h-10" />
           </div>
        </div>
        
        <h1 className="text-4xl font-extrabold mb-4 text-foreground">
          Virtual <span className="text-primary">Try-On</span>
        </h1>
        
        <p className="text-lg text-text-muted mb-10 max-w-xs mx-auto">
          See yourself in any outfit instantly with AI magic.
        </p>

        <button 
          onClick={() => handleStart()}
          className="btn-minimal w-full max-w-xs py-5 text-xl shadow-lg"
        >
          Start Now <ChevronRight className="inline-block ml-1" />
        </button>
      </section>

      {/* Categories - Simple Cards */}
      <section className="px-6 mt-8">
        <h2 className="text-xl font-black mb-6 text-foreground">Choose Category</h2>
        <div className="grid grid-cols-2 gap-4">
          {categories.map((cat, i) => (
            <div 
              key={i} 
              onClick={() => handleStart(cat.id)}
              className="card-minimal flex flex-col items-center justify-center gap-3 active:scale-95 transition-all cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${cat.color}`}>
                <cat.icon className="w-6 h-6" />
              </div>
              <span className="font-bold text-foreground">{cat.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="px-6 mt-16 text-center space-y-4">
        <div className="flex items-center justify-center gap-6 opacity-50 grayscale">
           <div className="flex flex-col items-center gap-1">
             <Shield className="w-5 h-5" />
             <span className="text-[10px] font-bold">Secure</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <Zap className="w-5 h-5" />
             <span className="text-[10px] font-bold">Fast</span>
           </div>
           <div className="flex flex-col items-center gap-1">
             <Sparkles className="w-5 h-5" />
             <span className="text-[10px] font-bold">HD</span>
           </div>
        </div>
      </section>
    </div>
  );
}

export default Home;
