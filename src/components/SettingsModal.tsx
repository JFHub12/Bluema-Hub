import React from 'react';
import { Settings, Lock, ShieldCheck, Phone, Coins, Sparkles, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { BRAND_CONFIG } from '../assets/branding';
import { SUPPORT_PHONE } from '../services/api';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAdmin: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenAdmin,
  theme,
  onToggleTheme
}) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        className="w-full max-w-lg bg-slate-950 text-white rounded-3xl border border-slate-800 shadow-[0_20px_60px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[90vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="website-settings-title"
      >
        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-slate-900 bg-gradient-to-b from-slate-900/60 to-transparent flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-white via-slate-200 to-slate-300 text-slate-950 flex items-center justify-center shadow-md border border-white/60">
              <Settings className="w-5 h-5 text-slate-900" />
            </div>
            <div>
              <h2 id="website-settings-title" className="text-lg font-black font-brand tracking-tight text-white">
                Website Settings & Preferences
              </h2>
              <p className="text-[11px] text-slate-400">
                {BRAND_CONFIG.name} Store Control Center
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-5 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:bg-slate-700/60 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Admin Console Access Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-all pointer-events-none" />
            
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-b from-white via-slate-100 to-slate-300 text-slate-950 flex items-center justify-center shadow-lg border border-white/80 shrink-0">
                <Lock className="w-6 h-6 text-slate-900" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold text-white">Merchant Admin Console</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[9px] font-bold border border-emerald-500/30">
                    Secure
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Access inventory management, live customer orders, audit logs, and passkey configuration from any device using your stored secret password.
                </p>

                <button
                  onClick={() => {
                    onClose();
                    onOpenAdmin();
                  }}
                  className="mt-4 w-full py-3 px-4 rounded-xl bg-gradient-to-b from-white via-slate-100 to-slate-300 hover:from-white hover:via-slate-50 hover:to-slate-200 text-slate-950 font-extrabold text-xs shadow-[0_4px_16px_rgba(255,255,255,0.35),0_2px_4px_rgba(0,0,0,0.15),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.2)] border border-white/80 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-slate-900" />
                  <span>Open Admin Console</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-900" />
                </button>
              </div>
            </div>
          </div>

          {/* General Preferences Section */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
              General Preferences
            </h4>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  {theme === 'dark' ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-amber-400" />}
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Appearance Theme</h5>
                  <p className="text-[11px] text-slate-400">Current: {theme === 'dark' ? 'Luxury Dark Mode' : 'Clean Light Mode'}</p>
                </div>
              </div>
              <button
                onClick={onToggleTheme}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-colors cursor-pointer"
              >
                Switch to {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>

            {/* Currency & Region */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  <Coins className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Store Currency</h5>
                  <p className="text-[11px] text-slate-400">GH₵ - Ghanaian Cedi (GHS)</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-lg bg-slate-950 text-slate-400 text-xs font-mono border border-slate-800">
                Default
              </span>
            </div>

            {/* Support Hotline */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300">
                  <Phone className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-white">Customer Support Hotline</h5>
                  <p className="text-[11px] text-slate-400">{SUPPORT_PHONE}</p>
                </div>
              </div>
              <a
                href={`tel:${SUPPORT_PHONE.replace(/\s+/g, '')}`}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-950 text-xs font-extrabold transition-colors cursor-pointer"
              >
                Call Support
              </a>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-900/60 border-t border-slate-900 text-center flex items-center justify-between text-[11px] text-slate-500">
          <span>{BRAND_CONFIG.name} v2.6.0</span>
          <span>Multi-Device PWA Enabled</span>
        </div>
      </div>
    </div>
  );
};
