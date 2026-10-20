export interface Product {
  id: string;
  name: string;
  category: 'cloth' | 'diffuser' | 'accessories' | 'iphones';
  price: number;
  originalPrice?: number;
  description: string;
  image: string;
  images?: string[];
  rating: number;
  reviewsCount?: number;
  inStock: boolean;
  featured?: boolean;
  tag?: string;
  sizes?: string[];
  colors?: string[];
  storage?: string[];
  condition?: ('New' | 'UK Used')[];
  specs?: string[];
}

export const CURRENCY_SYMBOL = 'GH₵';
export const CURRENCY_CODE = 'GHS';

export const formatCurrency = (amount: number): string => {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
};

export const CATEGORIES = [
  {
    id: 'cloth',
    name: 'Clothing',
    subtitle: 'Simple styles. Everyday wear.',
    description: 'Clean minimalist streetwear, essential heavyweight tees, hoodies, and cargo pants tailored for everyday comfort.',
    badge: '1. Clothing'
  },
  {
    id: 'accessories',
    name: 'Apple Parts',
    subtitle: 'GX Grade & OEM replacement screens, batteries & tools.',
    description: 'Certified replacement screens, OEM batteries, camera glass assemblies, and repair tools for Apple devices.',
    badge: '2. Apple Parts'
  },
  {
    id: 'diffuser',
    name: 'Diffusers',
    subtitle: 'Ambient scents & luxury aromatherapy.',
    description: 'Sculptural stone, glass, and ultrasonic diffusers engineered for therapeutic botanical fragrance dispersion.',
    badge: '3. Diffusers'
  },
  {
    id: 'iphones',
    name: 'iPhones',
    subtitle: 'Sealed & UK Used Pro Max & Pro models.',
    description: 'Factory unlocked Apple iPhone smartphones with verified battery health, official warranty, and genuine accessories.',
    badge: '4. iPhones'
  }
] as const;

// 12 Authentic BLUEMA Catalog Products (Instantly available and continuously synced with backend database & Firebase)
export const PRODUCTS: Product[] = [
  // 1. Clothing
  {
    id: '25',
    name: 'BLUEMA Essential Heavyweight Boxy Tee',
    description: 'Clean minimalist heavyweight 280GSM cotton streetwear tee with reinforced ribbed collar and dropped shoulders for everyday luxury wear.',
    price: 380.0,
    originalPrice: 450.0,
    category: 'cloth',
    image: '/src/assets/images/bluema_clothing_cat_1791714217020.jpg',
    images: [
      '/src/assets/images/bluema_clothing_cat_1791714217020.jpg',
      '/src/assets/images/bluema_hero_banner_1791714201504.jpg'
    ],
    rating: 5.0,
    reviewsCount: 48,
    featured: true,
    tag: 'Best Seller',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Onyx Black', 'Bone White', 'Slate Grey']
  },
  {
    id: '26',
    name: 'BLUEMA Minimalist Relaxed Cargo Trousers',
    description: 'Tailored utilitarian cargo trousers cut from durable cotton twill featuring tonal hardware, gusseted utility pockets, and adjustable ankle cinch cords.',
    price: 650.0,
    originalPrice: 750.0,
    category: 'cloth',
    image: '/src/assets/images/bluema_clothing_cat_1791714217020.jpg',
    images: ['/src/assets/images/bluema_clothing_cat_1791714217020.jpg'],
    rating: 4.9,
    reviewsCount: 32,
    featured: true,
    tag: 'Signature',
    inStock: true,
    sizes: ['30', '32', '34', '36'],
    colors: ['Washed Black', 'Olive Drab', 'Khaki']
  },
  {
    id: '27',
    name: 'BLUEMA Luxury French Terry Zip Hoodie',
    description: 'Substantial 460GSM French terry zip-up hoodie featuring double-layer hood, brushed silver two-way zipper, and minimal tonal embroidery.',
    price: 780.0,
    originalPrice: 900.0,
    category: 'cloth',
    image: '/src/assets/images/bluema_clothing_cat_1791714217020.jpg',
    images: ['/src/assets/images/bluema_clothing_cat_1791714217020.jpg'],
    rating: 4.9,
    reviewsCount: 29,
    featured: false,
    tag: 'Premium',
    inStock: true,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Charcoal Heather', 'Midnight Navy']
  },

  // 2. Apple Parts
  {
    id: '28',
    name: 'iPhone 14 Pro Max GX OLED Display Assembly',
    description: 'Certified GX Grade OLED replacement screen with TrueTone programmatic transfer support, vivid color calibration, 120Hz ProMotion smoothness, and oleophobic coating.',
    price: 1850.0,
    originalPrice: 2100.0,
    category: 'accessories',
    image: '/src/assets/images/bluema_apple_parts_1791714238180.jpg',
    images: ['/src/assets/images/bluema_apple_parts_1791714238180.jpg'],
    rating: 5.0,
    reviewsCount: 64,
    featured: true,
    tag: 'GX Certified',
    inStock: true,
    specs: ['GX Hard OLED', 'TrueTone Support', '120Hz ProMotion', 'Zero Dead Pixels']
  },
  {
    id: '29',
    name: 'iPhone 13 / 13 Pro Genuine OEM Battery',
    description: '100% genuine replacement battery cell matching Apple OEM specifications. Zero cycle count with Texas Instruments gas gauge IC for accurate battery health.',
    price: 620.0,
    originalPrice: 720.0,
    category: 'accessories',
    image: '/src/assets/images/bluema_apple_parts_1791714238180.jpg',
    images: ['/src/assets/images/bluema_apple_parts_1791714238180.jpg'],
    rating: 4.9,
    reviewsCount: 41,
    featured: false,
    tag: 'OEM Quality',
    inStock: true,
    specs: ['100% Health Status', 'Zero Cycle Count', 'TI Gas Gauge IC']
  },
  {
    id: '30',
    name: 'Professional Titanium Phone Repair Toolkit',
    description: 'Magnetic precision 24-piece S2 steel screwdriver set specifically engineered for Apple iPhone, iPad, and MacBook repairs.',
    price: 350.0,
    originalPrice: 420.0,
    category: 'accessories',
    image: '/src/assets/images/bluema_apple_parts_1791714238180.jpg',
    images: ['/src/assets/images/bluema_apple_parts_1791714238180.jpg'],
    rating: 4.8,
    reviewsCount: 53,
    featured: false,
    tag: 'Pro Tools',
    inStock: true,
    specs: ['Pentalobe P2/P5', 'Tri-point Y000', 'Magnetic Bit Holder']
  },

  // 3. Diffusers
  {
    id: '31',
    name: 'BLUEMA Sculptural Ceramic Ambient Diffuser',
    description: 'Matte ceramic porcelain ultrasonic diffuser featuring whisper-quiet 2.4MHz mist vibration, ambient warm LED luminescence, and continuous 8-hour runtime.',
    price: 580.0,
    originalPrice: 680.0,
    category: 'diffuser',
    image: '/src/assets/images/bluema_diffuser_cat_1791714255504.jpg',
    images: ['/src/assets/images/bluema_diffuser_cat_1791714255504.jpg'],
    rating: 5.0,
    reviewsCount: 38,
    featured: true,
    tag: 'Aromatherapy',
    inStock: true,
    colors: ['Terracotta', 'Matte Chalk White', 'Basalt Charcoal']
  },
  {
    id: '32',
    name: 'BLUEMA Waterless Fragrance Nebulizer',
    description: 'Advanced cold-air diffusion technology that disperses pure essential oils without water or heat, maintaining the molecular integrity of therapeutic botanicals.',
    price: 890.0,
    originalPrice: 1050.0,
    category: 'diffuser',
    image: '/src/assets/images/bluema_diffuser_cat_1791714255504.jpg',
    images: ['/src/assets/images/bluema_diffuser_cat_1791714255504.jpg'],
    rating: 4.9,
    reviewsCount: 22,
    featured: false,
    tag: 'Luxury',
    inStock: true,
    colors: ['Anodized Space Grey', 'Brushed Champagne']
  },
  {
    id: '33',
    name: 'BLUEMA Botanical Essential Oil Trilogy (30ml)',
    description: 'Curated trio of 100% pure organic essential oils: French Lavender, Atlas Cedarwood, and Calabrian Bergamot packaged in UV-protective amber glass.',
    price: 320.0,
    originalPrice: 390.0,
    category: 'diffuser',
    image: '/src/assets/images/bluema_diffuser_cat_1791714255504.jpg',
    images: ['/src/assets/images/bluema_diffuser_cat_1791714255504.jpg'],
    rating: 4.9,
    reviewsCount: 45,
    featured: false,
    tag: 'Organic',
    inStock: true
  },

  // 4. iPhones
  {
    id: '34',
    name: 'iPhone 15 Pro Max 256GB - Natural Titanium',
    description: 'Factory unlocked UK Used Grade A+ iPhone 15 Pro Max. Tested 100% battery health, flawless titanium chassis, verified TrueDepth Face ID, with 6 months warranty.',
    price: 13800.0,
    originalPrice: 15200.0,
    category: 'iphones',
    image: '/src/assets/images/bluema_iphones_cat_1791714272698.jpg',
    images: [
      '/src/assets/images/bluema_iphones_cat_1791714272698.jpg',
      '/src/assets/images/bluema_hero_banner_1791714201504.jpg'
    ],
    rating: 5.0,
    reviewsCount: 71,
    featured: true,
    tag: 'Verified Stock',
    inStock: true,
    storage: ['256GB', '512GB', '1TB'],
    colors: ['Natural Titanium', 'Black Titanium', 'White Titanium', 'Blue Titanium'],
    condition: ['UK Used']
  },
  {
    id: '35',
    name: 'iPhone 14 Pro 128GB - Deep Purple',
    description: 'Factory unlocked UK Used Grade A+ iPhone 14 Pro with Dynamic Island, 98% battery health, pristine ceramic shield, and verified camera system.',
    price: 9900.0,
    originalPrice: 11000.0,
    category: 'iphones',
    image: '/src/assets/images/bluema_iphones_cat_1791714272698.jpg',
    images: ['/src/assets/images/bluema_iphones_cat_1791714272698.jpg'],
    rating: 4.9,
    reviewsCount: 56,
    featured: false,
    tag: 'Top Tier',
    inStock: true,
    storage: ['128GB', '256GB'],
    colors: ['Deep Purple', 'Space Black', 'Gold'],
    condition: ['UK Used']
  },
  {
    id: '36',
    name: 'iPhone 13 128GB - Midnight Blue (Sealed)',
    description: 'Brand new factory sealed in box iPhone 13 with full 1-year official warranty, A15 Bionic chip, and dual 12MP camera system with cinematic mode.',
    price: 7400.0,
    originalPrice: 8200.0,
    category: 'iphones',
    image: '/src/assets/images/bluema_iphones_cat_1791714272698.jpg',
    images: ['/src/assets/images/bluema_iphones_cat_1791714272698.jpg'],
    rating: 4.8,
    reviewsCount: 63,
    featured: false,
    tag: 'Brand New',
    inStock: true,
    storage: ['128GB', '256GB'],
    colors: ['Midnight Blue', 'Starlight White', 'Pink'],
    condition: ['New']
  }
];
