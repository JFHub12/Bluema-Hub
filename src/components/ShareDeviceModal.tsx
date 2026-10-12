import React, { useState } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  QrCode, 
  Laptop, 
  Phone, 
  ExternalLink, 
  Download, 
  MessageSquare,
  Globe,
  Sparkles
} from 'lucide-react';
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL } from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';

interface ShareDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SHAREABLE_APP_URL = "https://ais-pre-ydw7ig2snqifewwwnx7mf3-945991044130.europe-west2.run.app";

export const ShareDeviceModal: React.FC<ShareDeviceModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'link' | 'qr' | 'guide'>('link');

  if (!isOpen) return null;

  // Use the live public URL or current location
  const appUrl = typeof window !== 'undefined' && window.location.origin.includes('run.app')
    ? window.location.origin
    : SHAREABLE_APP_URL;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(appUrl);
      } else {
        const input = document.createElement('input');
        input.value = appUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${BRAND_CONFIG.name} - Quality products. Better living.`,
          text: `Shop verified clothing, ambient diffusers, Apple replacement parts, and iPhones on ${BRAND_CONFIG.name}.`,
          url: appUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(appUrl)}&color=0a0a0c&bgcolor=ffffff&margin=10`;
  const whatsappShareUrl = `https://wa.me/?text=${encodeURIComponent(`Check out the ${BRAND_CONFIG.name} official store: ${appUrl}`)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-300 overflow-hidden overscroll-none text-white">
      {/* Background Image using Official BLUEMA Hero Asset */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 opacity-35 pointer-events-none fixed"
        style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
      />

      {/* Futuristic Obsidian Card Container */}
      <div 
        className="relative w-full max-w-lg bg-slate-950/90 backdrop-blur-2xl rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-white/20 ring-1 ring-white/10 animate-in zoom-in-95 duration-300 max-h-[88vh] flex flex-col z-10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top glossy light refraction */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent shrink-0" />

        {/* Modal Header with BLUEMA Monogram Badge */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 flex items-center justify-between shrink-0 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-sm tracking-tighter shadow-md shrink-0">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black font-brand tracking-wider text-white uppercase">{BRAND_CONFIG.name}</span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-emerald-300 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/25">
                  Multi-Device Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Run seamlessly across iPhone, Android, iPad & Desktop
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all cursor-pointer shrink-0"
            aria-label="Close share dialog"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-slate-900/60 text-xs font-semibold shrink-0">
          <button
            onClick={() => setActiveTab('link')}
            className={`flex-1 py-3 border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'link' 
                ? 'border-white text-white bg-white/10 font-bold' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Store Link</span>
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-3 border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'qr' 
                ? 'border-white text-white bg-white/10 font-bold' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Scan QR Code</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`flex-1 py-3 border-b-2 transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'guide' 
                ? 'border-white text-white bg-white/10 font-bold' 
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Device Setup</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:bg-slate-800 [&::-webkit-scrollbar-thumb]:rounded-full flex-1">
          {activeTab === 'link' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Universal Public URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={appUrl}
                    className="flex-1 px-3.5 py-2.5 text-xs font-mono bg-slate-900 border border-slate-700 rounded-xl text-slate-200 focus:outline-none select-all"
                  />
                  <button
                    onClick={handleCopy}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 shadow-sm ${
                      copied 
                        ? 'bg-emerald-600 text-white' 
                        : 'bg-white text-slate-950 hover:bg-slate-100 font-black uppercase tracking-wider'
                    }`}
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-200" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <a
                  href={whatsappShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#25D366] hover:opacity-90 text-white text-xs font-bold transition-all shadow-sm"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send via WhatsApp</span>
                </a>

                <button
                  onClick={handleNativeShare}
                  className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer border border-white/10"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Native Share Menu</span>
                </button>
              </div>

              <div className="p-4 bg-slate-900/70 border border-white/10 rounded-2xl space-y-2">
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-slate-300" />
                  <span>Universal Touch & Desktop Compatibility:</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open this link in Safari, Chrome, Edge, or Samsung Internet on any phone, tablet, or PC. The store automatically caches resources for offline browsing and fast loading.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="space-y-4 text-center">
              <p className="text-xs text-slate-300">
                Point your iPhone or Android camera at the QR code to open the store instantly on your smartphone:
              </p>

              <div className="p-3.5 bg-white rounded-2xl inline-block shadow-lg border border-white/20">
                <img
                  src={qrCodeUrl}
                  alt={`QR Code for ${BRAND_CONFIG.name} store`}
                  className="w-52 h-52 mx-auto rounded-lg object-contain"
                />
              </div>

              <div className="text-xs font-mono text-slate-400 break-all px-4">
                {appUrl}
              </div>

              <div>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-bold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied URL!' : 'Copy Direct URL'}</span>
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                How to Install {BRAND_CONFIG.name} on Your Home Screen (PWA)
              </h4>

              <div className="space-y-3 text-xs">
                {/* iPhone / iOS */}
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-slate-200" />
                    <span>Apple iPhone & iPad (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1 leading-relaxed">
                    <li>Open this URL in <strong>Safari</strong> on your iPhone.</li>
                    <li>Tap the <strong>Share</strong> button (box with upward arrow) in the toolbar.</li>
                    <li>Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                    <li>Tap <strong>Add</strong>. The official {BRAND_CONFIG.name} icon will now live on your phone home screen!</li>
                  </ol>
                </div>

                {/* Android */}
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4 text-emerald-400" />
                    <span>Android (Google Chrome / Samsung Internet)</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-300 space-y-1 pl-1 leading-relaxed">
                    <li>Open this link in Chrome or Samsung Internet.</li>
                    <li>Tap the <strong>three dots menu (⋮)</strong> in the top-right corner.</li>
                    <li>Select <strong>&quot;Install App&quot;</strong> or <strong>&quot;Add to Home Screen&quot;</strong>.</li>
                    <li>Confirm installation. The app will launch fullscreen without browser bars.</li>
                  </ol>
                </div>

                {/* Desktop */}
                <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/10 space-y-1">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <Laptop className="w-4 h-4 text-blue-400" />
                    <span>Desktop PC / Mac (Chrome / Edge)</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    Click the <strong>Install</strong> icon in the browser address bar to launch {BRAND_CONFIG.name} in its own standalone desktop window.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Assistance contact */}
          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
            <span>Trouble opening on your phone?</span>
            <a
              href={SUPPORT_PHONE_CALL}
              className="font-bold text-white hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Call {SUPPORT_PHONE}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
