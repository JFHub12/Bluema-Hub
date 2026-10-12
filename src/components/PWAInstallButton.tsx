import React, { useState } from 'react';
import { Smartphone, Share2, Check, X, Sparkles, ExternalLink, Download, Laptop, Copy } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'header' | 'mobile' | 'floating' | 'banner' | 'settings';
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'header',
  className = ''
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // If app is already installed and running standalone, suppress prompt (unless in settings)
  if (isInstalled && variant !== 'settings') {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setIsInstalling(true);
      try {
        const installed = await install();
        if (!installed) {
          setShowGuideModal(true);
        }
      } catch {
        setShowGuideModal(true);
      } finally {
        setIsInstalling(false);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  const handleOpenDedicatedWindow = () => {
    try {
      window.open(window.location.href, '_blank', 'noopener,noreferrer');
    } catch {
      window.location.href = window.location.href;
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // fallback
    }
  };

  // Render button based on variant
  const renderTrigger = () => {
    if (variant === 'mobile') {
      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl bg-slate-950 text-white font-semibold text-xs transition-all hover:bg-slate-900 cursor-pointer shadow-sm active:scale-[0.99] ${className}`}
        >
          <div className="flex items-center gap-2.5">
            <img src="/icon.svg" alt="BLUEMA Icon" className="w-4 h-4 rounded object-contain shrink-0" />
            <span className="font-bold">Install BLUEMA HUB App</span>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 bg-white/10 px-2 py-0.5 rounded-full">
            {isInstallable ? 'Direct' : isIOS ? 'iOS' : 'PWA'}
          </span>
        </button>
      );
    }

    if (variant === 'settings') {
      if (isInstalled) {
        return (
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>PWA Installed & Running Standalone</span>
          </div>
        );
      }

      return (
        <button
          onClick={handleInstallClick}
          disabled={isInstalling}
          className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-b from-white via-slate-100 to-slate-300 hover:from-white hover:via-slate-50 hover:to-slate-200 text-slate-950 font-extrabold text-xs shadow-md border border-white/80 transition-all cursor-pointer active:scale-95 ${className}`}
        >
          <Download className="w-3.5 h-3.5 text-slate-950" />
          <span>Install BLUEMA App</span>
        </button>
      );
    }

    // Default 'header' or inline trigger
    return (
      <button
        onClick={handleInstallClick}
        disabled={isInstalling}
        title="Install BLUEMA HUB as Progressive Web App"
        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white hover:bg-slate-100 text-slate-950 border border-slate-200 transition-all cursor-pointer shadow-sm active:scale-95 ${className}`}
      >
        <img src="/icon.svg" alt="BLUEMA Icon" className="w-4 h-4 rounded object-contain shrink-0" />
        <span className="hidden sm:inline font-bold">Install App</span>
        <span className="sm:hidden font-bold">App</span>
      </button>
    );
  };

  return (
    <>
      {renderTrigger()}

      {/* Universal PWA Install Modal (covers Chromium native prompt, iOS Safari, desktop popout) */}
      {showGuideModal && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGuideModal(false);
          }}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-slate-950 p-6 shadow-2xl border border-slate-800 text-white relative max-h-[92vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-black border border-slate-700 flex items-center justify-center shadow-lg relative overflow-hidden shrink-0">
                  <span className="text-white text-lg font-black font-sans">B</span>
                  <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-transparent pointer-events-none" />
                </div>
                <div>
                  <h3 className="text-sm font-black tracking-tight text-white flex items-center gap-2">
                    <span>Install BLUEMA HUB</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                      PWA
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">Dedicated Window • 100% Offline Catalog Access</p>
                </div>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="Close installation guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Action: If native install is supported, offer 1-click trigger */}
            {isInstallable && (
              <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-blue-950/40 via-slate-900 to-slate-900 border border-blue-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-white">Direct Installation Ready</h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Your browser supports one-click app installation.</p>
                  </div>
                  <button
                    onClick={async () => {
                      const res = await install();
                      if (res) setShowGuideModal(false);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    Install Now
                  </button>
                </div>
              </div>
            )}

            {/* Device Specific Guidance */}
            <div className="mt-4 space-y-3 text-xs text-slate-300">
              {isIOS ? (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      1
                    </div>
                    <div>
                      <p className="font-bold text-white">Tap the Safari Share Button</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Tap the <Share2 className="w-3.5 h-3.5 inline text-blue-400 mx-0.5" /> Share icon in the bottom Safari toolbar.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      2
                    </div>
                    <div>
                      <p className="font-bold text-white">Select &quot;Add to Home Screen&quot;</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Scroll down the share sheet and select <strong>Add to Home Screen</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 font-bold text-xs">
                      3
                    </div>
                    <div>
                      <p className="font-bold text-white">Confirm by Tapping &quot;Add&quot;</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        BLUEMA HUB appears on your iPhone/iPad home screen with the official B icon.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Desktop Chrome, Edge, and Mac Safari Guide */}
                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <Laptop className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Desktop Chrome or Microsoft Edge</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Look for the <strong>Install App icon (⊕ or ⬇)</strong> on the right end of the address bar, or click <strong>Menu (⋮) → Save and share → Install BLUEMA HUB</strong>.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <ExternalLink className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-white">Launch in Dedicated Window</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        If running inside an embedded preview or frame, pop out into a clean window to access the browser&apos;s native install prompt directly.
                      </p>
                      <button
                        onClick={handleOpenDedicatedWindow}
                        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-semibold border border-slate-700 transition-colors cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Pop Out to Full Window</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-2xl bg-slate-900/90 border border-slate-800">
                    <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <Smartphone className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-white">Android Mobile Devices</p>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Tap the Chrome menu (⋮) at top right and choose <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* PWA Perks Grid */}
            <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Offline Shopping Mode</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>Zero Address Bar Clutter</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-indigo-400" />
                <span>Immediate Launch</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-850 flex items-center gap-2 text-slate-300">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                <span>Encrypted Client Storage</span>
              </div>
            </div>

            {/* Footer action buttons */}
            <div className="mt-5 flex items-center gap-2.5">
              <button
                onClick={handleCopyLink}
                className="flex-1 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Direct App Link'}</span>
              </button>
              <button
                onClick={() => setShowGuideModal(false)}
                className="py-2.5 px-5 rounded-xl bg-white hover:bg-slate-100 text-slate-950 font-extrabold text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
