import React, { useState } from 'react';
import { Smartphone, Share2, Check, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile' | 'floating';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If app is already installed and running standalone, suppress prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      await install();
    } finally {
      setIsInstalling(false);
    }
  };

  // Chromium / Android / Edge flow with intercepted beforeinstallprompt
  if (isInstallable) {
    if (variant === 'mobile') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 text-white font-semibold text-xs transition-all hover:bg-slate-900 cursor-pointer shadow-sm ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="BLUEMA Icon" className="w-4 h-4 rounded object-contain" />
            <span>Install BLUEMA HUB App</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
            PWA
          </span>
        </button>
      );
    }

    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Install BLUEMA HUB to home screen"
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-950 transition-all cursor-pointer shadow-sm active:scale-95 ${className}`}
      >
        <img src="/icon.svg" alt="BLUEMA Icon" className="w-4 h-4 rounded object-contain" />
        <span className="hidden sm:inline">Install App</span>
        <span className="sm:hidden">App</span>
      </button>
    );
  }

  // iOS Safari flow (WebKit requires manual Add to Home Screen via Share sheet)
  if (isIOS) {
    return (
      <>
        {variant === 'mobile' ? (
          <button
            onClick={() => setShowIOSGuide(true)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-900 font-semibold text-xs transition-all cursor-pointer ${className}`}
          >
            <div className="flex items-center gap-2.5">
              <img src="/icon.svg" alt="BLUEMA Icon" className="w-4 h-4 rounded object-contain" />
              <span>Install on iPhone / iPad</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">iOS</span>
          </button>
        ) : (
          <button
            onClick={() => setShowIOSGuide(true)}
            title="Install on iPhone / iPad Safari"
            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-slate-200 hover:border-slate-400 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer ${className}`}
          >
            <img src="/icon.svg" alt="BLUEMA Icon" className="w-4 h-4 rounded object-contain" />
            <span className="hidden sm:inline">Install on iOS</span>
            <span className="sm:hidden">iOS</span>
          </button>
        )}

        {/* Modal Guide for iOS Safari Users */}
        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-900">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-600">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold">Install BLUEMA HUB</h3>
                    <p className="text-[10px] text-slate-500">Fast home screen launch & offline access</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-3.5 text-xs text-slate-600">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    1
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Tap the Share Icon</p>
                    <p className="text-[11px] text-slate-500">
                      Located in the bottom toolbar in Safari (<Share2 className="w-3 h-3 inline text-blue-600" />).
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    2
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Select &quot;Add to Home Screen&quot;</p>
                    <p className="text-[11px] text-slate-500">
                      Scroll down in the action sheet and select <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-6 h-6 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 font-bold text-xs">
                    3
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">Tap &quot;Add&quot;</p>
                    <p className="text-[11px] text-slate-500">
                      BLUEMA HUB will now launch as a full-screen, high-performance standalone app.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-slate-900 text-white font-semibold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
