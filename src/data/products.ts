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

// All mock items removed: Store catalog exclusively displays live items added by the administrator to the database
export const PRODUCTS: Product[] = [];
