import React from 'react';
import { ArrowDown, Sparkles, Phone, ShieldCheck, Truck, Headphones } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL } from '../services/api';

interface HeroBannerProps {
  onSelectCategory: (category: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones') => void;
  selectedCategory: string;
  onOpenSupport: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  onSelectCategory,
  selectedCategory,
  onOpenSupport
}) => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Background ambient lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 relative z-10">
        {/* Welcome Kicker */}
        <div className="flex flex-col items-center text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-amber-300 font-medium backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Welcome to the Official Flagship Store</span>
          </div>

          {/* Designed Front View Name */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight font-brand text-white leading-none uppercase">
            BLUEMA HUB
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl">
            Welcome to <span className="text-white font-semibold">BLUEMA HUB</span> — your trusted certified ecosystem: <span className="text-white font-medium">Quality products. Better living.</span> Curated across <span className="text-slate-200">Clothing</span>, <span className="text-slate-200">Apple Replacement Parts</span>, <span className="text-slate-200">Diffusers</span>, and factory-sealed <span className="text-slate-200">Apple iPhones</span>.
          </p>

          {/* Support concierge line pill */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <a
              href={SUPPORT_PHONE_CALL}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all shadow-md hover:scale-[1.02]"
            >
              <Phone className="w-3.5 h-3.5 fill-slate-950" />
              <span>Customer Help: {SUPPORT_PHONE}</span>
            </a>
            <button
              onClick={onOpenSupport}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-white font-medium text-xs border border-slate-700 transition-colors"
            >
              <Headphones className="w-3.5 h-3.5 text-slate-400" />
              <span>24/7 Concierge Desk</span>
            </button>
          </div>
        </div>

        {/* The 4 Category Cards Showcase */}
        <div className="mt-12">
          <div className="text-center mb-6">
            <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
              Explore Our 4 Signature Shopping Departments
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {CATEGORIES.map((cat, index) => {
              const isActive = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id as any)}
                  className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden ${
                    isActive
                      ? 'bg-slate-800/90 border-amber-400/80 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-600 hover:bg-slate-800/50'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                      <span className="font-mono text-[11px] text-amber-400/90">0{index + 1}</span>
                      <span className="text-[11px] font-semibold">{cat.badge}</span>
                    </div>

                    <h3 className="text-lg font-bold text-white group-hover:text-amber-300 transition-colors">
                      {cat.name}
                    </h3>
                    <div className="text-xs font-medium text-amber-200/80 mt-0.5">
                      {cat.subtitle}
                    </div>

                    <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-semibold">
                    <span className={isActive ? 'text-amber-300' : 'text-slate-400 group-hover:text-white'}>
                      {isActive ? 'Currently Viewing' : 'Shop Department'}
                    </span>
                    <span className="text-slate-500 group-hover:translate-x-1 transition-transform">
                      →
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 3 Trust pillars */}
        <div className="mt-12 pt-8 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-400 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">100% Guaranteed Authentic</div>
              <div>Direct manufacturer sourcing, verified serial numbers & seal inspection.</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Express Doorstep Delivery</div>
              <div>Secure packaging with order confirmation and live dispatch rider tracking.</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400 shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-white">Dedicated Support 059 883 0932</div>
              <div>Reach a real concierge agent instantly via call or WhatsApp at any stage.</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
