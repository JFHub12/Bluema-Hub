import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Check, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  ShoppingBag, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  MessageCircle, 
  Tag, 
  Clock,
  ExternalLink,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Product, formatCurrency } from '../data/products';
import { SUPPORT_PHONE, SUPPORT_PHONE_CALL, SUPPORT_WHATSAPP } from '../services/api';
import { BRAND_ASSETS, BRAND_CONFIG } from '../assets/branding';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, options: { size?: string; color?: string; storage?: string }) => void;
  onBuyNow: (product: Product, options: { size?: string; color?: string; storage?: string }) => void;
  onOpenPrivacy?: () => void;
  theme?: 'dark' | 'light';
}

export const ProductModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
  onOpenPrivacy,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  const allImages = product?.images && product.images.length > 0 ? product.images : (product?.image ? [product.image] : []);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product?.sizes ? product.sizes[0] : undefined
  );
  const [selectedColor, setSelectedColor] = useState<string | undefined>(
    product?.colors ? product.colors[0] : undefined
  );
  const [selectedStorage, setSelectedStorage] = useState<string | undefined>(
    product?.storage ? product.storage[0] : undefined
  );
  const [addedEffect, setAddedEffect] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Synchronize initial selections whenever selected product changes
  useEffect(() => {
    if (product) {
      setSelectedSize(product.sizes ? product.sizes[0] : undefined);
      setSelectedColor(product.colors ? product.colors[0] : undefined);
      setSelectedStorage(product.storage ? product.storage[0] : undefined);
      setActiveImageIndex(0);
      setAddedEffect(false);
      setCopiedLink(false);
    }
  }, [product]);

  // Lock body scroll when modal is active
  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [product]);

  if (!product) return null;

  const handleAdd = () => {
    onAddToCart(product, {
      size: selectedSize,
      color: selectedColor,
      storage: selectedStorage
    });
    setAddedEffect(true);
    setTimeout(() => setAddedEffect(false), 2000);
  };

  const handleBuy = () => {
    onBuyNow(product, {
      size: selectedSize,
      color: selectedColor,
      storage: selectedStorage
    });
  };

  const handleShareProduct = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Helper for color swatches
  const getColorHex = (colorName: string): string => {
    const c = colorName.toLowerCase();
    if (c.includes('black') || c.includes('onyx') || c.includes('obsidian') || c.includes('basalt')) return '#111111';
    if (c.includes('white') || c.includes('chalk') || c.includes('stone white')) return '#f8f8f8';
    if (c.includes('charcoal') || c.includes('concrete') || c.includes('graphite') || c.includes('grey') || c.includes('gray')) return '#4b5563';
    if (c.includes('cream') || c.includes('sand') || c.includes('starlight')) return '#e7dfd5';
    if (c.includes('olive') || c.includes('green')) return '#556b2f';
    if (c.includes('navy') || c.includes('blue') || c.includes('midnight')) return '#1e293b';
    if (c.includes('red')) return '#b91c1c';
    if (c.includes('gold') || c.includes('amber')) return '#d97706';
    if (c.includes('purple')) return '#6b21a8';
    if (c.includes('silver')) return '#cbd5e1';
    return '#64748b';
  };

  // Calculate discount percentage if original price is specified
  const discountPercent = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 backdrop-blur-lg animate-in fade-in duration-300 overflow-hidden overscroll-none ${
      isDark ? 'bg-slate-950/85 text-white' : 'bg-slate-900/60 text-slate-900'
    }`}>
      {/* Cinematic Blueprint Backdrop Watermark */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center scale-105 opacity-35 pointer-events-none fixed"
        style={{ backgroundImage: `url(${BRAND_ASSETS.heroBanner})` }}
      />

      {/* Main Glassmorphic Modal Container with Theme Adaptation */}
      <div 
        className={`relative w-full max-w-4xl backdrop-blur-2xl rounded-[28px] shadow-[0_25px_60px_rgba(0,0,0,0.85)] overflow-hidden border ring-1 animate-in zoom-in-95 duration-300 max-h-[92vh] flex flex-col z-10 ${
          isDark 
            ? 'bg-slate-950/95 text-white border-white/20 ring-white/10' 
            : 'bg-white/98 text-slate-900 border-slate-300 ring-black/5 shadow-2xl'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top subtle glossy accent */}
        <div className={`absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent ${isDark ? 'via-white/60' : 'via-slate-400/60'} to-transparent shrink-0`} />

        {/* Modal Top Header Bar */}
        <div className={`px-6 py-3.5 flex items-center justify-between shrink-0 border-b ${
          isDark ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-100'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs tracking-tighter shadow-md shrink-0 ${
              isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
            }`}>
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-black font-brand tracking-wider uppercase ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  {BRAND_CONFIG.name}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${
                  isDark ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30' : 'text-emerald-700 bg-emerald-50 border-emerald-300'
                }`}>
                  <ShieldCheck className="w-3 h-3" />
                  <span>VERIFIED PRODUCT</span>
                </span>
              </div>
              <p className={`text-[10px] ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                Quality products. Better living. • Official Showcase
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShareProduct}
              className={`p-2 rounded-full transition-all cursor-pointer text-xs flex items-center gap-1.5 ${
                isDark ? 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/15' : 'text-slate-600 hover:text-slate-950 bg-slate-200/80 hover:bg-slate-300'
              }`}
              title="Share link"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={onClose}
              className={`p-2 rounded-full transition-all cursor-pointer ${
                isDark ? 'text-slate-300 hover:text-white bg-white/5 hover:bg-white/15' : 'text-slate-600 hover:text-slate-950 bg-slate-200/80 hover:bg-slate-300'
              }`}
              aria-label="Close product view"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Content - Two Column Split on Desktop */}
        <div className={`flex-1 overflow-y-auto flex flex-col md:flex-row [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full ${
          isDark ? '[&::-webkit-scrollbar-thumb]:bg-slate-700' : '[&::-webkit-scrollbar-thumb]:bg-slate-300'
        }`}>
          
          {/* LEFT COLUMN: PRODUCT IMAGE SHOWCASE & MULTI-IMAGE GALLERY */}
          <div className={`md:w-1/2 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r relative ${
            isDark ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`relative aspect-square sm:aspect-[4/5] rounded-2xl overflow-hidden border flex items-center justify-center group shadow-inner ${
              isDark ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
            }`}>
              <img
                src={allImages[activeImageIndex] || product.image}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />

              {/* Navigation arrows if multiple images exist */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer shadow-md"
                    aria-label="Previous image"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-all cursor-pointer shadow-md"
                    aria-label="Next image"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <div className="absolute top-3 right-14 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded-full text-[10px] font-mono font-bold">
                    {activeImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}

              {/* Tag Badge */}
              {product.tag && (
                <div className={`absolute top-3 left-3 text-[10px] font-black px-3 py-1 uppercase tracking-widest shadow-md ${
                  isDark ? 'bg-white text-slate-950' : 'bg-slate-950 text-white'
                }`}>
                  {product.tag}
                </div>
              )}

              {/* Discount Tag */}
              {discountPercent && (
                <div className="absolute top-3 right-3 bg-amber-500 text-slate-950 text-[10px] font-black px-2.5 py-1 uppercase tracking-wider shadow-md">
                  SAVE {discountPercent}%
                </div>
              )}

              {/* Bottom Assurance Overlay */}
              <div className={`absolute bottom-3 inset-x-3 backdrop-blur-md border p-2 rounded-xl flex items-center justify-between text-[11px] ${
                isDark ? 'bg-slate-950/85 border-white/15 text-slate-300' : 'bg-white/90 border-slate-200 text-slate-700 shadow-md'
              }`}>
                <span className={`flex items-center gap-1.5 font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  100% Genuine
                </span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Accra Dispatch Ready</span>
              </div>
            </div>

            {/* Thumbnail Strip for Admin Uploaded Images */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-14 h-14 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      activeImageIndex === idx 
                        ? (isDark ? 'border-white scale-105 shadow-lg' : 'border-slate-950 scale-105 shadow-md') 
                        : (isDark ? 'border-white/20 opacity-70 hover:opacity-100' : 'border-slate-300 opacity-70 hover:opacity-100')
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Quick Guarantee Highlights */}
            <div className={`grid grid-cols-2 gap-2 mt-4 pt-4 border-t text-[11px] ${
              isDark ? 'border-white/10 text-slate-300' : 'border-slate-200 text-slate-700'
            }`}>
              <div className={`flex items-center gap-2 p-2 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <Truck className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Express Delivery within 2-4 Hours</span>
              </div>
              <div className={`flex items-center gap-2 p-2 rounded-xl border ${
                isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-200 shadow-xs'
              }`}>
                <RotateCcw className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span>Inspection & Return Privilege</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCT DETAILS & CONFIGURATION */}
          <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-5">
              {/* Category & Status */}
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 text-[11px] uppercase tracking-widest font-bold ${
                  isDark ? 'text-slate-400' : 'text-slate-600'
                }`}>
                  <span className={isDark ? 'text-white' : 'text-slate-950'}>{product.category}</span>
                  <span>•</span>
                  <span className={`flex items-center gap-1 ${isDark ? 'text-emerald-400' : 'text-emerald-700 font-bold'}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock
                  </span>
                </div>

                {/* Rating */}
                <div className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border ${
                  isDark ? 'bg-white/10 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900'
                }`}>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="font-bold">{Number(product.rating || 5.0).toFixed(1)}</span>
                  <span className={isDark ? 'text-slate-400 text-[11px]' : 'text-slate-500 text-[11px]'}>({product.reviewsCount || 48})</span>
                </div>
              </div>

              {/* Title */}
              <div>
                <h2 className={`text-2xl sm:text-3xl font-black font-brand tracking-tight uppercase leading-snug ${
                  isDark ? 'text-white' : 'text-slate-950'
                }`}>
                  {product.name}
                </h2>
              </div>

              {/* Price Block */}
              <div className={`p-4 rounded-2xl border flex items-baseline justify-between ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-950 shadow-xs'
              }`}>
                <div>
                  <span className={`text-xs block font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Standard Price:</span>
                  <div className="flex items-baseline gap-3 mt-0.5">
                    <span className={`text-2xl sm:text-3xl font-black font-mono tracking-tight ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {formatCurrency(product.price)}
                    </span>
                    {product.originalPrice && (
                      <span className={`text-sm line-through font-mono ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        {formatCurrency(product.originalPrice)}
                      </span>
                    )}
                  </div>
                </div>

                {discountPercent && (
                  <div className="text-right">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${
                      isDark ? 'text-emerald-400 bg-emerald-950/80 border-emerald-500/30' : 'text-emerald-700 bg-emerald-100 border-emerald-300'
                    }`}>
                      You save {formatCurrency(product.originalPrice! - product.price)}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <p className={`text-xs sm:text-sm leading-relaxed font-normal ${
                isDark ? 'text-slate-300' : 'text-slate-700'
              }`}>
                {product.description}
              </p>

              {/* Storage Capacity Selector (iPhones) */}
              {product.storage && product.storage.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      Storage Capacity:
                    </span>
                    <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Selected: <strong className={isDark ? 'text-white' : 'text-slate-950'}>{selectedStorage}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.storage.map((st) => {
                      const isSelected = selectedStorage === st;
                      return (
                        <button
                          key={st}
                          type="button"
                          onClick={() => setSelectedStorage(st)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? (isDark ? 'bg-white text-slate-950 border-white shadow-md' : 'bg-slate-950 text-white border-slate-950 shadow-md')
                              : (isDark ? 'bg-white/5 border-white/15 text-slate-300 hover:border-white/30' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200')
                          }`}
                        >
                          {st}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Size Selector */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      Size / Fit:
                    </span>
                    <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Selected: <strong className={isDark ? 'text-white' : 'text-slate-950'}>{selectedSize}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((sz) => {
                      const isSelected = selectedSize === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => setSelectedSize(sz)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                            isSelected
                              ? (isDark ? 'bg-white text-slate-950 border-white shadow-md' : 'bg-slate-950 text-white border-slate-950 shadow-md')
                              : (isDark ? 'bg-white/5 border-white/15 text-slate-300 hover:border-white/30' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200')
                          }`}
                        >
                          {sz}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Colour Finish Selector */}
              {product.colors && product.colors.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-bold uppercase tracking-wider ${isDark ? 'text-slate-300' : 'text-slate-800'}`}>
                      Finish / Colour:
                    </span>
                    <span className={`font-mono text-[11px] ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                      Selected: <strong className={isDark ? 'text-white' : 'text-slate-950'}>{selectedColor}</strong>
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {product.colors.map((cl) => {
                      const isSelected = selectedColor === cl;
                      return (
                        <button
                          key={cl}
                          type="button"
                          onClick={() => setSelectedColor(cl)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-2 border ${
                            isSelected
                              ? (isDark ? 'bg-white/20 border-white text-white shadow-md ring-1 ring-white' : 'bg-slate-900 border-slate-950 text-white shadow-md')
                              : (isDark ? 'bg-white/5 border-white/15 text-slate-300 hover:border-white/30' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200')
                          }`}
                        >
                          <span 
                            className="w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs inline-block shrink-0" 
                            style={{ backgroundColor: getColorHex(cl) }} 
                          />
                          <span>{cl}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Technical Specifications */}
              {product.specs && product.specs.length > 0 && (
                <div className={`pt-3 border-t space-y-2 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                    Verified Specifications:
                  </span>
                  <ul className={`grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
                    {product.specs.map((sp, idx) => (
                      <li key={idx} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border ${
                        isDark ? 'bg-white/5 border-white/5 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
                      }`}>
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span className="truncate">{sp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Bottom Actions & Concierge Support Bar */}
            <div className={`pt-6 border-t space-y-4 ${isDark ? 'border-white/10' : 'border-slate-200'}`}>
              
              {/* Dual CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleAdd}
                  className={`flex-1 py-3.5 px-5 font-bold text-xs uppercase tracking-wider transition-all border flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    isDark 
                      ? 'bg-white/10 hover:bg-white/20 text-white border-white/25' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-900 border-slate-300 shadow-xs'
                  }`}
                >
                  {addedEffect ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Added to Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleBuy}
                  className={`flex-1 py-3.5 px-6 font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer active:scale-98 ${
                    isDark
                      ? 'bg-white hover:bg-slate-100 text-slate-950 shadow-[0_4px_25px_rgba(255,255,255,0.2)]'
                      : 'bg-slate-950 hover:bg-slate-800 text-white shadow-[0_4px_25px_rgba(0,0,0,0.2)]'
                  }`}
                >
                  <span>DIRECT BUY NOW</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Privacy Policy Guarantee Notice */}
              <div className={`flex items-center justify-between text-[11px] px-1 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Protected by BLUEMA Customer Charter</span>
                </span>
                {onOpenPrivacy && (
                  <button
                    onClick={onOpenPrivacy}
                    className={`underline cursor-pointer ${isDark ? 'text-slate-300 hover:text-white' : 'text-slate-800 hover:text-slate-950'}`}
                  >
                    Privacy Policy
                  </button>
                )}
              </div>

              {/* Concierge Hotline Strip */}
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-slate-100 border-slate-200 text-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-[11px]">Concierge Orders:</span>
                  <a 
                    href={SUPPORT_PHONE_CALL} 
                    className={`font-mono font-bold hover:underline ${isDark ? 'text-white' : 'text-slate-950'}`}
                  >
                    {SUPPORT_PHONE}
                  </a>
                </div>

                <a
                  href={SUPPORT_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
