import React, { useState, useRef, useEffect } from 'react';
import { X, Bot, User, ChevronRight, MessageSquare, Search } from 'lucide-react';

const FAQ_DATA = [
  {
    category: "General",
    questions: [
      { q: "What is Try-ON Daily?", a: "Try-ON Daily is an AI-powered virtual dressing room that allows you to try on clothes, jewelry, and accessories using just a photo." },
      { q: "Who created this app?", a: "The app was developed by Harshu Mahajan to revolutionize online fashion shopping." },
      { q: "How does the AI work?", a: "Our AI uses advanced computer vision to segment your body and realistically 'warp' clothing or accessories onto you with proper shadows and reflections." },
      { q: "Is my data safe?", a: "Yes, we prioritize your privacy. Images are processed securely and we do not share your personal data with third parties." },
      { q: "Can I use it on mobile?", a: "Absolutely! The app is fully optimized for both Android and iOS devices." },
      { q: "Do I need to create an account?", a: "Yes, an account is needed to manage your try-on history and credits." },
      { q: "How do I contact support?", a: "You can reach us at tryondailyer@gmail.com for any queries or issues." }
    ]
  },
  {
    category: "Try-On Features",
    questions: [
      { q: "What clothes can I try on?", a: "You can try on shirts, t-shirts, dresses, jackets, blazers, and ethnic wear like sarees or suits." },
      { q: "Can I try on jewelry?", a: "Yes! We have a dedicated Jewelry section for necklaces, earrings, and pendants." },
      { q: "Is footwear supported?", a: "Yes, you can try on various styles of shoes and sneakers." },
      { q: "Can I try on watches?", a: "Yes, we support luxury watches. The AI places them accurately on the wrist." },
      { q: "What is the Apparel Try-On?", a: "It's our main feature for clothing where you can visualize full outfits instantly." },
      { q: "Can I try multiple items at once?", a: "Currently, our AI processes one category at a time for the best accuracy." },
      { q: "Can I try on accessories like belts?", a: "Yes, belts and other waist accessories are supported in the 'Watches & Belts' section." },
      { q: "How many categories are there?", a: "We have 5 main categories: Apparel, AI Video, Watches, Jewelry, and Footwear." }
    ]
  },
  {
    category: "AI Video Lookbook",
    questions: [
      { q: "What is the Video Lookbook?", a: "It turns your static try-on photos into a realistic 5-second video of you walking on a runway!" },
      { q: "How long are the videos?", a: "The generated videos are typically 5 seconds long." },
      { q: "Does the video engine cost extra?", a: "It uses standard credits, but the PRO plan generates them much faster." },
      { q: "Can I download the videos?", a: "Yes, once a video is generated, you can save it to your device gallery." },
      { q: "What is the 'Walking Video' feature?", a: "It's our latest AI engine that animates your body to show how the clothes move." },
      { q: "How many credits does a video take?", a: "Generating a video typically takes 1 credit per generation." }
    ]
  },
  {
    category: "Credits & Pricing",
    questions: [
      { q: "Are there free credits?", a: "Yes! Every new user gets 10 free credits to explore the app." },
      { q: "What is the Standard plan?", a: "The Standard plan is ₹100/mo (annual) or ₹199/mo. It includes up to 2,400 credits per year." },
      { q: "What are the benefits of the PRO plan?", a: "The PRO plan (₹249/mo) gives you 12,000 credits, fastest AI processing, and no watermarks on images/videos." },
      { q: "Do credits expire?", a: "Credits remain valid as long as your subscription is active." },
      { q: "How do I upgrade?", a: "Go to the Studio and click the 'Upgrade to PRO' button to see all plans." },
      { q: "What payment methods are supported?", a: "We support all major UPI, Credit/Debit cards, and Netbanking via Razorpay." },
      { q: "Is there a refund policy?", a: "Please contact support for refund queries. Generally, used credits are non-refundable." },
      { q: "What is the cheapest plan?", a: "Our Standard annual plan at ₹100/month is the most affordable way to get started." }
    ]
  },
  {
    category: "Tips for Best Results",
    questions: [
      { q: "What kind of photo should I upload?", a: "Use a clear, full-body photo with good lighting and a plain background for best results." },
      { q: "Should I stand in a specific pose?", a: "Standing straight with arms slightly away from the body (T-pose or A-pose) works best." },
      { q: "Does hair color affect try-on?", a: "No, our AI focuses on the body and clothing area, preserving your original face and hair." },
      { q: "Can I use photos with other people?", a: "It's best to use photos where only one person is visible to avoid AI confusion." },
      { q: "What if the clothing looks blurry?", a: "Ensure your original photo is high resolution. Low-quality photos may result in blurry try-ons." },
      { q: "Can I use low-light photos?", a: "Low light can reduce accuracy. We recommend using photos taken in daylight." },
      { q: "Does it work for all body types?", a: "Yes! Our AI is trained on diverse body types to ensure inclusive fitting." }
    ]
  },
  {
    category: "Technical & Help",
    questions: [
      { q: "The app is slow, what do I do?", a: "AI processing can take 10-20 seconds. If it takes longer, check your internet connection." },
      { q: "My credits didn't update after purchase?", a: "Please wait a few minutes or restart the app. If still not visible, contact tryondailyer@gmail.com." },
      { q: "How do I change my password?", a: "You can update your profile and password in the Settings section." },
      { q: "Can I delete my account?", a: "Yes, you can request account deletion via the contact email provided." },
      { q: "Does the app work offline?", a: "No, the AI models are hosted on powerful servers and require an internet connection." },
      { q: "Which Android version is required?", a: "The app works best on Android 8.0 (Oreo) and above." },
      { q: "Where can I find the Privacy Policy?", a: "You can find it in the Footer of the app or in the Settings menu." }
    ]
  }
];

function AIChat({ isOpen, onClose }) {
  const [history, setHistory] = useState([
    { type: 'bot', text: "Hello! I'm your Try-ON Daily Assistant. How can I help you today? Please pick a category or search for a question below." }
  ]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  if (!isOpen) return null;

  const handleQuestionClick = (q, a) => {
    setHistory(prev => [
      ...prev,
      { type: 'user', text: q },
      { type: 'bot', text: a }
    ]);
  };

  const filteredFaqs = search.trim()
    ? FAQ_DATA.flatMap(cat => cat.questions).filter(f => f.q.toLowerCase().includes(search.toLowerCase()))
    : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/20 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-white sm:rounded-2xl shadow-2xl flex flex-col h-[85vh] sm:h-[650px] animate-in slide-in-from-bottom-10 duration-300">

        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-black text-white sm:rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#26a69a] rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm">Assistant & FAQ</h3>
              <span className="text-[10px] text-gray-400">Always available to help</span>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 scroll-smooth">
          {history.map((item, i) => (
            <div key={i} className={`flex ${item.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] flex gap-2 ${item.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center ${item.type === 'user' ? 'bg-[#26a69a]' : 'bg-white border border-gray-200 shadow-sm'}`}>
                  {item.type === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-[#26a69a]" />}
                </div>
                <div className={`p-3 rounded-2xl text-sm shadow-sm ${item.type === 'user'
                    ? 'bg-[#26a69a] text-white rounded-tr-none'
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                  }`}>
                  {item.text}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Interaction Area */}
        <div className="p-4 bg-white border-t border-gray-100 sm:rounded-b-2xl max-h-[50%] overflow-y-auto">

          {/* Search Box */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search common questions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#26a69a] outline-none transition-all"
            />
          </div>

          {!search.trim() ? (
            <div className="space-y-4">
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${!selectedCategory ? 'bg-[#26a69a] text-white' : 'bg-gray-100 text-gray-600'}`}
                >
                  All Topics
                </button>
                {FAQ_DATA.map(cat => (
                  <button
                    key={cat.category}
                    onClick={() => setSelectedCategory(cat.category)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${selectedCategory === cat.category ? 'bg-[#26a69a] text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {cat.category}
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                {FAQ_DATA
                  .filter(cat => !selectedCategory || cat.category === selectedCategory)
                  .flatMap(cat => cat.questions)
                  .slice(0, 15) // Show only first few to keep it clean
                  .map((f, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuestionClick(f.q, f.a)}
                      className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 hover:border-[#26a69a]/30 transition-all flex items-center justify-between group"
                    >
                      <span className="text-xs font-medium text-gray-700">{f.q}</span>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#26a69a] transition-colors" />
                    </button>
                  ))
                }
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((f, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      handleQuestionClick(f.q, f.a);
                      setSearch("");
                    }}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-all flex items-center justify-between"
                  >
                    <span className="text-xs font-medium text-gray-700">{f.q}</span>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                ))
              ) : (
                <div className="py-8 text-center text-gray-400 text-xs">
                  No questions found matching your search.
                </div>
              )}
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-center gap-2 text-[10px] text-gray-400">
            <MessageSquare className="w-3 h-3" /> Still need help? Contact tryondailyer@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIChat;
