import { cacheLife } from "next/cache";
import type { Category, Product } from "./types";
import { API_URL } from "./config";

type Result<T> = { ok: true; data: T } | { ok: false };

async function get<T>(path: string): Promise<Result<T>> {
  try {
    const res = await fetch(`${API_URL}/api${path}`);
    if (!res.ok) return { ok: false };
    return { ok: true, data: (await res.json()) as T };
  } catch {
    console.warn(`[api] ${path} unreachable - is the backend running on ${API_URL}?`);
    return { ok: false };
  }
}

// Failed requests are cached for seconds only, so the site recovers as soon as the API is back.

export async function getProducts(params: Record<string, string> = {}): Promise<Product[]> {
  "use cache";
  const qs = new URLSearchParams(params).toString();
  const res = await get<{ products: Product[] }>(`/products${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    cacheLife("seconds");
    return [];
  }
  cacheLife("minutes");
  return res.data.products;
}

export async function getProduct(slug: string): Promise<{ product: Product; related: Product[] } | null> {
  "use cache";
  const res = await get<{ product: Product; related: Product[] }>(`/products/${encodeURIComponent(slug)}`);
  if (!res.ok) {
    cacheLife("seconds");
    return null;
  }
  cacheLife("minutes");
  return res.data;
}

export async function getCategories(): Promise<Category[]> {
  "use cache";
  const res = await get<{ categories: Category[] }>("/categories");
  if (!res.ok) {
    cacheLife("seconds");
    return [];
  }
  cacheLife("hours");
  return res.data.categories;
}
