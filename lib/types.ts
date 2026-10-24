export type Dosha = "Vata" | "Pitta" | "Kapha";

export interface Variant {
  sku: string;
  label: string;
  price: number;
  mrp: number;
  stock: number;
}

export interface Ingredient {
  name: string;
  latin: string;
  amount: string;
  role: string;
}

export interface Product {
  slug: string;
  name: string;
  sanskritName?: string;
  tagline: string;
  brand: string;
  category: string;
  form: string;
  description: string;
  benefits: string[];
  keyIngredients: Ingredient[];
  doshas: Dosha[];
  dosage: string;
  howToUse: string;
  precautions: string[];
  variants: Variant[];
  images: string[];
  rating: number;
  reviewCount: number;
  tags: string[];
  certifications: string[];
  shelfLife: string;
  storage: string;
  manufacturer: string;
  countryOfOrigin: string;
  ayushLicense: string;
  gstRate: number;
  currency: string;
  isFeatured: boolean;
  isBestseller: boolean;
  faq: { q: string; a: string }[];
}

export interface Category {
  slug: string;
  name: string;
  description: string;
  count: number;
}

export interface CartItem {
  slug: string;
  sku: string;
  name: string;
  label: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
}

export interface Quote {
  items: { slug: string; sku: string; name: string; label: string; unitPrice: number; quantity: number; lineTotal: number }[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
}
