import React, { useState, useMemo, useEffect } from 'react';
import { SlidersHorizontal, X, RotateCcw, Check, Sparkles } from 'lucide-react';
import { Product } from '../data/products';
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
  onOpenAdmin?: () => void;
  isAdmin?: boolean;
  onContactSupport?: () => void;
  initialColorFilter?: string | null;
  onClearInitialColorFilter?: () => void;
}

export const CategoryView: React.FC<CategoryViewProps> = ({
  selectedCategory,
  onSelectCategory,
  products,
  onSelectProduct,
  onAddToCart,
  searchQuery,
  onSearchChange,
  theme = 'light',
  onOpenAdmin,
  isAdmin = false,
  onContactSupport,
  initialColorFilter,
  onClearInitialColorFilter
}) => {
  const isDark = theme === 'dark';
  const isClothing = selectedCategory === 'cloth';

  // Filter states: only applicable when in clothing department
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Available filter options matching user's image attachment precisely
  const AVAILABLE_SIZES = ['S', 'M', 'L', 'XL', 'XXL'];
  const AVAILABLE_COLORS = [
    { name: 'Black', hex: '#111111', aliases: ['black', 'onyx', 'obsidian', 'noir', 'dark'] },
    { name: 'Charcoal', hex: '#455263', aliases: ['charcoal', 'slate', 'grey', 'gray', 'graphite', 'ash'] },
    { name: 'Navy', hex: '#1d283a', aliases: ['navy', 'blue', 'midnight', 'marine', 'indigo'] },
    { name: 'White', hex: '#ffffff', aliases: ['white', 'chalk', 'ivory', 'snow'] },
    { name: 'Cream', hex: '#e4ddcc', aliases: ['cream', 'sand', 'beige', 'starlight', 'tan', 'oatmeal'] },
    { name: 'Olive', hex: '#536830', aliases: ['olive', 'green', 'sage', 'army', 'khaki'] },
  ];

  // Sync external initialColorFilter if provided (e.g. from ProductModal or link)
  useEffect(() => {
    if (initialColorFilter) {
      const matched = AVAILABLE_COLORS.find(c => 
        c.name.toLowerCase() === initialColorFilter.toLowerCase() ||
        c.aliases.some(a => initialColorFilter.toLowerCase().includes(a))
      );
      if (matched) {
        setSelectedColors([matched.name]);
      } else {
        setSelectedColors([initialColorFilter]);
      }
    }
  }, [initialColorFilter]);

  // When switching away from clothing, clear clothing-specific filters
  useEffect(() => {
    if (selectedCategory !== 'cloth') {
      setSelectedSizes([]);
      setSelectedColors([]);
      setMobileFiltersOpen(false);
      if (onClearInitialColorFilter) {
        onClearInitialColorFilter();
      }
    }
  }, [selectedCategory, onClearInitialColorFilter]);

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

  // Toggle color filter (clicking a color swatch filters clothing by that color)
  const toggleColor = (colorName: string) => {
    setSelectedColors(prev => {
      if (prev.includes(colorName)) {
        return prev.filter(c => c !== colorName);
      }
      return [colorName]; // Focus view on all clothing in this color
    });
  };

  // When user selects a cloth color from product card or modal
  const handleSelectClothColor = (colorName: string) => {
    const matched = AVAILABLE_COLORS.find(c => 
      c.name.toLowerCase() === colorName.toLowerCase() ||
      c.aliases.some(a => colorName.toLowerCase().includes(a))
    );
    const target = matched ? matched.name : colorName;
    setSelectedColors(prev => {
      if (prev.includes(target)) {
        return prev.filter(c => c !== target);
      }
      return [target]; // Immediately display all clothing in this color
    });
  };

  // Reset all filters
  const resetFilters = () => {
    setSelectedSizes([]);
    setSelectedColors([]);
    onSearchChange('');
    if (onClearInitialColorFilter) {
      onClearInitialColorFilter();
    }
  };

  const hasActiveFilters = selectedSizes.length > 0 || selectedColors.length > 0 || searchQuery.trim().length > 0;

  // Filter & sort products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // Category filter - flexible matching for admin-added products
      if (selectedCategory !== 'all') {
        const pCat = (p.category || '').toLowerCase().trim();
        const sCat = selectedCategory.toLowerCase().trim();
        const matches = 
          pCat === sCat ||
          (sCat === 'cloth' && (pCat.includes('cloth') || pCat.includes('apparel') || pCat.includes('wear') || pCat.includes('tee') || pCat.includes('hoodie') || pCat === '1')) ||
          (sCat === 'accessories' && (pCat.includes('access') || pCat.includes('part') || pCat.includes('apple') || pCat.includes('tool') || pCat.includes('screen') || pCat.includes('battery') || pCat === '2')) ||
          (sCat === 'diffuser' && (pCat.includes('diffus') || pCat.includes('scent') || pCat.includes('oil') || pCat.includes('aroma') || pCat.includes('fragrance') || pCat === '3')) ||
          (sCat === 'iphones' && (pCat.includes('iphone') || pCat.includes('phone') || pCat.includes('device') || pCat === '4'));
        if (!matches) {
          return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesDesc = p.description.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc) return false;
      }

      // CLOTHING-ONLY FILTERS: Size & Colour
      if (isClothing) {
        // Size filter
        if (selectedSizes.length > 0) {
          if (!p.sizes || !p.sizes.some(s => selectedSizes.map(sz => sz.toUpperCase()).includes(s.toUpperCase()))) {
            return false;
          }
        }

        // Colour filter: when a user selects a cloth color, all clothing in that color will show
        if (selectedColors.length > 0) {
          if (!p.colors || p.colors.length === 0) {
            return false;
          }
          const matchesColor = p.colors.some(prodCol => {
            const pcLower = prodCol.toLowerCase().trim();
            return selectedColors.some(sc => {
              const scLower = sc.toLowerCase().trim();
              if (pcLower === scLower || pcLower.includes(scLower) || scLower.includes(pcLower)) {
                return true;
              }
              const def = AVAILABLE_COLORS.find(d => d.name.toLowerCase() === scLower);
              if (def) {
                return def.aliases.some(alias => pcLower.includes(alias));
              }
              return false;
            });
          });
          if (!matchesColor) {
            return false;
          }
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });
  }, [products, selectedCategory, isClothing, searchQuery, selectedSizes, selectedColors, sortBy]);

  const getCategoryCount = (catId: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones') => {
    if (catId === 'all') return products.length;
    return products.filter(p => {
      const pCat = (p.category || '').toLowerCase().trim();
      if (catId === 'cloth') return pCat === 'cloth' || pCat.includes('cloth') || pCat.includes('apparel') || pCat.includes('wear') || pCat.includes('tee') || pCat.includes('hoodie') || pCat === '1';
      if (catId === 'accessories') return pCat === 'accessories' || pCat.includes('access') || pCat.includes('part') || pCat.includes('apple') || pCat.includes('tool') || pCat.includes('screen') || pCat.includes('battery') || pCat === '2';
      if (catId === 'diffuser') return pCat === 'diffuser' || pCat.includes('diffus') || pCat.includes('scent') || pCat.includes('oil') || pCat.includes('aroma') || pCat.includes('fragrance') || pCat === '3';
      if (catId === 'iphones') return pCat === 'iphones' || pCat.includes('iphone') || pCat.includes('phone') || pCat.includes('device') || pCat === '4';
      return false;
    }).length;
  };

  return (
    <div className={`min-h-screen pb-20 animate-in fade-in duration-300 transition-colors ${
      isDark ? 'bg-black text-white' : 'bg-white text-slate-950'
    }`}>
      
      {/* 1. CATEGORY BANNER */}
      <section className="relative h-64 sm:h-72 overflow-hidden flex items-center justify-center border-b border-slate-200 dark:border-white/10">
        <div 
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${currentCategoryMeta.bgImage})` }}
        />
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
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === 'all'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                <span>All Departments</span>
                {products.length > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategory === 'all'
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {products.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectCategory('cloth')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === 'cloth'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                <span>Clothing</span>
                {getCategoryCount('cloth') > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategory === 'cloth'
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {getCategoryCount('cloth')}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectCategory('accessories')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === 'accessories'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                <span>Apple Parts</span>
                {getCategoryCount('accessories') > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategory === 'accessories'
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {getCategoryCount('accessories')}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectCategory('diffuser')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === 'diffuser'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                <span>Diffusers</span>
                {getCategoryCount('diffuser') > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategory === 'diffuser'
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {getCategoryCount('diffuser')}
                  </span>
                )}
              </button>

              <button
                onClick={() => onSelectCategory('iphones')}
                className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === 'iphones'
                    ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950 shadow-sm'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-900'
                }`}
              >
                <span>iPhones</span>
                {getCategoryCount('iphones') > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    selectedCategory === 'iphones'
                      ? 'bg-white/20 dark:bg-black/20 text-white dark:text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {getCategoryCount('iphones')}
                  </span>
                )}
              </button>
            </div>

            {/* Mobile Filter Toggle Button (ONLY SHOWN FOR CLOTHING DEPARTMENT) */}
            {isClothing && (
              <button
                onClick={() => setMobileFiltersOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-xl shrink-0 cursor-pointer border border-slate-200 dark:border-slate-800"
              >
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Filters {hasActiveFilters && `(${selectedSizes.length + selectedColors.length})`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. MAIN LAYOUT: FILTERS SIDEBAR (ONLY ON CLOTHING) & PRODUCTS GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className={isClothing ? "grid grid-cols-1 lg:grid-cols-4 gap-8" : "w-full space-y-6"}>
          
          {/* LEFT COLUMN: FILTERS SIDEBAR (EXACTLY MATCHING USER'S ATTACHED IMAGE - ONLY SHOWN ON CLOTHING) */}
          {isClothing && (
            <aside className="hidden lg:block lg:col-span-1 space-y-6 pr-6 border-r border-slate-200/80 dark:border-white/10 transition-colors select-none">
              
              {/* FILTERS Title Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <h2 className="text-base font-black uppercase tracking-wider text-slate-950 dark:text-white font-brand">
                  FILTERS
                </h2>
                {hasActiveFilters && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white underline flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* SIZE Section (Checkboxes for S, M, L, XL, XXL matching screenshot) */}
              <div className="space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
                  SIZE
                </h3>
                <div className="space-y-2.5">
                  {AVAILABLE_SIZES.map(size => {
                    const isChecked = selectedSizes.includes(size);
                    return (
                      <label 
                        key={size}
                        className="flex items-center gap-3 text-xs font-semibold text-slate-800 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white cursor-pointer select-none group"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleSize(size)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-slate-950 focus:ring-slate-950 cursor-pointer"
                        />
                        <span className="group-hover:translate-x-0.5 transition-transform">{size}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Thin horizontal line separator */}
              <div className="border-t border-slate-200 dark:border-white/10" />

              {/* COLOUR Section (Swatches matching image attachment) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
                    COLOUR
                  </h3>
                  {selectedColors.length > 0 && (
                    <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                      {selectedColors.join(', ')}
                    </span>
                  )}
                </div>
                
                {/* Horizontal row of circular swatches */}
                <div className="flex items-center gap-2.5 flex-wrap">
                  {AVAILABLE_COLORS.map(color => {
                    const isSelected = selectedColors.includes(color.name);
                    const isLightColor = color.name === 'White' || color.name === 'Cream';
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color.name)}
                        className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center relative active:scale-95 ${
                          isSelected 
                            ? 'ring-2 ring-slate-950 dark:ring-white scale-110 shadow-md border-white' 
                            : 'border-slate-300 dark:border-slate-700 hover:scale-110'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={`Filter all clothing in ${color.name}`}
                        aria-label={`Filter by ${color.name}`}
                      >
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${isLightColor ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug pt-1">
                  Select a colour or click any clothing swatch to view all styles in that shade.
                </p>
              </div>

            </aside>
          )}

          {/* MAIN PRODUCT CATALOG */}
          <main className={isClothing ? "lg:col-span-3 space-y-6" : "w-full space-y-6"}>
            
            {/* Catalog Top bar with count & Sort */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10 text-xs">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-slate-500 dark:text-slate-400">
                  Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
                </span>
                {isClothing && selectedColors.length > 0 && (
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>Showing all {selectedColors.join(', ')} clothing</span>
                    <button 
                      onClick={() => setSelectedColors([])} 
                      className="hover:text-red-500 cursor-pointer ml-1 text-slate-400"
                      title="Clear color filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
                {isClothing && selectedSizes.length > 0 && (
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <span>Size: {selectedSizes.join(', ')}</span>
                    <button 
                      onClick={() => setSelectedSizes([])} 
                      className="hover:text-red-500 cursor-pointer ml-1 text-slate-400"
                      title="Clear size filter"
                    >
                      ✕
                    </button>
                  </span>
                )}
              </div>

              {/* Sort by Dropdown */}
              <div className="flex items-center gap-2 self-end sm:self-auto">
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

            {/* Active Color Highlight Pill Bar (When viewing filtered clothing colors) */}
            {isClothing && selectedColors.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 text-xs">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Filtered by colour:
                  </span>
                  {selectedColors.map(c => {
                    const def = AVAILABLE_COLORS.find(col => col.name === c);
                    return (
                      <span key={c} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white shadow-2xs">
                        {def && (
                          <span className="w-2.5 h-2.5 rounded-full border border-black/20" style={{ backgroundColor: def.hex }} />
                        )}
                        <span>{c}</span>
                        <button 
                          onClick={() => toggleColor(c)} 
                          className="hover:text-red-500 cursor-pointer text-slate-400 font-bold ml-1"
                          title="Remove color filter"
                        >
                          ✕
                        </button>
                      </span>
                    );
                  })}
                </div>
                <button
                  onClick={() => setSelectedColors([])}
                  className="text-xs font-bold text-slate-500 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white underline cursor-pointer shrink-0"
                >
                  Show All Colours
                </button>
              </div>
            )}

            {/* Product Grid: 3-column when sidebar present in clothing, 4-column in other departments */}
            {filteredProducts.length > 0 ? (
              <div className={
                isClothing 
                  ? "grid grid-cols-2 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6" 
                  : "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-4 sm:gap-6"
              }>
                {filteredProducts.map(product => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={onAddToCart}
                    onQuickView={onSelectProduct}
                    onSelectColorFilter={isClothing ? handleSelectClothColor : undefined}
                    activeColorFilter={selectedColors}
                    isClothingDepartment={isClothing}
                  />
                ))}
              </div>
            ) : (
              <div className={`py-20 text-center space-y-4 rounded-3xl border ${
                isDark ? 'bg-slate-900/50 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
              }`}>
                <CartAnimate size="md" />

                {products.length === 0 ? (
                  isAdmin ? (
                    // Admin View: Information about adding products
                    <div className="space-y-3">
                      <h3 className={`text-base font-bold font-brand uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        Catalog Ready For Admin Items
                      </h3>
                      <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        All mock items have been removed. Products will appear here immediately as you publish them from the Admin Console.
                      </p>
                      {onOpenAdmin && (
                        <button
                          onClick={onOpenAdmin}
                          className={`mt-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                            isDark ? 'bg-white hover:bg-slate-100 text-slate-950' : 'bg-black hover:bg-slate-900 text-white'
                          }`}
                        >
                          Open Admin Console
                        </button>
                      )}
                    </div>
                  ) : (
                    // Customer Empty State: Clean & Warm
                    <div className="space-y-3">
                      <h3 className={`text-lg font-black font-brand uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
                        No Item Available. Come Again Later.
                      </h3>
                      <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                        We are currently preparing and curating our newest collection for you. Check back shortly or reach out to our concierge hotline for immediate requests.
                      </p>
                      {onContactSupport && (
                        <div className="pt-2">
                          <button
                            onClick={onContactSupport}
                            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                              isDark ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' : 'bg-slate-200 hover:bg-slate-300 text-slate-900 border border-slate-300'
                            }`}
                          >
                            Contact Concierge & Support (059 883 0932)
                          </button>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  // Filter Empty View: When products exist in store but filter returned 0
                  <div className="space-y-3">
                    <h3 className={`text-base font-bold font-brand uppercase tracking-wider ${isDark ? 'text-white' : 'text-slate-950'}`}>
                      {isClothing && selectedColors.length > 0 
                        ? `No clothing found in ${selectedColors.join(', ')}` 
                        : "No items match your filter"}
                    </h3>
                    <p className={`text-xs max-w-sm mx-auto leading-relaxed ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
                      {isClothing && selectedColors.length > 0
                        ? "Try selecting another color or reset to view all available clothing."
                        : "Try selecting a different category or clearing active filters."}
                    </p>
                    <button
                      onClick={resetFilters}
                      className={`mt-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md cursor-pointer ${
                        isDark ? 'bg-white hover:bg-slate-100 text-slate-950' : 'bg-black hover:bg-slate-900 text-white'
                      }`}
                    >
                      {isClothing ? "View All Clothing" : "Clear Filters / View All"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </main>

        </div>
      </div>

      {/* MOBILE FILTERS MODAL (ONLY FOR CLOTHING DEPARTMENT) */}
      {isClothing && mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className={`w-full max-w-xs h-full ml-auto p-6 flex flex-col justify-between overflow-y-auto ${
            isDark ? 'bg-slate-950 text-white' : 'bg-white text-slate-950'
          }`}>
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-white/10">
                <h3 className="text-sm font-black uppercase text-slate-950 dark:text-white font-brand">FILTERS</h3>
                <button 
                  onClick={() => setMobileFiltersOpen(false)}
                  className="p-1 rounded-lg text-slate-500 hover:text-black dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">SIZE</h4>
                <div className="grid grid-cols-3 gap-2">
                  {AVAILABLE_SIZES.map(size => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        selectedSizes.includes(size)
                          ? (isDark ? 'bg-white text-slate-950 border-white' : 'bg-slate-950 text-white border-slate-950')
                          : (isDark ? 'bg-slate-900 text-slate-300 border-slate-800' : 'bg-slate-50 text-slate-700 border-slate-200')
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Thin separator */}
              <div className="border-t border-slate-200 dark:border-white/10" />

              {/* Colour */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">COLOUR</h4>
                <div className="flex flex-wrap gap-2.5">
                  {AVAILABLE_COLORS.map(color => {
                    const isSelected = selectedColors.includes(color.name);
                    const isLight = color.name === 'White' || color.name === 'Cream';
                    return (
                      <button
                        key={color.name}
                        type="button"
                        onClick={() => toggleColor(color.name)}
                        className={`w-8 h-8 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                          isSelected
                            ? 'ring-2 ring-slate-950 dark:ring-white scale-110 border-white'
                            : 'border-slate-300 dark:border-slate-700'
                        }`}
                        style={{ backgroundColor: color.hex }}
                        title={color.name}
                      >
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${isLight ? 'text-black' : 'text-white'}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-200 dark:border-white/10 flex gap-2">
              <button
                onClick={resetFilters}
                className="w-1/2 py-3 bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-xs cursor-pointer"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-1/2 py-3 bg-slate-950 dark:bg-white text-white dark:text-slate-950 rounded-xl font-bold text-xs cursor-pointer"
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
