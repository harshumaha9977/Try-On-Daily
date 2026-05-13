import { X, Check } from 'lucide-react';
import { useState } from 'react';
import CheckoutModal from './CheckoutModal';

function PricingModal({ isOpen, onClose }) {
  const [isAnnual, setIsAnnual] = useState(true);
  const [checkoutData, setCheckoutData] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-y-auto p-6 md:p-8 max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-black bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Boost your fashion business with <span className="text-[#26a69a]">Try-ON PRO</span>
          </h2>
          
          <div className="mt-6 inline-flex items-center bg-gray-100 p-1 rounded-full">
            <button 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${!isAnnual ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setIsAnnual(false)}
            >
              Pay monthly
            </button>
            <button 
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${isAnnual ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setIsAnnual(true)}
            >
              Pay annually
              <span className="bg-gray-900 text-white text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wide">Save 48%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          
          {/* Free Tier */}
          <div className="bg-[#f8f9fa] rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free</h3>
              <p className="text-gray-500 text-xs">Free forever for everyone</p>
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900">₹0</span>
              <span className="text-gray-500 text-xs font-medium">/mo</span>
            </div>
            <button className="w-full py-2.5 text-sm bg-[#e5e7eb] hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors mb-6">
              Current Plan
            </button>
            <div className="flex items-center gap-2 mb-4">
              <SparkleIcon className="text-blue-400 w-4 h-4" />
              <p className="text-xs font-bold text-gray-900"><span className="text-blue-500">10 credits</span> / month</p>
            </div>
            <div className="space-y-3 flex-1">
              <FeatureItem text="Up to 10 items in wardrobe" />
              <FeatureItem text="Up to 10 custom models" />
              <FeatureItem text="Limited AI Try-ON" />
              <FeatureItem text="Try-ON watermark" />
            </div>
          </div>

          {/* Standard Tier */}
          <div className="bg-[#f8f9fa] rounded-2xl p-6 flex flex-col">
            <div className="mb-4">
              <h3 className="text-xl font-bold text-gray-900 mb-1">Standard</h3>
              <p className="text-gray-500 text-xs">For small stores</p>
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900">₹{isAnnual ? '100' : '199'}</span>
              <span className="text-gray-500 text-xs font-medium">/mo</span>
            </div>
            <button 
              onClick={() => setCheckoutData({ planName: 'Standard', amount: isAnnual ? 100 : 199, isAnnual })}
              className="w-full py-2.5 text-sm bg-[#e5e7eb] hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors mb-6"
            >
              Get Standard
            </button>
            <div className="flex items-center gap-2 mb-4">
              <SparkleIcon className="text-blue-400 w-4 h-4" />
              <p className="text-xs font-bold text-gray-900"><span className="text-blue-500">{isAnnual ? '2,400' : '200'} credits</span> / {isAnnual ? 'year' : 'month'}</p>
            </div>
            <div className="space-y-3 flex-1">
              <FeatureItem text="Unlimited wardrobe items" />
              <FeatureItem text="Faster generation speed" />
              <FeatureItem text="No watermark" />
            </div>
          </div>

          {/* Pro Tier */}
          <div className="bg-white rounded-2xl p-6 flex flex-col relative border-2 border-[#26a69a] shadow-lg transform md:-translate-y-2">
            <div className="absolute -top-3 right-4 bg-indigo-500 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider">
              Best value
            </div>
            <div className="mb-4">
              <h3 className="text-xl font-bold text-[#26a69a] mb-1">Pro</h3>
              <p className="text-gray-500 text-xs">For growing studios</p>
            </div>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-gray-900">₹{isAnnual ? '249' : '499'}</span>
              <span className="text-gray-500 text-xs font-medium">/mo</span>
            </div>
            <button 
              onClick={() => setCheckoutData({ planName: 'PRO', amount: isAnnual ? 249 : 499, isAnnual })}
              className="w-full py-2.5 text-sm bg-[#26a69a] hover:bg-[#208d82] text-white font-bold rounded-lg transition-colors mb-6 shadow-sm"
            >
              Get PRO
            </button>
            <div className="flex items-center gap-2 mb-4">
              <SparkleIcon className="text-blue-400 w-4 h-4" />
              <p className="text-xs font-bold text-gray-900"><span className="text-[#26a69a]">{isAnnual ? '12,000' : '1,000'} credits</span> / {isAnnual ? 'year' : 'month'}</p>
            </div>
            <div className="space-y-3 flex-1">
              <FeatureItem text="Unlimited wardrobe items" color="text-[#26a69a]" />
              <FeatureItem text="Unlimited models" color="text-[#26a69a]" />
              <FeatureItem text="Fastest AI speed" color="text-[#26a69a]" />
              <FeatureItem text="Priority Support" color="text-[#26a69a]" />
            </div>
          </div>

        </div>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-gray-500 text-xs">
          <svg className="w-4 h-4 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          </svg>
          <span className="font-bold text-gray-700">Cancel anytime.</span> Unused credits roll over.
        </div>

      </div>

      <CheckoutModal 
        isOpen={!!checkoutData} 
        onClose={() => {
          setCheckoutData(null);
          if (checkoutData) onClose(); // Also close pricing modal if they bought
        }}
        planName={checkoutData?.planName}
        amount={checkoutData?.amount}
        isAnnual={checkoutData?.isAnnual}
      />
    </div>
  );
}

function FeatureItem({ text, color = "text-[#26a69a]" }) {
  return (
    <div className="flex items-start gap-3">
      <Check className={`w-5 h-5 ${color} flex-shrink-0`} />
      <span className="text-sm text-gray-700">{text}</span>
    </div>
  );
}

function SparkleIcon({ className }) {
  return (
    <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.603 2.115a.5.5 0 0 1 .794 0l2.368 3.158a5.5 5.5 0 0 0 2.962 2.962l3.158 2.368a.5.5 0 0 1 0 .794l-3.158 2.368a5.5 5.5 0 0 0-2.962 2.962l-2.368 3.158a.5.5 0 0 1-.794 0l-2.368-3.158a5.5 5.5 0 0 0-2.962-2.962L3.155 12.4a.5.5 0 0 1 0-.794l3.158-2.368a5.5 5.5 0 0 0 2.962-2.962l2.328-3.161z" />
    </svg>
  );
}

export default PricingModal;
