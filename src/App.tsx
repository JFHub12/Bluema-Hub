import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { WelcomePage } from './components/WelcomePage';
import { AboutPage } from './components/AboutPage';
import { ProductCard } from './components/ProductCard';
import { CategoryView } from './components/CategoryView';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { CartPage } from './components/CartPage';
import { CheckoutModal } from './components/CheckoutModal';
import { AuthModal } from './components/AuthModal';
import { SupportModal } from './components/SupportModal';
import { ShareDeviceModal } from './components/ShareDeviceModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminPasswordModal } from './components/AdminPasswordModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { PrivacyBanner } from './components/PrivacyBanner';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { CATEGORIES, Product } from './data/products';
import { CartAnimate } from './components/CartAnimate';
import { 
  ApiService, 
  User, 
  OrderItem, 
  SUPPORT_PHONE, 
  SUPPORT_PHONE_CALL, 
  SUPPORT_WHATSAPP 
} from './services/api';
import { 
  Phone, 
  MessageSquare, 
  HelpCircle, 
  SlidersHorizontal, 
  Sparkles, 
  ArrowUpRight,
  Lock,
  UserPlus,
  ShoppingBag,
  Smartphone,
  QrCode
} from 'lucide-react';

export default function App() {
  // Page routing: 'welcome' (Page 1) | 'about' (Page 2) | 'shop' (Page 3 / Catalog) | 'cart' (Cart Page)
  const [activePage, setActivePage] = useState<'welcome' | 'about' | 'shop' | 'cart'>('welcome');
  
  // Category & filtering state
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');

  // Modals & Drawers state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'profile'>('register');
  const [authRequiredReason, setAuthRequiredReason] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAdminPasswordModalOpen, setIsAdminPasswordModalOpen] = useState(false);
  const [isAdminEnabled, setIsAdminEnabled] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ show: boolean; success: boolean; message: string } | null>(null);

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('verified_theme');
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
      return 'light'; // Clean, bright white baseline appearance
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    try {
      localStorage.setItem('verified_theme', theme);
      const isDark = theme === 'dark';

      // Ensure html, body, and data attributes match the active mode
      if (isDark) {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
        document.body.classList.add('dark');
        document.body.classList.remove('light');
        document.documentElement.setAttribute('data-theme', 'dark');
        document.body.setAttribute('data-theme', 'dark');
        document.documentElement.style.colorScheme = 'dark';
        document.documentElement.style.backgroundColor = '#000000';
        document.documentElement.style.color = '#ffffff';
        document.body.style.backgroundColor = '#000000';
        document.body.style.color = '#ffffff';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.remove('dark');
        document.body.classList.add('light');
        document.documentElement.setAttribute('data-theme', 'light');
        document.body.setAttribute('data-theme', 'light');
        document.documentElement.style.colorScheme = 'light';
        document.documentElement.style.backgroundColor = '#ffffff';
        document.documentElement.style.color = '#020617';
        document.body.style.backgroundColor = '#ffffff';
        document.body.style.color = '#020617';
      }

      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) {
        metaTheme.setAttribute('content', isDark ? '#000000' : '#ffffff');
      }
    } catch (e) {
      console.error(e);
    }
  }, [theme]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminEnabled(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle SEO Sitelinks, search query, category filters, and product deep links
  useEffect(() => {
    try {
      const pathname = window.location.pathname;
      if (pathname === '/terms' || pathname === '/terms.html') {
        window.location.replace('/terms');
        return;
      }
      if (pathname === '/privacy' || pathname === '/privacy.html') {
        window.location.replace('/privacy');
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const cat = params.get('category');
      const q = params.get('q');
      const prodId = params.get('product');
      const action = params.get('action');

      if (action === 'terms') {
        window.location.href = '/terms';
        return;
      }
      if (action === 'privacy') {
        window.location.href = '/privacy';
        return;
      }

      if (cat && ['cloth', 'diffuser', 'accessories', 'iphones'].includes(cat)) {
        setActivePage('shop');
        setSelectedCategory(cat as any);
      }

      if (q) {
        setActivePage('shop');
        setSearchQuery(q);
      }

      // Deep link to product will be checked when products load

      if (action === 'concierge' || action === 'support') {
        setIsSupportOpen(true);
      } else if (action === 'auth') {
        setIsAuthOpen(true);
        setAuthInitialTab('login');
      } else if (action === 'orders') {
        setIsAuthOpen(true);
        setAuthInitialTab('profile');
      }
    } catch (e) {
      console.warn('[SEO] Deep link routing note:', e);
    }
  }, []);

  // Cart & User state - Starts clean with real user selections
  const [cartItems, setCartItems] = useState<OrderItem[]>(() => {
    try {
      const saved = localStorage.getItem('verified_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return ApiService.getCurrentUser();
  });

  // Subscribe to real-time Firebase Auth state
  useEffect(() => {
    const unsubscribe = ApiService.subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Save cart to local storage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('verified_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error('Failed to save cart:', e);
    }
  }, [cartItems]);

  // Page navigation helper
  const handleNavigate = (
    page: 'welcome' | 'about' | 'shop' | 'cart',
    category?: 'all' | 'cloth' | 'diffuser' | 'accessories' | 'iphones'
  ) => {
    setActivePage(page);
    if (category) {
      setSelectedCategory(category);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cart operations
  const handleAddToCartInternal = (product: Product, options?: { size?: string; color?: string; storage?: string }) => {
    setCartItems(prev => {
      const itemKey = `${product.id}-${options?.size || ''}-${options?.color || ''}-${options?.storage || ''}`;
      const existing = prev.find(item => item.id === itemKey);

      if (existing) {
        return prev.map(item => 
          item.id === itemKey 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        const newItem: OrderItem = {
          id: itemKey,
          name: product.name,
          price: product.price,
          quantity: 1,
          category: product.category,
          image: product.image,
          selectedSize: options?.size,
          selectedColor: options?.color,
          selectedStorage: options?.storage
        };
        return [...prev, newItem];
      }
    });
  };

  // Gated purchasing: A user MUST register and sign in before buying any item!
  const handleAttemptAddToCart = (
    product: Product,
    options?: { size?: string; color?: string; storage?: string },
    isBuyNow: boolean = false
  ) => {
    if (!currentUser) {
      // Gatekeeper triggered: Must register / sign in first!
      setAuthInitialTab('register');
      setAuthRequiredReason(
        `Before you can buy "${product.name}", you must register and sign in first as a verified member.`
      );
      setPendingAction(() => () => {
        handleAddToCartInternal(product, options);
        if (isBuyNow) {
          setIsCheckoutOpen(true);
        } else {
          setIsCartOpen(true);
        }
      });
      setIsAuthOpen(true);
      return;
    }

    // User is logged in, add item to cart
    handleAddToCartInternal(product, options);
    if (isBuyNow) {
      setIsCheckoutOpen(true);
    }
  };

  const handleUpdateQuantity = (id: string, delta: number) => {
    setCartItems(prev => 
      prev
        .map(item => item.id === id ? { ...item, quantity: item.quantity + delta } : item)
        .filter(item => item.quantity > 0)
    );
  };

  const handleRemoveItem = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const openAuthWithTab = (tab: 'login' | 'register' | 'profile' = 'register', reason: string | null = null) => {
    setAuthInitialTab(tab);
    setAuthRequiredReason(reason);
    setIsAuthOpen(true);
  };


  const showBannerNotification = (success: boolean, message: string) => {
    setNotification({ show: true, success, message });
    setTimeout(() => {
      setNotification(prev => prev ? { ...prev, show: false } : null);
    }, 4000);
  };

  const [fetchError, setFetchError] = useState<string | null>(null);

  const fetchProducts = () => {
    setIsLoading(true);
    setFetchError(null);
    fetch('/api/products')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          setProducts([]);
        }
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('[Products] Database fetch note:', err);
        // STRICT DIRECTIVE: Never issue any fallback to mockness again!
        setProducts([]);
        setFetchError('Unable to connect to product database. Retrying...');
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Deep-link product resolution once products are loaded from database
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const prodId = params.get('product');
      if (prodId && products.length > 0) {
        const found = products.find(p => String(p.id) === String(prodId));
        if (found) {
          setActivePage('shop');
          setSelectedCategory(found.category);
          setSelectedProduct(found);
        }
      }
    } catch (e) {
      console.warn('[Products] Deep link lookup note:', e);
    }
  }, [products]);

  // Filter & sort products for shop page
  const filteredProducts = useMemo(() => {
    let list = products;

    if (selectedCategory !== 'all') {
      list = list.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        (p.specs && p.specs.some(s => s.toLowerCase().includes(q)))
      );
    }

    switch (sortBy) {
      case 'price-asc':
        return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc':
        return [...list].sort((a, b) => b.price - a.price);
      case 'rating':
        return [...list].sort((a, b) => b.rating - a.rating);
      case 'featured':
      default:
        return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [selectedCategory, searchQuery, sortBy]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-black text-white' : 'bg-white text-slate-950'} selection:bg-amber-300 selection:text-slate-950 font-sans`}>
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onOpenAuth={(tab) => openAuthWithTab(tab)}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenCart={() => handleNavigate('cart')}
        onOpenSettings={() => setIsSettingsOpen(true)}
        cartCount={totalCartCount}
        activePage={activePage}
        onNavigate={handleNavigate}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* PAGE 1: Welcoming Message Page */}
      {activePage === 'welcome' && (
        <WelcomePage
          onNavigateToAbout={() => handleNavigate('about')}
          onNavigateToShop={(cat) => handleNavigate('shop', cat)}
          onOpenAuth={(tab) => openAuthWithTab(tab)}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenShare={() => setIsShareOpen(true)}
          currentUser={currentUser}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          theme={theme}
        />
      )}

      {/* PAGE 2: What the Website is About */}
      {activePage === 'about' && (
        <AboutPage
          onNavigateToShop={(cat) => handleNavigate('shop', cat)}
          onNavigateToWelcome={() => handleNavigate('welcome')}
          onOpenAuth={(tab) => openAuthWithTab(tab)}
          onOpenSupport={() => setIsSupportOpen(true)}
          currentUser={currentUser}
          theme={theme}
        />
      )}

      {/* PAGE 3: Category Page with Faceted Filters (Blueprint Panel 2) */}
      {activePage === 'shop' && (
        isLoading ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
            <CartAnimate size="lg" />
            <div className="space-y-1">
              <h3 className="text-base font-bold font-brand uppercase tracking-wider">
                Connecting To Store Database...
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Loading live catalog directly from backend database.
              </p>
            </div>
          </div>
        ) : fetchError ? (
          <div className="min-h-[60vh] flex flex-col items-center justify-center py-20 px-4 text-center space-y-4">
            <CartAnimate size="md" />
            <div className="space-y-1">
              <h3 className="text-base font-bold font-brand uppercase tracking-wider text-rose-500">
                Database State Synchronized
              </h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {fetchError} The catalog prioritizes backend storage over mock datasets.
              </p>
              <button
                onClick={fetchProducts}
                className="mt-3 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-950 text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer"
              >
                Retry Database Connection
              </button>
            </div>
          </div>
        ) : (
          <CategoryView
            selectedCategory={selectedCategory}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
            products={products}
            onSelectProduct={(product) => setSelectedProduct(product)}
            onAddToCart={(product, opts) => handleAttemptAddToCart(product, opts)}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            theme={theme}
          />
        )
      )}

      {/* PAGE 4: Dedicated Cart Page (Matching the reference screenshot in a premium way) */}
      {activePage === 'cart' && (
        <CartPage
          items={cartItems}
          currentUser={currentUser}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onClearCart={handleClearCart}
          onContinueShopping={() => handleNavigate('shop')}
          onProceedToCheckout={() => setIsCheckoutOpen(true)}
          onRequireAuth={() => openAuthWithTab('register', 'Registration is required to complete your order and warranty delivery.')}
          onOpenSupport={() => setIsSupportOpen(true)}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          theme={theme}
        />
      )}

      {/* Product Quick View & Detail Modal (Phase 4 Showcase) */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(prod, opts) => handleAttemptAddToCart(prod, opts, false)}
          onBuyNow={(prod, opts) => handleAttemptAddToCart(prod, opts, true)}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          theme={theme}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onRequireAuth={() => openAuthWithTab('register', 'Registration is required before checking out.')}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenCartPage={() => {
          setIsCartOpen(false);
          handleNavigate('cart');
        }}
        theme={theme}
      />

      {/* Checkout & Payment Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        currentUser={currentUser}
        onClearCart={handleClearCart}
        onOpenAuth={() => openAuthWithTab('register', 'Registration is required to complete your order.')}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        theme={theme}
      />

      {/* Authentication & Profile Modal with Purchase Gating */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => {
          setIsAuthOpen(false);
          setAuthRequiredReason(null);
          setPendingAction(null);
        }}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
        initialTab={authInitialTab}
        requiredReason={authRequiredReason}
        onSuccessAction={() => {
          if (pendingAction) {
            pendingAction();
            setPendingAction(null);
          }
          setAuthRequiredReason(null);
        }}
      />

      {/* Customer Support Modal */}
      <SupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
      />

      {/* Multi-Device Run & QR Modal */}
      <ShareDeviceModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
      />
      
      {/* Sleek Success / Fail Banner Notification from Above */}
      {notification?.show && (
        <div className="fixed top-0 left-0 right-0 z-50 flex justify-center p-4 pointer-events-none transition-all duration-300 transform translate-y-0">
          <div className={`pointer-events-auto max-w-md w-full px-5 py-3.5 rounded-2xl shadow-2xl flex items-center justify-between text-xs font-semibold backdrop-blur-md border ${
            notification.success 
              ? 'bg-emerald-950/95 text-emerald-200 border-emerald-500/50 shadow-emerald-900/30' 
              : 'bg-rose-950/95 text-rose-200 border-rose-500/50 shadow-rose-900/30'
          }`}>
            <div className="flex items-center gap-3">
              <span className={`w-2.5 h-2.5 rounded-full ${notification.success ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`} />
              <span>{notification.message}</span>
            </div>
            <button 
              onClick={() => setNotification(prev => prev ? { ...prev, show: false } : null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}
      
      {/* Admin Passkey Protection Gate */}
      <AdminPasswordModal
        isOpen={isAdminPasswordModalOpen}
        onClose={() => setIsAdminPasswordModalOpen(false)}
        onSuccess={() => {
          setIsAdminPasswordModalOpen(false);
          setIsAdminOpen(true);
        }}
      />

      {/* Admin Dashboard */}
      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        onProductUpdated={(result) => {
          fetchProducts();
          if (result) {
            showBannerNotification(result.success, result.message);
          } else {
            showBannerNotification(true, 'Product successfully published and live on public catalog!');
          }
        }}
      />

      {/* Privacy Policy Charter & Consent Gate */}
      <PrivacyPolicyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        onAccept={() => {
          showBannerNotification(true, 'Privacy Policy & Customer Purchasing Terms accepted.');
        }}
      />

      {/* First-visit Unobtrusive Privacy Notification Banner */}
      <PrivacyBanner
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenSupport={() => setIsSupportOpen(true)}
        onOpenAuth={() => openAuthWithTab(currentUser ? 'profile' : 'register')}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        theme={theme}
      />

      {/* Website Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onOpenAdmin={() => setIsAdminPasswordModalOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      {/* Offline Connectivity Status Toast */}
      <OfflineIndicator />

      {/* Progressive Web App Install Banner (Automatic & Non-Intrusive) */}
      <PWAInstallBanner />

      {/* Admin Button trigger */}
      {isAdminEnabled && (
        <button 
          onClick={() => setIsAdminPasswordModalOpen(true)}
          className="fixed bottom-20 left-6 z-50 bg-gradient-to-b from-white via-slate-100 to-slate-300 hover:from-white hover:via-slate-50 hover:to-slate-200 text-slate-950 font-extrabold text-xs px-4 py-3 rounded-2xl shadow-[0_8px_25px_rgba(0,0,0,0.25),0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_2px_rgba(255,255,255,0.9),inset_0_-1px_1px_rgba(0,0,0,0.2)] border border-white/80 transition-all cursor-pointer active:scale-95 flex items-center gap-2"
          title="Merchant Admin Access (Protected by Administrator Passkey)"
        >
          <Lock className="w-3.5 h-3.5 text-slate-900" />
          <span>Admin Console</span>
        </button>
      )}
    </div>
  );
}
