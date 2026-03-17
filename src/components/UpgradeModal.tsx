import React, { useState } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useBulelaStore } from '../store/useBulelaStore';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { getToken } = useAuth();
  const { user: clerkUser } = useUser();
  const { user, setUser, createCheckoutSession, openCustomerPortal, languageDNA } = useBulelaStore();
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'momo' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [momoStep, setMomoStep] = useState<'input' | 'pushing' | 'success'>('input');

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!clerkUser) return;
    setStatus('processing');
    await createCheckoutSession();
    // Redirect happens in the store action
  };

  const handleManage = async () => {
    setStatus('processing');
    await openCustomerPortal();
  };

  const simulateMomoPush = () => {
    if (!phoneNumber) return;
    setMomoStep('pushing');
    setTimeout(() => {
      handleUpgrade();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-bulela-green/60 backdrop-blur-md animate-in fade-in">
      <div className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl border-4 border-honey overflow-hidden relative flex flex-col md:flex-row">
        <button onClick={onClose} className="absolute top-6 right-6 text-gray-300 hover:text-candy-red transition-colors font-black z-10">✕</button>
        
        {/* Left Side: Tiers */}
        <div className="flex-1 p-8 border-b md:border-b-0 md:border-r border-honey/10 bg-cream/30">
          <div className="mb-8 flex items-center gap-4">
            <div className="w-12 h-10 rounded-lg overflow-hidden border-2 border-honey shadow-sm shrink-0">
              <img 
                src={`https://picsum.photos/seed/${languageDNA.id}/100/100`} 
                alt={languageDNA.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-2xl font-black text-bulela-green uppercase tracking-tighter leading-none">Unlock <span className="text-honey">Unlimited</span></h2>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">{languageDNA.name} Mastery Awaits</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Pro Tier */}
            <div className="p-5 rounded-2xl border-2 border-candy-green bg-candy-green/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-candy-green text-white text-[8px] font-black px-2 py-1 rounded-bl-lg uppercase tracking-widest">RECOMMENDED</div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-black text-candy-green uppercase tracking-tight">Bulela Pro</h3>
                <span className="text-xs font-black text-candy-green">K50 / MO</span>
              </div>
              <ul className="text-[11px] font-bold text-bulela-green space-y-2">
                <li className="flex items-center gap-2"><span>💎</span> Master all {languageDNA.name} Noun Classes with AI</li>
                <li className="flex items-center gap-2"><span>🎓</span> Take the Official Bulela {languageDNA.name} Proficiency Exam</li>
                <li className="flex items-center gap-2"><span>🧠</span> Personalized Practice sessions for {languageDNA.name} difficult words</li>
                <li className="flex items-center gap-2"><span>🎙️</span> Advanced AI Voice Feedback</li>
              </ul>
            </div>

            {/* Basic Tier */}
            <div className="p-4 rounded-2xl border-2 border-gray-100 bg-gray-50/50 opacity-60">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-black text-gray-400 uppercase tracking-tight">Basic</h3>
                <span className="text-xs font-black text-gray-400">FREE</span>
              </div>
              <ul className="text-[10px] font-bold text-gray-400 space-y-1">
                <li>• Standard Lessons</li>
                <li>• Basic Progress Tracking</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Payment */}
        <div className="flex-1 p-8 text-center flex flex-col justify-center">
          {status === 'success' ? (
            <div className="py-12 space-y-4 animate-in zoom-in duration-500">
              <div className="text-6xl">🎉</div>
              <h2 className="text-3xl font-black text-bulela-green uppercase tracking-tighter">Success!</h2>
              <p className="text-gray-400 font-bold">You are now a PRO MEMBER.</p>
            </div>
          ) : momoStep === 'pushing' ? (
            <div className="py-12 space-y-6 animate-in fade-in">
              <div className="w-16 h-16 border-4 border-honey border-t-transparent rounded-full animate-spin mx-auto"></div>
              <div className="space-y-2">
                <h3 className="text-xl font-black text-bulela-green uppercase">Requesting PIN...</h3>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Check your device for the prompt</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="w-16 h-16 bg-honey rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg rotate-3">🪙</div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-black text-bulela-green uppercase tracking-tighter">Secure <span className="text-honey">Payment</span></h2>
                <p className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">Select your preferred method</p>
              </div>

              {user?.subscriptionTier === 'pro' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-candy-green/10 rounded-2xl border border-candy-green text-left">
                    <p className="text-[10px] font-black text-candy-green uppercase mb-1">Active Subscription</p>
                    <p className="text-xs font-bold text-bulela-green">You are currently a Pro member. You can manage your billing and subscription via the portal.</p>
                  </div>
                  <button 
                    onClick={handleManage}
                    disabled={status === 'processing'}
                    className="w-full btn-isometric shimmer-gold text-white border-honey-dark"
                  >
                    {status === 'processing' ? 'LOADING PORTAL...' : 'MANAGE SUBSCRIPTION'}
                  </button>
                </div>
              ) : !paymentMethod ? (
                <div className="space-y-3">
                  <button 
                    onClick={() => setPaymentMethod('card')}
                    className="w-full py-4 bg-bulela-green text-white font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 border-b-4 border-black"
                  >
                    <span>💳</span> PAY WITH CARD
                  </button>
                  
                  <div className="relative py-2">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-100"></div></div>
                    <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest text-gray-300"><span className="bg-white px-2">OR</span></div>
                  </div>

                  <button 
                    onClick={() => setPaymentMethod('momo')}
                    className="w-full py-4 bg-candy-yellow text-bulela-green font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center border-b-4 border-candy-orange"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">📱</span> MOBILE MONEY
                    </div>
                    <div className="flex gap-2">
                      <span className="text-[7px] bg-rose-600 text-white px-1.5 py-0.5 rounded font-black">AIRTEL</span>
                      <span className="text-[7px] bg-yellow-300 text-blue-900 px-1.5 py-0.5 rounded font-black">MTN</span>
                    </div>
                  </button>
                </div>
              ) : paymentMethod === 'card' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-cream rounded-2xl border border-honey/10 text-left">
                    <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Stripe Checkout</p>
                    <p className="text-xs font-bold text-bulela-green">You will be redirected to a secure Stripe page to complete your K50 payment.</p>
                  </div>
                  <button 
                    onClick={handleUpgrade}
                    disabled={status === 'processing'}
                    className="w-full btn-isometric shimmer-gold text-white border-honey-dark"
                  >
                    {status === 'processing' ? 'REDIRECTING...' : 'PROCEED TO CHECKOUT'}
                  </button>
                  <button onClick={() => setPaymentMethod(null)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-honey transition-colors">← Back</button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-2">Phone Number</label>
                    <input 
                      type="tel" 
                      placeholder="097 / 096 ..."
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full p-4 bg-cream rounded-2xl border-2 border-honey/10 focus:border-honey outline-none font-bold text-bulela-green"
                    />
                  </div>
                  <button 
                    onClick={simulateMomoPush}
                    disabled={!phoneNumber}
                    className="w-full py-4 bg-candy-yellow text-bulela-green font-black rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all border-b-4 border-candy-orange disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    SIMULATE PUSH
                  </button>
                  <button onClick={() => setPaymentMethod(null)} className="text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-honey transition-colors">← Back</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
