import React, { useState, useEffect, useRef } from 'react';
import { auth } from '../lib/firebaseClient';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithPhoneNumber, 
  RecaptchaVerifier 
} from 'firebase/auth';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Smartphone, 
  CheckCircle2, 
  AlertCircle, 
  KeyRound, 
  Chrome, 
  Send,
  Loader2,
  Lock,
  ArrowRight
} from 'lucide-react';
import { GlassCard } from './GlassCard';

interface AlvonAuthProps {
  onAuthSuccess?: (user: any) => void;
}

export const AlvonAuth: React.FC<AlvonAuthProps> = ({ onAuthSuccess }) => {
  const [authMethod, setAuthMethod] = useState<'google' | 'phone'>('google');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationId, setVerificationId] = useState<any>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [countdown, setCountdown] = useState(0);
  
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);

  // Countdown timer for resending OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch (e) {
          console.error("Recaptcha cleanup error:", e);
        }
      }
    };
  }, [recaptchaVerifier]);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      setSuccessMsg(`Welcome back, ${result.user.displayName || 'Alvon User'}!`);
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
    } catch (err: any) {
      console.error("Google Sign-In Error:", err);
      // Fallback/detailed error formatting
      if (err.code === 'auth/popup-blocked') {
        setError("Sign-in popup was blocked by your browser. Please enable popups or try Phone OTP.");
      } else if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in Firebase Console. Showing mock login bypass instead.");
        // Demo bypass for preview
        setTimeout(() => {
          triggerMockLogin("Google Admin User", "+91 99999 88888");
        }, 1200);
      } else {
        setError(err.message || "Failed to authenticate via Google.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Setup Recaptcha Verifier
  const initRecaptcha = () => {
    if (recaptchaVerifier) return recaptchaVerifier;
    
    try {
      // Hidden Recaptcha
      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'invisible',
        callback: () => {
          console.log("Recaptcha solved successfully");
        },
        'expired-callback': () => {
          setError("reCAPTCHA session expired. Please send the code again.");
        }
      });
      setRecaptchaVerifier(verifier);
      return verifier;
    } catch (err: any) {
      console.error("Error initializing RecaptchaVerifier:", err);
      return null;
    }
  };

  // Send Phone OTP Code
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber || phoneNumber.length < 8) {
      setError("Please enter a valid phone number with country code (e.g., +919876543210)");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const verifier = initRecaptcha();
      if (!verifier) {
        throw new Error("Unable to initialize security checks (reCAPTCHA).");
      }

      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setVerificationId(confirmation);
      setSuccessMsg("Verification code sent! Please check your SMS messages.");
      setCountdown(60); // 1 minute cooldown
    } catch (err: any) {
      console.error("SMS Sending Error:", err);
      if (err.code === 'auth/invalid-phone-number') {
        setError("The provided phone number is invalid. Ensure it includes country prefix.");
      } else if (err.code === 'auth/captcha-check-failed' || err.code === 'auth/too-many-requests') {
        setError("Security checks failed or too many attempts. Initiating mock verification code bypass instead.");
        // Demo bypass setup
        setTimeout(() => {
          setVerificationId({ 
            confirm: async (code: string) => {
              if (code === '123456') {
                return { user: { displayName: "Alvon Phone Member", phoneNumber, uid: "mock-uid-phone" } };
              }
              throw new Error("Invalid verification code (Demo code is: 123456)");
            }
          });
          setSuccessMsg("Demo SMS Sent! Enter code '123456' to proceed.");
        }, 1200);
      } else {
        setError(err.message || "Failed to send verification SMS.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP code
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Please enter a valid 6-digit confirmation code.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (!verificationId) {
        throw new Error("No active verification request found. Please request a code.");
      }

      const result = await verificationId.confirm(verificationCode);
      setSuccessMsg("Successfully verified phone authentication!");
      if (onAuthSuccess) {
        onAuthSuccess(result.user);
      }
    } catch (err: any) {
      console.error("OTP Verification Error:", err);
      setError(err.message || "Invalid security code. Please check and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Mock Login bypass for environment testing/fallback
  const triggerMockLogin = (name: string, phone: string) => {
    setError(null);
    setSuccessMsg("Success! (Simulated Security Credentials Active)");
    if (onAuthSuccess) {
      onAuthSuccess({
        uid: `demo-uid-${Date.now()}`,
        displayName: name,
        phoneNumber: phone,
        email: "demo.user@alvon.in"
      });
    }
  };

  return (
    <div className="w-full max-w-md mx-auto" id="alvon-secure-shell-auth">
      
      {/* Hidden Recaptcha container */}
      <div id="recaptcha-container" ref={recaptchaContainerRef} className="hidden"></div>

      <GlassCard className="bg-white/80 dark:bg-slate-900/90 border border-slate-100 dark:border-slate-800 p-8 shadow-2xl relative overflow-hidden" hoverEffect={false}>
        
        {/* Glow decorative graphics */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 dark:bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 mb-4 shadow-sm border border-rose-100/50 dark:border-rose-900/30">
            <Lock className="w-5.5 h-5.5" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 dark:text-slate-100 font-display tracking-tight">Access Secure Shell</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">
            Protect your wallet, direct recharges, and private files. Unlock 'My Alvon' Super App ecosystem.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100/80 dark:bg-slate-800 p-1 rounded-xl mb-6 border border-slate-200/20">
          <button
            onClick={() => { setAuthMethod('google'); setError(null); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'google'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Chrome className="w-4 h-4" />
            <span>Google Login</span>
          </button>
          
          <button
            onClick={() => { setAuthMethod('phone'); setError(null); }}
            className={`flex-1 flex items-center justify-center space-x-2 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              authMethod === 'phone'
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-xs'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>Phone OTP</span>
          </button>
        </div>

        {/* Display Feedback Message */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-400 rounded-xl text-xs flex items-start space-x-2.5 leading-normal"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
              <div className="flex-1">
                <span className="font-bold">Authentication Notice</span>
                <p className="mt-0.5">{error}</p>
                {/* Fallback mock bypass links inside notices for complete testability */}
                {error.includes("bypass") || error.includes("authorized") || error.includes("blocked") ? (
                  <button 
                    onClick={() => triggerMockLogin(authMethod === 'google' ? "Demo Alvon Ambassador" : "Demo Phone User", authMethod === 'phone' ? phoneNumber : "+91 98765 43210")}
                    className="mt-2 text-[10px] font-black text-rose-700 dark:text-rose-400 underline uppercase tracking-wider block hover:opacity-80"
                  >
                    Quick Bypass & Test Now
                  </button>
                ) : null}
              </div>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-5 p-3.5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-emerald-800 dark:text-emerald-400 rounded-xl text-xs flex items-start space-x-2.5 leading-normal"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
              <div className="flex-1">
                <span className="font-bold">Security Broadcast</span>
                <p className="mt-0.5">{successMsg}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Google Authentication Method View */}
        {authMethod === 'google' && (
          <div className="space-y-4">
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-3 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/60 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Chrome className="w-4.5 h-4.5" />
              )}
              <span>Continue with Google</span>
            </button>

            <div className="relative flex py-3 items-center">
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-slate-400 font-mono uppercase tracking-widest">Demo Vault</span>
              <div className="flex-grow border-t border-slate-100 dark:border-slate-800"></div>
            </div>

            <button
              onClick={() => triggerMockLogin("Jane Alvon User", "+91 98765 43210")}
              className="w-full py-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Use Guest Developer Sandbox Pass
            </button>
          </div>
        )}

        {/* Phone OTP Authentication Method View */}
        {authMethod === 'phone' && (
          <div>
            {!verificationId ? (
              <form onSubmit={handleSendCode} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono">Mobile Number (With Country Prefix)</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+919876543210"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-850 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-slate-200/65 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 font-mono font-bold transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2.5 py-3 bg-rose-600 hover:bg-rose-700 disabled:bg-rose-600/60 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Request OTP verification</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 font-mono">Verification Passcode</label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter 6-digit code"
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-850 text-xs text-slate-800 dark:text-slate-100 placeholder-slate-400 border border-slate-200/65 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-rose-500/10 focus:border-rose-500 tracking-widest font-mono text-center font-bold transition-all"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center space-x-2 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-600/60 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ArrowRight className="w-4 h-4" />
                  )}
                  <span>Validate Credentials</span>
                </button>

                <div className="text-center mt-3">
                  <button
                    type="button"
                    disabled={countdown > 0}
                    onClick={() => setVerificationId(null)}
                    className="text-[10px] font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {countdown > 0 ? `Resend Code in ${countdown}s` : "Change Mobile Number"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </GlassCard>
    </div>
  );
};
