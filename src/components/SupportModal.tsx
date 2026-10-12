import React, { useState, useEffect } from 'react';
import { 
  Phone, 
  MessageSquare, 
  X, 
  Send, 
  Clock, 
  ShieldCheck, 
  CheckCircle2, 
  User, 
  HelpCircle,
  Headphones
} from 'lucide-react';
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, SUPPORT_WHATSAPP, ApiService } from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('Order / Payment Issue');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !message.trim()) return;
    setLoading(true);
    await ApiService.sendSupportTicket({ 
      name: name.trim(), 
      phone: phone.trim(), 
      category, 
      message: message.trim() 
    });
    setLoading(false);
    setSubmitted(true);
  };

  const handleReset = () => {
    setSubmitted(false);
    setName('');
    setPhone('');
    setMessage('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/85 backdrop-blur-lg animate-in fade-in duration-300 overflow-hidden overscroll-none text-white">
      {/* Background Image using Official BLUEMA Hero Asset */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 opacity-35 pointer-events-none fixed"
        style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
      />

      {/* Futuristic Card Container */}
      <div 
        className="relative w-full max-w-lg bg-slate-950/90 backdrop-blur-2xl rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.8)] overflow-hidden border border-white/20 ring-1 ring-white/10 animate-in zoom-in-95 duration-300 max-h-[88vh] flex flex-col z-10 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle top glossy light refraction */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/60 to-transparent shrink-0" />

        {/* Modal Header with BLUEMA Badge */}
        <div className="px-5 py-4 sm:px-6 sm:py-4.5 flex items-center justify-between shrink-0 border-b border-white/10 bg-white/5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-sm tracking-tighter shadow-md shrink-0">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black font-brand tracking-wider text-white uppercase">{BRAND_CONFIG.name}</span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-slate-300 px-2 py-0.5 rounded-full bg-white/10 border border-white/10">
                  Support Desk
                </span>
              </div>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Dedicated 24/7 Concierge & Priority Assistance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-full bg-white/5 hover:bg-white/15 transition-all cursor-pointer shrink-0"
            aria-label="Close support modal"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Modal Body with Sleek Native Scroll */}
        <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[calc(88vh-80px)] overscroll-contain">
          {/* Quick Direct Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
            <a
              href={SUPPORT_PHONE_CALL}
              className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-white group backdrop-blur-md"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-800/90 border border-white/15 text-slate-200 group-hover:text-white group-hover:border-white/30 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <Phone className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 group-hover:text-slate-300">
                  Call Direct Hotline
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white font-mono tracking-tight truncate">
                  {SUPPORT_PHONE}
                </div>
              </div>
            </a>

            <a
              href={SUPPORT_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/25 transition-all text-white group backdrop-blur-md"
            >
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105">
                <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-slate-400 group-hover:text-slate-300">
                  WhatsApp Concierge
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-white font-mono tracking-tight truncate">
                  {SUPPORT_PHONE}
                </div>
              </div>
            </a>
          </div>

          {submitted ? (
            <div className="bg-slate-900/80 border border-white/15 rounded-2xl p-6 text-center space-y-4 shadow-xl backdrop-blur-md animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-400/30 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.2)]">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-lg font-bold text-white tracking-tight">Support Ticket Received</h4>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed max-w-sm mx-auto">
                  Thank you, <strong className="text-white">{name}</strong>. Your inquiry has been routed to our concierge team. A specialist will reach out to <strong className="text-white font-mono">{phone}</strong> shortly.
                </p>
              </div>
              <div className="pt-2">
                <button
                  onClick={handleReset}
                  className="px-6 py-2.5 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer active:scale-95"
                >
                  Return to Store
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex items-center gap-3 pt-1">
                <div className="h-px bg-white/10 flex-1" />
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Or Send Us a Message
                </span>
                <div className="h-px bg-white/10 flex-1" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Samuel Mensah"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/25 bg-slate-900/70 text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    Phone Number <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 059 883 0932"
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/25 bg-slate-900/70 text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  Issue Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/25 bg-slate-900/90 text-white outline-none transition-all shadow-inner cursor-pointer"
                >
                  <option value="Order / Payment Issue" className="bg-slate-900 text-white">Order / Payment Issue</option>
                  <option value="iPhone Specifications & Warranty" className="bg-slate-900 text-white">iPhone Specifications & Warranty</option>
                  <option value="Diffuser Scents & Operation" className="bg-slate-900 text-white">Diffuser Scents & Operation</option>
                  <option value="Clothing Sizing & Exchange" className="bg-slate-900 text-white">Clothing Sizing & Exchange</option>
                  <option value="Delivery & Tracking" className="bg-slate-900 text-white">Delivery & Tracking</option>
                  <option value="General Question" className="bg-slate-900 text-white">General Question</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  Describe Your Issue <span className="text-rose-400">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us what you need help with..."
                  className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-white/15 focus:border-white/40 focus:ring-1 focus:ring-white/25 bg-slate-900/70 text-white placeholder-slate-500 outline-none transition-all shadow-inner resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400 pt-0.5">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-300" /> Average response: &lt; 5 mins
                </span>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-300" /> Direct human specialist
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-300 hover:from-white hover:to-slate-200 text-slate-950 font-bold text-sm rounded-xl transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] disabled:opacity-50 cursor-pointer active:scale-[0.99]"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    Submitting Support Ticket...
                  </span>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Support Request
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
