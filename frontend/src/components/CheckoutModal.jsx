import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle, Shield, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

function CheckoutModal({ isOpen, onClose, planName, amount, isAnnual }) {
  const [step, setStep] = useState('input'); // input, processing, success
  const { currentUser } = useAuth();

  if (!isOpen) return null;

  const handlePay = async () => {
    // Razorpay Integration Logic
    const options = {
      key: "rzp_test_SlM1kL4RKoUEZj", // User provided test key
      amount: amount * 100, // Amount in paise
      currency: "INR",
      name: "Try-ON daily",
      description: `Upgrade to ${planName} Plan`,
      image: "/logo.jpg",
      handler: function (response) {
        // Payment success
        console.log("Razorpay Success:", response);
        setStep('success');
      },
      prefill: {
        name: currentUser?.name || "",
        email: currentUser?.email || "",
      },
      theme: {
        color: "#26a69a",
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response){
        alert("Payment Failed: " + response.error.description);
        setStep('input');
      });
      rzp.open();
    } catch (err) {
      console.error("Razorpay error:", err);
      alert("Failed to load payment gateway.");
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-gray-900/80 backdrop-blur-md">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {step === 'input' && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="p-6 md:p-8">
          {step === 'input' && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 text-center">
              <div className="flex items-center justify-center gap-2 mb-6 text-gray-800">
                <div className="w-8 h-8 bg-[#26a69a] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">R</span>
                </div>
                <span className="font-semibold text-lg tracking-tight">Razorpay Checkout</span>
              </div>
              
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">Upgrade your plan to</p>
                <h3 className="text-3xl font-bold text-gray-900">Try-ON {planName}</h3>
                <div className="mt-4 flex items-center justify-center gap-1">
                  <span className="text-4xl font-black text-gray-900">₹{amount}</span>
                  <span className="text-gray-500 text-sm">/{isAnnual ? 'year' : 'month'}</span>
                </div>
              </div>

              <div className="space-y-4 mb-8 text-left bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Plan</span>
                  <span className="font-semibold text-gray-900">{planName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Cycle</span>
                  <span className="font-semibold text-gray-900">{isAnnual ? 'Annual' : 'Monthly'}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-base">
                  <span className="text-gray-900">Total to pay</span>
                  <span className="text-[#26a69a]">₹{amount}</span>
                </div>
              </div>

              <button 
                onClick={handlePay}
                className="w-full bg-[#26a69a] hover:bg-[#208d82] text-white font-bold py-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                Pay Now with Razorpay
              </button>
              
              <div className="mt-6 flex items-center justify-center gap-2 text-gray-400 text-xs">
                <Shield className="w-4 h-4" /> Secure 256-bit SSL encrypted payments
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center animate-in zoom-in duration-300">
              <Loader2 className="w-12 h-12 text-[#26a69a] animate-spin mb-4" />
              <h3 className="text-lg font-semibold text-gray-900">Opening Secure Gateway...</h3>
            </div>
          )}

          {step === 'success' && (
            <div className="py-10 flex flex-col items-center justify-center animate-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 text-center text-sm">
                Your subscription has been updated. Happy styling!
              </p>
              <button 
                onClick={onClose}
                className="mt-8 w-full py-3 bg-gray-900 text-white font-bold rounded-xl"
              >
                Back to Studio
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CheckoutModal;
