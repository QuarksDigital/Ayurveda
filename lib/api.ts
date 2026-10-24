import { cacheLife } from "next/cache";
import type { Category, Product } from "./types";
import { API_URL } from "./config";
import catalogue from "./catalogue.json";

type Result<T> = { ok: true; data: T } | { ok: false };

async function get<T>(path: string): Promise<Result<T>> {
  try {
    const res = await fetch(`${API_URL}/api${path}`);
    if (!res.ok) return { ok: false };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    console.warn(`[api] ${path} unreachable - using the bundled catalogue (is the backend running on ${API_URL}?)`);
    return { ok: false };
  }
}

// When the API can't be reached (no backend deployed yet, or it's down) pages fall back to
// the bundled catalogue, a copy of backend/src/data/products.js kept in sync with
// `npm run sync:catalogue`. Fallback results stay cacheable so pages still prerender.
const fallback = catalogue as unknown as { products: Product[]; categories: Omit<Category, "count">[] };

function fallbackProducts({ category, bestseller, featured, limit }: Record<string, string>) {
  let items = fallback.products.filter(
    (p) => (!category || p.category === category) && (!bestseller || p.isBestseller) && (!featured || p.isFeatured)
  );
  items = [...items].sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.reviewCount - a.reviewCount);
  return limit ? items.slice(0, Number(limit)) : items;
}

export async function getProducts(params: Record<string, string> = {}): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");
  const qs = new URLSearchParams(params).toString();
  const res = await get<{ products: Product[] }>(`/products${qs ? `?${qs}` : ""}`);
  return res.ok ? res.data.products : fallbackProducts(params);
}

export async function getProduct(slug: string): Promise<{ product: Product; related: Product[] } | null> {
  "use cache";
  cacheLife("minutes");
  const res = await get<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`);
  if (res.ok) return res.data;
  const product = fallback.products.find((p) => p.slug === slug);
  if (!product) return null;
  const related = fallbackProducts({ category: product.category }).filter((p) => p.slug !== slug).slice(0, 4);
  return { product, related };
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheLife("hours");
  const res = await get<{ categories: Category[] }>("/categories");
  if (res.ok) return res.data.categories;
  return fallback.categories.map((c) => ({ ...c, count: fallback.products.filter((p) => p.category === c.slug).length }));
}
