import React, { useState } from 'react';
import { ShoppingBag, User as UserIcon, Phone, Search, Menu, X, BookOpen, Home, MessageSquare } from 'lucide-react';
import { User, SUPPORT_PHONE, SUPPORT_PHONE_CALL, SUPPORT_WHATSAPP, BRAND_NAME } from '../services/api';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  currentUser: User | null;
  onOpenAuth: (initialTab?: 'login' | 'register' | 'profile') => void;
  onOpenSupport: () => void;
  onOpenCart?: () => void;
  cartCount?: number;
  activePage: 'welcome' | 'about' | 'shop' | 'cart';
  onNavigate: (page: 'welcome' | 'about' | 'shop' | 'cart', category?: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme?: 'dark' | 'light';
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onOpenAuth,
  onOpenSupport,
  onOpenCart,
  cartCount = 0,
  activePage,
  onNavigate,
  searchQuery,
  onSearchChange,
  theme = 'dark'
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);

  const isDark = theme === 'dark';

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate('shop');
      setShowSearchInput(false);
    }
  };

  return (
    <header className={`sticky top-0 z-40 transition-colors duration-200 backdrop-blur-xl border-b shadow-md ${
      isDark 
        ? 'bg-black/95 border-white/10 text-white shadow-black/50' 
        : 'bg-white/95 border-slate-200/90 text-slate-900 shadow-slate-900/5'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo - BLUEMA HUB */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('welcome')}
              className="text-left cursor-pointer focus:outline-none flex items-center gap-2.5 group"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm tracking-tighter shadow-md group-hover:scale-105 transition-transform ${
                isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
              }`}>
                B
              </div>
              <div className="flex flex-col">
                <span className={`text-lg sm:text-xl font-black tracking-widest font-brand uppercase transition-colors ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  {BRAND_NAME}
                </span>
                <span className={`text-[9px] tracking-wider font-medium -mt-1 hidden sm:block ${
                  isDark ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  Quality products. Better living.
                </span>
              </div>
            </button>
          </div>

          {/* Desktop Navigation Links: Home | Shop | About | Contact */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold uppercase tracking-wider">
            <button
              onClick={() => onNavigate('welcome')}
              className={`transition-colors cursor-pointer pb-1 ${
                activePage === 'welcome' 
                  ? (isDark ? 'text-white border-b-2 border-white font-bold' : 'text-slate-950 border-b-2 border-slate-950 font-bold')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
              }`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate('shop', 'all')}
              className={`transition-colors cursor-pointer pb-1 ${
                activePage === 'shop' 
                  ? (isDark ? 'text-white border-b-2 border-white font-bold' : 'text-slate-950 border-b-2 border-slate-950 font-bold')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
              }`}
            >
              Shop
            </button>
            <button
              onClick={() => onNavigate('about')}
              className={`transition-colors cursor-pointer pb-1 ${
                activePage === 'about' 
                  ? (isDark ? 'text-white border-b-2 border-white font-bold' : 'text-slate-950 border-b-2 border-slate-950 font-bold')
                  : (isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950')
              }`}
            >
              About
            </button>
            <button
              onClick={onOpenSupport}
              className={`transition-colors cursor-pointer pb-1 ${
                isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Icons: Search | Bag/Cart | User Account */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Inline search or toggle button */}
            {showSearchInput ? (
              <form onSubmit={handleSearchSubmit} className="relative flex items-center animate-in fade-in duration-200">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search catalog..."
                  autoFocus
                  className={`w-40 sm:w-56 pl-3 pr-8 py-1.5 text-xs rounded-xl focus:outline-none transition-all ${
                    isDark 
                      ? 'bg-slate-900 border border-slate-700 text-white focus:border-white' 
                      : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-slate-950'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSearchInput(false)}
                  className={`absolute right-2 text-xs ${isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'}`}
                >
                  ✕
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowSearchInput(true)}
                className={`p-2.5 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
                }`}
                aria-label="Search products"
                title="Search products"
              >
                <Search className="w-4 h-4" />
              </button>
            )}

            {/* Bag / Cart Icon Button with Count Badge */}
            <button
              onClick={onOpenCart}
              className={`relative p-2.5 rounded-xl transition-colors cursor-pointer ${
                activePage === 'cart'
                  ? (isDark ? 'bg-slate-900 text-white ring-1 ring-white/20' : 'bg-slate-100 text-slate-950 ring-1 ring-slate-300')
                  : (isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100')
              }`}
              aria-label="Open Cart"
              title="View Cart"
            >
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className={`absolute top-1 right-1 w-4 h-4 rounded-full font-black text-[9px] flex items-center justify-center shadow-md animate-in zoom-in-75 ${
                  isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
                }`}>
                  {cartCount}
                </span>
              )}
            </button>

            {/* PWA Install Button */}
            <div className="hidden sm:block">
              <PWAInstallButton variant="header" />
            </div>

            {/* User Account / Profile Button */}
            <button
              onClick={() => onOpenAuth(currentUser ? 'profile' : 'register')}
              className={`hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                currentUser
                  ? (isDark ? 'bg-slate-900 hover:bg-slate-800 text-white border border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border border-slate-200')
                  : (isDark ? 'bg-white hover:bg-slate-100 text-slate-950 font-bold shadow-md' : 'bg-slate-950 hover:bg-black text-white font-bold shadow-md')
              }`}
            >
              {currentUser?.photoURL ? (
                <img
                  src={currentUser.photoURL}
                  alt={currentUser.name}
                  className="w-4 h-4 rounded-full object-cover border border-slate-400/40"
                />
              ) : (
                <UserIcon className="w-3.5 h-3.5" />
              )}
              <span>
                {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
              </span>
            </button>

            {/* Mobile Hamburger Menu (< 768px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2.5 rounded-xl cursor-pointer transition-colors border ${
                isDark ? 'text-slate-300 hover:text-white hover:bg-slate-900 border-slate-800' : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100 border-slate-200'
              }`}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className={`md:hidden py-4 border-t space-y-3 animate-in fade-in duration-200 px-2 rounded-b-2xl shadow-xl ${
            isDark ? 'bg-black border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <button
                onClick={() => {
                  onNavigate('welcome');
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-left flex items-center gap-2 ${
                  activePage === 'welcome' 
                    ? (isDark ? 'bg-white text-slate-950 font-bold' : 'bg-slate-950 text-white font-bold') 
                    : (isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800')
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('shop', 'all');
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-left flex items-center gap-2 ${
                  activePage === 'shop' 
                    ? (isDark ? 'bg-white text-slate-950 font-bold' : 'bg-slate-950 text-white font-bold') 
                    : (isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800')
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Shop</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('about');
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-left flex items-center gap-2 ${
                  activePage === 'about' 
                    ? (isDark ? 'bg-white text-slate-950 font-bold' : 'bg-slate-950 text-white font-bold') 
                    : (isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800')
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>About</span>
              </button>

              <button
                onClick={() => {
                  onNavigate('cart');
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-left flex items-center justify-between ${
                  activePage === 'cart' 
                    ? (isDark ? 'bg-white text-slate-950 font-bold' : 'bg-slate-950 text-white font-bold') 
                    : (isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800')
                }`}
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Cart</span>
                </div>
                {cartCount > 0 && (
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                    activePage === 'cart'
                      ? (isDark ? 'bg-black text-white' : 'bg-white text-slate-950')
                      : (isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white')
                  }`}>
                    {cartCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => {
                  onOpenSupport();
                  setMobileMenuOpen(false);
                }}
                className={`p-3 rounded-xl text-left flex items-center gap-2 ${
                  isDark ? 'bg-slate-900 text-slate-200' : 'bg-slate-100 text-slate-800'
                }`}
              >
                <Phone className="w-4 h-4 text-emerald-500" />
                <span>Contact</span>
              </button>
            </div>

            <div className={`pt-2 border-t flex items-center justify-between ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth(currentUser ? 'profile' : 'register');
                }}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 ${
                  isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span>{currentUser ? `Account: ${currentUser.name}` : 'Register / Sign In'}</span>
              </button>
            </div>

            <div className="pt-1">
              <PWAInstallButton variant="mobile" />
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
