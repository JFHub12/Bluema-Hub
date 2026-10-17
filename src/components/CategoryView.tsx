import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, X, RotateCcw, Search, ChevronDown, Check } from 'lucide-react';
import { Product, CATEGORIES } from '../data/products';
import { ProductCard } from './ProductCard';
import { BRAND_ASSETS } from '../assets/branding';
import { CartAnimate } from './CartAnimate';

interface CategoryViewProps {
  selectedCategory: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones';
  onSelectCategory: (category: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones') => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, options?: { size?: string; color?: string; storage?: string }) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme?: 'dark' | 'light';
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  selectedCategory,
  onSelectCategory,
  products,
  onSelectProduct,
  onAddToCart,
  searchQuery,
  onSearchChange,
  theme = 'light'
}) => {
  const isDark = theme === 'dark';
  // Filter states (Matching Blueprint Panel 2: Size, Colour, Price)
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available filter options
  const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  const AVAILABLE_COLORS = [
    { name: 'Black', hex: '#111111' },
    { name: 'Charcoal', hex: '#4b5563' },
    { name: 'Navy', hex: '#1e293b' },
    { name: 'White', hex: '#f8f8f8' },
    { name: 'Cream', hex: '#e7dfd5' },
    { name: 'Olive', hex: '#556b2f' },
  ];

  // Helper to get active category metadata
  const currentCategoryMeta = useMemo(() => {
    if (selectedCategory === 'all') {
      return {
        title: 'ALL COLLECTIONS',
        subtitle: 'Quality products. Better living.',
        bgImage: BRAND_ASSETS.heroBanner
      };
    }
    if (selectedCategory === 'cloth') {
      return {
        title: 'CLOTHING',
        subtitle: 'Simple styles. Everyday wear.',
        bgImage: BRAND_ASSETS.clothingCatImg
      };
    }
    if (selectedCategory === 'accessories') {
      return {
        title: 'APPLE PARTS',
        subtitle: 'GX Grade & OEM replacement screens, batteries & tools.',
        bgImage: BRAND_ASSETS.applePartsCatImg
      };
    }
    if (selectedCategory === 'diffuser') {
      return {
        title: 'DIFFUSERS',
        subtitle: 'Ambient scents & luxury aromatherapy.',
        bgImage: BRAND_ASSETS.diffuserCatImg
      };
    }
    return {
      title: 'IPHONES',
      subtitle: 'Sealed & UK Used Pro Max & Pro models.',
      bgImage: BRAND_ASSETS.iphonesCatImg
    };
  }, [selectedCategory]);

  // Toggle size filter
  const toggleSize = (size: string) => {
    setSelectedSizes(prev => 
      prev.includes(size) ? prev.filter(s => s !== size) : [...prev, size]
    );
  };

  // Toggle color filter
  const toggleColor = (color: string) => {
    setSelectedColors(prev => 
      prev.includes(color) ? prev.filter(c => c !== color) : [...prev, color]
    );
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    setSelectedPriceRange('all');
    onSearchChange('');
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || selectedPriceRange !== 'all' || searchQuery.trim().length > 0;

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter
      if (selectedCategory !== 'all' && p.category !== selectedCategory) {
        return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // Size filter (if applicable to product)
      if (selectedSizes.length > 0) {
        if (!p.sizes || !p.sizes.some(s => selectedSizes.includes(s))) {
          return false;
        }
      }

      // Color filter
      if (selectedColors.length > 0) {
        if (!p.colors || !p.colors.some(c => selectedColors.some(sc => c.toLowerCase().includes(sc.toLowerCase())))) {
          return false;
        }
      }

      // Price range filter
      if (selectedPriceRange === 'under-200' && p.price >= 200) return false;
      if (selectedPriceRange === '200-500' && (p.price < 200 || p.price > 500)) return false;
      if (selectedPriceRange === '500-2000' && (p.price < 500 || p.price > 2000)) return false;
      if (selectedPriceRange === 'over-2000' && p.price <= 2000) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, searchQuery, selectedSizes, selectedColors, selectedPriceRange, sortBy]);

  return (
    <div className={`min-h-screen pb-20 animate-in fade-in duration-300 transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-slate-950'
    }`}>
      
      {/* 1. CATEGORY BANNER (Blueprint Panel 2: CLOTHING / Simple styles. Everyday wear.) */}
      <section className="relative h-64 sm:h-72 overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-white/10">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentCategoryMeta.bgImage})` }}
        />
        {/* Crisp contrast overlay preserving complete background image visibility without white wash */}
        <div className="absolute inset-0 z-0 bg-black/45 backdrop-blur-[1px]" />

        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-2">
          <h1 className="text-3xl sm:text-5xl font-black font-brand tracking-widest uppercase text-white drop-shadow-md">
            {currentCategoryMeta.title}
          </h1>
          <p className="text-sm sm:text-base font-medium text-slate-200 drop-shadow-sm">
            {currentCategoryMeta.subtitle}
          </p>
        </div>
      </section>

      {/* 2. CATEGORY SWITCHER TABS */}
      <div className="sticky top-20 z-30 bg-white/95 dark:bg-black/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 shadow-2xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between overflow-x-auto py-3 gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => onSelectCategory('all')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                All Departments
              </button>
              <button
                onClick={() => onSelectCategory('cloth')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'cloth'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                Clothing
              </button>
              <button
                onClick={() => onSelectCategory('accessories')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'accessories'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                Apple Parts
              </button>
              <button
                onClick={() => onSelectCategory('diffuser')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'diffuser'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                Diffusers
              </button>
              <button
                onClick={() => onSelectCategory('iphones')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'iphones'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                iPhones
              </button>
            </div>

            {/* Mobile Filter Toggle Button (< 1024px) */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl shrink-0 cursor-pointer border border-slate-200 dark:border-slate-800"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters {hasActiveFilters && `(${selectedSizes.length + selectedColors.length + (selectedPriceRange !== 'all' ? 1 : 0)})`}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN LAYOUT: FILTERS (LEFT) & PRODUCTS GRID (RIGHT) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* LEFT COLUMN: FILTERS SIDEBAR (Matching Blueprint Panel 2) */}
          <aside className="hidden lg:block lg:col-span-1 space-y-6 pr-4 border-r border-slate-200/80 dark:border-white/10 transition-colors">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-950 dark:text-white">
                FILTERS
              </h2>
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Size Filter Checkboxes */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Size
              </h3>
              <div className="space-y-2">
                {AVAILABLE_SIZES.map(size => (
                  <label 
                    key={size}
                    className="flex items-center gap-3 text-xs font-medium text-slate-700 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer select-none"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSizes.includes(size)}
                      onChange={() => toggleSize(size)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-slate-950 focus:ring-slate-950 cursor-pointer"
                    />
                    <span>{size}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Colour Swatches (Blueprint Panel 2) */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Colour
              </h3>
              <div className="flex flex-wrap gap-2.5">
                {AVAILABLE_COLORS.map(color => {
                  const isSelected = selectedColors.includes(color.name);
                  return (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`w-6 h-6 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                        isSelected 
                          ? 'ring-2 ring-slate-950 dark:ring-white scale-110 shadow-md border-white' 
                          : 'border-slate-300 dark:border-slate-700 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {isSelected && (
                        <Check className={`w-3 h-3 ${color.name === 'White' || color.name === 'Cream' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Price Dropdown (Blueprint Panel 2) */}
            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-white/10">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Price
              </h3>
              <div className="relative">
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full appearance-none px-3.5 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 focus:outline-none focus:border-slate-950 dark:focus:border-white cursor-pointer pr-9"
                >
                  <option value="all">All Prices</option>
                  <option value="under-200">Under GH₵200</option>
                  <option value="200-500">GH₵200 - GH₵500</option>
                  <option value="500-2000">GH₵500 - GH₵2,000</option>
                  <option value="over-2000">Over GH₵2,000</option>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

          </aside>

          {/* RIGHT COLUMN: CATALOG & PRODUCTS (Blueprint Panel 2: Product Grid) */}
          <main className="lg:col-span-3 space-y-6">
            
            {/* Catalog Top bar with count & Sort */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10 text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'product' : 'products'}
              </span>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-slate-500 dark:text-slate-400 hidden sm:inline">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  <option value="featured">Featured</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="rating">Top Rated</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onQuickView={onSelectProduct}
                  />
                ))}
              </div>
            ) : (
              <div className={`py-20 text-center space-y-4 rounded-3xl border ${
                isDark ? 'bg-slate-900/50 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <CartAnimate size="md" />
                <h3 className={`text-base font-bold font-brand uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
                  This department or category is currently empty
                </h3>
                <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                  No items found in this section right now. Try exploring other departments or clearing active filters.
                </p>
                <button
                  onClick={resetFilters}
                  className={`mt-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                    isDark ? 'bg-white hover:bg-slate-100 text-slate-950' : 'bg-black hover:bg-slate-900 text-white'
                  }`}
                >
                  Clear Filters / View All
                </button>
              </div>
            )}
          </main>

        </div>
      </div>

      {/* MOBILE FILTERS MODAL (< 1024px) */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-xs bg-white h-full ml-auto p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <h3 className="text-sm font-black uppercase text-slate-950">FILTERS</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-black"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase text-slate-700">Size</h4>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                        selectedSizes.includes(size)
                          ? 'bg-slate-950 text-white border-slate-950'
                          : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Colour */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-700">Colour</h4>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_COLORS.map(color => (
                    <button
                      key={color.name}
                      type="button"
                      onClick={() => toggleColor(color.name)}
                      className={`w-7 h-7 rounded-full border transition-all ${
                        selectedColors.includes(color.name)
                          ? 'ring-2 ring-slate-950 scale-110'
                          : 'border-slate-300'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="text-xs font-bold uppercase text-slate-700">Price</h4>
                <select
                  value={selectedPriceRange}
                  onChange={(e) => setSelectedPriceRange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
                >
                  <option value="all">All Prices</option>
                  <option value="under-200">Under GH₵200</option>
                  <option value="200-500">GH₵200 - GH₵500</option>
                  <option value="500-2000">GH₵500 - GH₵2,000</option>
                  <option value="over-2000">Over GH₵2,000</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-3 bg-slate-100 text-slate-700 rounded-xl font-bold text-xs"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-1/2 py-3 bg-slate-950 text-white rounded-xl font-bold text-xs"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
