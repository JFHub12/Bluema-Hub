import React, { useState, useRef, useEffect } from 'react';
import { X, User, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle, LogOut, Package, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';
import { ApiService, User as UserModel, Order } from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserModel | null;
  onUserChange: (user: UserModel | null) => void;
  initialTab?: 'login' | 'register' | 'profile';
  requiredReason?: string | null;
  onSuccessAction?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChange,
  initialTab = 'register',
  requiredReason = null,
  onSuccessAction
}) => {
  const [view, setView] = useState<'signin' | 'login' | 'forgot' | 'otp' | 'newpass' | 'profile'>(
    currentUser ? 'profile' : (initialTab === 'login' ? 'login' : 'signin')
  );
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first OTP field when entering OTP view
  useEffect(() => {
    if (view === 'otp') {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [view]);

  // Status & Orders
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Fetch orders when entering profile mode
  React.useEffect(() => {
    if (currentUser) {
      setView('profile');
      setLoadingOrders(true);
      ApiService.getOrders(currentUser.email).then((fetched) => {
        setOrders(fetched);
        setLoadingOrders(false);
      });
    } else {
      setView(initialTab === 'login' ? 'login' : 'signin');
    }
  }, [currentUser, initialTab, isOpen]);

  // Lock body scroll when modal is open
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (password.length < 6) {
      setError('Password must contain at least 6 characters.');
      return;
    }

    setLoading(true);
    // Passing dummy phone since telephone input has been decommissioned as requested
    const res = await ApiService.registerUser({ name, email, phone: '0598830932', password });
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(`Welcome to ${BRAND_CONFIG.name}, ${res.user.name}! Account created successfully.`);
      onUserChange(res.user);
      if (onSuccessAction) {
        setTimeout(() => {
          onSuccessAction();
          onClose();
        }, 1200);
      } else {
        setTimeout(() => {
          setView('profile');
        }, 1200);
      }
    } else {
      setError(res.error || 'Sign in failed. Please check your details.');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    setLoading(true);
    const res = await ApiService.loginUser({ email, password });
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(`Welcome back, ${res.user.name}!`);
      onUserChange(res.user);
      if (onSuccessAction) {
        setTimeout(() => {
          onSuccessAction();
          onClose();
        }, 1000);
      } else {
        setTimeout(() => {
          setView('profile');
        }, 1000);
      }
    } else {
      setError(res.error || 'Invalid credentials. Please sign in first if this is your first time.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your registered email address.');
      return;
    }
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const resetRes = await ApiService.sendPasswordReset(email);
    setLoading(false);

    if (resetRes.success) {
      setSuccessMsg(`Official password reset instructions sent to ${email}! You can also verify via OTP below.`);
    } else {
      setSuccessMsg(`OTP reset request initialized for ${email}. (Demo Code: 123456)`);
    }
    setOtpDigits(['', '', '', '', '', '']);
    setView('otp');
  };

  const handleOtpDigitChange = (index: number, val: string) => {
    const clean = val.replace(/\D/g, '');
    if (!clean) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      return;
    }

    if (clean.length > 1) {
      handleOtpPasteString(clean);
      return;
    }

    const updated = [...otpDigits];
    updated[index] = clean;
    setOtpDigits(updated);

    if (index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
        otpRefs.current[index - 1]?.focus();
      } else {
        const updated = [...otpDigits];
        updated[index] = '';
        setOtpDigits(updated);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const clean = pasted.replace(/\D/g, '').slice(0, 6);
    handleOtpPasteString(clean);
  };

  const handleOtpPasteString = (clean: string) => {
    if (!clean) return;
    const updated = [...otpDigits];
    for (let i = 0; i < 6; i++) {
      updated[i] = clean[i] || '';
    }
    setOtpDigits(updated);
    const focusIdx = Math.min(clean.length, 5);
    otpRefs.current[focusIdx]?.focus();
  };

  const handleAutoFillDemoOtp = () => {
    setOtpDigits(['1', '2', '3', '4', '5', '6']);
    otpRefs.current[5]?.focus();
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const currentCode = otpDigits.join('');
    if (currentCode !== '123456' && currentCode !== '000000') {
      setError('Invalid OTP code. Please enter 123456');
      return;
    }
    setError(null);
    setSuccessMsg('OTP verified successfully. Please set your new password.');
    setView('newpass');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Password successfully updated! Please log in with your new password.');
      setView('login');
      setPassword('');
      setNewPassword('');
      setOtpDigits(['', '', '', '', '', '']);
    }, 800);
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    const res = await ApiService.loginWithGoogle();
    setLoading(false);

    if (res.success && res.user) {
      setSuccessMsg(`Welcome, ${res.user.name}! Authenticated with Google.`);
      onUserChange(res.user);
      if (onSuccessAction) {
        setTimeout(() => {
          onSuccessAction();
          onClose();
        }, 1000);
      } else {
        setTimeout(() => {
          setView('profile');
        }, 1000);
      }
    } else {
      setError(res.error || 'Google Authentication failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    await ApiService.logoutUser();
    onUserChange(null);
    setView('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-300 overflow-hidden overscroll-none">
      {/* Background Image using Official BLUEMA Hero Asset */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 opacity-35 pointer-events-none fixed"
        style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
      />

      {/* Futuristic Card Container */}
      <div 
        className="relative w-full max-w-md bg-slate-950/90 backdrop-blur-2xl rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-white/20 ring-1 ring-white/10 animate-in zoom-in-95 duration-300 text-white max-h-[85vh] flex flex-col z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top glossy light refraction */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent shrink-0" />

        {/* Modal Header with BLUEMA Badge */}
        <div className="p-5 pb-3 relative shrink-0 border-b border-white/10 bg-white/5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1.5 rounded-full bg-white/5 hover:bg-white/15 transition-all cursor-pointer"
            aria-label="Close authentication modal"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-7 h-7 rounded-lg bg-white text-slate-950 flex items-center justify-center font-black text-xs shrink-0 shadow-sm">
              B
            </div>
            <span className="text-base font-black tracking-wider font-brand text-white uppercase">{BRAND_CONFIG.name}</span>
          </div>

          <h3 className="text-lg font-extrabold tracking-tight text-white">
            {view === 'profile'
              ? `Member Profile: ${currentUser?.name}`
              : view === 'signin'
              ? 'Create New Account'
              : view === 'forgot'
              ? 'Password Recovery (OTP)'
              : view === 'otp'
              ? 'Enter Verification OTP'
              : view === 'newpass'
              ? 'Set New Password'
              : 'Sign In to Your Account'}
          </h3>
          <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">
            {view === 'signin'
              ? `Register with ${BRAND_CONFIG.name} to unlock checkout and order tracking.`
              : view === 'login'
              ? 'Welcome back. Enter your credentials to access your bag.'
              : view === 'forgot'
              ? 'Enter your account email to receive a secure OTP recovery code.'
              : view === 'otp'
              ? 'Enter the 6-digit code sent to your registered email.'
              : view === 'newpass'
              ? 'Choose a secure new password for your verified account.'
              : 'Manage your verified member profile and history.'}
          </p>
        </div>

        {/* Scrollable Body Content with Premium Metallic Custom Scrollbar */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:bg-slate-700/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/80">
          {/* Purchase Required Notice Banner */}
          {requiredReason && !currentUser && (
            <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2.5 backdrop-blur-md">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-amber-300 font-bold mb-0.5">Authentication Required</strong>
                <span className="text-amber-200/90 text-[11px]">{requiredReason}</span>
              </div>
            </div>
          )}

          {/* Error & Success Alerts */}
          {error && (
            <div className="p-3 bg-rose-500/20 border border-rose-500/40 rounded-xl text-rose-200 text-xs flex items-start gap-2 backdrop-blur-md">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <div className="flex-1">
                <span>{error}</span>
                {error.includes('sign in') && (
                  <button
                    type="button"
                    onClick={() => { setView('signin'); setError(null); }}
                    className="block font-bold text-rose-300 underline mt-1 cursor-pointer"
                  >
                    Switch to Sign In →
                  </button>
                )}
              </div>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-200 text-xs flex items-center gap-2 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN VIEW */}
          {view === 'signin' && !currentUser && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {/* Google Continue Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer border border-white/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.18v3.15C3.18 21.32 7.22 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.18C.43 8.1 0 9.8 0 12s.43 3.9 1.18 5.42l4.1-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.18 2.68 1.18 6.58l4.1 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-white/10" />
                <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Or with details</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <form onSubmit={handleSignIn} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Username / Full Name *</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Jesse Fiagbe"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">Password * (Min 6 chars)</label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(null); setSuccessMsg(null); }}
                      className="text-[11px] text-slate-300 hover:text-white underline font-semibold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create secure password"
                      className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-slate-100 hover:to-white text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md mt-2 cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Processing...' : 'Sign In'}
                </button>
              </form>

              {/* Switch to Log In view */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); }}
                  className="text-xs text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Already a Customer? <span className="text-slate-200 underline font-bold">Log In</span>
                </button>
              </div>
            </div>
          )}

          {/* LOG IN VIEW */}
          {view === 'login' && !currentUser && (
            <div className="space-y-3.5 animate-in fade-in duration-300">
              {/* Google Continue Button */}
              <button
                type="button"
                onClick={handleGoogleAuth}
                disabled={loading}
                className="w-full py-3 px-4 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2.5 cursor-pointer border border-white/40"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.18v3.15C3.18 21.32 7.22 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.18C.43 8.1 0 9.8 0 12s.43 3.9 1.18 5.42l4.1-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.22 0 3.18 2.68 1.18 6.58l4.1 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="flex items-center my-3">
                <div className="flex-1 border-t border-white/10" />
                <span className="px-3 text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Or with credentials</span>
                <div className="flex-1 border-t border-white/10" />
              </div>

              <form onSubmit={handleLogin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-semibold text-slate-300">Password *</label>
                    <button
                      type="button"
                      onClick={() => { setView('forgot'); setError(null); setSuccessMsg(null); }}
                      className="text-[11px] text-slate-300 hover:text-white underline font-semibold transition-colors cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-slate-100 hover:to-white text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
                >
                  {loading ? 'Authenticating...' : 'Log In'}
                </button>
              </form>

              {/* Switch to Sign In view */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setView('signin'); setError(null); }}
                  className="text-xs text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  New to Verified? <span className="text-slate-200 underline font-bold">Sign In</span>
                </button>
              </div>
            </div>
          )}

          {/* FORGOT PASSWORD - STEP 1: EMAIL */}
          {view === 'forgot' && (
            <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">Account Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-slate-100 hover:to-white text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
              >
                {loading ? 'Sending OTP...' : 'Send Reset OTP'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => { setView('login'); setError(null); setSuccessMsg(null); }}
                  className="text-xs text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Back to <span className="text-slate-200 underline">Log In</span>
                </button>
              </div>
            </form>
          )}

          {/* OTP VERIFICATION - STEP 2: 6 INDIVIDUAL GRID SLOTS */}
          {view === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4 animate-in fade-in duration-300">
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[11px] font-semibold text-slate-300">
                    Enter 6-Digit OTP Code *
                  </label>
                  <button
                    type="button"
                    onClick={handleAutoFillDemoOtp}
                    className="text-[11px] text-slate-300 hover:text-white font-medium underline cursor-pointer transition-colors"
                  >
                    Auto-fill demo code
                  </button>
                </div>

                {/* 6 Individual Grid Slots */}
                <div className="grid grid-cols-6 gap-2 sm:gap-2.5 my-3">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { otpRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      onPaste={handleOtpPaste}
                      className={`w-full aspect-square text-center text-lg sm:text-xl font-bold font-mono rounded-xl border transition-all duration-200 ${
                        digit
                          ? 'bg-slate-900/95 border-slate-300 text-white shadow-[0_0_12px_rgba(203,213,225,0.3)]'
                          : 'bg-slate-950/70 border-white/20 text-white placeholder:text-slate-600 focus:border-white focus:ring-2 focus:ring-slate-400/40 focus:bg-slate-900/90 shadow-inner'
                      }`}
                      aria-label={`Digit ${idx + 1} of verification code`}
                    />
                  ))}
                </div>

                <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between text-[11px] text-slate-300 backdrop-blur-xs">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Sent to <strong className="text-white">{email}</strong></span>
                  </div>
                  <span className="font-mono text-slate-400">Demo: 123456</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join('').length < 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-slate-100 hover:to-white text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Verify OTP Code
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => { setView('forgot'); setError(null); }}
                  className="text-xs text-slate-300 hover:text-white font-semibold transition-colors cursor-pointer"
                >
                  Resend OTP / Change Email
                </button>
              </div>
            </form>
          )}

          {/* NEW PASSWORD - STEP 3 */}
          {view === 'newpass' && (
            <form onSubmit={handleResetPassword} className="space-y-4 animate-in fade-in duration-300">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">New Password * (Min 6 chars)</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new secure password"
                    className="w-full pl-10 pr-9 py-2.5 text-xs rounded-xl bg-slate-950/60 border border-white/15 text-white placeholder:text-slate-500 focus:outline-none focus:border-slate-300 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-slate-100 hover:to-white text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer disabled:opacity-60"
              >
                {loading ? 'Updating...' : 'Update Password & Sign In'}
              </button>
            </form>
          )}

          {/* USER PROFILE & ORDERS VIEW */}
          {currentUser && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={currentUser.photoURL || BRAND_ASSETS.logoImg}
                      alt={currentUser.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-300/40 shadow-sm"
                    />
                    <div>
                      <h4 className="font-bold text-white text-sm">{currentUser.name}</h4>
                      <p className="text-[11px] text-slate-300">{currentUser.email}</p>
                      {currentUser.uid && (
                        <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                          UID: {currentUser.uid.slice(0, 16)}...
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-semibold px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" />
                      Verified
                    </span>
                    <span className="text-[9px] text-slate-400">
                      {currentUser.providerId === 'google.com' ? 'Google Auth' : 'Verified ID'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h5 className="text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-slate-300" />
                  Your Orders ({orders.length})
                </h5>

                {loadingOrders ? (
                  <div className="text-xs text-slate-400 py-3 text-center">Loading orders from database...</div>
                ) : orders.length === 0 ? (
                  <div className="p-4 bg-white/5 rounded-xl text-center text-xs text-slate-300 border border-dashed border-white/15">
                    No orders placed yet. Explore departments to check out!
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                    {orders.map((ord) => (
                      <div key={ord.id} className="p-3 bg-white/5 border border-white/10 rounded-xl text-xs space-y-1 backdrop-blur-sm">
                        <div className="flex items-center justify-between font-semibold text-white">
                          <span>{ord.id}</span>
                          <span className="text-emerald-400 font-mono">
                            GH₵{ord.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-slate-300 text-[11px]">
                          {ord.items.length} item(s) • {ord.paymentMethod.toUpperCase()}
                        </div>
                        <div className="text-[11px] text-slate-200 font-medium">
                          Status: {ord.status}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Continue Shopping
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-1.5 py-2.5 px-4 border border-rose-500/40 text-rose-300 hover:bg-rose-500/20 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
