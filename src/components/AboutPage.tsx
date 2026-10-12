import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  Phone, 
  UserPlus, 
  ShoppingBag, 
  CheckCircle2, 
  Shirt, 
  Flame, 
  Wrench, 
  Smartphone, 
  CreditCard, 
  Truck, 
  Lock,
  ChevronRight,
  Shield,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, SUPPORT_WHATSAPP, User, BRAND_NAME } from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';

interface AboutPageProps {
  onNavigateToShop: (category?: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones') => void;
  onNavigateToWelcome: () => void;
  onOpenAuth: (tab: 'login' | 'register') => void;
  onOpenSupport: () => void;
  currentUser: User | null;
  theme?: 'dark' | 'light';
}

export const AboutPage: React.FC<AboutPageProps> = ({
  onNavigateToShop,
  onNavigateToWelcome,
  onOpenAuth,
  onOpenSupport,
  currentUser,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`animate-in fade-in duration-300 min-h-screen transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-slate-950'
    }`}>
      
      {/* 1. CINEMATIC EDITORIAL HERO */}
      <section className="relative py-20 sm:py-28 px-4 sm:px-6 lg:px-8 border-b border-slate-200 dark:border-white/10 overflow-hidden text-white">
        {/* Full Visibility Background Picture (No White Backdrop Wash in Light Mode) */}
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center sm:bg-right scale-100"
          style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
        />
        {/* Crisp contrast overlay preserving background image visibility without white wash */}
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-black/80 via-black/55 to-black/80" />

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-5">
          {/* Brand Monogram & Kicker */}
          <div className="flex items-center justify-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm tracking-tighter shadow-md bg-white text-slate-950">
              B
            </div>
            <div className="text-left">
              <span className="text-xs font-bold tracking-widest uppercase font-brand text-white">
                {BRAND_CONFIG.name}
              </span>
              <p className="text-[10px] font-medium tracking-wide text-slate-300">
                Quality Charter · Verification Standards
              </p>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-brand tracking-tight uppercase text-white drop-shadow-md">
            What {BRAND_NAME} Is About
          </h1>

          <p className="text-sm sm:text-base leading-relaxed max-w-2xl mx-auto font-normal text-slate-200">
            A certified Ghanaian luxury and technology store founded to eliminate counterfeit hardware, poor fabrics, and unverified electronics. We deliver authentic craftsmanship across four specialized departments.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 text-xs">
            <button
              onClick={onNavigateToWelcome}
              className="transition-colors cursor-pointer flex items-center gap-1.5 py-2 px-3 rounded-lg text-slate-200 hover:text-white bg-white/10 hover:bg-white/20"
            >
              <span>←</span>
              <span>Home Welcome Message</span>
            </button>
            <span className="text-slate-400 hidden sm:inline">·</span>
            <button
              onClick={() => onNavigateToShop('all')}
              className="px-6 py-3 font-black text-xs tracking-wider uppercase rounded-none transition-all shadow-md flex items-center gap-2 cursor-pointer active:scale-95 bg-white hover:bg-slate-100 text-slate-950 shadow-[0_4px_25px_rgba(255,255,255,0.25)]"
            >
              <span>Shop All 4 Departments</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. REGISTRATION MANDATE STRIP */}
      <section className="bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-white/10 py-5 px-4 sm:px-6 lg:px-8 backdrop-blur-md transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-white/10 border border-slate-200 dark:border-white/15 flex items-center justify-center text-slate-900 dark:text-white shrink-0 mt-0.5 sm:mt-0 shadow-xs">
              <Lock className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div className="text-xs">
              <strong className="block text-sm font-bold text-slate-950 dark:text-white mb-0.5 font-brand tracking-wide">
                Purchasing Rule: Mandatory Member Registration
              </strong>
              <span className="text-slate-600 dark:text-slate-300">
                To guarantee authenticated warranty tracking, GX screen testing, and direct courier dispatch in Ghana, <strong>every client must register and sign in before completing any purchase</strong>.
              </span>
            </div>
          </div>

          {!currentUser ? (
            <button
              onClick={() => onOpenAuth('register')}
              className="px-5 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-bold text-xs uppercase tracking-wider rounded-none hover:bg-black dark:hover:bg-slate-100 transition-colors shrink-0 cursor-pointer shadow-md"
            >
              Register Account Now
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 rounded-xl shrink-0">
              <CheckCircle2 className="w-4 h-4" />
              <span>Signed in as {currentUser.name}</span>
            </div>
          )}
        </div>
      </section>

      {/* 3. SECTION 1: THE 4 CURATED DEPARTMENTS */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Our 4 Curated Departments
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-brand text-slate-950 dark:text-white tracking-tight uppercase">
            Carefully Selected. Rigorously Verified.
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {BRAND_CONFIG.name} focuses exclusively on four lifestyle and technical departments—ensuring verified authenticity, genuine warranties, and superior grade standards.
          </p>
        </div>

        {/* Department 01: Clothing */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md transition-colors">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <Shirt className="w-4 h-4 text-slate-950 dark:text-white" />
              <span>Department 01 · Clothing</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-brand text-slate-950 dark:text-white uppercase tracking-tight">
              Simple Styles. Everyday Wear.
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Our apparel line is centered on everyday heavyweight luxury essentials: 280 GSM combed cotton crewnecks, minimalist hoodies, tailored utilitarian pants, and zip windbreakers. Every garment is pre-shrunk, stitched with reinforced flatlock seams, and built for lasting comfort.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Heavyweight combed cotton, pre-shrunk anti-twist weaves</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Minimalist BLUEMA typographic insignia</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Tailored fits from S to XXL with exact measurements</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigateToShop('cloth')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-none hover:bg-black dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>Explore Clothing</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-950 border border-white/15 shadow-xl group">
            <img
              src={BRAND_ASSETS.clothingCatImg}
              alt="BLUEMA HUB Clothing Department"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/20">
              Department 01 · Clothing
            </div>
          </div>
        </div>

        {/* Department 02: Apple Parts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md transition-colors">
          <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-950 border border-slate-200 dark:border-white/15 shadow-xl group order-2 md:order-1">
            <img
              src={BRAND_ASSETS.applePartsCatImg}
              alt="BLUEMA HUB Apple Parts Department"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/20">
              Department 02 · Apple Parts
            </div>
          </div>
          <div className="space-y-4 order-1 md:order-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <Wrench className="w-4 h-4 text-slate-950 dark:text-white" />
              <span>Department 02 · Apple Parts</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-brand text-slate-950 dark:text-white uppercase tracking-tight">
              GX Grade & OEM Screens, Batteries & Tools
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              We stock certified replacement parts for iPhone displays and power cells. From GX Grade OLED screens with TrueTone reprogrammable EEPROM and oleophobic coatings, to zero-cycle Texas Instruments chip replacement batteries and sapphire camera lenses.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>GX Grade Super Retina XDR OLEDs with TrueTone EEPROM</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Zero-cycle OEM replacement batteries with 100% health readout</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Complete technician kits with UV adhesive & precision screwdrivers</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigateToShop('accessories')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-none hover:bg-black dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>Explore Apple Parts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Department 03: Diffusers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md transition-colors">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <Flame className="w-4 h-4 text-slate-950 dark:text-white" />
              <span>Department 03 · Diffusers</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-brand text-slate-950 dark:text-white uppercase tracking-tight">
              Ambient Room Fragrances & Aromatherapy
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Elevate living and working spaces with sculptural ultrasonic stone diffusers, smoked flacon reed diffusers, and therapeutic botanical extracts. Designed for ultra-silent operation, natural essential oil preservation, and sustained fragrance diffusion.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Nordic cast-stone & ceramic ultrasonic diffusers (&lt;20dB)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Smoked black glass reed sets with 90+ day continuous dispersion</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Pure French lavender, sandalwood, and white tea extracts</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigateToShop('diffuser')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-none hover:bg-black dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>Explore Diffusers</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-950 border border-slate-200 dark:border-white/15 shadow-xl group">
            <img
              src={BRAND_ASSETS.diffuserCatImg}
              alt="BLUEMA HUB Diffusers Department"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/20">
              Department 03 · Diffusers
            </div>
          </div>
        </div>

        {/* Department 04: iPhones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-slate-50 dark:bg-slate-900/60 p-6 sm:p-10 rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md transition-colors">
          <div className="relative rounded-xl overflow-hidden aspect-4/3 bg-slate-950 border border-slate-200 dark:border-white/15 shadow-xl group order-2 md:order-1">
            <img
              src={BRAND_ASSETS.iphonesCatImg}
              alt="BLUEMA HUB iPhones Department"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
            <div className="absolute bottom-3 left-3 text-[11px] font-bold text-white uppercase tracking-wider bg-slate-950/80 px-2.5 py-1 rounded-md border border-white/20">
              Department 04 · iPhones
            </div>
          </div>
          <div className="space-y-4 order-1 md:order-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
              <Smartphone className="w-4 h-4 text-slate-950 dark:text-white" />
              <span>Department 04 · iPhones</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black font-brand text-slate-950 dark:text-white uppercase tracking-tight">
              Brand New & UK Used Pro Max & Pro Models
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Factory sealed and rigorously certified UK Used Apple iPhone models. Each device is unlocked for all local Ghanaian and international carriers, pre-screened with genuine battery health verification, and backed by our replacement guarantee.
            </p>
            <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300">
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Available in Sealed New & Grade A+ UK Used conditions</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Factory unlocked: MTN, Telecel, AT & worldwide eSIM compatibility</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                <span>Verified battery health, Apple serial lookup, and official warranty</span>
              </li>
            </ul>
            <div className="pt-2">
              <button
                onClick={() => onNavigateToShop('iphones')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-950 text-white dark:bg-white dark:text-slate-950 text-xs font-black uppercase tracking-wider rounded-none hover:bg-black dark:hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <span>Explore iPhones</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </section>

      {/* 4. SECTION 2: HOW BUYING WORKS AT BLUEMA HUB (4-Step Workflow) */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 border-y border-slate-200 dark:border-white/10 bg-slate-100/90 dark:bg-slate-950/90 transition-colors">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center opacity-25 pointer-events-none"
          style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
        />

        <div className="relative z-10 max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Seamless Ordering Experience
            </span>
            <h2 className="text-3xl sm:text-4xl font-black font-brand text-slate-950 dark:text-white tracking-tight uppercase">
              How Buying Works at BLUEMA HUB
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Follow our simple, authenticated four-step process from member account to door dispatch.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "01",
                title: "Register First",
                desc: "Create your verified profile with phone and delivery address to enable genuine order guarantees."
              },
              {
                step: "02",
                title: "Select Options",
                desc: "Choose your size, color finish, or iPhone storage capacity, and add items directly to your shopping bag."
              },
              {
                step: "03",
                title: "Verified Payment",
                desc: "Pay securely via MTN Mobile Money, Telecel Cash, Card, or Apple Pay with instant authorization."
              },
              {
                step: "04",
                title: "Direct Delivery",
                desc: "Receive an official BLUEMA HUB digital receipt and express courier dispatch across Accra and nationwide."
              }
            ].map((s) => (
              <div 
                key={s.step} 
                className="bg-white dark:bg-slate-900/80 backdrop-blur-md p-6 rounded-2xl border border-slate-200 dark:border-white/15 flex flex-col justify-between shadow-md hover:border-slate-950 dark:hover:border-white/40 transition-colors"
              >
                <div>
                  <div className="w-10 h-10 rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950 flex items-center justify-center font-black text-sm mb-4 font-brand shadow-md">
                    {s.step}
                  </div>
                  <h4 className="font-bold text-base text-slate-950 dark:text-white uppercase tracking-wider font-brand">{s.title}</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SECTION 3: CONCIERGE HOTLINE & PRIORITY ASSISTANCE */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-b from-white via-slate-200 to-slate-400 text-slate-950 flex items-center justify-center mx-auto shadow-lg border border-slate-300 transition-transform hover:scale-105">
          <Phone className="w-8 h-8 text-slate-900" />
        </div>

        <div className="space-y-2">
          <span className="inline-block text-[11px] font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400 px-3 py-1 bg-slate-100 dark:bg-white/10 rounded-full border border-slate-200 dark:border-white/15">
            Always Here For You · 24/7 Concierge
          </span>
          <h3 className="text-2xl sm:text-3xl font-black font-brand text-slate-950 dark:text-white uppercase tracking-tight">
            Having Any Questions? Contact {BRAND_CONFIG.supportPhone}
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto leading-relaxed">
            Need advice on screen compatibility, iPhone specs, sizing, or express delivery coordinates? Call or WhatsApp our Accra concierge desk directly.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          <a
            href={SUPPORT_PHONE_CALL}
            className="px-6 py-3.5 rounded-none bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black text-xs uppercase tracking-wider hover:bg-black dark:hover:bg-slate-100 transition-colors flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-white dark:text-slate-950" />
            <span>Call Hotline: {SUPPORT_PHONE}</span>
          </a>

          <a
            href={SUPPORT_WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-none bg-[#25D366] text-white font-black text-xs uppercase tracking-wider hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg cursor-pointer"
          >
            <span>WhatsApp Support</span>
          </a>

          <button
            onClick={onOpenSupport}
            className="px-6 py-3.5 rounded-none bg-slate-100 hover:bg-slate-200 text-slate-900 dark:bg-slate-900 dark:hover:bg-slate-800 dark:text-white font-bold text-xs uppercase tracking-wider transition-colors border border-slate-300 dark:border-white/20 cursor-pointer"
          >
            Open Ticket Modal
          </button>
        </div>

        {/* Final CTA Strip */}
        <div className="pt-10 border-t border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => onNavigateToShop('all')}
            className="px-8 py-4 bg-slate-950 text-white dark:bg-white dark:text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider rounded-none hover:bg-black dark:hover:bg-slate-100 transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-white dark:text-slate-950" />
            <span>Ready to Shop the Collections →</span>
          </button>

          {!currentUser && (
            <button
              onClick={() => onOpenAuth('register')}
              className="px-8 py-4 bg-transparent text-slate-950 dark:text-white hover:bg-slate-100 dark:hover:bg-white/10 font-bold text-xs sm:text-sm uppercase tracking-wider rounded-none transition-all border border-slate-300 dark:border-white/30 flex items-center gap-2 cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-slate-950 dark:text-white" />
              <span>Register First (Required)</span>
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
