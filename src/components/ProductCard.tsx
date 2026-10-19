import React, { useState } from 'react';
import { ShoppingBag, Eye, Check, Star } from 'lucide-react';
import { Product, formatCurrency } from '../data/products';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, options?: { size?: string; color?: string; storage?: string }) => void;
  onQuickView: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onQuickView
}) => {
  const [justAdded, setJustAdded] = useState(false);
  const [activeColor, setActiveColor] = useState<string | undefined>(
    product.colors && product.colors.length > 0 ? product.colors[0] : undefined
  );

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product, {
      color: activeColor,
      size: product.sizes ? product.sizes[0] : undefined,
      storage: product.storage ? product.storage[0] : undefined
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  // Helper to map color names to clean CSS background colors
  const getColorStyle = (colorName: string): string => {
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

  const productImgSrc = React.useMemo(() => {
    if (product.image && product.image.trim()) return product.image;
    if (product.images && product.images.length > 0 && product.images[0]) return product.images[0];
    const cat = (product.category || '').toLowerCase();
    if (cat.includes('cloth')) return '/src/assets/images/bluema_clothing_cat_1791714217020.jpg';
    if (cat.includes('access') || cat.includes('part') || cat.includes('apple')) return '/src/assets/images/bluema_apple_parts_1791714238180.jpg';
    if (cat.includes('diffus') || cat.includes('scent')) return '/src/assets/images/bluema_diffuser_cat_1791714255504.jpg';
    if (cat.includes('phone') || cat.includes('device')) return '/src/assets/images/bluema_iphones_cat_1791714272698.jpg';
    return '/src/assets/images/bluema_hero_banner_1791714201504.jpg';
  }, [product.image, product.images, product.category]);

  return (
    <div 
      onClick={() => onQuickView(product)}
      className="group relative bg-white dark:bg-slate-900 rounded-none sm:rounded-2xl overflow-hidden border border-slate-200/90 dark:border-white/10 hover:border-slate-950 dark:hover:border-white hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Product Image Container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-slate-100/70 dark:bg-slate-950 flex items-center justify-center p-3 sm:p-4">
        <img
          src={productImgSrc}
          alt={product.name}
          className="w-full h-full object-cover rounded-none sm:rounded-xl group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Tag / Badge */}
        {product.tag && (
          <div className="absolute top-3 left-3 bg-slate-950 text-white text-[9px] font-black px-2.5 py-0.5 uppercase tracking-wider shadow-sm">
            {product.tag}
          </div>
        )}

        {/* Stock status indicator */}
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10 text-[10px] text-slate-700 dark:text-slate-300 font-semibold shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
          <span>In Stock</span>
        </div>

        {/* Quick Add To Bag overlay button on hover (Desktop) */}
        <div className="absolute inset-x-3 bottom-3 hidden sm:flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            type="button"
            onClick={handleAdd}
            className="flex-1 py-2.5 px-3 bg-slate-950 hover:bg-black text-white text-xs font-bold rounded-xl shadow-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95"
            aria-label={`Add ${product.name} to bag`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Added to Bag</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5 text-white" />
                <span>Add to Bag</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2.5 bg-white text-slate-900 hover:text-black rounded-xl shadow-lg transition-transform hover:scale-105 cursor-pointer border border-slate-200"
            title="View Details"
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Card Details (Matching Blueprint Panel 2: Name, Price, Color Swatches) */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 bg-white dark:bg-slate-900 transition-colors">
        <div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 uppercase tracking-wider mb-1">
            <span>{product.category}</span>
            <div className="flex items-center gap-0.5 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span>{Number(product.rating || 5.0).toFixed(1)}</span>
            </div>
          </div>

          <h3 className="font-bold text-xs sm:text-sm text-slate-950 dark:text-white group-hover:text-black dark:group-hover:text-slate-200 transition-colors line-clamp-1 leading-snug">
            {product.name}
          </h3>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm sm:text-base font-black text-slate-950 dark:text-white font-mono">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="text-xs text-slate-400 line-through font-mono">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>
        </div>

        {/* Color Swatch Dots under Price (As seen in Blueprint Panel 2) */}
        {product.colors && product.colors.length > 0 && (
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1.5">
              {product.colors.slice(0, 5).map((color, idx) => {
                const isSelected = activeColor === color;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveColor(color);
                    }}
                    className={`w-3.5 h-3.5 rounded-full border shadow-2xs inline-block transition-transform ${
                      isSelected ? 'ring-2 ring-slate-950 dark:ring-white scale-110 border-white' : 'border-slate-300 dark:border-slate-700 hover:scale-110'
                    }`}
                    style={{ backgroundColor: getColorStyle(color) }}
                    title={color}
                  />
                );
              })}
              {product.colors.length > 5 && (
                <span className="text-[10px] text-slate-400 font-semibold">
                  +{product.colors.length - 5}
                </span>
              )}
            </div>

            {/* Mobile quick add button */}
            <button
              type="button"
              onClick={handleAdd}
              className="sm:hidden p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-950 dark:text-white transition-colors"
              aria-label="Add to bag"
            >
              {justAdded ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <ShoppingBag className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
