import React, { useState } from 'react';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Tag, 
  CheckCircle2, 
  ArrowLeft,
  Sparkles
} from 'lucide-react';
import { OrderItem, User } from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';
import { CartAnimate } from './CartAnimate';

export interface CartPageProps {
  items: OrderItem[];
  currentUser: User | null;
  onUpdateQuantity: (id: string, delta: number) => void;
  onRemoveItem: (id: string) => void;
  onClearCart?: () => void;
  onContinueShopping: () => void;
  onProceedToCheckout: () => void;
  onRequireAuth: () => void;
  onOpenSupport: () => void;
  onOpenPrivacy?: () => void;
  theme?: 'dark' | 'light';
}

export const CartPage: React.FC<CartPageProps> = ({
  items,
  currentUser,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onContinueShopping,
  onProceedToCheckout,
  onRequireAuth,
  onOpenSupport,
  onOpenPrivacy,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';

  // Promo voucher code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [showPromoInput, setShowPromoInput] = useState(false);

  // Calculations
  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const freeShippingThreshold = 2000;
  const isFreeShipping = subtotal >= freeShippingThreshold;
  const progressToFreeShipping = Math.min(100, (subtotal / freeShippingThreshold) * 100);

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
    if (!currentUser) {
      onRequireAuth();
      return;
    }
    onProceedToCheckout();
  };

  const formatVariantSubtitle = (item: OrderItem): string => {
    const parts: string[] = [];
    if (item.selectedStorage) parts.push(item.selectedStorage);
    if (item.selectedColor) parts.push(item.selectedColor);
    if (parts.length > 0) {
      return parts.join(' | ');
    }
    if (item.selectedSize) {
      return item.selectedSize;
    }
    if (item.category === 'accessories') return 'GX Grade Certified';
    if (item.category === 'iphones') return 'Authentic Apple Hardware';
    if (item.category === 'diffuser') return 'Aromatherapy Edition';
    if (item.category === 'cloth') return 'Tailored Fit';
    return 'Verified Authentic';
  };

  return (
    <div className={`min-h-screen py-8 sm:py-14 px-4 sm:px-6 lg:px-8 transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-slate-950'
    }`}>
      <div className="max-w-4xl mx-auto">
        
        {/* Top Breadcrumb / Category Back Link (Matches "< CART" in user blueprint) */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={onContinueShopping}
            className={`flex items-center gap-2 text-xs font-bold tracking-widest uppercase transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <span className="text-base leading-none">‹</span>
            <span>CART</span>
          </button>

          {/* Quick Support / Concierge Contact */}
          <button
            onClick={onOpenSupport}
            className={`text-xs font-semibold transition-colors cursor-pointer ${
              isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            Need Help? Concierge Support
          </button>
        </div>

        {/* Main Heading: Your Cart (3) */}
        <div className={`flex items-baseline justify-between mb-6 pb-4 border-b ${
          isDark ? 'border-slate-800' : 'border-slate-100'
        }`}>
          <h1 className={`text-2xl sm:text-3xl font-extrabold font-brand tracking-tight ${
            isDark ? 'text-white' : 'text-slate-950'
          }`}>
            Your Cart ({totalQuantity})
          </h1>

          {items.length > 0 && onClearCart && (
            <button
              onClick={onClearCart}
              className={`text-xs font-medium transition-colors cursor-pointer ${
                isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'
              }`}
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Free Express Shipping Notification Bar */}
        {items.length > 0 && (
          <div className={`mb-6 p-3.5 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 ${
            isDark ? 'bg-slate-900/60 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200/80 text-slate-700'
          }`}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
              {isFreeShipping ? (
                <span>
                  <strong className="text-emerald-500 font-semibold">FREE Express Delivery Unlocked!</strong> You qualify for priority nationwide dispatch across Ghana.
                </span>
              ) : (
                <span>
                  Add <strong className="font-mono text-slate-900 dark:text-white font-bold">GH₵{(freeShippingThreshold - subtotal).toLocaleString()}</strong> more to unlock <strong>FREE express delivery</strong>.
                </span>
              )}
            </div>
            <div className="w-full sm:w-36 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shrink-0">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>
        )}

        {/* Cart Item Rows */}
        {items.length === 0 ? (
          <div className={`py-16 text-center rounded-2xl border space-y-4 ${
            isDark ? 'bg-slate-950/40 border-slate-900 text-slate-400' : 'bg-slate-50/50 border-slate-100 text-slate-500'
          }`}>
            <CartAnimate size="md" />
            <h3 className={`text-lg font-bold font-brand uppercase tracking-wider ${
              isDark ? 'text-white' : 'text-slate-950'
            }`}>
              Your cart is currently empty
            </h3>
            <p className="text-xs max-w-sm mx-auto leading-relaxed">
              Discover genuine items in our verified catalog or explore available departments.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={onContinueShopping}
                className="px-6 py-3 bg-black hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Browse Live Catalog
              </button>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="py-6 sm:py-7 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6 group transition-colors"
              >
                {/* Left: Product Thumbnail + Spec Title + Unit Price */}
                <div className="flex items-center gap-4 sm:gap-6 flex-1 min-w-0">
                  {/* Square Image Box (Identical to reference screenshot) */}
                  <div className={`w-24 h-24 sm:w-28 sm:h-28 rounded-xl p-2 sm:p-2.5 flex items-center justify-center shrink-0 border overflow-hidden transition-all ${
                    isDark 
                      ? 'bg-slate-900/90 border-slate-800' 
                      : 'bg-[#f5f5f7] border-slate-200/60'
                  }`}>
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = BRAND_ASSETS.iphonesCatImg;
                      }}
                    />
                  </div>

                  {/* Title, Variant Spec, Unit Price */}
                  <div className="space-y-1 sm:space-y-1.5 flex-1 min-w-0">
                    <h3 className={`text-base sm:text-lg font-bold tracking-tight truncate ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}>
                      {item.name}
                    </h3>
                    
                    {/* Variant spec (e.g. "128GB | Black", "GX Grade", "200ml") */}
                    <p className="text-xs sm:text-sm text-slate-400 dark:text-slate-400 font-medium">
                      {formatVariantSubtitle(item)}
                    </p>

                    {/* Unit Price */}
                    <p className={`text-sm sm:text-base font-semibold pt-1 font-mono ${
                      isDark ? 'text-slate-200' : 'text-slate-900'
                    }`}>
                      GH₵{item.price.toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Right: Minimalist Quantity Selector + Trash Icon + Line Total */}
                <div className="flex items-center justify-between sm:justify-end gap-6 sm:gap-10 shrink-0 pt-2 sm:pt-0">
                  
                  {/* Quantity Border Box: [ –  1  + ] */}
                  <div className={`flex items-center border rounded-md shadow-2xs transition-colors ${
                    isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-white'
                  }`}>
                    <button
                      onClick={() => onUpdateQuantity(item.id, -1)}
                      className={`px-3 py-1 text-sm font-semibold transition-colors cursor-pointer active:scale-95 ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
                      }`}
                      aria-label="Decrease quantity"
                    >
                      –
                    </button>
                    <span className={`px-2.5 py-1 text-xs sm:text-sm font-semibold min-w-6 text-center select-none ${
                      isDark ? 'text-white' : 'text-slate-900'
                    }`}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => onUpdateQuantity(item.id, 1)}
                      className={`px-3 py-1 text-sm font-semibold transition-colors cursor-pointer active:scale-95 ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
                      }`}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  {/* Trash Icon & Line Total Price */}
                  <div className="flex flex-col items-end gap-2.5 min-w-[90px] text-right">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className={`p-1 rounded transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-rose-400' : 'text-slate-400 hover:text-rose-500'
                      }`}
                      title="Remove item"
                      aria-label={`Remove ${item.name} from cart`}
                    >
                      <Trash2 className="w-4 h-4 stroke-[1.6]" />
                    </button>
                    
                    <span className={`text-sm sm:text-base font-bold font-mono ${
                      isDark ? 'text-white' : 'text-slate-950'
                    }`}>
                      GH₵{(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer & Checkout Area */}
        {items.length > 0 && (
          <div className={`mt-8 pt-8 sm:pt-10 border-t ${
            isDark ? 'border-slate-800' : 'border-slate-200/80'
          }`}>
            
            {/* Optional Voucher / Promo Voucher Accordion */}
            <div className="mb-8">
              {!appliedPromo ? (
                <div>
                  {!showPromoInput ? (
                    <button
                      onClick={() => setShowPromoInput(true)}
                      className={`text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isDark ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-950'
                      }`}
                    >
                      <Tag className="w-3.5 h-3.5" />
                      <span>Have a promo voucher? (Click to apply)</span>
                    </button>
                  ) : (
                    <form onSubmit={handleApplyPromo} className="flex gap-2 max-w-sm">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value)}
                        placeholder="Voucher Code (e.g. BLUEMA10)"
                        className={`flex-1 px-3 py-2 text-xs rounded-lg border focus:outline-none transition-all ${
                          isDark 
                            ? 'bg-slate-900 border-slate-700 text-white placeholder-slate-500 focus:border-white' 
                            : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400 focus:border-slate-950'
                        }`}
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-black hover:bg-slate-900 text-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                      >
                        Apply
                      </button>
                    </form>
                  )}
                  {promoError && (
                    <p className="text-xs text-rose-500 mt-1 pl-1">{promoError}</p>
                  )}
                </div>
              ) : (
                <div className={`flex items-center justify-between p-3 rounded-lg border text-xs max-w-md ${
                  isDark ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                }`}>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Code <strong>{appliedPromo.code}</strong> applied ({appliedPromo.discountPercent}% OFF)</span>
                  </div>
                  <button
                    onClick={handleRemovePromo}
                    className="underline text-[11px] font-semibold cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Bar: Continue Shopping (Left) | Subtotal & Proceed to Checkout (Right) */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
              
              {/* Bottom Left: Continue Shopping Link */}
              <button
                onClick={onContinueShopping}
                className={`text-xs sm:text-sm font-medium transition-colors cursor-pointer underline underline-offset-4 ${
                  isDark ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-950'
                }`}
              >
                Continue Shopping
              </button>

              {/* Bottom Right: Subtotal + Checkout Button */}
              <div className="flex flex-col items-center sm:items-end gap-4 w-full sm:w-auto">
                
                {/* Subtotal line (Exact match with reference screenshot) */}
                <div className="flex items-baseline justify-between sm:justify-end gap-6 w-full sm:w-auto">
                  <span className={`text-xs sm:text-sm font-medium ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    Subtotal
                  </span>
                  <span className={`text-xl sm:text-2xl font-black font-brand font-mono ${
                    isDark ? 'text-white' : 'text-slate-950'
                  }`}>
                    GH₵{subtotal.toLocaleString()}
                  </span>
                </div>

                {/* Show discount/shipping line if promo is applied */}
                {appliedPromo && (
                  <div className="flex items-baseline justify-between sm:justify-end gap-6 w-full sm:w-auto text-xs text-emerald-500">
                    <span>Voucher Discount</span>
                    <span className="font-mono font-bold">-GH₵{discountAmount.toLocaleString()}</span>
                  </div>
                )}

                {/* Member Login Notice if not logged in */}
                {!currentUser && (
                  <p className={`text-[11px] text-center sm:text-right max-w-xs ${
                    isDark ? 'text-slate-400' : 'text-slate-500'
                  }`}>
                    <Lock className="w-3 h-3 inline mr-1 text-slate-400" />
                    Registered membership required for courier warranty dispatch.
                  </p>
                )}

                {/* Large Solid Black / White Checkout Button */}
                <button
                  onClick={handleCheckoutClick}
                  className={`w-full sm:w-auto min-w-[280px] sm:min-w-[320px] py-4 px-8 rounded-lg font-black text-xs sm:text-sm tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-3 cursor-pointer group active:scale-[0.98] ${
                    isDark
                      ? 'bg-white hover:bg-slate-100 text-slate-950 shadow-white/10'
                      : 'bg-black hover:bg-slate-900 text-white shadow-black/15'
                  }`}
                >
                  <span>PROCEED TO CHECKOUT</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </div>

            {/* Bottom Warranty & Terms Microcopy */}
            <div className={`mt-10 pt-6 border-t text-[11px] flex flex-col sm:flex-row items-center justify-between gap-3 ${
              isDark ? 'border-slate-900 text-slate-500' : 'border-slate-100 text-slate-400'
            }`}>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Authentic Hardware · Accra & Nationwide Express Courier</span>
              </div>
              {onOpenPrivacy && (
                <button
                  onClick={onOpenPrivacy}
                  className="hover:underline cursor-pointer"
                >
                  Purchasing Terms & Warranty Policy
                </button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
