import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  Sparkles,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '../../store';
import {
  closeAuthModal,
  setAuthModalView,
  registerUser,
  verifyEmail,
  loginUser,
  resendCode,
  clearAuthMessages,
} from '../../store/authSlice';

export const AuthModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const {
    isAuthModalOpen,
    authModalView,
    pendingEmail,
    isLoading,
    error,
    successMessage,
    devCodeHint,
  } = useAppSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
  }, [pendingEmail]);

  useEffect(() => {
    let timer: any;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  if (!isAuthModalOpen) return null;

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await dispatch(registerUser({ email, password, fullName }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    await dispatch(loginUser({ email, password }));
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    const verifyTargetEmail = pendingEmail || email;
    if (!verifyTargetEmail || otpCode.length !== 6) return;
    await dispatch(verifyEmail({ email: verifyTargetEmail, code: otpCode }));
  };

  const handleResend = async () => {
    const targetEmail = pendingEmail || email;
    if (!targetEmail || resendCooldown > 0) return;
    setResendCooldown(30);
    await dispatch(resendCode(targetEmail));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-3xl border border-white/12 bg-[#12121a] p-7 shadow-[0_0_60px_rgba(255,107,53,0.18)]">
        
        {/* Close Button */}
        <button
          onClick={() => dispatch(closeAuthModal())}
          className="absolute right-5 top-5 rounded-full p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff6b35] to-[#e64a19] shadow-[0_0_20px_rgba(255,107,53,0.4)] mb-3">
            <Sparkles className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">
            {authModalView === 'login'
              ? 'Welcome Back'
              : authModalView === 'register'
              ? 'Create Developer Account'
              : 'Verify Your Email'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {authModalView === 'verify'
              ? 'Enter the 6-digit code sent via smtplib to activate model access.'
              : 'Enterprise access to Claude Sonnet 4.6 & Gemini 2.5 Flash autonomous swarms.'}
          </p>
        </div>

        {/* Alerts & Dev Hints */}
        {error && (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-400 flex items-start gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-start gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Dev Mode Simulation Hint Banner */}
        {devCodeHint && authModalView === 'verify' && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-300">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <ShieldCheck className="h-3.5 w-3.5" /> Dev-Mode Code (Auto-Simulated):
            </div>
            <button
              onClick={() => setOtpCode(devCodeHint)}
              className="font-mono text-sm bg-black/40 px-2 py-1 rounded border border-amber-500/40 text-amber-200 hover:bg-black/60 font-bold"
            >
              Fill Code: {devCodeHint}
            </button>
          </div>
        )}

        {/* TAB: LOGIN */}
        {authModalView === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@company.com"
                  className="w-full rounded-2xl border border-white/12 bg-[#0c0c10] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-2xl border border-white/12 bg-[#0c0c10] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-orange-glow w-full mt-2 rounded-full py-3 text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              {isLoading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="text-center pt-3 border-t border-white/8 text-xs text-slate-400">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthMessages());
                  dispatch(setAuthModalView('register'));
                }}
                className="text-[#ff8c5a] font-bold hover:underline ml-1"
              >
                Register
              </button>
            </div>
          </form>
        )}

        {/* TAB: REGISTER */}
        {authModalView === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Sarah Connor"
                  className="w-full rounded-2xl border border-white/12 bg-[#0c0c10] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@enterprise.io"
                  className="w-full rounded-2xl border border-white/12 bg-[#0c0c10] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-2xl border border-white/12 bg-[#0c0c10] py-3 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:border-[#ff6b35] focus:outline-none focus:ring-1 focus:ring-[#ff6b35]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-orange-glow w-full mt-2 rounded-full py-3 text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              {isLoading ? 'Creating Account...' : 'Create Account & Send Code'} <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <div className="text-center pt-3 border-t border-white/8 text-xs text-slate-400">
              Already registered?{' '}
              <button
                type="button"
                onClick={() => {
                  dispatch(clearAuthMessages());
                  dispatch(setAuthModalView('login'));
                }}
                className="text-[#ff8c5a] font-bold hover:underline ml-1"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* TAB: 6-DIGIT OTP VERIFY */}
        {authModalView === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="rounded-2xl bg-white/[0.03] p-3 text-xs text-slate-300 border border-white/8 text-center">
              Sent to: <span className="font-bold text-[#ff8c5a]">{pendingEmail || email}</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 text-center">
                Enter 6-Digit Email Verification Code
              </label>
              <input
                type="text"
                required
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full rounded-2xl border border-[#ff6b35]/50 bg-[#0a0a0e] py-3.5 text-center font-mono text-2xl font-bold tracking-[10px] text-[#ff8c5a] placeholder-slate-700 focus:border-[#ff6b35] focus:outline-none focus:ring-2 focus:ring-[#ff6b35]/30"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || otpCode.length !== 6}
              className="btn-orange-glow w-full rounded-full py-3 text-xs font-bold text-white flex items-center justify-center gap-2"
            >
              {isLoading ? 'Verifying...' : 'Verify Code & Activate Models'} <ShieldCheck className="h-4 w-4" />
            </button>

            <div className="flex items-center justify-between pt-3 border-t border-white/8 text-xs text-slate-400">
              <button
                type="button"
                onClick={() => dispatch(setAuthModalView('login'))}
                className="hover:text-white transition-colors"
              >
                Back to Login
              </button>

              <button
                type="button"
                onClick={handleResend}
                disabled={resendCooldown > 0 || isLoading}
                className="text-[#ff8c5a] font-bold hover:underline flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Code'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
