import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles, Smartphone, Check } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { PWAInstallButton } from './PWAInstallButton';

export const PWAInstallBanner: React.FC = () => {
  const { isInstalled } = usePWAInstall();
  const [isDismissed, setIsDismissed] = useState(true);

  useEffect(() => {
    // If running in standalone mode, never show banner
    if (isInstalled) {
      setIsDismissed(true);
      return;
    }

    // Check if dismissed in localStorage
    try {
      const dismissed = sessionStorage.getItem('bluema_pwa_banner_dismissed');
      if (!dismissed) {
        // Delay slightly for smooth initial entrance
        const timer = setTimeout(() => {
          setIsDismissed(false);
        }, 1200);
        return () => clearTimeout(timer);
      }
    } catch {
      setIsDismissed(false);
    }
  }, [isInstalled]);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('bluema_pwa_banner_dismissed', 'true');
    } catch {
      // ignore
    }
  };

  if (isDismissed || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-40 max-w-sm w-[calc(100vw-3rem)] animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-4 rounded-3xl bg-slate-950/95 text-white border border-slate-800 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-start gap-3">
          {/* Brand B Icon with glow */}
          <div className="w-10 h-10 rounded-2xl bg-black border border-slate-700 flex items-center justify-center text-white text-base font-black shadow-lg shrink-0 relative overflow-hidden">
            <span>B</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent pointer-events-none" />
          </div>

          <div className="flex-1 pr-6">
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black tracking-tight text-white">Install BLUEMA HUB App</h4>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                PWA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Access curated luxury products in a dedicated window with instant launch and offline access.
            </p>

            <div className="mt-3 flex items-center gap-2">
              <PWAInstallButton 
                variant="banner" 
                className="!py-1.5 !px-3 !text-xs !bg-white hover:!bg-slate-100 !text-slate-950 !font-bold" 
              />
              <button
                onClick={handleDismiss}
                className="py-1.5 px-2.5 rounded-xl text-slate-400 hover:text-slate-200 text-xs transition-colors cursor-pointer"
              >
                Later
              </button>
            </div>
          </div>

          {/* Dismiss cross button */}
          <button
            onClick={handleDismiss}
            className="absolute top-3 right-3 p-1 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
            aria-label="Dismiss install banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
