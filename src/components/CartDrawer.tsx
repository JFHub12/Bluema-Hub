import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowRight, 
  Phone, 
  ShieldCheck, 
  Lock, 
  UserPlus, 
  Tag, 
  Check, 
  CheckCircle2, 
  Info 
} from 'lucide-react';
import { OrderItem, User, SUPPORT_PHONE, SUPPORT_PHONE_CALL } from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: OrderItem[];
  currentUser: User | null;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onProceedToCheckout: () => void;
  onRequireAuth: () => void;
  onOpenSupport: () => void;
  onOpenPrivacy?: () => void;
  onOpenCartPage?: () => void;
  theme?: 'dark' | 'light';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  onRequireAuth,
  onOpenSupport,
  onOpenPrivacy,
  onOpenCartPage,
  theme = 'light'
}) => {
  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);

  // Privacy agreement checkbox state (persisted or auto-checked if previously accepted)
  const [privacyAgreed, setPrivacyAgreed] = useState(false);

  useEffect(() => {
    const isAccepted = localStorage.getItem('bluema_privacy_accepted') === 'true';
    setPrivacyAgreed(isAccepted);
  }, [isOpen]);

  // Lock body scroll when cart drawer is open
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

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 2000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  // Discount calculation
  const discountAmount = appliedPromo ? Math.round((subtotal * appliedPromo.discountPercent) / 100) : 0;
  const shippingFee = items.length === 0 ? 0 : (isFreeShipping ? 0 : 50);
  const estimatedTotal = Math.max(0, subtotal - discountAmount + shippingFee);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = promoCode.trim().toUpperCase();
    if (!clean) return;

    if (clean === 'BLUEMA10' || clean === 'WELCOME10') {
      setAppliedPromo({ code: clean, discountPercent: 10 });
      setPromoError(null);
    } else if (clean === 'BLUEMA15' || clean === 'VIP15') {
      setAppliedPromo({ code: clean, discountPercent: 15 });
      setPromoError(null);
    } else {
      setPromoError('Invalid promo voucher code');
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode('');
    setPromoError(null);
  };

  const handleCheckoutClick = () => {
    // If not checked, automatically mark acceptance if user proceeds
    if (!privacyAgreed) {
      localStorage.setItem('bluema_privacy_accepted', 'true');
      localStorage.setItem('bluema_privacy_accepted_date', new Date().toLocaleDateString('en-GB'));
      setPrivacyAgreed(true);
    }
    onClose();
    onProceedToCheckout();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      
      {/* Dimmed Background Backdrop using Official BLUEMA Hero Asset */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center opacity-30 pointer-events-none"
        style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
      />

      <div className="absolute inset-y-0 right-0 max-w-full flex pl-6 sm:pl-10 z-10">
        <div className="w-screen max-w-md bg-slate-950/95 backdrop-blur-2xl shadow-[0_25px_60px_rgba(0,0,0,0.9)] flex flex-col border-l border-white/10 text-white">
          
          {/* Header - Matching Blueprint Panel 3 (BAG) */}
          <div className="px-6 py-5 bg-white/5 border-b border-white/10 flex items-center justify-between shrink-0 relative">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white text-slate-950 flex items-center justify-center font-black text-xs tracking-tighter shadow-sm">
                B
              </div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black font-brand uppercase tracking-wider text-white">
                  BAG
                </h2>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/10 text-slate-200 border border-white/10 font-bold">
                  {items.reduce((acc, i) => acc + i.quantity, 0)} {items.reduce((acc, i) => acc + i.quantity, 0) === 1 ? 'Item' : 'Items'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onOpenCartPage && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenCartPage();
                  }}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  title="Open Full Cart Page"
                >
                  Full Cart
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-white/5 hover:bg-white/15 transition-all cursor-pointer"
                aria-label="Close cart drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Priority Express Shipping Progress Bar */}
          <div className="px-6 py-3.5 bg-white/5 border-b border-white/10 text-xs shrink-0">
            {subtotal >= freeShippingThreshold ? (
              <div className="text-emerald-300 font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>You qualify for <strong>FREE priority express delivery</strong> across Ghana!</span>
              </div>
            ) : (
              <div className="text-slate-300 flex items-center justify-between">
                <span>Add <strong className="text-white font-mono">GH₵{(freeShippingThreshold - subtotal).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong> more for FREE shipping</span>
                <span className="text-[10px] text-slate-400 font-bold uppercase">GH₵2,000 Tier</span>
              </div>
            )}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-slate-200 via-white to-slate-300 h-full rounded-full transition-all duration-300 shadow-sm"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 divide-y divide-white/10 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-slate-950/40 [&::-webkit-scrollbar-thumb]:bg-slate-700/60 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-slate-500/80">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-3">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-white text-base font-brand uppercase tracking-wider">
                  Your bag is currently empty
                </h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Explore our curated departments: Clothing, Apple Replacement Parts, Luxury Diffusers, and iPhones.
                </p>
                <button
                  onClick={onClose}
                  className="mt-2 px-6 py-2.5 bg-white hover:bg-slate-100 text-slate-950 text-xs font-black uppercase tracking-wider rounded-none transition-all cursor-pointer shadow-md active:scale-95"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="py-4 flex gap-3.5 group">
                  <div className="w-20 h-20 rounded-xl border border-white/10 shrink-0 bg-[#f5f5f7] dark:bg-slate-900 p-1.5 flex items-center justify-center overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-xs font-bold text-white line-clamp-2 leading-snug">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-slate-400 hover:text-rose-400 p-1 transition-colors shrink-0 cursor-pointer"
                          title="Remove item"
                          aria-label={`Remove ${item.name} from bag`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Variant tags */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[11px] text-slate-400">
                        {item.selectedSize && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            Color: {item.selectedColor}
                          </span>
                        )}
                        {item.selectedStorage && (
                          <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                            Storage: {item.selectedStorage}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-1">
                      {/* Quantity Controls (Minimalist Square Box) */}
                      <div className="flex items-center border border-white/15 rounded-lg bg-white/5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, -1)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white text-xs cursor-pointer active:scale-95"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-white min-w-6 text-center select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, 1)}
                          className="px-2.5 py-1 text-slate-300 hover:text-white text-xs cursor-pointer active:scale-95"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Item Total Price */}
                      <div className="text-right font-extrabold text-sm text-white font-mono">
                        GH₵{(item.price * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Section */}
          {items.length > 0 && (
            <div className="border-t border-white/10 bg-white/5 p-5 sm:p-6 space-y-4 shrink-0">
              
              {/* Promo / Voucher Code Section */}
              <div className="space-y-1.5">
                {!appliedPromo ? (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Voucher / Promo Code (e.g. BLUEMA10)"
                        className="w-full px-3 py-2 bg-slate-900 border border-white/15 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-white"
                      />
                      <Tag className="w-3.5 h-3.5 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer shrink-0"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-2.5 bg-emerald-500/10 border border-emerald-500/25 rounded-xl text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.discountPercent}% OFF)</span>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-slate-400 hover:text-white text-[11px] underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {promoError && (
                  <p className="text-[11px] text-rose-400 pl-1">{promoError}</p>
                )}
              </div>

              {/* Order Breakdown Summary Card */}
              <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4 space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-300">
                  <span>Cart Subtotal</span>
                  <span className="text-white font-bold font-mono">
                    GH₵{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>

                {appliedPromo && (
                  <div className="flex justify-between items-center text-emerald-400">
                    <span>Discount ({appliedPromo.discountPercent}%)</span>
                    <span className="font-bold font-mono">
                      -GH₵{discountAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-slate-300">
                  <span className="flex items-center gap-1.5">
                    Estimated Express Shipping
                    {isFreeShipping && (
                      <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold uppercase">
                        Free Tier
                      </span>
                    )}
                  </span>
                  <span className={isFreeShipping ? 'text-emerald-300 font-bold' : 'text-white font-bold font-mono'}>
                    {isFreeShipping ? 'FREE' : 'GH₵50.00'}
                  </span>
                </div>

                <div className="flex justify-between items-baseline text-sm font-bold text-white pt-2.5 border-t border-white/10">
                  <span className="uppercase tracking-wider font-brand">Total Due</span>
                  <span className="text-emerald-400 font-black text-lg font-mono">
                    GH₵{estimatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {/* Privacy Policy & Terms Acceptance Checkbox */}
              <div className="flex items-start gap-2.5 pt-1">
                <input
                  type="checkbox"
                  id="cartPrivacyCheck"
                  checked={privacyAgreed}
                  onChange={(e) => {
                    setPrivacyAgreed(e.target.checked);
                    if (e.target.checked) {
                      localStorage.setItem('bluema_privacy_accepted', 'true');
                      localStorage.setItem('bluema_privacy_accepted_date', new Date().toLocaleDateString('en-GB'));
                    }
                  }}
                  className="w-4 h-4 rounded border-white/20 bg-slate-900 text-white focus:ring-white cursor-pointer shrink-0 mt-0.5"
                />
                <label htmlFor="cartPrivacyCheck" className="text-[11px] text-slate-400 leading-tight select-none cursor-pointer">
                  I accept the{' '}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      if (onOpenPrivacy) onOpenPrivacy();
                    }}
                    className="text-white underline hover:text-slate-200 font-semibold cursor-pointer"
                  >
                    Privacy Policy & Terms
                  </button>{' '}
                  for verified warranty delivery.
                </label>
              </div>

              {/* Action Buttons */}
              {!currentUser ? (
                <div className="space-y-2">
                  <div className="p-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 text-xs flex items-start gap-2">
                    <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-white font-bold">Member Account Required</strong>
                      <span className="text-slate-400 text-[11px]">
                        Register or sign in to complete checkout with warranty dispatch.
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onClose();
                      onRequireAuth();
                    }}
                    className="w-full py-3.5 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs uppercase tracking-widest rounded-none transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register / Sign In First to Checkout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleCheckoutClick}
                  className="w-full py-4 px-4 bg-white hover:bg-slate-100 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-widest rounded-none transition-all shadow-xl flex items-center justify-center gap-2 group cursor-pointer active:scale-95"
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              )}
            </div>
          )}

          {/* Hotline Strip (Matching Blueprint & Contact Standard) */}
          <div className="bg-slate-900 text-slate-400 px-6 py-3 flex flex-wrap items-center justify-between text-xs border-t border-white/10 gap-2 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Need help? Call <strong className="text-white">{SUPPORT_PHONE}</strong></span>
            </div>
            <div className="flex items-center gap-2.5">
              <a
                href={SUPPORT_PHONE_CALL}
                className="text-slate-300 hover:text-white underline font-semibold transition-colors"
              >
                Call
              </a>
              <span className="text-slate-700">·</span>
              <button
                onClick={onOpenSupport}
                className="text-slate-300 hover:text-white underline font-semibold transition-colors cursor-pointer"
              >
                Concierge
              </button>
              {onOpenPrivacy && (
                <>
                  <span className="text-slate-700">·</span>
                  <button
                    onClick={onOpenPrivacy}
                    className="text-slate-300 hover:text-white underline font-semibold transition-colors cursor-pointer"
                  >
                    Privacy
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
