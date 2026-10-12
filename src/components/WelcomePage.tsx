import React from 'react';
import { ArrowRight, ShoppingBag, ShieldCheck, Sparkles, Smartphone, ArrowUpRight } from 'lucide-react';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';
import { User } from '../services/api';

interface WelcomePageProps {
  onNavigateToAbout: () => void;
  onNavigateToShop: (category?: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones') => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenSupport: () => void;
  onOpenShare: () => void;
  currentUser: User | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme?: 'dark' | 'light';
}

export const WelcomePage: React.FC<WelcomePageProps> = ({
  onNavigateToAbout,
  onNavigateToShop,
  onOpenAuth,
  onOpenSupport,
  currentUser,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex flex-col justify-between animate-in fade-in duration-300 transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-slate-950'
    }`}>
      
      {/* 1. HERO SECTION (Blueprint Panel 1: HOMEPAGE) */}
      <section className={`relative min-h-[580px] sm:min-h-[660px] flex items-center overflow-hidden border-b transition-colors ${
        isDark ? 'border-white/10' : 'border-slate-200'
      }`}>
        
        {/* Full Visibility Background Picture (No White Backdrop Wash in Light Mode) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center sm:bg-right bg-no-repeat"
          style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
        />
        
        {/* Sleek, translucent dark gradient mask preserving complete background image visibility while providing crisp text contrast */}
        <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/85 via-black/55 to-transparent sm:via-black/35" />

        {/* Hero Content Left Aligned */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-16 sm:py-24">
          <div className="max-w-xl space-y-6">
            
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-6xl font-black font-brand tracking-tight uppercase text-white drop-shadow-md">
                {BRAND_CONFIG.name}
              </h1>
              <p className="text-lg sm:text-2xl font-medium tracking-wide text-slate-100 drop-shadow-sm">
                {BRAND_CONFIG.tagline}
              </p>
            </div>

            {/* Direct CTA: SHOP NOW */}
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <button
                onClick={() => onNavigateToShop('all')}
                className="px-8 py-3.5 font-black text-xs sm:text-sm tracking-widest uppercase rounded-none transition-all flex items-center gap-3 cursor-pointer group active:scale-95 shadow-md bg-white hover:bg-slate-100 text-slate-950 shadow-[0_4px_25px_rgba(255,255,255,0.25)]"
              >
                <span>SHOP NOW</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </button>

              <button
                onClick={onNavigateToAbout}
                className="px-6 py-3.5 font-bold text-xs sm:text-sm tracking-wider uppercase border transition-all cursor-pointer bg-black/30 hover:bg-black/50 text-white border-white/40 backdrop-blur-xs"
              >
                Our Charter
              </button>
            </div>

            {!currentUser && (
              <p className="text-xs font-medium pt-2 text-slate-200 drop-shadow-sm">
                New to {BRAND_CONFIG.name}?{' '}
                <button
                  onClick={() => onOpenAuth('register')}
                  className="underline cursor-pointer font-bold text-white hover:text-slate-200"
                >
                  Create member account for instant checkout
                </button>
              </p>
            )}
          </div>
        </div>
      </section>

      {/* 2. THE 4 DEPARTMENTS GRID (Blueprint Panel 1: 4 Cards Underneath Hero) */}
      <section className={`py-16 sm:py-20 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-200 ${
        isDark ? 'bg-black border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto space-y-8">
          
          <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b pb-5 ${
            isDark ? 'border-white/10' : 'border-slate-200'
          }`}>
            <div>
              <span className={`text-[11px] font-bold uppercase tracking-widest ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Curated Departments
              </span>
              <h2 className={`text-2xl sm:text-3xl font-black font-brand tracking-tight uppercase mt-1 ${
                isDark ? 'text-white' : 'text-slate-950'
              }`}>
                Explore The Collections
              </h2>
            </div>
            <button
              onClick={() => onNavigateToShop('all')}
              className={`text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                isDark ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
              }`}
            >
              <span>View Full Catalog</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4 Cards Grid - Background pictures 100% visible with zero white film */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                id: 'cloth' as const,
                title: 'CLOTHING',
                desc: 'Simple styles. Everyday wear.',
                img: BRAND_ASSETS.clothingCatImg
              },
              {
                id: 'accessories' as const,
                title: 'APPLE PARTS',
                desc: 'GX Grade & OEM screens, batteries, tools.',
                img: BRAND_ASSETS.applePartsCatImg
              },
              {
                id: 'diffuser' as const,
                title: 'DIFFUSERS',
                desc: 'Ambient room fragrances & luxury oils.',
                img: BRAND_ASSETS.diffuserCatImg
              },
              {
                id: 'iphones' as const,
                title: 'IPHONES',
                desc: 'Brand new & UK Used Pro Max & Pro models.',
                img: BRAND_ASSETS.iphonesCatImg
              }
            ].map(cat => (
              <div 
                key={cat.id}
                onClick={() => onNavigateToShop(cat.id)}
                className={`group relative h-[380px] sm:h-[420px] rounded-none overflow-hidden cursor-pointer transition-all border ${
                  isDark
                    ? 'bg-slate-950 border-white/15 hover:border-white/50'
                    : 'bg-slate-900 border-slate-300 hover:border-slate-500 shadow-md hover:shadow-xl'
                }`}
              >
                {/* Product Background Picture clearly visible */}
                <img 
                  src={cat.img} 
                  alt={cat.title}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 opacity-95 group-hover:opacity-100"
                />
                {/* Clear contrast gradient at bottom only, without white haze */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
                
                <div className="absolute bottom-6 left-6 right-6 space-y-1">
                  <h3 className="text-xl font-black font-brand tracking-wider uppercase text-white">
                    {cat.title}
                  </h3>
                  <p className="text-xs font-medium pb-2 text-slate-200">
                    {cat.desc}
                  </p>
                  <div className="text-xs font-bold text-white flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    <span>Shop Now</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. TRUST & LOGISTICS BAR */}
      <section className={`py-10 px-4 sm:px-6 lg:px-8 border-b transition-colors duration-200 ${
        isDark ? 'bg-slate-950 border-white/10' : 'bg-white border-slate-200'
      }`}>
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isDark ? 'bg-white/10 text-white border-white/15' : 'bg-slate-100 text-slate-950 border-slate-200'
            }`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>100% Genuine Quality</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Authentic parts & verified Apple hardware</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isDark ? 'bg-white/10 text-white border-white/15' : 'bg-slate-100 text-slate-950 border-slate-200'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>Accra & Nationwide Delivery</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>2-4 business days express courier tracking</p>
            </div>
          </div>

          <div className="flex items-center gap-4 justify-center sm:justify-start">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
              isDark ? 'bg-white/10 text-white border-white/15' : 'bg-slate-100 text-slate-950 border-slate-200'
            }`}>
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h4 className={`text-sm font-bold uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>Direct Concierge Desk</h4>
              <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Call / WhatsApp {BRAND_CONFIG.supportPhone}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
