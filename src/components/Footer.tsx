import React from 'react';
import { Phone, MessageSquare, ShieldCheck } from 'lucide-react';
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, SUPPORT_WHATSAPP, BRAND_NAME, BRAND_TAGLINE } from '../services/api';

interface FooterProps {
  onNavigate: (page: 'welcome' | 'about' | 'shop', cat?: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones') => void;
  onOpenSupport: () => void;
  onOpenAuth: () => void;
  onOpenPrivacy?: () => void;
  onOpenSettings?: () => void;
  theme?: 'dark' | 'light';
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenSupport,
  onOpenAuth,
  onOpenPrivacy,
  onOpenSettings,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  return (
    <footer className={`transition-colors duration-200 border-t font-sans ${
      isDark 
        ? 'bg-slate-950 text-slate-300 border-white/10' 
        : 'bg-slate-100 text-slate-700 border-slate-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-6">
        
        {/* Top Row: Brand & Horizontal Contact Details */}
        <div className={`flex flex-col md:flex-row items-center justify-between gap-4 pb-6 border-b ${
          isDark ? 'border-slate-900' : 'border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs tracking-tighter shadow-md ${
              isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
            }`}>
              B
            </div>
            <div>
              <span className={`text-xl font-black font-brand tracking-widest uppercase ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                {BRAND_NAME}
              </span>
              <p className={`text-[10px] font-medium tracking-wide ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                {BRAND_TAGLINE}
              </p>
            </div>
          </div>

          {/* Contact Details Streamlined Horizontally */}
          <div className={`flex flex-wrap items-center justify-center gap-6 text-xs ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}>
            <div className="flex items-center gap-2">
              <Phone className={`w-3.5 h-3.5 ${isDark ? 'text-slate-300' : 'text-slate-700'}`} />
              <span>Hotline:</span>
              <a href={SUPPORT_PHONE_CALL} className={`font-extrabold hover:underline ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                {SUPPORT_PHONE}
              </a>
            </div>
            <span className={`hidden sm:inline ${isDark ? 'text-slate-800' : 'text-slate-300'}`}>·</span>
            <a
              href={SUPPORT_WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-500 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1.5"
            >
              <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Support
            </a>
            <span className={`hidden sm:inline ${isDark ? 'text-slate-800' : 'text-slate-300'}`}>·</span>
            <button onClick={onOpenSupport} className={`hover:underline cursor-pointer ${
              isDark ? 'hover:text-white' : 'hover:text-slate-950'
            }`}>
              Contact Desk
            </button>
          </div>
        </div>

        {/* Middle Row: The 4 Official Departments from Blueprint */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
            Departments:
          </div>

          <div className={`flex flex-wrap items-center justify-center gap-4 sm:gap-6 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            <button
              onClick={() => onNavigate('shop', 'cloth')}
              className={`transition-colors font-medium cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-slate-950'
              }`}
            >
              1. Clothing
            </button>
            <span className={isDark ? 'text-slate-800' : 'text-slate-300'}>·</span>
            <button
              onClick={() => onNavigate('shop', 'accessories')}
              className={`transition-colors font-medium cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-slate-950'
              }`}
            >
              2. Apple Parts
            </button>
            <span className={isDark ? 'text-slate-800' : 'text-slate-300'}>·</span>
            <button
              onClick={() => onNavigate('shop', 'diffuser')}
              className={`transition-colors font-medium cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-slate-950'
              }`}
            >
              3. Diffusers
            </button>
            <span className={isDark ? 'text-slate-800' : 'text-slate-300'}>·</span>
            <button
              onClick={() => onNavigate('shop', 'iphones')}
              className={`transition-colors font-medium cursor-pointer ${
                isDark ? 'hover:text-white' : 'hover:text-slate-950'
              }`}
            >
              4. iPhones
            </button>
          </div>
        </div>

        {/* Bottom Row: Legal & Copyright */}
        <div className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between text-[11px] gap-3 ${
          isDark ? 'border-slate-900 text-slate-500' : 'border-slate-200 text-slate-500'
        }`}>
          <div>
            © {new Date().getFullYear()} {BRAND_NAME}. {BRAND_TAGLINE}
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="/privacy"
              className={`underline cursor-pointer transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-slate-950'
              }`}
              title="View Standalone Customer Privacy Policy"
            >
              Privacy Policy
            </a>
            <span>·</span>
            <a 
              href="/terms"
              className={`underline cursor-pointer transition-colors ${
                isDark ? 'hover:text-white' : 'hover:text-slate-950'
              }`}
              title="View Standalone Terms of Purchase & Warranty Charter"
            >
              Terms of Purchase
            </a>
            <span>·</span>
            <button onClick={onOpenAuth} className={`underline cursor-pointer ${
              isDark ? 'hover:text-white' : 'hover:text-slate-950'
            }`}>
              Customer Account
            </button>
            {onOpenSettings && (
              <>
                <span>·</span>
                <button onClick={onOpenSettings} className={`underline cursor-pointer ${
                  isDark ? 'hover:text-white' : 'hover:text-slate-950'
                }`}>
                  Settings & Admin
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </footer>
  );
};
