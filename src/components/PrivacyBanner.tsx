import React, { useState, useEffect } from 'react';
import { ShieldCheck, X, ArrowRight } from 'lucide-react';
import { BRAND_CONFIG } from '../assets/branding';

interface PrivacyBannerProps {
  onOpenPrivacy: () => void;
}

export const PrivacyBanner: React.FC<PrivacyBannerProps> = ({ onOpenPrivacy }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem('bluema_privacy_accepted');
    if (accepted !== 'true') {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleQuickAccept = () => {
    const nowStr = new Date().toLocaleDateString('en-GB');
    localStorage.setItem('bluema_privacy_accepted', 'true');
    localStorage.setItem('bluema_privacy_accepted_date', nowStr);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 inset-x-4 sm:inset-x-auto sm:right-6 sm:max-w-md z-40 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-950/95 backdrop-blur-xl text-white p-4 sm:p-4.5 rounded-2xl border border-white/20 shadow-[0_15px_40px_rgba(0,0,0,0.7)] flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white text-slate-950 flex items-center justify-center font-black text-xs shrink-0">
              B
            </div>
            <div>
              <h4 className="text-xs font-bold font-brand tracking-wide text-white uppercase">
                {BRAND_CONFIG.name} Customer Privacy
              </h4>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                We safeguard your delivery coordinates and orders under authenticated warranty standards.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-white/10">
          <a
            href="/privacy"
            className="flex-1 py-2 px-2 text-center text-[11px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-white/10"
            title="Open Standalone Privacy Policy"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="flex-1 py-2 px-2 text-center text-[11px] font-semibold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-colors cursor-pointer border border-white/10"
            title="Open Standalone Terms of Purchase"
          >
            Terms
          </a>
          <button
            onClick={handleQuickAccept}
            className="flex-1 py-2 px-3 text-center text-[11px] font-extrabold text-slate-950 bg-white hover:bg-slate-100 rounded-xl transition-all cursor-pointer shadow-md active:scale-95 flex items-center justify-center gap-1.5"
          >
            <span>Accept</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
