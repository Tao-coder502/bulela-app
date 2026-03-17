import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GraduationCap, User, ArrowLeft, CheckCircle2 } from 'lucide-react';
import BulelaMascot from './BulelaMascot';

interface Props {
  onSelect: (role: 'student' | 'individual') => void;
}

const OnboardingScreen: React.FC<Props> = ({ onSelect }) => {
  const [step, setStep] = useState<'role' | 'access_code'>('role');
  const [accessCode, setAccessCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleRoleSelect = (role: 'student' | 'individual') => {
    if (role === 'student') {
      setStep('access_code');
    } else {
      onSelect('individual');
    }
  };

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newCode = [...accessCode];
    newCode[index] = value;
    setAccessCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = () => {
    setIsVerifying(true);
    // Simulate verification
    setTimeout(() => {
      setIsVerifying(false);
      onSelect('student');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-silk dark:bg-espresso flex flex-col items-center justify-center p-6 text-charcoal dark:text-silk transition-colors duration-500">
      <AnimatePresence mode="wait">
        {step === 'role' ? (
          <motion.div 
            key="role-step"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-8 max-w-2xl w-full"
          >
            <BulelaMascot mood="float" className="w-32 h-32 mx-auto" />
            
            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">Who are you?</h1>
              <p className="text-charcoal/40 dark:text-silk/40 font-bold uppercase tracking-widest text-sm">Help Bulela guide your journey</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 w-full">
              <button 
                onClick={() => handleRoleSelect('student')}
                className="group bg-white dark:bg-espresso-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-4 border-copper/10 hover:border-amber-copper transition-all text-left space-y-3 md:space-y-4 hover:scale-105 active:scale-95 shadow-xl"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-silk dark:bg-espresso rounded-xl md:rounded-2xl flex items-center justify-center text-amber-copper group-hover:bg-amber-copper group-hover:text-white transition-colors">
                  <GraduationCap className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black uppercase italic">Student</h3>
                  <p className="text-xs md:text-sm font-bold text-charcoal/60 dark:text-silk/60">Learn for school and track grades with your class.</p>
                </div>
              </button>

              <button 
                onClick={() => handleRoleSelect('individual')}
                className="group bg-white dark:bg-espresso-card p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-4 border-copper/10 hover:border-amber-copper transition-all text-left space-y-3 md:space-y-4 hover:scale-105 active:scale-95 shadow-xl"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-silk dark:bg-espresso rounded-xl md:rounded-2xl flex items-center justify-center text-amber-copper group-hover:bg-amber-copper group-hover:text-white transition-colors">
                  <User className="w-6 h-6 md:w-8 md:h-8" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black uppercase italic">Individual</h3>
                  <p className="text-xs md:text-sm font-bold text-charcoal/60 dark:text-silk/60">Learn for travel, work, or heritage at your own pace.</p>
                </div>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="access-code-step"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="text-center space-y-8 max-w-md w-full"
          >
            <button 
              onClick={() => setStep('role')}
              className="flex items-center gap-2 text-charcoal/40 dark:text-silk/40 font-black uppercase tracking-widest text-xs hover:text-amber-copper transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>

            <div className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter italic uppercase">School Access</h1>
              <p className="text-charcoal/40 dark:text-silk/40 font-bold uppercase tracking-widest text-sm">Enter your 6-digit class code</p>
            </div>

            <div className="flex justify-between gap-1 md:gap-2">
              {accessCode.map((digit, i) => (
                <input
                  key={i}
                  id={`code-${i}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(i, e.target.value)}
                  className="w-10 h-14 md:w-12 md:h-16 bg-white dark:bg-espresso-card border-2 md:border-4 border-copper/10 rounded-xl md:rounded-2xl text-center text-xl md:text-2xl font-black text-amber-copper focus:border-amber-copper focus:outline-none transition-all shadow-lg"
                />
              ))}
            </div>

            <button 
              onClick={handleVerify}
              disabled={accessCode.some(d => !d) || isVerifying}
              className={`w-full py-5 rounded-3xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 ${
                accessCode.every(d => d) 
                  ? 'bg-amber-copper text-white shadow-xl shadow-amber-copper/20 border-b-4 border-copper-dark hover:scale-105 active:scale-95' 
                  : 'bg-copper/10 text-charcoal/20 cursor-not-allowed'
              }`}
            >
              {isVerifying ? (
                <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 className="w-6 h-6" />
                  Verify Code
                </>
              )}
            </button>

            <p className="text-[10px] font-bold text-charcoal/40 dark:text-silk/40 uppercase tracking-widest">
              Don't have a code? Ask your teacher for the Bulela Access Key.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingScreen;
