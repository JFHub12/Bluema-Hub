import React, { useState, useEffect } from 'react';
import { X, ShieldCheck, Check, Lock, FileText, Printer, CheckCircle2, AlertCircle } from 'lucide-react';
import { BRAND_CONFIG } from '../assets/branding';
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, SUPPORT_WHATSAPP } from '../services/api';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onAccept
}) => {
  const [hasAgreed, setHasAgreed] = useState(false);
  const [acceptedDate, setAcceptedDate] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('bluema_privacy_accepted');
    const savedDate = localStorage.getItem('bluema_privacy_accepted_date');
    if (saved === 'true') {
      setHasAgreed(true);
      setAcceptedDate(savedDate || 'Previously Accepted');
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
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

  const handleAcceptPolicy = () => {
    const nowStr = new Date().toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    localStorage.setItem('bluema_privacy_accepted', 'true');
    localStorage.setItem('bluema_privacy_accepted_date', nowStr);
    setHasAgreed(true);
    setAcceptedDate(nowStr);
    if (onAccept) onAccept();
    onClose();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-3xl bg-slate-950 border border-white/20 rounded-2xl sm:rounded-3xl shadow-2xl text-white flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="px-6 py-5 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-sm tracking-tighter shadow-md">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black font-brand uppercase tracking-wider text-white">
                  {BRAND_CONFIG.name} Privacy Policy
                </h2>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider">
                  Official Charter
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Customer Data Protection & Purchasing Terms · Updated {new Date().getFullYear()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/privacy"
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/10"
              title="Open Standalone Privacy Page"
            >
              <span>/privacy</span>
              <span className="text-[10px]">↗</span>
            </a>
            <a
              href="/terms"
              className="p-2 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold cursor-pointer border border-white/10"
              title="Open Standalone Terms Page"
            >
              <span>/terms</span>
              <span className="text-[10px]">↗</span>
            </a>
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors hidden sm:flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
              title="Print Policy"
            >
              <Printer className="w-4 h-4" />
              <span>Print</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 transition-all cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Policy Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:bg-slate-700/60 [&::-webkit-scrollbar-thumb]:rounded-full">
          
          {/* Status Alert if already accepted */}
          {hasAgreed && (
            <div className="p-3.5 bg-emerald-950/50 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <strong className="block text-emerald-200 font-bold">Privacy Policy Accepted</strong>
                <span className="text-emerald-300/80 text-[11px]">Your consent was recorded on {acceptedDate}.</span>
              </div>
            </div>
          )}

          {/* Section 1 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              1. Our Quality Charter & Identity
            </h3>
            <p>
              Welcome to <strong>{BRAND_CONFIG.name}</strong> (&quot;{BRAND_CONFIG.shortName}&quot;, &quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). We operate an authenticated e-commerce ecosystem in Ghana dedicated to four core lifestyle pillars: <strong>Clothing & Apparel</strong>, <strong>Apple Replacement Parts</strong> (GX Grade OLEDs, OEM batteries, flex tools), <strong>Luxury Diffusers & Aromatherapy</strong>, and <strong>iPhones</strong> (Sealed & UK Used certified devices).
            </p>
            <p>
              By accessing our platform or purchasing any products, you acknowledge and agree to the terms described in this Privacy Policy.
            </p>
          </div>

          {/* Section 2 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              2. Information We Collect & Why
            </h3>
            <p>
              To fulfill authenticated deliveries and prevent counterfeit risks, we collect only essential customer information:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Customer Account & Contact:</strong> Full name, telephone number, and email address for account creation, one-time passcode (OTP) security, and dispatch notifications.</li>
              <li><strong>Delivery Coordinates:</strong> Ghana Post Digital Address (e.g. GA-123-4567), street name, landmark, and city for white-glove courier dispatch.</li>
              <li><strong>Order History:</strong> Product items, selected variants (sizes, colors, storage tiers), and transaction records to honor device warranties and replacement windows.</li>
              <li><strong>Device & Session Tokens:</strong> Anonymized browser identifiers to sustain your shopping bag items and PWA offline caching.</li>
            </ul>
          </div>

          {/* Section 3 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-400" />
              3. Payment Security & Mobile Money Processing
            </h3>
            <p>
              We prioritize transaction security for all Ghanaian customers:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Mobile Money (MTN MoMo, Telecel Cash, AT Money):</strong> Handled via end-to-end encrypted merchant gateway protocols. You authorize every payment directly on your registered handset.</li>
              <li><strong>Card Transactions (Visa, Mastercard):</strong> Encrypted with industry-standard TLS 1.3 / 256-bit encryption. {BRAND_CONFIG.name} never stores raw CVV security codes or credit card PINs on local servers.</li>
              <li><strong>Cash On Delivery (COD):</strong> Available for select vetted orders within Accra metropolitan boundaries.</li>
            </ul>
          </div>

          {/* Section 4 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              4. Hardware Warranty & Device Verification
            </h3>
            <p>
              For Apple replacement parts and iPhones:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong>Apple OLED Screens & Parts:</strong> Covered under our 7-day test-and-inspection guarantee prior to permanent frame adhesion.</li>
              <li><strong>iPhones:</strong> All devices undergo rigorous IMEI blacklist checks, battery health diagnostics (85%+ on UK Used, 100% on Sealed), and iCloud unlock verification before handover.</li>
            </ul>
          </div>

          {/* Section 5 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400" />
              5. Member Registration Requirement
            </h3>
            <p>
              In accordance with our member-first charter, <strong>every customer must register and sign in to checkout</strong>. This ensures all dispatched orders are traced to verified buyers, protects courier safety, and prevents fraudulent chargebacks.
            </p>
          </div>

          {/* Section 6 */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-emerald-400" />
              6. Direct Concierge & Data Inquiries
            </h3>
            <p>
              You have the right to request access to, update, or delete your registered personal information at any time. For support or privacy questions, contact our desk:
            </p>
            <div className="p-3.5 bg-white/5 border border-white/10 rounded-xl space-y-1 text-slate-300">
              <div>Telephone Hotline: <a href={SUPPORT_PHONE_CALL} className="text-white font-bold hover:underline">{SUPPORT_PHONE}</a></div>
              <div>WhatsApp Concierge: <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:underline">Direct WhatsApp Chat</a></div>
            </div>
          </div>

        </div>

        {/* Footer with Acceptance Action */}
        <div className="p-5 sm:p-6 bg-white/5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="checkbox"
              id="privacyAcceptCheck"
              checked={hasAgreed}
              onChange={(e) => setHasAgreed(e.target.checked)}
              className="w-5 h-5 rounded border-white/20 bg-slate-900 text-white focus:ring-white cursor-pointer shrink-0"
            />
            <label htmlFor="privacyAcceptCheck" className="text-xs text-slate-300 select-none cursor-pointer">
              I have read, understood, and accept the <strong className="text-white">{BRAND_CONFIG.name}</strong> Privacy Policy & Terms.
            </label>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-transparent hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-white/20 transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleAcceptPolicy}
              disabled={!hasAgreed}
              className={`flex-1 sm:flex-none px-6 py-2.5 font-black text-xs uppercase tracking-widest rounded-xl transition-all cursor-pointer shadow-lg flex items-center justify-center gap-2 ${
                hasAgreed
                  ? 'bg-white hover:bg-slate-100 text-slate-950 active:scale-95'
                  : 'bg-white/20 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4" />
              <span>Accept & Confirm</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
