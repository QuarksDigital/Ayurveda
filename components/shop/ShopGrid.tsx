"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import ProductCard from "@/components/product/ProductCard";
import type { Category, Product } from "@/lib/types";

const SORTS = [
  { value: "featured", label: "Featured" },
  { value: "popular", label: "Most popular" },
  { value: "rating", label: "Top rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
];

const sorters: Record<string, (a: Product, b: Product) => number> = {
  featured: (a, b) => Number(b.isFeatured) - Number(a.isFeatured) || b.reviewCount - a.reviewCount,
  popular: (a, b) => b.reviewCount - a.reviewCount,
  rating: (a, b) => b.rating - a.rating,
  "price-asc": (a, b) => a.variants[0].price - b.variants[0].price,
  "price-desc": (a, b) => b.variants[0].price - a.variants[0].price,
};

export default function ShopGrid({ products, categories }: { products: Product[]; categories: Category[] }) {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const category = params.get("category") ?? "";
  const [sort, setSort] = useState("featured");
  const [q, setQ] = useState("");

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set("category", slug);
    else next.delete("category");
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, { scroll: false });
  };

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return products
      .filter((p) => !category || p.category === category)
      .filter(
        (p) =>
          !needle ||
          [p.name, p.tagline, p.sanskritName ?? "", ...p.tags, ...p.keyIngredients.map((i) => i.name)].some((s) =>
            s.toLowerCase().includes(needle)
          )
      )
      .sort(sorters[sort]);
  }, [products, category, sort, q]);

  return (
    <div className="container-x pb-32">
      <div className="sticky top-14 z-20 -mx-5 border-b border-line/60 bg-white/85 px-5 py-4 backdrop-blur-xl md:-mx-8 md:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Categories">
            {[{ slug: "", name: "All" }, ...categories].map((c) => (
              <button
                key={c.slug || "all"}
                type="button"
                onClick={() => setCategory(c.slug)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm transition-colors ${
                  category === c.slug ? "bg-ink text-white" : "bg-bone text-ink hover:bg-[#e8e8ed]"
                }`}
              >
                {c.name}
              </button>
            ))}
          </nav>
          <div className="flex gap-3">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              aria-label="Search products"
              className="field !h-10 !rounded-full lg:w-56"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort" className="field !h-10 !w-auto !rounded-full pr-8 text-sm">
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="py-24 text-center text-xl text-muted">No products match your search.</p>
      ) : (
        <div className="grid gap-x-6 gap-y-14 pt-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
